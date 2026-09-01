import SwiftUI
import UIKit

/**
 * UIKit bridge between the Fabric `TinyuiPopoverView` component and the
 * SwiftUI `TinyuiPopoverSwiftUIView`. Hosts the SwiftUI view through a
 * `UIHostingController`, mirroring react-native-pager-view's bridge.
 */
@objc public class TinyuiPopoverProvider: UIView {
  private weak var delegate: TinyuiPopoverViewDelegate?
  private var hostingController: UIHostingController<TinyuiPopoverSwiftUIView>?
  private var props = TinyuiPopoverProps()

  /// Presenting view controller, resolved by the component view from its
  /// React view controller hierarchy.
  @objc public weak var parentViewController: UIViewController? {
    didSet {
      if window != nil {
        setupView()
      }
    }
  }

  @objc public var triggerView: UIView? {
    didSet {
      props.triggerView = triggerView
    }
  }

  @objc public var contentView: UIView? {
    didSet {
      props.contentView = contentView
    }
  }

  @objc public var isPresented: Bool = false {
    didSet {
      props.isPresented = isPresented
    }
  }

  @objc public var attachmentAnchor: String = "center" {
    didSet {
      props.attachmentAnchor = attachmentAnchor
    }
  }

  @objc public var arrowEdge: String = "none" {
    didSet {
      props.arrowEdge = arrowEdge
    }
  }

  @objc public convenience init(delegate: TinyuiPopoverViewDelegate) {
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
      rootView: TinyuiPopoverSwiftUIView(props: props, delegate: delegate)
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
