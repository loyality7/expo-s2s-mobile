# Known Constraints & Architecture Implementation

This document details the real engineering constraints of building an on-device conversational AI Expo Native Module and how `expo-s2s-mobile` addresses each constraint.

---

### 1. Native Binary Size & ABI Filters
- **Constraint**: On-device AI requires native `.so` binaries (`sherpa-onnx` and `llama.cpp`). Shipping precompiled native binaries for all 4 ABIs (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) increases APK size by tens of megabytes.
- **Implementation & Solution**:
  - `consumer-rules.pro` is configured to ensure R8/ProGuard strips unused JNI hooks while preserving required native symbols.
  - Consuming Expo applications can configure ABI splitting in `app.json` or `android/app/build.gradle` (`ndk.abiFilters`) to produce per-architecture APKs (e.g. `arm64-v8a` only for production builds).

---

### 2. Expo Go Compatibility & Custom Dev Client
- **Constraint**: Custom C++ JNI code (`sherpa-onnx` and `llama.cpp`) cannot execute inside the prebuilt standard Expo Go sandbox app.
- **Implementation & Solution**:
  - `expo-s2s-mobile` includes an Expo Config Plugin (`app.plugin.js`).
  - Running `npx expo prebuild` or using EAS Build / Expo Custom Dev Client automatically injects required native permissions (`RECORD_AUDIO`, `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE_MICROPHONE`) and registers `VoiceSessionService` in `AndroidManifest.xml`.

---

### 3. Event Bridge Throttling & Coalescing
- **Constraint**: Emitting 1:1 token deltas (`AssistantDelta`) during fast LLM text generation can flood the Expo event bridge and cause React Native JS event loop saturation.
- **Implementation & Solution**:
  - `EventBridge.kt` implements native token coalescing using a 35ms sliding ticker window. Rapid token deltas are buffered on the native side and emitted as coalesced chunks without adding perceptual latency to speech synthesis or UI streaming.

---

### 4. Foreground Session & Permissions Management
- **Constraint**: Android 13+ (API 33) and Android 14+ (API 34) require explicit runtime permissions (`RECORD_AUDIO`, `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE_MICROPHONE`) for background voice sessions.
- **Implementation & Solution**:
  - Expo Config Plugin (`app.plugin.js`) injects `<uses-permission>` and service tags into `AndroidManifest.xml`.
  - `requestS2SPermissionsAsync()` and `checkS2SPermissionsAsync()` utility functions in `src/permissions.ts` provide runtime permission handling directly from JavaScript.

---

### 5. Threading & Worker Isolation
- **Constraint**: Heavy compute (VAD, ASR, LLM generation, TTS synthesis) must never block the React Native main UI thread or the JS event loop.
- **Implementation & Solution**:
  - `S2SEngine` runs compute on dedicated single-thread executors (`S2S-Llm`, `S2S-Tts`).
  - `ToolBridge.kt` handles JS tool function execution using a non-blocking `CountDownLatch` (30s timeout) that unblocks native LLM workers once the JS Promise resolves without locking the main thread.

---

### 6. Modern Expo Architecture Compatibility
- **Constraint**: Building against legacy React Native bridges risks deprecation and incompatibility with React Native's New Architecture (Fabric/TurboModules).
- **Implementation & Solution**:
  - Built strictly using `expo-modules-core` (Expo Modules API), ensuring full compatibility with both the modern JSI architecture and classic bridge modes out of the box.

---

### 7. Model Storage & Download UX
- **Constraint**: On-device GGUF LLMs and ONNX models (~800 MB bundle) require local disk space and explicit download user experience.
- **Implementation & Solution**:
  - Provided `useS2SModelDownloader()` React hook in `src/useS2SModelDownloader.ts`, allowing React Native developers to render progress bars, storage checks, and download controls in their UI.
