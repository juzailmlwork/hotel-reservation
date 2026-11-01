import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import CredentialsForm from '../components/CredentialsForm';
import { CalendarIcon, CheckIcon, HotelIcon, LogoutIcon, UserPlusIcon, UsersIcon } from '../components/Icons';

function initials(name) {
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isToday(iso) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

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

  const sortedUsers = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <HotelIcon size={20} />
          </span>
          <span>Hotel Admin</span>
        </div>
        <div className="topbar-user">
          <span className="avatar">{initials(user.username)}</span>
          <span className="topbar-name">{user.username}</span>
          <button className="btn-ghost" onClick={logout}>
            <LogoutIcon size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="content">
        <div className="page-head">
          <h1>Dashboard</h1>
          <p className="muted">Manage who can access the admin panel.</p>
        </div>

        <section className="stats">
          <div className="stat">
            <span className="stat-icon">
              <UsersIcon />
            </span>
            <div>
              <p className="stat-label">Total users</p>
              <p className="stat-value">{users.length}</p>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon">
              <UserPlusIcon />
            </span>
            <div>
              <p className="stat-label">Added today</p>
              <p className="stat-value">{users.filter((u) => isToday(u.createdAt)).length}</p>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon">
              <CalendarIcon />
            </span>
            <div>
              <p className="stat-label">Reservations</p>
              <p className="stat-value muted-value">Soon</p>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="panel">
            <h2>Create new user</h2>
            <p className="muted">New users can sign in to this dashboard straight away.</p>
            <CredentialsForm
              submitLabel="Create user"
              onSubmit={handleCreate}
              resetOnSuccess
              idPrefix="new-"
            />
            {message && (
              <p className="success">
                <CheckIcon size={16} /> {message}
              </p>
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Users</h2>
              <span className="badge">{users.length}</span>
            </div>
            <ul className="user-list">
              {sortedUsers.map((u) => (
                <li key={u.id}>
                  <span className="avatar">{initials(u.username)}</span>
                  <div className="user-meta">
                    <span className="user-name">{u.username}</span>
                    <span className="user-date">Added {formatDate(u.createdAt)}</span>
                  </div>
                  {u.username === user.username && <span className="badge badge-you">You</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
