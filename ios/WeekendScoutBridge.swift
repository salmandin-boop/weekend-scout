// Weekend Scout: native features for the iPhone app.
// The web app (weekendscout.app) posts messages to window.webkit.messageHandlers.ws:
//   { type: "haptic",   kind: "light" | "success" }
//   { type: "calendar", events: [{ id, title, start (ISO 8601), end, location, notes, url }] }
//   { type: "reminder", city: "syracuse", name: "Syracuse" }
// Register once on the WKWebView's configuration:
//   WeekendScoutBridge.shared.attach(to: webView, presenter: viewController)
// Info.plist needs: NSCalendarsWriteOnlyAccessUsageDescription,
// NSLocationWhenInUseUsageDescription (for "Nearest first").

import UIKit
import WebKit
import EventKit
import EventKitUI
import UserNotifications

final class WeekendScoutBridge: NSObject, WKScriptMessageHandler, EKEventEditViewDelegate {
    static let shared = WeekendScoutBridge()
    private let store = EKEventStore()
    private weak var presenter: UIViewController?

    func attach(to webView: WKWebView, presenter: UIViewController) {
        self.presenter = presenter
        let ucc = webView.configuration.userContentController
        ucc.removeScriptMessageHandler(forName: "ws")
        ucc.add(self, name: "ws")
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        DispatchQueue.main.async {
            switch type {
            case "haptic": self.haptic(body["kind"] as? String)
            case "calendar": self.addToCalendar(body["events"] as? [[String: Any]] ?? [])
            case "reminder": self.scheduleFridayReminder(cityId: body["city"] as? String ?? "", cityName: body["name"] as? String ?? "your city")
            default: break
            }
        }
    }

    // MARK: Haptics
    private func haptic(_ kind: String?) {
        if kind == "success" { UINotificationFeedbackGenerator().notificationOccurred(.success) }
        else { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    }

    // MARK: Apple Calendar
    private static let iso: ISO8601DateFormatter = { let f = ISO8601DateFormatter(); f.formatOptions = [.withInternetDateTime]; return f }()

    private func makeEvent(_ d: [String: Any]) -> EKEvent? {
        guard let title = d["title"] as? String,
              let s = d["start"] as? String, let start = Self.iso.date(from: s) else { return nil }
        let e = EKEvent(eventStore: store)
        e.title = title
        e.startDate = start
        e.endDate = (d["end"] as? String).flatMap { Self.iso.date(from: $0) } ?? start.addingTimeInterval(7200)
        e.location = d["location"] as? String
        e.notes = d["notes"] as? String
        if let u = d["url"] as? String, let url = URL(string: u), url.scheme == "https" { e.url = url }
        e.calendar = store.defaultCalendarForNewEvents
        return e
    }

    private func addToCalendar(_ items: [[String: Any]]) {
        let events = items.compactMap(makeEvent)
        guard !events.isEmpty else { return }
        if events.count == 1 {
            // One event: show Apple's own editor, which needs no calendar permission.
            let vc = EKEventEditViewController()
            vc.eventStore = store
            vc.event = events[0]
            vc.editViewDelegate = self
            presenter?.present(vc, animated: true)
            return
        }
        // Several saved events: ask once for write access, then add them all.
        let save: () -> Void = {
            var added = 0
            for e in events {
                e.calendar = self.store.defaultCalendarForNewEvents
                if (try? self.store.save(e, span: .thisEvent, commit: false)) != nil { added += 1 }
            }
            try? self.store.commit()
            self.toast(added > 0 ? "Added \(added) events to your calendar" : "Couldn't add to your calendar")
        }
        let done: (Bool, Error?) -> Void = { granted, _ in
            DispatchQueue.main.async { granted ? save() : self.toast("Allow calendar access in Settings to add events") }
        }
        if #available(iOS 17.0, *) { store.requestWriteOnlyAccessToEvents(completion: done) }
        else { store.requestAccess(to: .event, completion: done) }
    }

    func eventEditViewController(_ controller: EKEventEditViewController, didCompleteWith action: EKEventEditViewAction) {
        controller.dismiss(animated: true)
        if action == .saved { haptic("success") }
    }

    // MARK: Friday 9 AM reminder (local notification, no server needed)
    private func scheduleFridayReminder(cityId: String, cityName: String) {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound]) { granted, _ in
            guard granted else { DispatchQueue.main.async { self.toast("Allow notifications in Settings to get reminders") }; return }
            let content = UNMutableNotificationContent()
            content.title = "This weekend in \(cityName)"
            content.body = "Your hand-checked picks are ready: concerts, games, markets and free things to do."
            content.sound = .default
            content.userInfo = ["url": "https://weekendscout.app/?city=\(cityId)"]
            var when = DateComponents(); when.weekday = 6; when.hour = 9; when.minute = 0 // Friday 9:00 local time
            let trigger = UNCalendarNotificationTrigger(dateMatching: when, repeats: true)
            let req = UNNotificationRequest(identifier: "ws-friday", content: content, trigger: trigger)
            center.removePendingNotificationRequests(withIdentifiers: ["ws-friday"])
            center.add(req)
        }
    }

    // MARK: Small on-screen message
    private func toast(_ text: String) {
        guard let view = presenter?.view else { return }
        let label = PaddedLabel()
        label.text = text
        label.textColor = .white
        label.backgroundColor = UIColor(white: 0.1, alpha: 0.9)
        label.font = .preferredFont(forTextStyle: .subheadline)
        label.numberOfLines = 0
        label.textAlignment = .center
        label.layer.cornerRadius = 12
        label.clipsToBounds = true
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -24),
            label.widthAnchor.constraint(lessThanOrEqualTo: view.widthAnchor, constant: -48)
        ])
        UIView.animate(withDuration: 0.3, delay: 2.2, options: [], animations: { label.alpha = 0 }) { _ in label.removeFromSuperview() }
    }
}

private final class PaddedLabel: UILabel {
    override func drawText(in rect: CGRect) { super.drawText(in: rect.inset(by: UIEdgeInsets(top: 10, left: 16, bottom: 10, right: 16))) }
    override var intrinsicContentSize: CGSize { let s = super.intrinsicContentSize; return CGSize(width: s.width + 32, height: s.height + 20) }
}
