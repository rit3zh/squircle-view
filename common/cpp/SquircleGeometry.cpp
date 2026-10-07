//
//  SquircleGeometry.cpp
//  Pods
//
//  Created by rit3zh CX on 10/7/26.
//

#include "SquircleGeometry.h"

#include <algorithm>
#include <cmath>
#include <numbers>

namespace squircle {

namespace {

constexpr double kHalfPi = std::numbers::pi / 2;

struct AxisParams {
  double radius = 0;
  double a = 0;
  double b = 0;
  double c = 0;
  double d = 0;
  double arc = 0;
  double p = 0;
};

struct CornerFrame {
  Point origin;
  Point in;
  Point out;

  Point map(double x, double y) const {
    return {origin.x + x * in.x + y * out.x, origin.y + x * in.y + y * out.y};
  }
};

struct Corner {
  CornerFrame frame;
  AxisParams in;
  AxisParams out;
};

double shareOfSide(double radius, double adjacentRadius, double side) {
  const double total = radius + adjacentRadius;
  return total > 0 ? side * radius / total : 0;
}

AxisParams axisParams(double radius, double smoothing, double budget) {
  radius = std::min(radius, budget);
  if (radius <= 0) {
    return {};
  }

  const double sweep = kHalfPi * (1 - smoothing);
  const double angle = smoothing * kHalfPi / 2;
  const double arc = std::sin(sweep / 2) * radius * std::numbers::sqrt2;
  const double c = radius * std::tan(angle / 2) * std::cos(angle);
  const double d = c * std::tan(angle);

  double b = ((1 + smoothing) * radius - arc - c - d) / 3;
  double a = 2 * b;

  if ((1 + smoothing) * radius > budget) {
    const double available = std::max(0.0, budget - arc - c - d);
    b = std::min(b, available * 5 / 6);
    a = available - b;
  }

  return {radius, a, b, c, d, arc, a + b + c + d + arc};
}

Point ellipsePoint(const AxisParams &in, const AxisParams &out, double theta) {
  return {-in.radius + in.radius * std::cos(theta), out.radius + out.radius * std::sin(theta)};
}

Point ellipseTangent(const AxisParams &in, const AxisParams &out, double theta) {
  return {-in.radius * std::sin(theta), out.radius * std::cos(theta)};
}

void appendCubic(Path &path, const CornerFrame &frame, Point c1, Point c2, Point end) {
  path.push_back({Verb::Cubic, {frame.map(c1.x, c1.y), frame.map(c2.x, c2.y), frame.map(end.x, end.y)}});
}

void appendCorner(Path &path, const Corner &corner, double smoothing) {
  const auto &frame = corner.frame;
  const auto &in = corner.in;
  const auto &out = corner.out;

  path.push_back({Verb::Line, {frame.map(-in.p, 0)}});

  if (in.radius <= 0) {
    return;
  }

  if (smoothing > 0) {
    appendCubic(
        path,
        frame,
        {-in.p + in.a, 0},
        {-in.p + in.a + in.b, 0},
        {-(in.arc + in.d), out.d});
  }

  const double sweep = kHalfPi * (1 - smoothing);
  if (sweep > 0) {
    const double start = -kHalfPi + smoothing * kHalfPi / 2;
    const double end = start + sweep;
    const double k = 4.0 / 3.0 * std::tan(sweep / 4);
    const Point from = ellipsePoint(in, out, start);
    const Point to = ellipsePoint(in, out, end);
    const Point fromTangent = ellipseTangent(in, out, start);
    const Point toTangent = ellipseTangent(in, out, end);
    appendCubic(
        path,
        frame,
        {from.x + k * fromTangent.x, from.y + k * fromTangent.y},
        {to.x - k * toTangent.x, to.y - k * toTangent.y},
        to);
  }

  if (smoothing > 0) {
    appendCubic(
        path,
        frame,
        {0, out.arc + out.d + out.c},
        {0, out.arc + out.d + out.c + out.b},
        {0, out.p});
  }
}

Corner makeCorner(
    CornerFrame frame,
    double inRadius,
    double outRadius,
    double inBudget,
    double outBudget,
    double smoothing) {
  if (inRadius <= 0 || outRadius <= 0) {
    return {frame, {}, {}};
  }
  return {frame, axisParams(inRadius, smoothing, inBudget), axisParams(outRadius, smoothing, outBudget)};
}

} // namespace

double clampSmoothing(double smoothing) {
  if (!(smoothing > 0)) {
    return 0;
  }
  return std::min(smoothing, 1.0);
}

bool hasRoundedCorner(const CornerRadii &radii) {
  for (const auto &corner : {radii.topLeft, radii.topRight, radii.bottomRight, radii.bottomLeft}) {
    if (corner.horizontal > 0 && corner.vertical > 0) {
      return true;
    }
  }
  return false;
}

Path buildPath(const Rect &rect, const CornerRadii &radii, double smoothing) {
  Path path;
  if (!(rect.width > 0) || !(rect.height > 0)) {
    return path;
  }

  smoothing = clampSmoothing(smoothing);

  const double w = rect.width;
  const double h = rect.height;
  const double left = rect.x;
  const double top = rect.y;
  const double right = rect.x + w;
  const double bottom = rect.y + h;

  const auto &tl = radii.topLeft;
  const auto &tr = radii.topRight;
  const auto &br = radii.bottomRight;
  const auto &bl = radii.bottomLeft;

  const std::array<Corner, 4> corners = {
      makeCorner(
          {{right, top}, {1, 0}, {0, 1}},
          tr.horizontal,
          tr.vertical,
          shareOfSide(tr.horizontal, tl.horizontal, w),
          shareOfSide(tr.vertical, br.vertical, h),
          smoothing),
      makeCorner(
          {{right, bottom}, {0, 1}, {-1, 0}},
          br.vertical,
          br.horizontal,
          shareOfSide(br.vertical, tr.vertical, h),
          shareOfSide(br.horizontal, bl.horizontal, w),
          smoothing),
      makeCorner(
          {{left, bottom}, {-1, 0}, {0, -1}},
          bl.horizontal,
          bl.vertical,
          shareOfSide(bl.horizontal, br.horizontal, w),
          shareOfSide(bl.vertical, tl.vertical, h),
          smoothing),
      makeCorner(
          {{left, top}, {0, -1}, {1, 0}},
          tl.vertical,
          tl.horizontal,
          shareOfSide(tl.vertical, bl.vertical, h),
          shareOfSide(tl.horizontal, tr.horizontal, w),
          smoothing),
  };

  path.reserve(18);

  const auto &last = corners.back();
  path.push_back({Verb::Move, {last.frame.map(0, last.out.p)}});

  for (const auto &corner : corners) {
    appendCorner(path, corner, smoothing);
  }

  path.push_back({Verb::Close, {}});
  return path;
}

Rect insetRect(const Rect &rect, const Insets &insets) {
  return {
      rect.x + insets.left,
      rect.y + insets.top,
      std::max(0.0, rect.width - insets.left - insets.right),
      std::max(0.0, rect.height - insets.top - insets.bottom)};
}

CornerRadii insetRadii(const CornerRadii &radii, const Insets &insets) {
  const auto inset = [](const CornerRadius &radius, double horizontal, double vertical) {
    return CornerRadius{std::max(0.0, radius.horizontal - horizontal), std::max(0.0, radius.vertical - vertical)};
  };
  return {
      inset(radii.topLeft, insets.left, insets.top),
      inset(radii.topRight, insets.right, insets.top),
      inset(radii.bottomRight, insets.right, insets.bottom),
      inset(radii.bottomLeft, insets.left, insets.bottom)};
}

} // namespace squircle
