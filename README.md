## Chức năng và các trang

Các route được khai báo trong `FE/src/App.jsx`:

| Route | Mô tả |
|---|---|
| `/` | Chuyển hướng đến `/login` |
| `/login` | Trang đăng nhập |
| `/admin` | Quản lý người dùng, được bọc bởi `AuthGuard` và `AdminLayout` |
| `/adminForm` | Quản trị biểu mẫu |
| `/formManagement` | Trang quản lý/chọn biểu mẫu |
| `/evaluations` | Danh sách đánh giá |
| `/evaluations/edit/:id` | Chỉnh sửa đánh giá theo ID |
| `/employeeManagement` | Quản lý nhân viên |

Các trang được bố trí bằng `Layout`, `LayoutForm` hoặc `AdminLayout`. `Toaster` hiển thị thông báo ở góc trên bên phải với thời gian mặc định 3 giây.

## Cấu trúc thư mục

```text
Form_templates/
├── FE/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── ...
│   └── package.json
├── [thư-mục-BE]/
└── README.md
```

`[thư-mục-BE]` là chỗ cần thay bằng tên thư mục backend thực tế.

## Yêu cầu

Cài đặt các công cụ được khai báo trong cấu hình dự án:

- Git
- Runtime và package manager tương ứng với BE
- Runtime và package manager tương ứng với FE
- Database hoặc dịch vụ bên ngoài nếu BE yêu cầu

Trước khi cài, kiểm tra các file sau:

- `FE/package.json` và lockfile trong `FE/`
- Manifest và lockfile trong thư mục BE
- File `.env.example` hoặc tài liệu cấu hình
- Hướng dẫn database và migration, nếu có

## Cài đặt

### 1. Lấy mã nguồn

```powershell
git clone [URL_REPOSITORY]
cd Form_templates
```

### 2. Cài đặt FE

```powershell
cd FE
```

Dùng lệnh tương ứng với lockfile trong thư mục FE. Với npm:

```powershell
npm ci
```

Nếu không có `package-lock.json`, dùng:

```powershell
npm install
```

Nếu dự án dùng Yarn hoặc pnpm, hãy dùng package manager tương ứng với lockfile thay vì npm.

### 3. Cài đặt BE

Mở terminal mới tại thư mục gốc rồi chuyển đến thư mục BE thực tế:

```powershell
cd [thu-mục-BE]
```

Cài dependencies theo công nghệ và manifest của BE. Ví dụ, nếu BE có `package.json`, xem hướng dẫn và scripts trong file đó; nếu dùng công nghệ khác, sử dụng lệnh cài đặt tương ứng.

## Cấu hình môi trường

Kiểm tra `.env.example` và source code để xác định tên biến môi trường cần thiết. Nếu có file mẫu, sao chép file đó tại đúng thư mục ứng dụng yêu cầu:

```powershell
Copy-Item .env.example .env
```

Không tự đặt tên biến môi trường. Các giá trị thường cần kiểm tra gồm:

- URL API mà FE dùng để gọi BE
- Cổng chạy BE
- Cấu hình CORS
- Thông tin kết nối database
- Thông tin dịch vụ bên ngoài, nếu có

Không commit `.env` hoặc thông tin bí mật lên Git. `.gitignore` hiện khai báo `.env`; hãy kiểm tra file này để đảm bảo các file cần thiết khác không bị bỏ qua ngoài ý muốn.

## Chạy ứng dụng

BE và FE thường cần chạy đồng thời trong hai terminal riêng.

### 1. Khởi động BE

Trong terminal tại thư mục BE, chạy lệnh được hướng dẫn trong manifest hoặc tài liệu dự án.

Nếu BE có `package.json`, liệt kê các scripts bằng:

```powershell
node ./src/server.js    
```

Chạy script phát triển có trong danh sách, ví dụ `npm run dev` **chỉ khi** script đó được khai báo. Với backend không dùng Node.js, sử dụng lệnh chạy tương ứng với công nghệ của backend.

### 2. Khởi động FE

Trong terminal khác:

```powershell
cd FE
npm run dev
```

Chạy script phát triển được khai báo trong `FE/package.json`, chẳng hạn `npm run dev` hoặc `npm start` nếu script đó tồn tại.

Mở địa chỉ localhost được hiển thị trong terminal. Nếu FE không kết nối được BE, kiểm tra URL API, cổng backend và cấu hình CORS.

## Build và kiểm thử

Kiểm tra scripts có sẵn tại từng phần bằng lệnh tương ứng. Với FE dùng npm:

```powershell
cd FE
npm run
```

Chỉ chạy các lệnh đã được khai báo, ví dụ:

```powershell
npm test
npm run build
```

Thực hiện tương tự tại thư mục BE theo công nghệ của backend.

## Xử lý lỗi thường gặp

- **Không tìm thấy script:** chạy `npm run` trong đúng thư mục và dùng tên script có trong `package.json`.
- **Thiếu dependencies:** cài lại dependencies trong đúng thư mục FE hoặc BE.
- **Lỗi kết nối database:** kiểm tra database đang chạy và cấu hình môi trường.
- **FE không gọi được BE:** kiểm tra URL API, cổng backend và CORS.
- **Cổng đang được sử dụng:** dừng tiến trình chiếm cổng hoặc đổi cổng theo cấu hình dự án.
- **Không truy cập được route:** xác nhận ứng dụng đã được khởi động và kiểm tra route trong `FE/src/App.jsx`.