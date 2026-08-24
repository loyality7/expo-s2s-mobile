import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { S2SProvider } from './src/context/S2SProvider';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <S2SProvider>
        <AppNavigator />
      </S2SProvider>
    </SafeAreaProvider>
  );
}
