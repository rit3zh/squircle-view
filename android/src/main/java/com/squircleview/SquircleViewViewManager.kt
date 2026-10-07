package com.squircleview

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.SquircleViewViewManagerInterface
import com.facebook.react.viewmanagers.SquircleViewViewManagerDelegate

@ReactModule(name = SquircleViewViewManager.NAME)
class SquircleViewViewManager : SimpleViewManager<SquircleViewView>(),
  SquircleViewViewManagerInterface<SquircleViewView> {
  private val mDelegate: ViewManagerDelegate<SquircleViewView>

  init {
    mDelegate = SquircleViewViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<SquircleViewView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): SquircleViewView {
    return SquircleViewView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: SquircleViewView?, color: Int?) {
    view?.setBackgroundColor(color ?: Color.TRANSPARENT)
  }

  companion object {
    const val NAME = "SquircleViewView"
  }
}
