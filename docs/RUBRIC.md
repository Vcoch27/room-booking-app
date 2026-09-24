# StudySpace — đối chiếu rubric

Giữ React Native + Expo, dùng chung tính năng trên web và điện thoại.

| Tiêu chí | Minh chứng trong dự án |
|---|---|
| UI/UX · 25% | Feed responsive 1/2/3 cột; sidebar desktop và bottom tabs mobile; chi tiết chia hai cột; Reanimated FadeInDown/LinearTransition có ReduceMotion.System; gallery nhiều ảnh, phím mũi tên và Esc trên web; trạng thái loading/error/offline/empty. |
| Features · 30% | Tìm không dấu theo tên/tòa/mô tả/tiện nghi; kết hợp sức chứa và thiết bị; yêu thích; chọn ngày/giờ, xác nhận, vé, lịch sử, hủy/check-in. Firebase realtime tiếp tục cập nhật phòng và lịch. |
| Navigation · 15% | Native Stack + Bottom Tabs với RootStack/MainTabs typed và NavigatorScreenParams. URL `/rooms/:roomId`, `/bookings`, `/favorites`, `/account`, vé `/bookings/:bookingId`; tiêu đề trình duyệt. |
| State · 15% | Zustand lưu bộ lọc, yêu thích, tùy chọn và draft. TanStack Query lưu snapshots phòng/lịch/availability; useMutation tạo booking với retry tắt để tránh gửi lặp. Query key lịch có backend + uid; cache thiết bị có cùng phạm vi. |
| Code quality · 15% | TypeScript strict; useRealtimeQuery, useGalleryKeys, firstSnapshot tách riêng; adapter query có kiểm thử callback đồng bộ, abort và lỗi quyền. |

## Lưu ý kỹ thuật

- Dùng Reanimated do `expo install` chọn cho SDK 57 thay vì ép Reanimated 3 trong slide. GestureHandlerRootView được đặt ở root; không sử dụng PanResponder. Gallery vẫn dùng paging của FlatList.
- `firstSnapshot` chuyển snapshot đầu thành Query promise có AbortSignal. Subscription trong hook tiếp tục cập nhật Query cache; listener một lần được giải phóng sau snapshot đầu. Unmount/đổi key ngăn callback cũ cập nhật cache. Lỗi stream được hiển thị và nút thử lại tạo lại listener.
- AsyncStorage chỉ là cache offline; nguồn dữ liệu chế độ Firebase vẫn là Firestore. Booking không được gửi tự động khi offline; mutation không retry tự động.
- Web không hứa gửi local notification như native. Ảnh minh họa có nhãn rõ ràng.
- Khi host web, cấu hình SPA rewrite mọi đường dẫn về `index.html` để refresh URL phòng/vé hoạt động. Chưa triển khai hosting trong thay đổi này.

## Chạy và trình diễn

```powershell
npm install
npm run web
```

Chạy demo độc lập, không thay `.env`:

```powershell
$env:EXPO_PUBLIC_BACKEND='demo'
$env:EXPO_NO_DOTENV='1'
npx expo start --web --port 8083 --clear
```

Đóng terminal demo trước khi mở terminal mới chạy Firebase. Kiểm tra `.env` đặt `EXPO_PUBLIC_BACKEND=firebase`.

Kịch bản chấm: đăng nhập → tìm `may chieu` → kết hợp sức chứa/tòa → xóa lọc → mở phòng → xem gallery → chọn ngày/giờ → xác nhận → mở vé → xem Lịch của tôi. Thu hẹp màn hình để xem bottom tabs và danh sách một cột. Thử browser Back và refresh URL phòng, đăng nhập lại nếu dùng demo.

## Kiểm tra tự động

```powershell
npm run typecheck
npx vitest run tests/domain.test.ts tests/demo.test.ts tests/reminders.test.ts tests/roomPhotos.test.ts tests/query.test.ts
npm run build:web
npx expo install --check
```

Rubric là bảng đối chiếu triển khai, không phải cam kết điểm số. Cần xác nhận thêm trên thiết bị Expo Go thực tế và tài khoản Firebase của người dùng; kiểm thử demo không thay thế kiểm thử quyền Firestore đa người dùng.
