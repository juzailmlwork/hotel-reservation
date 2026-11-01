import { useState } from 'react';
import { validateCredentials } from '../validation';

export default function CredentialsForm({ submitLabel, onSubmit, resetOnSuccess = false }) {
  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateCredentials(values);
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
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="username">Username</label>
      <input id="username" name="username" value={values.username} onChange={handleChange} />
      {errors.username && <p className="error">{errors.username}</p>}

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
      />
      {errors.password && <p className="error">{errors.password}</p>}

      {serverError && <p className="error" role="alert">{serverError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Please wait...' : submitLabel}
      </button>
    </form>
  );
}
