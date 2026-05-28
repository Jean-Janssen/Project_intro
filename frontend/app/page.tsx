'use client';

import { useEffect, useState } from 'react';
import PriceChart from './components/PricesChart';

type Holding = {
  ticker: string;
  name: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
};

type HoldingConfig = {
  ticker: string;
  name: string;
  shares: number;
  buyPrice: number;
};

const DEFAULT_HOLDINGS: HoldingConfig[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', shares: 10, buyPrice: 150 },
  { ticker: 'XIU.TO', name: 'iShares S&P/TSX 60', shares: 25, buyPrice: 30 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 5, buyPrice: 280 },
  { ticker: 'VFV.TO', name: 'Vanguard S&P 500 ETF', shares: 15, buyPrice: 90 },
];

export default function Dashboard() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [configs, setConfigs] = useState<HoldingConfig[]>(DEFAULT_HOLDINGS);
  const [selected, setSelected] = useState(DEFAULT_HOLDINGS[0].ticker);
  const [loading, setLoading] = useState(true);

  // Add holding form state
  const [newTicker, setNewTicker] = useState('');
  const [newName, setNewName] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newBuyPrice, setNewBuyPrice] = useState('');

  const fetchPrices = async (list: HoldingConfig[]) => {
    setLoading(true);
    const results = await Promise.all(
      list.map(async h => {
        try {
          const res = await fetch(`http://localhost:4000/api/price/${h.ticker}`);
          const data = await res.json();
          const currentPrice = data[data.length - 1]?.price ?? h.buyPrice;
          return { ...h, currentPrice };
        } catch {
          return { ...h, currentPrice: h.buyPrice };
        }
      })
    );
    setHoldings(results);
    setLoading(false);
  };

  useEffect(() => { fetchPrices(configs); }, [configs]);

  const addHolding = () => {
    if (!newTicker || !newShares || !newBuyPrice) return;
    const newH: HoldingConfig = {
      ticker: newTicker.toUpperCase(),
      name: newName || newTicker.toUpperCase(),
      shares: parseFloat(newShares),
      buyPrice: parseFloat(newBuyPrice),
    };
    const updated = [...configs, newH];
    setConfigs(updated);
    setSelected(newH.ticker);
    setNewTicker(''); setNewName(''); setNewShares(''); setNewBuyPrice('');
  };

  const removeHolding = (ticker: string) => {
    const updated = configs.filter(h => h.ticker !== ticker);
    setConfigs(updated);
    if (selected === ticker && updated.length > 0) setSelected(updated[0].ticker);
  };

  const totalValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.buyPrice, 0);
  const totalPnL = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(2) : '0.00';

  if (loading) return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1rem', fontFamily: 'sans-serif', color: '#888' }}>
      Loading portfolio...
    </main>
  );

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>PortfolioIQ</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>Your personal finance dashboard</p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}` },
          { label: 'Total Gain / Loss', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? '#16a34a' : '#dc2626' },
          { label: 'Return', value: `${totalPnL >= 0 ? '+' : ''}${pnlPct}%`, color: totalPnL >= 0 ? '#16a34a' : '#dc2626' },
        ].map(card => (
          <div key={card.label} style={{ background: '#f9f9f9', borderRadius: 12, padding: '1rem 1.25rem', border: '0.5px solid #e5e5e5' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: card.color || '#111' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Price Chart */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Price Chart</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {holdings.map(h => (
          <button
            key={h.ticker}
            onClick={() => setSelected(h.ticker)}
            style={{
              padding: '6px 14px', borderRadius: 8,
              border: '0.5px solid #e5e5e5',
              background: selected === h.ticker ? '#111' : '#f9f9f9',
              color: selected === h.ticker ? '#fff' : '#555',
              fontSize: 13, cursor: 'pointer',
              fontWeight: selected === h.ticker ? 600 : 400,
            }}
          >
            {h.ticker}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 32 }}>
        <PriceChart ticker={selected} />
      </div>

      {/* Holdings Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Holdings</h2>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 32 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e5e5', color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Ticker</th>
            <th style={{ padding: '8px 0' }}>Name</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>Shares</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>Buy Price</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>Current</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>P&L</th>
            <th style={{ padding: '8px 0' }}></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(h => {
            const pnl = (h.currentPrice - h.buyPrice) * h.shares;
            return (
              <tr key={h.ticker} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>{h.ticker}</td>
                <td style={{ padding: '10px 0', color: '#555' }}>{h.name}</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>{h.shares}</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>${h.buyPrice}</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>${h.currentPrice}</td>
                <td style={{ padding: '10px 0', textAlign: 'right', color: pnl >= 0 ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>
                  <button onClick={() => removeHolding(h.ticker)} style={{
                    background: 'none', border: 'none', color: '#ccc',
                    cursor: 'pointer', fontSize: 16, lineHeight: 1,
                  }}>✕</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add Holding Form */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Add Holding</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
        <input value={newTicker} onChange={e => setNewTicker(e.target.value)} placeholder="Ticker (e.g. TD.TO)"
          style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #e5e5e5', fontSize: 13 }} />
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name (optional)"
          style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #e5e5e5', fontSize: 13 }} />
        <input value={newShares} onChange={e => setNewShares(e.target.value)} placeholder="Shares" type="number"
          style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #e5e5e5', fontSize: 13 }} />
        <input value={newBuyPrice} onChange={e => setNewBuyPrice(e.target.value)} placeholder="Buy price" type="number"
          style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #e5e5e5', fontSize: 13 }} />
        <button onClick={addHolding} style={{
          padding: '8px 16px', borderRadius: 8, background: '#111',
          color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500,
        }}>+ Add</button>
      </div>
    </main>
  );
}