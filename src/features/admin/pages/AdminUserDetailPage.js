import {useCallback, useEffect, useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import SectionCard from '../../../shared/components/SectionCard';
import { adminApi } from '../../../services';

const EMPTY_APPOINTMENT = {
  providerName: '',
  datetime: '',
  isRecurring: false,
  repeat: 'monthly',
  recurrenceEndDate: '',
};

const EMPTY_PRESCRIPTION = {
  medicationName: '',
  dosageValue: '',
  quantity: 1,
  refillOn: '',
  isRecurring: false,
  refillSchedule: 'monthly',
  recurrenceEndDate: '',
};

const FREQUENCY_OPTIONS = ['daily', 'weekly', 'monthly'];

function toDateTimePayload(value) {
  if (!value) {
    return '';
  }
  return value.length === 16 ? `${value}:00` : value;
}

function toDateTimeInput(value) {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 16);
}

function AdminUserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState(EMPTY_APPOINTMENT);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState(EMPTY_PRESCRIPTION);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);



  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [userData, appointmentData, prescriptionData] = await Promise.all([
        adminApi.getUser(id),
        adminApi.listUserAppointments(id),
        adminApi.listUserPrescriptions(id),
      ]);

      setUser(userData || null);
      setAppointments(appointmentData || []);
      setPrescriptions(prescriptionData || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function showToast(message) {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage('');
    }, 2200);
  }

  async function submitAppointment(event) {
    event.preventDefault();
    setError('');

    const payload = {
      providerName: appointmentForm.providerName,
      datetime: toDateTimePayload(appointmentForm.datetime),
      isRecurring: appointmentForm.isRecurring,
      repeat: appointmentForm.isRecurring ? appointmentForm.repeat : null,
      recurrenceEndDate: appointmentForm.isRecurring
        ? (appointmentForm.recurrenceEndDate || null)
        : null,
    };

    try {
      const isUpdate = Boolean(editingAppointmentId);
      if (isUpdate) {
        await adminApi.updateAppointment(editingAppointmentId, payload);
      } else {
        await adminApi.createUserAppointment(id, payload);
      }

      showToast(isUpdate ? 'Appointment updated.' : 'Appointment created.');
      setAppointmentForm(EMPTY_APPOINTMENT);
      setEditingAppointmentId(null);
      setShowAppointmentForm(false);
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function startEditAppointment(appointment) {
    setEditingAppointmentId(appointment.id);
    setShowAppointmentForm(true);
    setAppointmentForm({
      providerName: appointment.providerName || '',
      datetime: toDateTimeInput(appointment.datetime),
      isRecurring: Boolean(appointment.isRecurring),
      repeat: appointment.repeat || 'monthly',
      recurrenceEndDate: appointment.recurrenceEndDate || '',
    });
  }

  async function deleteAppointment(appointmentId) {
    setError('');
    try {
      await adminApi.deleteAppointment(appointmentId);
      if (editingAppointmentId === appointmentId) {
        setEditingAppointmentId(null);
        setAppointmentForm(EMPTY_APPOINTMENT);
        setShowAppointmentForm(false);
      }
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function submitPrescription(event) {
    event.preventDefault();
    setError('');

    const payload = {
      medicationName: prescriptionForm.medicationName,
      dosageValue: prescriptionForm.dosageValue,
      quantity: Number(prescriptionForm.quantity),
      refillOn: prescriptionForm.refillOn || null,
      isRecurring: prescriptionForm.isRecurring,
      refillSchedule: prescriptionForm.isRecurring ? prescriptionForm.refillSchedule : null,
      recurrenceEndDate: prescriptionForm.isRecurring
        ? (prescriptionForm.recurrenceEndDate || null)
        : null,
    };

    try {
      const isUpdate = Boolean(editingPrescriptionId);
      if (isUpdate) {
        await adminApi.updatePrescription(editingPrescriptionId, payload);
      } else {
        await adminApi.createUserPrescription(id, payload);
      }

      showToast(isUpdate ? 'Medication updated.' : 'Medication created.');
      setPrescriptionForm(EMPTY_PRESCRIPTION);
      setEditingPrescriptionId(null);
      setShowPrescriptionForm(false);
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function startEditPrescription(prescription) {
    setEditingPrescriptionId(prescription.id);
    setShowPrescriptionForm(true);
    setPrescriptionForm({
      medicationName: prescription.medicationName || '',
      dosageValue: prescription.dosageValue || '',
      quantity: prescription.quantity || 1,
      refillOn: prescription.refillOn || '',
      isRecurring: Boolean(prescription.isRecurring),
      refillSchedule: prescription.refillSchedule || 'monthly',
      recurrenceEndDate: prescription.recurrenceEndDate || '',
    });
  }

  async function deletePrescription(prescriptionId) {
    setError('');
    try {
      await adminApi.deletePrescription(prescriptionId);
      if (editingPrescriptionId === prescriptionId) {
        setEditingPrescriptionId(null);
        setPrescriptionForm(EMPTY_PRESCRIPTION);
        setShowPrescriptionForm(false);
      }
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div>
      {toastMessage && <div className="toast-message">{toastMessage}</div>}
      {error && <p className="error-text">{error}</p>}

      <SectionCard
        title={`Patient Record #${id}`}
        actions={
          <div className="actions-row">
            <Link to="/admin" className="link-button btn-secondary">Back to users</Link>
            <button onClick={loadAll}>Reload</button>
          </div>
        }
      >
        <div className="record-grid">
          <div><strong>Name:</strong> {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '-'}</div>
          <div><strong>Email:</strong> {user?.email || '-'}</div>
          <div><strong>Type:</strong> {user?.userType || '-'}</div>
        </div>
      </SectionCard>

      <SectionCard
        title="Appointments"
        actions={
          <button
            type="button"
            onClick={() => {
              setShowAppointmentForm((current) => !current);
              setEditingAppointmentId(null);
              setAppointmentForm(EMPTY_APPOINTMENT);
            }}
          >
            {showAppointmentForm ? 'Close form' : 'Add appointment'}
          </button>
        }
      >
        {showAppointmentForm ? (
          <form className="simple-form" onSubmit={submitAppointment}>
            <label htmlFor="appointment-provider">Provider name</label>
            <input
              id="appointment-provider"
              value={appointmentForm.providerName}
              onChange={(event) =>
                setAppointmentForm({ ...appointmentForm, providerName: event.target.value })
              }
              required
            />

            <label htmlFor="appointment-datetime">First appointment date time</label>
            <input
              id="appointment-datetime"
              type="datetime-local"
              value={appointmentForm.datetime}
              onChange={(event) =>
                setAppointmentForm({ ...appointmentForm, datetime: event.target.value })
              }
              required
            />

            <label className="checkbox-row" htmlFor="appointment-recurring">
              <input
                id="appointment-recurring"
                type="checkbox"
                checked={appointmentForm.isRecurring}
                onChange={(event) =>
                  setAppointmentForm({ ...appointmentForm, isRecurring: event.target.checked })
                }
              />
              Recurring appointment
            </label>

            {appointmentForm.isRecurring && (
              <>
                <label htmlFor="appointment-repeat">Recurring basis</label>
                <select
                  id="appointment-repeat"
                  value={appointmentForm.repeat}
                  onChange={(event) =>
                    setAppointmentForm({ ...appointmentForm, repeat: event.target.value })
                  }
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <label htmlFor="appointment-end-date">Recurring end date</label>
                <input
                  id="appointment-end-date"
                  type="date"
                  value={appointmentForm.recurrenceEndDate}
                  onChange={(event) =>
                    setAppointmentForm({ ...appointmentForm, recurrenceEndDate: event.target.value })
                  }
                  required
                />
              </>
            )}

            <div className="actions-row">
              <button type="submit">
                {editingAppointmentId ? 'Update appointment' : 'Create appointment'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingAppointmentId(null);
                  setAppointmentForm(EMPTY_APPOINTMENT);
                  setShowAppointmentForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="muted-text">Use Add appointment to open the form.</p>
        )}

        {appointments.length > 0 ? (
          <table className="basic-table top-gap">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider</th>
                <th>First date time</th>
                <th>Recurring</th>
                <th>Basis</th>
                <th>End date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.providerName}</td>
                  <td>{appointment.datetime}</td>
                  <td>{appointment.isRecurring ? 'Yes' : 'No'}</td>
                  <td>{appointment.repeat || '-'}</td>
                  <td>{appointment.recurrenceEndDate || '-'}</td>
                  <td className="actions-cell">
                    <button type="button" onClick={() => startEditAppointment(appointment)}>Edit</button>
                    <button type="button" onClick={() => deleteAppointment(appointment.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted-text top-gap">No appointments yet.</p>
        )}
      </SectionCard>

      <SectionCard
        title="Prescriptions"
        actions={
          <button
            type="button"
            onClick={() => {
              setShowPrescriptionForm((current) => !current);
              setEditingPrescriptionId(null);
              setPrescriptionForm(EMPTY_PRESCRIPTION);
            }}
          >
            {showPrescriptionForm ? 'Close form' : 'Add prescription'}
          </button>
        }
      >
        {showPrescriptionForm ? (
          <form className="simple-form" onSubmit={submitPrescription}>
            <label htmlFor="prescription-medication">Medication name</label>
            <input
              id="prescription-medication"
              value={prescriptionForm.medicationName}
              onChange={(event) =>
                setPrescriptionForm({ ...prescriptionForm, medicationName: event.target.value })
              }
              required
            />

            <label htmlFor="prescription-dosage">Dosage</label>
            <input
              id="prescription-dosage"
              value={prescriptionForm.dosageValue}
              onChange={(event) =>
                setPrescriptionForm({ ...prescriptionForm, dosageValue: event.target.value })
              }
              required
            />

            <label htmlFor="prescription-quantity">Quantity</label>
            <input
              id="prescription-quantity"
              type="number"
              min="1"
              value={prescriptionForm.quantity}
              onChange={(event) =>
                setPrescriptionForm({ ...prescriptionForm, quantity: event.target.value })
              }
              required
            />

            <label htmlFor="prescription-refill-on">First refill date</label>
            <input
              id="prescription-refill-on"
              type="date"
              value={prescriptionForm.refillOn}
              onChange={(event) =>
                setPrescriptionForm({ ...prescriptionForm, refillOn: event.target.value })
              }
              required
            />

            <label className="checkbox-row" htmlFor="prescription-recurring">
              <input
                id="prescription-recurring"
                type="checkbox"
                checked={prescriptionForm.isRecurring}
                onChange={(event) =>
                  setPrescriptionForm({ ...prescriptionForm, isRecurring: event.target.checked })
                }
              />
              Recurring medication refill
            </label>

            {prescriptionForm.isRecurring && (
              <>
                <label htmlFor="prescription-refill-schedule">Recurring basis</label>
                <select
                  id="prescription-refill-schedule"
                  value={prescriptionForm.refillSchedule}
                  onChange={(event) =>
                    setPrescriptionForm({ ...prescriptionForm, refillSchedule: event.target.value })
                  }
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <label htmlFor="prescription-end-date">Recurring end date</label>
                <input
                  id="prescription-end-date"
                  type="date"
                  value={prescriptionForm.recurrenceEndDate}
                  onChange={(event) =>
                    setPrescriptionForm({ ...prescriptionForm, recurrenceEndDate: event.target.value })
                  }
                  required
                />
              </>
            )}

            <div className="actions-row">
              <button type="submit">
                {editingPrescriptionId ? 'Update prescription' : 'Create prescription'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingPrescriptionId(null);
                  setPrescriptionForm(EMPTY_PRESCRIPTION);
                  setShowPrescriptionForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="muted-text">Use Add prescription to open the form.</p>
        )}

        {prescriptions.length > 0 ? (
          <table className="basic-table top-gap">
            <thead>
              <tr>
                <th>ID</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Quantity</th>
                <th>First refill</th>
                <th>Recurring</th>
                <th>Basis</th>
                <th>End date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{prescription.id}</td>
                  <td>{prescription.medicationName}</td>
                  <td>{prescription.dosageValue}</td>
                  <td>{prescription.quantity}</td>
                  <td>{prescription.refillOn || '-'}</td>
                  <td>{prescription.isRecurring ? 'Yes' : 'No'}</td>
                  <td>{prescription.refillSchedule || '-'}</td>
                  <td>{prescription.recurrenceEndDate || '-'}</td>
                  <td className="actions-cell">
                    <button type="button" onClick={() => startEditPrescription(prescription)}>Edit</button>
                    <button type="button" onClick={() => deletePrescription(prescription.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted-text top-gap">No prescriptions yet.</p>
        )}
      </SectionCard>
    </div>
  );
}

export default AdminUserDetailPage;

