# Hệ thống đặt lịch khám bệnh

[![CI/CD](https://github.com/AlanTruong43/302group/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/AlanTruong43/302group/actions/workflows/ci-cd.yml)

Bài tập nhóm môn **Kiến trúc phần mềm** — MVP hệ thống đặt lịch khám bệnh trực tuyến, thiết kế theo **C4 Model** và hiện thực theo **Layered Architecture**.

Cho phép bệnh nhân tìm bác sĩ theo chuyên khoa và đặt lịch khám trực tuyến, bác sĩ chủ động thiết lập khung giờ làm việc và xác nhận/từ chối lịch hẹn, quản trị viên quản lý tài khoản bác sĩ và chuyên khoa.

## Tài liệu

- [`docs/01-mo-ta-bai-toan.md`](docs/01-mo-ta-bai-toan.md) — Mô tả bài toán, actors, use case, ràng buộc, thuộc tính chất lượng (Phần 1).
- [`docs/02-kien-truc-c4.md`](docs/02-kien-truc-c4.md) — Thiết kế kiến trúc C4 Model (Level 1-4) (Phần 2).
- [`docs/03-trien-khai.md`](docs/03-trien-khai.md) — Kiến trúc triển khai, hướng dẫn cài đặt/vận hành (Phần 4).

## CI/CD

Pipeline GitHub Actions ([`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)) chạy trên mỗi push/PR vào `main`:

1. **Backend build** — cài dependencies, `prisma generate`, kiểm tra kiểu và biên dịch TypeScript.
2. **Frontend build** — cài dependencies, kiểm tra kiểu và build Vite.
3. **Docker image build check** — build thử cả 2 Dockerfile để đảm bảo không lỗi.
4. **Publish lên GHCR** *(chỉ khi push vào `main`)* — build và đẩy image lên `ghcr.io/alantruong43/302group-backend` và `302group-frontend`, gắn tag `latest` và tag theo commit SHA.

## Công nghệ sử dụng

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, Zod (Layered Architecture: Presentation / Business / Data Access).
- **Frontend**: React, Vite, TypeScript, React Router, Axios.
- **Triển khai**: Docker, Docker Compose, Nginx.

## Cấu trúc dự án

```
dat-lich-kham-benh/
├── docs/            Tài liệu báo cáo (yêu cầu, kiến trúc, triển khai)
├── backend/         API Node.js/Express/TypeScript (Layered Architecture)
│   └── src/
│       ├── presentation/    Controllers, Routes, Middleware (auth, RBAC)
│       ├── business/        Services (logic nghiệp vụ, chống double-booking)
│       ├── data-access/     Repositories (Prisma)
│       └── config/          Cấu hình env, Prisma client
├── frontend/        React SPA (Vite + TypeScript)
└── docker-compose.yml
```

## Cài đặt và chạy

### Cách 1: Docker (khuyến khích)

Yêu cầu: đã cài [Docker Desktop](https://www.docker.com/products/docker-desktop/) và Docker đang chạy.

```bash
docker compose up -d --build
```

Container `api` sẽ tự động đồng bộ schema (`prisma db push`) và seed 3 tài khoản mẫu ở lần khởi động đầu tiên.

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/health

Dừng hệ thống: `docker compose down` (thêm `-v` để xóa luôn dữ liệu volume).

### Cách 2: Chạy thủ công (development, không dùng Docker)

Yêu cầu: Node.js 20+, PostgreSQL đang chạy local.

**Backend:**
```bash
cd backend
cp .env.example .env   # chỉnh DATABASE_URL trỏ tới PostgreSQL local
npm install
npx prisma db push
npm run build && npm run seed   # seed dùng bản JS đã build, tránh lỗi ts-node/ESM trên Node 20+
npm run dev                      # http://localhost:4000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Tài khoản mẫu (demo)

Được seed tự động khi khởi động (`prisma/seed.ts`). Dùng để đăng nhập và kiểm thử 3 vai trò trong hệ thống:

| Vai trò | Email | Mật khẩu | Ghi chú |
|---|---|---|---|
| **Quản trị viên** | `admin@clinic.vn` | `Admin@123` | Quản lý bác sĩ, chuyên khoa, giám sát lịch hẹn |
| **Bác sĩ** | `bs.an@clinic.vn` | `Doctor@123` | Chuyên khoa Nội tổng quát, đã có sẵn khung giờ mẫu cho 3 ngày tới |
| **Bệnh nhân** | `benhnhan@example.com` | `Patient@123` | Có thể tìm bác sĩ và đặt lịch khám ngay |

> Tài khoản Bác sĩ không tự đăng ký công khai — chỉ Quản trị viên mới tạo được (mỗi bác sĩ phải gắn với một chuyên khoa xác thực). Bệnh nhân có thể tự đăng ký qua trang `/register`.

## Luồng nghiệp vụ chính

1. Bệnh nhân đăng ký/đăng nhập → tìm bác sĩ theo chuyên khoa → chọn khung giờ trống → đặt lịch (trạng thái `PENDING`).
2. Bác sĩ đăng nhập → xem lịch hẹn chờ xác nhận → xác nhận (`CONFIRMED`) hoặc từ chối (`CANCELLED`).
3. Bệnh nhân có thể hủy lịch hẹn trước giờ khám tối thiểu 2 giờ.
4. Quản trị viên tạo tài khoản bác sĩ mới và quản lý danh mục chuyên khoa.

Chi tiết đầy đủ từng use case xem tại [`docs/01-mo-ta-bai-toan.md`](docs/01-mo-ta-bai-toan.md).
