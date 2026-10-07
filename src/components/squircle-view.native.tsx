import * as React from 'react';
import { useMemo } from 'react';

import { COMPONENT_NAMES, DEFAULT_BORDER_SMOOTHING } from '../constants';
import type { ISquircleStyle, ISquircleViewProps } from '../interfaces';
import { splitSquircleStyle } from '../utils';
import { NativeSquircleView } from '../views';

const SquircleView: React.FC<ISquircleViewProps> = ({
  style,
  borderSmoothing,
  ...rest
}: ISquircleViewProps): React.JSX.Element => {
  const squircleStyle = useMemo<ISquircleStyle>(
    () => splitSquircleStyle(style),
    [style]
  );

  return (
    <NativeSquircleView
      {...rest}
      style={squircleStyle.style}
      borderSmoothing={
        squircleStyle.borderSmoothing ??
        borderSmoothing ??
        DEFAULT_BORDER_SMOOTHING
      }
    />
  );
};

SquircleView.displayName = COMPONENT_NAMES.SQUIRCLE_VIEW;

export { SquircleView };
