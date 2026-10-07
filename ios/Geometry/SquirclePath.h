//
//  SquirclePath.h
//  Pods
//
//  Created by rit3zh CX on 10/7/26.
//

#import <CoreGraphics/CoreGraphics.h>

#import "SquircleGeometry.h"

CF_RETURNS_RETAINED CGPathRef _Nullable SquirclePathCreate(
    const squircle::Rect &rect,
    const squircle::CornerRadii &radii,
    double smoothing);

void SquirclePathAppend(
    CGMutablePathRef _Nonnull path,
    const squircle::Rect &rect,
    const squircle::CornerRadii &radii,
    double smoothing);
