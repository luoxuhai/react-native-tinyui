#if TINYUI_FEATURE_STEPPER

#import "TinyuiStepperView.h"
#import "TinyuiStepperShadowNode.h"

#import <react/renderer/components/TinyuiSpec/EventEmitters.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

#include <algorithm>
#include <cmath>

using namespace facebook::react;

@interface TinyuiStepperView () <RCTTinyuiStepperViewViewProtocol>
@end

@implementation TinyuiStepperView {
  UIStepper *_stepper;
  int _nativeEventCount;
  BOOL _hasInitialValue;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiStepperComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TinyuiStepperViewProps>();
    _props = defaultProps;
    [self createStepper];
  }
  return self;
}

- (void)createStepper
{
  _stepper = [[UIStepper alloc] initWithFrame:CGRectZero];
  [_stepper addTarget:self action:@selector(onChange:) forControlEvents:UIControlEventValueChanged];
  self.contentView = _stepper;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<TinyuiStepperViewProps const>(props);

  // The public wrapper validates these; also guard the native boundary against
  // invalid numbers, since UIStepper raises for nonpositive increments.
  double minimum = std::isfinite(newProps.minimumValue) ? newProps.minimumValue : 0;
  double maximum = std::isfinite(newProps.maximumValue) ? newProps.maximumValue : 100;
  maximum = std::max(minimum, maximum);
  double previousValue = _stepper.value;

  // Expand the old range before shrinking it. Setting disjoint bounds in the
  // wrong order lets UIKit change the other bound and prematurely clamp value.
  _stepper.minimumValue = std::min(_stepper.minimumValue, minimum);
  _stepper.maximumValue = std::max(_stepper.maximumValue, maximum);
  _stepper.minimumValue = minimum;
  _stepper.maximumValue = maximum;
  _stepper.stepValue = std::isfinite(newProps.stepValue) && newProps.stepValue > 0
      ? newProps.stepValue : 1;
  _stepper.continuous = newProps.isContinuous;
  _stepper.autorepeat = newProps.autorepeat;
  _stepper.wraps = newProps.wraps;
  _stepper.enabled = !newProps.disabled;

  // Uncontrolled values stay in UIKit. Controlled values are applied only once
  // JS has acknowledged the newest native event, avoiding autorepeat rollback.
  double value = previousValue;
  if (!_hasInitialValue ||
      (newProps.controlled && newProps.mostRecentEventCount == _nativeEventCount)) {
    value = std::isfinite(newProps.value) ? newProps.value : minimum;
  }
  _stepper.value = std::clamp(value, minimum, maximum);
  _hasInitialValue = YES;

  [super updateProps:props oldProps:oldProps];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  // UIKit controls keep their natural size; a larger React frame centers them.
  CGSize size = [_stepper sizeThatFits:self.bounds.size];
  _stepper.frame = CGRectMake(
      (CGRectGetWidth(self.bounds) - size.width) / 2,
      (CGRectGetHeight(self.bounds) - size.height) / 2,
      size.width,
      size.height);
}

- (void)onChange:(UIStepper *)sender
{
  if (_eventEmitter == nullptr) {
    return;
  }
  _nativeEventCount += 1;
  std::static_pointer_cast<const TinyuiStepperViewEventEmitter>(_eventEmitter)
      ->onChange(TinyuiStepperViewEventEmitter::OnChange{
          .value = sender.value,
          .eventCount = _nativeEventCount});
}

// Let UIStepper expose its native accessibility controls and actions.
- (BOOL)isAccessibilityElement
{
  return NO;
}

- (NSObject *)accessibilityElement
{
  return _stepper;
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  _nativeEventCount = 0;
  _hasInitialValue = NO;
  [self createStepper];
}

@end

#endif
