import SwiftUI
import UIKit

/**
 * Identifiable wrapper used to render React Native views (UIView) inside
 * SwiftUI. Modeled after react-native-pager-view's bridge.
 */
struct IdentifiablePlatformView: Identifiable, Equatable {
  let id = UUID()
  let view: UIView

  init(_ view: UIView) {
    self.view = view
  }
}

/**
 * Renders a UIView inside SwiftUI. Uses UIViewControllerRepresentable so the
 * hosted React view keeps a valid view-controller hierarchy.
 */
struct RepresentableView: UIViewControllerRepresentable {
  var view: UIView

  func makeUIViewController(context: Context) -> PlatformChildViewController {
    let viewController = PlatformChildViewController()
    viewController.wrappedView = view
    return viewController
  }

  func updateUIViewController(
    _ uiViewController: PlatformChildViewController,
    context: Context
  ) {
    if uiViewController.wrappedView !== view {
      uiViewController.wrappedView = view
    }
  }
}

class PlatformChildViewController: UIViewController {
  var wrappedView: UIView? {
    didSet {
      guard oldValue !== wrappedView else { return }
      oldValue?.removeFromSuperview()
      if isViewLoaded {
        mountWrappedView()
      }
    }
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .clear
    mountWrappedView()
  }

  private func mountWrappedView() {
    guard let wrappedView else { return }
    view.addSubview(wrappedView)
    wrappedView.translatesAutoresizingMaskIntoConstraints = false
    wrappedView.pinEdges(to: view)
  }
}

extension UIView {
  func pinEdges(to other: UIView) {
    NSLayoutConstraint.activate([
      leadingAnchor.constraint(equalTo: other.leadingAnchor),
      trailingAnchor.constraint(equalTo: other.trailingAnchor),
      topAnchor.constraint(equalTo: other.topAnchor),
      bottomAnchor.constraint(equalTo: other.bottomAnchor),
    ])
  }
}
