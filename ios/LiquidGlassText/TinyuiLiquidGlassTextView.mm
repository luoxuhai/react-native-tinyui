#if TINYUI_FEATURE_LIQUID_GLASS_TEXT

#import "TinyuiLiquidGlassTextView.h"

#import <React/RCTConversions.h>
#import <React/UIView+React.h>
#import <react/utils/FollyConvert.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>
#import "RCTFabricComponentsPlugins.h"
#import "Tinyui-Swift.h"
#import "TinyuiLiquidGlassTextShadowNode.h"

using namespace facebook::react;

@interface TinyuiLiquidGlassTextView () <RCTTinyuiLiquidGlassTextViewViewProtocol>
@end

@implementation TinyuiLiquidGlassTextView {
  TinyuiLiquidGlassTextProvider *_provider;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiLiquidGlassTextComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TinyuiLiquidGlassTextViewProps>();
    _props = defaultProps;
    _provider = [[TinyuiLiquidGlassTextProvider alloc] initWithFrame:CGRectZero];
    self.contentView = _provider;
  }
  return self;
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window != nil) {
    _provider.parentViewController = [self reactViewController];
  }
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<TinyuiLiquidGlassTextViewProps const>(props);
  [_provider configure:convertFollyDynamicToId(newProps.configuration)
             tintColor:RCTUIColorFromSharedColor(newProps.tintColor)];
  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
  [_provider reset];
  [super prepareForRecycle];
}

@end

#endif
