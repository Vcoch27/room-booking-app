import { Room } from "./model";
export const seedRooms: Room[] = [
  {
    id: "a301",
    name: "Phòng học nhóm A301",
    building: "Tòa A",
    floor: 3,
    capacity: 8,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng", "Máy chiếu"],
    description:
      "Một góc yên tĩnh để cùng nhau làm nên ý tưởng lớn. Phù hợp thảo luận nhóm, ôn tập và chuẩn bị thuyết trình.",
    active: true,
  },
  {
    id: "a302",
    name: "Phòng tự học A302",
    building: "Tòa A",
    floor: 3,
    capacity: 4,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng"],
    description:
      "Không gian nhỏ, tập trung sâu. Vui lòng giữ yên lặng và dọn chỗ trước khi rời phòng.",
    active: true,
  },
  {
    id: "b201",
    name: "Computer Lab B201",
    building: "Tòa B",
    floor: 2,
    capacity: 30,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Máy chiếu"],
    description:
      "Phòng máy dành cho thực hành lập trình và làm bài tập nhóm. Không mang đồ ăn, thức uống vào khu vực máy.",
    active: true,
  },
  {
    id: "b202",
    name: "Innovation Lab B202",
    building: "Tòa B",
    floor: 2,
    capacity: 16,
    kind: "lab",
    equipment: ["Wi-Fi", "Máy tính", "Bảng trắng"],
    description:
      "Không gian thực hành và khám phá dành cho những dự án liên ngành.",
    active: true,
  },
  {
    id: "c101",
    name: "Phòng học nhóm C101",
    building: "Thư viện",
    floor: 1,
    capacity: 6,
    kind: "study",
    equipment: ["Wi-Fi", "Bảng trắng"],
    description:
      "Gần khu tài liệu tham khảo, lý tưởng cho những buổi nghiên cứu và đọc nhóm.",
    active: true,
  },
  {
    id: "c102",
    name: "Phòng seminar C102",
    building: "Thư viện",
    floor: 1,
    capacity: 20,
    kind: "study",
    equipment: ["Wi-Fi", "Máy chiếu", "Bảng trắng"],
    description:
      "Không gian thoáng cho workshop, seminar và các buổi chia sẻ học thuật.",
    active: true,
  },
];
