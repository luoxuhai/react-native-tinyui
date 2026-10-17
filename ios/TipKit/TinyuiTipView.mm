#if TINYUI_FEATURE_TIP_KIT
#import "TinyuiTipView.h"
#import "TinyuiTipViewShadowNode.h"
#import "Tinyui-Swift.h"
#import <React/RCTConversions.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface TinyuiTipView () <RCTTinyuiTipViewViewProtocol, TinyuiTipViewDelegate>
@end

@implementation TinyuiTipView {
  TinyuiTipViewProvider *_provider;
  TinyuiInlineTipShadowNode::ConcreteState::Shared _state;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiInlineTipComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _props = TinyuiInlineTipShadowNode::defaultSharedProps();
    _provider = [[TinyuiTipViewProvider alloc] initWithDelegate:self];
    self.contentView = _provider;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &next = *std::static_pointer_cast<const TinyuiTipViewProps>(props);
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
    @"showsCloseButton": @(next.showsCloseButton),
    @"maxDisplayCount": @(next.maxDisplayCount),
    @"ignoresDisplayFrequency": @(next.ignoresDisplayFrequency),
  } enabled:next.enabled arrowEdge:RCTNSStringFromString(next.arrowEdge)];
  [super updateProps:props oldProps:oldProps];
}

- (void)updateState:(const State::Shared &)state oldState:(const State::Shared &)oldState
{
  _state = std::static_pointer_cast<const TinyuiInlineTipShadowNode::ConcreteState>(state);
  [_provider setNeedsLayout];
}

- (void)onTipSizeChangeWithTipId:(NSString *)tipId width:(CGFloat)width height:(CGFloat)height
{
  if (_state == nullptr) return;
  const auto &previous = _state->getData();
  std::string identifier(tipId.UTF8String ?: "");
  facebook::react::Size size{static_cast<Float>(width), static_cast<Float>(height)};
  if (previous.tipId == identifier && previous.contentSize == size) return;
  _state->updateState(TinyuiInlineTipState{identifier, size});
}

- (void)onTipActionWithTipId:(NSString *)tipId id:(NSString *)identifier title:(NSString *)title
{
  if (_eventEmitter == nullptr) return;
  std::static_pointer_cast<const TinyuiTipViewEventEmitter>(_eventEmitter)->onTipAction({
    .tipId = std::string(tipId.UTF8String ?: ""),
    .id = std::string(identifier.UTF8String ?: ""), .title = std::string(title.UTF8String ?: ""),
  });
}

- (void)onTipErrorWithTipId:(NSString *)tipId code:(NSString *)code message:(NSString *)message
{
  if (_eventEmitter == nullptr) return;
  std::static_pointer_cast<const TinyuiTipViewEventEmitter>(_eventEmitter)->onTipError({
    .tipId = std::string(tipId.UTF8String ?: ""),
    .code = std::string(code.UTF8String ?: ""), .message = std::string(message.UTF8String ?: ""),
  });
}

- (void)onTipInvalidatedWithTipId:(NSString *)tipId reason:(NSString *)reason
{
  if (_eventEmitter == nullptr) return;
  std::static_pointer_cast<const TinyuiTipViewEventEmitter>(_eventEmitter)->onTipInvalidated({
    .tipId = std::string(tipId.UTF8String ?: ""),
    .reason = std::string(reason.UTF8String ?: "unknown"),
  });
}

- (void)prepareForRecycle
{
  _state.reset();
  [_provider reset];
  [super prepareForRecycle];
}
@end
#endif
