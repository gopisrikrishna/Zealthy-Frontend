import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCard from '../../../shared/components/SectionCard';
import {
  getToken,
  patientApi,
  setAuthSession,
} from '../../../services';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 4a4 4 0 100-8 4 4 0 000 8z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M3 4.5l16.5 16.5-1.5 1.5-3.1-3.1A11.9 11.9 0 0112 19c-6.5 0-10-7-10-7a20 20 0 014.6-5.6L1.5 6 3 4.5zm7.1 7.1l2.8 2.8a2 2 0 01-2.8-2.8zM12 5c6.5 0 10 7 10 7a19.5 19.5 0 01-3.4 4.5l-2.2-2.2A4 4 0 009.7 8.4L8.1 6.8A11.8 11.8 0 0112 5z"
        fill="currentColor"
      />
    </svg>
  );
}

function PatientLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (getToken()) {
      navigate('/portal');
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await patientApi.login(form);
      setAuthSession(data?.token, data?.user);
      navigate('/portal');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <SectionCard title="Patient Login">
        <form className="simple-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
            <button
              type="button"
              className="icon-button btn-secondary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((value) => !value)}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </SectionCard>
    </div>
  );
}

export default PatientLoginPage;
