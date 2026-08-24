import { useState } from 'react';
import { useS2SContext } from '../context/S2SContext';
import { AppState } from '../context/S2SProvider';
import { BootScreen } from '../screens/BootScreen';
import { PermissionScreen } from '../screens/PermissionScreen';
import { ModelSetupScreen } from '../screens/ModelSetupScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DiagnosticsScreen } from '../screens/DiagnosticsScreen';
import { ErrorScreen } from '../screens/ErrorScreen';

// No routing library: the app is a single deterministic flow driven by
// AppState, plus two flat sub-screens (Settings, Diagnostics) reachable
// once READY. A stack library would add native linking risk for no benefit
// over this simple, explicit switch.
export function AppNavigator() {
  const { appState, bootError, retry } = useS2SContext();
  const [subScreen, setSubScreen] = useState(null); // null | 'settings' | 'diagnostics'

  if (appState === AppState.MODELS_REQUIRED || appState === AppState.DOWNLOADING_MODELS) {
    return <ModelSetupScreen />;
  }
  if (appState === AppState.PERMISSIONS_REQUIRED) {
    return <PermissionScreen />;
  }
  if (appState === AppState.ERROR) {
    if (subScreen === 'diagnostics') {
      return <DiagnosticsScreen onBack={() => setSubScreen(null)} />;
    }
    return (
      <ErrorScreen
        rawMessage={bootError}
        onRetry={retry}
        onOpenDiagnostics={() => setSubScreen('diagnostics')}
      />
    );
  }
  if (appState === AppState.READY) {
    if (subScreen === 'settings') {
      return <SettingsScreen onBack={() => setSubScreen(null)} onOpenDiagnostics={() => setSubScreen('diagnostics')} />;
    }
    if (subScreen === 'diagnostics') {
      return <DiagnosticsScreen onBack={() => setSubScreen(null)} />;
    }
    return <ChatScreen onOpenSettings={() => setSubScreen('settings')} />;
  }

  return <BootScreen appState={appState} />;
}
