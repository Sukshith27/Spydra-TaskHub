import tasksReducer, {
  setFilter,
  setSearchQuery,
  setSortBy,
  addTask,
  updateTask,
  deleteTask,
  markAllComplete,
} from '../src/store/slices/tasksSlice';
import { TasksState } from '../src/types';

const mockTask = { id: 1, userId: 1, title: 'Test task', completed: false };
const mockTask2 = { id: 2, userId: 1, title: 'Another task', completed: true };

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

const stateWithTasks: TasksState = {
  ...initialState,
  items: [mockTask, mockTask2],
  filteredItems: [mockTask, mockTask2],
};

describe('tasksSlice', () => {
  it('returns initial state', () => {
    expect(tasksReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('addTask prepends task to list', () => {
    const state = tasksReducer(stateWithTasks, addTask({
      id: 3, userId: 1, title: 'New task', completed: false,
    }));
    expect(state.items[0].id).toBe(3);
    expect(state.items.length).toBe(3);
  });

  it('updateTask updates existing task', () => {
    const updated = { ...mockTask, title: 'Updated title' };
    const state = tasksReducer(stateWithTasks, updateTask(updated));
    expect(state.items[0].title).toBe('Updated title');
  });

  it('deleteTask removes task by id', () => {
    const state = tasksReducer(stateWithTasks, deleteTask(1));
    expect(state.items.find(t => t.id === 1)).toBeUndefined();
    expect(state.items.length).toBe(1);
  });

  it('markAllComplete sets all tasks to completed', () => {
    const state = tasksReducer(stateWithTasks, markAllComplete());
    expect(state.items.every(t => t.completed)).toBe(true);
  });

  it('setFilter filters by pending', () => {
    const state = tasksReducer(stateWithTasks, setFilter('pending'));
    expect(state.filteredItems.every(t => !t.completed)).toBe(true);
  });

  it('setFilter filters by completed', () => {
    const state = tasksReducer(stateWithTasks, setFilter('completed'));
    expect(state.filteredItems.every(t => t.completed)).toBe(true);
  });

  it('setSearchQuery filters by title', () => {
    const state = tasksReducer(stateWithTasks, setSearchQuery('another'));
    expect(state.filteredItems.length).toBe(1);
    expect(state.filteredItems[0].id).toBe(2);
  });

  it('setSortBy title sorts alphabetically', () => {
    const state = tasksReducer(stateWithTasks, setSortBy('title'));
    expect(state.filteredItems[0].title).toBe('Another task');
  });
});