import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../constants';

interface IDemoRowProps {
  children: ReactNode;
}

export function DemoRow({ children }: IDemoRowProps) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: spacing.lg,
  },
});
