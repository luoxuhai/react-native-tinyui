#if TINYUI_FEATURE_MENU

#import "TinyuiMenuView.h"

#import <React/RCTConversions.h>
#import <React/UIView+React.h>

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

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window != nil) {
    _menuProvider.parentViewController = [self reactViewController];
  }
}

#pragma mark - React lifecycle

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                          index:(NSInteger)index
{
  // TinyuiMenuView renders its trigger as a child; we hand it to the
  // provider, which uses it as the SwiftUI `Menu` label.
  _triggerView = childComponentView;
  _menuProvider.triggerView = childComponentView;
  [_menuProvider addSubview:childComponentView];
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

  if (oldMenuProps.menuConfig != newMenuProps.menuConfig) {
    _menuProvider.menuConfig = RCTNSStringFromString(newMenuProps.menuConfig);
  }
  if (oldMenuProps.hasPrimaryAction != newMenuProps.hasPrimaryAction) {
    _menuProvider.hasPrimaryAction = newMenuProps.hasPrimaryAction;
  }
  if (oldMenuProps.disabled != newMenuProps.disabled) {
    _menuProvider.disabled = newMenuProps.disabled;
  }

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - TinyuiMenuViewDelegate

- (void)onItemPressWithId:(NSString *)identifier
{
  if (_eventEmitter == nullptr) {
    return;
  }
  std::static_pointer_cast<const TinyuiMenuViewEventEmitter>(_eventEmitter)
      ->onItemPress(TinyuiMenuViewEventEmitter::OnItemPress{
          .id = std::string(identifier.UTF8String ?: "")});
}

- (void)onPrimaryAction
{
  if (_eventEmitter == nullptr) {
    return;
  }
  std::static_pointer_cast<const TinyuiMenuViewEventEmitter>(_eventEmitter)
      ->onPrimaryAction(TinyuiMenuViewEventEmitter::OnPrimaryAction{});
}

@end

#endif // TINYUI_FEATURE_MENU
