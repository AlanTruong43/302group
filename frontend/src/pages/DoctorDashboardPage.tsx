import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Appointment } from '../types';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
};

export function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(17);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiClient
      .get('/appointments/doctor/me')
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleConfirm(id: string) {
    setError(null);
    try {
      await apiClient.patch(`/appointments/${id}/confirm`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Xác nhận thất bại');
    }
  }

  async function handleReject(id: string) {
    setError(null);
    try {
      await apiClient.patch(`/appointments/${id}/cancel`, { reason: 'Bác sĩ từ chối lịch hẹn' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Từ chối thất bại');
    }
  }

  async function handleCreateSchedule(e: FormEvent) {
    e.preventDefault();
    setScheduleMessage(null);
    try {
      const { data } = await apiClient.post('/doctors/me/schedule', {
        date: scheduleDate,
        startHour,
        endHour,
        slotMinutes,
      });
      setScheduleMessage(`Đã tạo ${data.created}/${data.totalRequested} khung giờ mới.`);
    } catch (err: any) {
      setScheduleMessage(err.response?.data?.message ?? 'Tạo lịch thất bại');
    }
  }

  const pending = appointments.filter((a) => a.status === 'PENDING');
  const others = appointments.filter((a) => a.status !== 'PENDING');

  return (
    <div className="container">
      <h1>Bảng điều khiển bác sĩ</h1>

      <section>
        <h2>Thiết lập khung giờ làm việc</h2>
        <form onSubmit={handleCreateSchedule} className="form inline">
          <label>
            Ngày
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
          </label>
          <label>
            Giờ bắt đầu
            <input
              type="number"
              min={0}
              max={23}
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
            />
          </label>
          <label>
            Giờ kết thúc
            <input
              type="number"
              min={1}
              max={24}
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
            />
          </label>
          <label>
            Phút/slot
            <input
              type="number"
              min={10}
              max={180}
              value={slotMinutes}
              onChange={(e) => setSlotMinutes(Number(e.target.value))}
            />
          </label>
          <button type="submit">Tạo khung giờ</button>
        </form>
        {scheduleMessage && <p className="hint-text">{scheduleMessage}</p>}
      </section>

      <section>
        <h2>Lịch hẹn chờ xác nhận</h2>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Đang tải...</p>
        ) : pending.length === 0 ? (
          <p>Không có lịch hẹn nào chờ xác nhận.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Lý do</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient?.fullName}</td>
                  <td>{a.slot.date.slice(0, 10)}</td>
                  <td>
                    {a.slot.startTime} - {a.slot.endTime}
                  </td>
                  <td>{a.note ?? '-'}</td>
                  <td>
                    <button onClick={() => handleConfirm(a.id)}>Xác nhận</button>
                    <button onClick={() => handleReject(a.id)}>Từ chối</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Lịch sử lịch hẹn</h2>
        {others.length === 0 ? (
          <p>Chưa có dữ liệu.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {others.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient?.fullName}</td>
                  <td>{a.slot.date.slice(0, 10)}</td>
                  <td>
                    {a.slot.startTime} - {a.slot.endTime}
                  </td>
                  <td>
                    <span className={`status status-${a.status.toLowerCase()}`}>
                      {statusLabel[a.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
