import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import CredentialsForm from '../components/CredentialsForm';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  function loadUsers() {
    api.listUsers().then((data) => setUsers(data.users)).catch(() => {});
  }

  useEffect(loadUsers, []);

  async function handleCreate(values) {
    setMessage('');
    const data = await api.createUser(values);
    setMessage(`User "${data.user.username}" created`);
    loadUsers();
  }

  return (
    <div className="card wide">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div>
          <span>Signed in as {user.username}</span>{' '}
          <button className="link" onClick={logout}>Logout</button>
        </div>
      </div>

      <h2>Create new user</h2>
      <CredentialsForm submitLabel="Create user" onSubmit={handleCreate} resetOnSuccess />
      {message && <p className="success">{message}</p>}

      <h2>Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.username}</li>
        ))}
      </ul>
    </div>
  );
}
