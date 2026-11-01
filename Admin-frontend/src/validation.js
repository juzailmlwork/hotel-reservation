export const MIN_PASSWORD_LENGTH = 6;
const SPECIAL_CHAR = /[^A-Za-z0-9]/;

// requireSpecialChar is turned off for login so existing accounts can still sign in.
export function validateCredentials({ username, password }, { requireSpecialChar = true } = {}) {
  const errors = {};

  if (!username || username.trim() === '') {
    errors.username = 'Username is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  } else if (requireSpecialChar && !SPECIAL_CHAR.test(password)) {
    errors.password = 'Password must contain at least one special character';
  }

  return errors;
}
