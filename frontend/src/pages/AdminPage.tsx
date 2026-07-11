import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Specialty } from '../types';

export function AdminPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [specialtyError, setSpecialtyError] = useState<string | null>(null);

  const [doctorForm, setDoctorForm] = useState({
    email: '',
    fullName: '',
    specialtyId: '',
    bio: '',
    experienceYears: 0,
  });
  const [doctorMessage, setDoctorMessage] = useState<string | null>(null);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  function loadSpecialties() {
    apiClient.get('/admin/specialties').then((res) => setSpecialties(res.data));
  }

  useEffect(loadSpecialties, []);

  async function handleAddSpecialty(e: FormEvent) {
    e.preventDefault();
    setSpecialtyError(null);
    try {
      await apiClient.post('/admin/specialties', { name: newSpecialty });
      setNewSpecialty('');
      loadSpecialties();
    } catch (err: any) {
      setSpecialtyError(err.response?.data?.message ?? 'Thêm chuyên khoa thất bại');
    }
  }

  async function handleDeleteSpecialty(id: string) {
    setSpecialtyError(null);
    try {
      await apiClient.delete(`/admin/specialties/${id}`);
      loadSpecialties();
    } catch (err: any) {
      setSpecialtyError(err.response?.data?.message ?? 'Xóa chuyên khoa thất bại');
    }
  }

  async function handleCreateDoctor(e: FormEvent) {
    e.preventDefault();
    setDoctorError(null);
    setDoctorMessage(null);
    try {
      const { data } = await apiClient.post('/admin/doctors', doctorForm);
      setDoctorMessage(`Đã tạo tài khoản bác sĩ. Mật khẩu tạm: ${data.tempPassword}`);
      setDoctorForm({ email: '', fullName: '', specialtyId: '', bio: '', experienceYears: 0 });
    } catch (err: any) {
      setDoctorError(err.response?.data?.message ?? 'Tạo tài khoản bác sĩ thất bại');
    }
  }

  return (
    <div className="container">
      <h1>Quản trị hệ thống</h1>

      <section>
        <h2>Chuyên khoa</h2>
        <form onSubmit={handleAddSpecialty} className="form inline">
          <input
            placeholder="Tên chuyên khoa mới"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            required
          />
          <button type="submit">Thêm</button>
        </form>
        {specialtyError && <p className="error">{specialtyError}</p>}
        <ul className="list">
          {specialties.map((s) => (
            <li key={s.id}>
              {s.name} <button onClick={() => handleDeleteSpecialty(s.id)}>Xóa</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Thêm bác sĩ mới</h2>
        <form onSubmit={handleCreateDoctor} className="form">
          <label>
            Họ tên
            <input
              value={doctorForm.fullName}
              onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={doctorForm.email}
              onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
              required
            />
          </label>
          <label>
            Chuyên khoa
            <select
              value={doctorForm.specialtyId}
              onChange={(e) => setDoctorForm({ ...doctorForm, specialtyId: e.target.value })}
              required
            >
              <option value="">-- Chọn chuyên khoa --</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Số năm kinh nghiệm
            <input
              type="number"
              min={0}
              value={doctorForm.experienceYears}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, experienceYears: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Giới thiệu
            <textarea
              value={doctorForm.bio}
              onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
              rows={3}
            />
          </label>
          {doctorError && <p className="error">{doctorError}</p>}
          {doctorMessage && <p className="success">{doctorMessage}</p>}
          <button type="submit">Tạo tài khoản bác sĩ</button>
        </form>
      </section>
    </div>
  );
}
