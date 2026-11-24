#!/usr/bin/env python3
"""Builds Weekend Scout's static pages from cities.json and events/*.json.

Run from the repo root after every change to events/*.json:
    python3 tools/build_pages.py            # pages + sitemap
    node tools/og.js                        # preview images (needs Playwright)

Outputs:
  <city>/index.html          a Google-friendly page per city ("Things to do in Austin this weekend")
  <city>/free/, /date-night/, /with-kids/   the same page filtered (built when 3+ events match)
  <city>/<guide>/            seasonal guides from guides/<city>.json (Christmas lights, holiday markets, New Year's Eve)
  <city>/weekend.ics         calendar feed of this weekend's picks (subscribe once, refreshes weekly)
  e/<city>/<event>/index.html  a share page per event, so shared links preview with the event's name and day
  sitemap.xml
"""
import json, os, re, shutil, html
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

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
footer{margin-top:36px;color:var(--muted);font-size:.85rem}footer a{color:inherit}
div.ev a{color:var(--accent);font-weight:700}"""

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

VARIANTS = [
    ('', None, 'Things to do in {city} this weekend', '{n} hand-checked things to do in {cname} this weekend, {label}: concerts, games, markets, museums and family events. {free} are free.'),
    ('free', lambda e: e['price'] == 'free', 'Free things to do in {city} this weekend', '{n} free things to do in {cname} this weekend, {label}: free concerts, markets, museums, lights and outdoor events, hand-checked.'),
    ('date-night', lambda e: 'date' in (e.get('good') or []), 'Date night ideas in {city} this weekend', '{n} date night ideas in {cname} this weekend, {label}: shows, concerts, lights and food events, with ready-made dinner plans.'),
    ('with-kids', lambda e: 'family' in (e.get('good') or []) and not e.get('ages'), 'Things to do with kids in {city} this weekend', '{n} kid-friendly things to do in {cname} this weekend, {label}: family shows, lights, museums and outdoor fun.'),
]
VLABEL = {'': 'Everything', 'free': 'Free', 'date-night': 'Date night', 'with-kids': 'With kids'}

def ics_text(s):
    return str(s or '').replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,').replace('\n', '\\n')

def ics_fold(line):
    out, b = [], line.encode('utf-8')
    while len(b) > 74:
        cut = 74
        while (b[cut] & 0xC0) == 0x80: cut -= 1
        out.append(b[:cut].decode('utf-8')); b = b[cut:]
    out.append(b.decode('utf-8'))
    return '\r\n '.join(out)

def build_ics(c, d):
    tz = ZoneInfo(c.get('tz') or 'America/New_York'); w = d['weekend']; stamp = datetime.now(ZoneInfo('UTC')).strftime('%Y%m%dT%H%M%SZ')
    L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Weekend Scout//weekendscout.app//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
         f"X-WR-CALNAME:Weekend Scout · {c['name']}", f"X-WR-CALDESC:Hand-checked weekend picks in {c['name']}, updated every Wednesday", 'REFRESH-INTERVAL;VALUE=DURATION:P1D', 'X-PUBLISHED-TTL:P1D']
    for e in d['events']:
        for day in DAYS:
            for i, ss in enumerate(e['times'].get(day) or []):
                iso = w['days'][day]; uid = f"{c['id']}-{e['id']}-{day}-{i}@weekendscout.app"
                L += ['BEGIN:VEVENT', f'UID:{uid}', f'DTSTAMP:{stamp}']
                if ss.get('s'):
                    st = datetime.fromisoformat(f"{iso}T{ss['s']}").replace(tzinfo=tz)
                    en = datetime.fromisoformat(f"{iso}T{ss['e']}").replace(tzinfo=tz) if ss.get('e') else st + timedelta(hours=2)
                    if en <= st: en += timedelta(days=1)
                    L += [f"DTSTART:{st.astimezone(ZoneInfo('UTC')).strftime('%Y%m%dT%H%M%SZ')}", f"DTEND:{en.astimezone(ZoneInfo('UTC')).strftime('%Y%m%dT%H%M%SZ')}"]
                else:
                    nd = (date.fromisoformat(iso) + timedelta(days=1)).strftime('%Y%m%d')
                    L += [f"DTSTART;VALUE=DATE:{iso.replace('-', '')}", f'DTEND;VALUE=DATE:{nd}', 'TRANSP:TRANSPARENT']
                desc = f"{e.get('blurb', '')} {e.get('priceLabel', '')}. Details: {SITE}/e/{c['id']}/{e['id']}/"
                L += [ics_fold('SUMMARY:' + ics_text(e['title'])), ics_fold('LOCATION:' + ics_text(f"{e['venue']}, {e['addr']}")),
                      ics_fold('DESCRIPTION:' + ics_text(desc.strip())), f"URL:{SITE}/e/{c['id']}/{e['id']}/", 'END:VEVENT']
    L.append('END:VCALENDAR')
    return '\r\n'.join(L) + '\r\n'

GUIDE_SLUGS = ['christmas-lights', 'holiday-markets', 'new-years-eve']  # folders this tool owns; stale ones are removed

def load_guides(c):
    p = os.path.join(ROOT, 'guides', c['id'] + '.json')
    if not os.path.exists(p): return []
    today = date.today().isoformat()
    g = json.load(open(p)).get('guides') or []
    return [x for x in g if x.get('slug') and x.get('title') and x.get('items') and not (x.get('until') and x['until'] < today)]

def build_guides(c, guides, all_guides, img):
    urls = []
    for g in guides:
        url = f"{SITE}/{c['id']}/{g['slug']}/"
        year = (g.get('until') or date.today().isoformat())[:4]
        h1 = f"{g['title']} in {c['name']}"
        title = f"{h1} {year} · Weekend Scout"
        free = sum(1 for it in g['items'] if it.get('price') == 'free')
        desc = g.get('intro') or f"{len(g['items'])} hand-checked {g['title'].lower()} in {c['name']}, {c['state']}, with dates, hours and prices."
        cards, ld = [], []
        for i, it in enumerate(g['items']):
            pill = f'<span class="pill free">{esc(it.get("priceLabel") or "Free")}</span>' if it.get('price') == 'free' else f'<span class="pill">{esc(it.get("priceLabel") or "Tickets")}</span>'
            maps = 'https://www.google.com/maps/search/?api=1&query=' + html.escape(re.sub(r'\s+', '+', f"{it.get('venue') or it['name']} {it.get('addr') or ''}".strip()), quote=True)
            links = (f'<a href="{esc(it["url"])}" rel="noopener">Official site</a>' if it.get('url') else '') + f' · <a href="{maps}" rel="noopener">Map</a>'
            cards.append(f'<div class="ev" style="grid-template-columns:1fr"><span><span class="t">{esc(it.get("dates", ""))}</span><h3 style="margin-top:4px">{esc(it["name"])}</h3>'
                         f'<p>{esc(", ".join(x for x in [it.get("venue"), it.get("area")] if x))}</p><p>{esc(it.get("blurb", ""))}</p>{pill}{"<span class=\"pill\">Good with kids</span>" if it.get("kids") else ""}<p style="margin-top:8px">{links}</p></span></div>')
            ev = {'@type': 'Event', 'name': it['name'], 'eventStatus': 'https://schema.org/EventScheduled', 'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
                  'location': {'@type': 'Place', 'name': it.get('venue') or it['name'], 'address': it.get('addr', '')}, 'description': it.get('blurb', '')}
            if it.get('start'): ev['startDate'] = it['start']
            if it.get('end'): ev['endDate'] = it['end']
            if it.get('url'): ev['url'] = it['url']
            if it.get('price') == 'free': ev['offers'] = {'@type': 'Offer', 'price': 0, 'priceCurrency': 'USD', 'url': it.get('url', url)}
            ld.append({'@type': 'ListItem', 'position': i + 1, 'item': ev if it.get('start') else {'@type': 'Thing', 'name': it['name'], 'description': it.get('blurb', '')}})
        ldj = json.dumps({'@context': 'https://schema.org', '@type': 'ItemList', 'name': h1, 'itemListElement': ld}, ensure_ascii=False).replace('</', '<\\/')
        mine = ''.join(f'<a href="/{c["id"]}/{x["slug"]}/"{" aria-current=\"page\"" if x["slug"] == g["slug"] else ""}>{esc(x.get("icon", ""))} {esc(x["title"])}</a>' for x in guides)
        others = ''.join(f'<a href="/{oid}/{g["slug"]}/">{esc(oname)}</a>' for oid, oname, ogs in all_guides if oid != c['id'] and any(x['slug'] == g['slug'] for x in ogs))
        page = head(title, desc, url, img, f'<script type="application/ld+json">{ldj}</script>') + f"""
<body><div class="wrap">
<a class="k" href="/{c['id']}/">Weekend Scout · {esc(c['name'])}</a>
<h1 style="margin-top:6px">{esc(g.get('icon', ''))} {esc(h1)}</h1>
<p class="sub">{len(g['items'])} hand-checked picks{f', {free} free' if free else ''} · Updated {pretty(g.get('updated') or date.today().isoformat())}</p>
{f'<p>{esc(g["intro"])}</p>' if g.get('intro') else ''}
<div class="cities">{mine}</div>
<a class="cta" href="/?city={c['id']}">See this weekend in {esc(c['name'])}</a>
{''.join(cards)}
{f'<h2>{esc(g["title"])} in other cities</h2><div class="cities">{others}</div>' if others else ''}
<footer>Dates, hours and prices can change, so check the official site before you go. · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a> · © ENDins LLC</footer>
</div></body></html>
"""
        dirp = os.path.join(ROOT, c['id'], g['slug']); os.makedirs(dirp, exist_ok=True)
        open(os.path.join(dirp, 'index.html'), 'w').write(page)
        urls.append(url)
    for slug in GUIDE_SLUGS:
        if not any(x['slug'] == slug for x in guides): shutil.rmtree(os.path.join(ROOT, c['id'], slug), ignore_errors=True)
    return urls

def main():
    cities = json.load(open(os.path.join(ROOT, 'cities.json')))['cities']
    datas = {c['id']: json.load(open(os.path.join(ROOT, c['file']))) for c in cities}
    # wipe generated folders so old weekends disappear
    shutil.rmtree(os.path.join(ROOT, 'e'), ignore_errors=True)
    urls = [f'{SITE}/']
    guides = {c['id']: load_guides(c) for c in cities}
    all_guides = [(c['id'], c['name'], guides[c['id']]) for c in cities]
    for c in cities:
        d = datas[c['id']]; w = d['weekend']; cname = f"{c['name']}, {c['state']}"
        img = f"{SITE}/og/{c['id']}.jpg"
        feat = set([e['id'] for e in d['events'] if e.get('featured')][:3])  # max 3 Featured spots per city per weekend
        made = [v for v in VARIANTS if v[1] is None or sum(1 for e in d['events'] if v[1](e)) >= 3]
        for slug, test, h1t, desct in made:
            evs_all = [e for e in d['events'] if test is None or test(e)]
            url = f"{SITE}/{c['id']}/" + (f"{slug}/" if slug else '')
            free = sum(1 for e in evs_all if e['price'] == 'free')
            h1 = h1t.format(city=c['name'])
            title = f"{h1} ({w['label']}) · Weekend Scout"
            desc = desct.format(n=len(evs_all), cname=cname, label=w['label'], free=free)
            items = []
            body_days = []
            for day in DAYS:
                evs = [e for e in evs_all if e['times'].get(day)]
                if not evs: continue
                evs.sort(key=lambda e: (0 if e['id'] in feat else 1, (e['times'][day][0].get('s') or '99:99')))
                cards = []
                for e in evs:
                    share = f"/e/{c['id']}/{e['id']}/"
                    pills = (f'<span class="pill free">{esc(e["priceLabel"])}</span>' if e['price'] == 'free' else f'<span class="pill">{esc(e["priceLabel"])}</span>') + f'<span class="pill">{esc(CAT.get(e["cat"], e["cat"]))}</span>' + (f'<span class="pill">Sponsored</span>' if e['id'] in feat else '')
                    cards.append(f'<a class="ev" href="{share}"><span class="t">{esc(DAYNAME[day][:3])} · {esc(when(e, day))}</span><span><h3>{esc(e["title"])}</h3><p>{esc(e["venue"])}</p>{pills}</span></a>')
                body_days.append(f'<h2>{DAYNAME[day]}, {pretty(w["days"][day], True)}</h2>' + ''.join(cards))
            for i, e in enumerate(evs_all):
                day = next((k for k in DAYS if e['times'].get(k)), None)
                if not day: continue
                s0 = e['times'][day][0].get('s', '')
                it = {'@type': 'Event', 'name': e['title'], 'startDate': iso_start(w['days'][day], s0), 'eventStatus': 'https://schema.org/EventScheduled',
                      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode', 'location': {'@type': 'Place', 'name': e['venue'], 'address': e['addr']},
                      'description': e.get('blurb', ''), 'url': f"{SITE}/e/{c['id']}/{e['id']}/"}
                if e.get('link'): it['offers'] = {'@type': 'Offer', 'url': e['link']['url'], 'availability': 'https://schema.org/InStock', **({'price': 0, 'priceCurrency': 'USD'} if e['price'] == 'free' else {})}
                items.append({'@type': 'ListItem', 'position': i + 1, 'item': it})
            ld = json.dumps({'@context': 'https://schema.org', '@type': 'ItemList', 'name': f"{h1}", 'itemListElement': items}, ensure_ascii=False).replace('</', '<\\/')
            others = ''.join(f'<a href="/{o["id"]}/{slug + "/" if slug else ""}">{esc(o["name"])}</a>' for o in cities if o['id'] != c['id'])
            tabs = ''.join(f'<a href="/{c["id"]}/{v[0] + "/" if v[0] else ""}"{" aria-current=\"page\"" if v[0] == slug else ""}>{esc(VLABEL[v[0]])}</a>' for v in made)
            app = f"/?city={c['id']}" + {'free': '&cat=free', 'date-night': '&good=date', 'with-kids': '&good=family'}.get(slug, '')
            page = head(title, desc, url, img, f'<script type="application/ld+json">{ld}</script>') + f"""
<body><div class="wrap">
<a class="k" href="/">Weekend Scout</a>
<h1 style="margin-top:6px">{esc(h1)}</h1>
<p class="sub">{esc(w['label'])} · {len(evs_all)} hand-checked picks, {free} free · Updated {pretty(d['updated'])}</p>
<div class="cities">{tabs}</div>
<a class="cta" href="{app}">Open in the Weekend Scout app</a>
{''.join(body_days)}
{('<h2>Holiday guides</h2><div class="cities">' + ''.join(f'<a href="/{c["id"]}/{x["slug"]}/">{esc(x.get("icon", ""))} {esc(x["title"])}</a>' for x in guides[c['id']]) + '</div>') if guides[c['id']] else ''}
<h2>Get these in your calendar</h2><p class="sub">Subscribe once and every weekend's picks for {esc(c['name'])} show up automatically: <a href="webcal://weekendscout.app/{c['id']}/weekend.ics">Apple / Outlook</a> · <a href="https://calendar.google.com/calendar/r?cid={esc('webcal://weekendscout.app/' + c['id'] + '/weekend.ics')}">Google Calendar</a></p>
<h2>Other cities</h2><div class="cities">{others}</div>
<footer>Times and prices can change, so check with the venue before you go. Some ticket links may earn us a small commission. · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a> · © ENDins LLC</footer>
</div></body></html>
"""
            dirp = os.path.join(ROOT, c['id'], slug) if slug else os.path.join(ROOT, c['id'])
            os.makedirs(dirp, exist_ok=True)
            open(os.path.join(dirp, 'index.html'), 'w').write(page)
            urls.append(url)
        # stale variant folders (fewer than 3 matches this week) are removed
        for v in VARIANTS:
            if v[0] and v not in made: shutil.rmtree(os.path.join(ROOT, c['id'], v[0]), ignore_errors=True)
        open(os.path.join(ROOT, c['id'], 'weekend.ics'), 'w', newline='').write(build_ics(c, d))
        urls += build_guides(c, guides[c['id']], all_guides, img)
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
    print(f'built {len(cities)} city pages, {sum(len(datas[c["id"]]["events"]) for c in cities)} event pages, {sum(len(v) for v in guides.values())} guide pages')

if __name__ == '__main__':
    main()
