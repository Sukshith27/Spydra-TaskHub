const BASE_URL = 'https://jsonplaceholder.typicode.com';
const PAGE_SIZE = 20;

export const todoApi = {
  fetchTasks: async (page: number = 1): Promise<any[]> => {
    const response = await fetch(
      `${BASE_URL}/todos?_page=${page}&_limit=${PAGE_SIZE}`
    );
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },
};