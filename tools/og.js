// Makes a 1200x630 preview image per city: og/<city>.jpg. Run from the repo root: node tools/og.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const font = 'data:font/ttf;base64,' + fs.readFileSync(path.join(__dirname, 'fonts/BricolageGrotesque-Bold.ttf')).toString('base64');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
(async () => {
  const cities = JSON.parse(fs.readFileSync(path.join(ROOT, 'cities.json'))).cities;
  fs.mkdirSync(path.join(ROOT, 'og'), { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const c of cities) {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, c.file)));
    const picks = d.events.filter(e => !e.featured).slice(0, 3);
    const free = d.events.filter(e => e.price === 'free').length;
    await p.setContent(`<style>@font-face{font-family:B;src:url(${font})}*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:linear-gradient(160deg,#1f2f52,#121c33);color:#fff;font-family:Inter,Arial,sans-serif;padding:64px 72px;position:relative;overflow:hidden}
      .k{font:700 26px Inter,Arial;letter-spacing:.14em;text-transform:uppercase;color:#ff8a4c;display:flex;gap:14px;align-items:center}
      h1{font:800 76px/1.02 B,Arial;margin-top:26px;max-width:900px}h1 em{font-style:normal;color:#ff7a3d}
      .d{font:600 30px Inter,Arial;color:#c9d2e6;margin-top:18px}
      ul{list-style:none;padding:0;margin-top:34px;display:grid;gap:12px}li{font:600 28px Inter,Arial;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:980px}li::before{content:"★ ";color:#ff7a3d}
      .t{position:absolute;right:-60px;top:70px;width:340px;opacity:.16;transform:rotate(12deg)}</style>
      <svg class="t" viewBox="0 0 512 512"><path fill="#e2591b" d="M120 166a22 22 0 0 1 22-22h228a22 22 0 0 1 22 22v40a50 50 0 0 0 0 100v40a22 22 0 0 1-22 22H142a22 22 0 0 1-22-22v-40a50 50 0 0 0 0-100Z"/></svg>
      <div class="k">Weekend Scout · ${esc(d.weekend.label)}</div><h1>This weekend in <em>${esc(c.name)}</em></h1>
      <div class="d">${d.events.length} hand-checked picks · ${free} free</div><ul>${picks.map(e => `<li>${esc(e.title)}</li>`).join('')}</ul><div style="position:absolute;left:72px;bottom:52px;font:700 26px Inter,Arial;color:#c9d2e6">weekendscout.app</div>`);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(ROOT, 'og', c.id + '.jpg'), type: 'jpeg', quality: 82 });
  }
  await b.close(); console.log('made', cities.length, 'preview images');
})();
