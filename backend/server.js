// 家計簿アプリ バックエンドサーバー
// レシート画像をClaude APIで解析してJSON形式で返す

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const sharp = require('sharp');
require('dotenv').config();

const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024; // Claude APIの5MB制限に余裕を持たせた上限

const app = express();
const PORT = process.env.PORT || 3001;

// メモリ上でファイルを保持（ディスクに保存しない）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 最大10MB
  fileFilter: (req, file, cb) => {
    // 画像ファイルのみ許可
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'), false);
    }
  },
});

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// レシート解析エンドポイント
app.post('/api/analyze-receipt', upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '画像ファイルが見つかりません' });
  }

  try {
    // 5MB超の画像はリサイズ・圧縮してからAPIへ送信
    let imageBuffer = req.file.buffer;
    if (imageBuffer.length > MAX_IMAGE_BYTES) {
      imageBuffer = await sharp(imageBuffer)
        .resize({ width: 1600, withoutEnlargement: true }) // 長辺1600pxに縮小
        .jpeg({ quality: 85 })
        .toBuffer();
      console.log(`画像を圧縮: ${req.file.buffer.length} → ${imageBuffer.length} bytes`);
    }

    // 画像をBase64エンコード
    const base64Image = imageBuffer.toString('base64');
    // sharpでJPEG変換した場合はmimeTypeを上書き
    const mediaType = imageBuffer === req.file.buffer ? req.file.mimetype : 'image/jpeg';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `このレシート画像を解析して、以下のJSON形式で返してください。
必ずJSONのみを返し、説明文は不要です。

{
  "store": "店舗名（不明な場合は空文字）",
  "date": "YYYY-MM-DD形式（不明な場合は今日の日付）",
  "items": [
    {
      "name": "商品名",
      "price": 金額（数値、税込）,
      "category": "カテゴリ（食費・外食・日用品・衣類・交通費・医療費・娯楽・その他のいずれか）"
    }
  ],
  "total": 合計金額（数値）
}

カテゴリの判断基準：
- 食費: スーパー・コンビニでの食品・飲料
- 外食: レストラン・カフェ・ファストフード
- 日用品: 洗剤・シャンプー・消耗品など
- 衣類: 服・靴・アクセサリー
- 交通費: 電車・バス・タクシー・ガソリン
- 医療費: 薬・病院・クリニック
- 娯楽: 映画・ゲーム・書籍・趣味
- その他: 上記に該当しないもの`,
            },
          ],
        },
      ],
    });

    // JSONを抽出してパース
    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSONの抽出に失敗しました');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (error) {
    console.error('レシート解析エラー:', error.message);
    res.status(500).json({ error: `解析に失敗しました: ${error.message}` });
  }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
