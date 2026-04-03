export const validateUsername = (value: string): string | undefined => {
  if (!value || value.trim().length === 0) return 'Username is required';
  if (value.trim().length < 3) return 'Username must be at least 3 characters';
  return undefined;
};

export const validatePassword = (value: string): string | undefined => {
  if (!value || value.trim().length === 0) return 'Password is required';
  if (value.length < 6) return 'Password must be at least 6 characters';
  return undefined;
};

export const validateTaskTitle = (value: string): string | undefined => {
  if (!value || value.trim().length === 0) return 'Task title is required';
  if (value.trim().length < 3) return 'Title must be at least 3 characters';
  if (value.trim().length > 120) return 'Title must be under 120 characters';
  return undefined;
};