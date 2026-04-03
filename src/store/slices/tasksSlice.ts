import { createSlice } from '@reduxjs/toolkit';
import { TasksState } from '../../types';

const initialState: TasksState = {
  items: [],
  filteredItems: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  searchQuery: '',
  filter: 'all',
  page: 1,
  hasMore: true,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
});

export default tasksSlice.reducer;