import UIKit

@objc public protocol TinyuiPopoverViewDelegate: AnyObject {
  func onIsPresentedChange(isPresented: Bool)
}

/**
 * UIKit implementation used by the Fabric `TinyuiPopoverView` component.
 * Presents the React Native content view with `UIPopoverPresentationController`
 * and keeps the trigger view in the normal React Native view hierarchy.
 */
@objc public final class TinyuiPopoverProvider: UIView,
  UIPopoverPresentationControllerDelegate
{
  private weak var delegate: TinyuiPopoverViewDelegate?
  private var presentedViewController: UIViewController?
  private var isDismissing = false
  private var isPresentationUpdateScheduled = false

  /// Presenting view controller, resolved by the component view from its
  /// React view controller hierarchy.
  @objc public weak var parentViewController: UIViewController? {
    didSet {
      guard oldValue !== parentViewController else { return }
      schedulePresentationUpdate()
    }
  }

  @objc public var triggerView: UIView? {
    didSet {
      guard oldValue !== triggerView else { return }
      schedulePresentationUpdate()
    }
  }

  @objc public var contentView: UIView? {
    didSet {
      guard oldValue !== contentView else { return }
      oldValue?.removeFromSuperview()
      contentSize = .zero
      schedulePresentationUpdate()
    }
  }

  /// The content wrapper's Yoga size, synchronized after each Fabric commit.
  /// Keep it separate from the presentation controller's UIKit layout.
  @objc public var contentSize: CGSize = .zero {
    didSet {
      guard oldValue != contentSize else { return }
      schedulePresentationUpdate()
    }
  }

  @objc public var isPresented: Bool = false {
    didSet {
      guard oldValue != isPresented else { return }
      schedulePresentationUpdate()
    }
  }

  @objc public var attachmentAnchor: String = "center" {
    didSet {
      guard oldValue != attachmentAnchor else { return }
      schedulePresentationUpdate()
    }
  }

  @objc public var arrowEdge: String = "none" {
    didSet {
      guard oldValue != arrowEdge else { return }
      schedulePresentationUpdate()
    }
  }

  @objc public convenience init(delegate: TinyuiPopoverViewDelegate) {
    self.init(frame: .zero)
    self.delegate = delegate
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    schedulePresentationUpdate()
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    updatePresentedPopoverConfiguration()
  }

  private func schedulePresentationUpdate() {
    guard !isPresentationUpdateScheduled else { return }
    isPresentationUpdateScheduled = true

    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      self.isPresentationUpdateScheduled = false
      self.updatePresentation()
    }
  }

  private func updatePresentation() {
    guard isPresented, window != nil else {
      dismissPopoverIfNeeded()
      return
    }

    guard
      presentedViewController == nil,
      let parentViewController,
      let triggerView,
      triggerView.window != nil,
      contentView != nil,
      let preferredContentSize
    else {
      updatePresentedPopoverConfiguration()
      return
    }

    let contentViewController = UIViewController()
    // The system popover supplies its own material (Liquid Glass on iOS 26+).
    // An opaque content background would cover it, including its adaptive tint.
    contentViewController.view.backgroundColor = .clear
    contentViewController.view.clipsToBounds = true
    contentViewController.preferredContentSize = preferredContentSize
    contentViewController.modalPresentationStyle = .popover
    attachContent(to: contentViewController)

    guard let popoverPresentationController = contentViewController.popoverPresentationController
    else {
      return
    }

    configure(popoverPresentationController, from: triggerView)
    popoverPresentationController.delegate = self
    presentedViewController = contentViewController

    parentViewController.present(contentViewController, animated: true) { [weak self] in
      guard let self else { return }
      if !self.isPresented || self.window == nil {
        self.dismissPopoverIfNeeded()
      }
    }
  }

  private func dismissPopoverIfNeeded() {
    guard let presentedViewController, !isDismissing else { return }

    isDismissing = true
    presentedViewController.dismiss(animated: true) { [weak self] in
      guard let self else { return }
      self.presentedViewController = nil
      self.isDismissing = false
      self.delegate?.onIsPresentedChange(isPresented: false)
      if self.isPresented, self.window != nil {
        self.schedulePresentationUpdate()
      }
    }
  }

  private func updatePresentedPopoverConfiguration() {
    guard
      let presentedViewController,
      let triggerView,
      let preferredContentSize,
      let popoverPresentationController = presentedViewController.popoverPresentationController
    else {
      return
    }

    attachContent(to: presentedViewController)
    if presentedViewController.preferredContentSize != preferredContentSize {
      presentedViewController.preferredContentSize = preferredContentSize
    }
    configure(popoverPresentationController, from: triggerView)
  }

  private func attachContent(to viewController: UIViewController) {
    guard let contentView, contentView.superview !== viewController.view else { return }
    contentView.removeFromSuperview()
    // Fabric owns the content frame. Stretching it to the popover's bounds
    // would overwrite the measured size and feed it back into presentation.
    contentView.autoresizingMask = []
    viewController.view.addSubview(contentView)
  }

  private func configure(
    _ popoverPresentationController: UIPopoverPresentationController,
    from triggerView: UIView
  ) {
    popoverPresentationController.sourceView = triggerView
    popoverPresentationController.sourceRect = sourceRect(in: triggerView.bounds)
    popoverPresentationController.permittedArrowDirections = permittedArrowDirections
  }

  private func sourceRect(in bounds: CGRect) -> CGRect {
    let point: CGPoint
    switch attachmentAnchor {
    case "top":
      point = CGPoint(x: bounds.midX, y: bounds.minY)
    case "bottom":
      point = CGPoint(x: bounds.midX, y: bounds.maxY)
    case "leading":
      point = CGPoint(x: bounds.minX, y: bounds.midY)
    case "trailing":
      point = CGPoint(x: bounds.maxX, y: bounds.midY)
    default:
      point = CGPoint(x: bounds.midX, y: bounds.midY)
    }

    return CGRect(x: point.x, y: point.y, width: 1, height: 1)
  }

  private var permittedArrowDirections: UIPopoverArrowDirection {
    switch arrowEdge {
    case "top":
      return .up
    case "bottom":
      return .down
    case "leading":
      return .left
    case "trailing":
      return .right
    default:
      return .any
    }
  }

  private var preferredContentSize: CGSize? {
    guard contentSize.width.isFinite, contentSize.height.isFinite,
      contentSize.width > 0, contentSize.height > 0
    else {
      // Wait for Fabric's first layout instead of presenting at an arbitrary
      // fallback size that can become the content's next measured size.
      return nil
    }
    return CGSize(width: ceil(contentSize.width), height: ceil(contentSize.height))
  }

  // Returning `.none` is UIKit's equivalent of keeping a SwiftUI popover as a
  // popover in compact size classes (`presentationCompactAdaptation(.popover)`).
  public func adaptivePresentationStyle(
    for controller: UIPresentationController
  ) -> UIModalPresentationStyle {
    .none
  }

  public func adaptivePresentationStyle(
    for controller: UIPresentationController,
    traitCollection: UITraitCollection
  ) -> UIModalPresentationStyle {
    .none
  }

  public func presentationControllerDidDismiss(
    _ presentationController: UIPresentationController
  ) {
    guard presentedViewController === presentationController.presentedViewController else {
      return
    }

    presentedViewController = nil
    isDismissing = false
    delegate?.onIsPresentedChange(isPresented: false)
  }
}
