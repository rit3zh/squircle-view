//
//  SquircleBorderLayer.m
//  Pods
//
//  Created by rit3zh CX on 10/7/26.
//

#import "SquircleBorderLayer.h"

static CGPoint SquircleSpokePoint(CGPoint corner, CGFloat dx, CGFloat dy, CGSize half) {
  CGFloat scale = CGFLOAT_MAX;
  if (dx != 0) {
    scale = MIN(scale, half.width / fabs(dx));
  }
  if (dy != 0) {
    scale = MIN(scale, half.height / fabs(dy));
  }
  if (scale == CGFLOAT_MAX) {
    return corner;
  }
  return CGPointMake(corner.x + dx * scale, corner.y + dy * scale);
}

static void SquircleFillWedge(CGContextRef context, UIColor *color, const CGPoint points[5]) {
  CGContextSetFillColorWithColor(context, color.CGColor);
  CGContextBeginPath(context);
  CGContextAddLines(context, points, 5);
  CGContextClosePath(context);
  CGContextFillPath(context);
}

@implementation SquircleBorderLayer {
  CGPathRef _borderPath;
  UIEdgeInsets _insets;
  UIColor *_topColor;
  UIColor *_rightColor;
  UIColor *_bottomColor;
  UIColor *_leftColor;
}

- (instancetype)init {
  if (self = [super init]) {
    self.needsDisplayOnBoundsChange = YES;
  }
  return self;
}

- (void)dealloc {
  CGPathRelease(_borderPath);
}

- (void)updateWithBorderPath:(CGPathRef)borderPath
                      insets:(UIEdgeInsets)insets
                    topColor:(UIColor *)topColor
                  rightColor:(UIColor *)rightColor
                 bottomColor:(UIColor *)bottomColor
                   leftColor:(UIColor *)leftColor {
  if (_borderPath != borderPath) {
    CGPathRelease(_borderPath);
    _borderPath = CGPathRetain(borderPath);
  }
  _insets = insets;
  _topColor = topColor;
  _rightColor = rightColor;
  _bottomColor = bottomColor;
  _leftColor = leftColor;
  [self setNeedsDisplay];
}

- (void)drawInContext:(CGContextRef)context {
  if (_borderPath == NULL) {
    return;
  }

  const CGSize size = self.bounds.size;
  const CGSize half = CGSizeMake(size.width / 2, size.height / 2);
  const CGPoint center = CGPointMake(half.width, half.height);
  const CGPoint topLeft = CGPointZero;
  const CGPoint topRight = CGPointMake(size.width, 0);
  const CGPoint bottomRight = CGPointMake(size.width, size.height);
  const CGPoint bottomLeft = CGPointMake(0, size.height);

  const CGPoint topLeftSpoke = SquircleSpokePoint(topLeft, _insets.left, _insets.top, half);
  const CGPoint topRightSpoke = SquircleSpokePoint(topRight, -_insets.right, _insets.top, half);
  const CGPoint bottomRightSpoke = SquircleSpokePoint(bottomRight, -_insets.right, -_insets.bottom, half);
  const CGPoint bottomLeftSpoke = SquircleSpokePoint(bottomLeft, _insets.left, -_insets.bottom, half);

  CGContextAddPath(context, _borderPath);
  CGContextEOClip(context);

  const CGPoint top[5] = {topLeft, topRight, topRightSpoke, center, topLeftSpoke};
  const CGPoint right[5] = {topRight, bottomRight, bottomRightSpoke, center, topRightSpoke};
  const CGPoint bottom[5] = {bottomRight, bottomLeft, bottomLeftSpoke, center, bottomRightSpoke};
  const CGPoint left[5] = {bottomLeft, topLeft, topLeftSpoke, center, bottomLeftSpoke};

  SquircleFillWedge(context, _topColor, top);
  SquircleFillWedge(context, _rightColor, right);
  SquircleFillWedge(context, _bottomColor, bottom);
  SquircleFillWedge(context, _leftColor, left);
}

@end
