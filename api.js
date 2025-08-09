// api.js
import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import imageRoutes from './yeyeon/server/imageRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['https://mn39.github.io', 'http://127.0.0.1:5500'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());

// altcoinIndex_log 조회를 위한 MongoClient 재사용
let cachedClient;
async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient;
}

// 기존 /latest 엔드포인트
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
    console.error(err);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// 이미지 관련 라우터 붙이기
app.use('/api', imageRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API 서버 실행 중 (PORT: ${PORT})`);
});
