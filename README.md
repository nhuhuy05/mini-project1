# 📱 VKU Field Survey — Offline Data Collection (PWA)

> **Môn học:** Phát triển ứng dụng di động đa nền tảng (Cross-Platform Mobile App Development)  
> **Đơn vị:** Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)  
> **Dự án:** Mini-Project 1 — Offline-First Facility Audit PWA  
> **🔗 Live Demo PWA:** [https://mini-project1-ten.vercel.app/](https://mini-project1-ten.vercel.app/)  
> **💻 GitHub Repository:** [https://github.com/nhuhuy05/mini-project1](https://github.com/nhuhuy05/mini-project1)  
> **📊 Google Sheets Database:** [https://docs.google.com/spreadsheets/d/1ry-4NJ-sXtrmQSzBmQkWriJqnWI_A1FnuIRDY96tp5A/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1ry-4NJ-sXtrmQSzBmQkWriJqnWI_A1FnuIRDY96tp5A/edit?usp=sharing)  

---

## 🎯 Giới thiệu Dự án & Bối cảnh Thực tế

Tại khuôn viên Đại học CNTT & TT Việt - Hàn (VKU), các cán bộ thanh tra cơ sở vật chất và sinh viên kiểm định thường xuyên phải tiến hành kiểm tra tình trạng thiết bị (máy chiếu, máy tính phòng lab, điều hòa nhiệt độ, hệ thống điện, bàn ghế...) tại các khu vực **tầng hầm hoặc phòng kín nơi sóng Wi-Fi và 4G/5G hoàn toàn bị mất**.

**VKU Field Survey** là ứng dụng di động dạng **Progressive Web App (PWA)** theo kiến trúc **Offline-First**, giải quyết trọn vẹn bài toán:
1. **Hoạt động 100% Offline:** Nhập liệu, chụp ảnh hiện trường và lưu trữ dữ liệu hoàn toàn không phụ thuộc vào kết nối mạng.
2. **Khởi động tức thì (Sub-second Boot < 1s):** Service Worker áp dụng chiến lược **Cache-First** để tải App Shell ngay cả khi ngắt kết nối hoàn toàn.
3. **Chống mất dữ liệu (Real-time Draft Persistence):** Mọi thao tác nhập liệu đều được tự động lưu ngầm vào **IndexedDB**; khi người dùng tải lại trang (F5) hoặc tắt trình duyệt, dữ liệu vẫn được khôi phục nguyên vẹn.
4. **Tự động đồng bộ 2 chế độ (Instant & Background Sync):**
   * *Khi Online:* Nộp phiếu là dữ liệu được gửi thẳng và cập nhật ngay vào **Google Sheets** trong vòng 1 giây.
   * *Khi Offline:* Phiếu được lưu vào hàng đợi `PENDING_SYNC` và tự động đồng bộ ngầm khi thiết bị có mạng trở lại mà không cần người dùng thao tác thêm.
5. **Trình Quản lý Lịch sử Phiếu đã nộp & Xem ảnh:** Người dùng dễ dàng xem lại toàn bộ phiếu đã gửi, lọc trạng thái, phóng to ảnh minh chứng qua Lightbox và quản lý dữ liệu trực tiếp trên thiết bị.

---

## 📋 Bảng Tính năng Cốt lõi (Core Feature Checklist)

| # | Tính năng yêu cầu | Mức độ hoàn thành & Chi tiết kỹ thuật | Trạng thái |
|:---:|---|---|:---:|
| **1** | **PWA Standalone & App Shell Caching** | Cấu hình `manifest.json` chuẩn `display: standalone`, màu chủ đạo VKU `#0284c7`, bộ icon 192x192 & 512x512 (`purpose: any maskable`). Service Worker precache toàn bộ App Shell qua Workbox với chiến lược **Cache-First**, khởi động < 1s. Hỗ trợ cài đặt trực tiếp (A2HS) từ trình duyệt. | ✅ Complete |
| **2** | **Multi-step Inspection Form** | Form khảo sát 4 bước tối ưu cho Mobile Viewport:<br>• **Bước 1:** Vị trí (Tòa nhà VKU: Khu V, Khu A, Khu B, KTX...; Tầng; Phòng số).<br>• **Bước 2:** Phân loại thiết bị (Hardware, Projector, AC, Electrical, Furniture).<br>• **Bước 3:** Đánh giá 1–5 sao & Ghi chú lỗi chi tiết kèm gợi ý nhanh.<br>• **Bước 4:** Chụp ảnh hiện trường & Bảng tóm tắt thông tin trước khi nộp. | ✅ Complete |
| **3** | **Real-time Draft Persistence (IndexedDB)** | Tự động lưu nháp liên tục vào bảng `drafts` của **IndexedDB** (sử dụng thư viện `idb`). Chống mất dữ liệu hoàn toàn khi reload (F5) hay vô tình đóng tab. | ✅ Complete |
| **4** | **Automatic Sync Engine & Google Sheets Webhook** | • **Khi Online:** Tự động gửi ngay tức thì lên Google Sheets sau khi bấm Gửi.<br>• **Khi Offline:** Lưu vào hàng đợi `PENDING_SYNC`. Lắng nghe sự kiện `online` để kích hoạt `SyncEngine` tự động quét và gửi tuần tự khi có mạng, chuyển trạng thái sang `SYNCED`. | ✅ Complete |
| **5** | **Camera Photo Capture** | Hỗ trợ chụp ảnh trực tiếp từ Camera thiết bị hoặc tải ảnh từ thư viện, nén và chuyển đổi sang DataURL để lưu cục bộ trong IndexedDB. | ✅ Complete |
| **6** | **Quản lý & Xem lịch sử Phiếu đã nộp (History Manager)** | • Nút **"Đã nộp ([số lượng])"** trên Header luôn hiển thị để truy cập nhanh.<br>• Bộ lọc 3 tab: *Tất cả*, *Chờ gửi*, *Đã đồng bộ*.<br>• Hiển thị chi tiết từng phiếu (vị trí, đánh giá sao, ghi chú lỗi, thời gian nộp).<br>• **Lightbox phóng to ảnh:** Bấm vào thumbnail để phóng to ảnh hiện trường toàn màn hình.<br>• Nút xóa phiếu cục bộ khỏi bộ nhớ máy. | ✅ Complete |

---

## 🛠️ Ngăn xếp Công nghệ (Tech Stack)

* **Giao diện & Logic:** React 19, TypeScript, Vite 8
* **Styling & Design System:** Vanilla CSS chuẩn Mobile-First Viewport, Gam màu VKU Sky Blue (`#0284c7`), Hỗ trợ Dark/Light Mode, Card Glassmorphism, Micro-animations
* **Tầng lưu trữ dữ liệu (Client Storage):** `idb` (Thư viện Promise Wrapper cho IndexedDB chuẩn W3C)
* **PWA & Caching Engine:** `vite-plugin-pwa` (Workbox Service Worker, Precache App Shell, Cache-First Strategy)
* **Backend Lưu trữ Trực tiếp (Live Cloud Sync):** Google Apps Script Web App Webhook ➔ Đồng bộ tự động vào **Google Sheets**
* **Icon Set:** `lucide-react`

---

## 📂 Cấu trúc Thư mục Mã nguồn

```text
mini-project1/
├── public/
│   ├── favicon.svg               # Biểu tượng tab trình duyệt
│   ├── pwa-192x192.svg           # Icon PWA chuẩn 192px (maskable)
│   └── pwa-512x512.svg           # Icon PWA chuẩn 512px (Splash screen)
├── src/
│   ├── types/
│   │   └── survey.ts             # Định nghĩa Type TypeScript (SurveyFormData, SurveyRecord, SyncStatus...)
│   ├── services/
│   │   ├── db.ts                 # Service IndexedDB: Quản lý 2 store 'drafts' & 'surveys'
│   │   ├── network.ts            # Theo dõi trạng thái kết nối mạng Online/Offline
│   │   ├── camera.ts             # Xử lý chụp ảnh hiện trường & nạp file ảnh
│   │   └── sync.ts               # SyncEngine: Xử lý đẩy tuần tự phiếu khảo sát lên Google Sheets Webhook
│   ├── components/
│   │   ├── Header.tsx            # Header hiển thị mạng (Online/Offline) & nút mở Lịch sử đã nộp
│   │   ├── StepIndicator.tsx     # Thanh tiến trình 4 bước khảo sát
│   │   ├── Step1Location.tsx     # Bước 1: Chọn Tòa nhà, Tầng, Số phòng
│   │   ├── Step2Category.tsx     # Bước 2: Chọn Phân loại cơ sở vật chất (5 nhóm)
│   │   ├── Step3Condition.tsx    # Bước 3: Đánh giá 1-5 sao & Ghi chú lỗi hư hỏng
│   │   ├── Step4MediaReview.tsx  # Bước 4: Chụp ảnh minh chứng, tóm tắt thông tin & nộp
│   │   └── SyncQueueModal.tsx    # Trình quản lý Lịch sử phiếu đã nộp, bộ lọc Tabs & Lightbox xem ảnh
│   ├── index.css                 # Toàn bộ Design System, Biến CSS, Mobile Viewport Layout
│   ├── App.tsx                   # Điều phối Form, Quản lý nháp tự động và nộp phiếu
│   └── main.tsx                  # Khởi tạo React Virtual DOM
├── vite.config.ts                # Cấu hình Vite & Service Worker Workbox Cache-First
├── package.json                  # Khai báo các gói thư viện
└── README.md                     # Tài liệu kỹ thuật dự án
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy Dự án Cục bộ

### 1. Yêu cầu Môi trường
* **Node.js:** `>= 18.x` (Đã kiểm thử trên Node v24 LTS)
* **npm:** `>= 9.x`
* Trình duyệt hỗ trợ PWA: Google Chrome, Microsoft Edge, Safari...

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Chạy ở Môi trường Phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:5173`.

### 4. Build bản Production PWA
```bash
npm run build
```
Quá trình build sẽ tạo thư mục `dist/` với đầy đủ mã nguồn đã tối ưu hóa, Service Worker (`sw.js`), file `manifest.webmanifest`, và danh sách 12 tài nguyên tĩnh được precache sẵn.

### 5. Chạy thử nghiệm PWA Offline (Preview)
```bash
npm run preview
```

---

## 🧪 Kịch bản Kiểm thử Thực nghiệm (Empirical Testing)

### 1. Kiểm tra Lưu nháp thời gian thực (Real-time Draft Persistence)
* **Thao tác:** Mở ứng dụng, nhập thông tin tại Bước 1 (chọn Tòa nhà Khu V, Phòng V.201), bấm sang Bước 2 chọn *Máy chiếu*. Nhấn **F5 (Reload)** hoặc tắt hẳn trình duyệt rồi mở lại.
* **Kết quả:** Ứng dụng tự động khôi phục nguyên vẹn Bước 2 và các dữ liệu đã nhập. Kiểm tra trong `F12 ➔ Application ➔ IndexedDB ➔ vku_field_survey_db ➔ drafts` để thấy bản ghi `active_draft`.

### 2. Kiểm tra Hàng đợi Ngoại tuyến & Tự động đồng bộ lên Google Sheets
* **Thao tác:** 
  1. Mở F12 ➔ tab **Network** ➔ chuyển trạng thái sang **Offline**.
  2. Huy hiệu mạng trên ứng dụng chuyển sang chấm đỏ `Offline`.
  3. Điền đầy đủ thông tin phiếu khảo sát và bấm **Lưu vào hàng đợi**.
  4. Bấm vào nút **"Đã nộp"** trên Header: Modal mở ra hiển thị phiếu khảo sát có trạng thái `Chờ gửi` (`PENDING_SYNC`).
  5. Chuyển lại tab **Network** sang **Online**:
* **Kết quả:** Ứng dụng tự động phát hiện mạng trở lại, `SyncEngine` đẩy dữ liệu lên Google Sheets. Trạng thái phiếu chuyển thành `Đã lên Sheets` (`SYNCED`) và trên **Google Sheet** xuất hiện ngay một dòng dữ liệu mới tương ứng theo thời gian thực!

### 3. Kiểm tra Khởi động khi Mất mạng (Sub-second Offline Boot)
* **Thao tác:** Trong F12 ➔ tab **Application** ➔ mục **Service Workers**, tích chọn ô **Offline**. Nhấn tổ hợp phím `Ctrl + F5` để tải lại trang.
* **Kết quả:** Trang web tải lại tức thì trong vòng `< 1 giây` trực tiếp từ Cache Storage, không gặp lỗi mất kết nối mạng.

### 4. Kiểm tra Xem Lịch sử & Phóng to ảnh (Photo Lightbox)
* **Thao tác:** Bấm nút **"Đã nộp"** trên Header ➔ Chọn tab *Tất cả* hoặc *Đã đồng bộ* ➔ Bấm vào hình ảnh thu nhỏ đính kèm trong phiếu.
* **Kết quả:** Hình ảnh hiện trường phóng to sắc nét toàn màn hình kèm nút đóng tiện lợi.

---

## 📦 Sản phẩm Bàn giao (Deliverables)

* **🌐 Live Demo URL:** [https://mini-project1-ten.vercel.app/](https://mini-project1-ten.vercel.app/)
* **💻 GitHub Repository:** [https://github.com/nhuhuy05/mini-project1](https://github.com/nhuhuy05/mini-project1)
* **📄 Short Technical Report (PDF):** Đính kèm theo mẫu tiêu chuẩn của môn học.
