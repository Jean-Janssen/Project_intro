# PortfolioIQ
 
A full-stack personal finance dashboard for tracking TSX and NYSE stocks and ETFs, with real-time price data and ML-powered 5-day price predictions.
 
**Live demo:** [portfolioiq.vercel.app](project-intro-puf8.vercel.app) <!-- replace with your actual URL -->
 
---
 
## Features
 
- **Portfolio overview** — total value, gain/loss, and return calculated from real market prices
- **Interactive price charts** — 30-day historical data with live prices from Yahoo Finance
- **ML predictions** — XGBoost model predicting 5-day price direction with confidence score
- **Dynamic holdings** — add and remove any TSX/NYSE stock or ETF by ticker
- **Buy/Wait signals** — sentiment-style signal badge on each asset's chart
---
 
## Tech Stack
 
| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express, Next.js API Routes |
| ML Service | Python, FastAPI, XGBoost, scikit-learn, pandas |
| Data | Yahoo Finance API (yfinance), NewsAPI |
| Database | PostgreSQL, MongoDB |
| Infra | Docker Compose, GitHub Actions CI/CD, Vercel, Railway |
 
---
 
## Project Structure
 
```
portfolioiq/
├── frontend/          # Next.js app (deployed on Vercel)
│   ├── app/
│   │   ├── page.tsx            # Main dashboard
│   │   ├── api/price/[ticker]/ # Next.js API route → Yahoo Finance
│   │   └── components/
│   │       └── PriceChart.tsx  # Chart + ML prediction badge
├── backend/           # Node/Express REST API
│   └── src/
│       └── index.ts
└── ml-service/        # Python FastAPI ML microservice
    ├── main.py         # /predict/{ticker} endpoint
    └── model/
        └── features.py # RSI, moving averages, volume features
```
 
---
 
## Getting Started
 
### Prerequisites
- Node.js 18+
- Python 3.12+
- npm
### Frontend
 
```bash
cd frontend
npm install
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000)
 
### Backend
 
```bash
cd backend
npm install
npm run dev
```
 
Runs on [http://localhost:4000](http://localhost:4000)
 
### ML Service
 
```bash
cd ml-service
python -m venv venv
venv\Scripts\activate      # Windows
pip install fastapi uvicorn yfinance xgboost scikit-learn pandas numpy
uvicorn main:app --reload --port 8000
```
 
Runs on [http://localhost:8000](http://localhost:8000)
 
---
 
## ML Model
 
The prediction service trains an **XGBoost classifier** on 1 year of historical data for each ticker. Features used:
 
- 20-day and 50-day moving averages
- RSI (Relative Strength Index, 14-day)
- Volume ratio (current vs 20-day average)
- 1-day and 5-day price returns
The model predicts whether the price will be **higher or lower in 5 trading days**, along with a confidence percentage.
 
---
 
## API Endpoints
 
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/price/:ticker` | 30-day OHLCV price history |
| GET | `/predict/:ticker` | ML prediction + confidence score |
 
---
 
## Deployment
 
- **Frontend** — deployed on [Vercel](https://vercel.com) via GitHub integration
- **Backend** — deployed on [Railway](https://railway.app)
- **CI/CD** — GitHub Actions runs build checks on every push
---
 
## Author
 
**Jean Janssen** — [linkedin.com/in/jean-janssen](https://linkedin.com/in/jean-janssen) · [github.com/Jean-Janssen](https://github.com/Jean-Janssen)
