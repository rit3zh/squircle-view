package com.squircleview

import com.facebook.react.bridge.Dynamic
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.LengthPercentage
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.style.BorderRadiusProp
import com.facebook.react.uimanager.style.BorderStyle
import com.facebook.react.uimanager.style.LogicalEdge
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager
import com.squircleview.views.SquircleView

@ReactModule(name = SquircleViewManager.NAME)
public class SquircleViewManager : ReactViewManager() {
  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): ReactViewGroup = SquircleView(context)

  override fun prepareToRecycleView(reactContext: ThemedReactContext, view: ReactViewGroup): ReactViewGroup? {
    val prepared = super.prepareToRecycleView(reactContext, view)
    (prepared as? SquircleView)?.resetSquircle()
    return prepared
  }

  @ReactProp(name = "borderSmoothing", defaultFloat = 0f)
  public fun setBorderSmoothing(view: ReactViewGroup, borderSmoothing: Float) {
    (view as SquircleView).setBorderSmoothing(borderSmoothing)
  }

  override fun setBorderRadius(view: ReactViewGroup, index: Int, rawBorderRadius: Dynamic) {
    (view as SquircleView).setSquircleBorderRadius(
        BorderRadiusProp.entries[index],
        LengthPercentage.setFromDynamic(rawBorderRadius),
    )
  }

  override fun setBorderWidth(view: ReactViewGroup, index: Int, width: Float) {
    (view as SquircleView).setSquircleBorderWidth(LogicalEdge.entries[index], width.takeUnless { it.isNaN() })
  }

  override fun setBorderColor(view: ReactViewGroup, index: Int, color: Int?) {
    (view as SquircleView).setSquircleBorderColor(BORDER_COLOR_EDGES[index], color)
  }

  override fun setBorderStyle(view: ReactViewGroup, borderStyle: String?) {
    (view as SquircleView).setSquircleBorderStyle(borderStyle?.let(BorderStyle::fromString))
  }

  override fun setBackgroundColor(view: ReactViewGroup, backgroundColor: Int) {
    (view as SquircleView).setSquircleBackgroundColor(backgroundColor)
  }

  public companion object {
    public const val NAME: String = "SquircleView"

    private val BORDER_COLOR_EDGES =
        arrayOf(
            LogicalEdge.ALL,
            LogicalEdge.LEFT,
            LogicalEdge.RIGHT,
            LogicalEdge.TOP,
            LogicalEdge.BOTTOM,
            LogicalEdge.START,
            LogicalEdge.END,
            LogicalEdge.BLOCK,
            LogicalEdge.BLOCK_END,
            LogicalEdge.BLOCK_START,
        )
  }
}
