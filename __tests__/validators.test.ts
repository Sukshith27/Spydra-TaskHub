import {
  validateUsername,
  validatePassword,
  validateTaskTitle,
} from '../src/utils/validators';

describe('validateUsername', () => {
  it('returns error for empty string', () => {
    expect(validateUsername('')).toBe('Username is required');
  });

  it('returns error for whitespace only', () => {
    expect(validateUsername('   ')).toBe('Username is required');
  });

  it('returns error for less than 3 chars', () => {
    expect(validateUsername('ab')).toBe('Username must be at least 3 characters');
  });

  it('returns undefined for valid username', () => {
    expect(validateUsername('admin')).toBeUndefined();
  });

  it('accepts exactly 3 characters', () => {
    expect(validateUsername('abc')).toBeUndefined();
  });
});

describe('validatePassword', () => {
  it('returns error for empty string', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('returns error for less than 6 chars', () => {
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters');
  });

  it('returns undefined for valid password', () => {
    expect(validatePassword('123456')).toBeUndefined();
  });

  it('accepts long passwords', () => {
    expect(validatePassword('supersecurepassword123')).toBeUndefined();
  });
});

describe('validateTaskTitle', () => {
  it('returns error for empty title', () => {
    expect(validateTaskTitle('')).toBe('Task title is required');
  });

  it('returns error for short title', () => {
    expect(validateTaskTitle('ab')).toBe('Title must be at least 3 characters');
  });

  it('returns error for title over 120 chars', () => {
    expect(validateTaskTitle('a'.repeat(121))).toBe('Title must be under 120 characters');
  });

  it('returns undefined for valid title', () => {
    expect(validateTaskTitle('Fix login bug')).toBeUndefined();
  });
});