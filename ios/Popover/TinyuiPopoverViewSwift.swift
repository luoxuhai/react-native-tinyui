import SwiftUI
import UIKit

/**
 * Observable props shared between the Objective-C++ component view and the
 * SwiftUI `Popover` implementation. Mirror of `TinyuiPopoverProps` in codegen.
 */
class TinyuiPopoverProps: ObservableObject {
  @Published var isPresented: Bool = false
  @Published var attachmentAnchor: String = "center"
  @Published var arrowEdge: String = "none"
  @Published var triggerView: UIView?
  @Published var contentView: UIView?
}

/**
 * SwiftUI `popover` backed by UIPopoverPresentationController, matching
 * expo-ui's PopoverView. The RN trigger is embedded as the anchor view and the
 * RN content view is presented inside the popover.
 *
 * Named distinctly from the Fabric component view `TinyuiPopoverView`.
 */
struct TinyuiPopoverSwiftUIView: View {
  @ObservedObject var props: TinyuiPopoverProps
  weak var delegate: TinyuiPopoverViewDelegate?

  @State private var isPresented: Bool = false

  var body: some View {
    if let triggerView = props.triggerView {
      RepresentableView(view: triggerView)
        .popover(
          isPresented: $isPresented,
          attachmentAnchor: attachmentAnchorValue,
          arrowEdge: arrowEdgeValue
        ) {
          if #available(iOS 16.4, *) {
            popoverContent
              .presentationCompactAdaptation(.popover)
          } else {
            popoverContent
          }
        }
        .onChange(of: isPresented) { newValue in
          delegate?.onIsPresentedChange(isPresented: newValue)
        }
        .onChange(of: props.isPresented) { newValue in
          isPresented = newValue
        }
        .onAppear {
          isPresented = props.isPresented
        }
    } else {
      Color.clear
    }
  }

  private var attachmentAnchorValue: PopoverAttachmentAnchor {
    switch props.attachmentAnchor {
    case "top": return .point(.top)
    case "bottom": return .point(.bottom)
    case "leading": return .point(.leading)
    case "trailing": return .point(.trailing)
    default: return .point(.center)
    }
  }

  private var arrowEdgeValue: Edge? {
    switch props.arrowEdge {
    case "top": return .top
    case "bottom": return .bottom
    case "leading": return .leading
    case "trailing": return .trailing
    default: return nil
    }
  }

  @ViewBuilder
  private var popoverContent: some View {
    if let contentView = props.contentView {
      RepresentableView(view: contentView)
    }
  }
}

@objc public protocol TinyuiPopoverViewDelegate {
  func onIsPresentedChange(isPresented: Bool)
}
