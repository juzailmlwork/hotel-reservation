import { useState } from 'react';
import { validateCredentials } from '../validation';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from './Icons';

export default function CredentialsForm({
  submitLabel,
  onSubmit,
  resetOnSuccess = false,
  requireSpecialChar = true,
  requireGmail = true,
  idPrefix = '',
}) {
  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const usernameId = `${idPrefix}username`;
  const passwordId = `${idPrefix}password`;

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateCredentials(values, { requireSpecialChar, requireGmail });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
      if (resetOnSuccess) setValues({ username: '', password: '' });
    } catch (err) {
      setServerError(err.message);
      if (err.errors) setErrors(err.errors);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={usernameId}>Email</label>
        <div className={`input-wrap${errors.username ? ' has-error' : ''}`}>
          <MailIcon />
          <input
            id={usernameId}
            name="username"
            type="email"
            autoComplete="username"
            placeholder={requireGmail ? 'name@gmail.com' : 'you@example.com'}
            value={values.username}
            onChange={handleChange}
          />
        </div>
        {errors.username && <p className="error">{errors.username}</p>}
      </div>

      <div className="field">
        <label htmlFor={passwordId}>Password</label>
        <div className={`input-wrap${errors.password ? ' has-error' : ''}`}>
          <LockIcon />
          <input
            id={passwordId}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={requireSpecialChar ? 'new-password' : 'current-password'}
            placeholder={requireSpecialChar ? 'Create a password' : 'Enter your password'}
            value={values.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="icon-btn"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password ? (
          <p className="error">{errors.password}</p>
        ) : (
          requireSpecialChar && (
            <p className="hint">At least 6 characters, including one special character.</p>
          )
        )}
      </div>

      {serverError && (
        <p className="alert" role="alert">
          {serverError}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Please wait...' : submitLabel}
      </button>
    </form>
  );
}
