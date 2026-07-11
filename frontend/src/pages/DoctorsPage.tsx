import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Doctor, Specialty } from '../types';

export function DoctorsPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/specialties').then((res) => setSpecialties(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get('/doctors', { params: { specialtyId: specialtyId || undefined, keyword: keyword || undefined } })
      .then((res) => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, [specialtyId, keyword]);

  return (
    <div className="container">
      <h1>Tìm bác sĩ</h1>
      <div className="filters">
        <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
          <option value="">Tất cả chuyên khoa</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Tìm theo tên bác sĩ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : doctors.length === 0 ? (
        <p>Không tìm thấy bác sĩ phù hợp.</p>
      ) : (
        <div className="grid">
          {doctors.map((doctor) => (
            <Link to={`/doctors/${doctor.id}`} key={doctor.id} className="card">
              <h3>{doctor.user.fullName}</h3>
              <p className="badge">{doctor.specialty.name}</p>
              <p>{doctor.experienceYears} năm kinh nghiệm</p>
              {doctor.bio && <p className="bio">{doctor.bio}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
