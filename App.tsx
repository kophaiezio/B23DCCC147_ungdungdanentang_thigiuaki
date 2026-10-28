import React from 'react';
import {ActivityIndicator, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {LibraryProvider, useLibrary} from './src/context/LibraryContext';
import AppNavigator from './src/navigation/AppNavigator';
import {colors} from './src/theme/colors';
import AppButton from './src/components/AppButton';

function AppContent(): React.JSX.Element {
  const {status, error, reload} = useLibrary();

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.statusText}>Đang tải dữ liệu thư viện...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
        <Text style={styles.errorText}>{error}</Text>
        <AppButton title="Thử lại" onPress={reload} />
      </View>
    );
  }

  return <AppNavigator />;
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <LibraryProvider>
        <AppContent />
      </LibraryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  statusText: {
    color: colors.textSecondary,
    marginTop: 14,
    fontSize: 15,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default App;
