import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { MongoClient } from 'mongodb';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000; // 🔥 Heroku에선 이게 필수!

const allowedOrigins = ['https://mn39.github.io', 'http://127.0.0.1:5500'];

app.use(
  cors({
    origin: function (origin, callback) {
      // origin이 undefined일 수도 있음 (예: curl 등)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

// 미리 하나만 연결해 두고 재사용해도 됩니다.
let cachedClient;

async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await cachedClient.connect();
  }
  return cachedClient;
}

app.get('/latest', async (req, res) => {
  try {
    const client = await getClient();
    const col = client.db().collection('altcoinIndex_log');

    const doc = await col.find().sort({ timestamp: -1 }).limit(1).next();

    if (!doc) return res.status(404).json({ error: 'No data available' });

    res.json({
      value: doc.value,
      timestamp: doc.timestamp.toISOString(),
    });
  } catch (err) {
    console.error('❌ Error reading log:', err.message);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API 서버 실행 중 (PORT: ${PORT})`);
});
