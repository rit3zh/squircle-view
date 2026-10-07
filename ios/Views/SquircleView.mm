//
//  SquircleView.mm
//  Pods
//
//  Created by rit3zh CX on 10/7/26.
//

#import "SquircleView.h"

#import <objc/runtime.h>

#import <optional>

#import <React/RCTConversions.h>
#import <React/RCTUtils.h>
#import <react/featureflags/ReactNativeFeatureFlags.h>
#import <react/renderer/components/SquircleViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/SquircleViewSpec/Props.h>

#import "SquircleBorderLayer.h"
#import "SquirclePath.h"

using namespace facebook::react;

static const CGFloat SquircleBackgroundZPosition = -1024;
static const CGFloat SquircleBorderZPosition = -1023;

@interface RCTViewComponentView (SquircleView)
- (UIView *)currentContainerView;
- (void)invalidateLayer;
@end

namespace {

struct SquircleGeometryKey {
  squircle::Rect bounds;
  squircle::CornerRadii radii;
  squircle::Insets insets;
  double smoothing;

  bool operator==(const SquircleGeometryKey &other) const = default;
};

squircle::CornerRadii SquircleCornerRadiiFromBorderRadii(const BorderRadii &radii) {
  return {
      {radii.topLeft.horizontal, radii.topLeft.vertical},
      {radii.topRight.horizontal, radii.topRight.vertical},
      {radii.bottomRight.horizontal, radii.bottomRight.vertical},
      {radii.bottomLeft.horizontal, radii.bottomLeft.vertical}};
}

squircle::Insets SquircleInsetsFromBorderWidths(const BorderWidths &widths) {
  return {widths.top, widths.right, widths.bottom, widths.left};
}

UIColor *SquircleResolvedColor(const SharedColor &color, UITraitCollection *traitCollection) {
  UIColor *resolved = RCTUIColorFromSharedColor(color) ?: UIColor.blackColor;
  return [resolved resolvedColorWithTraitCollection:traitCollection];
}

} // namespace

@implementation SquircleView {
  CGFloat _borderSmoothing;
  BOOL _needsSquircleUpdate;
  std::optional<SquircleGeometryKey> _geometryKey;
  CGPathRef _outerPath;
  CGPathRef _innerPath;
  CGPathRef _borderPath;
  CGPathRef _strokePath;
  CAShapeLayer *_backgroundLayer;
  CAShapeLayer *_borderShapeLayer;
  SquircleBorderLayer *_multicolorBorderLayer;
  CAShapeLayer *_clipLayer;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<SquircleViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const SquircleViewProps>();
    _props = defaultProps;
  }
  return self;
}

- (void)dealloc {
  [self releasePaths];
}

#pragma mark - RCTComponentViewProtocol

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = static_cast<const SquircleViewProps &>(*props);
  const CGFloat smoothing = squircle::clampSmoothing(newProps.borderSmoothing);
  if (smoothing != _borderSmoothing) {
    _borderSmoothing = smoothing;
    _needsSquircleUpdate = YES;
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask {
  [super finalizeUpdates:updateMask];

  if (_needsSquircleUpdate) {
    [self invalidateLayer];
  }
}

- (void)prepareForRecycle {
  [super prepareForRecycle];

  _borderSmoothing = 0;
  _needsSquircleUpdate = NO;
  [self removeSquircleLayers];
}

#pragma mark - Layer

- (void)invalidateLayer {
  _needsSquircleUpdate = NO;

  const auto borderMetrics = _props->resolveBorderMetrics(_layoutMetrics);
  const auto radii = SquircleCornerRadiiFromBorderRadii(borderMetrics.borderRadii);
  const CGSize size = self.layer.bounds.size;

  if (_borderSmoothing <= 0 || !squircle::hasRoundedCorner(radii) || size.width <= 0 || size.height <= 0) {
    [self removeSquircleLayers];
    [super invalidateLayer];
    return;
  }

  UIColor *backgroundColor = self.backgroundColor;
  self.backgroundColor = nil;
  [super invalidateLayer];
  self.backgroundColor = backgroundColor;

  const SquircleGeometryKey key{
      .bounds = {0, 0, size.width, size.height},
      .radii = radii,
      .insets = SquircleInsetsFromBorderWidths(borderMetrics.borderWidths),
      .smoothing = _borderSmoothing,
  };
  [self updateGeometry:key];

  [CATransaction begin];
  [CATransaction setDisableActions:YES];
  [self hideDefaultBackgroundAndBorder];
  [self updateBackgroundWithColor:backgroundColor];
  [self updateBorderWithMetrics:borderMetrics];
  [self updateClipping];
  [CATransaction commit];
}

- (void)updateGeometry:(const SquircleGeometryKey &)key {
  if (_geometryKey == key) {
    return;
  }

  [self releasePaths];
  _geometryKey = key;

  const auto innerRect = squircle::insetRect(key.bounds, key.insets);
  const auto innerRadii = squircle::insetRadii(key.radii, key.insets);

  _outerPath = SquirclePathCreate(key.bounds, key.radii, key.smoothing);
  _innerPath = SquirclePathCreate(innerRect, innerRadii, key.smoothing);

  CGMutablePathRef borderPath = CGPathCreateMutableCopy(_outerPath);
  SquirclePathAppend(borderPath, innerRect, innerRadii, key.smoothing);
  _borderPath = borderPath;
}

- (CGPathRef)strokePath {
  if (_strokePath == NULL && _geometryKey) {
    const auto &key = *_geometryKey;
    const squircle::Insets half{
        key.insets.top / 2, key.insets.right / 2, key.insets.bottom / 2, key.insets.left / 2};
    _strokePath = SquirclePathCreate(
        squircle::insetRect(key.bounds, half), squircle::insetRadii(key.radii, half), key.smoothing);
  }
  return _strokePath;
}

- (void)releasePaths {
  CGPathRelease(_outerPath);
  CGPathRelease(_innerPath);
  CGPathRelease(_borderPath);
  CGPathRelease(_strokePath);
  _outerPath = NULL;
  _innerPath = NULL;
  _borderPath = NULL;
  _strokePath = NULL;
  _geometryKey.reset();
}

// RCTViewComponentView draws non-uniform borders into a private sublayer; it has to be hidden
// while the squircle border is rendered in its place.
- (nullable CALayer *)defaultBorderLayer {
  static Ivar ivar = class_getInstanceVariable([RCTViewComponentView class], "_borderLayer");
  return ivar != nullptr ? object_getIvar(self, ivar) : nil;
}

- (void)hideDefaultBackgroundAndBorder {
  CALayer *layer = self.layer;
  layer.backgroundColor = nil;
  layer.borderWidth = 0;
  layer.borderColor = nil;
  layer.cornerRadius = 0;
  [self defaultBorderLayer].hidden = YES;
}

- (void)updateBackgroundWithColor:(nullable UIColor *)backgroundColor {
  CALayer *layer = self.layer;
  UIColor *color = [backgroundColor resolvedColorWithTraitCollection:self.traitCollection];
  const CGFloat alpha = color != nil ? CGColorGetAlpha(color.CGColor) : 0;

  if (alpha > 0) {
    if (_backgroundLayer == nil) {
      _backgroundLayer = [CAShapeLayer layer];
      _backgroundLayer.zPosition = SquircleBackgroundZPosition;
      [layer addSublayer:_backgroundLayer];
    }
    _backgroundLayer.frame = layer.bounds;
    _backgroundLayer.path = _outerPath;
    _backgroundLayer.fillColor = color.CGColor;
  } else {
    [_backgroundLayer removeFromSuperlayer];
    _backgroundLayer = nil;
  }

  const BOOL hasShadow = layer.shadowOpacity > 0 && CGColorGetAlpha(layer.shadowColor) > 0;
  layer.shadowPath = hasShadow && alpha > 0.999 ? _outerPath : nil;
}

- (void)updateBorderWithMetrics:(const BorderMetrics &)metrics {
  const auto &widths = metrics.borderWidths;
  if (widths.left <= 0 && widths.top <= 0 && widths.right <= 0 && widths.bottom <= 0) {
    [self removeBorderLayers];
    return;
  }

  CALayer *layer = self.layer;
  UITraitCollection *traitCollection = self.traitCollection;
  UIColor *top = SquircleResolvedColor(metrics.borderColors.top, traitCollection);
  UIColor *right = SquircleResolvedColor(metrics.borderColors.right, traitCollection);
  UIColor *bottom = SquircleResolvedColor(metrics.borderColors.bottom, traitCollection);
  UIColor *left = SquircleResolvedColor(metrics.borderColors.left, traitCollection);

  const BOOL uniformColor = CGColorEqualToColor(top.CGColor, right.CGColor) &&
      CGColorEqualToColor(top.CGColor, bottom.CGColor) && CGColorEqualToColor(top.CGColor, left.CGColor);

  if (!uniformColor) {
    [_borderShapeLayer removeFromSuperlayer];
    _borderShapeLayer = nil;

    if (_multicolorBorderLayer == nil) {
      _multicolorBorderLayer = [SquircleBorderLayer layer];
      _multicolorBorderLayer.zPosition = SquircleBorderZPosition;
      _multicolorBorderLayer.contentsScale = RCTScreenScale();
      [layer addSublayer:_multicolorBorderLayer];
    }
    _multicolorBorderLayer.frame = layer.bounds;
    [_multicolorBorderLayer updateWithBorderPath:_borderPath
                                          insets:UIEdgeInsetsMake(widths.top, widths.left, widths.bottom, widths.right)
                                        topColor:top
                                      rightColor:right
                                     bottomColor:bottom
                                       leftColor:left];
    return;
  }

  [_multicolorBorderLayer removeFromSuperlayer];
  _multicolorBorderLayer = nil;

  if (_borderShapeLayer == nil) {
    _borderShapeLayer = [CAShapeLayer layer];
    _borderShapeLayer.zPosition = SquircleBorderZPosition;
    [layer addSublayer:_borderShapeLayer];
  }
  _borderShapeLayer.frame = layer.bounds;

  const BorderStyle style = metrics.borderStyles.left;
  if (style != BorderStyle::Solid && metrics.borderStyles.isUniform() && widths.isUniform()) {
    const CGFloat width = widths.left;
    const BOOL dotted = style == BorderStyle::Dotted;
    _borderShapeLayer.path = [self strokePath];
    _borderShapeLayer.fillColor = nil;
    _borderShapeLayer.strokeColor = top.CGColor;
    _borderShapeLayer.lineWidth = width;
    _borderShapeLayer.lineCap = dotted ? kCALineCapRound : kCALineCapButt;
    _borderShapeLayer.lineDashPattern = dotted ? @[ @0, @(width * 2) ] : @[ @(width * 3), @(width * 3) ];
  } else {
    _borderShapeLayer.path = _borderPath;
    _borderShapeLayer.fillRule = kCAFillRuleEvenOdd;
    _borderShapeLayer.fillColor = top.CGColor;
    _borderShapeLayer.strokeColor = nil;
    _borderShapeLayer.lineDashPattern = nil;
  }
}

- (void)updateClipping {
  UIView *containerView = self.currentContainerView;
  if (!containerView.clipsToBounds) {
    return;
  }

  if (_clipLayer == nil) {
    _clipLayer = [CAShapeLayer layer];
  }
  _clipLayer.frame = containerView.bounds;
  _clipLayer.path = ReactNativeFeatureFlags::enableIOSViewClipToPaddingBox() ? _innerPath : _outerPath;
  containerView.layer.cornerRadius = 0;
  containerView.layer.mask = _clipLayer;
}

- (void)removeBorderLayers {
  [_borderShapeLayer removeFromSuperlayer];
  _borderShapeLayer = nil;
  [_multicolorBorderLayer removeFromSuperlayer];
  _multicolorBorderLayer = nil;
}

- (void)removeSquircleLayers {
  [_backgroundLayer removeFromSuperlayer];
  _backgroundLayer = nil;
  [self removeBorderLayers];
  _clipLayer = nil;
  [self defaultBorderLayer].hidden = NO;
  [self releasePaths];
}

@end
