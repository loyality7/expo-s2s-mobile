import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useS2S } from '../state/S2SContext';

export const ModelSetupScreen = () => {
  const { 
    installedModels, downloadProgressData, isDownloading, downloadError, downloadModels, cancelModelDownload,
    selectedModelIds, selectModel
  } = useS2S();

  const [expandedCat, setExpandedCat] = useState({ LLM: true, STT: false, TTS: false, VAD: false });

  const toggleCategory = (cat) => {
    setExpandedCat(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'LLM': return { icon: '🧠', title: 'Language Model (LLM)', desc: 'Reasoning & Intelligence' };
      case 'STT': return { icon: '🎙️', title: 'Speech-to-Text (STT)', desc: 'Voice Recognition' };
      case 'TTS': return { icon: '🔊', title: 'Text-to-Speech (TTS)', desc: 'Voice Synthesis' };
      case 'VAD': return { icon: '⚡', title: 'Voice Activity (VAD)', desc: 'Silence & Speech Detector' };
      default: return { icon: '📦', title: cat, desc: 'Model Pipeline' };
    }
  };

  const categories = ['LLM', 'STT', 'TTS', 'VAD'];

  const dlValues = Object.values(downloadProgressData);
  let overallProgressText = '0%';
  let detailsText = 'Preparing download...';
  let currentModelName = 'Initializing models...';

  if (dlValues.length > 0) {
    const currentDl = dlValues.find(d => d.status === 'DOWNLOADING') || dlValues[dlValues.length - 1];

    if (currentDl) {
      currentModelName = currentDl.specName || currentModelName;
      const pct = Math.round(currentDl.percent || 0);
      overallProgressText = `${pct}%`;

      const dlMb = ((currentDl.downloadedBytes || 0) / 1024 / 1024).toFixed(1);
      const totalMb = ((currentDl.totalBytes || 0) / 1024 / 1024).toFixed(1);
      detailsText = `${dlMb} MB / ${totalMb} MB (${currentDl.status || 'DOWNLOADING'})`;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Voice models required</Text>
        <Text style={styles.subtitle}>
          Select and view the models registered for each pipeline stage. All models run 100% on-device.
        </Text>

        {categories.map((cat) => {
          const meta = getCategoryMeta(cat);
          const modelsInCat = installedModels.filter(m => m.category === cat);
          const isExpanded = expandedCat[cat];
          const activeModelId = selectedModelIds[cat];

          return (
            <View key={cat} style={styles.catCard}>
              <TouchableOpacity 
                style={styles.catHeader} 
                onPress={() => toggleCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={styles.catIcon}>{meta.icon}</Text>
                <View style={styles.catInfo}>
                  <Text style={styles.catTitle}>{meta.title}</Text>
                  <Text style={styles.catSub}>
                    {meta.desc} • {modelsInCat.length} registered
                  </Text>
                </View>
                <Text style={styles.arrowIcon}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded ? (
                <View style={styles.catBody}>
                  {modelsInCat.length === 0 ? (
                    <Text style={styles.emptyText}>Default stack model registered</Text>
                  ) : (
                    modelsInCat.map((m, idx) => {
                      const isSelected = activeModelId ? activeModelId === m.id : idx === 0;
                      
                      // Check for live download progress matching this model
                      const dlProgress = downloadProgressData[m.id] || 
                                         downloadProgressData[m.name] || 
                                         Object.values(downloadProgressData).find(d => d.specName && d.specName.includes(m.id));

                      const isDlActive = dlProgress && dlProgress.status === 'DOWNLOADING';
                      const dlPercent = dlProgress ? Math.round(dlProgress.percent || 0) : 0;

                      return (
                        <TouchableOpacity
                          key={m.id || m.name}
                          style={[styles.modelRow, isSelected && styles.selectedModelRow]}
                          onPress={() => selectModel(cat, m.id)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                            {isSelected ? <View style={styles.radioInner} /> : null}
                          </View>

                          <View style={styles.modelInfo}>
                            <View style={styles.modelHeaderRow}>
                              <Text style={[styles.modelName, isSelected && styles.selectedModelName]}>
                                {m.name || m.id}
                              </Text>
                              {isSelected ? (
                                <View style={styles.activeBadge}>
                                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                                </View>
                              ) : null}
                            </View>

                            {dlProgress ? (
                              <View style={styles.modelDlProgressBox}>
                                <View style={styles.miniBarBg}>
                                  <View style={[styles.miniBarFill, { width: `${dlPercent}%` }]} />
                                </View>
                                <Text style={styles.miniDlText}>
                                  {dlProgress.status} ({dlPercent}%)
                                  {dlProgress.totalBytes ? ` • ${((dlProgress.downloadedBytes || 0) / 1024 / 1024).toFixed(1)} / ${((dlProgress.totalBytes || 0) / 1024 / 1024).toFixed(1)} MB` : ''}
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.modelStatus}>
                                Status: <Text style={m.isInstalled ? styles.statusInstalled : styles.statusPending}>
                                  {m.isInstalled ? '✓ Installed' : '⏳ Pending Download'}
                                </Text>
                                {m.diskUsageBytes ? ` • ${(m.diskUsageBytes / 1024 / 1024).toFixed(1)} MB` : ''}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              ) : null}
            </View>
          );
        })}

        <View style={styles.spacer} />

        {isDownloading ? (
          <View style={styles.dlBox}>
            <Text style={styles.dlTitle}>Downloading voice models</Text>
            <Text style={styles.dlModelName}>{currentModelName}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: overallProgressText }]} />
            </View>
            <Text style={styles.dlPercent}>{overallProgressText}</Text>
            <Text style={styles.dlDetails}>{detailsText}</Text>

            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={cancelModelDownload}
            >
              <Text style={styles.cancelText}>Cancel download</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {downloadError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Download failed</Text>
                <Text style={styles.errorText}>{downloadError}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={styles.button} 
              onPress={downloadModels}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Download models</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0C',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    lineHeight: 22,
    marginBottom: 32,
  },
  catCard: {
    backgroundColor: '#1A1C23',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  catIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  catInfo: {
    flex: 1,
  },
  catTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  catSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  arrowIcon: {
    color: '#7B61FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  catBody: {
    backgroundColor: '#12141A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
    paddingVertical: 4,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#161821',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedModelRow: {
    backgroundColor: 'rgba(123, 97, 255, 0.12)',
    borderColor: '#7B61FF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: '#7B61FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7B61FF',
  },
  modelInfo: {
    flex: 1,
  },
  modelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
    flex: 1,
  },
  selectedModelName: {
    fontWeight: '700',
    color: '#FFF',
  },
  activeBadge: {
    backgroundColor: '#7B61FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modelStatus: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statusInstalled: {
    color: '#10B981',
    fontWeight: '600',
  },
  statusPending: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  modelDlProgressBox: {
    marginTop: 6,
  },
  miniBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miniBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  miniDlText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  spacer: {
    height: 16,
  },
  dlBox: {
    backgroundColor: '#1A1C23',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  dlTitle: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 4,
  },
  dlModelName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7B61FF',
  },
  dlPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  dlDetails: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  cancelBtn: {
    marginTop: 20,
    padding: 8,
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#F87171',
    fontWeight: '600',
    fontSize: 15,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#7B61FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
