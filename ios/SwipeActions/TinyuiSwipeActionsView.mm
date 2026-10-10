#if TINYUI_FEATURE_SWIPE_ACTIONS

#import "TinyuiSwipeActionsView.h"

#import <React/RCTConvert.h>
#import <React/RCTSurfacePointerHandler.h>
#import <React/RCTSurfaceTouchHandler.h>
#import <react/utils/FollyConvert.h>
#import <react/renderer/components/TinyuiSpec/ComponentDescriptors.h>
#import <react/renderer/components/TinyuiSpec/EventEmitters.h>
#import <react/renderer/components/TinyuiSpec/Props.h>

using namespace facebook::react;

@interface TinyuiSwipeActionsView () <UITableViewDataSource, UITableViewDelegate>
@end

@implementation TinyuiSwipeActionsView {
  UITableView *_tableView;
  UITableViewCell *_cell;
  UIView *_rowView;
  NSArray<NSDictionary *> *_actions;
  BOOL _leading;
  BOOL _allowsFullSwipe;
  BOOL _disabled;
  BOOL _needsConfiguration;
  BOOL _actionsPresented;
  NSUInteger _configurationVersion;
}

// UIKit normally coordinates open rows within one table. Each React row has
// its own table, so coordinate them without retaining mounted Fabric views.
static __weak TinyuiSwipeActionsView *activeSwipeView;

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TinyuiSwipeActionsViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _props = std::make_shared<const TinyuiSwipeActionsViewProps>();
    _actions = @[];
    _allowsFullSwipe = YES;

    _cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:nil];
    _cell.backgroundColor = UIColor.clearColor;
    _cell.contentView.backgroundColor = UIColor.clearColor;
    _cell.selectionStyle = UITableViewCellSelectionStyleNone;
    _cell.isAccessibilityElement = NO;

    _tableView = [[UITableView alloc] initWithFrame:CGRectZero style:UITableViewStylePlain];
    _tableView.backgroundColor = UIColor.clearColor;
    _tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    _tableView.scrollEnabled = NO;
    _tableView.showsVerticalScrollIndicator = NO;
    _tableView.showsHorizontalScrollIndicator = NO;
    _tableView.bounces = NO;
    _tableView.delaysContentTouches = NO;
    _tableView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    _tableView.insetsContentViewsToSafeArea = NO;
    _tableView.sectionHeaderTopPadding = 0;
    _tableView.estimatedRowHeight = 0;
    _tableView.estimatedSectionHeaderHeight = 0;
    _tableView.estimatedSectionFooterHeight = 0;
    _tableView.dataSource = self;
    _tableView.delegate = self;
    // Cover the entire row. Yoga owns the child's frame, including any padding;
    // using RCTView's inset contentView frame would apply that padding twice.
    [self addSubview:_tableView];
  }
  return self;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                         index:(NSInteger)index
{
  _rowView = childComponentView;
  [_cell.contentView addSubview:childComponentView];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView
                           index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
  if (_rowView == childComponentView) {
    _rowView = nil;
    [self closeActions];
  }
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  UISemanticContentAttribute direction = _layoutMetrics.layoutDirection == LayoutDirection::RightToLeft
      ? UISemanticContentAttributeForceRightToLeft
      : UISemanticContentAttributeForceLeftToRight;
  if (!CGSizeEqualToSize(_tableView.bounds.size, self.bounds.size) ||
      _tableView.semanticContentAttribute != direction) {
    [self closeActions];
  }
  _tableView.frame = self.bounds;
  CGFloat height = MAX(1, CGRectGetHeight(self.bounds));
  if (_tableView.rowHeight != height) {
    _tableView.rowHeight = height;
    [_tableView reloadData];
  }
  // Map Yoga's resolved direction to UIKit's logical leading/trailing edges.
  _tableView.semanticContentAttribute = direction;
}

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event
{
  UIView *hit = [super hitTest:point withEvent:event];
  // A tap on the exposed row dismisses its actions. Keep that tap in UIKit,
  // rather than also activating a React child while the row is sliding back.
  if (_actionsPresented && _rowView != nil && [hit isDescendantOfView:_rowView]) {
    return _cell.contentView;
  }
  return hit;
}

- (SharedTouchEventEmitter)touchEventEmitterAtPoint:(CGPoint)point
{
  // Native action buttons have no Fabric ancestor until this view. Do not let
  // their taps bubble to an outer React Pressable. Child React views still own
  // normal row touches and keep their usual event bubbling.
  return _actionsPresented ? nullptr : [super touchEventEmitterAtPoint:point];
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &previous = *std::static_pointer_cast<const TinyuiSwipeActionsViewProps>(_props);
  const auto &next = *std::static_pointer_cast<const TinyuiSwipeActionsViewProps>(props);
  if (_needsConfiguration || previous.actionsConfig != next.actionsConfig || previous.edge != next.edge ||
      previous.allowsFullSwipe != next.allowsFullSwipe || previous.disabled != next.disabled) {
    [self closeActions];
    id config = convertFollyDynamicToId(next.actionsConfig);
    _actions = [config isKindOfClass:NSArray.class] ? config : @[];
    _leading = next.edge == TinyuiSwipeActionsViewEdge::Leading;
    _allowsFullSwipe = next.allowsFullSwipe;
    _disabled = next.disabled;
    _needsConfiguration = NO;
  }
  [super updateProps:props oldProps:oldProps];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
  return 1;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
  return _cell;
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
  return !_disabled && _actions.count > 0 && _rowView != nil;
}

- (UISwipeActionsConfiguration *)tableView:(UITableView *)tableView
    leadingSwipeActionsConfigurationForRowAtIndexPath:(NSIndexPath *)indexPath
{
  return _leading ? [self swipeConfiguration] : nil;
}

- (UISwipeActionsConfiguration *)tableView:(UITableView *)tableView
    trailingSwipeActionsConfigurationForRowAtIndexPath:(NSIndexPath *)indexPath
{
  return _leading ? nil : [self swipeConfiguration];
}

- (UISwipeActionsConfiguration *)swipeConfiguration
{
  if (_disabled || _actions.count == 0 || _rowView == nil) {
    return nil;
  }

  NSMutableArray<UIContextualAction *> *actions = [NSMutableArray array];
  NSUInteger version = _configurationVersion;
  __weak TinyuiSwipeActionsView *weakSelf = self;
  for (NSDictionary *item in _actions) {
    if (![item isKindOfClass:NSDictionary.class] ||
        ![item[@"id"] isKindOfClass:NSString.class] ||
        ![item[@"title"] isKindOfClass:NSString.class]) {
      continue;
    }
    NSString *identifier = item[@"id"];
    NSString *title = item[@"title"];
    UIContextualActionStyle style = [item[@"destructive"] boolValue]
        ? UIContextualActionStyleDestructive : UIContextualActionStyleNormal;
    UIContextualAction *action = [UIContextualAction contextualActionWithStyle:style
        title:title handler:^(UIContextualAction *selectedAction, UIView *sourceView,
                              void (^completionHandler)(BOOL)) {
      TinyuiSwipeActionsView *view = weakSelf;
      if (view == nil || view->_disabled || view.window == nil || view->_rowView == nil ||
          version != view->_configurationVersion) {
        completionHandler(NO);
        return;
      }
      // Finish UIKit's interaction before JS can update or remove the row.
      completionHandler(YES);
      if (view->_eventEmitter != nullptr) {
        std::static_pointer_cast<const TinyuiSwipeActionsViewEventEmitter>(view->_eventEmitter)
            ->onActionPress(TinyuiSwipeActionsViewEventEmitter::OnActionPress{
                .id = std::string(identifier.UTF8String ?: ""),
                .title = std::string(title.UTF8String ?: "")});
      }
    }];
    if ([item[@"systemImage"] isKindOfClass:NSString.class]) {
      action.image = [UIImage systemImageNamed:item[@"systemImage"]];
    }
    if (item[@"tintColor"] != nil && item[@"tintColor"] != NSNull.null) {
      action.backgroundColor = [RCTConvert UIColor:item[@"tintColor"]];
    }
    [actions addObject:action];
  }
  UISwipeActionsConfiguration *configuration = [UISwipeActionsConfiguration configurationWithActions:actions];
  configuration.performsFirstActionWithFullSwipe = _allowsFullSwipe;
  return configuration;
}

- (void)tableView:(UITableView *)tableView willBeginEditingRowAtIndexPath:(NSIndexPath *)indexPath
{
  _actionsPresented = YES;
  // Fabric keeps observing touches handled by recognizers inside its surface.
  // Once UIKit starts a swipe, cancel that React sequence so a child/ancestor
  // Pressable cannot also complete an onPress when the finger is lifted.
  for (UIView *view = self; view != nil; view = view.superview) {
    for (UIGestureRecognizer *recognizer in view.gestureRecognizers) {
      if (recognizer.enabled &&
          ([recognizer isKindOfClass:RCTSurfaceTouchHandler.class] ||
           [recognizer isKindOfClass:RCTSurfacePointerHandler.class])) {
        recognizer.enabled = NO;
        recognizer.enabled = YES;
      }
    }
  }
  if (activeSwipeView != self) {
    [activeSwipeView closeActions];
  }
  activeSwipeView = self;
}

- (void)tableView:(UITableView *)tableView didEndEditingRowAtIndexPath:(NSIndexPath *)indexPath
{
  _actionsPresented = NO;
  if (activeSwipeView == self) {
    activeSwipeView = nil;
  }
}

- (void)closeActions
{
  _configurationVersion += 1;
  _actionsPresented = NO;
  [_tableView setEditing:NO animated:NO];
  if (activeSwipeView == self) {
    activeSwipeView = nil;
  }
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window == nil) {
    [self closeActions];
  }
}

- (void)prepareForRecycle
{
  [self closeActions];
  [_rowView removeFromSuperview];
  _rowView = nil;
  _actions = @[];
  _leading = NO;
  _allowsFullSwipe = YES;
  _disabled = NO;
  _needsConfiguration = YES;
  [super prepareForRecycle];
}

@end

#endif
