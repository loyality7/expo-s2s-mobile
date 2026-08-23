import React from 'react';
import { S2SProvider, useS2S } from './src/state/S2SContext';
import { BootScreen } from './src/screens/BootScreen';
import { PermissionScreen } from './src/screens/PermissionScreen';
import { ModelSetupScreen } from './src/screens/ModelSetupScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { DiagnosticsScreen } from './src/screens/DiagnosticsScreen';

function MainNavigator() {
  const { currentScreen } = useS2S();

  switch (currentScreen) {
    case 'BOOT':
      return <BootScreen />;
    case 'PERMISSIONS':
      return <PermissionScreen />;
    case 'MODELS':
      return <ModelSetupScreen />;
    case 'SETTINGS':
      return <SettingsScreen />;
    case 'DIAGNOSTICS':
      return <DiagnosticsScreen />;
    case 'READY':
    default:
      return <ChatScreen />;
  }
}

export default function App() {
  return (
    <S2SProvider>
      <MainNavigator />
    </S2SProvider>
  );
}
