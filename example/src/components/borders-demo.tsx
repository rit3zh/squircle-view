import { StyleSheet } from 'react-native';
import { SquircleView } from 'squircle-view';

import { colors } from '../constants';
import { DemoItem } from './demo-item';
import { DemoRow } from './demo-row';
import { DemoSection } from './demo-section';

export function BordersDemo() {
  return (
    <DemoSection title="Borders">
      <DemoRow>
        <DemoItem label="uniform">
          <SquircleView
            borderSmoothing={1}
            style={[styles.box, styles.solid]}
          />
        </DemoItem>
        <DemoItem label="per-edge width">
          <SquircleView
            borderSmoothing={1}
            style={[styles.box, styles.edges]}
          />
        </DemoItem>
        <DemoItem label="per-edge color">
          <SquircleView
            borderSmoothing={1}
            style={[styles.box, styles.colors]}
          />
        </DemoItem>
      </DemoRow>
      <DemoRow>
        <DemoItem label="dashed">
          <SquircleView
            borderSmoothing={1}
            style={[styles.box, styles.solid, styles.dashed]}
          />
        </DemoItem>
        <DemoItem label="dotted">
          <SquircleView
            borderSmoothing={1}
            style={[styles.box, styles.solid, styles.dotted]}
          />
        </DemoItem>
        <DemoItem label="default color">
          <SquircleView
            borderSmoothing={1}
            style={[styles.box, styles.defaultColor]}
          />
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
  },
  solid: {
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  edges: {
    borderTopWidth: 2,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderLeftWidth: 4,
    borderColor: colors.violet,
    backgroundColor: colors.violetLight,
  },
  colors: {
    borderWidth: 6,
    borderTopColor: colors.red,
    borderRightColor: colors.amber,
    borderBottomColor: colors.green,
    borderLeftColor: colors.blue,
  },
  dashed: {
    borderStyle: 'dashed',
  },
  dotted: {
    borderStyle: 'dotted',
  },
  defaultColor: {
    borderWidth: 2,
  },
});
