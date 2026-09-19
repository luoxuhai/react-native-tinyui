#import "Tinyui.h"
#if TINYUI_FEATURE_TIP_KIT
#import "Tinyui-Swift.h"
#endif

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
#if TINYUI_FEATURE_TIP_KIT
  [components addObject:@"TipKit"];
#endif

  return components;
}

- (void)configureTips:(NSString *)displayFrequency
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
#if TINYUI_FEATURE_TIP_KIT
  dispatch_async(dispatch_get_main_queue(), ^{
    [TinyuiTipsRuntime configure:displayFrequency completion:^(NSError *error) {
      if (error != nil) {
        reject(error.userInfo[@"code"] ?: @"E_TIPS_CONFIGURATION", error.localizedDescription, error);
      } else {
        resolve(nil);
      }
    }];
  });
#else
  reject(@"E_TIP_NOT_INSTALLED", @"Enable TipKit in react-native-tinyui.components and run pod install.", nil);
#endif
}

- (void)invalidateTip:(NSString *)tipId
              reason:(NSString *)reason
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
#if TINYUI_FEATURE_TIP_KIT
  dispatch_async(dispatch_get_main_queue(), ^{
    [TinyuiTipsRuntime invalidate:tipId reason:reason completion:^(NSError *error) {
      if (error != nil) {
        reject(error.userInfo[@"code"] ?: @"E_TIP_INVALIDATION", error.localizedDescription, error);
      } else {
        resolve(nil);
      }
    }];
  });
#else
  reject(@"E_TIP_NOT_INSTALLED", @"Enable TipKit in react-native-tinyui.components and run pod install.", nil);
#endif
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
