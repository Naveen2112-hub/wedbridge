const { chromium } = require('playwright');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

(async () => {
  const port = 3458;
  const app = next({ dev: false, port });
  const handle = app.getRequestHandler();
  await app.prepare();
  const server = createServer((req, res) => handle(req, res, parse(req.url, true)));
  await new Promise(r => server.listen(port, r));

  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  async function shot(name, path, opts = {}) {
    const vp = opts.viewport || { width: 1440, height: 900 };
    const page = await browser.newPage({ viewport: vp });
    try {
      await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `./screenshots/${name}.png` });
      console.log(`OK: ${name}`);
    } catch(e) {
      console.error(`FAIL: ${name} — ${e.message.split('\n')[0]}`);
      try { await page.screenshot({ path: `./screenshots/${name}.png` }); } catch(_) {}
    }
    await page.close();
  }

  await shot('25-admin-login', '/admin/login');
  await shot('09-admin-dashboard', '/admin/dashboard');
  await shot('10-membership', '/membership');
  await shot('13-admin-vendors', '/admin/vendors');
  await shot('14-admin-users', '/admin/users');
  await shot('15-admin-payments', '/admin/payments');
  await shot('08-vendor-dashboard', '/vendor-dashboard');
  await shot('21-vendor-login', '/vendor-login');
  await shot('23-vendor-create', '/vendor/create');
  await shot('01-home-desktop', '/');

  await browser.close();
  await server.close();
  await app.close();
  console.log('Re-screenshots done');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
