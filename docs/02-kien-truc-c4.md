# 2. Thiết kế kiến trúc (C4 Model)

## Lựa chọn kiến trúc

Hệ thống áp dụng **Layered Architecture** (kiến trúc phân tầng) cho container API Backend, gồm 3 tầng:

- **Presentation Layer**: nhận HTTP request, xác thực đầu vào, điều hướng tới Business Layer, định dạng response.
- **Business Layer**: chứa toàn bộ logic nghiệp vụ (đặt lịch, xác nhận, kiểm tra ràng buộc trùng slot, gửi thông báo).
- **Data Access Layer**: truy vấn/ghi dữ liệu qua ORM (Prisma), tách biệt hoàn toàn khỏi logic nghiệp vụ.

**Lý do lựa chọn**: bài toán có nghiệp vụ vừa phải, một nhóm nhỏ phát triển trong thời gian ngắn (MVP). Layered Architecture đơn giản, dễ hiện thực đúng tiến độ, dễ kiểm thử từng tầng độc lập, và ánh xạ trực tiếp 1-1 với cấu trúc thư mục mã nguồn — giảm rủi ro "kiến trúc thiết kế không khớp mã nguồn" (mục bị trừ điểm theo rubric).

---

## Level 1: System Context Diagram

```mermaid
C4Context
  title System Context - Hệ thống đặt lịch khám bệnh

  Person(patient, "Bệnh nhân", "Tìm bác sĩ, đặt/hủy lịch khám")
  Person(doctor, "Bác sĩ", "Quản lý khung giờ, xác nhận lịch hẹn")
  Person(admin, "Quản trị viên", "Quản lý bác sĩ, chuyên khoa")

  System(bookingSystem, "Hệ thống đặt lịch khám bệnh", "Cho phép đặt, quản lý và xác nhận lịch khám trực tuyến")

  System_Ext(emailSystem, "Email Service", "SMTP/SendGrid - gửi email thông báo")

  Rel(patient, bookingSystem, "Tìm bác sĩ, đặt lịch, xem/hủy lịch hẹn", "HTTPS")
  Rel(doctor, bookingSystem, "Thiết lập lịch làm việc, xác nhận/từ chối lịch hẹn", "HTTPS")
  Rel(admin, bookingSystem, "Quản lý bác sĩ, chuyên khoa", "HTTPS")
  Rel(bookingSystem, emailSystem, "Gửi email xác nhận/nhắc lịch", "SMTP API")
  Rel(emailSystem, patient, "Email thông báo")
  Rel(emailSystem, doctor, "Email thông báo")
```

---

## Level 2: Container Diagram

```mermaid
C4Container
  title Container Diagram - Hệ thống đặt lịch khám bệnh

  Person(patient, "Bệnh nhân")
  Person(doctor, "Bác sĩ")
  Person(admin, "Quản trị viên")

  System_Boundary(bookingSystem, "Hệ thống đặt lịch khám bệnh") {
    Container(webApp, "Web Frontend", "React + Vite", "Giao diện đặt lịch, quản lý cho 3 vai trò")
    Container(apiApp, "API Backend", "Node.js + Express + TypeScript", "Xử lý nghiệp vụ, xác thực JWT, expose REST API")
    ContainerDb(db, "Database", "PostgreSQL", "Lưu trữ User, Doctor, Specialty, TimeSlot, Appointment")
  }

  System_Ext(emailSystem, "Email Service", "SMTP/SendGrid")

  Rel(patient, webApp, "Sử dụng", "HTTPS")
  Rel(doctor, webApp, "Sử dụng", "HTTPS")
  Rel(admin, webApp, "Sử dụng", "HTTPS")

  Rel(webApp, apiApp, "Gọi API", "JSON/HTTPS + JWT")
  Rel(apiApp, db, "Đọc/ghi dữ liệu", "SQL/Prisma Client")
  Rel(apiApp, emailSystem, "Gửi email", "SMTP API")
```

---

## Level 3: Component Diagram (bên trong API Backend)

```mermaid
C4Component
  title Component Diagram - API Backend (Layered Architecture)

  Container_Boundary(apiApp, "API Backend") {
    Component(authController, "AuthController", "Express Router", "Presentation - đăng ký/đăng nhập")
    Component(doctorController, "DoctorController", "Express Router", "Presentation - tìm bác sĩ, xem slot")
    Component(appointmentController, "AppointmentController", "Express Router", "Presentation - đặt/hủy lịch hẹn")
    Component(adminController, "AdminController", "Express Router", "Presentation - quản lý bác sĩ/chuyên khoa")
    Component(authMiddleware, "AuthMiddleware / RoleGuard", "Express Middleware", "Xác thực JWT, kiểm tra vai trò")

    Component(authService, "AuthService", "Business Logic", "Đăng ký, đăng nhập, phát hành JWT")
    Component(doctorService, "DoctorService", "Business Logic", "Tìm kiếm bác sĩ, quản lý slot")
    Component(appointmentService, "AppointmentService", "Business Logic", "Đặt lịch, xác nhận, hủy, kiểm tra ràng buộc")
    Component(notificationService, "NotificationService", "Business Logic", "Gửi email theo sự kiện")

    Component(userRepo, "UserRepository", "Data Access", "CRUD User qua Prisma")
    Component(doctorRepo, "DoctorRepository", "Data Access", "CRUD Doctor/Specialty qua Prisma")
    Component(slotRepo, "TimeSlotRepository", "Data Access", "CRUD TimeSlot qua Prisma")
    Component(appointmentRepo, "AppointmentRepository", "Data Access", "CRUD Appointment qua Prisma, transaction")
  }

  ContainerDb(db, "Database", "PostgreSQL")
  System_Ext(emailSystem, "Email Service")

  Rel(authController, authMiddleware, "Áp dụng")
  Rel(doctorController, authMiddleware, "Áp dụng")
  Rel(appointmentController, authMiddleware, "Áp dụng")
  Rel(adminController, authMiddleware, "Áp dụng")

  Rel(authController, authService, "Gọi")
  Rel(doctorController, doctorService, "Gọi")
  Rel(appointmentController, appointmentService, "Gọi")
  Rel(adminController, doctorService, "Gọi")

  Rel(authService, userRepo, "Gọi")
  Rel(doctorService, doctorRepo, "Gọi")
  Rel(doctorService, slotRepo, "Gọi")
  Rel(appointmentService, appointmentRepo, "Gọi")
  Rel(appointmentService, slotRepo, "Gọi")
  Rel(appointmentService, notificationService, "Phát sự kiện")

  Rel(userRepo, db, "SQL")
  Rel(doctorRepo, db, "SQL")
  Rel(slotRepo, db, "SQL")
  Rel(appointmentRepo, db, "SQL")
  Rel(notificationService, emailSystem, "SMTP API")
```

---

## Level 4: Code Diagram (khuyến khích) — luồng đặt lịch khám

```mermaid
classDiagram
  class AppointmentController {
    +createAppointment(req, res)
    +cancelAppointment(req, res)
    +getMyAppointments(req, res)
  }
  class AppointmentService {
    +bookAppointment(patientId, slotId, note) Appointment
    +cancelAppointment(appointmentId, patientId) void
    +confirmAppointment(appointmentId, doctorId) Appointment
  }
  class AppointmentRepository {
    +createWithSlotLock(data) Appointment
    +findById(id) Appointment
    +updateStatus(id, status) Appointment
  }
  class TimeSlotRepository {
    +findAvailable(doctorId, date) TimeSlot[]
    +markBooked(slotId, tx) void
    +release(slotId) void
  }
  class NotificationService {
    +notifyAppointmentCreated(appointment) void
    +notifyAppointmentConfirmed(appointment) void
    +notifyAppointmentCancelled(appointment) void
  }
  class Appointment {
    id: string
    patientId: string
    doctorId: string
    slotId: string
    status: AppointmentStatus
    note: string
    createdAt: Date
  }
  class TimeSlot {
    id: string
    doctorId: string
    date: Date
    startTime: string
    endTime: string
    isBooked: boolean
  }

  AppointmentController --> AppointmentService
  AppointmentService --> AppointmentRepository
  AppointmentService --> TimeSlotRepository
  AppointmentService --> NotificationService
  AppointmentRepository --> Appointment
  TimeSlotRepository --> TimeSlot
```

---

## Trách nhiệm từng thành phần

| Thành phần | Trách nhiệm | Tầng |
|---|---|---|
| Web Frontend | Hiển thị UI, gọi API, quản lý state phía client | - |
| Controller (Auth/Doctor/Appointment/Admin) | Nhận request, validate input cơ bản, gọi Service, trả response | Presentation |
| AuthMiddleware / RoleGuard | Xác thực JWT, kiểm tra vai trò truy cập | Presentation |
| Service (Auth/Doctor/Appointment/Notification) | Toàn bộ logic nghiệp vụ, ràng buộc, điều phối transaction | Business |
| Repository (User/Doctor/TimeSlot/Appointment) | Truy vấn/ghi dữ liệu, không chứa logic nghiệp vụ | Data Access |
| PostgreSQL | Lưu trữ dữ liệu bền vững, đảm bảo transaction/unique constraint | - |
| Email Service | Gửi email thông báo (dịch vụ ngoài) | - |

## Quyết định kiến trúc quan trọng và liên hệ với thuộc tính chất lượng

1. **Tách Data Access khỏi Business bằng Repository pattern** → hỗ trợ trực tiếp **QA-04 Modifiability**: có thể đổi ORM/database mà không sửa logic nghiệp vụ.
2. **Kiểm tra và khóa slot bằng transaction ở tầng Repository** (`createWithSlotLock`) → đảm bảo **QA-05 Reliability**, tránh double-booking khi nhiều bệnh nhân đặt đồng thời.
3. **AuthMiddleware/RoleGuard đặt ở Presentation, chặn trước khi vào Business** → đảm bảo **QA-03 Security**, mọi request trái phép bị từ chối sớm, giảm tải xử lý không cần thiết (gián tiếp hỗ trợ Performance).
4. **NotificationService tách biệt, không nằm trong luồng transaction chính của AppointmentService** → lỗi gửi email không làm rollback lịch hẹn, hỗ trợ **QA-02 Availability** của luồng nghiệp vụ chính.
5. **Stateless API (JWT, không session server)** → cho phép chạy nhiều instance backend phía sau load balancer trong tương lai, hỗ trợ **QA-01 Performance/Scalability** khi tải tăng.

## Ưu điểm

- Cấu trúc rõ ràng, dễ onboard thành viên mới trong nhóm.
- Dễ kiểm thử: có thể unit test Service độc lập bằng cách mock Repository.
- Ánh xạ trực tiếp sang cấu trúc thư mục, giảm rủi ro lệch giữa thiết kế và mã nguồn.
- Phù hợp quy mô MVP, không tốn overhead hạ tầng như Microservices.

## Nhược điểm

- Khó mở rộng độc lập từng phần (không thể scale riêng module Appointment mà không scale cả API).
- Business Layer có xu hướng phình to khi hệ thống lớn dần (nguy cơ "fat service").
- Tầng Presentation và Business vẫn có thể vô tình rò rỉ phụ thuộc lẫn nhau nếu không kỷ luật code review.
- Một lỗi ở tầng Data Access (vd. deadlock) có thể ảnh hưởng toàn bộ API vì chạy chung 1 tiến trình/container.
