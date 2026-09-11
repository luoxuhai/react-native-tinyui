import CoreText
import SwiftUI
import UIKit

private struct LiquidGlassTextConfiguration: Decodable {
  struct FontConfiguration: Decodable {
    let style: String?
    let size: CGFloat?
    let weight: String?
    let design: String?
    let family: String?
  }

  var text: String?
  var glass: String?
  var interactive: Bool?
  var font: FontConfiguration?
  var fontWeight: String?
  var fontDesign: String?
  var multilineTextAlignment: String?

  var resolvedFont: Font {
    let design: Font.Design
    switch fontDesign ?? font?.design {
    case "serif": design = .serif
    case "monospaced": design = .monospaced
    case "rounded": design = .rounded
    default: design = .default
    }

    let style: Font.TextStyle
    switch font?.style {
    case "largeTitle": style = .largeTitle
    case "title": style = .title
    case "title2": style = .title2
    case "title3": style = .title3
    case "headline": style = .headline
    case "subheadline": style = .subheadline
    case "callout": style = .callout
    case "footnote": style = .footnote
    case "caption": style = .caption
    case "caption2": style = .caption2
    default: style = .body
    }

    var result: Font
    if let size = font?.size, size.isFinite, size > 0 {
      if let family = font?.family, !family.isEmpty {
        result = .custom(family, fixedSize: size)
      } else {
        result = .system(size: size, design: design)
      }
    } else {
      result = .system(style, design: design)
    }

    // Preserve a semantic style's default weight (e.g. headline) unless overridden.
    if let weight = fontWeight ?? font?.weight {
      switch weight {
      case "ultraLight": result = result.weight(.ultraLight)
      case "thin": result = result.weight(.thin)
      case "light": result = result.weight(.light)
      case "medium": result = result.weight(.medium)
      case "semibold": result = result.weight(.semibold)
      case "bold": result = result.weight(.bold)
      case "heavy": result = result.weight(.heavy)
      case "black": result = result.weight(.black)
      default: result = result.weight(.regular)
      }
    }
    return result
  }

  var alignment: TextAlignment {
    switch multilineTextAlignment {
    case "center": return .center
    case "trailing": return .trailing
    default: return .leading
    }
  }
}

private struct LiquidGlassTextContent: View {
  let configuration: LiquidGlassTextConfiguration
  let text: String
  let tintColor: UIColor?

  var body: some View {
    Group {
      if #available(iOS 26.0, *) {
        LiquidGlassTextEffect(
          text: text,
          effect: configuration.glass ?? "clear",
          tintColor: tintColor,
          interactive: configuration.interactive ?? false
        )
      } else {
        Text(verbatim: text)
          .foregroundStyle(tintColor.map { Color(uiColor: $0) } ?? .primary)
      }
    }
    .font(configuration.resolvedFont)
    .multilineTextAlignment(configuration.alignment)
    .fixedSize()
    // React Native exposes one accessible text element with the supplied label.
    .accessibilityHidden(true)
  }
}

// Adapted from ailtonvivaz/GlassText (MIT). See GlassText-LICENSE.
@available(iOS 26.0, *)
private struct LiquidGlassTextEffect: View {
  let text: String
  let effect: String
  let tintColor: UIColor?
  let interactive: Bool

  @Environment(\.font) private var font
  @Environment(\.fontResolutionContext) private var fontResolutionContext
  @Environment(\.multilineTextAlignment) private var alignment

  private var glass: Glass {
    var result: Glass
    switch effect {
    case "regular": result = .regular
    case "identity": result = .identity
    default: result = .clear
    }
    if let tintColor {
      result = result.tint(Color(uiColor: tintColor))
    }
    return result.interactive(interactive)
  }

  var body: some View {
    let resolved = (font ?? .body).resolve(in: fontResolutionContext)
    let ctFont = resolved.ctFont
    let lines = text.components(separatedBy: CharacterSet.newlines)
    let lineHeight = CTFontGetAscent(ctFont) + CTFontGetDescent(ctFont)
      + max(CTFontGetLeading(ctFont), resolved.pointSize * 0.2)
    let width = lines.reduce(CGFloat.zero) { width, line in
      let attributed = NSAttributedString(
        string: line,
        attributes: [kCTFontAttributeName as NSAttributedString.Key: ctFont]
      )
      return max(width, CGFloat(CTLineGetTypographicBounds(
        CTLineCreateWithAttributedString(attributed), nil, nil, nil
      )))
    }
    let shape = TinyuiTextOutlineShape(
      text: text, ctFont: ctFont, fontSize: resolved.pointSize, alignment: alignment
    )
    Rectangle()
      .fill(.clear)
      .glassEffect(glass, in: shape)
      .frame(width: width, height: text.isEmpty ? 0 : lineHeight * CGFloat(lines.count))
  }
}

@objc public protocol TinyuiLiquidGlassTextViewDelegate: AnyObject {
  func onContentSizeChange(width: Double, height: Double, configuration: String)
}

@objc public class TinyuiLiquidGlassTextProvider: UIView {
  private weak var delegate: TinyuiLiquidGlassTextViewDelegate?
  private var hostingController: UIHostingController<LiquidGlassTextContent>?
  private var configuration = LiquidGlassTextConfiguration()
  private var configurationJSON = "{}"
  private var tintColorValue: UIColor?
  private var lastSize: CGSize?

  @objc public weak var parentViewController: UIViewController? {
    didSet { setNeedsLayout() }
  }

  @objc public convenience init(delegate: TinyuiLiquidGlassTextViewDelegate) {
    self.init(frame: .zero)
    self.delegate = delegate
    registerForTraitChanges([UITraitPreferredContentSizeCategory.self]) {
      (view: TinyuiLiquidGlassTextProvider, _: UITraitCollection) in
      view.invalidateMeasurement()
    }
  }

  @objc public func configure(_ json: String, tintColor: UIColor?) {
    guard json != configurationJSON || tintColor != tintColorValue else { return }
    configurationJSON = json
    configuration = (try? JSONDecoder().decode(
      LiquidGlassTextConfiguration.self, from: Data(json.utf8)
    )) ?? LiquidGlassTextConfiguration()
    tintColorValue = tintColor
    hostingController?.rootView = content
    invalidateMeasurement()
  }

  @objc public func invalidateMeasurement() {
    lastSize = nil
    setNeedsLayout()
  }

  private var content: LiquidGlassTextContent {
    LiquidGlassTextContent(configuration: configuration, text: configuration.text ?? "", tintColor: tintColorValue)
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil {
      detachController()
    } else {
      invalidateMeasurement()
    }
  }

  private func detachController() {
    hostingController?.willMove(toParent: nil)
    hostingController?.view.removeFromSuperview()
    hostingController?.removeFromParent()
    hostingController = nil
  }

  @objc public func reset() {
    detachController()
    parentViewController = nil
    configurationJSON = "{}"
    configuration = LiquidGlassTextConfiguration()
    tintColorValue = nil
    lastSize = nil
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    guard window != nil, let parentViewController else { return }

    if hostingController == nil {
      let controller = UIHostingController(rootView: content)
      controller.safeAreaRegions = []
      controller.view.backgroundColor = .clear
      parentViewController.addChild(controller)
      addSubview(controller.view)
      controller.didMove(toParent: parentViewController)
      hostingController = controller
    }
    guard let controller = hostingController else { return }
    if controller.parent !== parentViewController {
      controller.willMove(toParent: nil)
      controller.removeFromParent()
      parentViewController.addChild(controller)
      controller.didMove(toParent: parentViewController)
    }
    controller.view.frame = bounds

    // GlassText uses explicit newlines and intrinsic sizing, never automatic wrapping.
    let measured = controller.sizeThatFits(in: CGSize(width: 100_000, height: 100_000))
    let scale = traitCollection.displayScale > 0 ? traitCollection.displayScale : 1
    let size = CGSize(
      width: ceil(measured.width * scale) / scale,
      height: ceil(measured.height * scale) / scale
    )
    guard size.width.isFinite, size.height.isFinite, size != lastSize else { return }
    lastSize = size
    delegate?.onContentSizeChange(
      width: size.width, height: size.height, configuration: configurationJSON
    )
  }
}
