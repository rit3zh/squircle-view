import type { Ref } from 'react';
import type { HostInstance, StyleProp, ViewProps } from 'react-native';
import type { TSquircleViewStyle } from '../types';

interface ISquircleViewProps extends ViewProps {
  style?: StyleProp<TSquircleViewStyle>;
  borderSmoothing?: number;
  ref?: Ref<HostInstance>;
}

export type { ISquircleViewProps };
