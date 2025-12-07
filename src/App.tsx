import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { MiniCartProvider } from "@/contexts/MiniCartContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import MiniCartWrapper from "./components/MiniCartWrapper";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import SalePage from "./pages/SalePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import InfoPage from "./pages/InfoPage";
import SearchPage from "./pages/SearchPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ComparePage from "./pages/ComparePage";
import ReviewsPage from "./pages/ReviewsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SizeGuidePage from "./pages/SizeGuidePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminActivity from "./pages/AdminActivity";
import AdminReviews from "./pages/AdminReviews";
import AdminSettings from "./pages/AdminSettings";
import AdminPromotionsPage from "./pages/AdminPromotionsPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminShippingPage from "./pages/AdminShippingPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import AdminRolesPage from "./pages/AdminRolesPage";
import RoleDetailPage from "./pages/RoleDetailPage";
import PermissionDetailPage from "./pages/PermissionDetailPage";
import AdminApiPage from "./pages/AdminApiPage";
import ProductFormPage from "./pages/ProductFormPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <LanguageProvider>
          <AuthProvider>
            <MiniCartProvider>
              <NotificationsProvider>
                <TooltipProvider>
                <Router>
                  <ScrollToTop />
                  <MiniCartWrapper />
                  <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/category/:id" element={<CategoryPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/sale" element={<SalePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/info" element={<InfoPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/order-tracking" element={<OrderTrackingPage />} />
                      <Route path="/compare" element={<ComparePage />} />
                      <Route path="/reviews" element={<ReviewsPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/size-guide" element={<SizeGuidePage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

                      {/* Admin Routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedAdminRoute>
                            <AdminDashboard />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/analytics"
                        element={
                          <ProtectedAdminRoute>
                            <AdminAnalyticsPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/reports"
                        element={
                          <ProtectedAdminRoute>
                            <AdminReportsPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/notifications"
                        element={
                          <ProtectedAdminRoute>
                            <AdminNotificationsPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/products"
                        element={
                          <ProtectedAdminRoute>
                            <AdminProducts />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/products/new"
                        element={
                          <ProtectedAdminRoute>
                            <ProductFormPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/products/:id/edit"
                        element={
                          <ProtectedAdminRoute>
                            <ProductFormPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/categories"
                        element={
                          <ProtectedAdminRoute>
                            <AdminCategories />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/orders"
                        element={
                          <ProtectedAdminRoute>
                            <AdminOrders />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <ProtectedAdminRoute>
                            <AdminUsers />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/activity"
                        element={
                          <ProtectedAdminRoute>
                            <AdminActivity />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/reviews"
                        element={
                          <ProtectedAdminRoute>
                            <AdminReviews />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <ProtectedAdminRoute>
                            <AdminSettings />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/promotions"
                        element={
                          <ProtectedAdminRoute>
                            <AdminPromotionsPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/inventory"
                        element={
                          <ProtectedAdminRoute>
                            <AdminInventoryPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/shipping"
                        element={
                          <ProtectedAdminRoute>
                            <AdminShippingPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/payments"
                        element={
                          <ProtectedAdminRoute>
                            <AdminPaymentsPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/roles"
                        element={
                          <ProtectedAdminRoute>
                            <AdminRolesPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/roles/:id"
                        element={
                          <ProtectedAdminRoute>
                            <RoleDetailPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/roles/:id/edit"
                        element={
                          <ProtectedAdminRoute>
                            <RoleDetailPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/permissions/:id"
                        element={
                          <ProtectedAdminRoute>
                            <PermissionDetailPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/permissions/:id/edit"
                        element={
                          <ProtectedAdminRoute>
                            <PermissionDetailPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      <Route
                        path="/admin/api"
                        element={
                          <ProtectedAdminRoute>
                            <AdminApiPage />
                          </ProtectedAdminRoute>
                        }
                      />
                      
                      {/* 404 Not Found Route - Must be last */}
                      <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
              </TooltipProvider>
            </NotificationsProvider>
            </MiniCartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
}

export default App;