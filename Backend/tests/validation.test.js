const { validateCredentials } = require('../src/validation');

describe('validateCredentials', () => {
  test('accepts valid username and 6 character password', () => {
    expect(validateCredentials({ username: 'admin@hotel.com', password: '123456' })).toEqual({});
  });

  test('requires username', () => {
    expect(validateCredentials({ username: '  ', password: '123456' })).toHaveProperty('username');
  });

  test('requires password', () => {
    expect(validateCredentials({ username: 'bob' })).toHaveProperty('password');
  });

  test('rejects password shorter than 6 characters', () => {
    const errors = validateCredentials({ username: 'bob', password: '12345' });
    expect(errors.password).toMatch(/at least 6/);
  });
});
