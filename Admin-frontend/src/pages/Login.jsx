import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AuthLayout from '../components/AuthLayout';
import CredentialsForm from '../components/CredentialsForm';

export default function Login() {
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(values) {
    await login(values);
    navigate('/');
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to the admin dashboard."
      footer={
        <>
          Don't have an account? <Link to="/register">Create one</Link>
        </>
      }
    >
      {sessionExpired && (
        <p className="notice" role="status">
          Your session has expired. Please sign in again.
        </p>
      )}
      <CredentialsForm
        submitLabel="Login"
        onSubmit={handleLogin}
        newPassword={false}
        requireGmail={false}
      />
    </AuthLayout>
  );
}
