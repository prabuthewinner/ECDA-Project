import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.loginOperator(form);
      login(res.data.accessToken, res.data.user);
      navigate(res.data.user.role === 'OFFICER' ? '/officer/applications' : '/operator/applications');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>
        <p style={styles.sub}>ECDA Regulatory & Licensing Platform</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          No account? <Link to="/register">Register</Link>
        </p>
        <div style={styles.demo}>
          <strong>Demo accounts:</strong><br />
          Officer: officer@example.com / password123<br />
          Operator: operator@example.com / password123
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' },
  card: { background: '#fff', borderRadius: 8, padding: 32, width: 380, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 4px', fontSize: 22 },
  sub: { margin: '0 0 20px', color: '#6b7280', fontSize: 13 },
  error: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 12 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', marginTop: 20, padding: '10px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 4, fontSize: 15, cursor: 'pointer' },
  demo: { marginTop: 20, fontSize: 12, color: '#6b7280', background: '#f9fafb', padding: 10, borderRadius: 4, lineHeight: 1.8 },
};
