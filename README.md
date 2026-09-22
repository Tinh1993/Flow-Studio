# Flow Studio

Ứng dụng tạo video từ ảnh hoặc văn bản. Giao diện tiếng Việt, hỗ trợ High Quality Video Generation và MiniMax H3 Turbo LoRA.

## Chạy trên máy

Cần Node.js 22.12+.

```sh
npm ci
npm run dev
```

Mở http://127.0.0.1:4173. Để đóng gói: `npm run build`. Thư mục `dist` có thể phục vụ bằng máy chủ web tĩnh. `npm run preview` mở bản đã đóng gói.

## Sử dụng

1. Chọn mô hình. High Quality Video cần ảnh bắt đầu; MiniMax hỗ trợ văn bản không kèm ảnh.
2. Tải ảnh PNG/JPG/WebP tối đa 10 MB mỗi ảnh. Ảnh kết thúc là tùy chọn.
3. Nhập mô tả chuyển động và điều chỉnh thông số.
4. Nếu Space yêu cầu xác thực, nhập Hugging Face token ở phần Kết nối. Token không lưu vào localStorage hoặc mã nguồn.
5. Nhấn Tạo video, giữ tab mở và tải video khi hoàn tất.

Năm endpoint preview của HQ chỉ trả về **thông số dự kiến**, không phải năm hiệu ứng video. Các endpoint hiện yêu cầu `frame_multiplier` dạng số (16, 32, 64, 128), dù ví dụ tự sinh từng hiển thị dạng chuỗi. Ứng dụng dùng dạng số đã kiểm tra trực tiếp.

Ảnh, mô tả và token (nếu có) được gửi trực tiếp từ trình duyệt đến Space đã chọn. Không có máy chủ ứng dụng lưu token. Gradio run history được tắt. Giới hạn, hàng đợi, quyền truy cập, thời gian lưu video và tính khả dụng do dịch vụ bên ngoài quyết định. Nút Dừng chờ gửi yêu cầu hủy nhưng không bảo đảm tác vụ trên dịch vụ đã ngừng.

Liên kết Google Flow mở trang chính thức trong tab riêng. Ứng dụng này không giả lập đăng nhập Google/ChatGPT, không phải sản phẩm Google, và không cung cấp tài khoản hay hạn mức video.

## Kiểm tra

```sh
npm test
npm run build
```

Kiểm tra hợp đồng API, tham số, năm preview, xử lý kết quả và lỗi bằng mock không tạo video có phí. Kiểm tra API preview thật không đồng nghĩa đã xác nhận dựng video thành công.

## Xuất bản

Đã xuất bản thành công ngày 22/09/2026: https://flow-studio-tinh.tinhnoidungso.chatgpt.site

Bản Sites hiện chỉ chủ sở hữu truy cập bằng tài khoản ChatGPT đã xuất bản. Đây là địa chỉ mới; website cũ không bị thay đổi. Nguồn được sao lưu tại kho GitHub này. Đã kiểm tra 9 bài kiểm tra, build, giao diện desktop/mobile và cả năm preview với ảnh thật. Chưa xác nhận một lượt tạo video hoàn chỉnh từ dịch vụ bên ngoài.
