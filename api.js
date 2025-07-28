import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3000;
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
  console.log(`🚀 API 서버 실행 중: http://localhost:${PORT}/latest`);
});
