import { StyleSheet } from 'react-native';
import { SquircleView } from 'squircle-view';

import { colors } from '../constants';
import { DemoItem } from './demo-item';
import { DemoRow } from './demo-row';
import { DemoSection } from './demo-section';

export function CornersDemo() {
  return (
    <DemoSection title="Corners">
      <DemoRow>
        <DemoItem label="per-corner">
          <SquircleView
            borderSmoothing={1}
            style={[styles.box, styles.perCorner]}
          />
        </DemoItem>
        <DemoItem label="50%">
          <SquircleView borderSmoothing={1} style={[styles.box, styles.half]} />
        </DemoItem>
        <DemoItem label="radius 1000">
          <SquircleView borderSmoothing={1} style={styles.pill} />
        </DemoItem>
      </DemoRow>
    </DemoSection>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 96,
    height: 96,
    backgroundColor: colors.blue,
  },
  perCorner: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
  },
  half: {
    borderRadius: '50%',
  },
  pill: {
    width: 120,
    height: 48,
    borderRadius: 1000,
    backgroundColor: colors.blue,
  },
});
