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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    <TouchableOpacity style={styles.taskCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.taskRow}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.completed ? '#10B981' : '#F59E0B' },
          ]}
        />
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.taskFooter}>
            <View style={[styles.badge, { backgroundColor: item.completed ? '#DCFCE7' : '#FEF3C7' }]}>
              <Text style={[styles.badgeText, { color: item.completed ? '#10B981' : '#F59E0B' }]}>
                {item.completed ? '✓ Completed' : '● Pending'}
              </Text>
            </View>
            <Text style={styles.taskId}>#{item.id}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
);

export default function TaskListScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { filteredItems, isLoading, isRefreshing, error, page, hasMore, filter } =
    useSelector((state: RootState) => state.tasks);
  const username = useSelector((state: RootState) => state.auth.username);

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
        <Text style={styles.emptyIcon}>{error ? '⚠️' : '📋'}</Text>
        <Text style={styles.emptyTitle}>{error ? 'Something went wrong' : 'No tasks found'}</Text>
        <Text style={styles.emptySubtitle}>
          {error ? 'Showing cached data if available' : 'Try a different search or filter'}
        </Text>
      </View>
    );
  };

  const taskCount = filteredItems.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {username} 👋</Text>
          <Text style={styles.heading}>My Tasks</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateTask')}
            activeOpacity={0.8}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {taskCount} {taskCount === 1 ? 'task' : 'tasks'} found
        </Text>
        {error ? <Text style={styles.offlineTag}>📵 Offline</Text> : null}
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#94A3B8"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
            onPress={() => dispatch(setFilter(f.value))}
            activeOpacity={0.7}>
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading && filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
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
              tintColor="#6366F1"
            />
          }
          contentContainerStyle={[
            styles.listContent,
            filteredItems.length === 0 && styles.listEmpty,
          ]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  greeting: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  heading: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  logoutBtn: { padding: 4 },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: '500' },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  statsText: { fontSize: 12, color: '#64748B' },
  offlineTag: { fontSize: 12, color: '#EF4444' },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0F172A',
  },
  clearBtn: { color: '#94A3B8', fontSize: 14, padding: 4 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  filterText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  filterTextActive: { color: '#6366F1', fontWeight: '600' },
  taskCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 15, color: '#0F172A', lineHeight: 22, marginBottom: 10 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  taskId: { fontSize: 11, color: '#CBD5E1' },
  listContent: { paddingBottom: 24, paddingTop: 4 },
  listEmpty: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 32 },
  loadingText: { marginTop: 12, color: '#94A3B8', fontSize: 14 },
  loader: { padding: 16 },
});