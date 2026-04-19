import { useState, useRef } from 'react';
import axios from 'axios';

// カテゴリのカラーマップ（Charts.jsxと共通）
export const CATEGORY_COLORS = {
  食費: '#FF6384',
  外食: '#FF9F40',
  日用品: '#FFCD56',
  衣類: '#4BC0C0',
  交通費: '#36A2EB',
  医療費: '#9966FF',
  娯楽: '#FF6384',
  その他: '#C9CBCF',
};

export default function ReceiptUploader({ onAnalyzed, isLoading, setIsLoading, setError }) {
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ファイル選択時のプレビュー表示
  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください（JPG・PNG・GIF）');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview({ file, url });
    setError('');
  };

  // ドラッグ&ドロップ処理
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  // レシートをバックエンドに送信して解析
  const handleSubmit = async () => {
    if (!preview) return;
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('receipt', preview.file);

      const response = await axios.post('/api/analyze-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30秒タイムアウト
      });

      onAnalyzed(response.data);
      setPreview(null);
    } catch (err) {
      const message =
        err.response?.data?.error || 'レシートの読み取りに失敗しました。再度お試しください。';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="uploader">
      <h2>レシートをアップロード</h2>
      <p className="description">
        レシートの写真をアップロードすると、Claude AIが自動で内容を読み取り、
        カテゴリ分類して家計簿に登録します。
      </p>

      {/* ドロップゾーン */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="preview">
            <img src={preview.url} alt="レシートプレビュー" />
            <button
              className="remove-btn"
              onClick={(e) => { e.stopPropagation(); setPreview(null); }}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="drop-hint">
            <span className="drop-icon">📷</span>
            <p>クリックまたはドラッグ&ドロップで<br />レシート画像をアップロード</p>
            <small>JPG・PNG・GIF（最大10MB）</small>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e.target.files[0])}
      />

      <div className="actions">
        {!preview && (
          <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
            ファイルを選択
          </button>
        )}
        {preview && (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '🔄 解析中...' : '✨ レシートを読み取る'}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="loading">
          <div className="spinner" />
          <p>Claude AIがレシートを解析しています...</p>
        </div>
      )}
    </div>
  );
}
