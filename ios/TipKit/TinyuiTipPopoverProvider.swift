import TipKit
import UIKit

@objc public protocol TinyuiTipPopoverDelegate: AnyObject {
  func onTipAction(tipId: String, id: String, title: String)
  func onTipError(tipId: String, code: String, message: String)
  func onTipInvalidated(tipId: String, reason: String)
}

@MainActor
@objc public final class TinyuiTipPopoverProvider: UIView, UIPopoverPresentationControllerDelegate {
  private weak var delegate: TinyuiTipPopoverDelegate?
  @objc public weak var parentViewController: UIViewController? {
    didSet {
      guard oldValue !== parentViewController else { return }
      stop()
      start()
    }
  }
  private var tip: TinyuiTip?
  private var enabled = false
  private var arrowEdge = "auto"
  private var observation: Task<Void, Never>?
  private var shouldDisplay = false
  private var lastError: String?
  private var controller: TipUIPopoverViewController?
  private var presentedTipId: String?
  private var isPresenting = false
  private var isDismissing = false
  private var invalidateOnOutsideDismiss = false
  private var pendingInvalidation: (tipId: String, reason: String)?

  @objc public convenience init(delegate: TinyuiTipPopoverDelegate) {
    self.init(frame: .zero)
    self.delegate = delegate
  }

  @objc public func configure(_ configuration: [String: Any], enabled: Bool, arrowEdge: String) {
    let nextTip = TinyuiTip(configuration: configuration)
    if tip?.id != nextTip.id { pendingInvalidation = nil }
    if tip?.id != nextTip.id || self.enabled != enabled {
      stop()
      lastError = nil
    }
    tip = nextTip
    self.enabled = enabled
    self.arrowEdge = arrowEdge
    invalidateOnOutsideDismiss = configuration["invalidateOnOutsideDismiss"] as? Bool ?? false
    // Validate changed options even when an observation is already running.
    do {
      try TinyuiTipsRuntime.shared.remember(nextTip)
    } catch {
      stop()
      let error = error as NSError
      reportError(error.userInfo["code"] as? String ?? "E_TIP", error.localizedDescription)
      return
    }
    lastError = nil
    configureArrow()
    start()
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil { stop() } else { start() }
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    configureArrow()
    // Start once Fabric has given the anchor a size. Layout changes alone do
    // not request another presentation after a tip has been dismissed.
    start()
  }

  private func start() {
    guard observation == nil, enabled, let tip, let window,
          !bounds.isEmpty, let parent = parentViewController,
          parent.viewIfLoaded?.window === window else { return }
    let runtime = TinyuiTipsRuntime.shared
    guard runtime.isConfigured else {
      reportError("E_TIPS_NOT_CONFIGURED", "Call and await TipKit.configure() before displaying tips.")
      return
    }
    do {
      try runtime.remember(tip)
      lastError = nil
    } catch {
      let error = error as NSError
      reportError(error.userInfo["code"] as? String ?? "E_TIP", error.localizedDescription)
      return
    }

    observation = Task { @MainActor [weak self] in
      var reportedInvalidation = false
      for await status in tip.statusUpdates {
        guard !Task.isCancelled, let self else { break }
        if case .available = status { self.shouldDisplay = true } else { self.shouldDisplay = false }
        if case .invalidated(let reason) = status, !reportedInvalidation {
          reportedInvalidation = true
          self.pendingInvalidation = (tip.id, TinyuiTipsRuntime.invalidationReason(reason))
        }
        self.updatePresentation()
        self.reportInvalidationIfDismissed()
      }
    }
  }

  private func stop() {
    observation?.cancel()
    observation = nil
    shouldDisplay = false
    dismissTip()
  }

  private func updatePresentation() {
    if let controller, !isPresenting, !isDismissing, controller.presentingViewController == nil {
      // Dismissal may originate inside TipKit rather than through the delegate.
      finishDismissal(controller)
      return
    }
    guard enabled, window != nil, let tip, shouldDisplay,
          presentedTipId == nil || presentedTipId == tip.id else {
      dismissTip()
      return
    }
    // Like Tipster's TipPresenter, only present when the host is free.
    guard controller == nil, let presenter = availablePresenter() else { return }
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
    // Retain the provider through the animation so a Fabric unmount can still
    // dismiss this presentation in the completion, without a global owner.
    presenter.present(tipController, animated: true) { [self] in
      guard self.controller === tipController else { return }
      self.isPresenting = false
      self.updatePresentation()
    }
  }

  private func availablePresenter() -> UIViewController? {
    guard let window, let parent = parentViewController,
          parent.viewIfLoaded?.window === window else { return nil }
    var ancestorController: UIViewController? = parent
    while let current = ancestorController {
      guard !current.isBeingDismissed, !current.isBeingPresented,
            current.presentedViewController == nil else { return nil }
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
    controller.dismiss(animated: window != nil) { [self] in
      guard self.controller === controller else { return }
      self.finishDismissal(controller)
      // Props may have changed while the dismissal animation was running.
      self.updatePresentation()
    }
  }

  private func finishDismissal(_ dismissed: TipUIPopoverViewController) {
    guard controller === dismissed else { return }
    controller = nil
    presentedTipId = nil
    isPresenting = false
    isDismissing = false
    reportInvalidationIfDismissed()
  }

  private func reportInvalidationIfDismissed() {
    // The next grouped anchor must not present until this transition finishes.
    guard controller == nil, let event = pendingInvalidation else { return }
    pendingInvalidation = nil
    delegate?.onTipInvalidated(tipId: event.tipId, reason: event.reason)
  }

  public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
    guard let controller, presentationController.presentedViewController === controller else { return }
    let dismissedTip = presentedTipId == tip?.id ? tip : nil
    let shouldInvalidate = invalidateOnOutsideDismiss && !isDismissing
    finishDismissal(controller)
    // Programmatic hiding, navigation and recycling do not complete a tip.
    if shouldInvalidate, let dismissedTip, case .available = dismissedTip.status {
      dismissedTip.invalidate(reason: .tipClosed)
    }
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
    lastError = nil
    pendingInvalidation = nil
    invalidateOnOutsideDismiss = false
    stop()
    parentViewController = nil
  }

  deinit { observation?.cancel() }
}
