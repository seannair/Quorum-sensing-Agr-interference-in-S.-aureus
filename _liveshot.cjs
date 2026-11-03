/* Throwaway: capture LIVE (non-render) desktop frames so #ui/#prog are visible. Usage: node _liveshot.cjs t1 [t2 …] */
const { createRequire } = require('module');
const fs = require('fs'), path = require('path'), os = require('os');
const req = createRequire('C:/Users/sfaas/html-video/packages/adapter-hyperframes/package.json');
const { chromium } = req('playwright');
const BASE = 'file:///C:/Users/sfaas/Documents/Qwen/workspace/staph-agr-quorum-sensing/index.html';
const OUT = path.join(__dirname, '_shots');

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    const dir = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
    const builds = fs.readdirSync(dir).filter(d => /^chromium-\d+$/.test(d))
      .sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]));
    let exe;
    for (const b of builds) { const c = path.join(dir, b, 'chrome-win64', 'chrome.exe'); if (fs.existsSync(c)) { exe = c; break; } }
    browser = await chromium.launch({ executablePath: exe });
  }
  fs.mkdirSync(OUT, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const t of process.argv.slice(2).map(parseFloat)) {
    if (!Number.isFinite(t)) continue;
    await page.goto(`${BASE}?t=${t}`, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const f = path.join(OUT, `live-desktop_t${String(t).replace('.', '_')}.png`);
    await page.screenshot({ path: f });
    console.log('done', f);
  }
  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
