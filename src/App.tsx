import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Eager load Index page (homepage) for fast initial load
import Index from "./pages/Index";
import Layout from "@/components/Layout";

// Lazy load all other pages for code splitting
const Profile = lazy(() => import("./pages/Profile"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const SalePage = lazy(() => import("./pages/SalePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const SizeGuidePage = lazy(() => import("./pages/SizeGuidePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const ShippingInfoPage = lazy(() => import("./pages/ShippingInfoPage"));
const ReturnsPage = lazy(() => import("./pages/ReturnsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages - Lazy loaded
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage"));
const AdminReportsPage = lazy(() => import("./pages/AdminReportsPage"));
const AdminNotificationsPage = lazy(() => import("./pages/AdminNotificationsPage"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminActivity = lazy(() => import("./pages/AdminActivity"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminPromotionsPage = lazy(() => import("./pages/AdminPromotionsPage"));
const AdminInventoryPage = lazy(() => import("./pages/AdminInventoryPage"));
const AdminShippingPage = lazy(() => import("./pages/AdminShippingPage"));
const AdminPaymentsPage = lazy(() => import("./pages/AdminPaymentsPage"));
const AdminRolesPage = lazy(() => import("./pages/AdminRolesPage"));
const RoleDetailPage = lazy(() => import("./pages/RoleDetailPage"));
const PermissionDetailPage = lazy(() => import("./pages/PermissionDetailPage"));
const AdminApiPage = lazy(() => import("./pages/AdminApiPage"));
const ProductFormPage = lazy(() => import("./pages/ProductFormPage"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Đang tải...</p>
    </div>
  </div>
);

// Create a client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      structuralSharing: true, // Enable structural sharing for better performance
    },
    mutations: {
      retry: false,
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
          <SettingsProvider>
            <AuthProvider>
              <NotificationsProvider>
                <TooltipProvider>
                  <ErrorBoundary>
                    <Router>
                      <ScrollToTop />
                      <Routes>
                        {/* Public Routes with Layout */}
                        <Route element={<Layout />}>
                          <Route path="/" element={<Index />} />
                          <Route path="/profile" element={
                            <Suspense fallback={<PageLoader />}>
                              <Profile />
                            </Suspense>
                          } />
                          <Route path="/product/:id" element={
                            <Suspense fallback={<PageLoader />}>
                              <ProductDetail />
                            </Suspense>
                          } />
                          <Route path="/category/:slug" element={
                            <Suspense fallback={<PageLoader />}>
                              <CategoryPage />
                            </Suspense>
                          } />
                          <Route path="/categories" element={
                            <Suspense fallback={<PageLoader />}>
                              <CategoriesPage />
                            </Suspense>
                          } />
                          <Route path="/products" element={
                            <Suspense fallback={<PageLoader />}>
                              <ProductsPage />
                            </Suspense>
                          } />
                          <Route path="/cart" element={
                            <Suspense fallback={<PageLoader />}>
                              <CartPage />
                            </Suspense>
                          } />
                          <Route path="/wishlist" element={
                            <Suspense fallback={<PageLoader />}>
                              <WishlistPage />
                            </Suspense>
                          } />
                          <Route path="/checkout" element={
                            <Suspense fallback={<PageLoader />}>
                              <CheckoutPage />
                            </Suspense>
                          } />
                          <Route path="/sale" element={
                            <Suspense fallback={<PageLoader />}>
                              <SalePage />
                            </Suspense>
                          } />
                          <Route path="/about" element={
                            <Suspense fallback={<PageLoader />}>
                              <AboutPage />
                            </Suspense>
                          } />
                          <Route path="/contact" element={
                            <Suspense fallback={<PageLoader />}>
                              <ContactPage />
                            </Suspense>
                          } />
                          <Route path="/info" element={
                            <Suspense fallback={<PageLoader />}>
                              <InfoPage />
                            </Suspense>
                          } />
                          <Route path="/search" element={
                            <Suspense fallback={<PageLoader />}>
                              <SearchPage />
                            </Suspense>
                          } />
                          <Route path="/order-tracking" element={
                            <Suspense fallback={<PageLoader />}>
                              <OrderTrackingPage />
                            </Suspense>
                          } />
                          <Route path="/compare" element={
                            <Suspense fallback={<PageLoader />}>
                              <ComparePage />
                            </Suspense>
                          } />
                          <Route path="/reviews" element={
                            <Suspense fallback={<PageLoader />}>
                              <ReviewsPage />
                            </Suspense>
                          } />
                          <Route path="/login" element={
                            <Suspense fallback={<PageLoader />}>
                              <LoginPage />
                            </Suspense>
                          } />
                          <Route path="/register" element={
                            <Suspense fallback={<PageLoader />}>
                              <RegisterPage />
                            </Suspense>
                          } />
                          <Route path="/forgot-password" element={
                            <Suspense fallback={<PageLoader />}>
                              <ForgotPasswordPage />
                            </Suspense>
                          } />
                          <Route path="/reset-password" element={
                            <Suspense fallback={<PageLoader />}>
                              <ResetPasswordPage />
                            </Suspense>
                          } />
                          <Route path="/size-guide" element={
                            <Suspense fallback={<PageLoader />}>
                              <SizeGuidePage />
                            </Suspense>
                          } />
                          <Route path="/privacy-policy" element={
                            <Suspense fallback={<PageLoader />}>
                              <PrivacyPolicyPage />
                            </Suspense>
                          } />
                          <Route path="/faq" element={
                            <Suspense fallback={<PageLoader />}>
                              <FAQPage />
                            </Suspense>
                          } />
                          <Route path="/terms-of-service" element={
                            <Suspense fallback={<PageLoader />}>
                              <TermsOfServicePage />
                            </Suspense>
                          } />
                          <Route path="/shipping-info" element={
                            <Suspense fallback={<PageLoader />}>
                              <ShippingInfoPage />
                            </Suspense>
                          } />
                          <Route path="/returns" element={
                            <Suspense fallback={<PageLoader />}>
                              <ReturnsPage />
                            </Suspense>
                          } />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={
                          <Suspense fallback={<PageLoader />}>
                            <AdminLogin />
                          </Suspense>
                        } />
                        <Route
                          path="/admin"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminDashboard />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/analytics"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminAnalyticsPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/reports"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminReportsPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/notifications"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminNotificationsPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/products"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminProducts />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/products/new"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <ProductFormPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/products/:id/edit"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <ProductFormPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/categories"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminCategories />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/orders"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminOrders />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminUsers />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/activity"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminActivity />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/reviews"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminReviews />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/settings"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminSettings />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/promotions"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminPromotionsPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/inventory"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminInventoryPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/shipping"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminShippingPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/payments"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminPaymentsPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/roles"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminRolesPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/roles/:id"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <RoleDetailPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/roles/:id/edit"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <RoleDetailPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/permissions/:id"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <PermissionDetailPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/permissions/:id/edit"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <PermissionDetailPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />
                        <Route
                          path="/admin/api"
                          element={
                            <ProtectedAdminRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminApiPage />
                              </Suspense>
                            </ProtectedAdminRoute>
                          }
                        />

                        {/* 404 Not Found Route - Must be last */}
                        <Route path="*" element={
                          <Suspense fallback={<PageLoader />}>
                            <NotFound />
                          </Suspense>
                        } />
                      </Routes>
                    </Router>
                  </ErrorBoundary>
                </TooltipProvider>
              </NotificationsProvider>
            </AuthProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
}

export default App;