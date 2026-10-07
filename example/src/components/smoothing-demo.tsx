import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SquircleView } from 'squircle-view';

import { colors, SMOOTHING_STEPS, spacing } from '../constants';
import { DemoRow } from './demo-row';
import { DemoSection } from './demo-section';

type TSmoothingStep = (typeof SMOOTHING_STEPS)[number];

export function SmoothingDemo() {
  const [smoothing, setSmoothing] = useState<TSmoothingStep>(1);

  return (
    <DemoSection title="borderSmoothing">
      <SquircleView
        testID="smoothing-demo"
        style={[styles.shape, { borderSmoothing: smoothing }]}
      />
      <DemoRow>
        {SMOOTHING_STEPS.map((step) => {
          const isActive = step === smoothing;
          return (
            <Pressable
              key={step}
              onPress={() => setSmoothing(step)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={isActive && styles.chipTextActive}>{step}</Text>
            </Pressable>
          );
        })}
      </DemoRow>
    </DemoSection>
  );
}

const styles = StyleSheet.create({
  shape: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    borderRadius: 72,
    backgroundColor: colors.red,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.ink,
  },
  chipTextActive: {
    color: colors.surface,
  },
});
