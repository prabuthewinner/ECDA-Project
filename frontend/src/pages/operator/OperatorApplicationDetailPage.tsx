import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { applicationsApi, documentsApi } from '../../api';

const RESUBMIT_STATUSES = ['PENDING_PRE_SITE_RESUBMISSION', 'PENDING_POST_SITE_RESUBMISSION'];

export default function OperatorApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resubmitData, setResubmitData] = useState<Record<string, Record<string, string>>>({});
  const [uploading, setUploading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const load = async () => {
    if (!id) return;
    const [appRes, docsRes, roundsRes] = await Promise.all([
      applicationsApi.get(id),
      documentsApi.list(id),
      applicationsApi.getRounds(id),
    ]);
    setApp(appRes.data);
    setDocuments(docsRes.data);
    setRounds(roundsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const onDrop = useCallback(async (files: File[]) => {
    if (!id || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        await documentsApi.upload(id, file, 'general');
      }
      const docsRes = await documentsApi.list(id);
      setDocuments(docsRes.data);
    } finally {
      setUploading(false);
    }
  }, [id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleResubmit = async () => {
    if (!id) return;
    try {
      await applicationsApi.resubmit(id, resubmitData);
      setSubmitMsg('Resubmission successful!');
      load();
    } catch (e: any) {
      setSubmitMsg(e?.response?.data?.message ?? 'Resubmission failed');
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!app) return <div style={{ padding: 32 }}>Application not found</div>;

  const canResubmit = RESUBMIT_STATUSES.includes(app.status);
  const flaggedSections = app.sections?.filter((s: any) => s.isFlagged) ?? [];
  const officerFeedbacks: any[] = app.feedbacks ?? [];

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Application Detail</h2>
          <p style={styles.sub}>ID: {app.id}</p>
        </div>
        <span style={{ ...styles.badge, background: '#dbeafe', color: '#1e3a5f' }}>
          {app.statusLabel}
        </span>
      </div>

      {/* Officer feedback banner */}
      {officerFeedbacks.length > 0 && (
        <div style={styles.feedbackBanner}>
          <strong>Officer Feedback (Round {app.round}):</strong>
          {officerFeedbacks.filter((f) => f.round === app.round).map((f) => (
            <div key={f.id} style={styles.feedbackItem}>
              {f.sectionKey && <span style={styles.feedbackSection}>[{f.sectionKey}]</span>} {f.comment}
            </div>
          ))}
        </div>
      )}

      {/* Resubmission form */}
      {canResubmit && (
        <div style={styles.resubmitBox}>
          <h3 style={{ marginTop: 0 }}>Update Flagged Sections</h3>
          <p style={{ color: '#6b7280', fontSize: 13 }}>Only flagged sections need to be updated.</p>
          {flaggedSections.map((section: any) => (
            <div key={section.sectionKey} style={styles.flaggedSection}>
              <h4 style={{ margin: '0 0 10px', color: '#b45309' }}>⚠ {section.sectionKey}</h4>
              {Object.keys(section.data as object).map((field) => (
                <div key={field}>
                  <label style={styles.label}>{formatLabel(field)}</label>
                  <input
                    style={styles.input}
                    defaultValue={(section.data as any)[field]}
                    onChange={(e) =>
                      setResubmitData((prev) => ({
                        ...prev,
                        [section.sectionKey]: { ...prev[section.sectionKey], [field]: e.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          ))}
          {submitMsg && <div style={styles.msg}>{submitMsg}</div>}
          <button style={styles.resubmitBtn} onClick={handleResubmit}>Submit Resubmission</button>
        </div>
      )}

      {/* Documents */}
      <div style={styles.section}>
        <h3>Documents</h3>
        <div {...getRootProps()} style={{ ...styles.dropzone, background: isDragActive ? '#eff6ff' : '#f9fafb' }}>
          <input {...getInputProps()} />
          {isDragActive ? <p>Drop files here...</p> : <p>Drag & drop files here, or click to select (PDF, JPG, PNG, DOCX — max 10MB)</p>}
          {uploading && <p style={{ color: '#1a56db' }}>Uploading...</p>}
        </div>
        {documents.length > 0 && (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>File</th><th style={styles.th}>Section</th><th style={styles.th}>Verification</th></tr></thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td style={styles.td}><a href={d.fileUrl} target="_blank" rel="noreferrer">{d.fileName}</a></td>
                  <td style={styles.td}>{d.sectionKey}</td>
                  <td style={styles.td}><VerificationBadge status={d.verificationStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Submission history */}
      {rounds.length > 1 && (
        <div style={styles.section}>
          <h3>Submission History</h3>
          {rounds.map((r) => (
            <div key={r.id} style={styles.round}>
              <strong>Round {r.round}</strong> — {new Date(r.submittedAt).toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const color = status === 'VERIFIED' ? '#065f46' : status === 'FAILED' ? '#7f1d1d' : '#374151';
  const bg = status === 'VERIFIED' ? '#d1fae5' : status === 'FAILED' ? '#fee2e2' : '#f3f4f6';
  return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, color, background: bg }}>{status}</span>;
}

function formatLabel(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 32, maxWidth: 860, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  sub: { margin: '4px 0 0', fontSize: 12, color: '#6b7280' },
  badge: { padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  feedbackBanner: { background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 6, padding: '14px 18px', marginBottom: 20 },
  feedbackItem: { marginTop: 8, fontSize: 14 },
  feedbackSection: { fontWeight: 700, color: '#b45309', marginRight: 6 },
  resubmitBox: { background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: 20, marginBottom: 24 },
  flaggedSection: { marginBottom: 16, padding: 14, background: '#fff', border: '1px solid #fbbf24', borderRadius: 4 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginTop: 10, marginBottom: 3 },
  input: { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  msg: { marginTop: 12, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, fontSize: 13 },
  resubmitBtn: { marginTop: 16, padding: '9px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  section: { marginTop: 28 },
  dropzone: { border: '2px dashed #d1d5db', borderRadius: 6, padding: 24, textAlign: 'center', cursor: 'pointer', marginBottom: 14 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontSize: 12, color: '#374151', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 13 },
  round: { padding: '8px 12px', background: '#f9fafb', borderRadius: 4, marginBottom: 6, fontSize: 13 },
};
