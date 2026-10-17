#if TINYUI_FEATURE_MEDIA_VIEW

//
//  TinyuiMediaView.mm
//  react-native-tinyui
//
//  React Native Fabric component binding for media view
//

#import "TinyuiMediaView.h"
#import "Tinyui-Swift.h"
#import <React/RCTConversions.h>

#import <react/renderer/components/TinyuiSpec/ComponentDescriptors.h>
#import <react/renderer/components/TinyuiSpec/EventEmitters.h>
#import <react/renderer/components/TinyuiSpec/Props.h>
#import <react/renderer/components/TinyuiSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface TinyuiMediaView () <TinyuiMediaViewDelegate, RCTTinyuiMediaViewViewProtocol>
@end

@implementation TinyuiMediaView {
  TinyuiMediaViewProvider *_view;
  BOOL _needsApplyProps;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<TinyuiMediaViewComponentDescriptor>();
}

+ (BOOL)shouldBeRecycled {
  // Release the player on unmount instead of retaining it in Fabric's recycle pool.
  return NO;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TinyuiMediaViewProps>();
    _props = defaultProps;

    _view = [[TinyuiMediaViewProvider alloc] init];
    _view.delegate = self;

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  _needsApplyProps = YES;
  [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask {
  [super finalizeUpdates:updateMask];
  if (!_needsApplyProps) {
    return;
  }
  _needsApplyProps = NO;

  // Fabric attaches the event emitter after updateProps on first mount.
  // Start loading only after all mount updates have been applied.
  const auto &newViewProps =
      *std::static_pointer_cast<TinyuiMediaViewProps const>(_props);

  [_view setResizeMode:RCTNSStringFromString(newViewProps.resizeMode)];
  [_view setSource:@{@"uri" : RCTNSStringFromString(newViewProps.source.uri)}];
}

#pragma mark - TinyuiMediaViewDelegate

- (void)handleOnLoadStart {
  if (_eventEmitter != nil) {
    std::dynamic_pointer_cast<const TinyuiMediaViewEventEmitter>(_eventEmitter)
        ->onLoadStart(TinyuiMediaViewEventEmitter::OnLoadStart{});
  }
}

- (void)handleOnLoad {
  if (_eventEmitter != nil) {
    std::dynamic_pointer_cast<const TinyuiMediaViewEventEmitter>(_eventEmitter)
        ->onLoad(TinyuiMediaViewEventEmitter::OnLoad{});
  }
}

- (void)handleOnLoadEnd {
  if (_eventEmitter != nil) {
    std::dynamic_pointer_cast<const TinyuiMediaViewEventEmitter>(_eventEmitter)
        ->onLoadEnd(TinyuiMediaViewEventEmitter::OnLoadEnd{});
  }
}

- (void)handleOnErrorWithError:(NSString *)error {
  if (_eventEmitter != nil) {
    std::dynamic_pointer_cast<const TinyuiMediaViewEventEmitter>(_eventEmitter)
        ->onError(TinyuiMediaViewEventEmitter::OnError{
            .error = std::string([error UTF8String])});
  }
}

- (void)prepareForRecycle {
  _needsApplyProps = NO;
  [_view reset];
  [super prepareForRecycle];
}

@end

#endif // TINYUI_FEATURE_MEDIA_VIEW
