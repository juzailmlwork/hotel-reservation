import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AuthLayout from '../components/AuthLayout';
import CredentialsForm from '../components/CredentialsForm';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleRegister(values) {
    await register(values);
    navigate('/');
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Use your Gmail address to get started."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <CredentialsForm submitLabel="Register" onSubmit={handleRegister} />
    </AuthLayout>
  );
}
