#include <jni.h>

#include <vector>

#include "SquircleGeometry.h"

namespace {

squircle::CornerRadii cornerRadiiFromArray(const jfloat *values) {
  return {
      {values[0], values[1]},
      {values[2], values[3]},
      {values[4], values[5]},
      {values[6], values[7]}};
}

}

extern "C" JNIEXPORT jfloatArray JNICALL Java_com_squircleview_geometry_SquircleGeometry_nativeBuildPath(
    JNIEnv *env,
    jclass,
    jfloat width,
    jfloat height,
    jfloatArray radii,
    jfloatArray insets,
    jfloat smoothing) {
  jfloat radiiValues[8];
  jfloat insetValues[4];
  env->GetFloatArrayRegion(radii, 0, 8, radiiValues);
  env->GetFloatArrayRegion(insets, 0, 4, insetValues);

  const squircle::Insets inset{insetValues[0], insetValues[1], insetValues[2], insetValues[3]};
  const auto path = squircle::buildPath(
      squircle::insetRect({0, 0, width, height}, inset),
      squircle::insetRadii(cornerRadiiFromArray(radiiValues), inset),
      smoothing);

  std::vector<jfloat> data;
  data.reserve(path.size() * 7);
  for (const auto &element : path) {
    data.push_back(static_cast<jfloat>(element.verb));
    const int count = element.verb == squircle::Verb::Cubic ? 3 : element.verb == squircle::Verb::Close ? 0 : 1;
    for (int index = 0; index < count; ++index) {
      data.push_back(static_cast<jfloat>(element.points[index].x));
      data.push_back(static_cast<jfloat>(element.points[index].y));
    }
  }

  jfloatArray result = env->NewFloatArray(static_cast<jsize>(data.size()));
  env->SetFloatArrayRegion(result, 0, static_cast<jsize>(data.size()), data.data());
  return result;
}
