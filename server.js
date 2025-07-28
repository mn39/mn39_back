import 'dotenv/config';
import { getAltcoinIndex } from './watchAltIndex.js';
import { MongoClient } from 'mongodb';

async function pollEvery10Minutes() {
  while (true) {
    console.log('🕒 데이터 수집 시도 중...');

    const result = await getAltcoinIndex();

    if (result) {
      console.log('✅ 유효한 값 발견:', result);

      // 1) MongoDB 연결
      const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();

      // 2) DB/컬렉션 선택
      const db = client.db(); // URI 로 이미 DB 이름을 지정했다면 생략 가능
      const col = db.collection('altcoinIndex_log');

      // 3) Insert
      await col.insertOne({
        value: result.value,
        timestamp: new Date(result.timestamp), // Date 타입으로 저장
      });
      console.log('✅ 데이터베이스에 저장 완료!');
    } else {
      console.log('⚠️ 유효한 값을 못 얻음. 다음 주기에 다시 시도.');
    }

    // 10분 대기
    await new Promise((r) => setTimeout(r, 10 * 60 * 1000));
  }
}

pollEvery10Minutes();
