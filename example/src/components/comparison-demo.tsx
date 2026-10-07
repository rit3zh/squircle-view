import { StyleSheet, View } from 'react-native';
import { SquircleView } from 'squircle-view';

import { colors } from '../constants';
import { DemoItem } from './demo-item';
import { DemoRow } from './demo-row';
import { DemoSection } from './demo-section';

export function ComparisonDemo() {
  return (
    <DemoSection title="View vs SquircleView">
      <DemoRow>
        <DemoItem label="View">
          <View style={styles.box} />
        </DemoItem>
        <DemoItem label="smoothing 0.6">
          <SquircleView borderSmoothing={0.6} style={styles.box} />
        </DemoItem>
        <DemoItem label="smoothing 1">
          <SquircleView borderSmoothing={1} style={styles.box} />
        </DemoItem>
      </DemoRow>
    </DemoSection>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: colors.blue,
  },
});
