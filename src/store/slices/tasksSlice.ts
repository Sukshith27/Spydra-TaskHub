import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TasksState, Task, TaskFilter, SortBy } from '../../types';
import { todoApi } from '../../api/todoApi';
import { StorageService } from '../../utils/storage';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (page: number, { rejectWithValue, getState }) => {
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
  sortBy: 'default',
  page: 1,
  hasMore: true,
};

const applySorting = (items: Task[], sortBy: SortBy): Task[] => {
  const sorted = [...items];
  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'status':
      return sorted.sort((a, b) => Number(a.completed) - Number(b.completed));
    default:
      return sorted;
  }
};

const applyFilters = (
  items: Task[],
  query: string,
  filter: TaskFilter,
  sortBy: SortBy
): Task[] => {
  let result = items.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed);
    return matchesSearch && matchesFilter;
  });
  return applySorting(result, sortBy);
};

// API returns IDs 1-200. Local tasks get IDs > 200000 to avoid collision.
const isLocalTask = (task: Task): boolean => task.id > 200000;

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredItems = applyFilters(
        state.items, action.payload, state.filter, state.sortBy
      );
    },
    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload;
      state.filteredItems = applyFilters(
        state.items, state.searchQuery, action.payload, state.sortBy
      );
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload;
      state.filteredItems = applyFilters(
        state.items, state.searchQuery, state.filter, action.payload
      );
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.unshift(action.payload);
      state.filteredItems = applyFilters(
        state.items, state.searchQuery, state.filter, state.sortBy
      );
      StorageService.saveTasks(state.items);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
      state.filteredItems = applyFilters(
        state.items, state.searchQuery, state.filter, state.sortBy
      );
      StorageService.saveTasks(state.items);
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
      state.filteredItems = applyFilters(
        state.items, state.searchQuery, state.filter, state.sortBy
      );
      StorageService.saveTasks(state.items);
    },
    markAllComplete: state => {
      state.items = state.items.map(t => ({ ...t, completed: true }));
      state.filteredItems = applyFilters(
        state.items, state.searchQuery, state.filter, state.sortBy
      );
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
          // Keep local tasks, replace API tasks
          const localTasks = state.items.filter(isLocalTask);
          // Merge: apply any local edits to API tasks
          const mergedApiTasks = tasks.map(apiTask => {
            const existing = state.items.find(t => t.id === apiTask.id);
            // If user edited this task locally, keep their version
            return existing ? existing : apiTask;
          });
          // Local tasks always stay at top
          state.items = [...localTasks, ...mergedApiTasks];
        } else {
          // Load more — only add new API tasks, skip duplicates
          const existingIds = new Set(state.items.map(t => t.id));
          const newTasks = tasks.filter(t => !existingIds.has(t.id));
          state.items = [...state.items, ...newTasks];
        }

        state.hasMore = tasks.length === 20;
        state.page = page;
        state.filteredItems = applyFilters(
          state.items, state.searchQuery, state.filter, state.sortBy
        );
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
  setSortBy,
  addTask,
  updateTask,
  deleteTask,
  markAllComplete,
  setRefreshing,
} = tasksSlice.actions;

export default tasksSlice.reducer;