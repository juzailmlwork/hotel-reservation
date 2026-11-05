import { CalendarIcon, HotelIcon, UsersIcon } from './Icons';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-brand">
        <div className="brand">
          <span className="brand-mark">
            <HotelIcon size={22} />
          </span>
          <span>Hotel Admin</span>
        </div>

        <div className="auth-brand-copy">
          <h2>Run your hotel from one place.</h2>
          <p>Manage staff accounts today, with reservations, rooms and guests coming next.</p>
          <ul>
            <li>
              <UsersIcon /> Staff &amp; admin accounts
            </li>
            <li>
              <CalendarIcon /> Reservations (coming soon)
            </li>
          </ul>
        </div>

        <p className="auth-brand-foot">© {new Date().getFullYear()} Hotel Reservation System</p>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}
