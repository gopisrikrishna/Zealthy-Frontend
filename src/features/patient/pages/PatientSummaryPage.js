import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionCard from '../../../shared/components/SectionCard';
import {
  clearAuthSession,
  getStoredUser,
  getToken,
  patientApi,
} from '../../../services';

function countFromSummary(summary, key) {
  const value = summary?.[key];
  return Array.isArray(value) ? value.length : 0;
}

function paginate(items, page, perPage) {
  const safePerPage = Number(perPage) || 1;
  const safePage = Math.max(1, Number(page) || 1);
  const start = (safePage - 1) * safePerPage;
  return items.slice(start, start + safePerPage);
}

function totalPages(itemsLength, perPage) {
  return Math.max(1, Math.ceil(itemsLength / (Number(perPage) || 1)));
}

function PatientSummaryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentPerPage, setAppointmentPerPage] = useState(3);
  const [refillPage, setRefillPage] = useState(1);
  const [refillPerPage, setRefillPerPage] = useState(3);

  const token = getToken();
  const user = getStoredUser();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    loadSummary();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSummary() {
    setLoading(true);
    setError('');

    try {
      const data = await patientApi.getSummary(token);
      setSummary(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuthSession();
    navigate('/');
  }

  const upcomingAppointments = useMemo(
    () => (Array.isArray(summary?.upcomingAppointments) ? summary.upcomingAppointments : []),
    [summary]
  );
  const upcomingRefills = useMemo(
    () => (Array.isArray(summary?.upcomingRefills) ? summary.upcomingRefills : []),
    [summary]
  );

  const appointmentPages = totalPages(upcomingAppointments.length, appointmentPerPage);
  const refillPages = totalPages(upcomingRefills.length, refillPerPage);

  const appointmentRows = useMemo(
    () => paginate(upcomingAppointments, appointmentPage, appointmentPerPage),
    [upcomingAppointments, appointmentPage, appointmentPerPage]
  );
  const refillRows = useMemo(
    () => paginate(upcomingRefills, refillPage, refillPerPage),
    [upcomingRefills, refillPage, refillPerPage]
  );

  useEffect(() => {
    setAppointmentPage(1);
    setRefillPage(1);
  }, [summary]);

  return (
    <div>
      <SectionCard
        title="Patient Portal"
        actions={<button onClick={logout}>Logout</button>}
      >
        <div className="record-grid">
          <div><strong>Name:</strong> {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '-'}</div>
          <div><strong>Email:</strong> {user?.email || '-'}</div>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <strong>{countFromSummary(summary, 'upcomingAppointments')}</strong>
            <span>Appointments in next 7 days</span>
          </div>
          <div className="stat-box">
            <strong>{countFromSummary(summary, 'upcomingRefills')}</strong>
            <span>Refills in next 7 days</span>
          </div>
        </div>

        <div className="quick-links">
          <Link to="/portal/appointments">View full appointments (3 months)</Link>
          <Link to="/portal/prescriptions">View all prescriptions (3 months)</Link>
        </div>

        <button onClick={loadSummary} disabled={loading}>
          {loading ? 'Loading summary...' : 'Refresh summary'}
        </button>

        {error && <p className="error-text">{error}</p>}
      </SectionCard>

      <SectionCard title="Upcoming appointments (next 7 days)">
        {appointmentRows.length > 0 ? (
          <>
            <table className="basic-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Date time</th>
                  <th>Basis</th>
                </tr>
              </thead>
              <tbody>
                {appointmentRows.map((appointment) => (
                  <tr key={`${appointment.id}-${appointment.datetime}`}>
                    <td>{appointment.providerName}</td>
                    <td>{appointment.datetime}</td>
                    <td>{appointment.repeat || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {upcomingAppointments.length > 5 && (
              <div className="pagination-row">
                <div className="pagination-meta">
                  <span>Per page</span>
                  <select
                    value={appointmentPerPage}
                    onChange={(event) => {
                      setAppointmentPerPage(Number(event.target.value));
                      setAppointmentPage(1);
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </div>
                <div className="pagination-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setAppointmentPage((p) => Math.max(1, p - 1))}
                    disabled={appointmentPage <= 1}
                  >
                    Prev
                  </button>
                  <span>{appointmentPage} / {appointmentPages}</span>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setAppointmentPage((p) => Math.min(appointmentPages, p + 1))}
                    disabled={appointmentPage >= appointmentPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="muted-text">No appointments in next 7 days.</p>
        )}
      </SectionCard>

      <SectionCard title="Upcoming refills (next 7 days)">
        {refillRows.length > 0 ? (
          <>
            <table className="basic-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Refill date</th>
                  <th>Basis</th>
                </tr>
              </thead>
              <tbody>
                {refillRows.map((prescription) => (
                  <tr key={`${prescription.id}-${prescription.refillOn}`}>
                    <td>{prescription.medicationName}</td>
                    <td>{prescription.dosageValue}</td>
                    <td>{prescription.refillOn || '-'}</td>
                    <td>{prescription.refillSchedule || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {upcomingRefills.length > 5 && (
              <div className="pagination-row">
                <div className="pagination-meta">
                  <span>Per page</span>
                  <select
                    value={refillPerPage}
                    onChange={(event) => {
                      setRefillPerPage(Number(event.target.value));
                      setRefillPage(1);
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </div>
                <div className="pagination-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setRefillPage((p) => Math.max(1, p - 1))}
                    disabled={refillPage <= 1}
                  >
                    Prev
                  </button>
                  <span>{refillPage} / {refillPages}</span>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setRefillPage((p) => Math.min(refillPages, p + 1))}
                    disabled={refillPage >= refillPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="muted-text">No refills in next 7 days.</p>
        )}
      </SectionCard>
    </div>
  );
}

export default PatientSummaryPage;

