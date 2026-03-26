import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import AdminUsersPage from '../features/admin/pages/AdminUsersPage';
import AdminUserDetailPage from '../features/admin/pages/AdminUserDetailPage';
import PatientLoginPage from '../features/patient/pages/PatientLoginPage';
import PatientSummaryPage from '../features/patient/pages/PatientSummaryPage';
import PatientAppointmentsPage from '../features/patient/pages/PatientAppointmentsPage';
import PatientPrescriptionsPage from '../features/patient/pages/PatientPrescriptionsPage';
import NotFoundPage from '../shared/pages/NotFoundPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PatientLoginPage />} />
          <Route path="/portal" element={<PatientSummaryPage />} />
          <Route path="/portal/appointments" element={<PatientAppointmentsPage />} />
          <Route path="/portal/prescriptions" element={<PatientPrescriptionsPage />} />

          <Route path="/admin" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

