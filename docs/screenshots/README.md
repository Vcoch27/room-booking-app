# Ảnh chụp sản phẩm StudySpace

## Nguồn và môi trường

- Ngày chụp: **25/09/2026**.
- Ứng dụng: mã nguồn StudySpace hiện tại, chạy bằng Expo / React Native Web.
- Backend: **demo cục bộ**, không kết nối Firebase khi tạo/hủy lịch phục vụ ảnh.
- Browser: Chromium qua agent-browser.
- Viewport: **430 × 932** cho ảnh dọc; **1440 × 1200** cho desktop.
- Tài khoản: email mẫu `sinhvien@vku.udn.vn`; dữ liệu không phải tài khoản cá nhân.
- Phòng dùng trong luồng đặt/hủy: A301, ngày 26/09/2026, 07:30–09:30.
- Ảnh được chụp trực tiếp từ giao diện, không chỉnh nội dung hoặc dựng màn hình bằng hình ảnh sinh tự động.
- Ảnh phòng bên trong giao diện lấy từ URL Unsplash có sẵn trong `src/domain/rooms.ts`, phục vụ minh họa không gian; không phải xác nhận ảnh phòng VKU thật.

## Danh sách

| File | Nội dung |
| --- | --- |
| [00-desktop.png](00-desktop.png) | Khám phá trên desktop, sidebar và 3 cột phòng |
| [01-login.png](01-login.png) | Đăng nhập demo bằng email mẫu |
| [02-explore.png](02-explore.png) | Khám phá ở kích thước điện thoại |
| [03-filters.png](03-filters.png) | Bộ lọc sức chứa và tiện nghi |
| [04-room-detail.png](04-room-detail.png) | Ảnh, thông tin và thiết bị phòng A301 |
| [05-select-slot.png](05-select-slot.png) | Chọn ngày mai và slot 07:30–09:30 |
| [06-review.png](06-review.png) | Kiểm tra thông tin trước khi xác nhận |
| [07-booking-pass.png](07-booking-pass.png) | Vé QR của booking demo đã tạo |
| [08-upcoming.png](08-upcoming.png) | Lịch sắp tới và nút mở lại vé |
| [09-history.png](09-history.png) | Lịch sử sau thao tác hủy thành công |
| [10-favorites.png](10-favorites.png) | Phòng A301 trong Yêu thích |
| [11-account.png](11-account.png) | Tùy chọn nhắc lịch, quy tắc và đăng xuất trên web |

## Phạm vi ảnh

Bộ ảnh ghi lại giao diện responsive đang hoạt động và luồng demo trong một trình duyệt. Nó không phải ảnh chụp từ binary Android/iOS. Nút **Thử thông báo sau 5 giây** chỉ có trên native nên không xuất hiện ở ảnh tài khoản web.

Chưa có ảnh chứng minh check-in đúng giờ, notification hệ điều hành, Google Sign-In native hoặc realtime giữa hai thiết bị. QR là mã vé demo, không phải link tải ứng dụng hay vé dùng được tại phòng thật.

## Chụp lại

Từ thư mục gốc, trong PowerShell riêng:

```powershell
$env:EXPO_PUBLIC_BACKEND = 'demo'
$env:EXPO_NO_DOTENV = '1'
npx expo start --web --localhost --port 8083
```

Mở `http://localhost:8083`, đặt kích thước viewport tương ứng, đăng nhập demo và thực hiện luồng trong [kịch bản quay](../demo-script.md). Chờ ảnh phòng tải xong và animation kết thúc trước khi chụp. Dùng ngày còn trong tương lai tại thời điểm chụp; không cần sửa đồng hồ hoặc dữ liệu thật.

Các file PNG được lưu cùng repository để README vẫn hiển thị khi clone hoặc xem trên GitHub, không phụ thuộc vào một server localhost đang chạy.
