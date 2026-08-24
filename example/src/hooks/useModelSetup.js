import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addS2SListener,
  cancelModelDownload,
  downloadModelsAsync,
  getDefaultModelStackIds,
  getInstalledModelsAsync,
} from 'expo-s2s-mobile';

export const ModelSetupState = {
  CHECKING: 'CHECKING',
  MODELS_REQUIRED: 'MODELS_REQUIRED',
  DOWNLOADING: 'DOWNLOADING',
  READY: 'READY',
  ERROR: 'ERROR',
};

/**
 * Drives model discovery + download using only real native data:
 * getInstalledModelsAsync() for what's known, onModelDownloadProgress for
 * live progress. Nothing here invents a percentage or a fake byte count.
 */
export function useModelSetup() {
  const [state, setState] = useState(ModelSetupState.CHECKING);
  const [models, setModels] = useState([]); // [{id, name, category, approxBytes, isInstalled, percent, status, downloadedBytes, totalBytes}]
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  const refresh = useCallback(async () => {
    setState(ModelSetupState.CHECKING);
    setError(null);
    try {
      const [defaultIds, installed] = await Promise.all([
        getDefaultModelStackIds(),
        getInstalledModelsAsync(),
      ]);
      const required = installed.filter((m) => defaultIds.includes(m.id));
      setModels(
        required.map((m) => ({
          ...m,
          percent: m.isInstalled ? 100 : 0,
          status: m.isInstalled ? 'COMPLETED' : 'PENDING',
          downloadedBytes: m.diskUsageBytes,
          totalBytes: m.approxBytes,
        }))
      );
      const allInstalled = required.length > 0 && required.every((m) => m.isInstalled);
      setState(allInstalled ? ModelSetupState.READY : ModelSetupState.MODELS_REQUIRED);
      return { required, allInstalled };
    } catch (e) {
      setError(e?.message || 'Could not check installed models');
      setState(ModelSetupState.ERROR);
    }
  }, []);

  useEffect(() => {
    const sub = addS2SListener('onModelDownloadProgress', (data) => {
      setModels((prev) =>
        prev.map((m) =>
          m.name === data.modelName || m.id === data.modelName
            ? {
                ...m,
                percent: data.percent,
                status: data.status,
                downloadedBytes: data.downloadedBytes,
                totalBytes: data.totalBytes || m.totalBytes,
              }
            : m
        )
      );
    });
    return () => sub.remove();
  }, []);

  const startDownload = useCallback(async () => {
    cancelledRef.current = false;
    setState(ModelSetupState.DOWNLOADING);
    setError(null);
    try {
      const defaultIds = await getDefaultModelStackIds();
      await downloadModelsAsync(defaultIds);
      if (cancelledRef.current) return;
      await refresh();
    } catch (e) {
      if (cancelledRef.current) return;
      setError(e?.message || 'Model download failed');
      setState(ModelSetupState.ERROR);
    }
  }, [refresh]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    cancelModelDownload();
    setState(ModelSetupState.MODELS_REQUIRED);
  }, []);

  const overall = models.reduce(
    (acc, m) => {
      acc.downloaded += m.downloadedBytes || 0;
      acc.total += m.totalBytes || 0;
      return acc;
    },
    { downloaded: 0, total: 0 }
  );
  const completedCount = models.filter((m) => m.status === 'COMPLETED').length;

  return {
    state,
    models,
    error,
    overall,
    completedCount,
    totalCount: models.length,
    refresh,
    startDownload,
    cancel,
  };
}
