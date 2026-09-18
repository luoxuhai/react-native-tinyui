#if TINYUI_FEATURE_STEPPER

#import "TinyuiStepperShadowNode.h"

#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

namespace facebook::react {

Size TinyuiStepperShadowNode::measureContent(
    const LayoutContext &layoutContext,
    const LayoutConstraints &layoutConstraints) const
{
  // Match React Native's RCTSwitchSize: cache the native size and create the
  // UIKit control on the main queue, even when Yoga measures on a worker.
  static CGSize size;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    RCTUnsafeExecuteOnMainQueueSync(^{
      size = [UIStepper new].intrinsicContentSize;
    });
  });
  return layoutConstraints.clamp({size.width, size.height});
}

} // namespace facebook::react

#endif
