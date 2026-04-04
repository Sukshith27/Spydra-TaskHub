import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from './colors';
import { typography } from './typography';

export { typography };
export { LightColors, DarkColors };

export const useTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  return { colors, isDark, typography };
};