#if TINYUI_FEATURE_TIP_KIT
#import "TinyuiTipPopoverView.h"
#import <React/RCTConversions.h>
#import <React/UIView+React.h>
#import <react/renderer/components/TinyuiSpec/ComponentDescriptors.h>
#import <react/renderer/components/TinyuiSpec/EventEmitters.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>
#import "RCTFabricComponentsPlugins.h"
#import "Tinyui-Swift.h"

using namespace facebook::react;

@interface TinyuiTipPopoverView () <RCTTinyuiTipPopoverViewViewProtocol, TinyuiTipPopoverDelegate>
@end

@implementation TinyuiTipPopoverView {
  TinyuiTipPopoverProvider *_provider;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiTipPopoverViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TinyuiTipPopoverViewProps>();
    _props = defaultProps;
    _provider = [[TinyuiTipPopoverProvider alloc] initWithDelegate:self];
    self.contentView = _provider;
  }
  return self;
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  _provider.parentViewController = self.window != nil ? [self reactViewController] : nil;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_provider insertSubview:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &next = *std::static_pointer_cast<const TinyuiTipPopoverViewProps>(props);
  NSMutableArray *actions = [NSMutableArray new];
  for (const auto &action : next.actions) {
    [actions addObject:@{@"id": RCTNSStringFromString(action.id), @"title": RCTNSStringFromString(action.title)}];
  }
  [_provider configure:@{
    @"tipId": RCTNSStringFromString(next.tipId),
    @"title": RCTNSStringFromString(next.title),
    @"message": RCTNSStringFromString(next.message),
    @"systemImage": RCTNSStringFromString(next.systemImage),
    @"actions": actions,
    @"maxDisplayCount": @(next.maxDisplayCount),
    @"ignoresDisplayFrequency": @(next.ignoresDisplayFrequency),
  } enabled:next.enabled arrowEdge:RCTNSStringFromString(next.arrowEdge)];
  [super updateProps:props oldProps:oldProps];
}

- (void)onTipStatusWithTipId:(NSString *)tipId status:(NSString *)status reason:(NSString *)reason
{
  if (_eventEmitter == nullptr) return;
  std::static_pointer_cast<const TinyuiTipPopoverViewEventEmitter>(_eventEmitter)->onTipStatusChange({
    .tipId = std::string(tipId.UTF8String ?: ""),
    .status = std::string(status.UTF8String ?: ""),
    .reason = std::string(reason.UTF8String ?: ""),
  });
}

- (void)onTipVisibleWithTipId:(NSString *)tipId visible:(BOOL)visible
{
  if (_eventEmitter == nullptr) return;
  std::static_pointer_cast<const TinyuiTipPopoverViewEventEmitter>(_eventEmitter)->onTipVisibleChange({
    .tipId = std::string(tipId.UTF8String ?: ""), .visible = static_cast<bool>(visible),
  });
}

- (void)onTipActionWithTipId:(NSString *)tipId id:(NSString *)identifier title:(NSString *)title
{
  if (_eventEmitter == nullptr) return;
  std::static_pointer_cast<const TinyuiTipPopoverViewEventEmitter>(_eventEmitter)->onTipAction({
    .tipId = std::string(tipId.UTF8String ?: ""),
    .id = std::string(identifier.UTF8String ?: ""), .title = std::string(title.UTF8String ?: ""),
  });
}

- (void)onTipErrorWithTipId:(NSString *)tipId code:(NSString *)code message:(NSString *)message
{
  if (_eventEmitter == nullptr) return;
  std::static_pointer_cast<const TinyuiTipPopoverViewEventEmitter>(_eventEmitter)->onTipError({
    .tipId = std::string(tipId.UTF8String ?: ""),
    .code = std::string(code.UTF8String ?: ""), .message = std::string(message.UTF8String ?: ""),
  });
}

- (void)prepareForRecycle
{
  [_provider reset];
  [super prepareForRecycle];
}
@end
#endif
