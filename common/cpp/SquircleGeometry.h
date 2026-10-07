//
//  SquircleGeometry.h
//  Pods
//
//  Created by rit3zh CX on 10/7/26.
//

#pragma once

#include <array>
#include <cstdint>
#include <vector>

namespace squircle {

struct Point {
  double x = 0;
  double y = 0;

  bool operator==(const Point &other) const = default;
};

struct Rect {
  double x = 0;
  double y = 0;
  double width = 0;
  double height = 0;

  bool operator==(const Rect &other) const = default;
};

struct Insets {
  double top = 0;
  double right = 0;
  double bottom = 0;
  double left = 0;

  bool operator==(const Insets &other) const = default;
};

struct CornerRadius {
  double horizontal = 0;
  double vertical = 0;

  bool operator==(const CornerRadius &other) const = default;
};

struct CornerRadii {
  CornerRadius topLeft;
  CornerRadius topRight;
  CornerRadius bottomRight;
  CornerRadius bottomLeft;

  bool operator==(const CornerRadii &other) const = default;
};

enum class Verb : uint8_t { Move, Line, Cubic, Close };

struct PathElement {
  Verb verb;
  std::array<Point, 3> points;
};

using Path = std::vector<PathElement>;

double clampSmoothing(double smoothing);
bool hasRoundedCorner(const CornerRadii &radii);

Path buildPath(const Rect &rect, const CornerRadii &radii, double smoothing);

Rect insetRect(const Rect &rect, const Insets &insets);

CornerRadii insetRadii(const CornerRadii &radii, const Insets &insets);

} // namespace squircle
