// Makes ready-to-post Instagram/TikTok carousel images (1080x1350) and a caption for each city's weekend.
// Run from the repo root: node tools/social.js [outDir] [city,city,...] [upcoming]
// Add 'upcoming' to make a "Coming up" post from the city's upcoming list (for Mon–Wed, before the new weekend list is out).
// Output (not committed): <outDir>/<city>/01.jpg … and <outDir>/<city>/caption.txt
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '.social'));
const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const UPCOMING = process.argv[4] === 'upcoming';
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dateLabel = iso => { const [y, m, dd] = iso.split('-').map(Number); const wd = ['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]; return `${wd} · ${MON[m - 1].toUpperCase()} ${dd}`; };
const font = 'data:font/ttf;base64,' + fs.readFileSync(path.join(__dirname, 'fonts/BricolageGrotesque-Bold.ttf')).toString('base64');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DAYS = ['fri', 'sat', 'sun'], DN = { fri: 'FRI', sat: 'SAT', sun: 'SUN' };
const fmt = t => { if (!t) return ''; let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return m ? `${h}:${String(m).padStart(2, '0')} ${ap}` : `${h} ${ap}`; };
const when = e => { const ds = DAYS.filter(d => (e.times[d] || []).length); const s = ds.length && e.times[ds[0]][0].s; return (ds.length > 1 ? `${DN[ds[0]]}–${DN[ds[ds.length - 1]]}` : DN[ds[0]] || '') + (s ? ` · ${fmt(s)}` : ''); };
const tagOf = c => '#' + c.name.replace(/[^A-Za-z]/g, '');
const CSS = `@font-face{font-family:B;src:url(${font})}*{margin:0;box-sizing:border-box}
body{width:1080px;height:1350px;background:linear-gradient(165deg,#1f2f52,#111a30);color:#fff;font-family:Inter,Arial,sans-serif;padding:84px 80px;position:relative;overflow:hidden}
.k{font:800 30px Inter,Arial;letter-spacing:.16em;text-transform:uppercase;color:#ff8a4c}
h1{font:800 112px/1 B,Arial;margin-top:34px}h1 em{font-style:normal;color:#ff7a3d}
.d{font:600 40px Inter,Arial;color:#c9d2e6;margin-top:28px}
.card{background:#fff;color:#1b2333;border-radius:44px;padding:64px 60px;margin-top:70px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
.when{font:800 40px B,Arial;color:#b8460f;letter-spacing:.02em}
h2{font:800 84px/1.04 B,Arial;margin-top:26px}
.v{font:600 40px Inter,Arial;color:#5d6577;margin-top:22px}
.b{font:500 36px/1.38 Inter,Arial;color:#3b4456;margin-top:30px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.pills{margin-top:34px;display:flex;gap:14px;flex-wrap:wrap}.pill{font:700 32px Inter,Arial;padding:12px 26px;border-radius:999px;background:#f3f1ec}.pill.free{background:#e3f3ea;color:#1e7a4f}
.foot{position:absolute;left:80px;right:80px;bottom:70px;display:flex;justify-content:space-between;font:700 34px Inter,Arial;color:#c9d2e6}
.n{color:#ff8a4c}
ul{list-style:none;margin-top:60px;display:grid;gap:26px}li{font:700 46px/1.15 Inter,Arial}li::before{content:"★ ";color:#ff7a3d}
.t{position:absolute;right:-90px;top:120px;width:460px;opacity:.14;transform:rotate(12deg)}`;
const TICKET = '<svg class="t" viewBox="0 0 512 512"><path fill="#e2591b" d="M120 166a22 22 0 0 1 22-22h228a22 22 0 0 1 22 22v40a50 50 0 0 0 0 100v40a22 22 0 0 1-22 22H142a22 22 0 0 1-22-22v-40a50 50 0 0 0 0-100Z"/></svg>';

(async () => {
  const cities = JSON.parse(fs.readFileSync(path.join(ROOT, 'cities.json'))).cities.filter(c => !ONLY.length || ONLY.includes(c.id));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const c of cities) {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, c.file)));
    const dir = path.join(OUT, c.id); fs.mkdirSync(dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, f));
    if (UPCOMING) {
      const today = new Date().toISOString().slice(0, 10);
      const up = (d.upcoming || []).filter(u => u.date && u.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
      if (up.length < 3) { console.log('skip', c.id, '(fewer than 3 upcoming events)'); continue; }
      const sl = [`<div class="k">Weekend Scout · Coming up</div><h1>Coming up in <em>${esc(c.name)}</em></h1>
        <div class="d">Big dates worth planning for</div><ul>${up.map(u => `<li>${esc(u.title)}</li>`).join('')}</ul>${TICKET}
        <div class="foot"><span>Swipe for dates →</span><span>weekendscout.app</span></div>`];
      up.forEach((u, i) => sl.push(`<div class="k">${esc(c.name)} · Coming up</div>
        <div class="card"><div class="when">${esc(dateLabel(u.date))}</div><h2>${esc(u.title)}</h2><div class="v">${esc(u.venue || '')}</div>
        <div class="pills"><span class="pill">${esc(u.priceLabel || 'Tickets')}</span></div></div>
        <div class="foot"><span class="n">${i + 1} / ${up.length}</span><span>weekendscout.app</span></div>`));
      sl.push(`<div class="k">Weekend Scout</div><h1>Plus this weekend's picks every Wednesday</h1>
        <div class="d">Times, tickets, directions and free things to do. Free, no sign-up.</div>${TICKET}
        <ul><li>weekendscout.app</li><li>Link in bio</li></ul><div class="foot"><span>200 US cities</span><span>${esc(tagOf(c))}</span></div>`);
      for (let i = 0; i < sl.length; i++) { await p.setContent(`<style>${CSS}</style>${sl[i]}`); await p.waitForTimeout(120); await p.screenshot({ path: path.join(dir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 88 }); }
      const md = iso => { const [, m, dd] = iso.split('-').map(Number); return `${MON[m - 1]} ${dd}`; };
      fs.writeFileSync(path.join(dir, 'caption.txt'), `Coming up in ${c.name} 📅\n\n` + up.map(u => `• ${u.title}: ${md(u.date)}${u.venue ? ` at ${u.venue}` : ''}`).join('\n') +
        `\n\nSave the dates, and find this weekend's hand-checked picks at weekendscout.app (link in bio).\n\n${tagOf(c)} #ThingsToDo${c.name.replace(/[^A-Za-z]/g, '')} #${c.state}Events #WeekendScout\n`);
      continue;
    }
    // 5 picks: never sponsored; mix free, date-night and other categories, timed events first
    const pool = d.events.filter(e => !e.featured), picks = [];
    const take = f => { const e = pool.find(x => f(x) && !picks.includes(x)); if (e) picks.push(e); };
    take(e => e.price === 'free'); take(e => (e.good || []).includes('date')); take(e => e.cat === 'music' || e.cat === 'sports');
    take(e => e.price === 'free'); take(e => (e.good || []).includes('family'));
    while (picks.length < 5 && picks.length < pool.length) take(() => true);
    const free = d.events.filter(e => e.price === 'free').length;
    const slides = [];
    slides.push(`<div class="k">Weekend Scout · ${esc(d.weekend.label)}</div><h1>This weekend in <em>${esc(c.name)}</em></h1>
      <div class="d">${d.events.length} hand-checked picks · ${free} free</div><ul>${picks.map(e => `<li>${esc(e.title)}</li>`).join('')}</ul>${TICKET}
      <div class="foot"><span>Swipe for details →</span><span>weekendscout.app</span></div>`);
    picks.forEach((e, i) => slides.push(`<div class="k">${esc(c.name)} · ${esc(d.weekend.label)}</div>
      <div class="card"><div class="when">${esc(when(e))}</div><h2>${esc(e.title)}</h2><div class="v">${esc(e.venue)}</div>${e.blurb ? `<div class="b">${esc(e.blurb)}</div>` : ''}
      <div class="pills"><span class="pill${e.price === 'free' ? ' free' : ''}">${esc(e.priceLabel || '')}</span>${e.ages ? `<span class="pill">${esc(e.ages)}</span>` : ''}</div></div>
      <div class="foot"><span class="n">${i + 1} / ${picks.length}</span><span>weekendscout.app</span></div>`));
    slides.push(`<div class="k">Weekend Scout</div><h1>${d.events.length - picks.length > 0 ? `+${d.events.length - picks.length} more` : 'All the details'} in the app</h1>
      <div class="d">Times, tickets, directions and ready-made date night plans. Free, no sign-up.</div>${TICKET}
      <ul><li>weekendscout.app</li><li>Link in bio</li></ul><div class="foot"><span>New picks every Wednesday</span><span>${esc(tagOf(c))}</span></div>`);
    for (let i = 0; i < slides.length; i++) {
      await p.setContent(`<style>${CSS}</style>${slides[i]}`); await p.waitForTimeout(120);
      await p.screenshot({ path: path.join(dir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 88 });
    }
    const cap = `This weekend in ${c.name} (${d.weekend.label}) 👇\n\n` + picks.map(e => `• ${e.title}: ${when(e)} at ${e.venue}${e.price === 'free' ? ' (free)' : ''}`).join('\n') +
      `\n\n${d.events.length} hand-checked picks, ${free} free, with times, tickets and date night plans at weekendscout.app (link in bio).\n\n` +
      `${tagOf(c)} #${c.name.replace(/[^A-Za-z]/g, '')}Events #ThingsToDo${c.name.replace(/[^A-Za-z]/g, '')} #WeekendPlans #${c.state}Events #WeekendScout`;
    fs.writeFileSync(path.join(dir, 'caption.txt'), cap + '\n');
  }
  await b.close(); console.log('made social posts for', cities.length, 'cities in', OUT);
})();
