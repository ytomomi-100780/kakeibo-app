import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Chart.jsに必要なコンポーネントを登録
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// カテゴリ別カラーパレット
const CATEGORY_COLORS = {
  食費:   '#FF6384',
  外食:   '#FF9F40',
  日用品: '#FFCD56',
  衣類:   '#4BC0C0',
  交通費: '#36A2EB',
  医療費: '#9966FF',
  娯楽:   '#FF6384',
  その他: '#C9CBCF',
};

export default function Charts({ expenses }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>📈 グラフを表示するにはデータが必要です</p>
        <p>レシートをアップロードして登録してください</p>
      </div>
    );
  }

  // カテゴリ別集計
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.price;
    return acc;
  }, {});

  // 月別集計
  const monthlyTotals = expenses.reduce((acc, e) => {
    const month = e.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + e.price;
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyTotals).sort();

  // 円グラフ用データ
  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          (cat) => CATEGORY_COLORS[cat] || '#C9CBCF'
        ),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // 棒グラフ用データ
  const barData = {
    labels: sortedMonths,
    datasets: [
      {
        label: '月別支出（円）',
        data: sortedMonths.map((m) => monthlyTotals[m]),
        backgroundColor: '#36A2EB99',
        borderColor: '#36A2EB',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `¥${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `¥${v.toLocaleString()}`,
        },
      },
    },
  };

  // 合計金額
  const grandTotal = expenses.reduce((sum, e) => sum + e.price, 0);

  return (
    <div className="charts">
      <h2>支出グラフ</h2>

      {/* サマリーカード */}
      <div className="summary-cards">
        <div className="card">
          <span className="card-label">総支出</span>
          <span className="card-value">¥{grandTotal.toLocaleString()}</span>
        </div>
        <div className="card">
          <span className="card-label">登録件数</span>
          <span className="card-value">{expenses.length}件</span>
        </div>
        <div className="card">
          <span className="card-label">カテゴリ数</span>
          <span className="card-value">{Object.keys(categoryTotals).length}種</span>
        </div>
      </div>

      <div className="charts-grid">
        {/* カテゴリ別円グラフ */}
        <div className="chart-box">
          <h3>カテゴリ別支出</h3>
          <div className="chart-container pie">
            <Pie
              data={pieData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.label}: ¥${ctx.raw.toLocaleString()} (${Math.round((ctx.raw / grandTotal) * 100)}%)`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* 月別棒グラフ */}
        <div className="chart-box">
          <h3>月別支出推移</h3>
          <div className="chart-container bar">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* カテゴリ別内訳テーブル */}
      <div className="breakdown">
        <h3>カテゴリ別内訳</h3>
        <table>
          <thead>
            <tr>
              <th>カテゴリ</th>
              <th>合計金額</th>
              <th>割合</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => (
                <tr key={cat}>
                  <td>
                    <span
                      className="color-dot"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] || '#C9CBCF' }}
                    />
                    {cat}
                  </td>
                  <td>¥{amount.toLocaleString()}</td>
                  <td>{Math.round((amount / grandTotal) * 100)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
