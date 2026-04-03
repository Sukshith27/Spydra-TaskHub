export interface Task {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export type TaskFilter = 'all' | 'pending' | 'completed';

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

export interface TasksState {
  items: Task[];
  filteredItems: Task[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  filter: TaskFilter;
  page: number;
  hasMore: boolean;
}

export type RootStackParamList = {
  Login: undefined;
  TaskList: undefined;
  TaskDetail: { taskId: number };
  CreateTask: undefined;
};