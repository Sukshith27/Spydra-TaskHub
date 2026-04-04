import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateTask, deleteTask } from '../../store/slices/tasksSlice';
import { RootStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { Haptics } from '../../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RouteType = RouteProp<RootStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const task = useSelector((state: RootState) =>
    state.tasks.items.find(t => t.id === route.params.taskId)
  );

  const [title, setTitle] = useState(task?.title || '');
  const [isEditing, setIsEditing] = useState(false);

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Task not found.
        </Text>
      </View>
    );
  }

  const handleSaveTitle = () => {
    if (title.trim().length < 3) {
      Haptics.error();
      Alert.alert('Validation', 'Title must be at least 3 characters.');
      return;
    }
    dispatch(updateTask({ ...task, title: title.trim() }));
    Haptics.success();
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    Haptics.medium();
    dispatch(updateTask({ ...task, completed: !task.completed }));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Task: ${task.title}\nStatus: ${task.completed ? 'Completed' : 'Pending'}\nShared from Task Manager`,
        title: 'Share Task',
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share task.');
    }
  };

  const handleDelete = () => {
    Haptics.error();
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTask(task.id));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const isDarkMode = colors.background === '#0F172A';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>

      {/* Top actions row */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={[styles.shareText, { color: colors.primary }]}>Share ↗</Text>
        </TouchableOpacity>
      </View>

      {/* Main card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.taskIdLabel, { color: colors.textHint }]}>Task #{task.id}</Text>

        {/* Title section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Title</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => {
                Haptics.light();
                setIsEditing(true);
              }}>
                <Text style={[styles.editBtn, { color: colors.primary }]}>✏ Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSaveTitle}>
                  <Text style={[styles.saveBtn, { color: colors.success }]}>✓ Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setTitle(task.title);
                    setIsEditing(false);
                  }}>
                  <Text style={[styles.cancelBtn, { color: colors.error }]}>✕ Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditing ? (
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: colors.textPrimary,
                  borderColor: colors.primary,
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              multiline
              autoFocus
              placeholderTextColor={colors.textHint}
            />
          ) : (
            <Text style={[styles.titleText, { color: colors.textPrimary }]}>
              {task.title}
            </Text>
          )}
        </View>

        {/* Status section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Status</Text>
          <TouchableOpacity
            style={[
              styles.statusToggle,
              {
                backgroundColor: task.completed
                  ? isDarkMode ? '#064E3B' : '#DCFCE7'
                  : isDarkMode ? '#78350F' : '#FEF3C7',
              },
            ]}
            onPress={handleToggleStatus}
            activeOpacity={0.8}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: task.completed ? colors.completed : colors.pending },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: task.completed ? colors.completed : colors.pending },
              ]}>
              {task.completed ? 'Completed' : 'Pending'}
            </Text>
            <Text style={[styles.tapToToggle, { color: colors.textHint }]}>
              tap to toggle
            </Text>
          </TouchableOpacity>
        </View>

        {/* User section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Assigned User
          </Text>
          <View style={[styles.infoRow, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={styles.userAvatar}>👤</Text>
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              User #{task.userId}
            </Text>
          </View>
        </View>
      </View>

      {/* Delete button */}
      <TouchableOpacity
        style={[styles.deleteBtn, { borderColor: colors.error }]}
        onPress={handleDelete}>
        <Text style={[styles.deleteBtnText, { color: colors.error }]}>🗑 Delete Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, fontWeight: '500' },
  shareBtn: { padding: 4 },
  shareText: { fontSize: 15, fontWeight: '600' },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  taskIdLabel: { fontSize: 12, marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  editBtn: { fontSize: 14, fontWeight: '600' },
  editActions: { flexDirection: 'row', gap: 14 },
  saveBtn: { fontSize: 14, fontWeight: '700' },
  cancelBtn: { fontSize: 14, fontWeight: '700' },
  titleText: { fontSize: 17, lineHeight: 26 },
  titleInput: {
    fontSize: 16,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 15, fontWeight: '700', flex: 1 },
  tapToToggle: { fontSize: 11 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  userAvatar: { fontSize: 18 },
  infoText: { fontSize: 15 },
  deleteBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600' },
  errorText: { textAlign: 'center', marginTop: 100, fontSize: 16 },
});