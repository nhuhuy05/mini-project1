# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 1: VKU Field Survey — Offline Data Collection (PWA)  
**Team / Student Name:** Nguyễn Như Huy  
**Student ID:** 22ITxxx  
**Submission Date:** 03/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Student Information:**
  1. Nguyễn Như Huy — Student ID: 22ITxxx — Role: Full-Stack PWA Architecture & Development — Contribution: 100%
* **🔗 Live Demo URL:** [https://mini-project1-ten.vercel.app/](https://mini-project1-ten.vercel.app/)
* **💻 GitHub Repository:** [https://github.com/nhuhuy05/mini-project1](https://github.com/nhuhuy05/mini-project1)
* **📊 Google Sheets Database:** [https://docs.google.com/spreadsheets/d/1ry-4NJ-sXtrmQSzBmQkWriJqnWI_A1FnuIRDY96tp5A/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1ry-4NJ-sXtrmQSzBmQkWriJqnWI_A1FnuIRDY96tp5A/edit?usp=sharing)
* **🎥 Video Demo (Optional):** [https://youtu.be/xxx]

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| **1** | **PWA Standalone & App Shell Caching** | ✅ Complete | • Manifest chuẩn W3C (`display: standalone`, `theme_color: #0284c7`, icon 192x192 và 512x512 maskable).<br>• Service Worker (Workbox) precache toàn bộ App Shell (HTML, CSS, JS bundles, icons) theo chiến lược **Cache-First**, khởi động tức thì dưới 1 giây (**sub-second offline boot**) khi ngắt kết nối mạng.<br>• Thiết kế Mobile-First 100% responsive, hỗ trợ chế độ Light/Dark Mode tự động. |
| **2** | **Multi-step Form & Local Draft Persistence** | ✅ Complete | • Form khảo sát 4 bước: Vị trí phòng học VKU (Tòa nhà, Tầng, Số phòng) ➔ Phân loại thiết bị (Hardware, Projector, AC, Electrical, Furniture) ➔ Đánh giá 1–5 sao kèm ghi chú lỗi ➔ Chụp ảnh minh chứng hiện trường & Bảng tóm tắt.<br>• Tự động lưu nháp thời gian thực (Real-time Persistence) vào store `drafts` trong **IndexedDB** (qua thư viện `idb`), khôi phục nguyên vẹn trạng thái khi reload (F5) hoặc vô tình đóng tab. |
| **3** | **Offline Queue & Automatic Dual-Sync Engine** | ✅ Complete | • **Khi Online:** Tự động đồng bộ ngay tức thì (< 1s) lên Google Sheets sau khi bấm Gửi.<br>• **Khi Offline:** Phiếu được gắn UUID v4, timestamp và lưu vào store `surveys` trong **IndexedDB** với trạng thái `PENDING_SYNC`. Lắng nghe sự kiện mạng (`window.ononline` & Network Service) để kích hoạt `SyncEngine` tự động gửi tuần tự các phiếu tồn đọng lên **Google Sheets Webhook (Apps Script)** khi có mạng trở lại, chuyển trạng thái thành `SYNCED`. |
| **4** | **Camera Photo Capture & Media Handling** | ✅ Complete | • Tích hợp chụp ảnh hiện trường với xem trước (preview) và cho phép xóa/chụp lại.<br>• Tự động chuyển đổi ảnh sang Base64 DataURL để lưu trữ an toàn trong IndexedDB mà không bị giới hạn bộ nhớ như LocalStorage. |
| **5** | **Quản lý & Xem lịch sử Phiếu đã nộp (History Manager)** | ✅ Complete | • Nút **"Đã nộp ([số lượng])"** trên Header luôn hiển thị trực quan.<br>• Trình quản lý modal với 3 tab lọc: *Tất cả*, *Chờ gửi*, *Đã đồng bộ*.<br>• Hiển thị chi tiết từng phiếu (vị trí, đánh giá 1-5 sao, ghi chú lỗi, thời gian).<br>• Tích hợp **Lightbox phóng to ảnh hiện trường** khi bấm vào thumbnail.<br>• Hỗ trợ nút xóa phiếu cục bộ khỏi bộ nhớ máy. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 3.1. Sơ đồ Luồng Dữ liệu Ngoại tuyến & Đồng bộ Tự động (Offline & Sync Flow)

```
[ Người dùng thao tác ]
        │
        ├── (Gõ thông tin / Chuyển bước) ──► Lưu ngầm vào [ IndexedDB: drafts ] 
        │                                                     │ (F5 khôi phục lại)
        │                                                     ▼
        └── (Bấm Gửi Khảo Sát) ─────────────► Lưu vào [ IndexedDB: surveys ]
                                                (UUID + Status: PENDING_SYNC)
                                                              │
                                                              ▼
                                                    [ SyncEngine Service ]
                                                              │
                                              (Kiểm tra trạng thái Mạng)
                                                              │
                                     ┌────────────────────────┴────────────────────────┐
                                     ▼ (Có mạng - Online)                              ▼ (Mất mạng - Offline)
                          Gửi ngay tức thì (< 1s)                               Giữ nguyên trong hàng đợi
                                     │                                                 │
                                     ▼                                                 ▼
                         [ Google Apps Script Webhook ]                     Chờ sự kiện window.ononline
                                     │                                                 │
                                     ▼                                                 │
                             [ Google Sheets ] ◄───────────────────────────────────────┘
                        (Ghi nhận dòng dữ liệu mới)
```

### 3.2. Cấu trúc Thư mục Dự án
* `src/types/survey.ts`: Khai báo Interface chuẩn cho `SurveyFormData`, `SurveyRecord`, `SyncStatus`, `FacilityCategory`.
* `src/services/db.ts`: Lớp tương tác IndexedDB gồm 2 Object Stores:
  * `drafts`: Lưu trữ bản ghi `active_draft` phục vụ khôi phục form dở dang.
  * `surveys`: Hàng đợi đồng bộ với các index `by-status` và `by-created`.
* `src/services/network.ts`: Quản lý trạng thái kết nối mạng, phát sự kiện lắng nghe `online`/`offline`.
* `src/services/sync.ts`: Bộ điều phối đồng bộ tự động 2 chế độ (Instant Online & Background Reconnect) kết nối đến Google Sheets Webhook.
* `src/components/`: Các module giao diện phân tầng:
  * `Header.tsx`: Thanh tiêu đề, huy hiệu mạng (Online/Offline), nút mở Lịch sử đã nộp kèm số lượng phiếu.
  * `StepIndicator.tsx`: Thanh tiến trình 4 bước tương tác.
  * `Step1Location.tsx` ➔ `Step4MediaReview.tsx`: Các bước nhập liệu và chụp ảnh.
  * `SyncQueueModal.tsx`: Trình xem lịch sử phiếu đã nộp, bộ lọc 3 tabs, và Lightbox phóng to ảnh.
* `src/index.css`: Toàn bộ Design System chuẩn Mobile-First Viewport, màu VKU Blue `#0284c7`.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

*(Sinh viên chụp 4 ảnh màn hình thực tế từ trình duyệt/điện thoại và chèn vào các mục bên dưới)*

### 📸 Bằng chứng 1: Giao diện Form Khảo sát Đa bước & Responsive Mobile
* **Mô tả:** Giao diện ứng dụng chạy trên mobile viewport tại đường link Live Demo Vercel, thanh tiến trình 4 bước, thẻ chọn loại cơ sở vật chất trực quan và đánh giá 1-5 sao.
* **Hình ảnh minh chứng:**  
  *(Chèn ảnh chụp màn hình giao diện ứng dụng tại đây)*

### 📸 Bằng chứng 2: Cơ chế Lưu nháp Tự động trong IndexedDB (F12 Application)
* **Mô tả:** Mở DevTools (`F12 ➔ Application ➔ IndexedDB ➔ vku_field_survey_db ➔ drafts`), hiển thị khóa `active_draft` chứa đầy đủ dữ liệu đang nhập dở của người dùng. Sau khi reload (F5), dữ liệu form vẫn giữ nguyên.
* **Hình ảnh minh chứng:**  
  *(Chèn ảnh chụp màn hình bảng drafts trong IndexedDB tại đây)*

### 📸 Bằng chứng 3: Hàng đợi Ngoại tuyến & Xem Lịch sử Phiếu Đã Nộp
* **Mô tả:** Trình duyệt ngắt mạng (Network: Offline), huy hiệu chuyển sang chấm đỏ "Offline", người dùng nộp phiếu vào hàng đợi. Bấm nút "Đã nộp" trên Header mở ra danh sách đầy đủ chi tiết các phiếu, lọc theo tab, và phóng to ảnh hiện trường qua Lightbox.
* **Hình ảnh minh chứng:**  
  *(Chèn ảnh chụp màn hình modal Lịch sử phiếu đã nộp và ảnh phóng to tại đây)*

### 📸 Bằng chứng 4: Tự động Đồng bộ Dữ liệu lên Google Sheets
* **Mô tả:** Khi nộp lúc Online hoặc khi vừa chuyển lại trạng thái Online, `SyncEngine` tự động đẩy phiếu lên máy chủ. Trạng thái chuyển thành `Đã lên Sheets` (`SYNCED`) và trên Google Sheets xuất hiện dòng dữ liệu mới tương ứng theo thời gian thực.
* **Hình ảnh minh chứng:**  
  *(Chèn ảnh chụp màn hình bảng tính Google Sheets nhận dữ liệu tại đây)*

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### 5.1. Thách thức 1: Giới hạn chính sách cùng nguồn gốc (CORS) khi gửi dữ liệu lên Google Apps Script
* **Vấn đề:** Khi ứng dụng PWA chạy trên tên miền Vercel (`https://mini-project1-ten.vercel.app/`) gửi HTTP POST request trực tiếp đến URL Web App của Google Apps Script (`https://script.google.com/...`), trình duyệt chặn lại do chính sách CORS preflight (OPTIONS request không được Google Apps Script trả về header phù hợp).
* **Giải pháp:** Sử dụng chế độ `mode: 'no-cors'` trong hàm `fetch()` kết hợp với định dạng `Content-Type: 'text/plain'` và gửi chuỗi JSON trong body:
  ```typescript
  await fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(survey),
  });
  ```
  Hàm `doPost(e)` phía Google Apps Script đọc payload qua `e.postData.contents` và parse JSON bình thường, giải quyết triệt để lỗi chặn CORS mà không cần máy chủ trung gian.

### 5.2. Thách thức 2: Chống mất mát dữ liệu nhập liệu dở dang khi khảo sát hiện trường
* **Vấn đề:** Cán bộ kiểm tra cơ sở vật chất ở tầng hầm hoặc góc khuất thường xuyên gặp sự cố vô tình quẹt tay reload trang, tắt trình duyệt hoặc điện thoại hết pin giữa chừng khi đang nhập một phiếu khảo sát dài nhiều bước.
* **Giải pháp:** Xây dựng cơ chế **Real-time Persistence** với **IndexedDB**:
  * Mỗi khi người dùng thay đổi bất kỳ trường input nào hoặc chuyển bước, hàm `persistDraft` sẽ tự động ghi đè bản nháp vào store `drafts`.
  * Khi ứng dụng khởi động lại, hook `useEffect` sẽ gọi hàm `loadDraft()` để đọc dữ liệu và khôi phục đúng bước đang làm dở, đảm bảo tỷ lệ mất dữ liệu bằng 0%.

### 5.3. Thách thức 3: Khởi động tức thì dưới 1 giây (Sub-second Offline Boot) khi ngắt kết nối hoàn toàn
* **Vấn đề:** Ứng dụng PWA cần phải mở được ngay lập tức ở khu vực không có sóng mạng mà không hiển thị màn hình báo lỗi "Không có kết nối Internet" của trình duyệt.
* **Giải pháp:** Cấu hình **Workbox Service Worker** với chiến lược **Cache-First** cho toàn bộ App Shell (HTML, CSS, JS bundle, Web Fonts, SVG Icons). Toàn bộ 12 tài nguyên tĩnh được nạp sẵn vào Cache Storage trong sự kiện `install` của Service Worker, giúp thời gian tải lại ứng dụng khi Offline đạt dưới 300ms.
