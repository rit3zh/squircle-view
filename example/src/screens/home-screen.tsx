import { Fragment } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { SquircleView } from 'squircle-view';

const AnimatedSquircleView = Animated.createAnimatedComponent(SquircleView);

const SIZE = 220;
const MAX_RADIUS = SIZE / 2;
const WIDTH = { min: 140, max: 320 } as const;
const INITIAL = { width: SIZE, radius: 64, smoothing: 1 } as const;
const SPRING = { damping: 18, stiffness: 200, mass: 0.6 } as const;

const palette = {
  background: '#FFFFFF',
  accent: '#0A84FF',
  ink: '#1C1C1E',
  icon: '#B0B0B6',
  track: '#EDEDF0',
} as const;

interface ISliderRowProps {
  min: SFSymbol;
  max: SFSymbol;
  minimumValue?: number;
  maximumValue: number;
  initialValue: number;
  value: SharedValue<number>;
}

function SliderRow({
  min,
  max,
  minimumValue = 0,
  maximumValue,
  initialValue,
  value,
}: ISliderRowProps) {
  return (
    <View style={styles.row}>
      <SymbolView name={min} size={14} tintColor={palette.icon} />
      <Slider
        style={styles.slider}
        value={initialValue}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        onValueChange={(next) => (value.value = next)}
        minimumTrackTintColor={palette.ink}
        maximumTrackTintColor={palette.track}
      />
      <SymbolView name={max} size={18} tintColor={palette.icon} />
    </View>
  );
}

export function HomeScreen(): React.ReactNode & React.JSX.Element {
  const width = useSharedValue<number>(INITIAL.width);
  const radius = useSharedValue<number>(INITIAL.radius);
  const smoothing = useSharedValue<number>(INITIAL.smoothing);

  const shapeStyle = useAnimatedStyle(() => ({
    width: withSpring(width.value, SPRING),
    borderRadius: withSpring(radius.value, SPRING),
  }));

  const shapeProps = useAnimatedProps(() => ({
    borderSmoothing: withSpring(smoothing.value, SPRING),
  }));

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <AnimatedSquircleView
          style={[styles.shape, shapeStyle]}
          animatedProps={shapeProps}
        >
          <SymbolView name="square.stack.3d.up" size={72} tintColor="#FFFFFF" />
        </AnimatedSquircleView>

        <View style={styles.controls}>
          <SliderRow
            min="rectangle.portrait"
            max="rectangle"
            minimumValue={WIDTH.min}
            maximumValue={WIDTH.max}
            initialValue={INITIAL.width}
            value={width}
          />
          <SliderRow
            min="square"
            max="circle"
            maximumValue={MAX_RADIUS}
            initialValue={INITIAL.radius}
            value={radius}
          />
          <SliderRow
            min="dial.low"
            max="dial.high"
            maximumValue={1}
            initialValue={INITIAL.smoothing}
            value={smoothing}
          />
        </View>
      </View>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 72,
    backgroundColor: palette.background,
  },
  shape: {
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accent,
  },
  controls: {
    width: 280,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  slider: {
    flex: 1,
  },
});
