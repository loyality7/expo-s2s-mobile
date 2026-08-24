/**
 * Builds S2SConfig.models from the real getInstalledModelsAsync() list —
 * never hardcoded paths. Each InstalledModelInfo.path is the SDK's own
 * absolute target path (file for VAD/LLM, directory for STT/TTS bundles).
 */
export function buildModelPaths(installedModels) {
  const byCategory = (cat) => installedModels.find((m) => m.category === cat && m.isInstalled);

  const vad = byCategory('VAD');
  const stt = byCategory('STT');
  const llm = byCategory('LLM');
  const tts = byCategory('TTS');

  if (!vad || !stt || !llm || !tts) {
    const missing = ['VAD', 'STT', 'LLM', 'TTS'].filter(
      (c) => !byCategory(c)
    );
    throw new Error(`Missing installed model(s) for: ${missing.join(', ')}`);
  }

  return {
    vadModel: vad.path,
    sttDir: stt.path,
    llmModel: llm.path,
    ttsDir: tts.path,
  };
}
