import { validateCredentials } from '../src/validation';

const valid = { username: 'staff@gmail.com', password: 'abc@123' };

describe('validateCredentials', () => {
  test('accepts a gmail address and a password with a special character', () => {
    expect(validateCredentials(valid)).toEqual({});
  });

  test('requires email', () => {
    expect(validateCredentials({ ...valid, username: '  ' }).username).toBe('Email is required');
  });

  test('rejects email that is not @gmail.com', () => {
    expect(validateCredentials({ ...valid, username: 'staff@yahoo.com' }).username).toBe(
      'Email must be a @gmail.com address',
    );
  });

  test('rejects email that only contains gmail.com without @', () => {
    expect(validateCredentials({ ...valid, username: 'staffgmail.com' }).username).toBe(
      'Email must be a @gmail.com address',
    );
  });

  test('accepts @gmail.com in any letter case', () => {
    expect(validateCredentials({ ...valid, username: 'Staff@GMAIL.com' })).toEqual({});
  });

  test('allows non-gmail email when requireGmail is off (login)', () => {
    expect(
      validateCredentials({ username: 'admin@hotel.com', password: '123456@' }, { requireGmail: false }),
    ).toEqual({});
  });

  test('requires password', () => {
    expect(validateCredentials({ ...valid, password: '' }).password).toBe('Password is required');
  });

  test('rejects password shorter than 6 characters', () => {
    expect(validateCredentials({ ...valid, password: 'a@1' }).password).toBe(
      'Password must be at least 6 characters',
    );
  });

  test('rejects password without a special character', () => {
    expect(validateCredentials({ ...valid, password: 'abcdef' }).password).toBe(
      'Password must contain at least one special character',
    );
  });

  test('allows password without a special character when requireSpecialChar is off', () => {
    expect(
      validateCredentials({ ...valid, password: 'abcdef' }, { requireSpecialChar: false }),
    ).toEqual({});
  });
});
