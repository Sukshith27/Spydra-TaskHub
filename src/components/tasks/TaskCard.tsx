import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Task } from '../../types';
import { useTheme } from '../../theme';

interface Props {
  item: Task;
  onPress: () => void;
  index: number;
}

export default function TaskCard({ item, onPress, index }: Props) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: Math.min(index * 60, 400),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: Math.min(index * 60, 400),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}>
        <View style={styles.row}>
          <View
            style={[
              styles.dot,
              { backgroundColor: item.completed ? colors.completed : colors.pending },
            ]}
          />
          <View style={styles.content}>
            <Text
              style={[styles.title, { color: colors.textPrimary }]}
              numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.footer}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: item.completed
                      ? isDark(colors) ? '#064E3B' : '#DCFCE7'
                      : isDark(colors) ? '#78350F' : '#FEF3C7',
                  },
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    { color: item.completed ? colors.completed : colors.pending },
                  ]}>
                  {item.completed ? '✓ Completed' : '● Pending'}
                </Text>
              </View>
              <Text style={[styles.taskId, { color: colors.textHint }]}>#{item.id}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Helper to detect dark colors
const isDark = (colors: any) => colors.background === '#0F172A';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  content: { flex: 1 },
  title: { fontSize: 15, lineHeight: 22, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  taskId: { fontSize: 11 },
});