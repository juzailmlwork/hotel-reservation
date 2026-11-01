import { validateCredentials } from '../src/validation';

describe('validateCredentials', () => {
  test('accepts valid username and 6 character password', () => {
    expect(validateCredentials({ username: 'admin@hotel.com', password: '123456' })).toEqual({});
  });

  test('requires username', () => {
    expect(validateCredentials({ username: '', password: '123456' }).username).toBe(
      'Username is required',
    );
  });

  test('requires password', () => {
    expect(validateCredentials({ username: 'bob', password: '' }).password).toBe(
      'Password is required',
    );
  });

  test('rejects password shorter than 6 characters', () => {
    expect(validateCredentials({ username: 'bob', password: '12345' }).password).toBe(
      'Password must be at least 6 characters',
    );
  });
});
