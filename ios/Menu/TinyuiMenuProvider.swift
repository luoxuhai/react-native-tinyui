import UIKit

/**
 * UIButton-backed UIKit menu trigger used as the Fabric component's content
 * view. UIButton owns the UIMenu presentation and its long-press interaction.
 */
@objc public final class TinyuiMenuProvider: UIButton {
  private weak var delegate: TinyuiMenuViewDelegate?

  @objc public var triggerView: UIView? {
    didSet {
      guard oldValue !== triggerView else {
        return
      }
      oldValue?.removeFromSuperview()
      if let triggerView {
        addSubview(triggerView)
      }
      setNeedsLayout()
    }
  }

  @objc public convenience init(delegate: TinyuiMenuViewDelegate) {
    self.init(frame: .zero)
    self.delegate = delegate
  }

  override public init(frame: CGRect) {
    super.init(frame: frame)
    configure()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    configure()
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    triggerView?.frame = bounds
    if let triggerView {
      bringSubviewToFront(triggerView)
    }
  }

  override public func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
    guard !isHidden, alpha > 0.01, isEnabled, isUserInteractionEnabled,
          self.point(inside: point, with: event) else {
      return nil
    }
    return self
  }

  private func configure() {
    backgroundColor = .clear
    showsMenuAsPrimaryAction = true
  }

  /** Applies one complete Fabric props snapshot before rebuilding the menu. */
  @objc public func update(
    menuConfig: [String: Any],
    title: String,
    disabled: Bool
  ) {
    isEnabled = !disabled
    isUserInteractionEnabled = !disabled

    // UIButton enables its context menu interaction whenever a menu is assigned,
    // independently of the control's enabled state. Remove it while disabled
    // to block both primary-action and long-press presentation.
    if disabled {
      contextMenuInteraction?.dismissMenu()
      menu = nil
      return
    }

    menu = TinyuiMenuBuilder(delegate: delegate).buildMenu(
      title: title,
      config: menuConfig
    )
  }
}
