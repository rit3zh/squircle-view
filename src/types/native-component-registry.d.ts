declare module 'react-native/Libraries/NativeComponent/NativeComponentRegistry' {
  import type { HostComponent } from 'react-native';

  interface IPartialViewConfig {
    uiViewClassName: string;
    validAttributes: Record<string, boolean>;
  }

  function get<TProps extends object>(
    name: string,
    viewConfigProvider: () => IPartialViewConfig
  ): HostComponent<TProps>;

  export { get };
}
