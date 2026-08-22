# expo-s2s-mobile

Expo Native Module for 100% on-device speech-to-speech AI (VAD, ASR, LLM, TTS). 
This package is an official React Native wrapper around the core [speech-to-speech-mobile](https://github.com/loyality7/speech-to-speech-mobile) Android SDK.

## Install

```bash
npm install expo-s2s-mobile
```

## Setup

Add the plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": ["expo-s2s-mobile"]
  }
}
```

*Note: Requires a custom dev client or EAS Build (Android only).*

## Quick Start

```typescript
import { initializeAsync, start, addS2SListener } from 'expo-s2s-mobile';

async function init() {
  await initializeAsync({
    vad: { silenceTimeoutMs: 1500 },
    stt: { modelDir: '/path/to/stt' },
    llm: { modelPath: '/path/to/llm.gguf' },
    tts: { modelPath: '/path/to/tts.onnx' }
  });
  start();
}
```

## License
Apache-2.0
