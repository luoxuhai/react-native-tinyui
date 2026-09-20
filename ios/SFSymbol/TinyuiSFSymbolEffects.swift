import Symbols
import UIKit

// Preserve the native Swift effect protocols so UIKit checks supported effects
// at compile time, including the availability of newer presets.
enum TinyuiSFSymbolEffect {
  case discrete(any SymbolEffect & DiscreteSymbolEffect)
  case indefinite(any SymbolEffect & IndefiniteSymbolEffect)

  static func make(_ configuration: [String: Any]) -> TinyuiSFSymbolEffect? {
    let scope = configuration["scope"] as? String
    let direction = configuration["direction"] as? String
    switch configuration["type"] as? String {
    case "pulse":
      var effect: PulseSymbolEffect = .pulse
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      return .discrete(effect)
    case "bounce":
      var effect: BounceSymbolEffect = .bounce
      if direction == "up" { effect = effect.up }
      if direction == "down" { effect = effect.down }
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      return .discrete(effect)
    case "scale":
      var effect: ScaleSymbolEffect = .scale
      if direction == "up" { effect = effect.up }
      if direction == "down" { effect = effect.down }
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      return .indefinite(effect)
    case "appear":
      var effect: AppearSymbolEffect = .appear
      if direction == "up" { effect = effect.up }
      if direction == "down" { effect = effect.down }
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      return .indefinite(effect)
    case "disappear":
      var effect: DisappearSymbolEffect = .disappear
      if direction == "up" { effect = effect.up }
      if direction == "down" { effect = effect.down }
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      return .indefinite(effect)
    case "variableColor":
      var effect: VariableColorSymbolEffect = .variableColor
      if configuration["iteration"] as? String == "iterative" { effect = effect.iterative }
      if configuration["iteration"] as? String == "cumulative" { effect = effect.cumulative }
      if let reversing = configuration["reversing"] as? NSNumber {
        effect = reversing.boolValue ? effect.reversing : effect.nonReversing
      }
      if configuration["inactiveLayers"] as? String == "hide" { effect = effect.hideInactiveLayers }
      if configuration["inactiveLayers"] as? String == "dim" { effect = effect.dimInactiveLayers }
      return .discrete(effect)
    case "wiggle":
      guard #available(iOS 18.0, *) else { return nil }
      var effect: WiggleSymbolEffect = .wiggle
      switch direction {
      case "up": effect = effect.up
      case "down": effect = effect.down
      case "left": effect = effect.left
      case "right": effect = effect.right
      case "forward": effect = effect.forward
      case "backward": effect = effect.backward
      case "clockwise": effect = effect.clockwise
      case "counterClockwise": effect = effect.counterClockwise
      default: break
      }
      if let angle = (configuration["angle"] as? NSNumber)?.doubleValue, angle.isFinite {
        effect = WiggleSymbolEffect.wiggle.custom(angle: angle)
      }
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      return .discrete(effect)
    case "rotate":
      guard #available(iOS 18.0, *) else { return nil }
      var effect: RotateSymbolEffect = .rotate
      if direction == "clockwise" { effect = effect.clockwise }
      if direction == "counterClockwise" { effect = effect.counterClockwise }
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      return .discrete(effect)
    case "breathe":
      guard #available(iOS 18.0, *) else { return nil }
      var effect: BreatheSymbolEffect = .breathe
      if configuration["style"] as? String == "plain" { effect = effect.plain }
      if configuration["style"] as? String == "pulse" { effect = effect.pulse }
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      return .discrete(effect)
    case "drawOn":
      guard #available(iOS 26.0, *) else { return nil }
      var effect: DrawOnSymbolEffect = .drawOn
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      if scope == "individually" { effect = effect.individually }
      return .indefinite(effect)
    case "drawOff":
      guard #available(iOS 26.0, *) else { return nil }
      var effect: DrawOffSymbolEffect = .drawOff
      if scope == "byLayer" { effect = effect.byLayer }
      if scope == "wholeSymbol" { effect = effect.wholeSymbol }
      if scope == "individually" { effect = effect.individually }
      if let reversed = configuration["reversed"] as? NSNumber {
        effect = reversed.boolValue ? effect.reversed : effect.nonReversed
      }
      return .indefinite(effect)
    default: return nil
    }
  }

  @MainActor
  func add(to imageView: UIImageView, options: SymbolEffectOptions, animated: Bool) {
    switch self {
    case .discrete(let effect): imageView.addSymbolEffect(effect, options: options, animated: animated)
    case .indefinite(let effect): imageView.addSymbolEffect(effect, options: options, animated: animated)
    }
  }

  @MainActor
  func remove(from imageView: UIImageView, options: SymbolEffectOptions, animated: Bool) {
    switch self {
    case .discrete(let effect):
      imageView.removeSymbolEffect(ofType: effect, options: options, animated: animated)
    case .indefinite(let effect):
      imageView.removeSymbolEffect(ofType: effect, options: options, animated: animated)
    }
  }
}

func tinyuiSFSymbolOptions(_ configuration: [String: Any]?) -> SymbolEffectOptions {
  var options = SymbolEffectOptions.default
  guard let configuration else { return options }
  let speed = (configuration["speed"] as? NSNumber)?.doubleValue ?? 1
  if speed.isFinite, speed > 0 { options = options.speed(speed) }
  let repetition = configuration["repeat"] as? NSNumber
  if repetition == NSNumber(value: false) { return options.nonRepeating }
  // JS validates safe integers; cap the conversion at the native integer range.
  let rawCount = repetition?.doubleValue ?? 1
  let count = rawCount.isFinite ? Int(max(1, min(rawCount, Double(Int.max) / 2))) : 1
  let behavior = configuration["repeatBehavior"] as? String
  let delayValue = configuration["repeatDelay"] as? NSNumber
  let rawDelay = delayValue?.doubleValue ?? 0
  let delay = rawDelay.isFinite && rawDelay >= 0 ? rawDelay : 0
  let forever = configuration["repeat"] as? String == "forever" || behavior != nil || delayValue != nil

  if #available(iOS 18.0, *) {
    if behavior == "continuous" {
      options = options.repeat(.continuous)
    } else if repetition != nil {
      options = options.repeat(.periodic(count, delay: delayValue == nil ? nil : delay))
    } else if forever {
      options = options.repeat(.periodic(nil, delay: delayValue == nil ? nil : delay))
    }
  } else {
    if repetition != nil { options = options.repeat(count) }
    else if forever { options = options.repeating }
  }
  return options
}

func tinyuiSFSymbolTransition(
  _ configuration: [String: Any]
) -> (any SymbolEffect & ContentTransitionSymbolEffect)? {
  let type = configuration["type"] as? String
  if type == "automatic" { return AutomaticSymbolEffect.automatic }
  guard type == "replace" || type == "magicReplace" else { return nil }

  var transition: ReplaceSymbolEffect = .replace
  switch configuration["direction"] as? String {
  case "downUp": transition = transition.downUp
  case "upUp": transition = transition.upUp
  case "offUp": transition = transition.offUp
  default: break
  }
  if configuration["scope"] as? String == "byLayer" { transition = transition.byLayer }
  if configuration["scope"] as? String == "wholeSymbol" { transition = transition.wholeSymbol }
  if #available(iOS 18.0, *), type == "magicReplace" {
    return ReplaceSymbolEffect.replace.magic(fallback: transition)
  }
  return transition
}
