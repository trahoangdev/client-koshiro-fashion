import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const translations = {
    en: {
      title: "Reset Password",
      subtitle: "Enter your new password",
      password: "New Password",
      confirmPassword: "Confirm New Password",
      resetPassword: "Reset Password",
      backToLogin: "Back to Login",
      passwordRequired: "Password is required",
      confirmPasswordRequired: "Please confirm your password",
      passwordsNotMatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 8 characters",
      resetSuccess: "Password reset successfully!",
      resetError: "Failed to reset password. Please try again.",
      invalidToken: "Invalid or expired reset token",
      successTitle: "Password Reset Successfully",
      successMessage: "Your password has been reset successfully. You can now login with your new password."
    },
    vi: {
      title: "Đặt Lại Mật Khẩu",
      subtitle: "Nhập mật khẩu mới của bạn",
      password: "Mật Khẩu Mới",
      confirmPassword: "Xác Nhận Mật Khẩu Mới",
      resetPassword: "Đặt Lại Mật Khẩu",
      backToLogin: "Quay Lại Đăng Nhập",
      passwordRequired: "Mật khẩu là bắt buộc",
      confirmPasswordRequired: "Vui lòng xác nhận mật khẩu",
      passwordsNotMatch: "Mật khẩu không khớp",
      passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự",
      resetSuccess: "Đặt lại mật khẩu thành công!",
      resetError: "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      invalidToken: "Token đặt lại không hợp lệ hoặc đã hết hạn",
      successTitle: "Đặt Lại Mật Khẩu Thành Công",
      successMessage: "Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới."
    },
    ja: {
      title: "パスワードリセット",
      subtitle: "新しいパスワードを入力してください",
      password: "新しいパスワード",
      confirmPassword: "新しいパスワードの確認",
      resetPassword: "パスワードリセット",
      backToLogin: "ログインに戻る",
      passwordRequired: "パスワードは必須です",
      confirmPasswordRequired: "パスワードを確認してください",
      passwordsNotMatch: "パスワードが一致しません",
      passwordTooShort: "パスワードは8文字以上である必要があります",
      resetSuccess: "パスワードリセットに成功しました！",
      resetError: "パスワードリセットに失敗しました。もう一度お試しください。",
      invalidToken: "無効または期限切れのリセットトークン",
      successTitle: "パスワードリセット成功",
      successMessage: "パスワードが正常にリセットされました。新しいパスワードでログインできます。"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const validateForm = () => {
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
    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: t.passwordTooShort,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) return;

    setIsLoading(true);

    try {
      await api.resetPassword(token, formData.password);

      toast({
        title: "Success",
        description: t.resetSuccess
      });
      setIsSuccess(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t.resetError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <Card className="w-full max-w-md rounded-xl border-2 shadow-xl bg-background/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold mb-2">{t.successTitle}</CardTitle>
                  <p className="text-muted-foreground text-lg">{t.successMessage}</p>
                </CardHeader>
                <CardContent>
                  <Link to="/login">
                    <Button className="w-full rounded-xl font-semibold h-11 shadow-lg hover:shadow-xl transition-all">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t.backToLogin}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>


      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Card className="w-full max-w-md rounded-xl border-2 shadow-xl bg-background/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl font-bold mb-2">{t.title}</CardTitle>
                <p className="text-muted-foreground text-lg">{t.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">{t.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={language === 'vi' ? 'Nhập mật khẩu mới' : language === 'ja' ? '新しいパスワードを入力' : 'Enter new password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                        placeholder={language === 'vi' ? 'Xác nhận mật khẩu mới' : language === 'ja' ? '新しいパスワードを確認' : 'Confirm new password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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

                  <Button
                    type="submit"
                    className="w-full rounded-xl font-semibold h-11 shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (language === 'vi' ? "Đang đặt lại..." : language === 'ja' ? "リセット中..." : "Resetting...") : t.resetPassword}
                  </Button>
                </form>

                <div className="text-center pt-4 border-t">
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:underline font-semibold"
                  >
                    {t.backToLogin}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>


    </div>
  );
} 