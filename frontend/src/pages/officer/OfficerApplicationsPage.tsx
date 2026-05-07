import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../api';

export default function OfficerApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    applicationsApi.list().then((r) => setApps(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? apps.filter((a) => a.status === filter || a.statusLabel.toLowerCase().includes(filter.toLowerCase()))
    : apps;

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>All Applications</h2>
        <input
          style={styles.search}
          placeholder="Filter by status..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Operator</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Round</th>
            <th style={styles.th}>Submitted</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((app) => (
            <tr key={app.id}>
              <td style={styles.td}>{app.id.slice(0, 8)}...</td>
              <td style={styles.td}>{app.operator?.name ?? '-'}</td>
              <td style={styles.td}>
                <span style={styles.badge}>{app.statusLabel}</span>
              </td>
              <td style={styles.td}>Round {app.round}</td>
              <td style={styles.td}>{new Date(app.createdAt).toLocaleDateString()}</td>
              <td style={styles.td}>
                <Link to={`/officer/applications/${app.id}`} style={styles.link}>Review →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <div style={styles.empty}>No applications found.</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 32, maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  search: { padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, width: 240 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', borderBottom: '2px solid #e5e7eb', fontSize: 13, color: '#374151', fontWeight: 600 },
  td: { padding: '12px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 14 },
  badge: { padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#dbeafe', color: '#1e3a5f' },
  link: { color: '#1a56db', textDecoration: 'none', fontSize: 13 },
  empty: { textAlign: 'center', color: '#6b7280', padding: 32 },
};
