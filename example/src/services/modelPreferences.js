import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 's2s.selectedModel.';
const CATEGORIES = ['VAD', 'STT', 'LLM', 'TTS'];

export async function getSelectedModelIds() {
  const entries = await Promise.all(
    CATEGORIES.map(async (cat) => [cat, await AsyncStorage.getItem(KEY_PREFIX + cat)])
  );
  return Object.fromEntries(entries.filter(([, id]) => !!id));
}

export async function setSelectedModelId(category, id) {
  await AsyncStorage.setItem(KEY_PREFIX + category, id);
}
