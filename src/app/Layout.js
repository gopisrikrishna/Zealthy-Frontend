import { Link, Outlet, useLocation } from 'react-router-dom';

const TITLES = {
  '/': 'Patient Login',
  '/portal': 'Patient Portal Summary',
  '/portal/appointments': 'Patient Appointments',
  '/portal/prescriptions': 'Patient Prescriptions',
  '/admin': 'Mini EMR - Users',
};

function Layout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Zealthy';

  return (
    <div className="app-shell">
      <header className="top-nav">
        <h1>{title}</h1>
        <nav>
          <Link to="/">Patient Login</Link>
          <Link to="/portal">Portal</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

