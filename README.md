# expo-s2s-mobile

Expo Native Module for 100% on-device speech-to-speech AI (VAD, ASR, LLM, TTS).

Everything runs in this package. The Android engine — voice activity detection,
speech recognition, GGUF text generation, speech synthesis, conversation history
and tool calling — is vendored as source under `android/src/main/java/com/s2s`,
originally from [speech-to-speech-mobile](https://github.com/loyality7/speech-to-speech-mobile)
1.0.3. There is no external engine artifact to resolve or keep in step.

That is deliberate. Upstream has since split the LLM, chat history and tool
registry into separate artifacts and moved tool execution out of the engine into
an agent harness, so tracking it would mean adopting several coordinated
dependencies and rewriting this module's bridge against a different
architecture. Pinning the source instead keeps this package self-contained and
its native surface stable. Fixes from later upstream releases can be
cherry-picked file by file when a specific one is worth having.

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
