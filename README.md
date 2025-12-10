# Koshiro Fashion Client

A modern, Japanese-inspired e-commerce frontend built with React, TypeScript, and Vite. This application features a premium, responsive design with comprehensive shopping functionality.

## 🚀 Technologies

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Internationalization**: Custom `LanguageContext` (En, Vi, Ja)

## ✨ Key Features

- **Storefront**:
  - 🎨 **Premium UI/UX**: Minimalist, Japanese-aesthetic design with glassmorphism and smooth animations.
  - 📱 **Fully Responsive**: Optimized for all devices, including a custom portal-based **Enhanced Mobile Menu**.
  - 🛍️ **Product Catalog**: Advanced filtering, search with autocomplete, and detailed product views.
  - 🛒 **Shopping Cart**: Real-time cart management with a slide-out mini-cart.
  - ❤️ **Wishlist**: Save favorite items for later.

- **Localization**:
  - 🌍 **Multi-language Support**: Seamless switching between English, Vietnamese, and Japanese.
  - 🇯🇵 **Cultural Adaptation**: Specialized content for different regions.

- **User Experience**:
  - 🌓 **Dark/Light Mode**: System-aware theme switching.
  - ⚡ **Performance**: Optimized load times and interaction states.
  - 🔒 **Authentication**: Secure login/registration flows with JWT integration.

- **Customer Dashboard**:
  - 📦 **Order Tracking**: Real-time status updates.
  - 👤 **Profile Management**: Address book, order history, and settings.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Steps

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Client
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:8080` (or similar).

5.  **Build for Production**
    ```bash
    npm run build
    ```

## 📂 Project Structure

```
Client/
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── ui/        # Shadcn base components
│   │   └── ...        # Feature components (Header, Footer, etc.)
│   ├── contexts/      # Global state (Auth, Language, Cart, Theme)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities (API, Logger, Helpers)
│   ├── pages/         # Route components (Home, Product, Cart, etc.)
│   ├── types/         # TypeScript definitions
│   └── data/          # Static data assets
├── public/            # Static assets (images, fonts)
└── ...config files
```

## 🔄 Recent Updates

- **Enhanced Mobile Menu**: Completely redesigned mobile navigation using React Portals to solve z-index stacking issues. Features include expandable submenus, quick actions, and improved touch targets.
- **Server Integration**: Robust API integration with the Koshiro backend, including synchronized cart state.
- **Logger**: Centralized logging utility for consistent debugging and monitoring.

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Made with ❤️ by the Koshiro Engineering Team (trahoangdev)*
