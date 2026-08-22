// Reexport the native module. On web, it will be resolved to S2SMobileModule.web.ts
// and on native platforms to S2SMobileModule.ts
export { default } from './S2SMobileModule';
export * from './S2SMobile.types';
