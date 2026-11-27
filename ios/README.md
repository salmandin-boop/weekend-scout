# Weekend Scout iPhone app

The iPhone app is a native shell around weekendscout.app (built from PWABuilder's iOS package) plus
`WeekendScoutBridge.swift`, which gives the app real iPhone features the website can't:

- **Apple Calendar**: add one event (Apple's own editor) or all saved events at once.
- **Friday 9 AM reminder**: a weekly local notification for the chosen city, no server needed.
- **Haptics** when saving events.
- **Location** for "Nearest first" (system permission in the app's name).

Setup in Xcode:
1. Add `WeekendScoutBridge.swift` to the app target.
2. Where the app creates its WKWebView (in the view controller), call
   `WeekendScoutBridge.shared.attach(to: webView, presenter: self)` after the web view is created.
3. Info.plist keys:
   - `NSCalendarsWriteOnlyAccessUsageDescription`: "Weekend Scout adds the events you pick to your calendar."
   - `NSCalendarsUsageDescription`: same text (older iOS).
   - `NSLocationWhenInUseUsageDescription`: "Weekend Scout uses your location to show the nearest events first."
4. Bundle ID `app.weekendscout`, team ENDins LLC.

The web app only sends these messages when it runs inside the iPhone app; the website and Android app are unaffected.
