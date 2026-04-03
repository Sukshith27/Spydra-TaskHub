import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '../../store';
import {
  fetchTasks,
  setSearchQuery,
  setFilter,
  setRefreshing,
} from '../../store/slices/tasksSlice';
import { logout } from '../../store/slices/authSlice';
import { StorageService } from '../../utils/storage';
import { Task, TaskFilter, RootStackParamList } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const FILTERS: { label: string; value: TaskFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

const TaskItem = React.memo(
  ({ item, onPress }: { item: Task; onPress: () => void }) => (
    <TouchableOpacity style={styles.taskCard} onPress={onPress}>
      <View style={styles.taskRow}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.completed ? '#10B981' : '#F59E0B' },
          ]}
        />
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
      <Text
        style={[
          styles.statusBadge,
          { color: item.completed ? '#10B981' : '#F59E0B' },
        ]}>
        {item.completed ? 'Completed' : 'Pending'}
      </Text>
    </TouchableOpacity>
  )
);

export default function TaskListScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const { filteredItems, isLoading, isRefreshing, error, page, hasMore, filter } =
    useSelector((state: RootState) => state.tasks);

  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  useEffect(() => {
    dispatch(fetchTasks(1));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(setRefreshing(true));
    dispatch(fetchTasks(1));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      dispatch(fetchTasks(page + 1));
    }
  }, [dispatch, isLoading, hasMore, page]);

  const handleLogout = async () => {
    await StorageService.clearAuth();
    dispatch(logout());
  };

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        item={item}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      />
    ),
    [navigation]
  );

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    return <ActivityIndicator style={styles.loader} color="#6366F1" />;
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {error ? `⚠️ ${error}` : 'No tasks found'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>My Tasks</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateTask')}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search tasks..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#94A3B8"
      />

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterBtn,
              filter === f.value && styles.filterBtnActive,
            ]}
            onPress={() => dispatch(setFilter(f.value))}>
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Initial loading */}
      {isLoading && filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#6366F1']}
            />
          }
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  searchInput: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterBtnActive: { backgroundColor: '#6366F1' },
  filterText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  taskCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  taskTitle: { flex: 1, fontSize: 15, color: '#0F172A', lineHeight: 22 },
  statusBadge: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  listContent: { paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: '#64748B' },
  loader: { padding: 16 },
});