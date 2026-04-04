import { Vibration, Platform } from 'react-native';

export const Haptics = {
  light: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(30);
    }
  },
  medium: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(60);
    }
  },
  success: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 40, 30, 40]);
    }
  },
  error: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 80, 40, 80]);
    }
  },
};