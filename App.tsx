import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { StorageService } from './src/utils/storage';
import { loginSuccess } from './src/store/slices/authSlice';
import { ActivityIndicator, View } from 'react-native';

function AppContent() {
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}