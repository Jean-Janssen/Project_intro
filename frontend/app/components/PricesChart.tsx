'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type PricePoint = { date: string; price: number };
type Prediction = { ticker: string; direction: string; confidence: number; signal: string };

export default function PriceChart({ ticker }: { ticker: string }) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:4000/api/price/${ticker}`).then(r => r.json()),
      fetch(`http://localhost:8000/predict/${ticker}`).then(r => r.json()),
    ]).then(([prices, pred]) => {
      setData(prices);
      setPrediction(pred);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [ticker]);

  if (loading) return <div style={{ padding: '2rem', color: '#888', fontSize: 13 }}>Loading {ticker}...</div>;
  if (!data.length) return <div style={{ padding: '2rem', color: '#888', fontSize: 13 }}>No data found.</div>;

  const first = data[0].price;
  const last = data[data.length - 1].price;
  const isUp = last >= first;

  return (
    <div style={{ background: '#f9f9f9', borderRadius: 12, padding: '1rem 1.25rem', border: '0.5px solid #e5e5e5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{ticker} — 30 day</span>
          <span style={{ marginLeft: 12, fontSize: 13, color: isUp ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
            {isUp ? '▲' : '▼'} ${Math.abs(last - first).toFixed(2)} ({(((last - first) / first) * 100).toFixed(2)}%)
          </span>
        </div>

        {prediction && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: prediction.signal === 'BUY' ? '#f0fdf4' : '#fef9f0',
            border: `0.5px solid ${prediction.signal === 'BUY' ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: 8, padding: '6px 12px',
          }}>
            <span style={{ fontSize: 12, color: '#888' }}>5-day ML signal</span>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: prediction.signal === 'BUY' ? '#16a34a' : '#d97706',
            }}>
              {prediction.signal} {prediction.direction === 'UP' ? '▲' : '▼'} {prediction.confidence}%
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#aaa' }} interval={6} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#aaa' }} width={55} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e5e5' }}
            formatter={(val: number) => [`$${val}`, 'Price']}
          />
          <Line type="monotone" dataKey="price" stroke={isUp ? '#16a34a' : '#dc2626'} dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}