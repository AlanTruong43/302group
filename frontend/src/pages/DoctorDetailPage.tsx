import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Doctor, TimeSlot } from '../types';
import { useAuth } from '../context/AuthContext';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/doctors/${id}`).then((res) => setDoctor(res.data));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/doctors/${id}/slots`, { params: { date } }).then((res) => setSlots(res.data));
  }, [id, date]);

  async function handleBook() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSlot) return;
    setError(null);
    setMessage(null);
    setBooking(true);
    try {
      await apiClient.post('/appointments', { slotId: selectedSlot, note: note || undefined });
      setMessage('Đặt lịch thành công! Vui lòng chờ bác sĩ xác nhận.');
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlot));
      setSelectedSlot(null);
      setNote('');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Đặt lịch thất bại');
    } finally {
      setBooking(false);
    }
  }

  if (!doctor) return <p className="container">Đang tải...</p>;

  return (
    <div className="container">
      <h1>{doctor.user.fullName}</h1>
      <p className="badge">{doctor.specialty.name}</p>
      <p>{doctor.experienceYears} năm kinh nghiệm</p>
      {doctor.bio && <p className="bio">{doctor.bio}</p>}

      <h2>Chọn khung giờ khám</h2>
      <label>
        Ngày khám
        <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} />
      </label>

      {slots.length === 0 ? (
        <p>Bác sĩ chưa có khung giờ trống trong ngày này.</p>
      ) : (
        <div className="slot-grid">
          {slots.map((slot) => (
            <button
              key={slot.id}
              className={selectedSlot === slot.id ? 'slot selected' : 'slot'}
              onClick={() => setSelectedSlot(slot.id)}
            >
              {slot.startTime} - {slot.endTime}
            </button>
          ))}
        </div>
      )}

      {selectedSlot && (
        <div className="booking-box">
          <label>
            Lý do khám (tùy chọn)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </label>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <button onClick={handleBook} disabled={booking}>
            {booking ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
          </button>
        </div>
      )}
    </div>
  );
}
