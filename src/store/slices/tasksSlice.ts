import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TasksState, Task, TaskFilter } from '../../types';
import { todoApi } from '../../api/todoApi';
import { StorageService } from '../../utils/storage';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (page: number, { rejectWithValue }) => {
    try {
      const data = await todoApi.fetchTasks(page);
      return { tasks: data as Task[], page };
    } catch (error) {
      const cached = await StorageService.getTasks();
      if (cached && cached.length > 0) {
        return { tasks: cached as Task[], page: 1, fromCache: true };
      }
      return rejectWithValue('Failed to fetch tasks. No cached data.');
    }
  }
);

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

const applyFilters = (
  items: Task[],
  query: string,
  filter: TaskFilter
): Task[] => {
  return items.filter(task => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed);
    return matchesSearch && matchesFilter;
  });
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredItems = applyFilters(state.items, action.payload, state.filter);
    },
    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload;
      state.filteredItems = applyFilters(state.items, state.searchQuery, action.payload);
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.unshift(action.payload);
      state.filteredItems = applyFilters(state.items, state.searchQuery, state.filter);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
      state.filteredItems = applyFilters(state.items, state.searchQuery, state.filter);
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
      state.filteredItems = applyFilters(state.items, state.searchQuery, state.filter);
      StorageService.saveTasks(state.items);
    },
    markAllComplete: (state) => {
      state.items = state.items.map(t => ({ ...t, completed: true }));
      state.filteredItems = applyFilters(state.items, state.searchQuery, state.filter);
      StorageService.saveTasks(state.items);
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        const { tasks, page } = action.payload;
        if (page === 1) {
          state.items = tasks;
        } else {
          const existingIds = new Set(state.items.map(t => t.id));
          const newTasks = tasks.filter(t => !existingIds.has(t.id));
          state.items = [...state.items, ...newTasks];
        }
        state.hasMore = tasks.length === 20;
        state.page = page;
        state.filteredItems = applyFilters(state.items, state.searchQuery, state.filter);
        StorageService.saveTasks(state.items);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  setFilter,
  addTask,
  updateTask,
  deleteTask,
  markAllComplete,
  setRefreshing,
} = tasksSlice.actions;

export default tasksSlice.reducer;