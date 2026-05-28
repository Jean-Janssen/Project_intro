from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def compute_features(df):
    df['ma20'] = df['Close'].rolling(20).mean()
    df['ma50'] = df['Close'].rolling(50).mean()
    df['rsi'] = compute_rsi(df['Close'])
    df['volume_ratio'] = df['Volume'] / df['Volume'].rolling(20).mean()
    df['return_1d'] = df['Close'].pct_change(1)
    df['return_5d'] = df['Close'].pct_change(5)
    return df

def compute_rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = -delta.clip(upper=0).rolling(period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

@app.get("/predict/{ticker}")
def predict(ticker: str):
    try:
        df = yf.download(ticker, period="1y", auto_adjust=True, progress=False)
        if df.empty or len(df) < 60:
            return {"error": "Not enough data"}

        # Flatten multi-index columns if present
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        df = compute_features(df)
        df['target'] = (df['Close'].shift(-5) > df['Close']).astype(int)
        df = df.dropna()

        features = ['ma20', 'ma50', 'rsi', 'volume_ratio', 'return_1d', 'return_5d']
        X = df[features].values
        y = df['target'].values

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = XGBClassifier(n_estimators=100, max_depth=3, learning_rate=0.1, eval_metric='logloss')
        model.fit(X_scaled[:-1], y[:-1])

        latest = X_scaled[-1].reshape(1, -1)
        prob = model.predict_proba(latest)[0][1]
        direction = "UP" if prob >= 0.5 else "DOWN"

        return {
            "ticker": ticker,
            "direction": direction,
            "confidence": round(float(prob) * 100, 1),
            "signal": "BUY" if direction == "UP" else "WAIT"
        }
    except Exception as e:
        return {"error": str(e)}