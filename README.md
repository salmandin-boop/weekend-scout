# Weekend Scout

An installable web app (PWA) listing what's happening each weekend in cities across the US (15 now, growing to 50 by mid-December 2026). No build step, no dependencies.

| File | What it is |
|---|---|
| `index.html` | The whole app |
| `cities.json` | The list of cities. The city switcher appears once there are two or more |
| `events/<city>.json` | Each city's events for the coming weekend. These are the only files that change each week |
| `manifest.webmanifest` | App name, colors and icons for installing |
| `sw.js` | Offline support |
| `icons/` | App icons |
| `privacy.html` | Privacy policy (use its address in Google Play Console) |

## Updating the events each week

Replace each `events/<city>.json` with the new week's file (a scheduled task does this every Wednesday). The app picks it up the next time someone opens it, with no app-store update needed.

Each event looks like this:

```json
{
  "id": "unique-id-with-dashes",
  "title": "Event name",
  "cat": "music | sports | arts | food | family | comedy",
  "venue": "Venue name",
  "addr": "Street, City, NY ZIP",
  "price": "free | paid | check",
  "priceLabel": "Shown on the card, e.g. $20 or Free",
  "ages": "21+ (optional)",
  "blurb": "One or two sentences.",
  "link": { "label": "Get tickets", "url": "https://..." },
  "times": { "fri": [{ "s": "19:00" }], "sat": [{ "s": "10:00", "e": "16:00" }] },
  "tag": "Opens Friday (optional)",
  "good": ["date", "family", "friends", "indoors"],
  "featured": true,
  "sponsored": true
}
```

- `s` is the start time and `e` the optional end time, in 24-hour format. `"s": ""` means "see venue for hours".
- `good` lists what the event is good for: `date` (date night), `family` (family friendly), `friends` (a group outing), `indoors`, `outdoors`, `dogs` (dog friendly) and `access` (wheelchair accessible). Use any that fit; add `dogs` or `access` only when the venue or organizer says so. Optional `blurbEs` holds the Spanish blurb. Events marked 18+ or 21+ are never shown as family friendly.
- `featured: true` pins a paid listing to the top with a Sponsored badge. Max 3 per city per weekend: only the first 3 marked in the file count, and their order rotates per visitor. Only show on the days the event runs (automatic).
- `sponsored: true` marks the ticket link as an affiliate link.

## Adding a city

1. Add the city's events file, such as `events/miami.json`, in the same format.
2. Add a line for it in `cities.json`: `{ "id": "miami", "name": "Miami", "state": "FL", "file": "events/miami.json" }`.
3. Times in each file are local to that city. Give the city its time zone in `cities.json` (`"tz": "America/Chicago"`) so calendar links are right.

## Putting it online (free)

1. Create a GitHub account and a public repository named `weekend-scout`.
2. Upload every file in this folder (keep the `icons` folder).
3. Go to **Settings → Pages**, choose **Deploy from a branch**, then `main` and `/ (root)`.
4. The app goes live at `https://YOUR-NAME.github.io/weekend-scout/` within a few minutes.
5. To use weekendscout.app: in **Settings → Pages → Custom domain**, type `weekendscout.app` and save. At your domain company, add four **A** records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`, and a **CNAME** record for `www` pointing to `YOUR-NAME.github.io`. When GitHub shows the domain as working, tick **Enforce HTTPS**.
6. `SITE_URL` in `index.html` is already set to `https://weekendscout.app/` so shared links point there.

## Google Play ($25 one-time)

1. Open pwabuilder.com, enter your GitHub Pages address, and choose **Package for stores → Android**.
2. Download the package. It contains the `.aab` file to upload and an `assetlinks.json` file.
3. Put `assetlinks.json` in a `.well-known` folder in the repository. This removes the browser bar in the app.
4. Create a Google Play developer account ($25) and upload the `.aab`.
5. New personal accounts must run a closed test with 12 testers for 14 days before the app can go public.

## Apple App Store ($99 a year, later)

1. Use PWABuilder's **iOS** package and open it in Xcode on your Mac.
2. Apple rejects apps that are only a website in a frame (guideline 4.2). This app's offline mode, saved list, calendar and share features help, but approval isn't guaranteed.

## Weekly build steps (after updating events)

1. `python3 tools/build_pages.py` — rebuilds the city pages (`/austin/`), the share page for every event (`/e/<city>/<event>/`) and `sitemap.xml`.
2. `node tools/og.js` — rebuilds the link-preview image for each city (`og/<city>.jpg`). Needs Playwright.

## Switches in `config.json`

- `affiliates`: map a ticket site to its tracking-link template, for example `{"ticketmaster.com": "https://ticketmaster.evyy.net/c/PUBLISHER/AD/CAMPAIGN?u={url}"}`. Matching ticket links are converted automatically and marked sponsored.
- `newsletter.action`: the signup form URL from your email provider (for example Buttondown's embed URL). Empty hides the signup box.
- `analytics.plausibleDomain`: set to `weekendscout.app` once a Plausible account exists. Empty means no analytics at all.

## Paid restaurant partner for Date Night plans

Add to a city's events file: `"sponsors": [{"type": "dinner", "name": "Café Example", "url": "https://...", "addr": "123 Main St", "note": "10% off with Weekend Scout"}]`. It replaces the "Dinner nearby" step and is labeled Sponsored.

## Google Play switch (v1.8)
Once the Play listing is live, set `"playUrl": "https://play.google.com/store/apps/details?id=app.weekendscout"` in `config.json`.
Android web visitors then see a "Get it on Google Play" badge, and people using the Play app see a "Rate it on Google Play" link in About.
`IS_TWA` in index.html tells you when the page runs inside the Play Store app (use it to keep any card payment buttons out of the Android app).

## Holidays
`HOLI` in index.html lists US holidays through 2027. The header shows a holiday-weekend note when one falls Thu–Mon of the listed weekend. Add 2028 dates before the end of 2027.

## Featured listings and payments (v1.9)
- No price is shown in the app. Venues ask through Get listed; you quote and send a Stripe Payment Link after approval.
- Never put a Stripe payment link or price button inside the app's pages: the Play Store version must not take card payments (Google Play billing rules). Links go out by email only.
- When the first paid Featured listing goes live, change Play Console → App content → Ads to "Yes".

## Date night bundles (v1.10)
`spots/<city>.json` holds hand-picked date-night restaurants (`name, kind:"dinner", cuisine, area, lat, lon`).
Date night plans pair each date-friendly event with the nearest spot within 3 miles (plus 2 alternatives), with a "Book a table" (OpenTable search) and "Directions" link. With no spot nearby, the plan falls back to a Google Maps search near the venue.
The weekly update checks that every date-night event has at least 2 spots within 2 miles and adds verified, currently open ones when it doesn't.

## v1.11 additions
- **Bundles by filter:** Date night (dinner → event → nightcap), Kids (event + lunch), Groups (bite → event → drinks). They lead the list when that "Good for" filter is on.
- **spots/<city>.json kinds:** `dinner` (date night), `lunch` (kid-friendly food), `drinks` (bars for nightcaps and friends' nights), `always` (evergreen picks: `price`, `blurb` extra). The weekly update keeps them stocked.
- **Coming up:** optional `upcoming` array in events/<city>.json: `{title, date:"YYYY-MM-DD", venue, priceLabel, cat, url}` for notable events after this weekend (next ~6 weeks).
- **Under $25 filter:** uses optional `priceMin` (number) on an event, else free = 0, else the first $ amount in `priceLabel`.
- **Getting there:** optional `getThere` string on an event (parking, transit) shown in the event sheet.
- **Calendar feed:** `<city>/weekend.ics`, built by tools/build_pages.py. Subscribe links: webcal://weekendscout.app/<city>/weekend.ics
- **SEO pages:** `<city>/free/`, `<city>/date-night/`, `<city>/with-kids/` (built when 3+ events match). Deep links `/?city=x&cat=free` and `&good=date|family`.
- **Analytics:** set `analytics.cloudflareToken` in config.json (free Cloudflare Web Analytics, no cookies). When switched on, update privacy.html and the Play Console Data safety form (app activity: page views, collected, not shared, not linked to identity).
- **Social posts:** `node tools/social.js <outDir> [city,...]` makes a 7-slide 1080x1350 carousel + caption.txt per city (not committed).

## v1.13 additions
- **Español:** the ES/EN button switches the app's own words to Spanish (saved per phone; Spanish phones start in Spanish). The words live in `es.js`, loaded only in Spanish. Event names and venues stay as published; `blurbEs` on events and `always` spots gives the Spanish blurb (falls back to English).
- **Send:** the Send button shares the city's weekend list (native share sheet, or copies the link).
- **Dog friendly / Accessible:** `good` tags `dogs` and `access`, shown in the Filters sheet only when a city has them.
- **Cities:** 15 now, adding Rochester, Buffalo, Albany and Ithaca. The newer cities start with shorter lists (3+ events, verified only) plus "Always good" picks.

## Growing to 50 cities (v1.14)
- City picker has a search box once there are more than 12 cities (sorted A–Z, current city first).
- New metros are added by the weekly group tasks, about 9 a week through mid-December 2026: group B (from Nov 25) Washington, Miami, Atlanta, Boston, San Francisco, Seattle, Denver, Detroit, Minneapolis; group C (from Dec 2) Tampa, Baltimore, Orlando, Charlotte, St. Louis, Portland, Las Vegas, Nashville, Pittsburgh; group D (from Dec 9) Sacramento, San Jose, Cincinnati, Kansas City, Columbus, Indianapolis, Cleveland, New Orleans, Salt Lake City; group E (from Dec 16) Jacksonville, Milwaukee, Raleigh, Oklahoma City, Memphis, Richmond, Louisville, Providence.
- Each group task adds its cities to cities.json the first time (with events/ and spots/ files), then refreshes them every Wednesday. Tasks run at staggered times and must `git pull --rebase` before pushing.

## v1.15 additions
- **Friday reminder:** "Remind me on Fridays" (card under the list until switched on or dismissed, and in About). Installed Android app: a notification Friday morning (8 AM+, city time zone) with the count, free picks and a top pick, once per weekend. Elsewhere: a repeating Friday 9 AM calendar reminder file.
- **Email list:** set `newsletter.action` in config.json once an email account exists (e.g. Buttondown); the signup box then appears.
- **Holiday guides:** `guides/<city>.json` = {city, updated, source, guides:[{slug (christmas-lights|holiday-markets|new-years-eve), title ("Christmas lights"), icon, until (YYYY-MM-DD; hidden after), updated, intro, items:[{name, dates (text), venue, area, addr, lat, lon, price (free|paid|check), priceLabel, start?, end? (ISO, for Google), url (official), blurb, blurbEs, kids?}]}]}. build_pages.py makes /<city>/<slug>/ pages (in the sitemap, linked from the city page) and the app shows a "Holiday guides" section. Expired guides disappear automatically.

## v1.16 additions
- **Help us pick:** in Saved, "Help us pick" lets someone choose 2–4 saved events and send one link (`/?city=x&vote=id,id,id&by=Name`). Friends see the options side by side; "Vote for this" opens their share sheet (or copies) with a reply message to send back. No accounts or server.
- **Visiting pages:** `/<city>/visiting/` ("Visiting Buffalo this weekend?") built by build_pages.py from the events and spots files: a suggested Saturday (or Sunday) with a morning "always" pick, lunch, an afternoon event, dinner near the evening event, the evening event and a nightcap; then the best of the weekend and places worth seeing any time. The plan is only as good as spots/<city>.json: the weekly update keeps always/lunch/dinner/drinks stocked. Linked from the app ("Visiting X? See a one-day plan") and every city page.

## v1.17 additions
- **Now:** on Fri/Sat/Sun of the listed weekend a pulsing "Now" button appears next to Map. It shows only what's still ahead today (city time): events on now first (soonest-ending first), then by start time, with "Happening now" / "Starts in 40 min" badges refreshed every minute. When the day is done it offers "See <tomorrow>". Untimed listings (s:"") don't appear in Now.

## v1.18 additions (weekly updates: please follow)
- **Follow a venue:** "Follow venue" in an event's details; followed venues' events get a "★ Following" pill, sort first, and appear in a "From venues you follow" rail. Stored on the phone by venue name, so **keep venue names consistent week to week** (use the venue's own name, e.g. "Kleinhans Music Hall", not variants).
- **Kid age ranges:** optional `kidAges` on family events: any of `"toddler"` (0–4), `"kids"` (5–12), `"teens"` (13+). **Weekly updates: add `kidAges` to every event tagged `family`**, based on the organizer's stated ages or the obvious audience (a toddler story time → ["toddler"]; a Disney musical → ["kids","teens"]; a festival for everyone → all three). Leave it out if unclear. The Filters sheet shows a "Kids' ages" row when Good for: Kids (or Family type) is on and the city has tagged events.
- **Next weekend preview:** from Sunday 6 PM to the Wednesday update, the app shows "Early picks for next weekend" from `upcoming`. **Weekly updates: make sure `upcoming` includes 2–4 verified events on the FOLLOWING weekend (Fri–Sun one week after the listed weekend)** when any are announced, plus the usual notable events in the next ~6 weeks.
- **Budget picker:** date-night and friends plans can be limited to Free / Under $25 / Under $50 per person using `priceMin` (or the first $ in `priceLabel`). **Record `priceMin` whenever the official page states a lowest ticket price.**
- **Submit your event:** the promo button and `/?go=submit` open the listing form (pre-filled city); if no email app opens, the details appear in a box to copy. City pages link to it.

## Growing to 100 cities (Nov 24, 2026)
Cities 51–100 (Fort Worth through Burlington VT) were added by hand on Nov 24, 2026 for the Nov 27–29 weekend. They are **not yet covered by any weekly update task**, so their events go stale after Nov 29 unless a task is set up for them. They use the same schema; `kidAges`, `priceMin` and the venue-name rules from v1.18 apply. They have no `spots/` files yet (date-night bundles and "Visiting" pages fall back gracefully). A few "free" picks are evergreen free places (museums with free admission, parks) rather than dated events. Portland, Maine is `portland-me`; Columbia, SC is `columbia-sc`.
