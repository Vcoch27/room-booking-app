# StudySpace — phạm vi triển khai v1

Nguồn: `deep-research-report.md` do chủ dự án cung cấp. Liên kết `sandbox:/mnt/data/...` bên trong báo cáo không phải file có trong repo; bản này diễn giải yêu cầu từ nội dung có sẵn, không giả định đã đọc file liên kết.

## Mục tiêu

Sinh viên tìm phòng phù hợp, chọn một slot 2 giờ trong 7 ngày tới, xác nhận chỗ, xem vé và hủy khi không dùng. Ưu tiên tính đúng của booking trước realtime, UX và trang trí.

## Quy tắc P0

- Múi giờ campus: Asia/Ho_Chi_Minh. Hôm nay + 6 ngày kế tiếp.
- Slot: 07:30–09:30, 09:30–11:30, 13:30–15:30, 15:30–17:30.
- Tối đa 3 booking confirmed chưa kết thúc/người. Không trùng thời gian giữa hai phòng.
- Chỉ phòng active được đặt; slot đã bắt đầu không được đặt/hủy.
- Server xác nhận sau atomic commit; không optimistic confirmation, không offline mutation queue.
- Hủy idempotent giải phóng lock trong cùng transaction; client không ghi trực tiếp booking/lock.
- Room/day subscriptions được cleanup; cache/stale phải hiển thị rõ.
- QR không chứa email/tên/số sinh viên; token không phải cơ chế check-in khi chưa có verifier.

## Acceptance

1. Tìm kiếm và các bộ lọc kết hợp theo AND; không có kết quả phải chỉ cách khắc phục.
2. Hai user đặt cùng room/day/slot: đúng một request thành công.
3. Hai request của một user sang hai phòng cùng giờ: đúng một thành công.
4. Retry cùng idempotency key không sinh booking thứ hai.
5. Người khác không được đọc booking riêng hay hủy booking; không được nâng role từ client.
6. Offline cho xem cache nhưng không xác nhận mutation.
7. Reminder lỗi không làm booking thất bại; hủy/đăng xuất xóa reminder trên thiết bị.
8. Flow login → search/filter → detail → review → pass → cancel thực hiện được.

## Chưa thuộc bản v1

P1: staff/admin authorization và giao diện quản trị, check-in verifier, no-show scheduler, blackout, issue reporting, remote push, notification deep links, export calendar, analytics. P2: SSO, recurring booking, waitlist, map, sensors, multi-campus. Video/PDF và build phân phối là deliverable riêng chưa được tạo trong lượt thiết lập code này.
