# Kịch bản thao tác quay demo StudySpace

Không cần lời thoại. Quay dọc trên điện thoại, cắt các đoạn chờ tải và giữ mỗi kết quả quan trọng khoảng 2–3 giây. Bản chính dài khoảng 3–4 phút; các cảnh cần điều kiện riêng được quay thêm và ghép vào cuối.

## Chuẩn bị trước khi bấm quay

- Dùng **Firebase** nếu muốn chứng minh đăng ký/đăng nhập thật, đồng bộ hai thiết bị và chống đặt trùng. Đảm bảo đã có phòng trong Firestore và hai tài khoản thử hoạt động. Nếu dùng **demo cục bộ**, chỉ giới thiệu luồng trên một thiết bị; lịch không đồng bộ giữa các máy.
- Trên máy quay chính: bật quyền thông báo, bật **Nhắc trước 15 phút** ở Tài khoản, có Internet, xóa bộ lọc cũ và chọn trước một phòng còn trống. Không quay email/mật khẩu cá nhân.
- Chuẩn bị **lịch A** vào ngày mai để quay thao tác đặt rồi hủy. Chuẩn bị riêng **lịch B** để quay check-in: chọn khung giờ hôm nay và mở vé trong khoảng từ 15 phút trước giờ bắt đầu đến hết giờ. Hai lịch nên ở các khung giờ khác nhau.
- Nếu quay cảnh hai tài khoản: chuẩn bị máy thứ hai, đăng nhập tài khoản khác, chọn một phòng/ngày/khung giờ chưa dùng trong các cảnh trên.
- QR trên vé là mã đối chiếu; ứng dụng chưa có màn quét xác thực vé. QR chạy Expo Go qua tunnel là một QR khác, không đưa vào cảnh vé.

## Bản quay chính

| Mốc | Thao tác cần quay | Hình cần giữ lại |
| --- | --- | --- |
| 0:00–0:15 | Mở app, đăng nhập bằng tài khoản thử. Nếu dùng Firebase có thể lướt qua nút **Chưa có tài khoản? Đăng ký** trước khi đăng nhập. | Màn **Khám phá** với bốn tab: Khám phá, Lịch của tôi, Yêu thích, Tài khoản. |
| 0:15–0:45 | Lướt vài thẻ phòng. Tìm `phong hoc`, chọn **Tòa A**, mở **Bộ lọc nâng cao**, chọn **8+ chỗ** và **Máy chiếu**. | Danh sách thu hẹp tới **Phòng học nhóm A301**. |
| 0:45–1:05 | Mở A301, chạm ảnh lớn, lướt bộ ảnh, đóng ảnh toàn màn hình; kéo xuống xem mô tả và tiện nghi. | Gallery, sức chứa, thiết bị của phòng. |
| 1:05–1:40 | Chọn **ngày mai** và một khung giờ ghi **Còn trống** → **Tiếp tục đặt phòng** → xem phòng/ngày/giờ trên màn kiểm tra → **Xác nhận đặt phòng**. | Vé đặt phòng và QR, giữ khoảng 3 giây. |
| 1:40–2:05 | Về trang chính → **Lịch của tôi** → mở lại vé từ mục **Sắp tới**. | Lịch đã xác nhận vẫn có trong danh sách và mở lại được. |
| 2:05–2:25 | Mở **Tài khoản**, bật **Nhắc trước 15 phút** → bấm **Thử thông báo sau 5 giây**; giữ màn hình hoặc kéo thanh thông báo khi nó xuất hiện. | Thông báo thử StudySpace trên điện thoại. Đây là thử cơ chế thông báo, không phải lịch nhắc 15 phút đã đến hạn. |
| 2:25–2:50 | Mở lại vé lịch A → **Hủy lịch đặt** → **Đồng ý hủy lịch** → về **Lịch của tôi** → **Lịch sử**. | Vé chuyển sang **Đã hủy** và lịch xuất hiện ở Lịch sử. |
| 2:50–3:15 | Về **Khám phá**, **Xóa tất cả bộ lọc**, bấm biểu tượng tim ở một phòng → mở tab **Yêu thích**. | Phòng vừa chọn hiện trong Yêu thích. Có thể đóng/mở lại app để thấy mục yêu thích vẫn được giữ. |
| 3:15–3:35 | Mở **Tài khoản**, cho thấy quy tắc 7 ngày / tối đa 3 lịch / không trùng giờ, rồi **Đăng xuất**. | Màn đăng nhập kết thúc video chính. |

Chọn khung giờ còn trống thực tế; `07:30–09:30` chỉ là ví dụ. Nếu ngày mai không còn chỗ, đổi sang ngày khác trong 7 ngày tới.

## Cảnh ghép thêm để bao phủ tính năng phụ thuộc điều kiện

| Cảnh | Cách quay ngắn | Điều kiện / giới hạn |
| --- | --- | --- |
| **Check-in và trả phòng sớm** (20–30 giây) | Mở vé lịch B → **Check-in nhận phòng ngay** → xem trạng thái **Đang học** → **Kết thúc & Trả phòng sớm** → xác nhận → mở **Lịch sử**. | Nút check-in chỉ hiện từ 15 phút trước giờ bắt đầu đến khi lịch kết thúc. Quay cảnh này vào đúng khoảng thời gian rồi ghép vào sau cảnh vé. Không dùng lịch A đã hủy. |
| **Đặt trùng và cập nhật hai máy** (20–30 giây) | Đặt hai máy cạnh nhau, cùng mở một phòng/ngày/giờ bằng hai tài khoản Firebase. Xác nhận trên máy 1, rồi xác nhận trên máy 2. | Chỉ máy 1 nhận vé; máy 2 thấy khung giờ đã đặt hoặc thông báo xung đột. Cần Firebase đã cấu hình; demo cục bộ không chứng minh đồng bộ hai máy. |
| **Mất mạng** (10–15 giây) | Trong màn chi tiết phòng, tắt Internet; cho thấy cảnh báo và nút đặt phòng bị vô hiệu. Bật mạng lại, chờ khung giờ cập nhật. | Quay khi dữ liệu phòng đã tải. Không xác nhận đặt/hủy khi offline. |
| **Đăng nhập Google** (10–15 giây) | Từ màn đăng nhập, chạm **Tiếp tục với Google** và hoàn tất chọn tài khoản thử. | Chỉ quay bằng **development build** đã cấu hình Google Sign-In. Nút bị vô hiệu trong Expo Go trên điện thoại. |
| **Web / giao diện thích ứng** (10–15 giây) | Mở cùng app trên trình duyệt, thu hẹp và mở rộng cửa sổ để thấy danh sách đổi cột và thanh điều hướng. | Đây là cảnh bổ sung nếu cần trình bày khả năng đa nền tảng; web không gửi thông báo cục bộ như điện thoại. |

## Thứ tự dựng gợi ý

Đăng nhập → tìm/lọc → ảnh phòng → đặt phòng → vé QR → lịch sắp tới → thông báo thử → check-in/trả phòng sớm (cảnh ghép) → hủy lịch A → lịch sử → yêu thích → hai máy/offline (nếu có) → tài khoản/đăng xuất.

Giữ một lần đặt thành công và một lần hủy rõ ràng. Không ghép cảnh check-in của lịch B theo cách khiến người xem tưởng đó là lịch A đã hủy.
