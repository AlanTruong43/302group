import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Đặt lịch khám bệnh
      </Link>
      <div className="nav-links">
        {user?.role === 'PATIENT' && (
          <>
            <Link to="/">Tìm bác sĩ</Link>
            <Link to="/appointments">Lịch hẹn của tôi</Link>
          </>
        )}
        {user?.role === 'DOCTOR' && <Link to="/doctor">Bảng điều khiển bác sĩ</Link>}
        {user?.role === 'ADMIN' && <Link to="/admin">Quản trị</Link>}
        {user ? (
          <>
            <span className="user-info">{user.fullName}</span>
            <button onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
}
