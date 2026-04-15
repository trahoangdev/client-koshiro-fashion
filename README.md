# 🛍️ Koshiro Fashion - Frontend Client

<div align="center">

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A premium, Japanese-inspired e-commerce frontend with modern aesthetics and comprehensive shopping functionality.**

[Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Features

### 🛒 Storefront
- **Premium UI/UX** - Minimalist, Japanese-aesthetic design with glassmorphism and smooth animations
- **Fully Responsive** - Optimized for all devices with custom mobile navigation
- **Product Catalog** - Advanced filtering, autocomplete search, and detailed product views
- **Shopping Cart** - Real-time cart management with slide-out mini-cart
- **Wishlist** - Save favorite items for later
- **Product Comparison** - Compare multiple products side by side

### 🌍 Localization
- **Multi-language Support** - English, Vietnamese, and Japanese
- **Currency Formatting** - Localized price display
- **Cultural Adaptation** - Specialized content for different regions

### 👤 User Experience
- **Dark/Light Mode** - System-aware theme switching
- **Authentication** - Secure login/registration with JWT
- **Profile Management** - Address book, order history, and settings
- **Order Tracking** - Real-time status updates

### 🔐 Admin Dashboard
- **Analytics** - Sales charts, revenue tracking, user statistics
- **Product Management** - CRUD operations with image uploads
- **Order Management** - Status updates, order details, shipping
- **User Management** - Roles, permissions, activity logs
- **Settings** - Store configuration, payment methods, shipping zones

---

## 🚀 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React 18, Vite 5 |
| **Language** | TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui |
| **State Management** | TanStack Query (React Query) |
| **Routing** | React Router DOM 6 |
| **Forms** | React Hook Form + Zod |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Image Upload** | Cloudinary |

---

## 📁 Project Structure

```
client/
├── public/                    # Static assets
│   ├── images/               # Images, banners, logos
│   └── ...
│
├── src/
│   ├── components/
│   │   ├── admin/            # 🔐 Admin-specific components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── ...
│   │   │
│   │   ├── user/             # 👤 User profile components
│   │   │   ├── ProfileSidebar.tsx
│   │   │   ├── ProfileOrders.tsx
│   │   │   ├── ProfileSettings.tsx
│   │   │   └── ...
│   │   │
│   │   ├── shared/           # 🔄 Shared/common components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── EnhancedProductGrid.tsx
│   │   │   └── ...
│   │   │
│   │   └── ui/               # 🎨 Base UI components (shadcn)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   │
│   ├── pages/
│   │   ├── admin/            # 🔐 Admin pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   ├── AdminOrders.tsx
│   │   │   ├── AdminUsers.tsx
│   │   │   ├── AdminSettings.tsx
│   │   │   └── ...
│   │   │
│   │   ├── auth/             # � Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   │
│   │   └── user/             # 🛍️ Public/User pages
│   │       ├── HomePage.tsx
│   │       ├── ProductsPage.tsx
│   │       ├── ProductDetail.tsx
│   │       ├── CartPage.tsx
│   │       ├── CheckoutPage.tsx
│   │       ├── Profile.tsx
│   │       └── ...
│   │
│   ├── contexts/             # 🌐 Global state contexts
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx
│   │   ├── SettingsContext.tsx
│   │   └── ...
│   │
│   ├── hooks/                # 🪝 Custom React hooks
│   │   ├── use-toast.ts
│   │   ├── use-mobile.ts
│   │   └── ...
│   │
│   ├── lib/                  # 🔧 Utilities & API
│   │   ├── api.ts
│   │   ├── currency.ts
│   │   ├── utils.ts
│   │   └── ...
│   │
│   ├── types/                # 📝 TypeScript definitions
│   │
│   ├── App.tsx               # Main application component
│   └── main.tsx              # Entry point
│
├── .env                      # Environment variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## �️ Installation

### Prerequisites
- **Node.js** v18.0 or higher
- **npm** or **pnpm** package manager

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/trahoangdev/client-koshiro-fashion.git
cd koshiro-fashion/client

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev

# App will be available at http://localhost:5173
```

### Environment Variables

Create a `.env` file in the client root:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Cloudinary (for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run security:check` | Run security vulnerability check |

---

## 🎨 Design System

### Color Palette
- **Primary**: Elegant gold/amber tones
- **Background**: Clean whites and soft grays
- **Dark Mode**: Deep charcoal with subtle accents

### Typography
- **Headings**: Bold, clean sans-serif
- **Body**: Readable, comfortable line height

### Components
Built on **shadcn/ui** with custom styling for:
- Glass-morphism effects
- Smooth micro-animations
- Consistent spacing and shadows

---

## 🔄 State Management

| State | Solution |
|-------|----------|
| Server State | TanStack Query (caching, refetching) |
| Auth State | React Context + localStorage |
| UI State | React useState/useReducer |
| Theme | next-themes |
| Language | Custom LanguageContext |

---

## 🌐 API Integration

The client communicates with the Koshiro Fashion API server:

```typescript
// Example API call
import { api } from '@/lib/api';

// Get products
const products = await api.getProducts({ page: 1, limit: 20 });

// Add to cart
await api.addToCart(productId, quantity, size, color);

// Place order
await api.createOrder(orderData);
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Made with ❤️ by the Koshiro Engineering Team**

*[@trahoangdev](https://github.com/trahoangdev)*

</div>
