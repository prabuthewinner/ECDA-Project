import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsApi } from '../../api';

const SECTIONS = [
  { key: 'business_details', label: 'Business Details', fields: ['businessName', 'registrationNumber', 'businessType', 'businessAddress'] },
  { key: 'owner_info', label: 'Owner / Director Info', fields: ['ownerName', 'nric', 'contactNumber', 'email'] },
  { key: 'premises_info', label: 'Premises Information', fields: ['premisesAddress', 'premisesType', 'floorArea', 'operatingHours'] },
  { key: 'licence_details', label: 'Licence Details', fields: ['licenceType', 'intendedStartDate', 'previousLicenceNumber'] },
];

export default function NewApplicationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const section = SECTIONS[step];

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [section.key]: { ...prev[section.key], [field]: value },
    }));
  };

  const handleNext = () => {
    if (step < SECTIONS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await applicationsApi.create(data);
      navigate(`/operator/applications/${res.data.id}`);
    } catch {
      setError('Submission failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = Math.round(((step + 1) / SECTIONS.length) * 100);

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>New Licence Application</h2>

      {/* Progress bar */}
      <div style={styles.progressWrap}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>
      <div style={styles.steps}>
        {SECTIONS.map((s, i) => (
          <div key={s.key} style={{ ...styles.stepItem, fontWeight: i === step ? 700 : 400, color: i === step ? '#1a56db' : i < step ? '#059669' : '#9ca3af' }}>
            {i < step ? '✓ ' : ''}{s.label}
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>{section.label}</h3>
        {section.fields.map((field) => (
          <div key={field}>
            <label style={styles.label}>{formatLabel(field)}</label>
            <input
              style={styles.input}
              value={data[section.key]?.[field] ?? ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={formatLabel(field)}
            />
          </div>
        ))}

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.btnRow}>
          {step > 0 && (
            <button style={styles.backBtn} onClick={handleBack}>← Back</button>
          )}
          {step < SECTIONS.length - 1 ? (
            <button style={styles.nextBtn} onClick={handleNext}>Next →</button>
          ) : (
            <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatLabel(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 32, maxWidth: 680, margin: '0 auto' },
  title: { marginBottom: 16 },
  progressWrap: { background: '#e5e7eb', borderRadius: 4, height: 6, marginBottom: 12 },
  progressBar: { background: '#1a56db', height: 6, borderRadius: 4, transition: 'width 0.3s' },
  steps: { display: 'flex', gap: 24, marginBottom: 24, fontSize: 13 },
  stepItem: {},
  card: { background: '#fff', borderRadius: 8, padding: 28, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' },
  sectionTitle: { marginTop: 0, marginBottom: 20, fontSize: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginTop: 14, marginBottom: 4 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  error: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '8px 12px', borderRadius: 4, marginTop: 16, fontSize: 13 },
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  backBtn: { padding: '9px 20px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer' },
  nextBtn: { padding: '9px 20px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  submitBtn: { padding: '9px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
};
