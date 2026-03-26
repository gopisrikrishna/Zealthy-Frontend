import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionCard from '../../../shared/components/SectionCard';
import { getStoredUser, getToken, patientApi } from '../../../services';

function paginate(items, page, perPage) {
  const safePerPage = Number(perPage) || 1;
  const safePage = Math.max(1, Number(page) || 1);
  const start = (safePage - 1) * safePerPage;
  return items.slice(start, start + safePerPage);
}

function totalPages(itemsLength, perPage) {
  return Math.max(1, Math.ceil(itemsLength / (Number(perPage) || 1)));
}

function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const token = getToken();
  const user = getStoredUser();

  const pages = totalPages(appointments.length, perPage);
  const rows = useMemo(() => paginate(appointments, page, perPage), [appointments, page, perPage]);

  useEffect(() => {
    if (!token || !user?.id) {
      navigate('/');
      return;
    }

    loadAppointments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1);
  }, [appointments]);

  async function loadAppointments() {
    setLoading(true);
    setError('');

    try {
      const data = await patientApi.listAppointments(user.id, token);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Appointments (next 3 months)"
      actions={
        <Link to="/portal" className="link-button btn-secondary">
          Back to profile
        </Link>
      }
    >
      <button onClick={loadAppointments} disabled={loading || !user?.id || !token}>
        {loading ? 'Loading...' : 'Reload appointments'}
      </button>
      {error && <p className="error-text">{error}</p>}

      <table className="basic-table top-gap">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Provider</th>
            <th>Scheduled for</th>
            <th>Recurring</th>
            <th>Basis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((appointment, index) => {
            const serialNumber = (page - 1) * perPage + index + 1;
            return (
              <tr key={`${appointment.id}-${appointment.datetime}`}>
                <td>{serialNumber}</td>
                <td>{appointment.providerName}</td>
                <td>{appointment.datetime}</td>
                <td>{appointment.isRecurring ? 'Yes' : 'No'}</td>
                <td>{appointment.repeat || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {appointments.length > 0 && (
        <div className="pagination-row">
          <div className="pagination-meta">
            <span>Per page</span>
            <select
              value={perPage}
              onChange={(event) => {
                setPerPage(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="pagination-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span>{page} / {pages}</span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export default PatientAppointmentsPage;
