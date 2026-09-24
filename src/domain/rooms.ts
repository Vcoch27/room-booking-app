import { Room } from "./model";
export const seedRooms: Room[] = [
  {
    id: "a101",
    name: "Phòng học nhóm A101",
    building: "Tòa A",
    floor: 1,
    capacity: 6,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Điều hòa"],
    description:
      "Không gian thảo luận nhỏ gọn ngay tầng 1 Tòa A, gần căn tin và khu vực sảnh mở sinh viên.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80",
    imageKey: "room-a101",
  },
  {
    id: "a201",
    name: "Không gian sáng tạo A201",
    building: "Tòa A",
    floor: 2,
    capacity: 12,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Máy chiếu", "Điều hòa"],
    description:
      "Bàn làm việc module linh hoạt, màn hình trình chiếu hỗ trợ brainstorm và làm đồ án kỳ.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    imageKey: "room-a201",
  },
  {
    id: "a202",
    name: "Phòng thảo luận A202",
    building: "Tòa A",
    floor: 2,
    capacity: 8,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Điều hòa"],
    description:
      "Phòng kính cách âm tốt, thích hợp họp nhóm thuyết trình hoặc phỏng vấn trực tuyến.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    imageKey: "room-a202",
  },
  {
    id: "a301",
    name: "Phòng học nhóm A301",
    building: "Tòa A",
    floor: 3,
    capacity: 8,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Máy chiếu", "Điều hòa"],
    description:
      "Một góc yên tĩnh để cùng nhau làm nên ý tưởng lớn. Phù hợp thảo luận nhóm, ôn tập và chuẩn bị thuyết trình.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    imageKey: "room-a301",
  },
  {
    id: "a302",
    name: "Phòng tự học A302",
    building: "Tòa A",
    floor: 3,
    capacity: 4,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Điều hòa"],
    description:
      "Không gian nhỏ, tập trung sâu. Ánh sáng tự nhiên thoáng mát, yên tĩnh cho nghiên cứu cá nhân.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    imageKey: "room-a302",
  },
  {
    id: "a401",
    name: "Seminar Room A401",
    building: "Tòa A",
    floor: 4,
    capacity: 20,
    kind: "study",
    equipment: ["Wi-Fi", "Máy chiếu", "Bảng trắng", "Điều hòa"],
    description:
      "Phòng hội thảo chuyên đề khoa học và sinh hoạt câu lạc bộ học thuật quy mô vừa.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80",
    imageKey: "room-a401",
  },
  {
    id: "b101",
    name: "Open Lab B101",
    building: "Tòa B",
    floor: 1,
    capacity: 24,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Bảng trắng", "Điều hòa"],
    description:
      "Phòng máy mở tầng 1 Tòa B với dàn máy tính trang bị sẵn môi trường lập trình Web & Mobile.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
    imageKey: "room-b101",
  },
  {
    id: "b201",
    name: "Computer Lab B201",
    building: "Tòa B",
    floor: 2,
    capacity: 30,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Máy chiếu", "Điều hòa"],
    description:
      "Phòng máy dành cho thực hành lập trình và làm bài tập nhóm. Không mang đồ ăn, thức uống vào khu vực máy.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
    imageKey: "room-b201",
  },
  {
    id: "b202",
    name: "Innovation Lab B202",
    building: "Tòa B",
    floor: 2,
    capacity: 16,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Bảng trắng", "Điều hòa"],
    description:
      "Không gian thực hành và khám phá dành cho những dự án liên ngành, IoT và công nghệ mới.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    imageKey: "room-b202",
  },
  {
    id: "b301",
    name: "AI & Data Lab B301",
    building: "Tòa B",
    floor: 3,
    capacity: 32,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Máy chiếu", "Điều hòa"],
    description:
      "Phòng thực hành trí tuệ nhân tạo và khoa học dữ liệu với máy trạm cấu hình cao và đường truyền gigabit.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    imageKey: "room-b301",
  },
  {
    id: "b302",
    name: "Software Lab B302",
    building: "Tòa B",
    floor: 3,
    capacity: 28,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Bảng trắng", "Điều hòa"],
    description:
      "Mô hình không gian Agile dành cho sinh viên phát triển dự án phần mềm theo nhóm kỹ thuật chuyên sâu.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80",
    imageKey: "room-b302",
  },
  {
    id: "b401",
    name: "Cloud Lab B401",
    building: "Tòa B",
    floor: 4,
    capacity: 25,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Máy chiếu", "Điều hòa"],
    description:
      "Phòng lab chuyên đề điện toán đám mây và an toàn thông tin mạng của Khoa CNTT.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    imageKey: "room-b401",
  },
  {
    id: "c101",
    name: "Phòng học nhóm C101",
    building: "Tòa C",
    floor: 1,
    capacity: 6,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Điều hòa"],
    description:
      "Gần khu tài liệu tham khảo Thư viện Tòa C, lý tưởng cho những buổi nghiên cứu và đọc nhóm.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
    imageKey: "room-c101",
  },
  {
    id: "c102",
    name: "Phòng seminar C102",
    building: "Tòa C",
    floor: 1,
    capacity: 20,
    kind: "study",
    equipment: ["Wi-Fi", "Máy chiếu", "Bảng trắng", "Điều hòa"],
    description:
      "Không gian thoáng cho workshop, seminar và các buổi chia sẻ học thuật tại Thư viện.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
    imageKey: "room-c102",
  },
  {
    id: "c201",
    name: "Khu tự học yên tĩnh C201",
    building: "Tòa C",
    floor: 2,
    capacity: 10,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Điều hòa"],
    description:
      "Khu vực tự học yên tĩnh tuyệt đối tại Thư viện. Bàn cá nhân riêng biệt kèm ổ cắm thuận tiện.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80",
    imageKey: "room-c201",
  },
  {
    id: "c202",
    name: "Phòng nghiên cứu C202",
    building: "Tòa C",
    floor: 2,
    capacity: 8,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Điều hòa"],
    description:
      "Dành cho các nhóm làm khóa luận tốt nghiệp và sinh viên tham gia đề tài NCKH cấp trường.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    imageKey: "room-c202",
  },
  {
    id: "c301",
    name: "Multimedia Hub C301",
    building: "Tòa C",
    floor: 3,
    capacity: 16,
    kind: "study",
    equipment: ["Wi-Fi", "Máy chiếu", "Điều hòa"],
    description:
      "Không gian đa phương tiện hỗ trợ xem tư liệu giảng dạy số, webinar và học ngoại ngữ.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    imageKey: "room-c301",
  },
  {
    id: "v101",
    name: "Global Study Hub V101",
    building: "Tòa V",
    floor: 1,
    capacity: 14,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Máy chiếu", "Điều hòa"],
    description:
      "Tòa nhà Hợp tác Quốc tế VKU. Không gian trao đổi học thuật hiện đại giữa sinh viên và giảng viên quốc tế.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80",
    imageKey: "room-v101",
  },
  {
    id: "v201",
    name: "Startup Lab V201",
    building: "Tòa V",
    floor: 2,
    capacity: 22,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Bảng trắng", "Điều hòa"],
    description:
      "Không gian ươm tạo khởi nghiệp và sáng tạo đổi mới VKU. Thiết kế mở theo phong cách co-working hiện đại.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    imageKey: "room-v201",
  },
  {
    id: "v301",
    name: "Executive Room V301",
    building: "Tòa V",
    floor: 3,
    capacity: 12,
    kind: "study",
    equipment: ["Wi-Fi", "Máy chiếu", "Bảng trắng", "Điều hòa"],
    description:
      "Phòng họp cao cấp phục vụ các buổi pitching ý tưởng khởi nghiệp và gặp gỡ đối tác doanh nghiệp.",
    active: true,
    imageUrl:
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
    imageKey: "room-v301",
  },
];
