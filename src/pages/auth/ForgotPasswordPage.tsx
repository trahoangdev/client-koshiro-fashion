import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { language } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();

  const translations = {
    en: {
      title: "Forgot Password",
      subtitle: "Enter your email address and we'll send you a link to reset your password",
      email: "Email Address",
      resetPassword: "Send Reset Link",
      backToLogin: "Back to Login",
      emailRequired: "Email is required",
      invalidEmail: "Please enter a valid email",
      resetSuccess: "Reset link sent! Check your email",
      resetError: "Failed to send reset link. Please try again.",
      checkEmail: "Check your email",
      emailSent: "We've sent a password reset link to:",
      didntReceive: "Didn't receive the email?",
      resend: "Resend"
    },
    vi: {
      title: "Quên Mật Khẩu",
      subtitle: "Nhập địa chỉ email và chúng tôi sẽ gửi link để đặt lại mật khẩu",
      email: "Địa Chỉ Email",
      resetPassword: "Gửi Link Đặt Lại",
      backToLogin: "Quay Lại Đăng Nhập",
      emailRequired: "Email là bắt buộc",
      invalidEmail: "Vui lòng nhập email hợp lệ",
      resetSuccess: "Đã gửi link đặt lại! Kiểm tra email của bạn",
      resetError: "Không thể gửi link đặt lại. Vui lòng thử lại.",
      checkEmail: "Kiểm tra email",
      emailSent: "Chúng tôi đã gửi link đặt lại mật khẩu đến:",
      didntReceive: "Không nhận được email?",
      resend: "Gửi lại"
    },
    ja: {
      title: "パスワードを忘れた",
      subtitle: "メールアドレスを入力すると、パスワードリセットリンクをお送りします",
      email: "メールアドレス",
      resetPassword: "リセットリンクを送信",
      backToLogin: "ログインに戻る",
      emailRequired: "メールは必須です",
      invalidEmail: "有効なメールを入力してください",
      resetSuccess: "リセットリンクを送信しました！メールを確認してください",
      resetError: "リセットリンクの送信に失敗しました。もう一度お試しください。",
      checkEmail: "メールを確認",
      emailSent: "パスワードリセットリンクを送信しました:",
      didntReceive: "メールが届かない場合は",
      resend: "再送信"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const validateEmail = () => {
    if (!email) {
      toast({
        title: "Error",
        description: t.emailRequired,
        variant: "destructive"
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: t.invalidEmail,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      await api.forgotPassword(email);

      toast({
        title: "Success",
        description: t.resetSuccess
      });
      setIsSubmitted(true);
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

  const handleResend = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      await api.forgotPassword(email);

      toast({
        title: "Success",
        description: t.resetSuccess
      });
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background with Banner */}
        <div className="absolute inset-0 z-0">
          <img
            src={settings?.banners?.forgotPassword || "/images/banners/koshiro-forgotpass-bg.png"}
            alt="Forgot Password Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        </div>

        <main className="relative z-10 w-full px-4 py-8 flex justify-center">
          <Card className="w-full max-w-md rounded-xl border-2 shadow-xl bg-background/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl font-bold mb-2">{t.checkEmail}</CardTitle>
              <p className="text-muted-foreground text-lg mb-2">{t.emailSent}</p>
              <p className="font-bold text-primary text-lg">{email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                {t.didntReceive}
              </p>
              <Button
                onClick={handleResend}
                disabled={isLoading}
                className="w-full rounded-xl font-semibold h-11 shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? (language === 'vi' ? "Đang gửi..." : language === 'ja' ? "送信中..." : "Sending...") : t.resend}
              </Button>
              <Link to="/login">
                <Button variant="outline" className="w-full rounded-xl font-semibold border-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.backToLogin}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background with Banner */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings?.banners?.forgotPassword || "/images/banners/koshiro-forgotpass-bg.png"}
          alt="Forgot Password Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <main className="relative z-10 w-full px-4 py-8 flex justify-center">
        <Card className="w-full max-w-md rounded-xl border-2 shadow-xl bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold mb-2">{t.title}</CardTitle>
            <p className="text-muted-foreground text-lg">{t.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'vi' ? 'Nhập email của bạn' : language === 'ja' ? 'メールを入力' : 'Enter your email address'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-lg border-2 focus:border-primary transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl font-semibold h-11 shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? (language === 'vi' ? "Đang gửi..." : language === 'ja' ? "送信中..." : "Sending...") : t.resetPassword}
              </Button>
            </form>

            <div className="mt-6 text-center pt-4 border-t">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary hover:underline font-semibold"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToLogin}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}