import SwiftUI
import TipKit
import UIKit

@objc public protocol TinyuiTipViewDelegate: AnyObject {
  func onTipAction(tipId: String, id: String, title: String)
  func onTipError(tipId: String, code: String, message: String)
  func onTipInvalidated(tipId: String, reason: String)
  // Fabric consumes this size directly; it is not a JavaScript event.
  func onTipSizeChange(tipId: String, width: CGFloat, height: CGFloat)
}

@MainActor
@objc public final class TinyuiTipViewProvider: UIView {
  private weak var delegate: TinyuiTipViewDelegate?
  private var tip: TinyuiTip?
  private var enabled = false
  private let styleOptions = TinyuiTipStyleOptions()
  private var arrowEdge: Edge?
  private var observation: Task<Void, Never>?
  private var tipView: TipUIView?
  private var preferredTipWidth: CGFloat = 0
  private var measuredTipWidth: CGFloat?
  private var tipWidthConstraint: NSLayoutConstraint?
  private var tipHeightConstraint: NSLayoutConstraint?
  private var lastError: String?

  @objc public convenience init(delegate: TinyuiTipViewDelegate) {
    self.init(frame: .zero)
    self.delegate = delegate
    clipsToBounds = true
    registerForTraitChanges([UITraitPreferredContentSizeCategory.self]) { (view: TinyuiTipViewProvider, _: UITraitCollection) in
      view.measuredTipWidth = nil
      view.setNeedsLayout()
    }
  }

  @objc public func configure(_ configuration: [String: Any], enabled: Bool, arrowEdge: String) {
    let nextTip = TinyuiTip(configuration: configuration)
    if tip?.id != nextTip.id || self.enabled != enabled {
      stop()
      lastError = nil
    }
    tip = nextTip
    self.enabled = enabled
    let nextShowsCloseButton = configuration["showsCloseButton"] as? Bool ?? true
    if styleOptions.showsCloseButton != nextShowsCloseButton {
      styleOptions.showsCloseButton = nextShowsCloseButton
      measuredTipWidth = nil
      setNeedsLayout()
    }
    switch arrowEdge {
    case "top": self.arrowEdge = .top
    case "bottom": self.arrowEdge = .bottom
    case "leading": self.arrowEdge = .leading
    case "trailing": self.arrowEdge = .trailing
    default: self.arrowEdge = nil
    }
    do {
      try TinyuiTipsRuntime.shared.remember(nextTip)
    } catch {
      stop()
      let error = error as NSError
      reportError(error.userInfo["code"] as? String ?? "E_TIP", error.localizedDescription)
      return
    }
    lastError = nil
    start()
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil { stop() } else { start() }
  }

  private func start() {
    // A zero initial height is expected: the native view supplies its measured
    // height to Fabric after the eligibility stream yields its first value.
    guard observation == nil, enabled, let tip, window != nil else { return }
    guard TinyuiTipsRuntime.shared.isConfigured else {
      reportError("E_TIPS_NOT_CONFIGURED", "Call and await TipKit.configure() before displaying tips.")
      return
    }
    observation = Task { @MainActor [weak self] in
      var reportedInvalidation = false
      for await status in tip.statusUpdates {
        guard !Task.isCancelled, let self else { break }
        if case .available = status { self.showTip() } else { self.removeTip() }
        if case .invalidated(let reason) = status, !reportedInvalidation {
          reportedInvalidation = true
          self.delegate?.onTipInvalidated(tipId: tip.id, reason: TinyuiTipsRuntime.invalidationReason(reason))
        }
      }
    }
  }

  private func showTip() {
    guard tipView == nil, enabled, window != nil, let tip else { return }
    let view = TipUIView(tip, arrowEdge: arrowEdge) { [weak self] action in
      guard let self, self.tip?.id == tip.id,
            let content = tip.actionContents.first(where: { $0.id == action.id }) else { return }
      self.delegate?.onTipAction(tipId: tip.id, id: content.id, title: content.title)
    }
    tipView = view
    preferredTipWidth = view.intrinsicContentSize.width
    measuredTipWidth = nil
    updateStyleWidth()
    view.viewStyle = TinyuiTipContentStyle(options: styleOptions)
    view.translatesAutoresizingMaskIntoConstraints = false
    addSubview(view)
    let widthConstraint = view.widthAnchor.constraint(equalToConstant: 0)
    let heightConstraint = view.heightAnchor.constraint(equalToConstant: 0)
    tipWidthConstraint = widthConstraint
    tipHeightConstraint = heightConstraint
    NSLayoutConstraint.activate([
      view.topAnchor.constraint(equalTo: topAnchor),
      view.leadingAnchor.constraint(equalTo: leadingAnchor),
      widthConstraint,
      heightConstraint,
    ])
    setNeedsLayout()
  }

  private func removeTip() {
    tipView?.removeFromSuperview()
    tipView = nil
    preferredTipWidth = 0
    measuredTipWidth = nil
    tipWidthConstraint = nil
    tipHeightConstraint = nil
    reportSize(height: 0)
  }

  private func stop() {
    observation?.cancel()
    observation = nil
    removeTip()
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    guard let tipView else { reportSize(height: 0); return }
    guard bounds.width > 0,
          let tipWidthConstraint, let tipHeightConstraint else { return }
    updateStyleWidth()
    // TipUIView may cap its card width on iPad. Measure and lay it out at the
    // same width so a wider proposal cannot underestimate wrapped text height.
    let width = preferredTipWidth.isFinite && preferredTipWidth > 0
      ? min(bounds.width, preferredTipWidth) : bounds.width
    if measuredTipWidth != width {
      // TipUIView's SwiftUI content needs a required width constraint to wrap.
      // A frame alone can leave the card at its unconstrained intrinsic width.
      tipWidthConstraint.constant = width
      tipHeightConstraint.isActive = false
      defer { tipHeightConstraint.isActive = true }
      tipView.bounds.size.width = width
      let fittingSize = tipView.systemLayoutSizeFitting(
        CGSize(width: width, height: UIView.layoutFittingCompressedSize.height),
        withHorizontalFittingPriority: .required,
        verticalFittingPriority: .fittingSizeLevel)
      guard fittingSize.height.isFinite else { return }
      let scale = traitCollection.displayScale > 0 ? traitCollection.displayScale : 1
      tipHeightConstraint.constant = ceil(max(0, fittingSize.height) * scale) / scale
      measuredTipWidth = width
    }
    let height = tipHeightConstraint.constant
    let x = effectiveUserInterfaceLayoutDirection == .rightToLeft ? bounds.width - width : 0
    tipView.frame = CGRect(x: x, y: 0, width: width, height: height)
    reportSize(height: height)
  }

  private func updateStyleWidth() {
    // TipUIView's SwiftUI content can keep its ideal width even when its UIKit
    // frame is narrower. Constrain the style too so text and buttons wrap.
    let width = bounds.width > 0 ? bounds.width : nil
    if styleOptions.maximumWidth != width { styleOptions.maximumWidth = width }
  }

  private func reportSize(height: CGFloat) {
    delegate?.onTipSizeChange(tipId: tip?.id ?? "", width: bounds.width, height: height)
  }

  private func reportError(_ code: String, _ message: String) {
    guard lastError != code else { return }
    lastError = code
    delegate?.onTipError(tipId: tip?.id ?? "", code: code, message: message)
  }

  @objc public func reset() {
    stop()
    tip = nil
    enabled = false
    styleOptions.showsCloseButton = true
    styleOptions.maximumWidth = nil
    arrowEdge = nil
    lastError = nil
  }

  deinit { observation?.cancel() }
}
