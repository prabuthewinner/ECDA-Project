import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { applicationsApi, documentsApi } from '../../api';

const STATUS_OPTIONS = [
  'UNDER_REVIEW',
  'PENDING_PRE_SITE_RESUBMISSION',
  'SITE_VISIT_SCHEDULED',
  'SITE_VISIT_DONE',
  'AWAITING_POST_SITE_CLARIFICATION',
  'PENDING_POST_SITE_RESUBMISSION',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
];

export default function OfficerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback form state
  const [fbSection, setFbSection] = useState('');
  const [fbComment, setFbComment] = useState('');
  const [fbTemplateId, setFbTemplateId] = useState('');
  const [fbMsg, setFbMsg] = useState('');

  // Status form state
  const [newStatus, setNewStatus] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'details' | 'feedback' | 'history'>('details');

  const load = async () => {
    if (!id) return;
    const [appRes, docsRes, roundsRes, tplRes] = await Promise.all([
      applicationsApi.get(id),
      documentsApi.list(id),
      applicationsApi.getRounds(id),
      applicationsApi.getTemplates(),
    ]);
    setApp(appRes.data);
    setDocuments(docsRes.data);
    setRounds(roundsRes.data);
    setTemplates(tplRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleAddFeedback = async () => {
    if (!id || !fbComment.trim()) return;
    try {
      await applicationsApi.addFeedback(id, {
        comment: fbComment,
        sectionKey: fbSection || undefined,
        templateId: fbTemplateId || undefined,
      });
      setFbMsg('Feedback added successfully');
      setFbComment('');
      setFbSection('');
      setFbTemplateId('');
      load();
    } catch {
      setFbMsg('Failed to add feedback');
    }
  };

  const handleUpdateStatus = async () => {
    if (!id || !newStatus) return;
    try {
      await applicationsApi.updateStatus(id, newStatus);
      setStatusMsg('Status updated');
      setNewStatus('');
      load();
    } catch (e: any) {
      setStatusMsg(e?.response?.data?.message ?? 'Invalid status transition');
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!app) return <div style={{ padding: 32 }}>Application not found</div>;

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Review Application</h2>
          <p style={styles.sub}>Operator: {app.operator?.name} ({app.operator?.email})</p>
        </div>
        <span style={styles.badge}>{app.statusLabel}</span>
      </div>

      {/* Status update */}
      <div style={styles.statusBox}>
        <strong style={{ fontSize: 14 }}>Update Status:</strong>
        <select style={styles.select} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          <option value="">— Select new status —</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <button style={styles.updateBtn} onClick={handleUpdateStatus} disabled={!newStatus}>Update</button>
        {statusMsg && <span style={{ marginLeft: 12, fontSize: 13, color: '#059669' }}>{statusMsg}</span>}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['details', 'feedback', 'history'] as const).map((t) => (
          <button key={t} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {activeTab === 'details' && (
        <div>
          <h3>Application Sections</h3>
          {app.sections?.map((section: any) => (
            <div key={section.sectionKey} style={{ ...styles.sectionCard, ...(section.isFlagged ? styles.flagged : {}) }}>
              <h4 style={{ margin: '0 0 10px' }}>
                {section.sectionKey} {section.isFlagged && <span style={styles.flagTag}>⚠ Flagged</span>}
                {section.isUpdated && <span style={styles.updatedTag}>↑ Updated</span>}
              </h4>
              <table style={styles.dataTable}>
                <tbody>
                  {Object.entries(section.data as object).map(([k, v]) => (
                    <tr key={k}>
                      <td style={styles.dataKey}>{formatLabel(k)}</td>
                      <td style={styles.dataVal}>{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <h3>Documents</h3>
          {documents.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No documents uploaded.</p>
          ) : (
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>File</th><th style={styles.th}>Section</th><th style={styles.th}>Verification</th><th style={styles.th}>Flagged</th></tr></thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td style={styles.td}><a href={d.fileUrl} target="_blank" rel="noreferrer">{d.fileName}</a></td>
                    <td style={styles.td}>{d.sectionKey}</td>
                    <td style={styles.td}>{d.verificationStatus}</td>
                    <td style={styles.td}>{d.isFlagged ? '⚠' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Feedback tab */}
      {activeTab === 'feedback' && (
        <div>
          <h3>Add Feedback</h3>
          <div style={styles.fbForm}>
            <label style={styles.label}>Section (optional)</label>
            <input style={styles.input} placeholder="e.g. business_details" value={fbSection} onChange={(e) => setFbSection(e.target.value)} />

            <label style={styles.label}>Template (optional)</label>
            <select style={styles.select} value={fbTemplateId} onChange={(e) => {
              setFbTemplateId(e.target.value);
              const tpl = templates.find((t) => t.id === e.target.value);
              if (tpl) setFbComment(tpl.text);
            }}>
              <option value="">— Use a template —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>[{t.sectionKey ?? 'general'}] {t.text.slice(0, 60)}</option>)}
            </select>

            <label style={styles.label}>Comment</label>
            <textarea style={styles.textarea} rows={3} value={fbComment} onChange={(e) => setFbComment(e.target.value)} placeholder="Write specific feedback..." />

            {fbMsg && <div style={{ fontSize: 13, color: '#059669', marginTop: 8 }}>{fbMsg}</div>}
            <button style={styles.addFbBtn} onClick={handleAddFeedback} disabled={!fbComment.trim()}>Add Feedback</button>
          </div>

          <h3 style={{ marginTop: 28 }}>All Feedback</h3>
          {app.feedbacks?.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No feedback added yet.</p>
          ) : (
            app.feedbacks?.map((f: any) => (
              <div key={f.id} style={styles.fbItem}>
                <div style={styles.fbMeta}>
                  Round {f.round} · {f.officer?.name} · {new Date(f.createdAt).toLocaleString()}
                  {f.sectionKey && <span style={styles.fbTag}>{f.sectionKey}</span>}
                </div>
                <p style={{ margin: '6px 0 0' }}>{f.comment}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div>
          <h3>Submission Rounds</h3>
          {rounds.map((r, i) => (
            <div key={r.id} style={styles.roundCard}>
              <div style={styles.roundHeader}>
                <strong>Round {r.round}</strong>
                <span>{new Date(r.submittedAt).toLocaleString()}</span>
              </div>
              {i > 0 && rounds[i - 1] && (
                <div style={styles.diffNote}>
                  Changes detected vs Round {r.round - 1} — see sections marked "Updated" in the Details tab.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatLabel(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 32, maxWidth: 960, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sub: { margin: '4px 0 0', fontSize: 13, color: '#6b7280' },
  badge: { padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: '#dbeafe', color: '#1e3a5f' },
  statusBox: { display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '12px 16px', marginBottom: 20 },
  select: { padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14 },
  updateBtn: { padding: '7px 16px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 },
  tabs: { display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 20 },
  tab: { padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: '#1a56db', borderBottomColor: '#1a56db', fontWeight: 600 },
  sectionCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: 16, marginBottom: 14 },
  flagged: { borderColor: '#fbbf24', background: '#fffbeb' },
  flagTag: { fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, marginLeft: 8 },
  updatedTag: { fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: 4, marginLeft: 6 },
  dataTable: { width: '100%', borderCollapse: 'collapse' },
  dataKey: { fontSize: 13, color: '#6b7280', padding: '3px 12px 3px 0', width: '35%' },
  dataVal: { fontSize: 13, color: '#111827', padding: '3px 0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontSize: 12, color: '#374151', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 13 },
  fbForm: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 12 },
  input: { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' },
  addFbBtn: { marginTop: 14, padding: '8px 18px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  fbItem: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '12px 16px', marginBottom: 10 },
  fbMeta: { fontSize: 12, color: '#9ca3af', display: 'flex', gap: 10, alignItems: 'center' },
  fbTag: { background: '#dbeafe', color: '#1e40af', padding: '1px 7px', borderRadius: 10, fontSize: 11 },
  roundCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '14px 18px', marginBottom: 10 },
  roundHeader: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  diffNote: { marginTop: 8, fontSize: 12, color: '#6b7280', fontStyle: 'italic' },
};
