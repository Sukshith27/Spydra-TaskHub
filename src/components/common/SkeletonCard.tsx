import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export default function SkeletonCard() {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: anim }]}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: colors.border }]} />
        <View style={styles.content}>
          <View style={[styles.line, { backgroundColor: colors.border, width: '85%' }]} />
          <View style={[styles.line, { backgroundColor: colors.border, width: '60%', marginTop: 6 }]} />
          <View style={[styles.badge, { backgroundColor: colors.border, marginTop: 10 }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  content: { flex: 1 },
  line: { height: 14, borderRadius: 7 },
  badge: { height: 22, width: 90, borderRadius: 11 },
});