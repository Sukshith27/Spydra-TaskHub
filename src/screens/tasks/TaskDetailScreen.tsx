import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateTask } from '../../store/slices/tasksSlice';
import { RootStackParamList } from '../../types';

type RouteType = RouteProp<RootStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const task = useSelector((state: RootState) =>
    state.tasks.items.find(t => t.id === route.params.taskId)
  );

  const [title, setTitle] = useState(task?.title || '');
  const [isEditing, setIsEditing] = useState(false);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Task not found.</Text>
      </View>
    );
  }

  const handleSaveTitle = () => {
    if (title.trim().length < 3) {
      Alert.alert('Validation', 'Title must be at least 3 characters.');
      return;
    }
    dispatch(updateTask({ ...task, title: title.trim() }));
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    dispatch(updateTask({ ...task, completed: !task.completed }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Task #{task.id}</Text>

        {/* Title */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Title</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSaveTitle}>
                  <Text style={styles.saveBtn}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setTitle(task.title);
                    setIsEditing(false);
                  }}>
                  <Text style={styles.cancelBtn}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              multiline
              autoFocus
            />
          ) : (
            <Text style={styles.titleText}>{task.title}</Text>
          )}
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Status</Text>
          <TouchableOpacity
            style={[
              styles.statusToggle,
              {
                backgroundColor: task.completed
                  ? '#DCFCE7'
                  : '#FEF3C7',
              },
            ]}
            onPress={handleToggleStatus}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: task.completed ? '#10B981' : '#F59E0B' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: task.completed ? '#10B981' : '#F59E0B' },
              ]}>
              {task.completed ? 'Completed' : 'Pending'}
            </Text>
            <Text style={styles.tapToToggle}>tap to toggle</Text>
          </TouchableOpacity>
        </View>

        {/* User */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Assigned User</Text>
          <Text style={styles.infoText}>User #{task.userId}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  content: { padding: 16 },
  backBtn: { marginBottom: 16, marginTop: 44 },
  backText: { color: '#6366F1', fontSize: 16, fontWeight: '500' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: { fontSize: 12, color: '#94A3B8', marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  editBtn: { color: '#6366F1', fontSize: 14, fontWeight: '600' },
  editActions: { flexDirection: 'row', gap: 12 },
  saveBtn: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  cancelBtn: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  titleText: { fontSize: 17, color: '#0F172A', lineHeight: 26 },
  titleInput: {
    fontSize: 17,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
    padding: 12,
    lineHeight: 24,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 10,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 15, fontWeight: '600', flex: 1 },
  tapToToggle: { fontSize: 11, color: '#94A3B8' },
  infoText: { fontSize: 15, color: '#0F172A' },
  errorText: { textAlign: 'center', marginTop: 100, fontSize: 16, color: '#64748B' },
});