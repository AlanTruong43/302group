import { Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<DoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allow={['PATIENT']}>
              <MyAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allow={['DOCTOR']}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
