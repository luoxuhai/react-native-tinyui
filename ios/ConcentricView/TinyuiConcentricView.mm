#if TINYUI_FEATURE_CONCENTRIC_VIEW

#import "TinyuiConcentricView.h"

#import <react/renderer/components/TinyuiSpec/ComponentDescriptors.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface TinyuiConcentricView () <RCTTinyuiConcentricViewViewProtocol>
@end

@implementation TinyuiConcentricView

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiConcentricViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TinyuiConcentricViewProps>();
    _props = defaultProps;
  }
  return self;
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];
  [self applyCornerConfiguration];
}

- (void)traitCollectionDidChange:(UITraitCollection *)previousTraitCollection
{
  [super traitCollectionDidChange:previousTraitCollection];
  if ([self.traitCollection hasDifferentColorAppearanceComparedToTraitCollection:previousTraitCollection]) {
    [self applyCornerConfiguration];
  }
}

- (void)applyCornerConfiguration
{
  // Fabric updates layer.cornerRadius while applying view styles. Configure
  // UIKit afterwards so it owns the resolved radii, including on layout changes.
  if (@available(iOS 26.0, *)) {
    self.cornerConfiguration = [UICornerConfiguration configurationWithRadius:
        [UICornerRadius containerConcentricRadius]];
  } else {
    const auto &props = *std::static_pointer_cast<const TinyuiConcentricViewProps>(_props);
    self.layer.cornerRadius = props.minimumRadius;
    self.layer.cornerCurve = kCACornerCurveContinuous;
  }
}

@end

#endif
