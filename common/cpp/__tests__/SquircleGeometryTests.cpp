//
//  SquircleGeometryTests.cpp
//  Pods
//
//  Created by rit3zh CX on 10/7/26.
//

#include "../SquircleGeometry.h"

#include <cmath>
#include <cstdio>
#include <functional>
#include <string>
#include <vector>

using namespace squircle;

namespace {

int failures = 0;
int checks = 0;

void expect(bool condition, const std::string &message) {
  ++checks;
  if (!condition) {
    ++failures;
    std::printf("  FAIL: %s\n", message.c_str());
  }
}

bool near(double a, double b, double epsilon = 1e-6) {
  return std::fabs(a - b) <= epsilon;
}

bool near(Point a, Point b, double epsilon = 1e-6) {
  return near(a.x, b.x, epsilon) && near(a.y, b.y, epsilon);
}

CornerRadii uniform(double radius) {
  return {{radius, radius}, {radius, radius}, {radius, radius}, {radius, radius}};
}

std::vector<Point> flatten(const Path &path, int steps = 64) {
  std::vector<Point> points;
  Point current;
  for (const auto &element : path) {
    switch (element.verb) {
      case Verb::Move:
      case Verb::Line:
        current = element.points[0];
        points.push_back(current);
        break;
      case Verb::Cubic: {
        const Point p0 = current;
        const auto &[p1, p2, p3] = element.points;
        for (int i = 1; i <= steps; ++i) {
          const double t = static_cast<double>(i) / steps;
          const double u = 1 - t;
          points.push_back(
              {u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
               u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y});
        }
        current = p3;
        break;
      }
      case Verb::Close:
        break;
    }
  }
  return points;
}

double area(const Path &path) {
  const auto points = flatten(path);
  double sum = 0;
  for (size_t i = 0; i < points.size(); ++i) {
    const auto &a = points[i];
    const auto &b = points[(i + 1) % points.size()];
    sum += a.x * b.y - b.x * a.y;
  }
  return std::fabs(sum) / 2;
}

bool allPointsInside(const Path &path, const Rect &rect) {
  const double epsilon = 1e-9;
  for (const auto &element : path) {
    if (element.verb == Verb::Close) {
      continue;
    }
    const int count = element.verb == Verb::Cubic ? 3 : 1;
    for (int i = 0; i < count; ++i) {
      const auto &p = element.points[i];
      if (p.x < rect.x - epsilon || p.y < rect.y - epsilon || p.x > rect.x + rect.width + epsilon ||
          p.y > rect.y + rect.height + epsilon) {
        return false;
      }
    }
  }
  return true;
}

struct Segment {
  Point startTangent;
  Point endTangent;
};

std::vector<Segment> segments(const Path &path) {
  std::vector<Segment> result;
  Point current;
  for (const auto &element : path) {
    switch (element.verb) {
      case Verb::Move:
        current = element.points[0];
        break;
      case Verb::Line: {
        const Point d{element.points[0].x - current.x, element.points[0].y - current.y};
        if (std::hypot(d.x, d.y) > 1e-9) {
          result.push_back({d, d});
        }
        current = element.points[0];
        break;
      }
      case Verb::Cubic: {
        const auto &[p1, p2, p3] = element.points;
        Point start{p1.x - current.x, p1.y - current.y};
        if (std::hypot(start.x, start.y) < 1e-9) {
          start = {p2.x - current.x, p2.y - current.y};
        }
        Point end{p3.x - p2.x, p3.y - p2.y};
        if (std::hypot(end.x, end.y) < 1e-9) {
          end = {p3.x - p1.x, p3.y - p1.y};
        }
        result.push_back({start, end});
        current = p3;
        break;
      }
      case Verb::Close:
        break;
    }
  }
  return result;
}

bool isTangentContinuous(const Path &path) {
  const auto list = segments(path);
  for (size_t i = 0; i < list.size(); ++i) {
    const auto &a = list[i].endTangent;
    const auto &b = list[(i + 1) % list.size()].startTangent;
    const double cross = a.x * b.y - a.y * b.x;
    const double dot = a.x * b.x + a.y * b.y;
    const double scale = std::hypot(a.x, a.y) * std::hypot(b.x, b.y);
    if (dot <= 0 || std::fabs(cross) / scale > 1e-6) {
      return false;
    }
  }
  return true;
}

void test(const char *name, const std::function<void()> &body) {
  const int before = failures;
  body();
  std::printf("%s %s\n", failures == before ? "ok  " : "FAIL", name);
}

} // namespace

int main() {
  const Rect square{0, 0, 100, 100};

  test("empty rect produces an empty path", [] {
    expect(buildPath({0, 0, 0, 100}, uniform(10), 1).empty(), "zero width");
    expect(buildPath({0, 0, 100, -1}, uniform(10), 1).empty(), "negative height");
    expect(buildPath({0, 0, NAN, 100}, uniform(10), 1).empty(), "NaN width");
  });

  test("zero radius produces a rectangle", [&] {
    const auto path = buildPath(square, uniform(0), 1);
    expect(path.front().verb == Verb::Move, "starts with move");
    expect(path.back().verb == Verb::Close, "ends with close");
    for (const auto &element : path) {
      expect(element.verb != Verb::Cubic, "no curves");
    }
    expect(near(area(path), 100 * 100), "full area");
  });

  test("smoothing 0 matches a circular rounded rectangle", [&] {
    const auto path = buildPath(square, uniform(10), 0);
    const double kappa = 4.0 / 3.0 * std::tan(M_PI / 8);
    expect(near(path[1].points[0], {90, 0}), "top edge ends at radius");
    expect(path[2].verb == Verb::Cubic, "corner is a single arc");
    expect(near(path[2].points[0], {90 + 10 * kappa, 0}), "arc control 1");
    expect(near(path[2].points[1], {100, 10 - 10 * kappa}), "arc control 2");
    expect(near(path[2].points[2], {100, 10}), "arc end");
    const double circular = 100 * 100 - (4 - M_PI) * 10 * 10;
    expect(near(area(path), circular, 0.5), "area equals circular rounded rect");
  });

  test("smoothing 1 extends the corner and stays tangent-continuous", [&] {
    const auto path = buildPath(square, uniform(10), 1);
    expect(near(path[1].points[0], {80, 0}), "corner starts at (1 + smoothing) * radius");
    expect(isTangentContinuous(path), "G1 continuity");
    expect(allPointsInside(path, square), "within bounds");
  });

  test("intermediate smoothing is tangent-continuous", [&] {
    for (double smoothing : {0.1, 0.25, 0.5, 0.6, 0.75, 0.9}) {
      const auto path = buildPath(square, uniform(24), smoothing);
      expect(isTangentContinuous(path), "G1 at " + std::to_string(smoothing));
      expect(allPointsInside(path, square), "bounds at " + std::to_string(smoothing));
    }
  });

  test("area shrinks monotonically as smoothing increases", [&] {
    double previous = area(buildPath(square, uniform(30), 0));
    for (double smoothing = 0.1; smoothing <= 1.0001; smoothing += 0.1) {
      const double current = area(buildPath(square, uniform(30), smoothing));
      expect(current < previous, "area decreases at " + std::to_string(smoothing));
      previous = current;
    }
  });

  test("out of range smoothing is clamped", [&] {
    const auto reference0 = buildPath(square, uniform(20), 0);
    const auto reference1 = buildPath(square, uniform(20), 1);
    expect(near(area(buildPath(square, uniform(20), -1)), area(reference0)), "negative clamps to 0");
    expect(near(area(buildPath(square, uniform(20), NAN)), area(reference0)), "NaN clamps to 0");
    expect(near(area(buildPath(square, uniform(20), 4)), area(reference1)), "above 1 clamps to 1");
    expect(clampSmoothing(0.5) == 0.5, "in range unchanged");
  });

  test("per-corner radii are respected", [] {
    const Rect rect{0, 0, 200, 100};
    const CornerRadii radii{{32, 32}, {32, 32}, {8, 8}, {0, 0}};
    const auto path = buildPath(rect, radii, 0);
    expect(near(path.front().points[0], {32, 0}), "top-left end");
    expect(near(path[1].points[0], {168, 0}), "top-right start");
    expect(near(path[3].points[0], {200, 92}), "bottom-right start");
    bool hasSharpCorner = false;
    for (const auto &element : path) {
      if (element.verb == Verb::Line && near(element.points[0], {0, 100})) {
        hasSharpCorner = true;
      }
    }
    expect(hasSharpCorner, "zero radius corner is sharp");
    expect(allPointsInside(path, rect), "within bounds");
  });

  test("asymmetric radii with smoothing are tangent-continuous", [] {
    const Rect rect{10, 20, 180, 120};
    const CornerRadii radii{{40, 40}, {12, 12}, {60, 60}, {4, 4}};
    const auto path = buildPath(rect, radii, 1);
    expect(isTangentContinuous(path), "G1 continuity");
    expect(allPointsInside(path, rect), "within bounds");
  });

  test("elliptical radii use horizontal and vertical components", [] {
    const Rect rect{0, 0, 100, 100};
    const CornerRadii radii{{0, 0}, {20, 10}, {0, 0}, {0, 0}};
    const auto path = buildPath(rect, radii, 0);
    expect(near(path[1].points[0], {80, 0}), "horizontal component");
    expect(near(path[2].points[2], {100, 10}), "vertical component");
    const CornerRadii elliptical{{30, 12}, {20, 10}, {16, 40}, {8, 24}};
    expect(isTangentContinuous(buildPath(rect, elliptical, 0.7)), "elliptical smoothing is G1");
    expect(allPointsInside(buildPath(rect, elliptical, 0.7), rect), "elliptical within bounds");
  });

  test("smoothing is limited by the available side length", [] {
    const Rect rect{0, 0, 300, 100};
    const auto path = buildPath(rect, uniform(50), 1);
    expect(allPointsInside(path, rect), "within bounds");
    expect(isTangentContinuous(path), "G1 continuity");
    for (const auto &element : path) {
      if (element.verb == Verb::Cubic && near(element.points[2].x, 300)) {
        expect(element.points[2].y <= 50 + 1e-9, "right side corners share the height");
      }
    }
  });

  test("very large radius on a small view stays bounded", [] {
    const Rect rect{0, 0, 40, 20};
    for (double smoothing : {0.0, 0.5, 1.0}) {
      const auto path = buildPath(rect, uniform(1000), smoothing);
      expect(allPointsInside(path, rect), "within bounds at " + std::to_string(smoothing));
      expect(area(path) > 0, "non-empty at " + std::to_string(smoothing));
    }
  });

  test("insets shrink rect and radii", [] {
    const Insets insets{1, 2, 3, 4};
    const Rect inner = insetRect({0, 0, 100, 50}, insets);
    expect(inner == Rect{4, 1, 94, 46}, "inset rect");
    const CornerRadii radii = insetRadii(uniform(10), insets);
    expect(radii.topLeft == CornerRadius{6, 9}, "top-left");
    expect(radii.topRight == CornerRadius{8, 9}, "top-right");
    expect(radii.bottomRight == CornerRadius{8, 7}, "bottom-right");
    expect(radii.bottomLeft == CornerRadius{6, 7}, "bottom-left");
    expect(insetRect({0, 0, 4, 4}, {5, 5, 5, 5}).width == 0, "collapsed inset rect");
    expect(insetRadii(uniform(2), {5, 5, 5, 5}) == uniform(0), "radii do not go negative");
  });

  test("rounded corner detection", [] {
    expect(!hasRoundedCorner(uniform(0)), "no radius");
    expect(hasRoundedCorner({{0, 0}, {0, 0}, {0, 0}, {1, 1}}), "single corner");
    expect(!hasRoundedCorner({{5, 0}, {0, 5}, {0, 0}, {0, 0}}), "degenerate elliptical corners");
  });

  test("origin offset translates the path", [] {
    const auto base = buildPath({0, 0, 50, 50}, uniform(10), 0.6);
    const auto moved = buildPath({7, 9, 50, 50}, uniform(10), 0.6);
    bool translated = base.size() == moved.size();
    for (size_t i = 0; translated && i < base.size(); ++i) {
      const int count = base[i].verb == Verb::Cubic ? 3 : base[i].verb == Verb::Close ? 0 : 1;
      for (int j = 0; j < count; ++j) {
        const Point expected{base[i].points[j].x + 7, base[i].points[j].y + 9};
        translated = translated && near(expected, moved[i].points[j]);
      }
    }
    expect(translated, "every point offset by origin");
  });

  std::printf("\n%d checks, %d failures\n", checks, failures);
  return failures == 0 ? 0 : 1;
}
