# Kết quả kiểm tra — 17/09/2026

Môi trường: Windows, Node 24.20.0; Firestore Emulator dùng JDK 21. Cloud Functions cấu hình runtime triển khai Node 22 (emulator dùng Node của máy). CI dùng Node 22/JDK 21.

| Kiểm tra | Kết quả |
|---|---|
| TypeScript app (`npm run typecheck`) | Đạt |
| Cloud Functions TypeScript build | Đạt |
| Domain/demo/reminder unit tests | 15/15 đạt |
| Firebase Auth + Firestore + Functions Emulator | 3/3 integration tests đạt |
| Expo Doctor | 21/21 đạt |
| Expo export web | Đạt |
| Expo export Android + iOS Hermes bundles | Đạt; không thay thế chạy binary trên thiết bị |
| Web UI flow | Đăng nhập demo → tìm không dấu → lọc AND → ngày mai/slot → review → QR → xác nhận hủy đạt |
| Web viewport nhỏ | Đã xem giao diện 390×844, nội dung wrap và có scroll |

Integration chứng minh hai user tranh slot chỉ một thành công, retry trả cùng booking, hủy sai owner bị từ chối, owner đọc được booking và người khác không được đọc, hủy lặp lại an toàn, slot đặt được sau hủy, cùng user không tạo được overlap khác phòng, client không được sửa lock/booking/room/role/guard.

Lần emulator đầu timeout nạp Functions sau 10 giây. Chạy lại với `FUNCTIONS_DISCOVERY_TIMEOUT=60` đạt; script đã đưa timeout này vào mặc định để ổn định cold start trên Windows. Không sửa transaction để bỏ qua test.

Chưa kiểm tra: native runtime trên Android/iOS thật, cấp quyền và giao notification thực, screen reader/large text trên thiết bị, offline/reconnect hai thiết bị, tải 100–500 phòng/60fps, EAS binary và Firebase cloud deployment. Không tuyên bố các mục này đã đạt.

`npm audit --omit=dev` ở thời điểm kiểm tra còn 10 cảnh báo moderate qua dependency chain Expo tooling; không có high/critical. Audit đề xuất downgrade Expo lớn nên không áp dụng `--force`, tránh phá SDK. Đây chưa phải bản phát hành production.
