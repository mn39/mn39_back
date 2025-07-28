import { getAltcoinIndex } from './watchAltIndex.js';
import fs from 'fs/promises';

async function pollEvery10Minutes() {
  while (true) {
    console.log('🕒 데이터 수집 시도 중...');

    const result = await getAltcoinIndex();

    if (result) {
      console.log('✅ 유효한 값 발견:', result);

      const log = `${result.timestamp}, ${result.value}\n`;
      await fs.appendFile('altcoin_index_log.csv', log, 'utf-8');
    } else {
      console.log('⚠️ 유효한 값을 못 얻음. 다음 주기에 다시 시도.');
    }

    // 10분 대기
    await new Promise((r) => setTimeout(r, 10 * 60 * 1000));
  }
}

pollEvery10Minutes();
