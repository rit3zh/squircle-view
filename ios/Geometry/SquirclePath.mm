//
//  SquirclePath.mm
//  Pods
//
//  Created by rit3zh CX on 10/7/26.
//

#import "SquirclePath.h"

void SquirclePathAppend(
    CGMutablePathRef path,
    const squircle::Rect &rect,
    const squircle::CornerRadii &radii,
    double smoothing) {
  for (const auto &element : squircle::buildPath(rect, radii, smoothing)) {
    const auto &points = element.points;
    switch (element.verb) {
      case squircle::Verb::Move:
        CGPathMoveToPoint(path, NULL, points[0].x, points[0].y);
        break;
      case squircle::Verb::Line:
        CGPathAddLineToPoint(path, NULL, points[0].x, points[0].y);
        break;
      case squircle::Verb::Cubic:
        CGPathAddCurveToPoint(
            path, NULL, points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);
        break;
      case squircle::Verb::Close:
        CGPathCloseSubpath(path);
        break;
    }
  }
}

CGPathRef SquirclePathCreate(const squircle::Rect &rect, const squircle::CornerRadii &radii, double smoothing) {
  CGMutablePathRef path = CGPathCreateMutable();
  SquirclePathAppend(path, rect, radii, smoothing);
  return path;
}
