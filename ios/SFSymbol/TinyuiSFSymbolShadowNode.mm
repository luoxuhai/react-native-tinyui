#if TINYUI_FEATURE_SF_SYMBOL

#import "TinyuiSFSymbolShadowNode.h"
#import "TinyuiSFSymbolImage.h"
#import <react/utils/FollyConvert.h>
#include <react/renderer/core/LayoutConstraints.h>
#include <react/renderer/core/LayoutContext.h>
#include <cmath>

namespace facebook::react {

Size TinyuiSFSymbolShadowNode::measureContent(
    const LayoutContext &layoutContext,
    const LayoutConstraints &layoutConstraints) const
{
  @autoreleasepool {
    // UIImage and UIFont creation are safe off the main thread. No UIView or
    // main-queue sync is needed during concurrent Fabric layout.
    UIImage *image = TinyuiSFSymbolImage(convertFollyDynamicToId(getConcreteProps().configuration), NO);
    CGSize size = image == nil ? CGSizeZero : image.size;
    auto scale = layoutContext.pointScaleFactor > 0 ? layoutContext.pointScaleFactor : 1;
    return layoutConstraints.clamp({
        static_cast<Float>(std::ceil(size.width * scale) / scale),
        static_cast<Float>(std::ceil(size.height * scale) / scale)});
  }
}

} // namespace facebook::react

#endif
