# Koshiro Fashion Client

Frontend React + TypeScript cho storefront và admin dashboard của Koshiro Fashion.

## Tổng Quan

Client cung cấp các nhóm chức năng chính:

- Storefront: trang chủ, danh mục, danh sách sản phẩm, chi tiết sản phẩm, tìm kiếm, wishlist, so sánh, giỏ hàng và checkout.
- Auth: đăng nhập, đăng ký, quên mật khẩu, reset mật khẩu, OAuth Google/Facebook thông qua backend.
- User profile: thông tin cá nhân, địa chỉ, đơn hàng, thông báo và phương thức thanh toán.
- Admin dashboard: sản phẩm, danh mục, đơn hàng, người dùng, vai trò/quyền, analytics, reports, settings, promotions, inventory, shipping, payments, API keys.
- Media upload: image/video upload qua backend và Cloudinary.

## Tech Stack

| Nhóm | Công nghệ |
| --- | --- |
| Framework | React 18, Vite 8 |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4, shadcn/ui |
| State | React Context, TanStack Query |
| Routing | React Router DOM 6 |
| Forms | React Hook Form, Zod |
| Charts | Recharts |
| Build | Vite + OXC minify |

## Cài Đặt

Yêu cầu:

- Node.js 20 khuyến nghị cho CI và local parity.
- npm là package manager chính của repo này.
- Backend API chạy mặc định tại `http://localhost:3000/api`.

```bash
cd Client
npm install
```

Tạo file `.env` trong thư mục `Client/`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Scripts

```bash
npm run dev       # Chạy Vite dev server
npm run build     # Build production
npm run build:dev # Build bằng mode development
npm run preview   # Preview bản build
npm run lint      # Chạy ESLint
npm run audit     # Chạy npm audit ở mức moderate trở lên
npm run env:check # Kiểm tra env local/development
npm run env:production:check # Kiểm tra env production bắt buộc
npm run verify    # Lint, build và audit dùng cho CI/local release check
```

## API Integration

Client dùng `VITE_API_URL` làm base URL. Nếu không cấu hình, fallback hiện tại là:

```text
http://localhost:3000/api
```

Các endpoint quan trọng đã được đồng bộ với backend:

```text
GET  /api/health
GET  /api/settings/public
POST /api/auth/google
POST /api/auth/facebook
POST /api/upload/video
```

Lưu ý:

- Không tự set `Content-Type: application/json` khi body là `FormData`.
- Cart API gửi kèm `size` và `color` để không merge sai variant.
- Admin payment methods dùng nhóm method riêng với tiền tố `Admin` để tránh nhầm với payment methods của customer.

## Media Strategy

- Product/category media upload đi qua backend API tại `VITE_API_URL`, sau đó backend upload lên Cloudinary.
- Client không upload trực tiếp lên Cloudinary và không cần Cloudinary secret.
- Local assets trong `public/images` chỉ dùng cho branding, banners tĩnh, fallback hoặc demo seed.
- Product/category media từ database ưu tiên `cloudinaryImages`; trường `image`/`images` legacy chỉ là fallback tương thích dữ liệu cũ.
- Production phải cấu hình `VITE_API_URL` là absolute URL kết thúc bằng `/api`.

## Cấu Trúc Chính

```text
Client/
├── public/              # Static assets, logos, banners, demo images
├── src/
│   ├── components/      # shared, admin, user, ui
│   ├── contexts/        # auth, settings, notifications, language
│   ├── hooks/           # hooks dùng chung
│   ├── lib/             # api client, services, utilities
│   ├── pages/           # auth, user, admin pages
│   ├── styles/          # responsive/mobile/markdown styles
│   └── types/           # frontend API types
├── package.json
├── package-lock.json
└── vite.config.ts
```

## Kiểm Tra Trước Khi Merge

```bash
npm run verify
```

CI của repo chạy cùng bộ kiểm tra: install bằng `npm ci`, lint, build và audit.

## License

MIT
