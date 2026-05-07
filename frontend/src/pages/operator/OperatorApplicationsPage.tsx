import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../api';

interface Application {
  id: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  round: number;
}

export default function OperatorApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.list().then((r) => setApps(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.wrap}>Loading...</div>;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Applications</h2>
        <Link to="/operator/apply" style={styles.newBtn}>+ New Application</Link>
      </div>

      {apps.length === 0 ? (
        <div style={styles.empty}>
          No applications yet. <Link to="/operator/apply">Submit your first application →</Link>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Application ID</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Round</th>
              <th style={styles.th}>Last Updated</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id}>
                <td style={styles.td}>{app.id.slice(0, 8)}...</td>
                <td style={styles.td}>
                  <StatusBadge label={app.statusLabel} status={app.status} />
                </td>
                <td style={styles.td}>Round {app.round}</td>
                <td style={styles.td}>{new Date(app.updatedAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <Link to={`/operator/applications/${app.id}`} style={styles.viewLink}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  const color =
    status === 'APPROVED' ? '#065f46' :
    status === 'REJECTED' ? '#7f1d1d' :
    status.includes('RESUBMISSION') ? '#78350f' : '#1e3a5f';
  const bg =
    status === 'APPROVED' ? '#d1fae5' :
    status === 'REJECTED' ? '#fee2e2' :
    status.includes('RESUBMISSION') ? '#fef3c7' : '#dbeafe';
  return (
    <span style={{ ...styles.badge, color, background: bg }}>{label}</span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 32, maxWidth: 1000, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { margin: 0, fontSize: 22 },
  newBtn: { background: '#1a56db', color: '#fff', padding: '8px 16px', borderRadius: 4, textDecoration: 'none', fontSize: 14 },
  empty: { color: '#6b7280', padding: 32, textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', borderBottom: '2px solid #e5e7eb', fontSize: 13, color: '#374151', fontWeight: 600 },
  td: { padding: '12px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 14 },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  viewLink: { color: '#1a56db', textDecoration: 'none', fontSize: 13 },
};
