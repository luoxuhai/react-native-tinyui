#import <CoreText/CoreText.h>
#import <UIKit/UIKit.h>

#include <algorithm>
#include <cmath>
#include <string>

#include <react/renderer/core/LayoutConstraints.h>
#include <react/renderer/core/LayoutContext.h>

#include "TinyuiLiquidGlassTextShadowNode.h"

namespace facebook::react {

static std::string stringValue(
    const folly::dynamic &object,
    folly::StringPiece key,
    const std::string &fallback = "")
{
  if (!object.isObject()) {
    return fallback;
  }
  auto value = object.getDefault(key, fallback);
  return value.isString() ? value.getString() : fallback;
}

static CGFloat numberValue(
    const folly::dynamic &object,
    folly::StringPiece key,
    CGFloat fallback)
{
  if (!object.isObject()) {
    return fallback;
  }
  auto value = object.getDefault(key, fallback);
  return value.isNumber() ? static_cast<CGFloat>(value.asDouble()) : fallback;
}

static UIFontWeight fontWeight(const std::string &value)
{
  if (value == "ultraLight") return UIFontWeightUltraLight;
  if (value == "thin") return UIFontWeightThin;
  if (value == "light") return UIFontWeightLight;
  if (value == "medium") return UIFontWeightMedium;
  if (value == "semibold") return UIFontWeightSemibold;
  if (value == "bold") return UIFontWeightBold;
  if (value == "heavy") return UIFontWeightHeavy;
  if (value == "black") return UIFontWeightBlack;
  return UIFontWeightRegular;
}

static UIFontDescriptorSystemDesign fontDesign(const std::string &value)
{
  if (value == "serif") return UIFontDescriptorSystemDesignSerif;
  if (value == "monospaced") return UIFontDescriptorSystemDesignMonospaced;
  if (value == "rounded") return UIFontDescriptorSystemDesignRounded;
  return nil;
}

static UIFont *resolvedFont(
    const folly::dynamic &configuration,
    const folly::dynamic &textStyle,
    Float fontSizeMultiplier)
{
  auto configuredSize = numberValue(textStyle, "fontSize", 0);
  auto multiplier = std::isfinite(fontSizeMultiplier) && fontSizeMultiplier > 0
      ? fontSizeMultiplier
      : 1;
  auto size = std::isfinite(configuredSize) && configuredSize > 0
      ? configuredSize
      : 17 * multiplier;
  auto family = stringValue(textStyle, "fontFamily");
  auto weight = stringValue(textStyle, "fontWeight");

  UIFont *font = nil;
  if (!family.empty()) {
    NSString *familyName = [NSString stringWithUTF8String:family.c_str()];
    font = familyName == nil ? nil : [UIFont fontWithName:familyName size:size];
  }
  if (font == nil) {
    font = [UIFont systemFontOfSize:size weight:fontWeight(weight)];
  }

  UIFontDescriptor *descriptor = font.fontDescriptor;
  if (family.empty()) {
    auto design = fontDesign(stringValue(configuration, "fontDesign"));
    if (design != nil) {
      descriptor = [descriptor fontDescriptorWithDesign:design] ?: descriptor;
    }
  }

  if (!weight.empty() && !family.empty()) {
    descriptor = [descriptor fontDescriptorByAddingAttributes:@{
      UIFontDescriptorTraitsAttribute: @{UIFontWeightTrait: @(fontWeight(weight))}
    }];
  }
  if (stringValue(textStyle, "fontStyle") == "italic") {
    descriptor = [descriptor fontDescriptorWithSymbolicTraits:
        descriptor.symbolicTraits | UIFontDescriptorTraitItalic] ?: descriptor;
  }
  return [UIFont fontWithDescriptor:descriptor size:size];
}

Size TinyuiLiquidGlassTextShadowNode::measureContent(
    const LayoutContext &layoutContext,
    const LayoutConstraints &layoutConstraints) const
{
  @autoreleasepool {
    const auto &configuration = getConcreteProps().configuration;
    if (!configuration.isObject()) {
      return layoutConstraints.clamp({});
    }

    auto textValue = stringValue(configuration, "text");
    if (textValue.empty()) {
      return layoutConstraints.clamp({});
    }
    NSString *text = [NSString stringWithUTF8String:textValue.c_str()] ?: @"";
    auto textStyle = configuration.getDefault("textStyle", folly::dynamic::object);
    UIFont *font = resolvedFont(configuration, textStyle, layoutContext.fontSizeMultiplier);
    auto letterSpacing = numberValue(textStyle, "letterSpacing", 0);
    if (!std::isfinite(letterSpacing)) {
      letterSpacing = 0;
    }

    CTFontRef ctFont = CTFontCreateWithName(
        (__bridge CFStringRef)font.fontName,
        font.pointSize,
        nullptr);
    auto lineHeight = CTFontGetAscent(ctFont) + CTFontGetDescent(ctFont) +
        std::max(CTFontGetLeading(ctFont), CTFontGetSize(ctFont) * 0.2);
    CGFloat width = 0;
    auto lines = [text componentsSeparatedByCharactersInSet:NSCharacterSet.newlineCharacterSet];
    NSDictionary<NSAttributedStringKey, id> *attributes = @{
      (__bridge NSAttributedStringKey)kCTFontAttributeName: (__bridge id)ctFont,
      (__bridge NSAttributedStringKey)kCTKernAttributeName: @(letterSpacing),
    };
    for (NSString *line in lines) {
      auto attributed = [[NSAttributedString alloc] initWithString:line attributes:attributes];
      CTLineRef ctLine = CTLineCreateWithAttributedString(
          (__bridge CFAttributedStringRef)attributed);
      width = std::max(
          width,
          static_cast<CGFloat>(CTLineGetTypographicBounds(ctLine, nullptr, nullptr, nullptr)));
      CFRelease(ctLine);
    }
    CFRelease(ctFont);

    auto height = lineHeight * lines.count;
    auto scale = layoutContext.pointScaleFactor > 0 ? layoutContext.pointScaleFactor : 1;
    Size measured{
        .width = static_cast<Float>(std::ceil(width * scale) / scale),
        .height = static_cast<Float>(std::ceil(height * scale) / scale),
    };
    return layoutConstraints.clamp(measured);
  }
}

} // namespace facebook::react
