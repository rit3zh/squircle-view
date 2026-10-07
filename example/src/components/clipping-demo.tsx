import { Image, StyleSheet } from 'react-native';
import { SquircleView } from 'squircle-view';

import { colors } from '../constants';
import { DemoItem } from './demo-item';
import { DemoRow } from './demo-row';
import { DemoSection } from './demo-section';

const ICON = require('../../assets/icon.png');

export function ClippingDemo() {
  return (
    <DemoSection title="Clipping & shadow">
      <DemoRow>
        <DemoItem label="overflow hidden">
          <SquircleView borderSmoothing={1} style={styles.clip}>
            <Image source={ICON} style={StyleSheet.absoluteFill} />
          </SquircleView>
        </DemoItem>
        <DemoItem label="shadow">
          <SquircleView borderSmoothing={1} style={styles.shadow} />
        </DemoItem>
      </DemoRow>
    </DemoSection>
  );
}

const styles = StyleSheet.create({
  clip: {
    width: 140,
    height: 140,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.ink,
    overflow: 'hidden',
  },
  shadow: {
    width: 140,
    height: 140,
    borderRadius: 44,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
});
