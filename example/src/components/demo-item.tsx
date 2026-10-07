import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../constants';

interface IDemoItemProps {
  label: string;
  children: ReactNode;
}

export function DemoItem({ label, children }: IDemoItemProps) {
  return (
    <View style={styles.item}>
      {children}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
