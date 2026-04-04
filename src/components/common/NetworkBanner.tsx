import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      Animated.spring(slideAnim, {
        toValue: offline ? 0 : -50,
        useNativeDriver: true,
      }).start();
    });
    return () => unsubscribe();
  }, [slideAnim]);

  if (!isOffline) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.text}>📵 No internet connection — showing cached data</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});