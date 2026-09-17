# StudySpace design system

Tone: campus editorial, bình tĩnh, dễ đọc. Xanh thông đậm + nền giấy ấm, accent lime chỉ cho điểm nhấn. Không gradient, không emoji chức năng, không giả ảnh phòng thật.

Tokens nằm trong `src/components/ui.tsx`: ink #173D35, muted #596C64, paper #F5F6F0, border #D7DFD5, accent #DCEF86. Text 16/24, supporting 14/21, heading 21, display 32–44. System font theo nền tảng để ưu tiên tiếng Việt/text scaling. Typography exception có chủ đích so với đề xuất font display của skill.

Spacing 8/12/16/20/24; radius control 10–12, content 18–22. Không lồng card tùy tiện. Max content width 920, màn hình auth 480. Ionicons nhất quán. Targets >=44, CTA >=50. Selected chip có dấu check và accessibilityState. Không ép chiều cao card vì text scaling.

Một primary CTA/màn hình; lỗi xuất hiện tại bước thực hiện. Stale/offline và demo luôn có text. Skeleton cho feed, spinner trong CTA có busy state. Không motion trang trí nên không cần reduced-motion override.
