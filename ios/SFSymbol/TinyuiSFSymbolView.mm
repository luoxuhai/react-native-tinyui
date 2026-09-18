#if TINYUI_FEATURE_SF_SYMBOL

#import "TinyuiSFSymbolView.h"
#import "TinyuiSFSymbolEffects.h"
#import "TinyuiSFSymbolImage.h"
#import "TinyuiSFSymbolShadowNode.h"
#import <React/RCTConvert.h>
#import <react/utils/FollyConvert.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface TinyuiSFSymbolView () <RCTTinyuiSFSymbolViewViewProtocol>
@end

@implementation TinyuiSFSymbolView {
  UIImageView *_imageView;
  NSDictionary *_configuration;
  NSArray<NSDictionary *> *_effects;
  NSMutableDictionary<NSString *, NSDictionary *> *_appliedEffects;
  BOOL _respectReduceMotion;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiSFSymbolComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _props = std::make_shared<const TinyuiSFSymbolViewProps>();
    [self createImageView];
    [NSNotificationCenter.defaultCenter addObserver:self selector:@selector(reduceMotionChanged:)
        name:UIAccessibilityReduceMotionStatusDidChangeNotification object:nil];
  }
  return self;
}

- (void)createImageView
{
  _imageView = [UIImageView new];
  _imageView.contentMode = UIViewContentModeCenter;
  _imageView.isAccessibilityElement = NO;
  self.contentView = _imageView;
  _configuration = nil;
  _effects = @[];
  _appliedEffects = [NSMutableDictionary dictionary];
  _respectReduceMotion = YES;
}

- (BOOL)reduceMotion
{
  return _respectReduceMotion && UIAccessibilityIsReduceMotionEnabled();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &next = *std::static_pointer_cast<const TinyuiSFSymbolViewProps>(props);
  BOOL changedMotion = _respectReduceMotion != next.respectReduceMotion;
  _respectReduceMotion = next.respectReduceMotion;
  if (changedMotion) [self clearEffects];

  NSDictionary *configuration = convertFollyDynamicToId(next.configuration);
  if (![configuration isKindOfClass:NSDictionary.class]) configuration = @{};
  if (![_configuration isEqual:configuration]) {
    UIImage *image = TinyuiSFSymbolImage(configuration, YES);
    _imageView.tintColor = [RCTConvert UIColor:configuration[@"color"]] ?: UIColor.labelColor;
    NSDictionary *transitionConfig = convertFollyDynamicToId(next.contentTransition);
    if (![transitionConfig isKindOfClass:NSDictionary.class]) transitionConfig = @{};
    NSSymbolContentTransition *transition = TinyuiSFSymbolTransition(transitionConfig);
    if (image != nil && _imageView.image != nil && self.window != nil && transition != nil && !self.reduceMotion) {
      [_imageView setSymbolImage:image withContentTransition:transition
          options:TinyuiSFSymbolOptions(transitionConfig)];
    } else {
      _imageView.image = image;
    }
    _configuration = configuration;
    if (image == nil) [self clearEffects];
  }

  if (next.resizeMode == "contain") _imageView.contentMode = UIViewContentModeScaleAspectFit;
  else if (next.resizeMode == "cover") _imageView.contentMode = UIViewContentModeScaleAspectFill;
  else if (next.resizeMode == "stretch") _imageView.contentMode = UIViewContentModeScaleToFill;
  else _imageView.contentMode = UIViewContentModeCenter;

  id effects = convertFollyDynamicToId(next.effects);
  _effects = [effects isKindOfClass:NSArray.class] ? effects : @[];
  [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];
  [self applyEffects];
}

- (void)clearEffects
{
  [_imageView removeAllSymbolEffectsWithOptions:NSSymbolEffectOptions.options animated:NO];
  [_appliedEffects removeAllObjects];
}

- (void)applyEffects
{
  if (self.window == nil || _imageView.image == nil) return;
  NSMutableDictionary<NSString *, NSDictionary *> *requested = [NSMutableDictionary dictionary];
  for (NSDictionary *configuration in _effects) {
    if (![configuration isKindOfClass:NSDictionary.class]) continue;
    NSString *type = configuration[@"type"];
    if (![type isKindOfClass:NSString.class]) continue;
    requested[type] = configuration;
  }
  for (NSString *type in _appliedEffects.allKeys) {
    NSDictionary *old = _appliedEffects[type];
    NSDictionary *next = requested[type];
    if (![old isEqual:next] || [next[@"active"] isEqual:@NO]) {
      NSSymbolEffect *effect = TinyuiSFSymbolEffect(old);
      // Reset immediately when replaying/reconfiguring, so an animated removal
      // cannot race the replacement effect. Animate only actual deactivation.
      BOOL reapplying = next != nil && ![next[@"active"] isEqual:@NO];
      BOOL animated = !reapplying && !self.reduceMotion && ![(next ?: old)[@"animated"] isEqual:@NO];
      if (effect != nil) {
        [_imageView removeSymbolEffectOfType:effect
            options:TinyuiSFSymbolOptions((next ?: old)[@"options"]) animated:animated];
      }
      [_appliedEffects removeObjectForKey:type];
    }
  }
  for (NSString *type in requested) {
    NSDictionary *configuration = requested[type];
    if ([configuration[@"active"] isEqual:@NO] || [_appliedEffects[type] isEqual:configuration]) continue;
    BOOL stateful = [@[@"scale", @"appear", @"disappear", @"drawOn", @"drawOff"] containsObject:type];
    // Keep visibility/scale state under Reduce Motion, without continuous or
    // discrete animation. Clearing those effects must still restore the state.
    if (self.reduceMotion && !stateful) continue;
    NSSymbolEffect *effect = TinyuiSFSymbolEffect(configuration);
    if (effect == nil) continue;
    [_imageView addSymbolEffect:effect options:TinyuiSFSymbolOptions(configuration[@"options"])
        animated:!self.reduceMotion && ![configuration[@"animated"] isEqual:@NO]];
    _appliedEffects[type] = configuration;
  }
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window == nil) [self clearEffects];
  else [self applyEffects];
}

- (void)reduceMotionChanged:(NSNotification *)notification
{
  [self clearEffects];
  [self applyEffects];
}

- (void)prepareForRecycle
{
  [self clearEffects];
  [super prepareForRecycle];
  [self createImageView];
}

- (void)dealloc
{
  [NSNotificationCenter.defaultCenter removeObserver:self];
}

@end

#endif
