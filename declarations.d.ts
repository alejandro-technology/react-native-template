declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-config' {
  export interface NativeConfig {
    API_URL?: string;
    SERVICE_PROVIDER?: string;
    ROOT_USERNAME?: string;
    ROOT_PASSWORD?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
