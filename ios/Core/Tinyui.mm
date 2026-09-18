#import "Tinyui.h"

@implementation Tinyui

- (NSArray<NSString *> *)getEnabledComponents
{
  NSMutableArray<NSString *> *components = [NSMutableArray array];

#if TINYUI_FEATURE_MENU
  [components addObject:@"Menu"];
#endif
#if TINYUI_FEATURE_POPOVER
  [components addObject:@"Popover"];
#endif

#if TINYUI_FEATURE_LIQUID_GLASS_TEXT
  [components addObject:@"LiquidGlassText"];
#endif
#if TINYUI_FEATURE_STEPPER
  [components addObject:@"Stepper"];
#endif
#if TINYUI_FEATURE_CONCENTRIC_VIEW
  [components addObject:@"ConcentricView"];
#endif
#if TINYUI_FEATURE_SF_SYMBOL
  [components addObject:@"SFSymbol"];
#endif

  return components;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeTinyuiSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"Tinyui";
}

@end
