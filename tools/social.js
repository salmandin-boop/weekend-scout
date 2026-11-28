// Makes ready-to-post Instagram/TikTok carousel images (1080x1350) and a caption for each city's weekend.
// Run from the repo root: node tools/social.js [outDir] [city,city,...] [upcoming]
// Add 'date' to make a "Date night in <city>" post: dinner nearby + a date-night event this weekend (+ drinks if known).
// Add 'upcoming' to make a "Coming up" post from the city's upcoming list (for Mon–Wed, before the new weekend list is out).
// Output (not committed): <outDir>/<city>/01.jpg … and <outDir>/<city>/caption.txt
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '.social'));
const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const UPCOMING = process.argv[4] === 'upcoming';
const DATE = process.argv[4] === 'date';
const miles = (a, b) => { const R = 3958.8, r = x => x * Math.PI / 180; const dl = r(b.lat - a.lat), dn = r(b.lon - a.lon); return 2 * R * Math.asin(Math.sqrt(Math.sin(dl / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dn / 2) ** 2)); };
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
    if (DATE) {
      const today = new Date().toISOString().slice(0, 10);
      if (!(d.weekend && d.weekend.days && d.weekend.days.sun >= today)) { console.log('skip', c.id, '(weekend over)'); continue; }
      let spots = []; try { spots = JSON.parse(fs.readFileSync(path.join(ROOT, 'spots', c.id + '.json'))).spots || []; } catch {}
      const dinners = spots.filter(x => x.kind === 'dinner' && x.lat), drinks = spots.filter(x => x.kind === 'drinks' && x.lat);
      const left = DAYS.filter(dd => d.weekend.days[dd] >= today);
      const firstDay = e => left.find(dd => (e.times[dd] || []).some(t => t.s && t.s >= '16:00')) || left.find(dd => (e.times[dd] || []).length);
      const evening = e => left.some(dd => (e.times[dd] || []).some(t => t.s && t.s >= '16:00')) ? 0 : 1;
      const evs = d.events.filter(e => !e.featured && (e.good || []).includes('date') && e.lat && firstDay(e)).sort((a, b) => evening(a) - evening(b));
      const plans = [], used = new Set();
      for (const e of evs) {
        const near = (list) => list.filter(x => !used.has(x.name)).map(x => [miles(e, x), x]).filter(([m]) => m <= 2).sort((a, b) => a[0] - b[0])[0];
        const din = near(dinners); if (!din) continue; used.add(din[1].name);
        const dr = near(drinks); if (dr) used.add(dr[1].name);
        plans.push({ e, day: firstDay(e), din: din[1], dr: dr && dr[1] });
        if (plans.length === 3) break;
      }
      if (plans.length < 2) { console.log('skip', c.id, '(fewer than 2 date plans)'); continue; }
      const sl = [`<div class="k">Weekend Scout · ${esc(d.weekend.label)}</div><h1>Date night in <em>${esc(c.name)}</em></h1>
        <div class="d">${plans.length} ready-made plans: dinner, a show, then drinks</div><ul>${plans.map(p => `<li>${esc(p.e.title)}</li>`).join('')}</ul>${TICKET}
        <div class="foot"><span>Swipe for the plans →</span><span>weekendscout.app</span></div>`];
      plans.forEach((p, i) => { const s0 = ((p.e.times[p.day].find(t => t.s && t.s >= '16:00') || p.e.times[p.day].find(t => t.s)) || {}).s;
        sl.push(`<div class="k">Date night ${i + 1} · ${DN[p.day]}</div>
        <div class="card"><div class="when">1 · DINNER</div><h2 style="font-size:64px">${esc(p.din.name)}</h2><div class="v">${esc([p.din.cuisine, p.din.area].filter(Boolean).join(' · '))}</div>
        <div class="when" style="margin-top:40px">2 · ${esc(DN[p.day])}${s0 ? ' · ' + esc(fmt(s0)) : ''}</div><h2 style="font-size:64px">${esc(p.e.title)}</h2><div class="v">${esc(p.e.venue)}</div>
        ${p.dr ? `<div class="when" style="margin-top:40px">3 · NIGHTCAP</div><h2 style="font-size:56px">${esc(p.dr.name)}</h2>` : ''}</div>
        <div class="foot"><span class="n">${i + 1} / ${plans.length}</span><span>weekendscout.app</span></div>`); });
      sl.push(`<div class="k">Weekend Scout</div><h1>Plan your date in one tap</h1>
        <div class="d">Date night plans with dinner nearby, times and tickets. Free, no sign-up.</div>${TICKET}
        <ul><li>weekendscout.app</li><li>Link in bio</li></ul><div class="foot"><span>200 US cities</span><span>${esc(tagOf(c))}</span></div>`);
      for (let i = 0; i < sl.length; i++) { await p.setContent(`<style>${CSS}</style>${sl[i]}`); await p.waitForTimeout(120); await p.screenshot({ path: path.join(dir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 88 }); }
      const nm = c.name.replace(/[^A-Za-z]/g, '');
      fs.writeFileSync(path.join(dir, 'caption.txt'), `Date night in ${c.name} this weekend 💘\n\n` + plans.map((p, i) => `${i + 1}. Dinner at ${p.din.name}, then ${p.e.title} (${DN[p.day]})${p.dr ? `, nightcap at ${p.dr.name}` : ''}`).join('\n') +
        `\n\nTag who you're taking 👇 More date night plans with times and tickets at weekendscout.app (link in bio).\n\n#DateNight #DateNight${nm} #DateIdeas #${nm} #ThingsToDo${nm} #WeekendScout #fyp #foryoupage\n`);
      continue;
    }
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
        `\n\nSave the dates, and find this weekend's hand-checked picks at weekendscout.app (link in bio).\n\n${tagOf(c)} #ThingsToDo${c.name.replace(/[^A-Za-z]/g, '')} #${c.state}Events #WeekendScout #fyp #foryoupage\n`);
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
      `${tagOf(c)} #${c.name.replace(/[^A-Za-z]/g, '')}Events #ThingsToDo${c.name.replace(/[^A-Za-z]/g, '')} #WeekendPlans #${c.state}Events #WeekendScout #fyp #foryoupage`;
    fs.writeFileSync(path.join(dir, 'caption.txt'), cap + '\n');
  }
  await b.close(); console.log('made social posts for', cities.length, 'cities in', OUT);
})();
