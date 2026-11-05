import { vi } from 'vitest';
import { api, getToken, getTokenExpiry, onUnauthorized, setToken } from '../src/api';
import { makeToken, mockFetch } from './helpers';

afterEach(() => {
  vi.unstubAllGlobals();
  onUnauthorized(() => {});
});

describe('getTokenExpiry', () => {
  test('reads exp from the token payload in milliseconds', () => {
    const token = makeToken({ expInSeconds: 60 });
    const expiry = getTokenExpiry(token);
    expect(expiry).toBeGreaterThan(Date.now() + 55_000);
    expect(expiry).toBeLessThanOrEqual(Date.now() + 60_000);
  });

  test('returns null for a malformed token', () => {
    expect(getTokenExpiry('not-a-token')).toBeNull();
  });
});

describe('401 handling', () => {
  test('clears the token and calls the handler when an authenticated request gets 401', async () => {
    setToken(makeToken());
    mockFetch(() => [401, { message: 'Session expired', code: 'TOKEN_EXPIRED' }]);
    const handler = vi.fn();
    onUnauthorized(handler);

    await expect(api.listUsers()).rejects.toMatchObject({ status: 401, code: 'TOKEN_EXPIRED' });
    expect(handler).toHaveBeenCalledWith('TOKEN_EXPIRED');
    expect(getToken()).toBeNull();
  });

  test('does not treat a failed login (no token) as an expired session', async () => {
    mockFetch(() => [401, { message: 'Invalid username or password' }]);
    const handler = vi.fn();
    onUnauthorized(handler);

    await expect(api.login({ username: 'a', password: 'b' })).rejects.toThrow(
      'Invalid username or password',
    );
    expect(handler).not.toHaveBeenCalled();
  });

  test('does not log out on other errors such as 409', async () => {
    const token = makeToken();
    setToken(token);
    mockFetch(() => [409, { message: 'Username already exists' }]);
    const handler = vi.fn();
    onUnauthorized(handler);

    await expect(api.createUser({ username: 'a', password: 'b' })).rejects.toThrow();
    expect(handler).not.toHaveBeenCalled();
    expect(getToken()).toBe(token);
  });

  test('sends the token as a Bearer header', async () => {
    const token = makeToken();
    setToken(token);
    const fetchMock = mockFetch(() => [200, { users: [] }]);

    await api.listUsers();
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${token}`);
  });
});
