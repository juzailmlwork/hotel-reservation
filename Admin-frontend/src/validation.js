export const MIN_PASSWORD_LENGTH = 6;
const SPECIAL_CHAR = /[^A-Za-z0-9]/;
const GMAIL = /^[^\s@]+@gmail\.com$/i;

// The Gmail rule is turned off for login so existing accounts (e.g. admin@hotel.com) can still sign in.
export function validateCredentials(
  { username, password },
  { requireSpecialChar = true, requireGmail = true } = {},
) {
  const errors = {};

  if (!username || username.trim() === '') {
    errors.username = 'Email is required';
  } else if (requireGmail && !GMAIL.test(username.trim())) {
    errors.username = 'Email must be a @gmail.com address';
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
