#if TINYUI_FEATURE_POPOVER

#import "TinyuiPopoverView.h"

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

@interface TinyuiPopoverView () <RCTTinyuiPopoverViewViewProtocol, TinyuiPopoverViewDelegate>
@end

@implementation TinyuiPopoverView {
  TinyuiPopoverProvider *_popoverProvider;
  UIView *_triggerView;
  UIView<RCTComponentViewProtocol> *_contentComponentView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiPopoverViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TinyuiPopoverViewProps>();
    _props = defaultProps;

    _popoverProvider = [[TinyuiPopoverProvider alloc] initWithDelegate:self];
    self.contentView = _popoverProvider;
  }
  return self;
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window != nil) {
    _popoverProvider.parentViewController = [self reactViewController];
  }
}

#pragma mark - React lifecycle

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                          index:(NSInteger)index
{
  if (_triggerView == nil) {
    // First child is the trigger, used as the popover's anchor.
    _triggerView = childComponentView;
    _popoverProvider.triggerView = childComponentView;
    [_popoverProvider addSubview:childComponentView];
    return;
  }

  // Second child is the popover content, presented inside the popover.
  NSAssert(_contentComponentView == nil, @"TinyuiPopoverView accepts one content child.");
  _contentComponentView = childComponentView;
  _popoverProvider.contentView = childComponentView;
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                            index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
  if (_triggerView == childComponentView) {
    _triggerView = nil;
    _popoverProvider.triggerView = nil;
  } else if (_contentComponentView == childComponentView) {
    _contentComponentView = nil;
    _popoverProvider.contentView = nil;
  }
}

#pragma mark - Props

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps
{
  const auto &newPopoverProps = *std::static_pointer_cast<TinyuiPopoverViewProps const>(props);

  _popoverProvider.isPresented = newPopoverProps.isPresented;
  _popoverProvider.attachmentAnchor = RCTNSStringFromString(newPopoverProps.attachmentAnchor);
  _popoverProvider.arrowEdge = RCTNSStringFromString(newPopoverProps.arrowEdge);

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - TinyuiPopoverViewDelegate

- (void)onIsPresentedChangeWithIsPresented:(BOOL)isPresented
{
  if (_eventEmitter == nullptr) {
    return;
  }
  std::static_pointer_cast<const TinyuiPopoverViewEventEmitter>(_eventEmitter)
      ->onIsPresentedChange(TinyuiPopoverViewEventEmitter::OnIsPresentedChange{
          .isPresented = static_cast<bool>(isPresented)});
}

- (void)prepareForRecycle
{
  _triggerView = nil;
  _contentComponentView = nil;
  _popoverProvider.triggerView = nil;
  _popoverProvider.contentView = nil;
  [super prepareForRecycle];
}

@end

#endif // TINYUI_FEATURE_POPOVER
