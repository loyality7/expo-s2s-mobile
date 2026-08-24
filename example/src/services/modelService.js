/**
 * Builds the S2SConfig sub-objects needed at initialize() time from the real
 * getInstalledModelsAsync() list — never hardcoded paths or backends.
 *
 * Path alone is not enough: each installed model's *files* only match the
 * backend it was built for (e.g. Moonshine's file names differ from
 * Zipformer's), so the backend enum name has to travel with the path or the
 * native recognizer looks for the wrong files in the right directory.
 */
export function buildEngineConfig(installedModels, preferredIds = {}) {
  const byCategory = (cat) => {
    const preferredId = preferredIds[cat];
    if (preferredId) {
      const preferred = installedModels.find((m) => m.id === preferredId && m.isInstalled);
      if (preferred) return preferred;
    }
    return installedModels.find((m) => m.category === cat && m.isInstalled);
  };

  const vad = byCategory('VAD');
  const stt = byCategory('STT');
  const llm = byCategory('LLM');
  const tts = byCategory('TTS');

  if (!vad || !stt || !llm || !tts) {
    const missing = ['VAD', 'STT', 'LLM', 'TTS'].filter((c) => !byCategory(c));
    throw new Error(`Missing installed model(s) for: ${missing.join(', ')}`);
  }

  return {
    models: {
      vadModel: vad.path,
      sttDir: stt.path,
      llmModel: llm.path,
      ttsDir: tts.path,
    },
    vad: vad.backend ? { backend: vad.backend } : undefined,
    stt: stt.backend ? { backend: stt.backend } : undefined,
    tts: tts.backend ? { backend: tts.backend } : undefined,
  };
}
