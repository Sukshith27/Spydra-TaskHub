import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Alert,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Task } from '../../types';
import { useTheme } from '../../theme';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { deleteTask } from '../../store/slices/tasksSlice';

interface Props {
  item: Task;
  onPress: () => void;
  index: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.3;

export default function TaskCard({ item, onPress, index }: Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;
  const cardHeight = useRef(new Animated.Value(1)).current;

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && gestureState.dx < -5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
          const progress = Math.min(Math.abs(gestureState.dx) / Math.abs(SWIPE_THRESHOLD), 1);
          deleteOpacity.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // Confirm delete
          Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
              {
                text: 'Cancel',
                onPress: () => {
                  Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                  }).start();
                  Animated.timing(deleteOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }).start();
                },
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  Animated.parallel([
                    Animated.timing(translateX, {
                      toValue: -SCREEN_WIDTH,
                      duration: 250,
                      useNativeDriver: true,
                    }),
                    Animated.timing(cardHeight, {
                      toValue: 0,
                      duration: 300,
                      delay: 200,
                      useNativeDriver: true,
                    }),
                  ]).start(() => {
                    dispatch(deleteTask(item.id));
                  });
                },
              },
            ]
          );
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const isDarkMode = colors.background === '#0F172A';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scaleY: cardHeight }],
        },
      ]}>
      {/* Delete background */}
      <Animated.View style={[styles.deleteBackground, { opacity: deleteOpacity }]}>
        <Text style={styles.deleteIcon}>🗑</Text>
        <Text style={styles.deleteLabel}>Delete</Text>
      </Animated.View>

      {/* Card */}
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
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
                style={[
                  styles.title,
                  {
                    color: colors.textPrimary,
                    textDecorationLine: item.completed ? 'line-through' : 'none',
                    opacity: item.completed ? 0.6 : 1,
                  },
                ]}
                numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.footer}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: item.completed
                        ? isDarkMode ? '#064E3B' : '#DCFCE7'
                        : isDarkMode ? '#78350F' : '#FEF3C7',
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginVertical: 5 },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: '#EF4444',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  deleteIcon: { fontSize: 18 },
  deleteLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  card: {
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