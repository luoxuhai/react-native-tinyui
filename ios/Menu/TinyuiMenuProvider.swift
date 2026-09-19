import UIKit
import UIKit.UIGestureRecognizerSubclass

/**
 * UIButton-backed UIKit menu trigger used as the Fabric component's content
 * view. UIButton owns the UIMenu presentation and its long-press interaction.
 */
@objc public final class TinyuiMenuProvider: UIButton {
  private weak var delegate: TinyuiMenuViewDelegate?
  private weak var menuTouchGate: TinyuiMenuTouchGate?

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

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    menuTouchGate?.presentedMenus.remove(self)
    menuTouchGate = window.map { TinyuiMenuTouchGate.install(in: $0) }
  }

  override public func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    willDisplayMenuFor configuration: UIContextMenuConfiguration,
    animator: UIContextMenuInteractionAnimating?
  ) {
    super.contextMenuInteraction(interaction, willDisplayMenuFor: configuration, animator: animator)
    menuTouchGate?.presentedMenus.add(self)
  }

  override public func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    willEndFor configuration: UIContextMenuConfiguration,
    animator: UIContextMenuInteractionAnimating?
  ) {
    super.contextMenuInteraction(interaction, willEndFor: configuration, animator: animator)
    // The dismissal touch has already been filtered. New touches during the
    // closing animation belong to the page again.
    menuTouchGate?.presentedMenus.remove(self)
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

  @objc public func openMenu() {
    guard isEnabled, isUserInteractionEnabled, !isHidden, alpha > 0.01,
          window != nil, !bounds.isEmpty, menu != nil else {
      return
    }
    if #available(iOS 17.4, *) {
      performPrimaryAction()
    }
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

/**
 * Uses the early-event filtering approach from Expo's SystemMenuTouchGate:
 * https://github.com/expo/expo/pull/49775
 * TinyUI tracks its own menus through public UIButton lifecycle callbacks.
 */
final class TinyuiMenuTouchGate: UIGestureRecognizer, UIGestureRecognizerDelegate {
  let presentedMenus = NSHashTable<TinyuiMenuProvider>.weakObjects()
  private static let surfaceTouchHandlerClass = NSClassFromString("RCTSurfaceTouchHandler")

  init() {
    super.init(target: nil, action: nil)
    cancelsTouchesInView = false
    delaysTouchesBegan = false
    delaysTouchesEnded = false
    delegate = self
  }

  static func install(in window: UIWindow) -> TinyuiMenuTouchGate {
    if let gate = window.gestureRecognizers?.first(where: { $0 is TinyuiMenuTouchGate })
      as? TinyuiMenuTouchGate {
      return gate
    }
    let gate = TinyuiMenuTouchGate()
    window.addGestureRecognizer(gate)
    return gate
  }

  private func ignoreReactTouches(_ touches: Set<UITouch>, event: UIEvent) {
    guard let window = view as? UIWindow,
          presentedMenus.allObjects.contains(where: { $0.window === window }),
          let handlerClass = Self.surfaceTouchHandlerClass else {
      return
    }

    for touch in touches where touch.phase == .began {
      var ancestor = touch.view
      while let current = ancestor {
        for handler in current.gestureRecognizers ?? [] where handler.isKind(of: handlerClass) {
          handler.ignore(touch, for: event)
        }
        ancestor = current.superview
      }
    }
  }

  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive event: UIEvent) -> Bool {
    // Filtering in touchesBegan alone is too late: RN may already have sent
    // touchStart/onPressIn to JS. UIKit asks this delegate before delivery.
    if let touches = event.allTouches {
      ignoreReactTouches(touches, event: event)
    }
    return true
  }

  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
    super.touchesBegan(touches, with: event)
    // Fallback for delivery orders where RN sees the touch first.
    ignoreReactTouches(touches, event: event)
    state = .failed
  }
}
