# Kiến trúc hiện tại của StudySpace

Cập nhật theo mã nguồn ngày 25/09/2026. Tài liệu này mô tả đường xử lý đang được app gọi; yêu cầu nghiệp vụ ban đầu nằm trong [PRD](PRD.md).

## Các lớp chính

| Lớp | Thành phần | Trách nhiệm |
| --- | --- | --- |
| Giao diện | `src/features`, `src/components` | Hiển thị, nhập liệu, điều hướng và trạng thái thao tác |
| Điều phối | `AppProvider` | Chọn repository theo môi trường, theo dõi session/kết nối, cung cấp phòng và lịch |
| Dữ liệu UI | `useRealtimeQuery`, TanStack Query | Snapshot đầu, subscription realtime, cache, lỗi và thử lại |
| Hợp đồng | `src/services/repository.ts` | API chung cho demo và Firebase |
| Domain | `src/domain/model.ts` | Model, thời gian, slot, lọc và validation dùng trong demo/callable |
| Lưu cục bộ | Zustand + AsyncStorage | Preferences, draft, cache và booking demo |
| Tích hợp | Firebase Auth, Firestore, Expo Notifications | Xác thực, dữ liệu cloud và nhắc lịch native |

## Hai adapter

### Demo

`createDemoRepository` đọc danh mục `seedRooms`, lưu booking trong AsyncStorage và dùng email làm định danh phiên demo. Không xác thực mật khẩu. Một hàng đợi Promise tuần tự hóa thao tác trong cùng tiến trình JavaScript.

Adapter này gọi `validateIntent` để kiểm tra 7 ngày, thời gian bắt đầu, tối đa 3 lịch và overlap của cùng người. Không dùng hai tab hoặc hai thiết bị demo để chứng minh distributed locking.

### Firebase đang được app gọi

`createFirebaseRepository` trong [firebase.ts](../src/services/firebase.ts) dùng Firebase Authentication và Firestore JS SDK. Không có lời gọi `httpsCallable` trong adapter này.

**Tạo booking**

1. Lấy `auth.currentUser.uid`.
2. ID booking là `uid__idempotencyKey`; đọc booking cũ để xử lý retry.
3. Đọc khóa `roomSlots/roomId__date__slotId`.
4. Đọc phòng, kiểm tra phòng tồn tại/active và slot chưa bắt đầu.
5. Tạo token, ghi booking và khóa trong cùng `runTransaction`.
6. Các subscription phòng/lịch/availability cập nhật UI.

Tính idempotent yêu cầu cùng key và cùng phòng/ngày/slot. Key trùng nhưng intent khác bị từ chối.

**Hủy và trả sớm**

Đọc booking, kiểm tra chủ sở hữu, đọc khóa và xóa khóa chỉ khi nó vẫn trỏ tới booking đang xử lý. Trạng thái booking thay đổi trong cùng transaction.

**Check-in**

Kiểm tra chủ sở hữu, trạng thái `CONFIRMED` và thời gian từ 15 phút trước giờ bắt đầu đến hết giờ; cập nhật `CHECKED_IN` và `checkedInAt`. UI chỉ hiện nút trả sớm sau khi check-in.

**Các kiểm tra còn thiếu**

Firebase adapter hiện không gọi `validateIntent`, không truy vấn lịch đang hoạt động của người dùng và không dùng user guard. Vì vậy chưa bảo đảm giới hạn 3 lịch, overlap giữa hai phòng của một người và giới hạn 7 ngày ở backend.

## Cloud Functions còn trong repo

[firebase/functions/src/index.ts](../firebase/functions/src/index.ts) cung cấp `createBooking` và `cancelBooking` bằng callable API:

- ID booking là SHA-256 của UID + idempotency key.
- Dùng collection `slotLocks`, khác với `roomSlots` của app.
- Có `userGuards` để tuần tự hóa yêu cầu cùng người.
- Ghi audit vào `bookingEvents`.
- `createBooking` gọi `validateIntent`, nhưng truy vấn lịch đầu vào hiện chỉ lấy `CONFIRMED`.

Đây là implementation riêng, chưa nối vào adapter app hiện tại. Không sử dụng song song hai đường tạo booking cho cùng dữ liệu mà chưa hợp nhất cơ chế khóa, trạng thái và rules. Việc deploy Functions không tự thay đổi cách app ghi Firestore.

## Rules và ranh giới tin cậy

Rules hiện tại trong [firestore.rules](../firebase/firestore.rules):

- `rooms`: người đăng nhập được đọc, client không ghi.
- `bookings`: chủ lịch đọc; create/update phải hợp schema, giữ bất biến thông tin vé và tuân theo chuyển trạng thái.
- `roomSlots`: người đăng nhập đọc; tạo/xóa cùng booking qua `getAfter`/`existsAfter`; không update.
- `users/{uid}/favorites`: chỉ chủ tài khoản đọc/ghi.
- Các collection còn lại mặc định từ chối client; `userGuards` và `bookingEvents` chỉ backend/Admin SDK.

Rules chưa đối chiếu đầy đủ `date/slotId` với timestamps, kiểm tra giờ server, giới hạn lịch hoặc overlap. Các mốc thời gian do adapter hiện tại tính từ đồng hồ client. Không xem validation ở UI là bảo đảm an toàn backend.

QR chứa version và token ngẫu nhiên, không chứa email/tên. Chưa có scanner/verifier hay xác nhận vị trí vật lý. `roomSlots.bookingId` trong đường app có dạng chứa UID; không tuyên bố metadata availability ẩn hoàn toàn định danh người dùng.

## State, cache và kết nối

- `firstSnapshot` chuyển callback đầu thành Promise với AbortSignal; `useRealtimeQuery` tiếp tục nghe stream và cập nhật Query cache.
- Listener được giải phóng khi unmount/đổi key; callback cũ bị bỏ qua.
- Cache phòng có key theo backend. Cache booking có backend và UID.
- Cache lưu trên thiết bị được đánh dấu stale khi hydrate; lỗi stream và retry hiển thị trên UI.
- Màn Detail có query availability riêng theo backend/phòng/ngày.
- NetInfo theo dõi kết nối. UI chặn create/cancel/check-in/trả sớm khi offline.
- Mutation tạo booking không retry tự động; không có hàng đợi booking offline.
- Preferences và draft được persist theo thiết bị, chưa theo UID.
- Draft hợp lệ trong 24 giờ, được kiểm tra lại slot trước khi khôi phục và được xóa khi đặt thành công.
- Favorite có ghi best-effort lên Firestore nhưng UI hiện đọc Zustand; chưa có subscription hydrate favorites từ cloud.

## Nhắc lịch

`scheduleReminder` đặt thông báo cục bộ trước `startAt` 15 phút; yêu cầu quyền và tạo channel Android. Lịch đã quá thời điểm nhắc sẽ không được đặt thông báo mới.

ID notification được lưu trong AsyncStorage theo booking, kiểm tra lịch đã lên để tránh tạo trùng. Các thao tác schedule/cancel cùng booking được tuần tự hóa bằng Promise queue.

`sendTestReminder` đặt một notification sau 5 giây qua cùng bước thiết lập quyền/channel/foreground handler. Đây là thông báo thử, không dùng booking thật. Web trả thông báo không hỗ trợ. Chưa có remote push hoặc điều hướng tới vé khi chạm notification.

## Kiểm chứng

Ngày 25/09/2026, typecheck và 23 unit tests đạt; luồng demo trên browser đã được dùng để chụp ảnh README. Chưa chạy lại emulator và native notification trong lượt cập nhật tài liệu này.

`tests/emulator.test.ts` kiểm tra callable implementation cùng một số thao tác transaction trực tiếp theo rules; không thay thế kiểm thử toàn bộ adapter hiện tại trên hai thiết bị thật.
