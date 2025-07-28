import express from 'express';
import fs from 'fs/promises';
import path from 'path';
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

const LOG_PATH = path.resolve('altcoin_index_log.csv');

app.get('/latest', async (req, res) => {
  try {
    const content = await fs.readFile(LOG_PATH, 'utf-8');
    const lines = content.trim().split('\n');

    if (lines.length === 0) {
      return res.status(404).json({ error: 'No data available' });
    }

    const lastLine = lines[lines.length - 1];
    const [timestamp, value] = lastLine.split(',').map((s) => s.trim());

    res.json({
      value: Number(value),
      timestamp,
    });
  } catch (err) {
    console.error('❌ Error reading log:', err.message);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API 서버 실행 중 (PORT: ${PORT})`);
});
