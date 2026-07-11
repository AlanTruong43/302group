import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Appointment } from '../types';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
};

export function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiClient
      .get('/appointments/me')
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCancel(id: string) {
    setError(null);
    try {
      await apiClient.patch(`/appointments/${id}/cancel`, {});
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Hủy lịch thất bại');
    }
  }

  if (loading) return <p className="container">Đang tải...</p>;

  return (
    <div className="container">
      <h1>Lịch hẹn của tôi</h1>
      {error && <p className="error">{error}</p>}
      {appointments.length === 0 ? (
        <p>Bạn chưa có lịch hẹn nào.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Bác sĩ</th>
              <th>Chuyên khoa</th>
              <th>Ngày khám</th>
              <th>Giờ</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.doctor?.user.fullName}</td>
                <td>{a.doctor?.specialty.name}</td>
                <td>{a.slot.date.slice(0, 10)}</td>
                <td>
                  {a.slot.startTime} - {a.slot.endTime}
                </td>
                <td>
                  <span className={`status status-${a.status.toLowerCase()}`}>
                    {statusLabel[a.status]}
                  </span>
                </td>
                <td>
                  {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                    <button onClick={() => handleCancel(a.id)}>Hủy lịch</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
