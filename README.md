# StudySpace · VKU

Ứng dụng đặt phòng học nhóm và phòng máy, xây dựng từ [PRD gốc](deep-research-report.md). React Native + Expo SDK 57 + TypeScript, chạy Android/iOS/web. Giao diện tiếng Việt, mọi khung giờ theo Việt Nam (UTC+7).

## Chạy ngay — không cần tài khoản cloud

Yêu cầu Node.js 22.13+ (khuyến nghị Node 22 LTS), npm.

```sh
npm ci
npm start
# hoặc
npm run web
```

Mặc định là **demo cục bộ**. Dùng email mẫu để vào ứng dụng, không cần mật khẩu. Lịch đặt được lưu bằng AsyncStorage trên thiết bị/trình duyệt; demo không xác thực danh tính và không đồng bộ giữa các thiết bị. Dữ liệu 6 phòng là minh họa, không phải inventory chính thức của VKU. Dùng development build hoặc Expo Go tương thích SDK của dự án để kiểm tra native; không cài ngẫu nhiên các phiên bản Expo package khác SDK.

## Phạm vi đã triển khai

- Email/password với Firebase hoặc đăng nhập demo được gắn nhãn rõ.
- Native Stack + 4 Bottom Tabs: Khám phá, Lịch của tôi, Yêu thích, Tài khoản.
- FlatList, tìm kiếm không dấu, lọc kết hợp tòa nhà/sức chứa/thiết bị.
- 7 ngày theo lịch Việt Nam, 4 khung giờ 2 tiếng, cập nhật realtime theo phòng/ngày.
- Review trước xác nhận; transaction server chống double booking, user overlap và vượt 3 lịch.
- Idempotency cho thao tác thử lại, hủy trước giờ bắt đầu và trả slot atomically.
- Lịch sắp tới/lịch sử, vé QR với token ngẫu nhiên không chứa PII.
- Favorites/filters/reminder preferences bằng Zustand + AsyncStorage; cache phòng/lịch theo tài khoản.
- Nhắc cục bộ 15 phút trên mobile, hủy reminder khi hủy lịch hoặc đăng xuất; từ chối quyền không làm mất booking.
- Trạng thái loading/empty/error/retry/offline; không xác nhận đặt/hủy offline.
- Firestore Rules chặn mọi client mutation; audit events từ server.

QR hiện là vé tham chiếu, **chưa có scanner/verifier/check-in**. Favorites là tiện ích P1 được làm sớm; các P1/P2 khác nằm trong [phạm vi](docs/PRD.md).

## Firebase / chạy hai thiết bị thật

1. Tạo Firebase project development, bật Email/Password trong Authentication, tạo Firestore.
2. Copy `.env.example` thành `.env`; đặt `EXPO_PUBLIC_BACKEND=firebase` và 4 giá trị cấu hình Firebase web app. Đây là public client config; không đặt service-account/private key trong app.
3. `npm ci --prefix firebase/functions` và `npm run build:server`.
4. `npx firebase login`; deploy: `npx firebase deploy --project YOUR_DEV_PROJECT --only firestore,functions`. Cloud Functions deployment cần project có billing phù hợp. Lệnh này phải do người quản lý project chủ động chạy.
5. Seed bằng Admin SDK với Application Default Credentials của development project. PowerShell:

```powershell
$env:GCLOUD_PROJECT = 'YOUR_DEV_PROJECT'
$env:ALLOW_REMOTE_SEED = 'true'
npm --prefix firebase/functions run seed
```

Seed ghi đè metadata của 6 phòng mẫu; không chạy vào inventory thật. Server region mặc định `asia-southeast1`. Khởi động lại Metro sau khi sửa `.env`.

## Firebase Emulator và kiểm thử

```sh
npm ci --prefix firebase/functions
npm run typecheck
npm run test:unit
npm run build:server
npm run test:emulators
npm run build:web
```

Emulator cần **JDK 21+**. Nếu Windows chọn Java 8 mặc định:

```powershell
$env:JAVA_HOME = 'C:/Program Files/Java/jdk-21'
$env:PATH = "$env:JAVA_HOME/bin;$env:PATH"
npm run test:emulators
```

`npm test` chạy unit và tự skip integration nếu chưa chạy emulator. `test:emulators` bật Auth/Firestore/Functions với project giả `demo-studyspace`, seed fixture và chạy test race thật qua callable functions. Không dùng production cho test.

Để dùng app với emulator, chạy `npx firebase emulators:start --project demo-studyspace`, đặt backend Firebase, `EXPO_PUBLIC_USE_EMULATORS=true`, project ID `demo-studyspace`, API key `demo-key`, auth domain `demo-studyspace.firebaseapp.com`, app ID `demo-app`. Trên điện thoại dùng `EXPO_PUBLIC_EMULATOR_HOST` là LAN IP của máy chạy emulator; cần bind host emulator và firewall phù hợp mạng tin cậy. Seed với `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`.

## Cấu trúc

```text
src/app/          providers + navigation
src/components/   shared UI và design tokens
src/domain/       model, policy, slot/date/filter helpers, sample rooms
src/features/     auth, rooms, bookings, account
src/services/     repository contract, demo/Firebase adapters, reminders
src/stores/       persisted Zustand preferences
firebase/         rules, indexes, callable functions, seed
tests/            policy, demo adapter, emulator integration
design-system/    MASTER + page guidance
docs/             scope, architecture, demo, verification
```

## Giới hạn và bước tiếp theo

Chưa deploy Firebase/EAS, chưa có SSO, quản trị phòng, maintenance blackout, scanner, no-show, remote push, deep links thông báo, export calendar hoặc waitlist. Không tuyên bố production-ready hay FlatList đạt 60fps khi chưa profile trên thiết bị. Notification phải được thử trên Android/iOS thật; web chỉ thông báo rõ giới hạn. Cache không thay thế kết quả transaction server.

Tham khảo chính thức: [Expo Firebase](https://docs.expo.dev/guides/using-firebase/), [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/), [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions).
