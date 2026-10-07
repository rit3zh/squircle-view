//
//  SquircleBorderLayer.h
//  Pods
//
//  Created by rit3zh CX on 10/7/26.
//

#import <QuartzCore/QuartzCore.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface SquircleBorderLayer : CALayer

- (void)updateWithBorderPath:(CGPathRef)borderPath
                      insets:(UIEdgeInsets)insets
                    topColor:(UIColor *)topColor
                  rightColor:(UIColor *)rightColor
                 bottomColor:(UIColor *)bottomColor
                   leftColor:(UIColor *)leftColor;

@end

NS_ASSUME_NONNULL_END
