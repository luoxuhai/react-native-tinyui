import TipKit
import Foundation

/// Shared across RN surfaces and Fast Refresh. TipKit's datastore owns history.
@MainActor
@objc public final class TinyuiTipsRuntime: NSObject {
  static let shared = TinyuiTipsRuntime()

  private var frequency: String?
  private var knownTips: [String: TinyuiTip] = [:]

  private override init() { super.init() }

  var isConfigured: Bool { frequency != nil }

  @objc public static func resetDatastore(_ completion: (NSError?) -> Void) {
    guard !shared.isConfigured else {
      completion(error("E_TIPS_ALREADY_CONFIGURED", "Call and await TipKit.resetDatastore() before TipKit.configure(). Restart the app process to reset after configuration; Fast Refresh is not sufficient."))
      return
    }
    do {
      try Tips.resetDatastore()
      shared.knownTips.removeAll()
      completion(nil)
    } catch {
      completion(error as NSError)
    }
  }

  @objc public static func configure(_ frequency: String, completion: (NSError?) -> Void) {
    do {
      try shared.configure(frequency)
      completion(nil)
    } catch {
      completion(error as NSError)
    }
  }

  @objc public static func invalidate(_ tipId: String, reason: String, completion: (NSError?) -> Void) {
    guard shared.isConfigured else {
      completion(error("E_TIPS_NOT_CONFIGURED", "Call and await TipKit.configure() before invalidating a tip."))
      return
    }
    guard !tipId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
          reason == "actionPerformed" || reason == "tipClosed" else {
      completion(error("E_INVALID_TIP", "A nonempty tipId and a supported invalidation reason are required."))
      return
    }
    // Tip identity is independent of its view or Swift type. This also works
    // before the tip mounts, when the feature is discovered without a tip.
    let tip = shared.knownTips[tipId] ?? TinyuiTip(id: tipId)
    tip.invalidate(reason: reason == "tipClosed" ? .tipClosed : .actionPerformed)
    completion(nil)
  }

  private func configure(_ frequency: String) throws {
    if let configuredFrequency = self.frequency {
      guard configuredFrequency == frequency else {
        throw Self.error("E_TIPS_ALREADY_CONFIGURED", "TipKit is already configured with a different displayFrequency. Configure it once at app startup.")
      }
      return
    }
    let nativeFrequency: Tips.ConfigurationOption.DisplayFrequency
    switch frequency {
    case "immediate": nativeFrequency = .immediate
    case "hourly": nativeFrequency = .hourly
    case "daily": nativeFrequency = .daily
    case "weekly": nativeFrequency = .weekly
    case "monthly": nativeFrequency = .monthly
    default: throw Self.error("E_INVALID_TIPS_CONFIGURATION", "Unsupported displayFrequency.")
    }
    try Tips.configure([.displayFrequency(nativeFrequency)])
    self.frequency = frequency
  }

  static func error(_ code: String, _ message: String) -> NSError {
    NSError(domain: "TinyuiTips", code: 1, userInfo: [
      NSLocalizedDescriptionKey: message,
      "code": code,
    ])
  }

  static func invalidationReason(_ reason: Tips.InvalidationReason) -> String {
    if #available(iOS 18.0, *), reason == .displayDurationExceeded {
      return "displayDurationExceeded"
    }
    switch reason {
    case .actionPerformed: return "actionPerformed"
    case .tipClosed: return "tipClosed"
    case .displayCountExceeded: return "displayCountExceeded"
    default: return "unknown"
    }
  }

  func remember(_ tip: TinyuiTip) throws {
    if let previous = knownTips[tip.id],
       previous.maximumDisplayCount != tip.maximumDisplayCount || previous.ignoresFrequency != tip.ignoresFrequency {
      throw Self.error("E_CONFLICTING_TIP_OPTIONS", "maxDisplayCount and ignoresDisplayFrequency must remain consistent for the same tipId.")
    }
    knownTips[tip.id] = tip
  }
}
