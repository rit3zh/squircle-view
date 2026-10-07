import { View, type ColorValue, type ViewProps } from 'react-native';

type Props = ViewProps & {
  color?: ColorValue;
};

export function SquircleViewView({ color, style, ...rest }: Props) {
  return <View {...rest} style={[style, { backgroundColor: color }]} />;
}
