import React
import Symbols
import UIKit

@objc(TinyuiSFSymbolProvider)
public final class TinyuiSFSymbolProvider: UIImageView {
  private var configuration: NSDictionary?
  private var effects: [[String: Any]] = []
  private var appliedEffects: [String: [String: Any]] = [:]
  private var respectReduceMotion = true

  public override init(frame: CGRect) {
    super.init(frame: frame)
    contentMode = .center
    isAccessibilityElement = false
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(reduceMotionChanged),
      name: UIAccessibility.reduceMotionStatusDidChangeNotification,
      object: nil
    )
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

  private var reduceMotion: Bool {
    respectReduceMotion && UIAccessibility.isReduceMotionEnabled
  }

  @objc(configure:effects:contentTransition:respectReduceMotion:resizeMode:)
  public func configure(
    _ value: Any?,
    effects: Any?,
    contentTransition: Any?,
    respectReduceMotion: Bool,
    resizeMode: String
  ) {
    let changedMotion = self.respectReduceMotion != respectReduceMotion
    self.respectReduceMotion = respectReduceMotion
    if changedMotion { clearEffects() }

    let next = value as? [String: Any] ?? [:]
    if configuration?.isEqual(to: next) != true {
      let nextImage = TinyuiSFSymbolImage.image(configuration: next, includeColors: true)
      tintColor = next["color"].flatMap(RCTConvert.uiColor) ?? .label
      let transitionConfiguration = contentTransition as? [String: Any] ?? [:]
      if let nextImage, image != nil, window != nil, !reduceMotion,
        let transition = tinyuiSFSymbolTransition(transitionConfiguration)
      {
        setSymbolImage(
          nextImage,
          contentTransition: transition,
          options: tinyuiSFSymbolOptions(transitionConfiguration)
        )
      } else {
        image = nextImage
      }
      configuration = next as NSDictionary
      if nextImage == nil { clearEffects() }
    }

    switch resizeMode {
    case "contain": contentMode = .scaleAspectFit
    case "cover": contentMode = .scaleAspectFill
    case "stretch": contentMode = .scaleToFill
    default: contentMode = .center
    }
    self.effects = effects as? [[String: Any]] ?? []
  }

  @objc public func clearEffects() {
    removeAllSymbolEffects(options: .default, animated: false)
    appliedEffects.removeAll()
  }

  @objc public func applyEffects() {
    guard window != nil, image != nil else { return }
    var requested: [String: [String: Any]] = [:]
    for configuration in effects {
      guard let type = configuration["type"] as? String else { continue }
      requested[type] = configuration
    }
    for (type, old) in appliedEffects {
      let next = requested[type]
      if next.map({ NSDictionary(dictionary: old).isEqual(to: $0) }) != true
        || (next?["active"] as? NSNumber)?.boolValue == false
      {
        // Reset immediately when replaying/reconfiguring so removal cannot race
        // the replacement effect. Only animate an actual deactivation.
        let reapplying = next != nil && (next?["active"] as? NSNumber)?.boolValue != false
        let animated = !reapplying && !reduceMotion
          && ((next ?? old)["animated"] as? NSNumber)?.boolValue != false
        TinyuiSFSymbolEffect.make(old)?.remove(
          from: self,
          options: tinyuiSFSymbolOptions((next ?? old)["options"] as? [String: Any]),
          animated: animated
        )
        appliedEffects.removeValue(forKey: type)
      }
    }
    for (type, configuration) in requested {
      if (configuration["active"] as? NSNumber)?.boolValue == false
        || appliedEffects[type].map({ NSDictionary(dictionary: $0).isEqual(to: configuration) }) == true
      {
        continue
      }
      let stateful = ["scale", "appear", "disappear", "drawOn", "drawOff"].contains(type)
      // Keep visibility/scale state under Reduce Motion without animating it.
      if reduceMotion && !stateful { continue }
      guard let effect = TinyuiSFSymbolEffect.make(configuration) else { continue }
      effect.add(
        to: self,
        options: tinyuiSFSymbolOptions(configuration["options"] as? [String: Any]),
        animated: !reduceMotion && (configuration["animated"] as? NSNumber)?.boolValue != false
      )
      appliedEffects[type] = configuration
    }
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil { clearEffects() }
    else { applyEffects() }
  }

  @objc private func reduceMotionChanged() {
    clearEffects()
    applyEffects()
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }
}
