// puppeteer.config.cjs
/** @type {import('puppeteer').Configuration} */
module.exports = {
  launch: {
    headless: 'new',
    executablePath: process.env.PUPPETEER_CHROMIUM_REVISION
      ? undefined
      : process.env.GOOGLE_CHROME_SHIM || process.env.GOOGLE_CHROME_BIN,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  },
};
