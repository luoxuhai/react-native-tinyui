#import "TinyuiMenuView.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/TinyuiSpec/ComponentDescriptors.h>
#import <react/renderer/components/TinyuiSpec/EventEmitters.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface TinyuiMenuView () <RCTTinyuiMenuViewViewProtocol>
@end

@implementation TinyuiMenuView {
  UIButton *_button;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiMenuViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TinyuiMenuViewProps>();
    _props = defaultProps;

    _button = [UIButton buttonWithType:UIButtonTypeCustom];
    _button.backgroundColor = UIColor.clearColor;
    _button.showsMenuAsPrimaryAction = YES;
    [_button addTarget:self
                action:@selector(handlePrimaryAction)
      forControlEvents:UIControlEventPrimaryActionTriggered];
    self.contentView = _button;
  }
  return self;
}

- (UIImage *)imageNamed:(NSString *)name
{
  return name.length > 0 ? [UIImage systemImageNamed:name] : nil;
}

- (UIMenuElementAttributes)attributesForItem:(NSDictionary *)item
{
  UIMenuElementAttributes attributes = 0;
  if ([item[@"destructive"] boolValue]) {
    attributes |= UIMenuElementAttributesDestructive;
  }
  if ([item[@"disabled"] boolValue]) {
    attributes |= UIMenuElementAttributesDisabled;
  }
  if ([item[@"hidden"] boolValue]) {
    attributes |= UIMenuElementAttributesHidden;
  }
  if (@available(iOS 16.0, *)) {
    if ([item[@"keepOpen"] boolValue]) {
      attributes |= UIMenuElementAttributesKeepsMenuPresented;
    }
  }
  return attributes;
}

- (UIMenuElementState)stateForItem:(NSDictionary *)item
{
  NSString *state = item[@"state"];
  if ([state isEqualToString:@"on"]) {
    return UIMenuElementStateOn;
  }
  if ([state isEqualToString:@"mixed"]) {
    return UIMenuElementStateMixed;
  }
  return UIMenuElementStateOff;
}

- (UIAction *)actionForItem:(NSDictionary *)item
{
  NSString *identifier = item[@"id"] ?: @"";
  NSString *title = item[@"title"] ?: @"";
  NSString *subtitle = item[@"subtitle"];
  UIImage *image = [self imageNamed:item[@"systemImage"]];
  UIMenuElementAttributes attributes = [self attributesForItem:item];
  UIMenuElementState state = [self stateForItem:item];
  __weak TinyuiMenuView *weakSelf = self;

  UIAction *action = [UIAction actionWithTitle:title
                                        image:image
                                   identifier:nil
                                      handler:^(__kindof UIAction *selectedAction) {
                                        [weakSelf emitItemPress:identifier];
                                      }];
  action.subtitle = subtitle;
  action.attributes = attributes;
  action.state = state;
  return action;
}

- (UIMenu *)menuWithTitle:(NSString *)title
                 subtitle:(nullable NSString *)subtitle
                     image:(nullable UIImage *)image
                   options:(UIMenuOptions)options
                  children:(NSArray<UIMenuElement *> *)children
{
  UIMenu *menu = [UIMenu menuWithTitle:title
                                 image:image
                            identifier:nil
                               options:options
                              children:children];
  menu.subtitle = subtitle;
  return menu;
}

- (NSArray<UIMenuElement *> *)elementsForItems:(NSArray *)items
{
  BOOL containsSeparator = NO;
  for (NSDictionary *item in items) {
    if ([item[@"type"] isEqualToString:@"separator"]) {
      containsSeparator = YES;
      break;
    }
  }

  NSMutableArray<UIMenuElement *> *elements = [NSMutableArray array];
  NSMutableArray<UIMenuElement *> *group = [NSMutableArray array];

  void (^flushGroup)(BOOL) = ^(BOOL inlineGroup) {
    if (group.count == 0) {
      return;
    }
    if (inlineGroup) {
      [elements addObject:[self menuWithTitle:@""
                                      subtitle:nil
                                         image:nil
                                       options:UIMenuOptionsDisplayInline
                                      children:[group copy]]];
    } else {
      [elements addObjectsFromArray:group];
    }
    [group removeAllObjects];
  };

  for (NSDictionary *item in items) {
    NSString *type = item[@"type"];
    if ([type isEqualToString:@"separator"]) {
      flushGroup(YES);
      continue;
    }

    UIMenuElement *element = nil;
    if ([type isEqualToString:@"action"]) {
      element = [self actionForItem:item];
    } else if ([type isEqualToString:@"submenu"]) {
      element = [self menuWithTitle:item[@"title"] ?: @""
                           subtitle:item[@"subtitle"]
                              image:[self imageNamed:item[@"systemImage"]]
                            options:0
                           children:[self elementsForItems:item[@"children"] ?: @[]]];
    } else if ([type isEqualToString:@"section"]) {
      element = [self menuWithTitle:item[@"title"] ?: @""
                           subtitle:nil
                              image:nil
                            options:UIMenuOptionsDisplayInline
                           children:[self elementsForItems:item[@"children"] ?: @[]]];
    }

    if (element != nil) {
      [group addObject:element];
    }
  }

  flushGroup(containsSeparator);
  return elements;
}

- (UIMenu *)menuFromJSON:(NSString *)json
{
  NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary *configuration = data.length > 0
      ? [NSJSONSerialization JSONObjectWithData:data options:0 error:nil]
      : nil;
  NSArray *items = [configuration isKindOfClass:NSDictionary.class]
      ? configuration[@"items"]
      : nil;
  if (![items isKindOfClass:NSArray.class]) {
    items = @[];
  }
  return [UIMenu menuWithTitle:@"" children:[self elementsForItems:items]];
}

- (void)emitItemPress:(NSString *)identifier
{
  if (_eventEmitter == nullptr) {
    return;
  }
  std::static_pointer_cast<const TinyuiMenuViewEventEmitter>(_eventEmitter)
      ->onItemPress(TinyuiMenuViewEventEmitter::OnItemPress{
          .id = std::string(identifier.UTF8String ?: "")});
}

- (void)handlePrimaryAction
{
  if (_eventEmitter == nullptr) {
    return;
  }
  std::static_pointer_cast<const TinyuiMenuViewEventEmitter>(_eventEmitter)
      ->onPrimaryAction(TinyuiMenuViewEventEmitter::OnPrimaryAction{});
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps
{
  const auto &oldMenuProps = *std::static_pointer_cast<TinyuiMenuViewProps const>(_props);
  const auto &newMenuProps = *std::static_pointer_cast<TinyuiMenuViewProps const>(props);

  if (oldMenuProps.menuConfig != newMenuProps.menuConfig) {
    _button.menu = [self menuFromJSON:RCTNSStringFromString(newMenuProps.menuConfig)];
  }
  if (oldMenuProps.hasPrimaryAction != newMenuProps.hasPrimaryAction) {
    _button.showsMenuAsPrimaryAction = !newMenuProps.hasPrimaryAction;
  }
  if (oldMenuProps.disabled != newMenuProps.disabled) {
    _button.enabled = !newMenuProps.disabled;
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];
  _button.accessibilityLabel = self.accessibilityLabel;
  _button.accessibilityHint = self.accessibilityHint;
}

@end

Class<RCTComponentViewProtocol> TinyuiMenuViewCls(void)
{
  return TinyuiMenuView.class;
}
