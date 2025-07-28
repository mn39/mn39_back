import puppeteer from 'puppeteer';

const URL = 'https://www.coinglass.com/pro/i/alt-coin-season';
const SELECTOR = 'div.MuiBox-root.cg-style-9qi30s';

const CHROME_PATH = '/app/.chrome-for-testing/chrome-linux64/chrome';

export async function getAltcoinIndex() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH, // ← 이 부분을 코드에 직접 지정
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 0 });

  let value = '-';
  const maxRetry = 30;
  let retry = 0;

  while (value === '-' && retry < maxRetry) {
    try {
      await page.waitForSelector(SELECTOR, { timeout: 5000 });
      value = await page.$eval(SELECTOR, (el) => el.textContent.trim());
      console.log(`🔄 현재 값: ${value}`);
    } catch (e) {
      console.log('❌ 셀렉터 못 찾음. 다시 시도.');
    }

    if (value === '-') {
      await page.reload({ waitUntil: 'networkidle2', timeout: 0 });
      await new Promise((r) => setTimeout(r, 5000)); // 5초 대기 후 재시도
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
