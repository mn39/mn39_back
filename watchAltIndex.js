// watchAltIndex.js
import puppeteer from 'puppeteer';

const URL = 'https://www.coinglass.com/pro/i/alt-coin-season';
const SELECTOR = 'div.MuiBox-root.cg-style-9qi30s';
const CHROME_PATH = '/app/.chrome-for-testing/chrome-linux64/chrome';

// 간단한 딜레이 함수
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** 네트워크 오류 시 재시도용 안전한 goto 래퍼 */
async function safeGoto(page, url, options) {
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await page.goto(url, options);
    } catch (err) {
      if (err.message.includes('ERR_NETWORK_CHANGED') && i < maxAttempts - 1) {
        console.warn(`⚠️ 네트워크 변경 감지, 재시도 ${i + 1}/${maxAttempts}`);
        await delay(3000);
        continue;
      }
      throw err;
    }
  }
}

export async function getAltcoinIndex() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-features=NetworkService,NetworkServiceInProcess',
    ],
  });

  const page = await browser.newPage();
  await safeGoto(page, URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  let numericValue = NaN;
  let retryCount = 0;
  const maxRetries = 30;

  while (retryCount < maxRetries) {
    try {
      // 텍스트 추출
      const text = await page.$eval(SELECTOR, (el) => el.textContent.trim());
      const num = parseFloat(text);

      console.log(`🔄 시도 ${retryCount + 1}: raw="${text}", num=${num}`);

      // 0~100 사이의 유효 숫자인지 검사
      if (Number.isFinite(num) && num >= 0 && num <= 100) {
        numericValue = num;
        console.log('✅ 유효한 값 확보:', numericValue);
        break;
      } else {
        console.log('⚠️ 값이 0–100 범위 아님, 재시도…');
      }
    } catch {
      console.log('❌ 셀렉터 못 찾음. 재시도…');
    }

    // 재시도 준비
    retryCount++;
    await safeGoto(page, URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await delay(5000);
  }

  await browser.close();

  if (Number.isFinite(numericValue)) {
    return {
      value: numericValue,
      timestamp: new Date().toISOString(),
    };
  } else {
    // 최대 재시도 후에도 유효값 없으면 null 반환
    return null;
  }
}
