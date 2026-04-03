import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import {
  fetchTasks,
  setFilter,
  setSearchQuery,
  setRefreshing,
} from '../store/slices/tasksSlice';
import { TaskFilter } from '../types';

export const useTasks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tasksState = useSelector((state: RootState) => state.tasks);

  const loadTasks = useCallback(
    (page: number = 1) => dispatch(fetchTasks(page)),
    [dispatch]
  );

  const refresh = useCallback(() => {
    dispatch(setRefreshing(true));
    dispatch(fetchTasks(1));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!tasksState.isLoading && tasksState.hasMore) {
      dispatch(fetchTasks(tasksState.page + 1));
    }
  }, [dispatch, tasksState.isLoading, tasksState.hasMore, tasksState.page]);

  const search = useCallback(
    (query: string) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  const filter = useCallback(
    (f: TaskFilter) => dispatch(setFilter(f)),
    [dispatch]
  );

  return {
    ...tasksState,
    loadTasks,
    refresh,
    loadMore,
    search,
    filter,
  };
};