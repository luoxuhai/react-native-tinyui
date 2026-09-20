#if TINYUI_FEATURE_SF_SYMBOL

#import "TinyuiSFSymbolView.h"
#import "TinyuiSFSymbolShadowNode.h"
#import "Tinyui-Swift.h"
#import <react/utils/FollyConvert.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface TinyuiSFSymbolView () <RCTTinyuiSFSymbolViewViewProtocol>
@end

@implementation TinyuiSFSymbolView {
  TinyuiSFSymbolProvider *_provider;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiSFSymbolComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _props = std::make_shared<const TinyuiSFSymbolViewProps>();
    [self createProvider];
  }
  return self;
}

- (void)createProvider
{
  _provider = [[TinyuiSFSymbolProvider alloc] initWithFrame:CGRectZero];
  self.contentView = _provider;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &next = *std::static_pointer_cast<const TinyuiSFSymbolViewProps>(props);
  [_provider configure:convertFollyDynamicToId(next.configuration)
               effects:convertFollyDynamicToId(next.effects)
     contentTransition:convertFollyDynamicToId(next.contentTransition)
   respectReduceMotion:next.respectReduceMotion
            resizeMode:[NSString stringWithUTF8String:next.resizeMode.c_str()]];
  [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];
  [_provider applyEffects];
}

- (void)prepareForRecycle
{
  [_provider clearEffects];
  [super prepareForRecycle];
  [self createProvider];
}

@end

#endif
