#if TINYUI_FEATURE_SF_SYMBOL

#import "TinyuiSFSymbolImage.h"
#import <React/RCTConvert.h>
#include <cmath>

static UIImageSymbolWeight symbolWeight(NSString *value)
{
  NSDictionary *weights = @{
    @"ultraLight": @(UIImageSymbolWeightUltraLight), @"thin": @(UIImageSymbolWeightThin),
    @"light": @(UIImageSymbolWeightLight), @"regular": @(UIImageSymbolWeightRegular),
    @"medium": @(UIImageSymbolWeightMedium), @"semibold": @(UIImageSymbolWeightSemibold),
    @"bold": @(UIImageSymbolWeightBold), @"heavy": @(UIImageSymbolWeightHeavy),
    @"black": @(UIImageSymbolWeightBlack),
  };
  return (UIImageSymbolWeight)[weights[value ?: @""] integerValue];
}

static UIImageSymbolScale symbolScale(NSString *value)
{
  if ([value isEqual:@"small"]) return UIImageSymbolScaleSmall;
  if ([value isEqual:@"medium"]) return UIImageSymbolScaleMedium;
  if ([value isEqual:@"large"]) return UIImageSymbolScaleLarge;
  if ([value isEqual:@"unspecified"]) return UIImageSymbolScaleUnspecified;
  return UIImageSymbolScaleDefault;
}

static UIFontTextStyle textStyle(NSString *value)
{
  return @{
    @"extraLargeTitle": UIFontTextStyleExtraLargeTitle,
    @"extraLargeTitle2": UIFontTextStyleExtraLargeTitle2,
    @"largeTitle": UIFontTextStyleLargeTitle, @"title1": UIFontTextStyleTitle1,
    @"title2": UIFontTextStyleTitle2, @"title3": UIFontTextStyleTitle3,
    @"headline": UIFontTextStyleHeadline, @"subheadline": UIFontTextStyleSubheadline,
    @"body": UIFontTextStyleBody, @"callout": UIFontTextStyleCallout,
    @"footnote": UIFontTextStyleFootnote, @"caption1": UIFontTextStyleCaption1,
    @"caption2": UIFontTextStyleCaption2,
  }[value ?: @""];
}

UIImage *TinyuiSFSymbolImage(NSDictionary *configuration, BOOL includeColors)
{
  if (![configuration isKindOfClass:NSDictionary.class]) return nil;
  NSString *name = configuration[@"name"];
  if (![name isKindOfClass:NSString.class] || name.length == 0) return nil;

  CGFloat size = [configuration[@"size"] doubleValue];
  if (!std::isfinite(size) || size <= 0) size = 17;
  UIImageSymbolWeight weight = symbolWeight(configuration[@"weight"]);
  UIImageSymbolScale scale = symbolScale(configuration[@"scale"]);
  UIFontTextStyle style = textStyle(configuration[@"textStyle"]);
  if (style != nil) {
    // RN supplies the scale explicitly; use unscaled metrics here to avoid
    // applying Dynamic Type twice and to keep Yoga and UIKit in agreement.
    UITraitCollection *traits = [UITraitCollection
        traitCollectionWithPreferredContentSizeCategory:UIContentSizeCategoryLarge];
    UIFont *font = [UIFont preferredFontForTextStyle:style compatibleWithTraitCollection:traits];
    size = font.pointSize;
    if (weight == UIImageSymbolWeightUnspecified) {
      NSNumber *fontWeight = font.fontDescriptor.fontAttributes[UIFontDescriptorTraitsAttribute][UIFontWeightTrait];
      weight = UIImageSymbolWeightForFontWeight(fontWeight.doubleValue);
    }
  }
  double fontScale = [configuration[@"fontScale"] doubleValue];
  if (std::isfinite(fontScale) && fontScale > 0) size *= fontScale;

  UIImageSymbolConfiguration *symbol = [UIImageSymbolConfiguration
      configurationWithPointSize:size weight:weight scale:scale];
  NSString *family = configuration[@"fontFamily"];
  if ([family isKindOfClass:NSString.class] && family.length > 0) {
    UIFont *font = [UIFont fontWithName:family size:size];
    if (font != nil) {
      symbol = [UIImageSymbolConfiguration configurationWithFont:font scale:scale];
      if (weight != UIImageSymbolWeightUnspecified) {
        symbol = [symbol configurationByApplyingConfiguration:
            [UIImageSymbolConfiguration configurationWithWeight:weight]];
      }
    }
  }

  if (includeColors) {
    NSString *mode = configuration[@"renderingMode"];
    UIColor *color = [RCTConvert UIColor:configuration[@"color"]] ?: UIColor.labelColor;
    UIImageSymbolConfiguration *colors = nil;
    if ([mode isEqual:@"monochrome"]) {
      colors = UIImageSymbolConfiguration.configurationPreferringMonochrome;
    } else if ([mode isEqual:@"multicolor"]) {
      colors = UIImageSymbolConfiguration.configurationPreferringMulticolor;
    } else if ([mode isEqual:@"hierarchical"]) {
      colors = [UIImageSymbolConfiguration configurationWithHierarchicalColor:color];
    } else if ([mode isEqual:@"palette"]) {
      NSMutableArray<UIColor *> *palette = [NSMutableArray array];
      id values = configuration[@"paletteColors"];
      if ([values isKindOfClass:NSArray.class]) {
        for (id value in values) {
          UIColor *paletteColor = [RCTConvert UIColor:value];
          if (paletteColor != nil && palette.count < 3) [palette addObject:paletteColor];
        }
      }
      if (palette.count == 0) [palette addObject:color];
      colors = [UIImageSymbolConfiguration configurationWithPaletteColors:palette];
    }
    if (colors != nil) symbol = [symbol configurationByApplyingConfiguration:colors];
  }

  if (@available(iOS 26.0, *)) {
    NSString *variableMode = configuration[@"variableValueMode"];
    UIImageSymbolVariableValueMode variable = UIImageSymbolVariableValueModeAutomatic;
    if ([variableMode isEqual:@"color"]) variable = UIImageSymbolVariableValueModeColor;
    if ([variableMode isEqual:@"draw"]) variable = UIImageSymbolVariableValueModeDraw;
    symbol = [symbol configurationByApplyingConfiguration:
        [UIImageSymbolConfiguration configurationWithVariableValueMode:variable]];

    NSString *colorMode = configuration[@"colorRenderingMode"];
    UIImageSymbolColorRenderingMode rendering = UIImageSymbolColorRenderingModeAutomatic;
    if ([colorMode isEqual:@"flat"]) rendering = UIImageSymbolColorRenderingModeFlat;
    if ([colorMode isEqual:@"gradient"]) rendering = UIImageSymbolColorRenderingModeGradient;
    symbol = [symbol configurationByApplyingConfiguration:
        [UIImageSymbolConfiguration configurationWithColorRenderingMode:rendering]];
  }

  BOOL asset = [configuration[@"source"] isEqual:@"asset"];
  id variableValue = configuration[@"variableValue"];
  UIImage *image;
  if ([variableValue isKindOfClass:NSNumber.class]) {
    double value = [variableValue doubleValue];
    value = std::isfinite(value) ? fmin(1, fmax(0, value)) : 0;
    image = asset
        ? [UIImage imageNamed:name inBundle:NSBundle.mainBundle variableValue:value withConfiguration:symbol]
        : [UIImage systemImageNamed:name variableValue:value withConfiguration:symbol];
  } else {
    image = asset
        ? [UIImage imageNamed:name inBundle:NSBundle.mainBundle withConfiguration:symbol]
        : [UIImage systemImageNamed:name withConfiguration:symbol];
  }
  // Symbol content transitions are undefined for ordinary bitmap assets.
  return image.isSymbolImage ? image : nil;
}

#endif
