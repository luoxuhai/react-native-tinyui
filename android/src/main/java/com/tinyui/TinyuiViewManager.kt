package com.tinyui

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.TinyuiViewManagerInterface
import com.facebook.react.viewmanagers.TinyuiViewManagerDelegate

@ReactModule(name = TinyuiViewManager.NAME)
class TinyuiViewManager : SimpleViewManager<TinyuiView>(),
  TinyuiViewManagerInterface<TinyuiView> {
  private val mDelegate: ViewManagerDelegate<TinyuiView>

  init {
    mDelegate = TinyuiViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<TinyuiView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): TinyuiView {
    return TinyuiView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: TinyuiView?, color: Int?) {
    view?.setBackgroundColor(color ?: Color.TRANSPARENT)
  }

  companion object {
    const val NAME = "TinyuiView"
  }
}
