const { chromium } = require('playwright');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

(async () => {
  const port = 3456;
  const app = next({ dev: false, port });
  const handle = app.getRequestHandler();
  await app.prepare();
  const server = createServer((req, res) => handle(req, res, parse(req.url, true)));
  await new Promise(r => server.listen(port, r));
  console.log(`Server on http://localhost:${port}`);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-web-security'],
  });

  const outDir = './screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  async function shot(name, path, opts = {}) {
    const vp = opts.viewport || { width: 1440, height: 900 };
    const page = await browser.newPage({ viewport: vp });
    try {
      await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      if (opts.scrollBottom) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1500);
      }
      const sopts = { path: `${outDir}/${name}.png` };
      if (opts.clip) sopts.clip = opts.clip;
      await page.screenshot(sopts);
      console.log(`OK: ${name} (${path})`);
    } catch(e) {
      console.error(`FAIL: ${name} — ${e.message.split('\n')[0]}`);
      try { await page.screenshot({ path: `${outDir}/${name}.png` }); } catch(_) {}
    }
    await page.close();
  }

  const base = '';
  // Desktop screenshots (1440x900)
  await shot('01-home-desktop',       '/',                    { viewport: { width: 1440, height: 900 } });
  await shot('02-home-mobile',        '/',                    { viewport: { width: 390, height: 844 } });
  await shot('03-navbar',             '/',                    { viewport: { width: 1440, height: 100 }, clip: { x:0,y:0,width:1440,height:70 } });
  await shot('04-footer',             '/',                    { viewport: { width: 1440, height: 900 }, scrollBottom: true });
  await shot('05-login',              '/login');
  await shot('06-register',           '/register');
  await shot('07-user-dashboard',     '/dashboard');
  await shot('08-vendor-dashboard',   '/vendor-dashboard');
  await shot('09-admin-dashboard',    '/admin/dashboard');
  await shot('10-membership',         '/membership');
  await shot('11-vendor-details',     '/services');
  await shot('12-search',             '/search');
  await shot('13-services',           '/services');
  await shot('14-admin-vendors',      '/admin/vendors');
  await shot('15-admin-users',        '/admin/users');
  await shot('16-admin-payments',     '/admin/payments');
  // Tablet
  await shot('17-home-tablet',        '/',                    { viewport: { width: 768, height: 1024 } });
  // Additional pages
  await shot('18-about',              '/about');
  await shot('19-contact',            '/contact');
  await shot('20-faq',                 '/faq');
  await shot('21-ai-matches',         '/ai-matches');
  await shot('22-vendor-login',       '/vendor-login');
  await shot('23-vendor-search',      '/vendor/search');
  await shot('24-vendor-create',      '/vendor/create');
  await shot('25-wedding-planner',    '/wedding-planner');
  await shot('26-admin-login',        '/admin/login');
  await shot('27-membership-success', '/membership/success');
  await shot('28-membership-failed',  '/membership/failed');
  await shot('29-forgot-password',    '/forgot-password');
  await shot('30-careers',            '/careers');
  await shot('31-privacy',            '/privacy');
  await shot('32-terms',              '/terms');
  await shot('33-refund',             '/refund');
  await shot('34-complete-profile',   '/complete-profile');
  await shot('35-admin-reports',      '/admin/reports');
  await shot('36-admin-settings',     '/admin/settings');
  await shot('37-admin-profile',      '/admin/profile');
  await shot('38-admin-notifications', '/admin/notifications');
  await shot('39-admin-membership',   '/admin/membership');
  await shot('40-admin-activity-logs', '/admin/activity-logs');
  await shot('41-admin-analytics',    '/admin/analytics');
  await shot('42-admin-backup',       '/admin/backup');
  await shot('43-admin-export',       '/admin/export');
  await shot('44-admin-maintenance',  '/admin/maintenance');
  await shot('45-admin-monitoring',   '/admin/monitoring');
  await shot('46-admin-telegram',     '/admin/telegram');
  await shot('47-admin-ocr-upload',   '/admin/ocr-upload');
  await shot('48-admin-bulk-upload',  '/admin/bulk-upload');

  await browser.close();
  await server.close();
  await app.close();
  console.log('All screenshots done');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
