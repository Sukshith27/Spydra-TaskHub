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
  Modal,
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
  markAllComplete,
  setSortBy,
} from '../../store/slices/tasksSlice';
import { logout } from '../../store/slices/authSlice';
import { StorageService } from '../../utils/storage';
import { Task, TaskFilter, SortBy, RootStackParamList } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import TaskCard from '../../components/tasks/TaskCard';
import EmptyState from '../../components/common/EmptyState';
import SkeletonCard from '../../components/common/SkeletonCard';
import NetworkBanner from '../../components/common/NetworkBanner';
import { useTheme } from '../../theme';
import { Haptics } from '../../utils/haptics';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const FILTERS: { label: string; value: TaskFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

const SORT_OPTIONS: { label: string; value: SortBy; icon: string }[] = [
  { label: 'Default', value: 'default', icon: '📋' },
  { label: 'By Title', value: 'title', icon: '🔤' },
  { label: 'By Status', value: 'status', icon: '✅' },
];

export default function TaskListScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { filteredItems, isLoading, isRefreshing, error, page, hasMore, filter, sortBy } =
    useSelector((state: RootState) => state.tasks);
  const username = useSelector((state: RootState) => state.auth.username);
  const allItems = useSelector((state: RootState) => state.tasks.items);

  const filterCounts = {
    all: allItems.length,
    pending: allItems.filter(t => !t.completed).length,
    completed: allItems.filter(t => t.completed).length,
  };

  const allDone = allItems.length > 0 && allItems.every(t => t.completed);

  const [searchText, setSearchText] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
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
    Haptics.light();
    await StorageService.clearAuth();
    dispatch(logout());
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Task; index: number }) => (
      <TaskCard
        item={item}
        index={index}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      />
    ),
    [navigation]
  );

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return error ? (
      <EmptyState icon="⚠️" title="Something went wrong" subtitle="Showing cached data if available" />
    ) : (
      <EmptyState icon="📋" title="No tasks found" subtitle="Try a different search or filter" />
    );
  };

  const currentSort = SORT_OPTIONS.find(s => s.value === sortBy);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <NetworkBanner />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Hello, {username} 👋
          </Text>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>My Tasks</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.light();
              navigation.navigate('CreateTask');
            }}
            activeOpacity={0.8}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats + Sort bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          {filteredItems.length} {filteredItems.length === 1 ? 'task' : 'tasks'} found
        </Text>
        <View style={styles.statsRight}>
          {error ? <Text style={[styles.offlineTag, { color: colors.error }]}>📵 Offline</Text> : null}
          <TouchableOpacity
            style={[styles.sortBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={() => {
              Haptics.light();
              setShowSortModal(true);
            }}>
            <Text style={[styles.sortBtnText, { color: colors.textSecondary }]}>
              {currentSort?.icon} Sort
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search tasks..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={colors.textHint}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={[styles.clearBtn, { color: colors.textHint }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterBtn,
                { backgroundColor: colors.surfaceSecondary, borderColor: 'transparent' },
                filter === f.value && { backgroundColor: colors.surface, borderColor: colors.primary },
              ]}
              onPress={() => {
                Haptics.light();
                dispatch(setFilter(f.value));
              }}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.filterText,
                  { color: colors.textSecondary },
                  filter === f.value && { color: colors.primary, fontWeight: '600' },
                ]}>
                {f.label}
              </Text>
              {filterCounts[f.value] > 0 && (
                <View style={[styles.countBadge, { backgroundColor: filter === f.value ? colors.primary : colors.border }]}>
                  <Text style={[styles.countBadgeText, { color: filter === f.value ? '#fff' : colors.textSecondary }]}>
                    {filterCounts[f.value]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {!allDone && allItems.length > 0 && (
          <TouchableOpacity
            style={[styles.markAllBtn, { backgroundColor: colors.success }]}
            onPress={() => {
              Haptics.success();
              dispatch(markAllComplete());
            }}
            activeOpacity={0.8}>
            <Text style={styles.markAllText}>✓ All Done</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {isLoading && filteredItems.length === 0 ? (
        <View>{[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}</View>
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
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[styles.listContent, filteredItems.length === 0 && styles.listEmpty]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Sort Tasks</Text>
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  { borderColor: colors.border },
                  sortBy === option.value && { backgroundColor: colors.surfaceSecondary },
                ]}
                onPress={() => {
                  Haptics.light();
                  dispatch(setSortBy(option.value));
                  setShowSortModal(false);
                }}>
                <Text style={styles.sortOptionIcon}>{option.icon}</Text>
                <Text style={[styles.sortOptionText, { color: colors.textPrimary }]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Text style={[styles.sortOptionCheck, { color: colors.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  heading: { fontSize: 22, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  logoutBtn: { padding: 4 },
  logoutText: { fontSize: 13, fontWeight: '500' },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statsText: { fontSize: 12 },
  statsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  offlineTag: { fontSize: 12 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortBtnText: { fontSize: 12, fontWeight: '500' },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 15 },
  clearBtn: { fontSize: 14, padding: 4 },
  filterSection: { paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 5,
  },
  filterText: { fontSize: 13, fontWeight: '500' },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: { fontSize: 10, fontWeight: '700' },
  markAllBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markAllText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  listContent: { paddingBottom: 24, paddingTop: 4 },
  listEmpty: { flexGrow: 1 },
  footerLoader: { padding: 16, alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  sortOptionIcon: { fontSize: 20 },
  sortOptionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  sortOptionCheck: { fontSize: 16, fontWeight: '700' },
});