# SquircleView

![squircle-view](.github/banner.png)

A drop-in React Native `View` with smooth, continuous corners.

```tsx
<SquircleView style={{ borderRadius: 24, borderSmoothing: 1 }}>…</SquircleView>
```

## Installation

```sh
npm install squircle-view
cd ios && pod install
```

Requires the New Architecture. On Expo, use a development build.

## Usage

```tsx
import { SquircleView } from 'squircle-view';

export function Card({ children }) {
  return (
    <SquircleView
      style={{
        padding: 20,
        borderRadius: 24,
        borderSmoothing: 1,
        backgroundColor: '#fff',
      }}
    >
      {children}
    </SquircleView>
  );
}
```

It's a real `View`, so you can swap the import and keep your JSX:

```tsx
import { SquircleView as View } from 'squircle-view';
```

### Typed styles

`StyleSheet.create` rejects unknown keys. Use the prop, or type the style as `SquircleViewStyle`:

```tsx
import type { SquircleViewStyle } from 'squircle-view';

const smooth: SquircleViewStyle = { borderSmoothing: 1 };

<SquircleView borderSmoothing={0.6} style={styles.card} />
<SquircleView style={[styles.card, smooth]} />
```

## API

| `borderSmoothing` | Result                              |
| ----------------- | ----------------------------------- |
| `0` (default)     | Standard React Native corners       |
| `0.6`             | Close to Apple's continuous corners |
| `1`               | Fully smoothed                      |

Set it in `style` or as a prop (`style` wins). Values are clamped to `0…1`.

Everything else a `View` supports works as usual: per-corner radii, per-edge borders, `borderStyle`, `overflow: 'hidden'` clipping, shadows, `elevation`, accessibility, and `Animated` (including animated `borderSmoothing`).

**Platforms:** iOS (Fabric) · Android · Web falls back to a plain `View`.

## Example

```sh
bun install
bun run example ios   # or android
```

## License

MIT
