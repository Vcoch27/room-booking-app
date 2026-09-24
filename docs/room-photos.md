# Bộ ảnh phòng

Trong Firestore, mở `rooms/{roomId}` và thêm trường `imageUrls` kiểu array gồm các URL HTTPS của ảnh phòng. Mỗi phần tử là một chuỗi URL truy cập được từ điện thoại. Ảnh đầu tiên là ảnh bìa; thứ tự còn lại là thứ tự trong bộ ảnh. Các tài liệu chỉ có `imageUrl` vẫn tương thích.

Ví dụ cấu trúc (thay URL minh họa bằng URL ảnh thật):

```json
{
  "imageUrls": [
    "https://example.com/rooms/a101/overview.jpg",
    "https://example.com/rooms/a101/desks.jpg",
    "https://example.com/rooms/a101/equipment.jpg"
  ]
}
```

Thẻ phòng hiện ảnh bìa và số ảnh. Trang chi tiết có ảnh lớn và hàng thumbnail; chạm ảnh lớn để mở preview toàn màn hình. Vuốt ngang hoặc bấm Trước/Sau để chuyển ảnh, bấm Đóng hoặc Back trên Android để thoát. Preview dùng `contain` để hiển thị trọn ảnh, có trạng thái tải và nút thử lại khi URL lỗi.

Không thêm ảnh mẫu của phòng khác vào dữ liệu thật. Quyền ghi danh mục phòng vẫn chỉ dành cho quản trị qua Firebase Console/Admin SDK.
