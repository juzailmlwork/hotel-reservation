import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../src/App';
import { AuthProvider } from '../src/AuthContext';
import { setToken } from '../src/api';
import { makeToken, mockFetch } from './helpers';

const admin = { id: '1', username: 'admin@hotel.com', createdAt: new Date().toISOString() };
const EXPIRED_NOTICE = 'Your session has expired. Please sign in again.';

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

// Backend that accepts the token for /auth/me and /users unless told otherwise.
function backend({ createUserStatus = 201 } = {}) {
  return mockFetch((path, { method = 'GET' }) => {
    if (path === '/auth/me') return [200, { user: admin }];
    if (path === '/users' && method === 'GET') return [200, { users: [admin] }];
    if (path === '/users' && createUserStatus === 401) {
      return [401, { message: 'Session expired', code: 'TOKEN_EXPIRED' }];
    }
    if (path === '/auth/login') return [401, { message: 'Invalid username or password' }];
    return [500, {}];
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('session expiry', () => {
  test('logs out and shows a notice when the token expires while on the dashboard', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setToken(makeToken({ expInSeconds: 60 }));
    backend();
    renderApp();

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(61_000);
    });

    expect(await screen.findByText(EXPIRED_NOTICE)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(localStorage.getItem('admin_token')).toBeNull();
  });

  test('logs out when an API call returns 401 mid-session', async () => {
    setToken(makeToken());
    backend({ createUserStatus: 401 });
    renderApp();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: 'Dashboard' });
    await user.type(screen.getByLabelText('Email'), 'late@gmail.com');
    await user.type(screen.getByLabelText('Password'), 'abc@123');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    expect(await screen.findByText(EXPIRED_NOTICE)).toBeInTheDocument();
    expect(localStorage.getItem('admin_token')).toBeNull();
  });

  test('a token that already expired goes straight to login with the notice', async () => {
    setToken(makeToken({ expInSeconds: -10 }));
    mockFetch(() => [401, { message: 'Session expired', code: 'TOKEN_EXPIRED' }]);
    renderApp();

    expect(await screen.findByText(EXPIRED_NOTICE)).toBeInTheDocument();
  });

  test('manual logout does not show the expired notice', async () => {
    setToken(makeToken());
    backend();
    renderApp();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: 'Dashboard' });
    await user.click(screen.getByRole('button', { name: /logout/i }));

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.queryByText(EXPIRED_NOTICE)).not.toBeInTheDocument();
  });

  test('a wrong password on login does not show the expired notice', async () => {
    backend();
    renderApp();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: 'Welcome back' });
    await user.type(screen.getByLabelText('Email'), 'admin@hotel.com');
    await user.type(screen.getByLabelText('Password'), 'wrong@123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
    expect(screen.queryByText(EXPIRED_NOTICE)).not.toBeInTheDocument();
  });
});
