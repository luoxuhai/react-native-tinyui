#pragma once

#include <react/renderer/components/TinyuiSpec/ShadowNodes.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/LayoutConstraints.h>
#include <cmath>
#include <string>

namespace facebook::react {

struct TinyuiInlineTipState final {
  std::string tipId{};
  Size contentSize{};
};

class TinyuiInlineTipShadowNode final
    : public ConcreteViewShadowNode<
          TinyuiTipViewComponentName,
          TinyuiTipViewProps,
          TinyuiTipViewEventEmitter,
          TinyuiInlineTipState> {
 public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  static ShadowNodeTraits BaseTraits()
  {
    auto traits = ConcreteViewShadowNode::BaseTraits();
    traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
    traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
    return traits;
  }

  Size measureContent(const LayoutContext &, const LayoutConstraints &constraints) const override
  {
    const auto &props = getConcreteProps();
    const auto &state = getStateData();
    // Fill the available width, then let TipUIView measure wrapping on the main
    // thread. Fabric state brings its height back without a JS layout roundtrip.
    auto width = std::isfinite(constraints.maximumSize.width)
        ? constraints.maximumSize.width : state.contentSize.width;
    auto height = props.enabled && props.tipId == state.tipId ? state.contentSize.height : 0;
    return constraints.clamp({width, height});
  }
};

using TinyuiInlineTipComponentDescriptor = ConcreteComponentDescriptor<TinyuiInlineTipShadowNode>;

} // namespace facebook::react
