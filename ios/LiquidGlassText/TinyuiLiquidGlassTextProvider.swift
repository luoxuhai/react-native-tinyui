import CoreText
import SwiftUI
import UIKit

private struct LiquidGlassTextConfiguration {
  struct TextStyleConfiguration {
    let fontSize: CGFloat?
    let fontFamily: String?
    let fontWeight: String?
    let fontStyle: String?
    let letterSpacing: CGFloat?

    init(_ dictionary: [String: Any]) {
      fontSize = (dictionary["fontSize"] as? NSNumber).map { CGFloat($0.doubleValue) }
      fontFamily = dictionary["fontFamily"] as? String
      fontWeight = dictionary["fontWeight"] as? String
      fontStyle = dictionary["fontStyle"] as? String
      letterSpacing = (dictionary["letterSpacing"] as? NSNumber).map { CGFloat($0.doubleValue) }
    }
  }

  var text: String?
  var effect: String?
  var interactive: Bool?
  var fontDesign: String?
  var textStyle: TextStyleConfiguration?
  var multilineTextAlignment: String?

  init(_ dictionary: [String: Any] = [:]) {
    text = dictionary["text"] as? String
    effect = dictionary["effect"] as? String
    interactive = dictionary["interactive"] as? Bool
    fontDesign = dictionary["fontDesign"] as? String
    textStyle = (dictionary["textStyle"] as? [String: Any]).map(TextStyleConfiguration.init)
    multilineTextAlignment = dictionary["multilineTextAlignment"] as? String
  }

  var resolvedFont: Font {
    let design: Font.Design
    switch fontDesign {
    case "serif": design = .serif
    case "monospaced": design = .monospaced
    case "rounded": design = .rounded
    default: design = .default
    }

    let size = textStyle?.fontSize
    let family = textStyle?.fontFamily
    var result: Font
    if let family, !family.isEmpty {
      if let size, size.isFinite, size > 0 {
        result = .custom(family, fixedSize: size)
      } else {
        result = .custom(family, size: 17, relativeTo: .body)
      }
    } else if let size, size.isFinite, size > 0 {
      result = .system(size: size, design: design)
    } else {
      result = .system(.body, design: design)
    }

    if let weight = textStyle?.fontWeight {
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
    if textStyle?.fontStyle == "italic" {
      result = result.italic()
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

  var resolvedLetterSpacing: CGFloat {
    guard let letterSpacing = textStyle?.letterSpacing, letterSpacing.isFinite else { return 0 }
    return letterSpacing
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
          effect: configuration.effect ?? "clear",
          tintColor: tintColor,
          interactive: configuration.interactive ?? false,
          letterSpacing: configuration.resolvedLetterSpacing
        )
      } else {
        Text(verbatim: text)
          .tracking(configuration.resolvedLetterSpacing)
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
  let letterSpacing: CGFloat

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
        attributes: [
          kCTFontAttributeName as NSAttributedString.Key: ctFont,
          kCTKernAttributeName as NSAttributedString.Key: letterSpacing,
        ]
      )
      return max(width, CGFloat(CTLineGetTypographicBounds(
        CTLineCreateWithAttributedString(attributed), nil, nil, nil
      )))
    }
    let shape = TinyuiTextOutlineShape(
      text: text,
      ctFont: ctFont,
      fontSize: resolved.pointSize,
      alignment: alignment,
      letterSpacing: letterSpacing
    )
    Rectangle()
      .fill(.clear)
      .glassEffect(glass, in: shape)
      .frame(width: width, height: text.isEmpty ? 0 : lineHeight * CGFloat(lines.count))
  }
}

@objc public class TinyuiLiquidGlassTextProvider: UIView {
  private var hostingController: UIHostingController<LiquidGlassTextContent>?
  private var configuration = LiquidGlassTextConfiguration()
  private var tintColorValue: UIColor?

  @objc public weak var parentViewController: UIViewController? {
    didSet { setNeedsLayout() }
  }

  @objc public func configure(
    _ dictionary: [String: Any],
    tintColor: UIColor?
  ) {
    configuration = LiquidGlassTextConfiguration(dictionary)
    tintColorValue = tintColor
    hostingController?.rootView = content
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
      setNeedsLayout()
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
    configuration = LiquidGlassTextConfiguration()
    tintColorValue = nil
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
  }
}
