import { httpClient } from './httpClient';

export const adminApi = {
  listUsers() {
    return httpClient.get('/admin/users');
  },
  getUser(userId) {
    return httpClient.get(`/admin/users/${userId}`);
  },
  createUser(payload) {
    return httpClient.post('/admin/users', payload);
  },
  updateUser(userId, payload) {
    return httpClient.put(`/admin/users/${userId}`, payload);
  },
  deleteUser(userId) {
    return httpClient.delete(`/admin/users/${userId}`);
  },

  listUserAppointments(userId) {
    return httpClient.get(`/admin/users/${userId}/appointments`);
  },
  createUserAppointment(userId, payload) {
    return httpClient.post(`/admin/users/${userId}/appointments`, payload);
  },
  updateAppointment(appointmentId, payload) {
    return httpClient.put(`/admin/appointments/${appointmentId}`, payload);
  },
  deleteAppointment(appointmentId) {
    return httpClient.delete(`/admin/appointments/${appointmentId}`);
  },

  listUserPrescriptions(userId) {
    return httpClient.get(`/admin/users/${userId}/prescriptions`);
  },
  createUserPrescription(userId, payload) {
    return httpClient.post(`/admin/users/${userId}/prescriptions`, payload);
  },
  updatePrescription(prescriptionId, payload) {
    return httpClient.put(`/admin/prescriptions/${prescriptionId}`, payload);
  },
  deletePrescription(prescriptionId) {
    return httpClient.delete(`/admin/prescriptions/${prescriptionId}`);
  },
};

