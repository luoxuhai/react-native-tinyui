import TipKit
import UIKit

@objc public protocol TinyuiTipPopoverDelegate: AnyObject {
  func onTipStatus(tipId: String, status: String, reason: String)
  func onTipVisible(tipId: String, visible: Bool)
  func onTipAction(tipId: String, id: String, title: String)
  func onTipError(tipId: String, code: String, message: String)
}

@MainActor
@objc public final class TinyuiTipPopoverProvider: UIView, UIPopoverPresentationControllerDelegate {
  private weak var delegate: TinyuiTipPopoverDelegate?
  @objc public weak var parentViewController: UIViewController? {
    didSet { TinyuiTipsRuntime.shared.requestUpdate() }
  }
  private var tip: TinyuiTip?
  private var enabled = false
  private var arrowEdge = "auto"
  private var observation: Task<Void, Never>?
  private var observationGeneration = 0
  private var status: Tips.Status?
  private var lastError: String?
  private var suppressed = false
  private var controller: TipUIPopoverViewController?
  private var presentedTipId: String?
  private var isPresenting = false
  private var isDismissing = false
  private var reportedVisible = false

  @objc public convenience init(delegate: TinyuiTipPopoverDelegate) {
    self.init(frame: .zero)
    self.delegate = delegate
  }

  @objc public func configure(_ configuration: [String: Any], enabled: Bool, arrowEdge: String) {
    let nextTip = TinyuiTip(
      id: configuration["tipId"] as? String ?? "",
      titleString: configuration["title"] as? String ?? "",
      messageString: configuration["message"] as? String ?? "",
      symbolName: configuration["systemImage"] as? String ?? "",
      actionContents: (configuration["actions"] as? [[String: String]] ?? []).map {
        TinyuiTip.ActionContent(id: $0["id"] ?? "", title: $0["title"] ?? "")
      },
      maximumDisplayCount: configuration["maxDisplayCount"] as? Int ?? 0,
      ignoresFrequency: configuration["ignoresDisplayFrequency"] as? Bool ?? false
    )
    if tip?.id != nextTip.id {
      stopObservation()
      status = nil
      lastError = nil
      suppressed = false
    }
    if !self.enabled && enabled { suppressed = false }
    tip = nextTip
    self.enabled = enabled
    self.arrowEdge = arrowEdge
    TinyuiTipsRuntime.shared.requestUpdate()
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil {
      stopObservation()
      dismissTip()
      TinyuiTipsRuntime.shared.unregister(self)
    } else {
      TinyuiTipsRuntime.shared.register(self)
    }
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    configureArrow()
    TinyuiTipsRuntime.shared.requestUpdate()
  }

  var needsMonitoring: Bool {
    window?.windowScene?.activationState == .foregroundActive &&
      enabled && status == .available && !suppressed && lastError == nil
  }

  func updatePresentation() {
    let runtime = TinyuiTipsRuntime.shared
    guard let tip else { dismissTip(); return }
    guard window != nil, runtime.isConfigured else {
      if window != nil && enabled && !runtime.isConfigured {
        reportError("E_TIPS_NOT_CONFIGURED", "Call and await TipKit.configure() before displaying tips.")
      }
      dismissTip()
      return
    }
    do {
      try runtime.remember(tip)
      lastError = nil
    } catch {
      let error = error as NSError
      reportError(error.userInfo["code"] as? String ?? "E_TIP", error.localizedDescription)
      dismissTip()
      return
    }
    startObservation(tip)

    if let controller, !isPresenting, !isDismissing, controller.presentingViewController == nil {
      // Dismissal may originate inside TipKit rather than through the delegate.
      suppressed = true
      finishDismissal(controller)
      return
    }
    let presenter = eligiblePresenter()
    guard enabled, status == .available, !suppressed, presenter != nil,
          presentedTipId == nil || presentedTipId == tip.id else {
      dismissTip()
      return
    }
    guard controller == nil, runtime.activeProvider == nil, let presenter else { return }
    runtime.activeProvider = self
    let tipController = TipUIPopoverViewController(tip, sourceItem: self) { [weak self] action in
      guard let self, self.tip?.id == tip.id,
            let content = tip.actionContents.first(where: { $0.id == action.id }) else { return }
      self.delegate?.onTipAction(tipId: tip.id, id: content.id, title: content.title)
    }
    tipController.presentationDelegate = self
    controller = tipController
    presentedTipId = tip.id
    configureArrow()
    isPresenting = true
    presenter.present(tipController, animated: true) { [weak self, weak tipController] in
      guard let self, let tipController, self.controller === tipController else { return }
      self.isPresenting = false
      if tipController.presentingViewController != nil {
        self.reportedVisible = true
        self.delegate?.onTipVisible(tipId: tip.id, visible: true)
      }
      TinyuiTipsRuntime.shared.requestUpdate()
    }
  }

  private func startObservation(_ tip: TinyuiTip) {
    guard observation == nil else { return }
    observationGeneration += 1
    let generation = observationGeneration
    observation = Task { @MainActor [weak self] in
      for await status in tip.statusUpdates {
        guard !Task.isCancelled, let self, self.observationGeneration == generation else { break }
        self.status = status
        let state: String
        let reason: String
        switch status {
        case .pending: state = "pending"; reason = ""
        case .available: state = "available"; reason = ""
        case .invalidated(let invalidation):
          state = "invalidated"
          switch invalidation {
          case .actionPerformed: reason = "actionPerformed"
          case .tipClosed: reason = "tipClosed"
          case .displayCountExceeded: reason = "displayCountExceeded"
          case .displayDurationExceeded: reason = "displayDurationExceeded"
          @unknown default: reason = "unknown"
          }
        @unknown default: state = "pending"; reason = ""
        }
        self.delegate?.onTipStatus(tipId: tip.id, status: state, reason: reason)
        TinyuiTipsRuntime.shared.requestUpdate()
      }
    }
  }

  private func stopObservation() {
    observationGeneration += 1
    observation?.cancel()
    observation = nil
    status = nil
  }

  /// Reject obscured/detached anchors and non-current navigation/tab screens.
  private func eligiblePresenter() -> UIViewController? {
    guard let window, window.windowScene?.activationState == .foregroundActive,
          !window.isHidden, let parent = parentViewController,
          parent.viewIfLoaded?.window === window, !bounds.isEmpty else { return nil }

    var visibleRect = convert(bounds, to: window)
    var ancestor: UIView? = self
    while let view = ancestor {
      guard !view.isHidden, view.alpha > 0.01 else { return nil }
      if view.clipsToBounds {
        visibleRect = visibleRect.intersection(view.convert(view.bounds, to: window))
      }
      ancestor = view.superview
    }
    guard !visibleRect.intersection(window.bounds).isEmpty else { return nil }

    var child = parent
    var ancestorController: UIViewController? = parent
    while let current = ancestorController {
      guard !current.isBeingDismissed, !current.isBeingPresented else { return nil }
      if let navigation = current as? UINavigationController,
         navigation.topViewController !== child { return nil }
      if let tabs = current as? UITabBarController,
         tabs.selectedViewController !== child { return nil }
      if let presented = current.presentedViewController, presented !== controller { return nil }
      // Wait for navigation animations before presenting. Do not treat our own
      // popover's presentation transition as the anchor leaving the screen.
      if controller == nil && current.transitionCoordinator != nil { return nil }
      child = current
      ancestorController = current.parent
    }
    return parent
  }

  private func configureArrow() {
    guard let popover = controller?.popoverPresentationController else { return }
    popover.sourceView = self
    popover.sourceRect = bounds
    let isRTL = effectiveUserInterfaceLayoutDirection == .rightToLeft
    switch arrowEdge {
    case "top": popover.permittedArrowDirections = .up
    case "bottom": popover.permittedArrowDirections = .down
    case "leading": popover.permittedArrowDirections = isRTL ? .right : .left
    case "trailing": popover.permittedArrowDirections = isRTL ? .left : .right
    default: popover.permittedArrowDirections = .any
    }
  }

  private func dismissTip() {
    guard let controller, !isPresenting, !isDismissing else { return }
    guard controller.presentingViewController != nil else { finishDismissal(controller); return }
    isDismissing = true
    controller.dismiss(animated: window != nil) { [weak self, weak controller] in
      guard let self, let controller else { return }
      self.finishDismissal(controller)
    }
  }

  private func finishDismissal(_ dismissed: TipUIPopoverViewController) {
    guard controller === dismissed else { return }
    if reportedVisible, let presentedTipId {
      delegate?.onTipVisible(tipId: presentedTipId, visible: false)
    }
    controller = nil
    presentedTipId = nil
    isPresenting = false
    isDismissing = false
    reportedVisible = false
    TinyuiTipsRuntime.shared.release(self)
  }

  public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
    guard let controller, presentationController.presentedViewController === controller else { return }
    suppressed = true
    finishDismissal(controller)
  }

  public func adaptivePresentationStyle(for controller: UIPresentationController) -> UIModalPresentationStyle { .none }

  public func adaptivePresentationStyle(for controller: UIPresentationController, traitCollection: UITraitCollection) -> UIModalPresentationStyle { .none }

  private func reportError(_ code: String, _ message: String) {
    guard lastError != code else { return }
    lastError = code
    delegate?.onTipError(tipId: tip?.id ?? "", code: code, message: message)
  }

  @objc public func reset() {
    enabled = false
    tip = nil
    suppressed = false
    lastError = nil
    stopObservation()
    dismissTip()
    parentViewController = nil
    TinyuiTipsRuntime.shared.unregister(self)
  }

  deinit { observation?.cancel() }
}
