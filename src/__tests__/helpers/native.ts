import { screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import { NATIVE_VIEW_NAMES } from '../../constants';
import type { TNativeViewName } from '../../types';

const findAllNative = (name: TNativeViewName): ReactTestInstance[] =>
  screen.UNSAFE_root.findAll((node) => String(node.type) === name);

const findNative = (name: TNativeViewName): ReactTestInstance => {
  const [view] = findAllNative(name);
  if (!view) {
    throw new Error(`No <${name}> rendered.`);
  }
  return view;
};

const squircleView = (): ReactTestInstance =>
  findNative(NATIVE_VIEW_NAMES.SQUIRCLE_VIEW);

const squircleViews = (): ReactTestInstance[] =>
  findAllNative(NATIVE_VIEW_NAMES.SQUIRCLE_VIEW);

export { findAllNative, findNative, squircleView, squircleViews };
