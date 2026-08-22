import { NativeModule, requireNativeModule } from 'expo';

import { S2SMobileModuleEvents } from './S2SMobile.types';

declare class S2SMobileModule extends NativeModule<S2SMobileModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

export default requireNativeModule<S2SMobileModule>('S2SMobile');
