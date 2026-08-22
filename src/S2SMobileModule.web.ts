import { registerWebModule, NativeModule } from 'expo';

import { S2SMobileModuleEvents } from './S2SMobile.types';

// S2SMobileModule is not available on the web platform.
class S2SMobileModule extends NativeModule<S2SMobileModuleEvents> {}

export default registerWebModule(S2SMobileModule, 'S2SMobileModule');
