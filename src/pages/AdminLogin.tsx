import { useState } from "react";
import { Eye, EyeOff, Lock, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { adminLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const translations = {
    en: {
      title: "KOSHIRO Admin",
      subtitle: "Login to dashboard",
      email: "Email",
      password: "Password",
      login: "Login",
      loggingIn: "Logging in...",
      loginSuccess: "Login successful",
      welcomeBack: "Welcome back to Admin Dashboard",
      loginFailed: "Login failed",
      invalidCredentials: "Invalid email or password",
      demoCredentials: "Demo credentials:"
    },
    vi: {
      title: "KOSHIRO Admin",
      subtitle: "Đăng nhập vào bảng điều khiển",
      email: "Email",
      password: "Mật khẩu",
      login: "Đăng nhập",
      loggingIn: "Đang đăng nhập...",
      loginSuccess: "Đăng nhập thành công",
      welcomeBack: "Chào mừng trở lại Admin Dashboard",
      loginFailed: "Đăng nhập thất bại",
      invalidCredentials: "Email hoặc mật khẩu không chính xác",
      demoCredentials: "Thông tin demo:"
    },
    ja: {
      title: "KOSHIRO Admin",
      subtitle: "ダッシュボードにログイン",
      email: "メール",
      password: "パスワード",
      login: "ログイン",
      loggingIn: "ログイン中...",
      loginSuccess: "ログイン成功",
      welcomeBack: "管理ダッシュボードへようこそ",
      loginFailed: "ログイン失敗",
      invalidCredentials: "メールまたはパスワードが正しくありません",
      demoCredentials: "デモ認証情報:"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Starting admin login...');
      await adminLogin(email, password);
      console.log('Admin login successful, navigating to /admin');
      localStorage.setItem("adminLanguage", language);
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        console.log('Navigating to admin dashboard...');
        navigate("/admin");
      }, 100);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error('Admin login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-xl border-2 shadow-xl bg-background/95 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center pb-4">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {/* Light mode: dark logo, Dark mode: light logo */}
              <img
                src="/koshino_logo_dark.png"
                alt="Koshino Fashion Logo"
                className="h-16 w-auto opacity-90 hover:opacity-100 transition-all duration-300 dark:hidden"
                loading="lazy"
              />
              <img
                src="/koshino_logo.png"
                alt="Koshino Fashion Logo"
                className="h-16 w-auto opacity-90 hover:opacity-100 transition-all duration-300 hidden dark:block"
                loading="lazy"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-3xl font-bold flex-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-lg border-2">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-md">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('vi')} className="rounded-md">
                  Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ja')} className="rounded-md">
                  日本語
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground font-medium text-lg">{t.subtitle}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold mb-2 block">{t.email}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@koshiro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-lg border-2 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold mb-2 block">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 rounded-lg border-2 focus:border-primary transition-all"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? t.loggingIn : t.login}
            </Button>
          </form>

          <Card className="mt-6 rounded-lg border-2 bg-muted/30 overflow-hidden">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">{t.demoCredentials}</p>
              <p className="text-sm font-medium">Email: admin@koshiro.com</p>
              <p className="text-sm font-medium">Password: admin123</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}