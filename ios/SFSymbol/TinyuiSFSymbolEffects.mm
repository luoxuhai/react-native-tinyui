#if TINYUI_FEATURE_SF_SYMBOL

#import "TinyuiSFSymbolEffects.h"
#include <cmath>

// Keep the concrete receiver types so the compiler checks every Symbols API.
#define TINYUI_LAYER_SCOPE(effect) \
  if ([scope isEqual:@"byLayer"]) effect = [effect effectWithByLayer]; \
  if ([scope isEqual:@"wholeSymbol"]) effect = [effect effectWithWholeSymbol];

NSSymbolEffect *TinyuiSFSymbolEffect(NSDictionary *configuration)
{
  NSString *type = configuration[@"type"];
  NSString *scope = configuration[@"scope"];
  NSString *direction = configuration[@"direction"];
  if ([type isEqual:@"pulse"]) {
    NSSymbolPulseEffect *effect = NSSymbolPulseEffect.effect;
    TINYUI_LAYER_SCOPE(effect);
    return effect;
  }
  if ([type isEqual:@"bounce"]) {
    NSSymbolBounceEffect *effect = NSSymbolBounceEffect.effect;
    if ([direction isEqual:@"up"]) effect = NSSymbolBounceEffect.bounceUpEffect;
    if ([direction isEqual:@"down"]) effect = NSSymbolBounceEffect.bounceDownEffect;
    TINYUI_LAYER_SCOPE(effect);
    return effect;
  }
  if ([type isEqual:@"scale"]) {
    NSSymbolScaleEffect *effect = NSSymbolScaleEffect.effect;
    if ([direction isEqual:@"up"]) effect = NSSymbolScaleEffect.scaleUpEffect;
    if ([direction isEqual:@"down"]) effect = NSSymbolScaleEffect.scaleDownEffect;
    TINYUI_LAYER_SCOPE(effect);
    return effect;
  }
  if ([type isEqual:@"appear"]) {
    NSSymbolAppearEffect *effect = NSSymbolAppearEffect.effect;
    if ([direction isEqual:@"up"]) effect = NSSymbolAppearEffect.appearUpEffect;
    if ([direction isEqual:@"down"]) effect = NSSymbolAppearEffect.appearDownEffect;
    TINYUI_LAYER_SCOPE(effect);
    return effect;
  }
  if ([type isEqual:@"disappear"]) {
    NSSymbolDisappearEffect *effect = NSSymbolDisappearEffect.effect;
    if ([direction isEqual:@"up"]) effect = NSSymbolDisappearEffect.disappearUpEffect;
    if ([direction isEqual:@"down"]) effect = NSSymbolDisappearEffect.disappearDownEffect;
    TINYUI_LAYER_SCOPE(effect);
    return effect;
  }
  if ([type isEqual:@"variableColor"]) {
    NSSymbolVariableColorEffect *effect = NSSymbolVariableColorEffect.effect;
    if ([configuration[@"iteration"] isEqual:@"iterative"]) effect = [effect effectWithIterative];
    if ([configuration[@"iteration"] isEqual:@"cumulative"]) effect = [effect effectWithCumulative];
    if ([configuration[@"reversing"] isKindOfClass:NSNumber.class]) {
      effect = [configuration[@"reversing"] boolValue]
          ? [effect effectWithReversing] : [effect effectWithNonReversing];
    }
    if ([configuration[@"inactiveLayers"] isEqual:@"hide"]) effect = [effect effectWithHideInactiveLayers];
    if ([configuration[@"inactiveLayers"] isEqual:@"dim"]) effect = [effect effectWithDimInactiveLayers];
    return effect;
  }
  if (@available(iOS 18.0, *)) {
    if ([type isEqual:@"wiggle"]) {
      NSSymbolWiggleEffect *effect = NSSymbolWiggleEffect.effect;
      if ([direction isEqual:@"up"]) effect = NSSymbolWiggleEffect.wiggleUpEffect;
      if ([direction isEqual:@"down"]) effect = NSSymbolWiggleEffect.wiggleDownEffect;
      if ([direction isEqual:@"left"]) effect = NSSymbolWiggleEffect.wiggleLeftEffect;
      if ([direction isEqual:@"right"]) effect = NSSymbolWiggleEffect.wiggleRightEffect;
      if ([direction isEqual:@"forward"]) effect = NSSymbolWiggleEffect.wiggleForwardEffect;
      if ([direction isEqual:@"backward"]) effect = NSSymbolWiggleEffect.wiggleBackwardEffect;
      if ([direction isEqual:@"clockwise"]) effect = NSSymbolWiggleEffect.wiggleClockwiseEffect;
      if ([direction isEqual:@"counterClockwise"]) effect = NSSymbolWiggleEffect.wiggleCounterClockwiseEffect;
      id angle = configuration[@"angle"];
      if ([angle isKindOfClass:NSNumber.class] && std::isfinite([angle doubleValue])) {
        effect = [NSSymbolWiggleEffect wiggleCustomAngleEffect:[angle doubleValue]];
      }
      TINYUI_LAYER_SCOPE(effect);
      return effect;
    }
    if ([type isEqual:@"rotate"]) {
      NSSymbolRotateEffect *effect = NSSymbolRotateEffect.effect;
      if ([direction isEqual:@"clockwise"]) effect = NSSymbolRotateEffect.rotateClockwiseEffect;
      if ([direction isEqual:@"counterClockwise"]) effect = NSSymbolRotateEffect.rotateCounterClockwiseEffect;
      TINYUI_LAYER_SCOPE(effect);
      return effect;
    }
    if ([type isEqual:@"breathe"]) {
      NSSymbolBreatheEffect *effect = NSSymbolBreatheEffect.effect;
      if ([configuration[@"style"] isEqual:@"plain"]) effect = NSSymbolBreatheEffect.breathePlainEffect;
      if ([configuration[@"style"] isEqual:@"pulse"]) effect = NSSymbolBreatheEffect.breathePulseEffect;
      TINYUI_LAYER_SCOPE(effect);
      return effect;
    }
  }
  if (@available(iOS 26.0, *)) {
    if ([type isEqual:@"drawOn"]) {
      NSSymbolDrawOnEffect *effect = NSSymbolDrawOnEffect.effect;
      TINYUI_LAYER_SCOPE(effect);
      if ([scope isEqual:@"individually"]) effect = [effect effectWithIndividually];
      return effect;
    }
    if ([type isEqual:@"drawOff"]) {
      NSSymbolDrawOffEffect *effect = NSSymbolDrawOffEffect.effect;
      TINYUI_LAYER_SCOPE(effect);
      if ([scope isEqual:@"individually"]) effect = [effect effectWithIndividually];
      if ([configuration[@"reversed"] isKindOfClass:NSNumber.class]) {
        effect = [configuration[@"reversed"] boolValue]
            ? [effect effectWithReversed] : [effect effectWithNonReversed];
      }
      return effect;
    }
  }
  return nil;
}

#undef TINYUI_LAYER_SCOPE

NSSymbolEffectOptions *TinyuiSFSymbolOptions(NSDictionary *configuration)
{
  NSSymbolEffectOptions *options = NSSymbolEffectOptions.options;
  if (![configuration isKindOfClass:NSDictionary.class]) return options;
  id speedValue = configuration[@"speed"];
  double speed = [speedValue isKindOfClass:NSNumber.class] ? [speedValue doubleValue] : 1;
  if (std::isfinite(speed) && speed > 0) options = [options optionsWithSpeed:speed];
  id repeat = configuration[@"repeat"];
  if ([repeat isEqual:@NO]) return [options optionsWithNonRepeating];
  BOOL countProvided = [repeat isKindOfClass:NSNumber.class];
  // JS validates safe integers; cap the conversion at the native integer range.
  NSInteger count = countProvided ? (NSInteger)fmin([repeat doubleValue], (double)NSIntegerMax / 2) : 1;
  count = MAX(1, count);
  id behaviorValue = configuration[@"repeatBehavior"];
  NSString *behavior = [behaviorValue isKindOfClass:NSString.class] ? behaviorValue : nil;
  id delayValue = configuration[@"repeatDelay"];
  BOOL hasDelay = [delayValue isKindOfClass:NSNumber.class];
  double delay = hasDelay ? [delayValue doubleValue] : 0;
  if (!std::isfinite(delay) || delay < 0) delay = 0;
  BOOL forever = [repeat isEqual:@"forever"] || behavior != nil || hasDelay;

  if (@available(iOS 18.0, *)) {
    NSSymbolEffectOptionsRepeatBehavior *repetition = nil;
    if ([behavior isEqual:@"continuous"]) {
      repetition = NSSymbolEffectOptionsRepeatBehavior.behaviorContinuous;
    } else if (countProvided) {
      repetition = hasDelay
          ? [NSSymbolEffectOptionsRepeatBehavior behaviorPeriodicWithCount:count delay:delay]
          : [NSSymbolEffectOptionsRepeatBehavior behaviorPeriodicWithCount:count];
    } else if (forever) {
      repetition = hasDelay
          ? [NSSymbolEffectOptionsRepeatBehavior behaviorPeriodicWithDelay:delay]
          : NSSymbolEffectOptionsRepeatBehavior.behaviorPeriodic;
    }
    if (repetition != nil) options = [options optionsWithRepeatBehavior:repetition];
  } else {
    if (countProvided) options = [options optionsWithRepeatCount:count];
    else if (forever) options = [options optionsWithRepeating];
  }
  return options;
}

NSSymbolContentTransition *TinyuiSFSymbolTransition(NSDictionary *configuration)
{
  NSString *type = configuration[@"type"];
  if ([type isEqual:@"automatic"]) return NSSymbolAutomaticContentTransition.transition;
  if (![type isEqual:@"replace"] && ![type isEqual:@"magicReplace"]) return nil;

  NSSymbolReplaceContentTransition *transition = NSSymbolReplaceContentTransition.transition;
  NSString *direction = configuration[@"direction"];
  if ([direction isEqual:@"downUp"]) transition = NSSymbolReplaceContentTransition.replaceDownUpTransition;
  if ([direction isEqual:@"upUp"]) transition = NSSymbolReplaceContentTransition.replaceUpUpTransition;
  if ([direction isEqual:@"offUp"]) transition = NSSymbolReplaceContentTransition.replaceOffUpTransition;
  if ([configuration[@"scope"] isEqual:@"byLayer"]) transition = [transition transitionWithByLayer];
  if ([configuration[@"scope"] isEqual:@"wholeSymbol"]) transition = [transition transitionWithWholeSymbol];
  if (@available(iOS 18.0, *)) {
    if ([type isEqual:@"magicReplace"]) {
      return [NSSymbolReplaceContentTransition magicTransitionWithFallback:transition];
    }
  }
  return transition;
}

#endif
