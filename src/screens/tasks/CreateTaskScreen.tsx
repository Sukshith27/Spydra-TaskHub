import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addTask } from '../../store/slices/tasksSlice';
import { validateTaskTitle } from '../../utils/validators';

export default function CreateTaskScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.tasks);

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const error = validateTaskTitle(title) || '';
    setTitleError(error);
    if (error) return;

    setIsLoading(true);
    try {
      // Generate a local ID (max existing + 1)
      const maxId = items.reduce((max, t) => Math.max(max, t.id), 0);
      const newTask = {
        id: maxId + 1,
        userId: 1,
        title: title.trim(),
        completed: false,
      };
      dispatch(addTask(newTask));
      Alert.alert('Success', 'Task created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to create task.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.heading}>Create New Task</Text>
        <Text style={styles.subheading}>Add a task to your list</Text>

        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Task Title</Text>
          <TextInput
            style={[styles.input, titleError ? styles.inputError : null]}
            placeholder="Enter task title..."
            value={title}
            onChangeText={text => {
              setTitle(text);
              setTitleError('');
            }}
            multiline
            numberOfLines={3}
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}
          <Text style={styles.charCount}>{title.length}/120</Text>
        </View>

        <View style={styles.statusInfo}>
          <View style={styles.statusDot} />
          <Text style={styles.statusInfoText}>
            New tasks are created as Pending
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleCreate}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>Create Task</Text>
          )}
        </TouchableOpacity>
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
  heading: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  fieldWrapper: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8F9FF',
    minHeight: 100,
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  charCount: { fontSize: 11, color: '#94A3B8', textAlign: 'right', marginTop: 4 },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  statusInfoText: { fontSize: 13, color: '#92400E' },
  createBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  createBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});