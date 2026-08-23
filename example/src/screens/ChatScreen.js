import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useS2S } from '../state/S2SContext';
import { StatusBadge } from '../components/StatusBadge';
import { CentralMic } from '../components/CentralMic';
import { ChatBubbles } from '../components/ChatBubbles';

export const ChatScreen = () => {
  const { 
    engineState, s2sState, isDownloading, lastError, bootstrap,
    startListening, stopListening, interrupt, setCurrentScreen,
    conversation, currentAssistantDelta, currentTranscript 
  } = useS2S();

  const scrollViewRef = useRef();

  const handleMicTap = () => {
    if (engineState !== 'READY' && engineState !== 'RUNNING') return;

    if (s2sState === 'IDLE') {
      startListening();
    } else {
      interrupt();
      if (s2sState === 'LISTENING') stopListening();
    }
  };

  const getStatusText = () => {
    if (isDownloading) return 'Downloading';
    if (engineState === 'INITIALIZING') return 'Setting up';
    if (engineState === 'ERROR') return 'Error';
    return 'Ready';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <StatusBadge status={getStatusText()} />
        <Text style={styles.headerTitle}>S2S</Text>
        <TouchableOpacity onPress={() => setCurrentScreen('SETTINGS')} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Error Overlay */}
      {engineState === 'ERROR' && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Voice assistant couldn't start</Text>
          <Text style={styles.errorSubtitle}>Something prevented the voice engine from starting.</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity onPress={bootstrap} style={styles.errorBtn}>
              <Text style={styles.errorBtnText}>Try again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentScreen('DIAGNOSTICS')} style={styles.errorBtnSec}>
              <Text style={styles.errorBtnSecText}>View details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chat Area */}
      <ScrollView 
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <ChatBubbles 
          conversation={conversation} 
          currentTranscript={currentTranscript} 
          currentAssistantDelta={currentAssistantDelta} 
          engineState={engineState} 
        />
      </ScrollView>

      {/* Control Area */}
      <CentralMic 
        engineState={engineState} 
        s2sState={s2sState} 
        onPress={handleMicTap} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  settingsBtn: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 20,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingVertical: 16,
  },
  errorOverlay: {
    margin: 16,
    backgroundColor: '#1A1C23',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F87171',
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 18,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorBtnText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 13,
  },
  errorBtnSec: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorBtnSecText: {
    color: '#9CA3AF',
    fontWeight: '500',
    fontSize: 13,
  },
});
