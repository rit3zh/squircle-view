import { StyleSheet, type StyleProp } from 'react-native';

import type { ISquircleStyle } from '../interfaces';
import type { TSquircleViewStyle } from '../types';

const splitSquircleStyle = <T extends StyleProp<TSquircleViewStyle>>(
  style: T
): ISquircleStyle => {
  const flattened = StyleSheet.flatten(style);
  if (flattened?.borderSmoothing === undefined) {
    return { style, borderSmoothing: undefined };
  }
  const { borderSmoothing, ...viewStyle } = flattened;
  return { style: viewStyle, borderSmoothing };
};

export { splitSquircleStyle };
