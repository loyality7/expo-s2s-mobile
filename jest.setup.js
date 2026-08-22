jest.mock('expo-modules-core', () => {
  return {
    NativeModulesProxy: {},
    requireNativeModule: jest.fn(() => ({})),
    EventEmitter: class EventEmitter {
      addListener() { return { remove: jest.fn() }; }
      removeListener() {}
    },
    Platform: { OS: 'android' },
  };
}, { virtual: true });
