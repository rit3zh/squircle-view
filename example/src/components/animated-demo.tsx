import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { SquircleView } from 'squircle-view';

import { colors } from '../constants';
import { DemoSection } from './demo-section';

const AnimatedSquircleView = Animated.createAnimatedComponent(SquircleView);

const TIMING = {
  duration: 1600,
  easing: Easing.inOut(Easing.cubic),
  useNativeDriver: false,
} as const;

export function AnimatedDemo() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { ...TIMING, toValue: 1 }),
        Animated.timing(progress, { ...TIMING, toValue: 0 }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const animatedStyle = {
    width: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [120, 300],
    }),
    borderRadius: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 56],
    }),
    borderSmoothing: progress,
  };

  return (
    <DemoSection title="Animated radius, smoothing and size">
      <AnimatedSquircleView style={[styles.shape, animatedStyle]} />
    </DemoSection>
  );
}

const styles = StyleSheet.create({
  shape: {
    height: 120,
    backgroundColor: colors.orange,
  },
});
