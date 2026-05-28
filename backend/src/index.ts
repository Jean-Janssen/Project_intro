import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/price/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=30d`;
    const response = await fetch(url);
    const data = await response.json();

    const timestamps = data.chart.result[0].timestamp;
    const closes = data.chart.result[0].indicators.quote[0].close;

    const formatted = timestamps.map((t: number, i: number) => ({
      date: new Date(t * 1000).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
      price: parseFloat(closes[i]?.toFixed(2)),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));