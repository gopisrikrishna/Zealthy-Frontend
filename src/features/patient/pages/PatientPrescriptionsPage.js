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

function PatientPrescriptionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const token = getToken();
  const user = getStoredUser();

  const pages = totalPages(prescriptions.length, perPage);
  const rows = useMemo(() => paginate(prescriptions, page, perPage), [prescriptions, page, perPage]);

  useEffect(() => {
    if (!token || !user?.id) {
      navigate('/');
      return;
    }

    loadPrescriptions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1);
  }, [prescriptions]);

  async function loadPrescriptions() {
    setLoading(true);
    setError('');

    try {
      const data = await patientApi.listPrescriptions(user.id, token);
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Prescriptions (next 3 months)"
      actions={
        <Link to="/portal" className="link-button btn-secondary">
          Back to profile
        </Link>
      }
    >
      <button onClick={loadPrescriptions} disabled={loading || !user?.id || !token}>
        {loading ? 'Loading...' : 'Reload prescriptions'}
      </button>
      {error && <p className="error-text">{error}</p>}

      <table className="basic-table top-gap">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Quantity</th>
            <th>Scheduled refill date</th>
            <th>Recurring</th>
            <th>Basis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((prescription, index) => {
            const serialNumber = (page - 1) * perPage + index + 1;
            return (
              <tr key={`${prescription.id}-${prescription.refillOn}`}>
                <td>{serialNumber}</td>
                <td>{prescription.medicationName}</td>
                <td>{prescription.dosageValue}</td>
                <td>{prescription.quantity}</td>
                <td>{prescription.refillOn || '-'}</td>
                <td>{prescription.isRecurring ? 'Yes' : 'No'}</td>
                <td>{prescription.refillSchedule || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {prescriptions.length > 0 && (
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

export default PatientPrescriptionsPage;

