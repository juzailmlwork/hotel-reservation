import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import CredentialsForm from '../components/CredentialsForm';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(values) {
    await login(values);
    navigate('/');
  }

  return (
    <div className="card">
      <h1>Admin Login</h1>
      <CredentialsForm submitLabel="Login" onSubmit={handleLogin} />
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
