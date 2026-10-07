import type { HostComponent } from 'react-native';
// Registers the codegen view config outside the spec module, so Fast Refresh can re-run this file without registering the view twice.
// eslint-disable-next-line @react-native/no-deep-imports
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';

import { NATIVE_VIEW_NAMES } from '../constants';
import type { INativeSquircleViewProps } from './SquircleViewNativeComponent';

type TNativeSquircleView = HostComponent<INativeSquircleViewProps>;

const registry = globalThis as typeof globalThis & {
  __squircleViewNativeComponent?: TNativeSquircleView;
};

const NativeSquircleView: TNativeSquircleView =
  registry.__squircleViewNativeComponent ??
  (registry.__squircleViewNativeComponent = get<INativeSquircleViewProps>(
    NATIVE_VIEW_NAMES.SQUIRCLE_VIEW,
    () => ({
      uiViewClassName: NATIVE_VIEW_NAMES.SQUIRCLE_VIEW,
      validAttributes: { borderSmoothing: true },
    })
  ));

export type { INativeSquircleViewProps } from './SquircleViewNativeComponent';

export { NativeSquircleView };
