import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CredentialsForm from '../src/components/CredentialsForm';

function setup() {
  const onSubmit = vi.fn().mockResolvedValue();
  render(<CredentialsForm submitLabel="Login" onSubmit={onSubmit} />);
  return { onSubmit, user: userEvent.setup() };
}

describe('CredentialsForm validation', () => {
  test('shows required errors and does not submit when empty', async () => {
    const { onSubmit, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('shows error when password is shorter than 6 characters', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('Username'), 'admin@hotel.com');
    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submits when input is valid', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('Username'), 'admin@hotel.com');
    await user.type(screen.getByLabelText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(onSubmit).toHaveBeenCalledWith({ username: 'admin@hotel.com', password: '123456' });
  });

  test('shows server error message when submit fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Invalid username or password'));
    render(<CredentialsForm submitLabel="Login" onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Username'), 'admin@hotel.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
  });
});
