#!/usr/bin/env python3
"""Builds Weekend Scout's static pages from cities.json and events/*.json.

Run from the repo root after every change to events/*.json:
    python3 tools/build_pages.py            # pages + sitemap
    node tools/og.js                        # preview images (needs Playwright)

Outputs:
  <city>/index.html          a Google-friendly page per city ("Things to do in Austin this weekend")
  e/<city>/<event>/index.html  a share page per event, so shared links preview with the event's name and day
  sitemap.xml
"""
import json, os, re, shutil, html
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://weekendscout.app'
DAYS = ['fri', 'sat', 'sun']
DAYNAME = {'fri': 'Friday', 'sat': 'Saturday', 'sun': 'Sunday'}
CAT = {'music': 'Music', 'sports': 'Sports', 'arts': 'Arts', 'food': 'Food & Drink', 'family': 'Family', 'comedy': 'Comedy'}
esc = lambda s: html.escape(str(s or ''), quote=True)

def fmt(t):
    if not t: return ''
    h, m = map(int, t.split(':')); ap = 'PM' if h >= 12 else 'AM'; h = h % 12 or 12
    return f'{h}:{m:02d} {ap}' if m else f'{h} {ap}'

def when(ev, d):
    ss = ev['times'].get(d) or []
    if not ss: return ''
    s = ss[0]
    if not s.get('s'): return 'See times'
    return fmt(s['s']) + ('–' + fmt(s['e']) if s.get('e') else '')

def pretty(iso, long=False):
    y, m, d = map(int, iso.split('-'))
    return date(y, m, d).strftime('%B %-d' if long else '%b %-d')

CSS = """:root{--bg:#f3f1ec;--surface:#fff;--ink:#1b2333;--muted:#5d6577;--line:#e3dfd6;--accent:#b8460f;--accent-ink:#fff;--free:#1e7a4f;--free-bg:#e3f3ea;--navy:#1f2f52}
@media (prefers-color-scheme:dark){:root{--bg:#14161b;--surface:#1d2029;--ink:#eef0f4;--muted:#a3a9b6;--line:#2e323d;--accent:#ff7a3d;--accent-ink:#1a0d05;--free:#62d39c;--free-bg:#15301f;--navy:#b4c4ea;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 'Figtree',system-ui,-apple-system,'Segoe UI',sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:24px max(16px,env(safe-area-inset-right,0px)) 48px max(16px,env(safe-area-inset-left,0px))}
h1,h2,h3{font-family:'Bricolage Grotesque','Segoe UI',system-ui,sans-serif;line-height:1.1;margin:0;text-wrap:balance}
h1{font-size:clamp(2rem,7vw,2.8rem);font-weight:800}h2{font-size:1.3rem;margin:28px 0 10px}h3{font-size:1.05rem}
.k{font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);text-decoration:none}
.sub{color:var(--muted);margin-top:8px}
.cta{display:inline-flex;align-items:center;min-height:48px;padding:0 20px;border-radius:12px;background:var(--accent);color:var(--accent-ink);font-weight:700;text-decoration:none;margin-top:16px}
.ev{display:grid;grid-template-columns:92px 1fr;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px;margin-top:10px;color:inherit;text-decoration:none}
.ev .t{font-weight:800;color:var(--accent);font-size:.9rem}.ev p{margin:4px 0 0;color:var(--muted);font-size:.9rem}
.pill{display:inline-block;font-size:.72rem;font-weight:700;border-radius:999px;padding:1px 8px;margin:6px 6px 0 0;background:var(--bg);color:var(--muted);border:1px solid var(--line)}
.pill.free{background:var(--free-bg);color:var(--free);border-color:transparent}
.cities{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.cities a{color:var(--ink);border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:8px 14px;text-decoration:none;font-weight:600;font-size:.9rem}
footer{margin-top:36px;color:var(--muted);font-size:.85rem}footer a{color:inherit}"""

def head(title, desc, url, img, extra=''):
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Weekend Scout">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1f2f52">
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Figtree:wght@400;600;700&display=swap">
<style>{CSS}</style>{extra}
</head>"""

def iso_start(day, s):
    return f'{day}T{s}:00' if s else day

def main():
    cities = json.load(open(os.path.join(ROOT, 'cities.json')))['cities']
    datas = {c['id']: json.load(open(os.path.join(ROOT, c['file']))) for c in cities}
    # wipe generated folders so old weekends disappear
    shutil.rmtree(os.path.join(ROOT, 'e'), ignore_errors=True)
    urls = [f'{SITE}/']
    for c in cities:
        d = datas[c['id']]; w = d['weekend']; cname = f"{c['name']}, {c['state']}"
        url = f"{SITE}/{c['id']}/"; img = f"{SITE}/og/{c['id']}.jpg"
        title = f"Things to do in {c['name']} this weekend ({w['label']}) · Weekend Scout"
        free = sum(1 for e in d['events'] if e['price'] == 'free')
        desc = f"{len(d['events'])} hand-checked things to do in {cname} this weekend, {w['label']}: concerts, games, markets, museums and family events. {free} are free."
        items = []
        body_days = []
        feat = set([e['id'] for e in d['events'] if e.get('featured')][:3])  # max 3 Featured spots per city per weekend
        for day in DAYS:
            evs = [e for e in d['events'] if e['times'].get(day)]
            if not evs: continue
            evs.sort(key=lambda e: (0 if e['id'] in feat else 1, (e['times'][day][0].get('s') or '99:99')))
            cards = []
            for e in evs:
                share = f"/e/{c['id']}/{e['id']}/"
                pills = (f'<span class="pill free">{esc(e["priceLabel"])}</span>' if e['price'] == 'free' else f'<span class="pill">{esc(e["priceLabel"])}</span>') + f'<span class="pill">{esc(CAT.get(e["cat"], e["cat"]))}</span>' + (f'<span class="pill">Sponsored</span>' if e['id'] in feat else '')
                cards.append(f'<a class="ev" href="{share}"><span class="t">{esc(DAYNAME[day][:3])} · {esc(when(e, day))}</span><span><h3>{esc(e["title"])}</h3><p>{esc(e["venue"])}</p>{pills}</span></a>')
            body_days.append(f'<h2>{DAYNAME[day]}, {pretty(w["days"][day], True)}</h2>' + ''.join(cards))
        for i, e in enumerate(d['events']):
            day = next((k for k in DAYS if e['times'].get(k)), None)
            if not day: continue
            s = e['times'][day][0].get('s', '')
            it = {'@type': 'Event', 'name': e['title'], 'startDate': iso_start(w['days'][day], s), 'eventStatus': 'https://schema.org/EventScheduled',
                  'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode', 'location': {'@type': 'Place', 'name': e['venue'], 'address': e['addr']},
                  'description': e.get('blurb', ''), 'url': f"{SITE}/e/{c['id']}/{e['id']}/"}
            if e.get('link'): it['offers'] = {'@type': 'Offer', 'url': e['link']['url'], 'availability': 'https://schema.org/InStock', **({'price': 0, 'priceCurrency': 'USD'} if e['price'] == 'free' else {})}
            items.append({'@type': 'ListItem', 'position': i + 1, 'item': it})
        ld = json.dumps({'@context': 'https://schema.org', '@type': 'ItemList', 'name': f'Things to do in {cname} this weekend', 'itemListElement': items}, ensure_ascii=False).replace('</', '<\\/')
        others = ''.join(f'<a href="/{o["id"]}/">{esc(o["name"])}</a>' for o in cities if o['id'] != c['id'])
        page = head(title, desc, url, img, f'<script type="application/ld+json">{ld}</script>') + f"""
<body><div class="wrap">
<a class="k" href="/">Weekend Scout</a>
<h1 style="margin-top:6px">Things to do in {esc(c['name'])} this weekend</h1>
<p class="sub">{esc(w['label'])} · {len(d['events'])} hand-checked picks, {free} free · Updated {pretty(d['updated'])}</p>
<a class="cta" href="/?city={c['id']}">Open in the Weekend Scout app</a>
{''.join(body_days)}
<h2>Other cities</h2><div class="cities">{others}</div>
<footer>Times and prices can change, so check with the venue before you go. Some ticket links may earn us a small commission. · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a> · © ENDins LLC</footer>
</div></body></html>
"""
        os.makedirs(os.path.join(ROOT, c['id']), exist_ok=True)
        open(os.path.join(ROOT, c['id'], 'index.html'), 'w').write(page)
        urls.append(url)
        # one share page per event
        for e in d['events']:
            day = next((k for k in DAYS if e['times'].get(k)), None)
            dl = [k for k in DAYS if e['times'].get(k)]
            daytxt = (DAYNAME[dl[0]] if len(dl) == 1 else f"{DAYNAME[dl[0]][:3]}–{DAYNAME[dl[-1]][:3]}") + (f" {when(e, day)}" if day and when(e, day) != 'See times' else '')
            et = f"{e['title']} · {daytxt}"
            edesc = f"{e['venue']}, {c['name']}. {e.get('blurb', '')} {e['priceLabel']}."
            target = f"/?city={c['id']}#ev-{c['id']}--{e['id']}"
            p = head(f"{et} | Weekend Scout", edesc, f"{SITE}/e/{c['id']}/{e['id']}/", img,
                     f'<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url={target}"><script>location.replace({json.dumps(target)})</script>') + f"""
<body><div class="wrap"><a class="k" href="/">Weekend Scout</a><h1 style="margin-top:6px">{esc(e['title'])}</h1>
<p class="sub">{esc(daytxt)} · {esc(e['venue'])}</p><a class="cta" href="{target}">Open this event</a></div></body></html>
"""
            os.makedirs(os.path.join(ROOT, 'e', c['id'], e['id']), exist_ok=True)
            open(os.path.join(ROOT, 'e', c['id'], e['id'], 'index.html'), 'w').write(p)
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        f'  <url><loc>{u}</loc><changefreq>weekly</changefreq><priority>{"1.0" if u == SITE + "/" else "0.8"}</priority></url>\n' for u in urls) + \
        f'  <url><loc>{SITE}/privacy.html</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>\n  <url><loc>{SITE}/terms.html</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>\n</urlset>\n'
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write(sm)
    print(f'built {len(cities)} city pages, {sum(len(datas[c["id"]]["events"]) for c in cities)} event pages')

if __name__ == '__main__':
    main()
