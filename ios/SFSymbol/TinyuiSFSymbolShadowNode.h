#pragma once

#include <react/renderer/components/TinyuiSpec/ShadowNodes.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

class TinyuiSFSymbolShadowNode final
    : public ConcreteViewShadowNode<
          TinyuiSFSymbolViewComponentName,
          TinyuiSFSymbolViewProps,
          TinyuiSFSymbolViewEventEmitter> {
 public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  static ShadowNodeTraits BaseTraits()
  {
    auto traits = ConcreteViewShadowNode::BaseTraits();
    traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
    traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
    return traits;
  }

  Size measureContent(
      const LayoutContext &layoutContext,
      const LayoutConstraints &layoutConstraints) const override;
};

using TinyuiSFSymbolComponentDescriptor = ConcreteComponentDescriptor<TinyuiSFSymbolShadowNode>;

} // namespace facebook::react
