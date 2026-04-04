import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { StorageService } from './src/utils/storage';
import { loginSuccess } from './src/store/slices/authSlice';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { useTheme } from './src/theme';

function AppContent() {
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const auth = await StorageService.getAuth();
        if (auth?.username) {
          dispatch(loginSuccess(auth.username));
        }
      } catch (e) {
        // no saved auth
      } finally {
        setIsChecking(false);
      }
    };
    restoreAuth();
  }, [dispatch]);

  if (isChecking) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}