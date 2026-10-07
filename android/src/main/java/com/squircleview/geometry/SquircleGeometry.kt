package com.squircleview.geometry

import android.graphics.Path
import com.facebook.soloader.SoLoader

internal object SquircleGeometry {
  private const val VERB_MOVE = 0
  private const val VERB_LINE = 1
  private const val VERB_CUBIC = 2
  private const val VERB_CLOSE = 3

  init {
    SoLoader.loadLibrary("squircleview")
  }

  fun clampSmoothing(smoothing: Float): Float =
      if (smoothing > 0f) smoothing.coerceAtMost(1f) else 0f

  fun appendPath(
      path: Path,
      width: Float,
      height: Float,
      radii: FloatArray,
      insets: FloatArray,
      smoothing: Float,
  ) {
    val data = nativeBuildPath(width, height, radii, insets, smoothing)
    var index = 0
    while (index < data.size) {
      when (data[index].toInt()) {
        VERB_MOVE -> path.moveTo(data[index + 1], data[index + 2]).also { index += 3 }
        VERB_LINE -> path.lineTo(data[index + 1], data[index + 2]).also { index += 3 }
        VERB_CUBIC -> {
          path.cubicTo(
              data[index + 1],
              data[index + 2],
              data[index + 3],
              data[index + 4],
              data[index + 5],
              data[index + 6],
          )
          index += 7
        }
        VERB_CLOSE -> path.close().also { index += 1 }
        else -> return
      }
    }
  }

  @JvmStatic
  private external fun nativeBuildPath(
      width: Float,
      height: Float,
      radii: FloatArray,
      insets: FloatArray,
      smoothing: Float,
  ): FloatArray
}
