import { describe, expect, it, jest } from '@jest/globals';

describe('NativeSquircleView registration', () => {
  it('reuses the registered component when the module is evaluated again', () => {
    const load = () => {
      let component: unknown;
      jest.isolateModules(() => {
        component = require('../../views').NativeSquircleView;
      });
      return component;
    };

    const first = load();
    expect(() => load()).not.toThrow();
    expect(load()).toBe(first);
  });
});
