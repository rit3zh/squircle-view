import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

interface INativeSquircleViewProps extends ViewProps {
  borderSmoothing?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
}

export type { INativeSquircleViewProps };

export default codegenNativeComponent<INativeSquircleViewProps>(
  'SquircleView'
) as HostComponent<INativeSquircleViewProps>;
