import { useEffect, useState } from 'react';
import { notificationsApi } from '../api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    notificationsApi.list().then((r) => setNotifications(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Notifications</h2>
        {notifications.some((n) => !n.isRead) && (
          <button style={styles.btn} onClick={markAllRead}>Mark all as read</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No notifications.</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} style={{ ...styles.item, background: n.isRead ? '#fff' : '#eff6ff' }}>
            <div style={styles.msg}>{n.message}</div>
            <div style={styles.time}>{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 32, maxWidth: 720, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  btn: { padding: '6px 14px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: 13 },
  item: { border: '1px solid #e5e7eb', borderRadius: 6, padding: '12px 16px', marginBottom: 8 },
  msg: { fontSize: 14 },
  time: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
};
