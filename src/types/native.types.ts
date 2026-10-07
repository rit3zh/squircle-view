import type { COMPONENT_NAMES, NATIVE_VIEW_NAMES } from '../constants';

type TNativeViewName =
  (typeof NATIVE_VIEW_NAMES)[keyof typeof NATIVE_VIEW_NAMES];

type TComponentName = (typeof COMPONENT_NAMES)[keyof typeof COMPONENT_NAMES];

export type { TNativeViewName, TComponentName };
