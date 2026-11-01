import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CredentialsForm from '../src/components/CredentialsForm';

function setup(props = {}) {
  const onSubmit = vi.fn().mockResolvedValue();
  render(<CredentialsForm submitLabel="Submit" onSubmit={onSubmit} {...props} />);
  return { onSubmit, user: userEvent.setup() };
}

// Same settings the Login page uses.
const loginProps = { newPassword: false, requireGmail: false };

async function fillAndSubmit(user, email, password) {
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Submit' }));
}

describe('CredentialsForm (register / create user)', () => {
  test('shows required errors and does not submit when empty', async () => {
    const { onSubmit, user } = setup();
    await fillAndSubmit(user);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('rejects email that is not @gmail.com', async () => {
    const { onSubmit, user } = setup();
    await fillAndSubmit(user, 'staff@hotel.com', 'abc@123');

    expect(screen.getByText('Email must be a @gmail.com address')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('rejects password shorter than 6 characters', async () => {
    const { onSubmit, user } = setup();
    await fillAndSubmit(user, 'staff@gmail.com', 'a@1');

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('rejects password without a special character', async () => {
    const { onSubmit, user } = setup();
    await fillAndSubmit(user, 'staff@gmail.com', 'abcdef');

    expect(
      screen.getByText('Password must contain at least one special character'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submits when input is valid', async () => {
    const { onSubmit, user } = setup();
    await fillAndSubmit(user, 'staff@gmail.com', 'abc@123');

    expect(onSubmit).toHaveBeenCalledWith({ username: 'staff@gmail.com', password: 'abc@123' });
  });

  test('shows the password rule hint', () => {
    setup();
    expect(
      screen.getByText('At least 6 characters, including one special character.'),
    ).toBeInTheDocument();
  });

  test('clears the form after success when resetOnSuccess is set', async () => {
    const { user } = setup({ resetOnSuccess: true });
    await fillAndSubmit(user, 'staff@gmail.com', 'abc@123');

    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  test('shows server error message when submit fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Username already exists'));
    render(<CredentialsForm submitLabel="Submit" onSubmit={onSubmit} />);
    await fillAndSubmit(userEvent.setup(), 'staff@gmail.com', 'abc@123');

    expect(await screen.findByRole('alert')).toHaveTextContent('Username already exists');
  });
});

describe('CredentialsForm (login settings)', () => {
  test('accepts a non-gmail email such as the seeded admin', async () => {
    const { onSubmit, user } = setup(loginProps);
    await fillAndSubmit(user, 'admin@hotel.com', '123456@');

    expect(onSubmit).toHaveBeenCalledWith({ username: 'admin@hotel.com', password: '123456@' });
  });

  test('still rejects password without a special character', async () => {
    const { onSubmit, user } = setup(loginProps);
    await fillAndSubmit(user, 'admin@hotel.com', 'abcdef');

    expect(
      screen.getByText('Password must contain at least one special character'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('does not show the new-password hint', () => {
    setup(loginProps);
    expect(screen.queryByText(/including one special character/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('placeholder', 'Enter your password');
  });

  test('shows server error message for wrong credentials', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Invalid username or password'));
    render(<CredentialsForm submitLabel="Submit" onSubmit={onSubmit} {...loginProps} />);
    await fillAndSubmit(userEvent.setup(), 'admin@hotel.com', 'wrong@123');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
  });
});

describe('CredentialsForm password visibility', () => {
  test('toggles between hidden and visible', async () => {
    const { user } = setup();
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });
});
