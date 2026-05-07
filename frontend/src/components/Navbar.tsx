import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, logout, isOfficer, isOperator } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    notificationsApi.list().then((r) => {
      setUnread(r.data.filter((n: { isRead: boolean }) => !n.isRead).length);
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/" style={styles.brandLink}>ECDA Licensing</Link>
      </div>
      {user && (
        <div style={styles.links}>
          {isOfficer && (
            <Link to="/officer/applications" style={styles.link}>Applications</Link>
          )}
          {isOperator && (
            <>
              <Link to="/operator/applications" style={styles.link}>My Applications</Link>
              <Link to="/operator/apply" style={styles.link}>New Application</Link>
            </>
          )}
          <Link to="/notifications" style={styles.link}>
            Notifications {unread > 0 && <span style={styles.badge}>{unread}</span>}
          </Link>
          <span style={styles.user}>{user.email} ({user.role})</span>
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#1a56db', color: '#fff' },
  brand: { fontWeight: 700, fontSize: 18 },
  brandLink: { color: '#fff', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: 16 },
  link: { color: '#fff', textDecoration: 'none', fontSize: 14 },
  user: { fontSize: 13, opacity: 0.8 },
  btn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' },
  badge: { background: '#e02424', borderRadius: 10, padding: '1px 6px', fontSize: 11, marginLeft: 4 },
};
