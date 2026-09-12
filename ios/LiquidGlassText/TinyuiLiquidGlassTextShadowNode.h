#pragma once

#include <react/renderer/components/TinyuiSpec/ShadowNodes.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

class TinyuiLiquidGlassTextShadowNode final
    : public ConcreteViewShadowNode<
          TinyuiLiquidGlassTextViewComponentName,
          TinyuiLiquidGlassTextViewProps,
          TinyuiLiquidGlassTextViewEventEmitter,
          TinyuiLiquidGlassTextViewState> {
 public:
  using BaseShadowNode = ConcreteViewShadowNode<
      TinyuiLiquidGlassTextViewComponentName,
      TinyuiLiquidGlassTextViewProps,
      TinyuiLiquidGlassTextViewEventEmitter,
      TinyuiLiquidGlassTextViewState>;
  using BaseShadowNode::BaseShadowNode;

  static ShadowNodeTraits BaseTraits()
  {
    auto traits = BaseShadowNode::BaseTraits();
    traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
    traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
    return traits;
  }

  Size measureContent(
      const LayoutContext &layoutContext,
      const LayoutConstraints &layoutConstraints) const override;
};

class TinyuiLiquidGlassTextComponentDescriptor final
    : public ConcreteComponentDescriptor<TinyuiLiquidGlassTextShadowNode> {
 public:
  TinyuiLiquidGlassTextComponentDescriptor(
      const ComponentDescriptorParameters &parameters)
      : ConcreteComponentDescriptor(parameters)
  {
  }
};

} // namespace facebook::react
