import { useState } from 'react';

// カテゴリ別の色とアイコン
const CATEGORY_STYLE = {
  食費:   { color: '#FF6384', icon: '🛒' },
  外食:   { color: '#FF9F40', icon: '🍽️' },
  日用品: { color: '#FFCD56', icon: '🧴' },
  衣類:   { color: '#4BC0C0', icon: '👕' },
  交通費: { color: '#36A2EB', icon: '🚃' },
  医療費: { color: '#9966FF', icon: '💊' },
  娯楽:   { color: '#FF6384', icon: '🎮' },
  その他: { color: '#C9CBCF', icon: '📦' },
};

export default function ExpenseList({ expenses, onDelete, onReset }) {
  const [filterCategory, setFilterCategory] = useState('全て');
  const [filterMonth, setFilterMonth] = useState('全て');

  // 月の一覧を生成（データから抽出）
  const months = ['全て', ...new Set(expenses.map((e) => e.date.slice(0, 7)).sort().reverse())];
  const categories = ['全て', ...Object.keys(CATEGORY_STYLE)];

  // フィルタリング
  const filtered = expenses.filter((e) => {
    const matchCat = filterCategory === '全て' || e.category === filterCategory;
    const matchMonth = filterMonth === '全て' || e.date.startsWith(filterMonth);
    return matchCat && matchMonth;
  });

  // フィルタ後の合計金額
  const total = filtered.reduce((sum, e) => sum + e.price, 0);

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>📋 まだ支出データがありません</p>
        <p>レシートをアップロードして登録してください</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <div className="list-header">
        <h2>支出一覧</h2>
        <button className="btn-danger" onClick={onReset}>
          🗑️ 全データ削除
        </button>
      </div>

      {/* フィルター */}
      <div className="filters">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>{m === '全て' ? '全期間' : m}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 合計表示 */}
      <div className="total-banner">
        <span>{filtered.length}件</span>
        <span className="total-amount">合計: ¥{total.toLocaleString()}</span>
      </div>

      {/* 支出テーブル */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>日付</th>
              <th>店舗</th>
              <th>商品名</th>
              <th>カテゴリ</th>
              <th>金額</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((expense) => {
              const style = CATEGORY_STYLE[expense.category] || CATEGORY_STYLE['その他'];
              return (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>{expense.store || '—'}</td>
                  <td>{expense.name}</td>
                  <td>
                    <span
                      className="category-badge"
                      style={{ backgroundColor: style.color + '33', color: style.color }}
                    >
                      {style.icon} {expense.category}
                    </span>
                  </td>
                  <td className="price">¥{expense.price.toLocaleString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(expense.id)}
                      title="削除"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
