import SwiftUI
import TipKit

@MainActor
final class TinyuiTipStyleOptions: ObservableObject {
  @Published var showsCloseButton = true
  @Published var maximumWidth: CGFloat?
}

// Install the style once. Replacing TipUIView.viewStyle can count as another
// display; observing these options updates its content without re-presenting.
@MainActor
struct TinyuiTipContentStyle: TipViewStyle {
  let options: TinyuiTipStyleOptions
  func makeBody(configuration: Configuration) -> some View {
    TinyuiTipContent(configuration: configuration, options: options)
  }
}

@MainActor
private struct TinyuiTipContent: View {
  let configuration: TipViewStyleConfiguration
  @ObservedObject var options: TinyuiTipStyleOptions

  var body: some View {
    Group {
      if options.showsCloseButton {
        MiniTipViewStyle.miniTip.makeBody(configuration: configuration)
      } else {
        contentWithoutCloseButton
      }
    }
    .frame(maxWidth: options.maximumWidth)
  }

  private var contentWithoutCloseButton: some View {
    HStack(alignment: .top, spacing: 12) {
      if let image = configuration.image {
        image
          .font(.title2)
          .foregroundStyle(.tint)
          .accessibilityHidden(true)
      }
      VStack(alignment: .leading, spacing: 8) {
        configuration.title
          .font(.headline)
          .foregroundStyle(.primary)
        configuration.message
          .font(.subheadline)
          .foregroundStyle(.secondary)
        ForEach(configuration.actions) { action in
          Button(action: action.handler) {
            action.label()
              .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
              .contentShape(Rectangle())
          }
          .buttonStyle(.plain)
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(.tint)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .fixedSize(horizontal: false, vertical: true)
    }
    .padding(16)
  }
}
