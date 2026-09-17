# Kiến trúc và tính đúng của booking

UI → Repository interface → Demo hoặc Firebase adapter. Các component không gọi Firestore trực tiếp. Domain policy là TypeScript thuần dùng chung cho client demo và Cloud Functions, nhằm tránh khác biệt múi giờ/giới hạn.

## Transaction

`createBooking` lấy UID từ verified callable authentication, không tin userId từ client. ID booking là SHA-256 của UID + idempotency key. Server kiểm tra phòng, 7 ngày, giờ bắt đầu, giới hạn và overlap. Lock ID là `roomId__date__slotId`. Booking, lock, user guard và audit event ghi cùng transaction.

User guard được đọc rồi ghi trong mọi create: hai request cho cùng user nhưng khác phòng vẫn xung đột transaction, retry và đọc lại lịch trước khi ghi. Slot lock tuần tự hóa hai người khác nhau đặt cùng một slot. Mọi reads precede writes. Transaction thất bại không giữ lock mồ côi.

`cancelBooking` kiểm tra ownership, thời điểm và trạng thái; chỉ xóa lock nếu nó vẫn thuộc booking đó. Gọi cancel lặp lại không giải phóng lock của lịch mới.

## Dữ liệu và quyền

Rooms và slotLocks đọc được bởi tài khoản đăng nhập. SlotLocks không chứa email/UID/token. Bookings chỉ đọc bởi owner. Client không được ghi vào các collection nhạy cảm; Admin SDK của Functions thực thi mutation. bookingEvents và userGuards chỉ server dùng. Không dùng role field client để cấp quyền.

## State và offline

Zustand chỉ lưu filters, favorites, reminder preference. Repository giữ remote subscriptions. Room cache được phân vùng theo backend; booking cache theo backend + UID. Đổi tài khoản xóa state hiện tại trước khi hydrate cache. Auth persistence do Firebase SDK quản lý, không lưu mật khẩu vào store.

Detail có stale riêng cho room/day query; lựa chọn trước đó không được dùng khi đổi query. Offline/stale vô hiệu hóa đặt chỗ. Server tiếp tục validate ở bước review, phòng trường hợp slot đổi sau màn hình detail. Cache và Firebase realtime không bảo đảm thành công; transaction mới quyết định.

Demo chỉ serialize trong một JS process. Hai browser tab không tạo thành một distributed lock; không sử dụng demo để chứng minh realtime cross-device. Integration tests dùng Firebase Emulator thật.

## Vận hành còn thiếu

Email verification/campus access restrictions, App Check enforcement, abuse/rate limiting, retention và monitoring cần thiết trước khi dùng thật. `passToken` là vé tham chiếu, chưa là bằng chứng đã check-in. Local notifications phụ thuộc thiết bị và quyền OS. Cần benchmark native 100–500 rooms trước khi công bố 60fps.
