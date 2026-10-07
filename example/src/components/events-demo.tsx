import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SquircleView } from 'squircle-view';

import { colors, spacing } from '../constants';
import { DemoItem } from './demo-item';
import { DemoRow } from './demo-row';
import { DemoSection } from './demo-section';

interface IEventLog {
  touchStart: number;
  touchEnd: number;
  grant: number;
  release: number;
  press: number;
  layout: string;
  accessibilityAction: string;
}

type TEventCounter = 'touchStart' | 'touchEnd' | 'grant' | 'release' | 'press';

const INITIAL_LOG: IEventLog = {
  touchStart: 0,
  touchEnd: 0,
  grant: 0,
  release: 0,
  press: 0,
  layout: '–',
  accessibilityAction: '–',
};

const ACCESSIBILITY_ACTIONS = [{ name: 'activate' }, { name: 'magicTap' }];

export function EventsDemo() {
  const [log, setLog] = useState<IEventLog>(INITIAL_LOG);
  const [isActive, setIsActive] = useState(false);

  const count = (key: TEventCounter) =>
    setLog((current) => ({ ...current, [key]: current[key] + 1 }));

  return (
    <DemoSection title="Events & accessibility">
      <SquircleView
        testID="events-card"
        accessible
        accessibilityLabel="Events card"
        accessibilityHint="Counts touches and responder events"
        accessibilityActions={ACCESSIBILITY_ACTIONS}
        onAccessibilityAction={(event) => {
          const { actionName } = event.nativeEvent;
          setLog((current) => ({
            ...current,
            accessibilityAction: actionName,
          }));
        }}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setLog((current) => ({
            ...current,
            layout: `${Math.round(width)}×${Math.round(height)}`,
          }));
        }}
        onTouchStart={() => count('touchStart')}
        onTouchEnd={() => count('touchEnd')}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => {
          setIsActive(true);
          count('grant');
        }}
        onResponderRelease={() => {
          setIsActive(false);
          count('release');
        }}
        onResponderTerminate={() => setIsActive(false)}
        borderSmoothing={1}
        style={[styles.card, isActive && styles.cardActive]}
      >
        <Text style={styles.log}>
          touchStart {log.touchStart} · touchEnd {log.touchEnd}
          {'\n'}grant {log.grant} · release {log.release}
          {'\n'}layout {log.layout} · a11y {log.accessibilityAction}
        </Text>
        <Pressable
          testID="nested-pressable"
          onPress={() => count('press')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Nested Pressable · {log.press}</Text>
        </Pressable>
      </SquircleView>
      <DemoRow>
        <DemoItem label="pointerEvents none">
          <SquircleView
            pointerEvents="none"
            borderSmoothing={1}
            style={[styles.small, styles.muted]}
            onTouchStart={() => count('touchStart')}
          />
        </DemoItem>
        <DemoItem label="hitSlop 20">
          <Pressable hitSlop={20} onPress={() => count('press')}>
            <SquircleView
              borderSmoothing={1}
              style={[styles.small, styles.accent]}
            />
          </Pressable>
        </DemoItem>
      </DemoRow>
    </DemoSection>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: spacing.lg,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardActive: {
    backgroundColor: colors.highlight,
  },
  log: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  button: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.ink,
  },
  pressed: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  small: {
    width: 56,
    height: 56,
    borderRadius: spacing.lg,
  },
  muted: {
    backgroundColor: colors.muted,
  },
  accent: {
    backgroundColor: colors.green,
  },
});
