# Tối Ưu Text UI Tiếng Việt Khi Port Từ Game CJK / J2ME Gốc

Khi port game gốc tiếng Trung/Nhật (mỗi chữ vuông ~`10-12px`, từ khóa chỉ 2–4 ký tự = `24-48px`) đã được Việt hóa, chữ tiếng Việt dài gấp `2x–3x` nên hàng loạt `.ui` và hộp thoại sẽ bị cắt cụt, tràn khung hoặc chẻ đôi giữa từ.

## 1. Bốn Nguyên Nhân Gốc & Giải Pháp Triệt Để (Không Cần Sửa Tay File `.ui` Nhị Phân)

1. **Ngắt dòng sớm `maxW - spaceRefWidth` (~`30px` theo `"nhung1"`):**
   - Trong `BitmapFont::wrapLines`, `ScreenBase::layoutRichText` và `DialogBox`: loại bỏ ngưỡng trừ `spaceRefWidth`!
   - Cài thuật toán **Lookahead Word-Boundary Wrapping**: duyệt trước cụm từ tiếp theo (tách tại khoảng trắng, giữ dấu `-`/`/` ở cuối dòng cũ, bỏ khoảng trắng thừa tại điểm ngắt, xử lý `#0..#7` / `#RRGGBB` tách biệt hoàn toàn khỏi bề rộng chữ). Chỉ cắt giữa từ nếu bản thân 1 từ đơn đã dài hơn toàn bộ chiều rộng khung.
   - Giải pháp này lấy lại ~25–35% chiều ngang mỗi dòng và hết triệt để tình trạng `"sủng v\nật"`.

2. **Tách `textBounds` khỏi Hình Nền & Icon (`UIStyle` + `UIScreen::optimizeVietnameseLayout`):**
   - Tuyệt đối không sửa trực tiếp `UILabel::x_/w_` nếu widget có icon (`focusIcon`/`unfocusIcon`) hoặc nền, vì sẽ làm xô lệch ảnh nút bấm/progress bar `#P`.
   - Thêm các offset vẽ text riêng trên `UIStyle`: `hasTextBounds`, `textDx`, `textW`, `textAlignOverride`, `textAutoWrap`.
   - Sau khi `parsePanel()` đọc xong file `.ui` (và **trước** khi `UIListNav::ensureBoxes` lưu khung list item), chạy `optimizeVietnameseLayout()`:
     - Bỏ qua widget có `bg`/`border` đục, chiều cao `< fontH` (thanh HP/EXP 3px `#P100`), bắt đầu bằng `#P`, hoặc widget chỉ chứa icon rỗng.
     - Lược khoảng trắng padding thừa cuối câu trong nhãn tĩnh (`"HP  "` -> `"HP"`).
     - Tìm khung bao nhỏ nhất (bỏ qua icon nhỏ chênh `<= 3px` dưới chữ) + tìm tường chặn ngang (nhãn/nút khác cùng hàng Y, chưa chồng lấn sẵn ở khung gốc); nếu 2 nhãn cạnh nhau đều cần mở rộng vào khoảng trống ở giữa thì chia đôi công bằng theo trung điểm (`mid = (bR + ax) / 2`) để đạt **`0` chồng lấn**.
     - Khôi phục căn giữa cho tiêu đề/tab vốn bị gán nhầm `align == 0` khi khoảng lề trái/phải trong khung bao bằng nhau (`|marginL - marginR| <= 2`).
     - Các nút góc sát mép phải có khoảng trống lớn bên trái (như HUD `(B) Menu` ở `(300,223,16,17)`) tự động mở rộng sang trái và chuyển sang căn phải.

3. **Auto-Wrap Nút Cao & Auto-Scroll Điềm Tĩnh Cho Mọi Nhãn Còn Tràn:**
   - Nhãn cao chứa vừa >= 2 dòng (`h >= 2 * fontH + 1`, ví dụ nút `43x24`, tab `32x26`) tự bật `textAutoWrap`; nếu toàn bộ số dòng <= `h + 1` và căn giữa không có tag `#`, tự căn giữa cả ngang lẫn dọc trên mặt nút.
   - Bỏ điều kiện cũ `(focused || w >= 80 || wrap)` vốn đóng băng mọi nhãn không focus hẹp hơn `80px`. Cho phép cuộn khi `effWrap || plainW > drawW + 1` (chừa `1px` cột trắng cuối glyph để các nhãn vừa khít như `"Hỏa"`/`"Mộc"` trong tab `16px` không bị rung `1px`).
   - Giữ tốc độ cuộn chậm dễ đọc trong `ScreenBase.cpp`: dừng đầu `2500ms` (`kScrollStartPauseMs`), dừng cuối `2200ms` (`kScrollEndPauseMs`), cuộn ngang `75ms/px` (~13.3 px/s), cuộn dọc `220ms/px` (~4.5 px/s). Reset cuộn về `0` khi đổi text hoặc mới focus.

4. **Kiểm Định Tự Động Bằng Code Sau Mỗi Thay Đổi:**
   - Chạy kiểm tra qua toàn bộ 100% file `.ui` bằng harness (`test_ui_scroll` + kiểm tra cặp `rects` trong từng `UIPanel`) khẳng định `textOverlaps == 0` và `remainingScroll` không còn nhãn bị cắt cứng.
