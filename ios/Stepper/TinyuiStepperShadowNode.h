#pragma once

#include <react/renderer/components/TinyuiSpec/ShadowNodes.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/LayoutConstraints.h>

namespace facebook::react {

class TinyuiStepperShadowNode final
    : public ConcreteViewShadowNode<
          TinyuiStepperViewComponentName,
          TinyuiStepperViewProps,
          TinyuiStepperViewEventEmitter> {
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

using TinyuiStepperComponentDescriptor = ConcreteComponentDescriptor<TinyuiStepperShadowNode>;

} // namespace facebook::react
