package com.squircleview.style

import android.graphics.Color
import androidx.annotation.ColorInt
import com.facebook.react.uimanager.LengthPercentage
import com.facebook.react.uimanager.LengthPercentageType
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.style.BorderRadiusProp
import com.facebook.react.uimanager.style.BorderStyle
import com.facebook.react.uimanager.style.LogicalEdge

internal class SquircleStyle {
  val radii: Array<LengthPercentage?> = arrayOfNulls(BorderRadiusProp.entries.size)
  val borderWidths: Array<Float?> = arrayOfNulls(LogicalEdge.entries.size)
  val borderColors: Array<Int?> = arrayOfNulls(LogicalEdge.entries.size)
  @ColorInt var backgroundColor: Int = Color.TRANSPARENT
  var borderStyle: BorderStyle? = null

  fun hasRadius(): Boolean = radii.any { it != null && it.resolve(1f) > 0f }

  fun reset() {
    radii.fill(null)
    borderWidths.fill(null)
    borderColors.fill(null)
    backgroundColor = Color.TRANSPARENT
    borderStyle = null
  }

  fun resolveRadii(isRtl: Boolean, swapLeftAndRight: Boolean, width: Float, height: Float, out: FloatArray) {
    val topLeft: LengthPercentage?
    val topRight: LengthPercentage?
    val bottomLeft: LengthPercentage?
    val bottomRight: LengthPercentage?
    val uniform = radius(BorderRadiusProp.BORDER_RADIUS)

    when {
      !isRtl -> {
        topLeft = radius(BorderRadiusProp.BORDER_START_START_RADIUS, BorderRadiusProp.BORDER_TOP_START_RADIUS, BorderRadiusProp.BORDER_TOP_LEFT_RADIUS)
        topRight = radius(BorderRadiusProp.BORDER_END_START_RADIUS, BorderRadiusProp.BORDER_TOP_END_RADIUS, BorderRadiusProp.BORDER_TOP_RIGHT_RADIUS)
        bottomLeft = radius(BorderRadiusProp.BORDER_START_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_START_RADIUS, BorderRadiusProp.BORDER_BOTTOM_LEFT_RADIUS)
        bottomRight = radius(BorderRadiusProp.BORDER_END_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_RIGHT_RADIUS)
      }
      swapLeftAndRight -> {
        topLeft = radius(BorderRadiusProp.BORDER_END_START_RADIUS, BorderRadiusProp.BORDER_TOP_END_RADIUS, BorderRadiusProp.BORDER_TOP_RIGHT_RADIUS)
        topRight = radius(BorderRadiusProp.BORDER_START_START_RADIUS, BorderRadiusProp.BORDER_TOP_START_RADIUS, BorderRadiusProp.BORDER_TOP_LEFT_RADIUS)
        bottomLeft = radius(BorderRadiusProp.BORDER_END_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_RIGHT_RADIUS)
        bottomRight = radius(BorderRadiusProp.BORDER_START_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_START_RADIUS, BorderRadiusProp.BORDER_BOTTOM_LEFT_RADIUS)
      }
      else -> {
        topLeft = radius(BorderRadiusProp.BORDER_END_START_RADIUS, BorderRadiusProp.BORDER_TOP_END_RADIUS, BorderRadiusProp.BORDER_TOP_LEFT_RADIUS)
        topRight = radius(BorderRadiusProp.BORDER_START_START_RADIUS, BorderRadiusProp.BORDER_TOP_START_RADIUS, BorderRadiusProp.BORDER_TOP_RIGHT_RADIUS)
        bottomLeft = radius(BorderRadiusProp.BORDER_END_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_START_RADIUS, BorderRadiusProp.BORDER_BOTTOM_LEFT_RADIUS)
        bottomRight = radius(BorderRadiusProp.BORDER_START_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_END_RADIUS, BorderRadiusProp.BORDER_BOTTOM_RIGHT_RADIUS)
      }
    }

    writeCorner(out, 0, topLeft ?: uniform, width, height)
    writeCorner(out, 2, topRight ?: uniform, width, height)
    writeCorner(out, 4, bottomRight ?: uniform, width, height)
    writeCorner(out, 6, bottomLeft ?: uniform, width, height)
    ensureNoOverlap(out, width, height)
  }

  fun resolveBorderWidths(isRtl: Boolean, swapLeftAndRight: Boolean, out: FloatArray) {
    resolveEdges(borderWidths, isRtl, swapLeftAndRight) { top, right, bottom, left ->
      out[0] = PixelUtil.toPixelFromDIP(top ?: 0f)
      out[1] = PixelUtil.toPixelFromDIP(right ?: 0f)
      out[2] = PixelUtil.toPixelFromDIP(bottom ?: 0f)
      out[3] = PixelUtil.toPixelFromDIP(left ?: 0f)
    }
  }

  fun resolveBorderColors(isRtl: Boolean, swapLeftAndRight: Boolean, out: IntArray) {
    resolveEdges(borderColors, isRtl, swapLeftAndRight) { top, right, bottom, left ->
      out[0] = top ?: Color.BLACK
      out[1] = right ?: Color.BLACK
      out[2] = bottom ?: Color.BLACK
      out[3] = left ?: Color.BLACK
    }
  }

  private fun radius(prop: BorderRadiusProp): LengthPercentage? = radii[prop.ordinal]

  private fun radius(
      logical: BorderRadiusProp,
      side: BorderRadiusProp,
      physical: BorderRadiusProp,
  ): LengthPercentage? = radii[logical.ordinal] ?: radii[side.ordinal] ?: radii[physical.ordinal]

  private inline fun <T> resolveEdges(
      values: Array<T?>,
      isRtl: Boolean,
      swapLeftAndRight: Boolean,
      block: (top: T?, right: T?, bottom: T?, left: T?) -> Unit,
  ) {
    val leftLogical = if (isRtl) LogicalEdge.END else LogicalEdge.START
    val rightLogical = if (isRtl) LogicalEdge.START else LogicalEdge.END
    val swap = isRtl && swapLeftAndRight
    val leftPhysical = if (swap) LogicalEdge.RIGHT else LogicalEdge.LEFT
    val rightPhysical = if (swap) LogicalEdge.LEFT else LogicalEdge.RIGHT
    val all = values[LogicalEdge.ALL.ordinal]
    val horizontal = values[LogicalEdge.HORIZONTAL.ordinal] ?: all
    val vertical = values[LogicalEdge.BLOCK.ordinal] ?: values[LogicalEdge.VERTICAL.ordinal] ?: all

    block(
        values[LogicalEdge.BLOCK_START.ordinal] ?: values[LogicalEdge.TOP.ordinal] ?: vertical,
        values[rightLogical.ordinal] ?: values[rightPhysical.ordinal] ?: horizontal,
        values[LogicalEdge.BLOCK_END.ordinal] ?: values[LogicalEdge.BOTTOM.ordinal] ?: vertical,
        values[leftLogical.ordinal] ?: values[leftPhysical.ordinal] ?: horizontal,
    )
  }

  private fun writeCorner(out: FloatArray, offset: Int, radius: LengthPercentage?, width: Float, height: Float) {
    out[offset] = toPixels(radius, width)
    out[offset + 1] = toPixels(radius, height)
  }

  private fun toPixels(radius: LengthPercentage?, reference: Float): Float =
      when (radius?.type) {
        null -> 0f
        LengthPercentageType.POINT -> PixelUtil.toPixelFromDIP(radius.resolve(0f))
        LengthPercentageType.PERCENT -> radius.resolve(reference)
      }

  private fun ensureNoOverlap(radii: FloatArray, width: Float, height: Float) {
    fun scale(sum: Float, side: Float): Float = if (sum > 0f) minOf(side / sum, 1f) else 0f

    val top = scale(radii[0] + radii[2], width)
    val right = scale(radii[3] + radii[5], height)
    val bottom = scale(radii[6] + radii[4], width)
    val left = scale(radii[1] + radii[7], height)
    scaleCorner(radii, 0, minOf(top, left))
    scaleCorner(radii, 2, minOf(right, top))
    scaleCorner(radii, 4, minOf(bottom, right))
    scaleCorner(radii, 6, minOf(left, bottom))
  }

  private fun scaleCorner(radii: FloatArray, offset: Int, factor: Float) {
    radii[offset] *= factor
    radii[offset + 1] *= factor
  }
}
