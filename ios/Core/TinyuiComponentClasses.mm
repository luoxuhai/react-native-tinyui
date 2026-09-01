#import <React/RCTComponentViewProtocol.h>

#if TINYUI_FEATURE_MENU
#import "TinyuiMenuView.h"
#endif

#if TINYUI_FEATURE_POPOVER
#import "TinyuiPopoverView.h"
#endif

Class<RCTComponentViewProtocol> TinyuiMenuViewCls(void)
{
#if TINYUI_FEATURE_MENU
  return TinyuiMenuView.class;
#else
  return nil;
#endif
}

Class<RCTComponentViewProtocol> TinyuiPopoverViewCls(void)
{
#if TINYUI_FEATURE_POPOVER
  return TinyuiPopoverView.class;
#else
  return nil;
#endif
}
