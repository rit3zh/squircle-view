import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { Pressable, Text, type HostInstance } from 'react-native';
import { SquircleView, SquircleView as View } from '../..';
import { squircleView, squircleViews } from '../helpers/native';

describe('SquircleView', () => {
  it('renders the native SquircleView component', () => {
    render(<SquircleView />);
    expect(squircleViews()).toHaveLength(1);
    expect(squircleView().props.borderSmoothing).toBe(0);
  });

  it('moves borderSmoothing from style to the native prop', () => {
    render(
      <SquircleView
        style={[{ borderRadius: 24 }, { borderSmoothing: 0.6, padding: 4 }]}
      />
    );
    const view = squircleView();
    expect(view.props.borderSmoothing).toBe(0.6);
    expect(view.props.style).toEqual({ borderRadius: 24, padding: 4 });
  });

  it('accepts borderSmoothing as a prop', () => {
    render(<SquircleView borderSmoothing={0.5} style={{ borderRadius: 8 }} />);
    expect(squircleView().props.borderSmoothing).toBe(0.5);
  });

  it('prefers the style value over the prop', () => {
    render(
      <SquircleView borderSmoothing={0.2} style={{ borderSmoothing: 1 }} />
    );
    expect(squircleView().props.borderSmoothing).toBe(1);
  });

  it('renders children', () => {
    render(
      <SquircleView>
        <Text>Hello</Text>
      </SquircleView>
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('forwards View props', () => {
    const hitSlop = { top: 4, bottom: 4, left: 4, right: 4 };
    render(
      <SquircleView
        testID="card"
        nativeID="card-native"
        accessible
        accessibilityLabel="Card"
        accessibilityHint="Opens details"
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
        role="button"
        pointerEvents="box-none"
        hitSlop={hitSlop}
        collapsable={false}
        focusable
      />
    );
    const view = screen.getByTestId('card');
    expect(view.props).toMatchObject({
      nativeID: 'card-native',
      accessible: true,
      accessibilityLabel: 'Card',
      accessibilityHint: 'Opens details',
      accessibilityRole: 'button',
      accessibilityState: { selected: true },
      role: 'button',
      pointerEvents: 'box-none',
      hitSlop,
      collapsable: false,
      focusable: true,
    });
    expect(screen.getByLabelText('Card')).toBeTruthy();
  });

  it('dispatches layout, touch and responder events', () => {
    const handlers = {
      onLayout: jest.fn(),
      onTouchStart: jest.fn(),
      onTouchEnd: jest.fn(),
      onResponderGrant: jest.fn<() => void>(),
      onResponderRelease: jest.fn(),
    };
    render(
      <SquircleView
        testID="card"
        onStartShouldSetResponder={() => true}
        {...handlers}
      />
    );
    const view = screen.getByTestId('card');
    const layout = { nativeEvent: { layout: { width: 10, height: 20 } } };

    fireEvent(view, 'layout', layout);
    fireEvent(view, 'touchStart');
    fireEvent(view, 'touchEnd');
    fireEvent(view, 'responderGrant');
    fireEvent(view, 'responderRelease');

    expect(handlers.onLayout).toHaveBeenCalledWith(layout);
    expect(handlers.onTouchStart).toHaveBeenCalledTimes(1);
    expect(handlers.onTouchEnd).toHaveBeenCalledTimes(1);
    expect(handlers.onResponderGrant).toHaveBeenCalledTimes(1);
    expect(handlers.onResponderRelease).toHaveBeenCalledTimes(1);
  });

  it('dispatches accessibility actions', () => {
    const onAccessibilityAction = jest.fn();
    render(
      <SquircleView
        testID="card"
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={onAccessibilityAction}
      />
    );
    const event = { nativeEvent: { actionName: 'activate' } };
    fireEvent(screen.getByTestId('card'), 'accessibilityAction', event);
    expect(onAccessibilityAction).toHaveBeenCalledWith(event);
  });

  it('keeps nested Pressable children interactive', () => {
    const onPress = jest.fn();
    render(
      <SquircleView style={{ borderRadius: 16, borderSmoothing: 1 }}>
        <Pressable onPress={onPress}>
          <Text>Press</Text>
        </Pressable>
      </SquircleView>
    );
    fireEvent.press(screen.getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards refs to the native host instance', () => {
    const ref = createRef<HostInstance>();
    render(<SquircleView ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('works as a drop-in View replacement', () => {
    render(
      <View style={{ flex: 1, borderRadius: 24, borderSmoothing: 1 }}>
        <Text>Child</Text>
      </View>
    );
    expect(squircleView().props.borderSmoothing).toBe(1);
    expect(screen.getByText('Child')).toBeTruthy();
  });

  it('has a display name', () => {
    expect(SquircleView.displayName).toBe('SquircleView');
  });
});
