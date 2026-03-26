import { httpClient } from './httpClient';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const patientApi = {
  login(credentials) {
    return httpClient.post('/login', credentials);
  },
  getSummary(token) {
    return httpClient.get('/', authHeaders(token));
  },
  listAppointments(userId, token) {
    return httpClient.get(`/appointments?userId=${userId}`, authHeaders(token));
  },
  listPrescriptions(userId, token) {
    return httpClient.get(`/prescriptions?userId=${userId}`, authHeaders(token));
  },
};
