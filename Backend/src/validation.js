const MIN_PASSWORD_LENGTH = 6;

function validateCredentials({ username, password } = {}) {
  const errors = {};

  if (typeof username !== 'string' || username.trim() === '') {
    errors.username = 'Username is required';
  }

  if (typeof password !== 'string' || password === '') {
    errors.password = 'Password is required';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return errors;
}

module.exports = { validateCredentials, MIN_PASSWORD_LENGTH };
