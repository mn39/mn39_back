// puppeteer.config.cjs
/** @type {import('puppeteer').Configuration} */
module.exports = {
  launch: {
    headless: 'new',
    executablePath: 'chrome', // ← 여기가 핵심!
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  },
};
