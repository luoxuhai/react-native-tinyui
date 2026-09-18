#if TINYUI_FEATURE_MENU

#import "TinyuiMenuView.h"

#import <React/RCTConversions.h>
#import <react/utils/FollyConvert.h>

#import <react/renderer/components/TinyuiSpec/ComponentDescriptors.h>
#import <react/renderer/components/TinyuiSpec/EventEmitters.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

#if __has_include("Tinyui-Swift.h")
#import "Tinyui-Swift.h"
#endif

using namespace facebook::react;

@interface TinyuiMenuView () <RCTTinyuiMenuViewViewProtocol, TinyuiMenuViewDelegate>
@end

@implementation TinyuiMenuView {
  TinyuiMenuProvider *_menuProvider;
  UIView *_triggerView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiMenuViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TinyuiMenuViewProps>();
    _props = defaultProps;

    _menuProvider = [[TinyuiMenuProvider alloc] initWithDelegate:self];
    self.contentView = _menuProvider;
  }
  return self;
}

#pragma mark - React lifecycle

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                          index:(NSInteger)index
{
  // TinyuiMenuView renders its trigger as a child; the UIButton-backed
  // provider uses it as the menu's visual content.
  _triggerView = childComponentView;
  _menuProvider.triggerView = childComponentView;
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                            index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
  if (_triggerView == childComponentView) {
    _triggerView = nil;
    _menuProvider.triggerView = nil;
  }
}

#pragma mark - Props

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps
{
  const auto &oldMenuProps = *std::static_pointer_cast<TinyuiMenuViewProps const>(_props);
  const auto &newMenuProps = *std::static_pointer_cast<TinyuiMenuViewProps const>(props);

  if (oldMenuProps.menuConfig != newMenuProps.menuConfig ||
      oldMenuProps.title != newMenuProps.title ||
      oldMenuProps.disabled != newMenuProps.disabled) {
    [_menuProvider updateWithMenuConfig:convertFollyDynamicToId(newMenuProps.menuConfig)
                                 title:RCTNSStringFromString(newMenuProps.title)
                              disabled:newMenuProps.disabled];
  }

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - TinyuiMenuViewDelegate

- (void)onActionPressWithId:(NSString *)identifier title:(NSString *)title
{
  if (_eventEmitter == nullptr) {
    return;
  }
  std::static_pointer_cast<const TinyuiMenuViewEventEmitter>(_eventEmitter)
      ->onActionPress(TinyuiMenuViewEventEmitter::OnActionPress{
          .id = std::string(identifier.UTF8String ?: ""),
          .title = std::string(title.UTF8String ?: "")});
}

@end

#endif // TINYUI_FEATURE_MENU
