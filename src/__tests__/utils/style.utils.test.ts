import { describe, expect, it } from '@jest/globals';
import { StyleSheet } from 'react-native';

import { splitSquircleStyle } from '../../utils';

describe('splitSquircleStyle', () => {
  it('extracts borderSmoothing from a style object', () => {
    expect(
      splitSquircleStyle({ borderRadius: 24, borderSmoothing: 1 })
    ).toEqual({ style: { borderRadius: 24 }, borderSmoothing: 1 });
  });

  it('flattens arrays with later styles winning', () => {
    const styles = StyleSheet.create({ card: { padding: 8 } });
    expect(
      splitSquircleStyle([
        styles.card,
        { borderSmoothing: 0.2 },
        false,
        null,
        { borderSmoothing: 0.8, borderRadius: 12 },
      ])
    ).toEqual({
      style: { padding: 8, borderRadius: 12 },
      borderSmoothing: 0.8,
    });
  });

  it('keeps the original style reference without borderSmoothing', () => {
    const style = [{ borderRadius: 4 }, { padding: 2 }];
    const result = splitSquircleStyle(style);
    expect(result.style).toBe(style);
    expect(result.borderSmoothing).toBeUndefined();
  });

  it('handles empty styles', () => {
    expect(splitSquircleStyle(undefined)).toEqual({
      style: undefined,
      borderSmoothing: undefined,
    });
    expect(splitSquircleStyle(null).borderSmoothing).toBeUndefined();
    expect(splitSquircleStyle(false).borderSmoothing).toBeUndefined();
  });

  it('passes out-of-range values through for native clamping', () => {
    expect(splitSquircleStyle({ borderSmoothing: -1 }).borderSmoothing).toBe(
      -1
    );
    expect(splitSquircleStyle({ borderSmoothing: 4 }).borderSmoothing).toBe(4);
  });
});
