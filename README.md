# Weekend Scout

An installable web app (PWA) listing what's happening each weekend in 11 US cities. No build step, no dependencies.

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
- `good` lists what the event is good for: `date` (date night), `family` (family friendly), `friends` (a group outing) and `indoors`. Use any that fit. Events marked 18+ or 21+ are never shown as family friendly.
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
