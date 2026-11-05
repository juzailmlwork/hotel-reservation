import { vi } from 'vitest';

// Builds an unsigned JWT-shaped token; the frontend only reads the payload.
export function makeToken({ expInSeconds = 3600, username = 'admin@hotel.com' } = {}) {
  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const exp = Math.floor(Date.now() / 1000) + expInSeconds;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: '1', username, exp })}.sig`;
}

export function jsonResponse(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

// Mocks fetch with a handler: (path, options) => [status, body]
export function mockFetch(handler) {
  const fn = vi.fn((url, options = {}) => {
    const path = url.replace(/^.*\/api/, '');
    const [status, body] = handler(path, options);
    return jsonResponse(status, body);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}
