import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionCard from '../../../shared/components/SectionCard';
import { adminApi } from '../../../services';

const EMPTY_USER = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  userType: 'PATIENT',
};

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ');
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createPayload, setCreatePayload] = useState(EMPTY_USER);
  const [editUserId, setEditUserId] = useState(null);
  const [editPayload, setEditPayload] = useState(EMPTY_USER);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const data = await adminApi.listUsers();
      setUsers(data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setError('');

    try {
      await adminApi.createUser(createPayload);
      setCreatePayload(EMPTY_USER);
      setShowCreateForm(false);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function startEdit(user) {
    setEditUserId(user.id);
    setEditPayload({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      userType: user.userType || 'PATIENT',
    });
  }

  async function handleUpdateUser(event) {
    event.preventDefault();
    if (!editUserId) {
      return;
    }

    setError('');

    try {
      await adminApi.updateUser(editUserId, editPayload);
      setEditUserId(null);
      setEditPayload(EMPTY_USER);
      await loadUsers();
    } catch (requestError) {
      const details = requestError?.message ? `: ${requestError.message}` : '';
      setError(`Update failed${details}`);
    }
  }

  async function handleDeleteUser(userId) {
    setError('');

    try {
      await adminApi.deleteUser(userId);
      if (editUserId === userId) {
        setEditUserId(null);
        setEditPayload(EMPTY_USER);
      }
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div>
      <SectionCard title="Users" actions={<button onClick={loadUsers}>Reload</button>}>
        {loading && <p>Loading users...</p>}
        {error && <p className="error-text">{error}</p>}

        <table className="basic-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Appts</th>
              <th>Rx</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{fullName(user) || '-'}</td>
                <td>{user.email}</td>
                <td>{user.userType}</td>
                <td>{Array.isArray(user.appointments) ? user.appointments.length : '-'}</td>
                <td>{Array.isArray(user.prescriptions) ? user.prescriptions.length : '-'}</td>
                <td className="actions-cell">
                  <Link to={`/admin/users/${user.id}`}>Open record</Link>
                  <button type="button" onClick={() => startEdit(user)}>Edit</button>
                  <button type="button" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard
        title="Create patient"
        actions={
          <button type="button" onClick={() => setShowCreateForm((current) => !current)}>
            {showCreateForm ? 'Close form' : 'Add patient'}
          </button>
        }
      >
        {showCreateForm ? (
          <form className="simple-form" onSubmit={handleCreateUser}>
            <label htmlFor="create-first-name">First name</label>
            <input
              id="create-first-name"
              value={createPayload.firstName}
              onChange={(event) =>
                setCreatePayload({ ...createPayload, firstName: event.target.value })
              }
              required
            />

            <label htmlFor="create-last-name">Last name</label>
            <input
              id="create-last-name"
              value={createPayload.lastName}
              onChange={(event) =>
                setCreatePayload({ ...createPayload, lastName: event.target.value })
              }
              required
            />

            <label htmlFor="create-email">Email</label>
            <input
              id="create-email"
              type="email"
              value={createPayload.email}
              onChange={(event) =>
                setCreatePayload({ ...createPayload, email: event.target.value })
              }
              required
            />

            <label htmlFor="create-password">Password</label>
            <input
              id="create-password"
              type="password"
              value={createPayload.password}
              onChange={(event) =>
                setCreatePayload({ ...createPayload, password: event.target.value })
              }
              required
            />

            <button type="submit">Create patient</button>
          </form>
        ) : (
          <p className="muted-text">Use Add patient to open the form.</p>
        )}
      </SectionCard>

      {editUserId && (
        <SectionCard title={`Edit user #${editUserId}`}>
          <form className="simple-form" onSubmit={handleUpdateUser}>
            <label htmlFor="edit-first-name">First name</label>
            <input
              id="edit-first-name"
              value={editPayload.firstName}
              onChange={(event) =>
                setEditPayload({ ...editPayload, firstName: event.target.value })
              }
              required
            />

            <label htmlFor="edit-last-name">Last name</label>
            <input
              id="edit-last-name"
              value={editPayload.lastName}
              onChange={(event) =>
                setEditPayload({ ...editPayload, lastName: event.target.value })
              }
              required
            />

            <label htmlFor="edit-email">Email</label>
            <input
              id="edit-email"
              type="email"
              value={editPayload.email}
              onChange={(event) =>
                setEditPayload({ ...editPayload, email: event.target.value })
              }
              required
            />

            <label htmlFor="edit-password">Password (leave empty to keep existing)</label>
            <input
              id="edit-password"
              type="password"
              value={editPayload.password}
              onChange={(event) =>
                setEditPayload({ ...editPayload, password: event.target.value })
              }
            />

            <div className="actions-row">
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => {
                  setEditUserId(null);
                  setEditPayload(EMPTY_USER);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}
    </div>
  );
}

export default AdminUsersPage;

