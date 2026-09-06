import SwiftUI
import UIKit

/**
 * UIKit bridge between the Fabric `TinyuiMenuView` component and the SwiftUI
 * `TinyuiMenuSwiftUIView`. Hosts the SwiftUI view through a
 * `UIHostingController`, mirroring react-native-pager-view's `PagerViewProvider`.
 *
 * The presenting view controller is supplied by the Objective-C++ component
 * view so this file does not depend on React.
 */
@objc public class TinyuiMenuProvider: UIView {
  private weak var delegate: TinyuiMenuViewDelegate?
  private var hostingController: UIHostingController<TinyuiMenuSwiftUIView>?
  private var props = TinyuiMenuProps()

  /// Presenting view controller, resolved by the component view from its
  /// React view controller hierarchy.
  @objc public weak var parentViewController: UIViewController? {
    didSet {
      if window != nil {
        setupView()
      }
    }
  }

  /// The React Native trigger view rendered as the menu's label.
  @objc public var triggerView: UIView? {
    didSet {
      props.triggerView = triggerView
    }
  }

  /// JSON menu configuration passed to the SwiftUI view.
  @objc public var menuConfig: String = "{}" {
    didSet {
      props.menuConfig = menuConfig
    }
  }

  @objc public var title: String = "" {
    didSet {
      props.title = title
    }
  }

  @objc public var disabled: Bool = false {
    didSet {
      props.disabled = disabled
    }
  }

  @objc public var hasPrimaryAction: Bool = false {
    didSet {
      props.hasPrimaryAction = hasPrimaryAction
    }
  }

  @objc public convenience init(delegate: TinyuiMenuViewDelegate) {
    self.init()
    self.delegate = delegate
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      setupView()
    }
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    if window != nil {
      setupView()
    }
  }

  private func setupView() {
    if hostingController != nil {
      syncParentViewController()
      return
    }

    guard let parentViewController else {
      return
    }

    let hostingController = UIHostingController(
      rootView: TinyuiMenuSwiftUIView(props: props, delegate: delegate)
    )
    self.hostingController = hostingController

    parentViewController.addChild(hostingController)
    hostingController.view.backgroundColor = .clear
    addSubview(hostingController.view)
    hostingController.view.translatesAutoresizingMaskIntoConstraints = false
    hostingController.view.pinEdges(to: self)
    hostingController.didMove(toParent: parentViewController)
  }

  /// Keeps the hosting controller attached to the current view controller.
  private func syncParentViewController(to parentViewController: UIViewController? = nil) {
    guard
      let hostingController,
      let parentViewController = parentViewController ?? self.parentViewController,
      hostingController.parent !== parentViewController
    else {
      return
    }

    hostingController.willMove(toParent: nil)
    hostingController.removeFromParent()
    parentViewController.addChild(hostingController)
    hostingController.didMove(toParent: parentViewController)
  }
}
