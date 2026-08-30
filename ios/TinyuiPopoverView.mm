#import "TinyuiPopoverView.h"

#import <React/RCTConversions.h>
#import <React/UIView+React.h>

#import <react/renderer/components/TinyuiSpec/ComponentDescriptors.h>
#import <react/renderer/components/TinyuiSpec/EventEmitters.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface TinyuiPopoverView () <RCTTinyuiPopoverViewViewProtocol, UIPopoverPresentationControllerDelegate>
@end

@implementation TinyuiPopoverView {
  UIViewController *_contentController;
  UIView<RCTComponentViewProtocol> *_contentComponentView;
  BOOL _shouldPresent;
  BOOL _isPresented;
  CGSize _contentSize;
  NSString *_attachmentAnchor;
  NSString *_arrowEdge;
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
    _contentController = [UIViewController new];
    _contentController.view.backgroundColor = UIColor.clearColor;
    _contentController.modalPresentationStyle = UIModalPresentationPopover;
    _contentSize = CGSizeMake(320, 240);
    _attachmentAnchor = @"center";
    _arrowEdge = @"none";
    self.userInteractionEnabled = NO;
  }
  return self;
}

- (CGRect)popoverSourceRect
{
  CGRect bounds = self.bounds;
  CGFloat x = CGRectGetMidX(bounds);
  CGFloat y = CGRectGetMidY(bounds);
  BOOL rightToLeft = self.effectiveUserInterfaceLayoutDirection == UIUserInterfaceLayoutDirectionRightToLeft;

  if ([_attachmentAnchor isEqualToString:@"top"]) {
    y = CGRectGetMinY(bounds);
  } else if ([_attachmentAnchor isEqualToString:@"bottom"]) {
    y = CGRectGetMaxY(bounds);
  } else if ([_attachmentAnchor isEqualToString:@"leading"]) {
    x = rightToLeft ? CGRectGetMaxX(bounds) : CGRectGetMinX(bounds);
  } else if ([_attachmentAnchor isEqualToString:@"trailing"]) {
    x = rightToLeft ? CGRectGetMinX(bounds) : CGRectGetMaxX(bounds);
  }

  return CGRectMake(x, y, 1, 1);
}

- (UIPopoverArrowDirection)permittedArrowDirections
{
  BOOL rightToLeft = self.effectiveUserInterfaceLayoutDirection == UIUserInterfaceLayoutDirectionRightToLeft;
  if ([_arrowEdge isEqualToString:@"top"]) {
    return UIPopoverArrowDirectionUp;
  }
  if ([_arrowEdge isEqualToString:@"bottom"]) {
    return UIPopoverArrowDirectionDown;
  }
  if ([_arrowEdge isEqualToString:@"leading"]) {
    return rightToLeft ? UIPopoverArrowDirectionRight : UIPopoverArrowDirectionLeft;
  }
  if ([_arrowEdge isEqualToString:@"trailing"]) {
    return rightToLeft ? UIPopoverArrowDirectionLeft : UIPopoverArrowDirectionRight;
  }
  return UIPopoverArrowDirectionAny;
}

- (void)configurePopover
{
  _contentController.preferredContentSize = _contentSize;
  UIPopoverPresentationController *popover = _contentController.popoverPresentationController;
  popover.delegate = self;
  popover.sourceView = self;
  popover.sourceRect = [self popoverSourceRect];
  popover.permittedArrowDirections = [self permittedArrowDirections];
}

- (void)ensurePresentationState
{
  BOOL canPresent = self.window != nil && self.superview != nil && _contentComponentView != nil;
  if (_shouldPresent && !_isPresented && canPresent) {
    UIViewController *presentingController = [self reactViewController];
    if (presentingController == nil || presentingController.presentedViewController != nil) {
      return;
    }

    [self configurePopover];
    _isPresented = YES;
    [presentingController presentViewController:_contentController animated:YES completion:nil];
    return;
  }

  if (_isPresented && (!_shouldPresent || !canPresent)) {
    _isPresented = NO;
    [_contentController dismissViewControllerAnimated:YES completion:nil];
  }
}

- (void)emitPresentationChange:(BOOL)isPresented
{
  if (_eventEmitter == nullptr) {
    return;
  }
  std::static_pointer_cast<const TinyuiPopoverViewEventEmitter>(_eventEmitter)
      ->onIsPresentedChange(TinyuiPopoverViewEventEmitter::OnIsPresentedChange{
          .isPresented = static_cast<bool>(isPresented)});
}

- (void)presentationControllerDidDismiss:(UIPresentationController *)presentationController
{
  if (!_isPresented) {
    return;
  }

  _isPresented = NO;
  if (_shouldPresent) {
    _shouldPresent = NO;
    [self emitPresentationChange:NO];
  }
}

- (UIModalPresentationStyle)adaptivePresentationStyleForPresentationController:(UIPresentationController *)controller
                                                               traitCollection:(UITraitCollection *)traitCollection
{
  return UIModalPresentationNone;
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  [self ensurePresentationState];
}

- (void)didMoveToSuperview
{
  [super didMoveToSuperview];
  [self ensurePresentationState];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  if (_isPresented) {
    [self configurePopover];
  }
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps
{
  const auto &newPopoverProps = *std::static_pointer_cast<TinyuiPopoverViewProps const>(props);

  _shouldPresent = newPopoverProps.isPresented;
  _contentSize = CGSizeMake(newPopoverProps.contentWidth, newPopoverProps.contentHeight);
  _attachmentAnchor = RCTNSStringFromString(newPopoverProps.attachmentAnchor);
  _arrowEdge = RCTNSStringFromString(newPopoverProps.arrowEdge);
  [self configurePopover];
  [self ensurePresentationState];

  [super updateProps:props oldProps:oldProps];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                          index:(NSInteger)index
{
  NSAssert(_contentComponentView == nil, @"TinyuiPopoverView accepts one content child.");
  _contentComponentView = childComponentView;
  [_contentController.view insertSubview:childComponentView atIndex:0];
  [self ensurePresentationState];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                            index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
  if (_contentComponentView == childComponentView) {
    _contentComponentView = nil;
  }
  [self ensurePresentationState];
}

- (void)prepareForRecycle
{
  if (_isPresented) {
    [_contentController dismissViewControllerAnimated:NO completion:nil];
  }
  _isPresented = NO;
  _shouldPresent = NO;
  _contentComponentView = nil;
  [super prepareForRecycle];
}

@end

Class<RCTComponentViewProtocol> TinyuiPopoverViewCls(void)
{
  return TinyuiPopoverView.class;
}
