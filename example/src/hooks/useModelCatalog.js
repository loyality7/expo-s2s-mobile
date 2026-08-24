import { useCallback, useEffect, useState } from 'react';
import { addS2SListener, downloadModelsAsync, getInstalledModelsAsync } from 'expo-s2s-mobile';
import { getSelectedModelIds, setSelectedModelId } from '../services/modelPreferences';

const CATEGORIES = ['VAD', 'STT', 'LLM', 'TTS'];

/**
 * Lists every model the SDK registry knows about (not just the default
 * stack), grouped by category, with real install status from
 * getInstalledModelsAsync(). Lets the user pick an alternate per category —
 * downloading it first if needed — and persists the choice.
 */
export function useModelCatalog() {
  const [byCategory, setByCategory] = useState({});
  const [selected, setSelected] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [all, prefs] = await Promise.all([getInstalledModelsAsync(), getSelectedModelIds()]);
    const grouped = {};
    for (const cat of CATEGORIES) {
      grouped[cat] = all.filter((m) => m.category === cat);
    }
    setByCategory(grouped);
    setSelected(prefs);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const sub = addS2SListener('onModelDownloadProgress', (data) => setProgress(data));
    return () => sub.remove();
  }, []);

  const selectModel = useCallback(
    async (category, model) => {
      if (!model.isInstalled) {
        setDownloadingId(model.id);
        try {
          await downloadModelsAsync([model.id]);
        } catch (e) {
          setDownloadingId(null);
          throw e;
        }
        setDownloadingId(null);
      }
      await setSelectedModelId(category, model.id);
      setSelected((prev) => ({ ...prev, [category]: model.id }));
      await refresh();
    },
    [refresh]
  );

  return { categories: CATEGORIES, byCategory, selected, selectModel, downloadingId, progress, loading, refresh };
}
