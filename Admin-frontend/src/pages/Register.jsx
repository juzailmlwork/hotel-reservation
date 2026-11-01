import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import CredentialsForm from '../components/CredentialsForm';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleRegister(values) {
    await register(values);
    navigate('/');
  }

  return (
    <div className="card">
      <h1>Register</h1>
      <CredentialsForm submitLabel="Register" onSubmit={handleRegister} />
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
