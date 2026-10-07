import * as React from 'react';
import { useMemo } from 'react';
import { View, type StyleProp } from 'react-native';
import { COMPONENT_NAMES } from '../constants';
import type { ISquircleStyle, ISquircleViewProps } from '../interfaces';
import { splitSquircleStyle } from '../utils';
import type { TSquircleViewStyle } from '../types';

const SquircleView: React.FC<ISquircleViewProps> = ({
  style,
  borderSmoothing: _borderSmoothing,
  ...rest
}: ISquircleViewProps): React.JSX.Element & React.ReactNode => {
  const squircleStyle = useMemo<ISquircleStyle>(
    () => splitSquircleStyle<StyleProp<TSquircleViewStyle>>(style),
    [style]
  );

  return <View {...rest} style={squircleStyle.style} />;
};

SquircleView.displayName = COMPONENT_NAMES.SQUIRCLE_VIEW;

export { SquircleView };
