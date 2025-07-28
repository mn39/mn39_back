// watchAltIndex.js
import puppeteer from 'puppeteer';

const URL = 'https://www.coinglass.com/pro/i/alt-coin-season';
const SELECTOR = 'div.MuiBox-root.cg-style-9qi30s';
const CHROME_PATH = '/app/.chrome-for-testing/chrome-linux64/chrome';

/**
 * 네트워크 오류 시 재시도하는 안전한 goto 래퍼
 */
async function safeGoto(page, url, options) {
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await page.goto(url, options);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('ERR_NETWORK_CHANGED') && i < maxAttempts - 1) {
        console.warn(`⚠️ 네트워크 변경 감지, 재시도 ${i + 1}/${maxAttempts}`);
        await page.waitForTimeout(3000);
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
  await safeGoto(page, URL, { waitUntil: 'networkidle2', timeout: 30000 });

  let value = '-';
  let retry = 0;
  const maxRetry = 30;

  while (value === '-' && retry < maxRetry) {
    try {
      await page.waitForSelector(SELECTOR, { timeout: 5000 });
      value = await page.$eval(SELECTOR, (el) => el.textContent.trim());
      console.log(`🔄 현재 값: ${value}`);
    } catch {
      console.log('❌ 셀렉터 못 찾음. 재시도…');
    }

    if (value === '-') {
      await safeGoto(page, URL, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(5000);
      retry++;
    }
  }

  await browser.close();

  if (!isNaN(Number(value))) {
    return {
      value: Number(value),
      timestamp: new Date().toISOString(),
    };
  }
  return null;
}
