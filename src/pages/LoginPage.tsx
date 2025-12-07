import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts";
import { api } from "@/lib/api";
import { initGoogleSignIn, getGoogleToken, initFacebookSDK, getFacebookToken } from "@/lib/oauth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();
  const { login, isAuthenticated, googleLogin, facebookLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  // Initialize OAuth SDKs on mount
  useEffect(() => {
    // Google Client ID (you should get this from environment variables)
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    // Facebook App ID (you should get this from environment variables)
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '';

    if (googleClientId) {
      initGoogleSignIn(googleClientId).catch(console.error);
    }
    if (facebookAppId) {
      initFacebookSDK(facebookAppId).catch(console.error);
    }
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      setIsOAuthLoading(true);
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      
      if (!googleClientId) {
        toast({
          title: t.error,
          description: "Google Sign-In is not configured",
          variant: "destructive",
        });
        return;
      }

      await initGoogleSignIn(googleClientId);
      const token = await getGoogleToken(googleClientId);
      
      // Call AuthContext googleLogin (this will sync cart automatically)
      await googleLogin(token);
      
      navigate(returnUrl);
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : "Google login failed",
        variant: "destructive",
      });
    } finally {
      setIsOAuthLoading(false);
    }
  };

  // Handle Facebook Login
  const handleFacebookLogin = async () => {
    try {
      setIsOAuthLoading(true);
      const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '';
      
      if (!facebookAppId) {
        toast({
          title: t.error,
          description: "Facebook Login is not configured",
          variant: "destructive",
        });
        return;
      }

      await initFacebookSDK(facebookAppId);
      const token = await getFacebookToken();
      
      // Call AuthContext facebookLogin (this will sync cart automatically)
      await facebookLogin(token);
      
      navigate(returnUrl);
    } catch (error) {
      console.error('Facebook login error:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : "Facebook login failed",
        variant: "destructive",
      });
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const translations = {
    en: {
      title: "Welcome Back",
      subtitle: "Sign in to your account to continue",
      email: "Email",
      password: "Password",
      login: "Sign In",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      or: "or",
      continueWithGoogle: "Continue with Google",
      continueWithFacebook: "Continue with Facebook",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      invalidEmail: "Please enter a valid email",
      loginSuccess: "Login successful!",
      loginError: "Invalid email or password",
      error: "Error"
    },
    vi: {
      title: "Chào Mừng Trở Lại",
      subtitle: "Đăng nhập vào tài khoản để tiếp tục",
      email: "Email",
      password: "Mật Khẩu",
      login: "Đăng Nhập",
      forgotPassword: "Quên Mật Khẩu?",
      noAccount: "Chưa có tài khoản?",
      signUp: "Đăng Ký",
      or: "hoặc",
      continueWithGoogle: "Tiếp Tục Với Google",
      continueWithFacebook: "Tiếp Tục Với Facebook",
      emailRequired: "Email là bắt buộc",
      passwordRequired: "Mật khẩu là bắt buộc",
      invalidEmail: "Vui lòng nhập email hợp lệ",
      loginSuccess: "Đăng nhập thành công!",
      loginError: "Email hoặc mật khẩu không đúng",
      error: "Lỗi"
    },
    ja: {
      title: "おかえりなさい",
      subtitle: "アカウントにサインインして続行",
      email: "メール",
      password: "パスワード",
      login: "サインイン",
      forgotPassword: "パスワードを忘れましたか？",
      noAccount: "アカウントをお持ちでない方は",
      signUp: "サインアップ",
      or: "または",
      continueWithGoogle: "Googleで続行",
      continueWithFacebook: "Facebookで続行",
      emailRequired: "メールは必須です",
      passwordRequired: "パスワードは必須です",
      invalidEmail: "有効なメールを入力してください",
      loginSuccess: "ログインに成功しました！",
      loginError: "メールまたはパスワードが無効です",
      error: "エラー"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email) {
      toast({
        title: t.error,
        description: t.emailRequired,
        variant: "destructive"
      });
      return false;
    }
    if (!formData.password) {
      toast({
        title: t.error,
        description: t.passwordRequired,
        variant: "destructive"
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: t.error,
        description: t.invalidEmail,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Use real authentication
      await login(formData.email, formData.password);
      
      // Navigate to returnUrl or home page after successful login
      navigate(returnUrl);
    } catch (error) {
      // Error handling is already done in AuthContext
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    {/* Light mode: dark logo, Dark mode: light logo */}
                    <img
                      src="/koshino_logo_dark.png"
                      alt="Koshino Fashion Logo"
                      className="h-12 w-auto opacity-90 hover:opacity-100 transition-all duration-300 dark:hidden"
                      loading="lazy"
                    />
                    <img
                      src="/koshino_logo.png"
                      alt="Koshino Fashion Logo"
                      className="h-12 w-auto opacity-90 hover:opacity-100 transition-all duration-300 hidden dark:block"
                      loading="lazy"
                    />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
                <p className="text-muted-foreground">{t.subtitle}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      {t.forgotPassword}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : t.login}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t.or}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled={isLoading || isOAuthLoading}
                      onClick={handleGoogleLogin}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {t.continueWithGoogle}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled={isLoading || isOAuthLoading}
                      onClick={handleFacebookLogin}
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      {t.continueWithFacebook}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">{t.noAccount} </span>
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    {t.signUp}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 