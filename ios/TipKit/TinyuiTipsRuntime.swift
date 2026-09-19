import TipKit
import UIKit

/// Shared across RN surfaces and Fast Refresh. TipKit's datastore owns history.
@MainActor
@objc public final class TinyuiTipsRuntime: NSObject {
  static let shared = TinyuiTipsRuntime()

  private final class WeakProvider {
    weak var value: TinyuiTipPopoverProvider?
    init(_ value: TinyuiTipPopoverProvider) { self.value = value }
  }

  private var frequency: String?
  private var providers: [WeakProvider] = []
  private var timer: Timer?
  private var updateScheduled = false
  private var knownTips: [String: TinyuiTip] = [:]
  // Keep an in-flight presentation alive long enough to dismiss it even if
  // Fabric unmounts/recycles its owning component during the animation.
  var activeProvider: TinyuiTipPopoverProvider?

  private override init() {
    super.init()
    NotificationCenter.default.addObserver(self, selector: #selector(applicationStateChanged), name: UIApplication.didBecomeActiveNotification, object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(applicationStateChanged), name: UIApplication.willResignActiveNotification, object: nil)
  }

  @objc private func applicationStateChanged() { requestUpdate() }

  var isConfigured: Bool { frequency != nil }

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
    shared.requestUpdate()
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
    requestUpdate()
  }

  static func error(_ code: String, _ message: String) -> NSError {
    NSError(domain: "TinyuiTips", code: 1, userInfo: [
      NSLocalizedDescriptionKey: message,
      "code": code,
    ])
  }

  func register(_ provider: TinyuiTipPopoverProvider) {
    providers.removeAll { $0.value == nil }
    if !providers.contains(where: { $0.value === provider }) {
      providers.append(WeakProvider(provider))
    }
    requestUpdate()
  }

  func unregister(_ provider: TinyuiTipPopoverProvider) {
    providers.removeAll { $0.value == nil || $0.value === provider }
    requestUpdate()
  }

  func remember(_ tip: TinyuiTip) throws {
    if let previous = knownTips[tip.id],
       previous.maximumDisplayCount != tip.maximumDisplayCount || previous.ignoresFrequency != tip.ignoresFrequency {
      throw Self.error("E_CONFLICTING_TIP_OPTIONS", "maxDisplayCount and ignoresDisplayFrequency must remain consistent for the same tipId.")
    }
    knownTips[tip.id] = tip
  }

  func release(_ provider: TinyuiTipPopoverProvider) {
    if activeProvider === provider { activeProvider = nil }
    requestUpdate()
  }

  func requestUpdate() {
    guard !updateScheduled else { return }
    updateScheduled = true
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      self.updateScheduled = false
      self.update()
    }
  }

  private func update() {
    providers.removeAll { $0.value == nil }
    // Finish dismissing an old presentation before offering its slot to another.
    activeProvider?.updatePresentation()
    for provider in providers.compactMap(\.value) where provider !== activeProvider {
      provider.updatePresentation()
    }

    // UIKit has no single notification for an anchor being scrolled offscreen,
    // a navigation transition ending, or another modal being dismissed. Poll
    // only while a tip is eligible/on screen; idle or disabled tips do no work.
    let needsMonitoring = activeProvider != nil || providers.contains { $0.value?.needsMonitoring == true }
    if needsMonitoring && timer == nil {
      let timer = Timer(timeInterval: 0.25, repeats: true) { [weak self] _ in
        Task { @MainActor [weak self] in self?.update() }
      }
      timer.tolerance = 0.05
      RunLoop.main.add(timer, forMode: .common)
      self.timer = timer
    } else if !needsMonitoring {
      timer?.invalidate()
      timer = nil
    }
  }
}
