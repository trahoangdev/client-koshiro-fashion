import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useSettings } from "@/contexts";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();
  const { register, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const passwordMinLength = settings?.passwordMinLength || 8;

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const translations = {
    en: {
      title: "Create Account",
      subtitle: "Join KOSHIRO and start your fashion journey",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      register: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign In",
      or: "or",
      continueWithGoogle: "Continue with Google",
      continueWithFacebook: "Continue with Facebook",
      agreeToTerms: "I agree to the Terms of Service and Privacy Policy",
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      emailRequired: "Email is required",
      phoneRequired: "Phone number is required",
      passwordRequired: "Password is required",
      confirmPasswordRequired: "Please confirm your password",
      passwordsNotMatch: "Passwords do not match",
      invalidEmail: "Please enter a valid email",
      invalidPhone: "Please enter a valid phone number",
      passwordTooShort: `Password must be at least ${passwordMinLength} characters`,
      termsRequired: "You must agree to the terms and conditions",
      registerSuccess: "Account created successfully!",
      registerError: "Failed to create account. Please try again."
    },
    vi: {
      title: "Tạo Tài Khoản",
      subtitle: "Tham gia KOSHIRO và bắt đầu hành trình thời trang của bạn",
      firstName: "Tên",
      lastName: "Họ",
      email: "Email",
      phone: "Số Điện Thoại",
      password: "Mật Khẩu",
      confirmPassword: "Xác Nhận Mật Khẩu",
      register: "Tạo Tài Khoản",
      alreadyHaveAccount: "Đã có tài khoản?",
      signIn: "Đăng Nhập",
      or: "hoặc",
      continueWithGoogle: "Tiếp Tục Với Google",
      continueWithFacebook: "Tiếp Tục Với Facebook",
      agreeToTerms: "Tôi đồng ý với Điều Khoản Dịch Vụ và Chính Sách Bảo Mật",
      firstNameRequired: "Tên là bắt buộc",
      lastNameRequired: "Họ là bắt buộc",
      emailRequired: "Email là bắt buộc",
      phoneRequired: "Số điện thoại là bắt buộc",
      passwordRequired: "Mật khẩu là bắt buộc",
      confirmPasswordRequired: "Vui lòng xác nhận mật khẩu",
      passwordsNotMatch: "Mật khẩu không khớp",
      invalidEmail: "Vui lòng nhập email hợp lệ",
      invalidPhone: "Vui lòng nhập số điện thoại hợp lệ",
      passwordTooShort: `Mật khẩu phải có ít nhất ${passwordMinLength} ký tự`,
      termsRequired: "Bạn phải đồng ý với điều khoản và điều kiện",
      registerSuccess: "Tạo tài khoản thành công!",
      registerError: "Không thể tạo tài khoản. Vui lòng thử lại."
    },
    ja: {
      title: "アカウント作成",
      subtitle: "KOSHIROに参加してファッションの旅を始めましょう",
      firstName: "名",
      lastName: "姓",
      email: "メール",
      phone: "電話番号",
      password: "パスワード",
      confirmPassword: "パスワード確認",
      register: "アカウント作成",
      alreadyHaveAccount: "すでにアカウントをお持ちですか？",
      signIn: "サインイン",
      or: "または",
      continueWithGoogle: "Googleで続行",
      continueWithFacebook: "Facebookで続行",
      agreeToTerms: "利用規約とプライバシーポリシーに同意します",
      firstNameRequired: "名は必須です",
      lastNameRequired: "姓は必須です",
      emailRequired: "メールは必須です",
      phoneRequired: "電話番号は必須です",
      passwordRequired: "パスワードは必須です",
      confirmPasswordRequired: "パスワードを確認してください",
      passwordsNotMatch: "パスワードが一致しません",
      invalidEmail: "有効なメールを入力してください",
      invalidPhone: "有効な電話番号を入力してください",
      passwordTooShort: "パスワードは8文字以上である必要があります",
      termsRequired: "利用規約に同意する必要があります",
      registerSuccess: "アカウントが正常に作成されました！",
      registerError: "アカウントの作成に失敗しました。もう一度お試しください。"
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
    if (!formData.firstName) {
      toast({
        title: "Error",
        description: t.firstNameRequired,
        variant: "destructive"
      });
      return false;
    }
    if (!formData.lastName) {
      toast({
        title: "Error",
        description: t.lastNameRequired,
        variant: "destructive"
      });
      return false;
    }
    if (!formData.email) {
      toast({
        title: "Error",
        description: t.emailRequired,
        variant: "destructive"
      });
      return false;
    }
    if (!formData.phone) {
      toast({
        title: "Error",
        description: t.phoneRequired,
        variant: "destructive"
      });
      return false;
    }
    if (!formData.password) {
      toast({
        title: "Error",
        description: t.passwordRequired,
        variant: "destructive"
      });
      return false;
    }
    if (!formData.confirmPassword) {
      toast({
        title: "Error",
        description: t.confirmPasswordRequired,
        variant: "destructive"
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: t.passwordsNotMatch,
        variant: "destructive"
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: t.invalidEmail,
        variant: "destructive"
      });
      return false;
    }
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast({
        title: "Error",
        description: t.invalidPhone,
        variant: "destructive"
      });
      return false;
    }
    if (formData.password.length < passwordMinLength) {
      toast({
        title: "Error",
        description: language === 'vi' ? `Mật khẩu phải có ít nhất ${passwordMinLength} ký tự` :
          language === 'ja' ? `パスワードは少なくとも${passwordMinLength}文字である必要があります` :
            `Password must be at least ${passwordMinLength} characters`,
        variant: "destructive"
      });
      return false;
    }
    if (!agreeToTerms) {
      toast({
        title: "Error",
        description: t.termsRequired,
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
      // Prepare user data for registration
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      };

      await register(userData);

      // Navigate to home page after successful registration
      navigate("/");
    } catch (error) {
      // Error handling is already done in AuthContext
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background with Banner */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings?.banners?.register || "/images/banners/banner-18.png"}
          alt="Register Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <main className="relative z-10 w-full px-4 py-8 flex justify-center">
        <Card className="w-full max-w-md rounded-xl border-2 shadow-xl bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* Light mode: dark logo, Dark mode: light logo */}
                <img
                  src="/koshino_logo_dark.png"
                  alt="Koshino Fashion Logo"
                  className="h-14 w-auto opacity-90 hover:opacity-100 transition-all duration-300 dark:hidden"
                  loading="lazy"
                />
                <img
                  src="/koshino_logo.png"
                  alt="Koshino Fashion Logo"
                  className="h-14 w-auto opacity-90 hover:opacity-100 transition-all duration-300 hidden dark:block"
                  loading="lazy"
                />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">{t.title}</CardTitle>
            <p className="text-muted-foreground text-lg">{t.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold">{t.firstName}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder={language === 'vi' ? 'Tên' : language === 'ja' ? '名' : 'First name'}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 rounded-lg border-2 focus:border-primary transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold">{t.lastName}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder={language === 'vi' ? 'Họ' : language === 'ja' ? '姓' : 'Last name'}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10 rounded-lg border-2 focus:border-primary transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={language === 'vi' ? 'Nhập email của bạn' : language === 'ja' ? 'メールを入力' : 'Enter your email'}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 rounded-lg border-2 focus:border-primary transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">{t.phone}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={language === 'vi' ? 'Nhập số điện thoại' : language === 'ja' ? '電話番号を入力' : 'Enter your phone number'}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 rounded-lg border-2 focus:border-primary transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">{t.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={language === 'vi' ? 'Tạo mật khẩu' : language === 'ja' ? 'パスワードを作成' : 'Create a password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 rounded-lg border-2 focus:border-primary transition-all"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-lg"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">{t.confirmPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={language === 'vi' ? 'Xác nhận mật khẩu' : language === 'ja' ? 'パスワードを確認' : 'Confirm your password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 rounded-lg border-2 focus:border-primary transition-all"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-lg"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg bg-muted/30">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  {t.agreeToTerms}
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl font-semibold h-11 shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? (language === 'vi' ? "Đang tạo tài khoản..." : language === 'ja' ? "アカウント作成中..." : "Creating account...") : t.register}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">
                    {t.or}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full rounded-lg font-medium"
                  disabled={isLoading}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t.continueWithGoogle}
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-lg font-medium"
                  disabled={isLoading}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t.continueWithFacebook}
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm pt-4 border-t">
              <span className="text-muted-foreground">{t.alreadyHaveAccount} </span>
              <Link to="/login" className="text-primary hover:underline font-semibold">
                {t.signIn}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 