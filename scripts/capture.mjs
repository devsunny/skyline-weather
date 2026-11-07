import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = process.argv[2] ?? 'http://127.0.0.1:8088';
await mkdir('preview', { recursive: true });

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
});
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  locale: 'en-US',
  timezoneId: 'America/New_York',
});
const page = await context.newPage();
const messages = [];
page.on('console', (message) => messages.push(`console.${message.type()}: ${message.text()}`));
page.on('pageerror', (error) => messages.push(`pageerror: ${error.message}`));
page.on('requestfailed', (request) =>
  messages.push(`requestfailed: ${request.url()} :: ${request.failure()?.errorText}`),
);
page.on('response', (response) => {
  if (response.status() >= 400) messages.push(`response ${response.status()}: ${response.url()}`);
});

await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);

const bodyText = await page.locator('body').innerText().catch(() => '');
await page.screenshot({ path: 'preview/home-top.png' });
await page.screenshot({ path: 'preview/home-full.png', fullPage: true });

await page.mouse.move(215, 500);
for (let index = 1; index <= 3; index += 1) {
  await page.mouse.wheel(0, 760);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `preview/home-scroll-${index}.png` });
}

await page.mouse.wheel(0, -3000);
await page.waitForTimeout(500);
const searchPill = page.getByText('Search', { exact: true }).first();
if (await searchPill.count()) {
  await searchPill.click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'preview/search.png' });
  await page.getByLabel('Close').first().click();
  await page.waitForTimeout(700);
}

const settings = page.getByLabel('Open settings').first();
if (await settings.count()) {
  await settings.click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'preview/settings.png' });
  await page.getByLabel('Close').first().click();
  await page.waitForTimeout(500);
}

await writeFile(
  'preview/console.log',
  `BODY TEXT\n=========\n${bodyText}\n\nMESSAGES\n========\n${messages.join('\n')}\n`,
  'utf8',
);
console.log(bodyText.slice(0, 1400));
console.log('---MESSAGES---');
console.log(messages.slice(0, 50).join('\n'));
await browser.close();
