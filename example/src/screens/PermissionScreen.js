import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';
import { PermissionCard } from '../components/PermissionCard';
import { PermissionState } from '../hooks/usePermissions';
import { useS2SContext } from '../context/S2SContext';

export function PermissionScreen() {
  const { permissions, requestPermission } = useS2SContext();

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <PermissionCard
          state={permissions.state}
          requesting={permissions.state === PermissionState.REQUESTING}
          onRequest={requestPermission}
          onOpenSettings={permissions.openSettings}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center' },
});
