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
- `featured: true` pins a paid listing to the top with a Featured badge.
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
