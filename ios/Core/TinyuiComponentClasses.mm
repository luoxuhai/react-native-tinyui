#import <React/RCTViewComponentView.h>
#import <react/renderer/components/TinyuiSpec/ComponentDescriptors.h>

using namespace facebook::react;

// Newer Codegen providers put every declared component into an NSDictionary
// using NSClassFromString, which cannot be nil. Keep a lightweight Fabric class
// for disabled components; the JS availability check prevents rendering them.
// Their actual UIKit/SwiftUI implementations remain excluded by the podspec.
#define TINYUI_DISABLED_COMPONENT(ViewClass, DescriptorClass)                 \
  @interface ViewClass : RCTViewComponentView                                \
  @end                                                                      \
  @implementation ViewClass                                                 \
  + (ComponentDescriptorProvider)componentDescriptorProvider                 \
  {                                                                         \
    return concreteComponentDescriptorProvider<DescriptorClass>();          \
  }                                                                         \
  @end

#if TINYUI_FEATURE_MENU
#import "TinyuiMenuView.h"
#else
TINYUI_DISABLED_COMPONENT(TinyuiMenuView, TinyuiMenuViewComponentDescriptor)
#endif

#if TINYUI_FEATURE_POPOVER
#import "TinyuiPopoverView.h"
#else
TINYUI_DISABLED_COMPONENT(TinyuiPopoverView, TinyuiPopoverViewComponentDescriptor)
#endif

#if TINYUI_FEATURE_LIQUID_GLASS_TEXT
#import "TinyuiLiquidGlassTextView.h"
#else
TINYUI_DISABLED_COMPONENT(TinyuiLiquidGlassTextView, TinyuiLiquidGlassTextViewComponentDescriptor)
#endif

#if TINYUI_FEATURE_STEPPER
#import "TinyuiStepperView.h"
#else
TINYUI_DISABLED_COMPONENT(TinyuiStepperView, TinyuiStepperViewComponentDescriptor)
#endif

#if TINYUI_FEATURE_CONCENTRIC_VIEW
#import "TinyuiConcentricView.h"
#else
TINYUI_DISABLED_COMPONENT(TinyuiConcentricView, TinyuiConcentricViewComponentDescriptor)
#endif

#if TINYUI_FEATURE_SF_SYMBOL
#import "TinyuiSFSymbolView.h"
#else
TINYUI_DISABLED_COMPONENT(TinyuiSFSymbolView, TinyuiSFSymbolViewComponentDescriptor)
#endif

#undef TINYUI_DISABLED_COMPONENT

Class<RCTComponentViewProtocol> TinyuiMenuViewCls(void)
{
  return TinyuiMenuView.class;
}

Class<RCTComponentViewProtocol> TinyuiPopoverViewCls(void)
{
  return TinyuiPopoverView.class;
}

Class<RCTComponentViewProtocol> TinyuiLiquidGlassTextViewCls(void)
{
  return TinyuiLiquidGlassTextView.class;
}

Class<RCTComponentViewProtocol> TinyuiStepperViewCls(void)
{
  return TinyuiStepperView.class;
}

Class<RCTComponentViewProtocol> TinyuiConcentricViewCls(void)
{
  return TinyuiConcentricView.class;
}

Class<RCTComponentViewProtocol> TinyuiSFSymbolViewCls(void)
{
  return TinyuiSFSymbolView.class;
}
