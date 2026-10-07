package com.squircleview.views

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Outline
import android.graphics.Paint
import android.graphics.Path
import android.os.Build
import android.view.View
import android.view.ViewOutlineProvider
import kotlin.math.abs
import androidx.annotation.ColorInt
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.facebook.react.uimanager.BackgroundStyleApplicator
import com.facebook.react.uimanager.LengthPercentage
import com.facebook.react.uimanager.style.BorderRadiusProp
import com.facebook.react.uimanager.style.BorderStyle
import com.facebook.react.uimanager.style.LogicalEdge
import com.facebook.react.views.view.ReactViewGroup
import com.squircleview.geometry.SquircleGeometry
import com.squircleview.style.SquircleStyle

public class SquircleView(context: Context) : ReactViewGroup(context) {
  private val style = SquircleStyle()
  private var borderSmoothing = 0f
  private var isSquircle = false

  private val radii = FloatArray(8)
  private val borderWidths = FloatArray(4)
  private val halfBorderWidths = FloatArray(4)
  private val borderColors = IntArray(4)
  private val noInsets = FloatArray(4)
  private val geometryKey = FloatArray(15)
  private val spokes = Array(4) { FloatArray(2) }
  private var hasGeometry = false
  private var hasStrokePath = false

  private val outerPath = Path()
  private val innerPath = Path()
  private val borderPath = Path().apply { fillType = Path.FillType.EVEN_ODD }
  private val strokePath = Path()
  private val wedgePath = Path()

  private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
  private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
  private var dashKey = 0f

  private val squircleOutlineProvider =
      object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline) {
          updateGeometry()
          if (outerPath.isEmpty) {
            outline.setRect(0, 0, view.width, view.height)
          } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            outline.setPath(outerPath)
          } else {
            @Suppress("DEPRECATION") outline.setConvexPath(outerPath)
          }
        }
      }

  public fun setBorderSmoothing(smoothing: Float) {
    borderSmoothing = SquircleGeometry.clampSmoothing(smoothing)
    refresh()
  }

  public fun setSquircleBorderRadius(prop: BorderRadiusProp, radius: LengthPercentage?) {
    style.radii[prop.ordinal] = radius
    BackgroundStyleApplicator.setBorderRadius(this, prop, radius)
    refresh()
  }

  public fun setSquircleBorderWidth(edge: LogicalEdge, width: Float?) {
    style.borderWidths[edge.ordinal] = width
    if (!isSquircle) {
      BackgroundStyleApplicator.setBorderWidth(this, edge, width)
    }
    invalidateSquircle()
  }

  public fun setSquircleBorderColor(edge: LogicalEdge, @ColorInt color: Int?) {
    style.borderColors[edge.ordinal] = color
    if (!isSquircle) {
      BackgroundStyleApplicator.setBorderColor(this, edge, color)
    }
    invalidateSquircle()
  }

  public fun setSquircleBorderStyle(borderStyle: BorderStyle?) {
    style.borderStyle = borderStyle
    if (!isSquircle) {
      BackgroundStyleApplicator.setBorderStyle(this, borderStyle)
    }
    invalidateSquircle()
  }

  public fun setSquircleBackgroundColor(@ColorInt color: Int) {
    style.backgroundColor = color
    if (!isSquircle) {
      BackgroundStyleApplicator.setBackgroundColor(this, color)
    }
    invalidateSquircle()
  }

  public fun resetSquircle() {
    style.reset()
    borderSmoothing = 0f
    isSquircle = false
    hasGeometry = false
    hasStrokePath = false
    setWillNotDraw(true)
    outlineProvider = ViewOutlineProvider.BACKGROUND
  }

  override fun draw(canvas: Canvas) {
    if (isSquircle) {
      updateGeometry()
      if (Color.alpha(style.backgroundColor) > 0) {
        fillPaint.color = style.backgroundColor
        canvas.drawPath(outerPath, fillPaint)
      }
    }
    super.draw(canvas)
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    if (isSquircle) {
      drawBorder(canvas)
    }
  }

  override fun dispatchDraw(canvas: Canvas) {
    if (!isSquircle || overflow == null || overflow == OVERFLOW_VISIBLE) {
      super.dispatchDraw(canvas)
      return
    }
    updateGeometry()
    val saveCount = canvas.save()
    canvas.clipPath(innerPath)
    super.dispatchDraw(canvas)
    canvas.restoreToCount(saveCount)
  }

  override fun onRtlPropertiesChanged(layoutDirection: Int) {
    super.onRtlPropertiesChanged(layoutDirection)
    invalidateSquircle()
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    invalidateOutline()
  }

  private fun refresh() {
    val squircle = borderSmoothing > 0f && style.hasRadius()
    if (squircle != isSquircle) {
      isSquircle = squircle
      applyNativeStyle(enabled = !squircle)
      setWillNotDraw(!squircle)
      outlineProvider = if (squircle) squircleOutlineProvider else ViewOutlineProvider.BACKGROUND
    }
    invalidateSquircle()
  }

  private fun applyNativeStyle(enabled: Boolean) {
    BackgroundStyleApplicator.setBackgroundColor(this, if (enabled) style.backgroundColor else null)
    for (edge in LogicalEdge.entries) {
      val width = style.borderWidths[edge.ordinal]
      if (width != null) {
        BackgroundStyleApplicator.setBorderWidth(this, edge, if (enabled) width else null)
      }
      val color = style.borderColors[edge.ordinal]
      if (color != null) {
        BackgroundStyleApplicator.setBorderColor(this, edge, if (enabled) color else null)
      }
    }
    if (style.borderStyle != null) {
      BackgroundStyleApplicator.setBorderStyle(this, if (enabled) style.borderStyle else null)
    }
  }

  private fun invalidateSquircle() {
    invalidate()
    invalidateOutline()
  }

  private val isRtl: Boolean
    get() = layoutDirection == View.LAYOUT_DIRECTION_RTL

  private val swapLeftAndRight: Boolean
    get() = I18nUtil.instance.doLeftAndRightSwapInRTL(context)

  private fun updateGeometry() {
    val width = width.toFloat()
    val height = height.toFloat()
    val isRtl = isRtl
    val swapLeftAndRight = swapLeftAndRight
    style.resolveRadii(isRtl, swapLeftAndRight, width, height, radii)
    style.resolveBorderWidths(isRtl, swapLeftAndRight, borderWidths)

    if (hasGeometry && keyMatches(width, height)) {
      return
    }
    writeKey(width, height)
    hasGeometry = true
    hasStrokePath = false

    outerPath.rewind()
    innerPath.rewind()
    borderPath.rewind()
    SquircleGeometry.appendPath(outerPath, width, height, radii, noInsets, borderSmoothing)
    SquircleGeometry.appendPath(innerPath, width, height, radii, borderWidths, borderSmoothing)
    borderPath.addPath(outerPath)
    borderPath.addPath(innerPath)
  }

  private fun keyMatches(width: Float, height: Float): Boolean {
    if (geometryKey[0] != width || geometryKey[1] != height || geometryKey[2] != borderSmoothing) {
      return false
    }
    for (index in radii.indices) {
      if (geometryKey[3 + index] != radii[index]) return false
    }
    for (index in borderWidths.indices) {
      if (geometryKey[11 + index] != borderWidths[index]) return false
    }
    return true
  }

  private fun writeKey(width: Float, height: Float) {
    geometryKey[0] = width
    geometryKey[1] = height
    geometryKey[2] = borderSmoothing
    radii.copyInto(geometryKey, 3)
    borderWidths.copyInto(geometryKey, 11)
  }

  private fun strokePath(): Path {
    if (!hasStrokePath) {
      for (index in borderWidths.indices) {
        halfBorderWidths[index] = borderWidths[index] / 2f
      }
      strokePath.rewind()
      SquircleGeometry.appendPath(strokePath, width.toFloat(), height.toFloat(), radii, halfBorderWidths, borderSmoothing)
      hasStrokePath = true
    }
    return strokePath
  }

  private fun drawBorder(canvas: Canvas) {
    if (borderWidths.all { it <= 0f }) {
      return
    }
    style.resolveBorderColors(isRtl, swapLeftAndRight, borderColors)
    val color = borderColors[0]

    if (borderColors.any { it != color }) {
      drawMulticolorBorder(canvas)
      return
    }

    val borderStyle = style.borderStyle
    val strokeWidth = borderWidths[0]
    if (borderStyle != null && borderStyle != BorderStyle.SOLID && borderWidths.all { it == strokeWidth }) {
      val dotted = borderStyle == BorderStyle.DOTTED
      strokePaint.color = color
      strokePaint.strokeWidth = strokeWidth
      strokePaint.strokeCap = if (dotted) Paint.Cap.ROUND else Paint.Cap.BUTT
      val key = if (dotted) -strokeWidth else strokeWidth
      if (dashKey != key) {
        dashKey = key
        strokePaint.pathEffect =
            DashPathEffect(
                if (dotted) floatArrayOf(0f, strokeWidth * 2) else floatArrayOf(strokeWidth * 3, strokeWidth * 3),
                0f,
            )
      }
      canvas.drawPath(strokePath(), strokePaint)
      return
    }

    fillPaint.color = color
    canvas.drawPath(borderPath, fillPaint)
  }

  private fun drawMulticolorBorder(canvas: Canvas) {
    val width = width.toFloat()
    val height = height.toFloat()
    val centerX = width / 2f
    val centerY = height / 2f
    val top = borderWidths[0]
    val right = borderWidths[1]
    val bottom = borderWidths[2]
    val left = borderWidths[3]

    val topLeft = spoke(spokes[0], 0f, 0f, left, top, centerX, centerY)
    val topRight = spoke(spokes[1], width, 0f, -right, top, centerX, centerY)
    val bottomRight = spoke(spokes[2], width, height, -right, -bottom, centerX, centerY)
    val bottomLeft = spoke(spokes[3], 0f, height, left, -bottom, centerX, centerY)

    val saveCount = canvas.save()
    canvas.clipPath(borderPath)
    drawWedge(canvas, borderColors[0], 0f, 0f, width, 0f, topRight, topLeft, centerX, centerY)
    drawWedge(canvas, borderColors[1], width, 0f, width, height, bottomRight, topRight, centerX, centerY)
    drawWedge(canvas, borderColors[2], width, height, 0f, height, bottomLeft, bottomRight, centerX, centerY)
    drawWedge(canvas, borderColors[3], 0f, height, 0f, 0f, topLeft, bottomLeft, centerX, centerY)
    canvas.restoreToCount(saveCount)
  }

  private fun spoke(
      out: FloatArray,
      x: Float,
      y: Float,
      dx: Float,
      dy: Float,
      halfWidth: Float,
      halfHeight: Float,
  ): FloatArray {
    var scale = Float.MAX_VALUE
    if (dx != 0f) scale = minOf(scale, halfWidth / abs(dx))
    if (dy != 0f) scale = minOf(scale, halfHeight / abs(dy))
    if (scale == Float.MAX_VALUE) {
      out[0] = x
      out[1] = y
    } else {
      out[0] = x + dx * scale
      out[1] = y + dy * scale
    }
    return out
  }

  private fun drawWedge(
      canvas: Canvas,
      @ColorInt color: Int,
      startX: Float,
      startY: Float,
      endX: Float,
      endY: Float,
      endSpoke: FloatArray,
      startSpoke: FloatArray,
      centerX: Float,
      centerY: Float,
  ) {
    wedgePath.rewind()
    wedgePath.moveTo(startX, startY)
    wedgePath.lineTo(endX, endY)
    wedgePath.lineTo(endSpoke[0], endSpoke[1])
    wedgePath.lineTo(centerX, centerY)
    wedgePath.lineTo(startSpoke[0], startSpoke[1])
    wedgePath.close()
    fillPaint.color = color
    canvas.drawPath(wedgePath, fillPaint)
  }

  private companion object {
    const val OVERFLOW_VISIBLE = "visible"
  }
}
