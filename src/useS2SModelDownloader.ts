import { useCallback, useEffect, useState } from 'react';
import S2SMobileModule from './S2SMobileModule';
import { InstalledModelInfo, ModelDownloadProgressPayload } from './types';

export interface UseS2SModelDownloaderResult {
  installedModels: InstalledModelInfo[];
  downloadProgress: ModelDownloadProgressPayload | null;
  isDownloading: boolean;
  error: string | null;
  refreshInstalledModels: () => Promise<InstalledModelInfo[]>;
  downloadModels: (huggingFaceToken?: string) => Promise<void>;
  cancelDownload: () => void;
}

export function useS2SModelDownloader(): UseS2SModelDownloaderResult {
  const [installedModels, setInstalledModels] = useState<InstalledModelInfo[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<ModelDownloadProgressPayload | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshInstalledModels = useCallback(async () => {
    try {
      const models = await S2SMobileModule.getInstalledModelsAsync();
      setInstalledModels(models);
      return models;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch installed models');
      return [];
    }
  }, []);

  useEffect(() => {
    refreshInstalledModels();

    const sub = S2SMobileModule.addListener('onModelDownloadProgress', (progress: ModelDownloadProgressPayload) => {
      setDownloadProgress(progress);
      if (progress.status === 'COMPLETED') {
        setIsDownloading(false);
        refreshInstalledModels();
      } else if (progress.status === 'FAILED') {
        setIsDownloading(false);
      }
    });

    return () => {
      sub.remove();
    };
  }, [refreshInstalledModels]);

  const downloadModels = useCallback(async (huggingFaceToken?: string) => {
    setIsDownloading(true);
    setError(null);
    try {
      await S2SMobileModule.downloadModelsAsync(null, huggingFaceToken);
      await refreshInstalledModels();
    } catch (err: any) {
      setError(err?.message || 'Model download failed');
    } finally {
      setIsDownloading(false);
    }
  }, [refreshInstalledModels]);

  const cancel = useCallback(() => {
    S2SMobileModule.cancelModelDownload();
    setIsDownloading(false);
  }, []);

  return {
    installedModels,
    downloadProgress,
    isDownloading,
    error,
    refreshInstalledModels,
    downloadModels,
    cancelDownload: cancel,
  };
}
