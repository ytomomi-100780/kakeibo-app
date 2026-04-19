import { useState, useEffect } from 'react';
import ReceiptUploader from './components/ReceiptUploader';
import ExpenseList from './components/ExpenseList';
import Charts from './components/Charts';

const STORAGE_KEY = 'kakeibo_expenses';

export default function App() {
  // localStorageから支出データを初期化
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('upload'); // upload | list | charts
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 支出データが変わるたびにlocalStorageへ保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  // レシート解析結果を支出リストに追加
  const handleReceiptAnalyzed = (result) => {
    const newExpenses = result.items.map((item, index) => ({
      id: `${Date.now()}_${index}`,
      store: result.store,
      date: result.date,
      name: item.name,
      price: item.price,
      category: item.category,
    }));
    setExpenses((prev) => [...prev, ...newExpenses]);
    setActiveTab('list');
  };

  // 支出を削除
  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // 全データをリセット
  const handleReset = () => {
    if (window.confirm('全てのデータを削除しますか？')) {
      setExpenses([]);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📊 レシート読み込み家計簿</h1>
        <p>レシートをアップロードするだけで自動で家計管理</p>
      </header>

      {/* タブナビゲーション */}
      <nav className="tabs">
        <button
          className={activeTab === 'upload' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('upload')}
        >
          📷 レシート登録
        </button>
        <button
          className={activeTab === 'list' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('list')}
        >
          📋 支出一覧
          {expenses.length > 0 && (
            <span className="badge">{expenses.length}</span>
          )}
        </button>
        <button
          className={activeTab === 'charts' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('charts')}
        >
          📈 グラフ
        </button>
      </nav>

      <main className="main">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {activeTab === 'upload' && (
          <ReceiptUploader
            onAnalyzed={handleReceiptAnalyzed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        )}

        {activeTab === 'list' && (
          <ExpenseList
            expenses={expenses}
            onDelete={handleDelete}
            onReset={handleReset}
          />
        )}

        {activeTab === 'charts' && <Charts expenses={expenses} />}
      </main>
    </div>
  );
}
