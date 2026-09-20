import React
import UIKit

// Shared by Fabric measurement and the mounted view so their metrics match.
// Keep image creation independent of UIView and the main actor: Fabric measures
// on a background thread without dispatching synchronously to the main queue.
@objc(TinyuiSFSymbolImage)
public final class TinyuiSFSymbolImage: NSObject {
  @objc(imageWithConfiguration:includeColors:)
  public static func image(
    configuration: [String: Any],
    includeColors: Bool
  ) -> UIImage? {
    guard let name = configuration["name"] as? String, !name.isEmpty else { return nil }

    var size = (configuration["size"] as? NSNumber)?.doubleValue ?? 17
    if !size.isFinite || size <= 0 { size = 17 }
    let weight = symbolWeight(configuration["weight"] as? String)
    let scale = symbolScale(configuration["scale"] as? String)
    if let fontScale = (configuration["fontScale"] as? NSNumber)?.doubleValue,
      fontScale.isFinite, fontScale > 0
    {
      size *= fontScale
    }

    var symbol = UIImage.SymbolConfiguration(pointSize: CGFloat(size), weight: weight, scale: scale)

    if includeColors {
      let color = configuration["color"].flatMap(RCTConvert.uiColor) ?? .label
      let colors: UIImage.SymbolConfiguration?
      switch configuration["renderingMode"] as? String {
      case "monochrome": colors = .preferringMonochrome()
      case "multicolor": colors = .preferringMulticolor()
      case "hierarchical": colors = UIImage.SymbolConfiguration(hierarchicalColor: color)
      case "palette":
        let values = configuration["paletteColors"] as? [Any] ?? []
        let palette = Array(values.compactMap(RCTConvert.uiColor).prefix(3))
        colors = UIImage.SymbolConfiguration(paletteColors: palette.isEmpty ? [color] : palette)
      default: colors = nil
      }
      if let colors { symbol = symbol.applying(colors) }
    }

    if #available(iOS 26.0, *) {
      let variableMode: UIImage.SymbolVariableValueMode
      switch configuration["variableValueMode"] as? String {
      case "color": variableMode = .color
      case "draw": variableMode = .draw
      default: variableMode = .automatic
      }
      symbol = symbol.applying(UIImage.SymbolConfiguration(variableValueMode: variableMode))

      let colorMode: UIImage.SymbolColorRenderingMode
      switch configuration["colorRenderingMode"] as? String {
      case "flat": colorMode = .flat
      case "gradient": colorMode = .gradient
      default: colorMode = .automatic
      }
      symbol = symbol.applying(UIImage.SymbolConfiguration(colorRenderingMode: colorMode))
    }

    let asset = configuration["source"] as? String == "asset"
    let image: UIImage?
    if let variableValue = configuration["variableValue"] as? NSNumber {
      let value = variableValue.doubleValue
      let clamped = value.isFinite ? min(1, max(0, value)) : 0
      image = asset
        ? UIImage(named: name, in: .main, variableValue: clamped, configuration: symbol)
        : UIImage(systemName: name, variableValue: clamped, configuration: symbol)
    } else {
      image = asset
        ? UIImage(named: name, in: .main, with: symbol)
        : UIImage(systemName: name, withConfiguration: symbol)
    }
    // Symbol content transitions are undefined for ordinary bitmap assets.
    return image?.isSymbolImage == true ? image : nil
  }

  private static func symbolWeight(_ value: String?) -> UIImage.SymbolWeight {
    switch value {
    case "ultraLight": return .ultraLight
    case "thin": return .thin
    case "light": return .light
    case "regular": return .regular
    case "medium": return .medium
    case "semibold": return .semibold
    case "bold": return .bold
    case "heavy": return .heavy
    case "black": return .black
    default: return .unspecified
    }
  }

  private static func symbolScale(_ value: String?) -> UIImage.SymbolScale {
    switch value {
    case "small": return .small
    case "medium": return .medium
    case "large": return .large
    case "unspecified": return .unspecified
    default: return .default
    }
  }
}
