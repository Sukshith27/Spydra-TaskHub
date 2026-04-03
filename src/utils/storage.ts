import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH: '@taskapp/auth',
  TASKS: '@taskapp/tasks',
};

export const StorageService = {
  // Auth
  saveAuth: async (username: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.AUTH, JSON.stringify({ username }));
  },

  getAuth: async (): Promise<{ username: string } | null> => {
    const data = await AsyncStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },

  clearAuth: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.AUTH);
  },

  // Tasks
  saveTasks: async (tasks: object[]): Promise<void> => {
    await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  getTasks: async (): Promise<object[] | null> => {
    const data = await AsyncStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : null;
  },
};