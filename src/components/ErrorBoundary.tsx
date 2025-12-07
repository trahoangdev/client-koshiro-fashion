import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // TODO: In production, send error to logging service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
  const { language } = useLanguage();

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const translations = {
    en: {
      title: 'Something went wrong',
      description: 'We encountered an unexpected error. Please try again or return to the home page.',
      technicalDetails: 'Technical Details',
      reset: 'Try Again',
      goHome: 'Go Home',
      errorMessage: 'Error Message',
      stackTrace: 'Stack Trace',
    },
    vi: {
      title: 'Đã xảy ra lỗi',
      description: 'Chúng tôi gặp phải một lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.',
      technicalDetails: 'Chi Tiết Kỹ Thuật',
      reset: 'Thử Lại',
      goHome: 'Về Trang Chủ',
      errorMessage: 'Thông Báo Lỗi',
      stackTrace: 'Ngăn Xếp Lỗi',
    },
    ja: {
      title: 'エラーが発生しました',
      description: '予期しないエラーが発生しました。もう一度お試しいただくか、ホームページに戻ってください。',
      technicalDetails: '技術詳細',
      reset: '再試行',
      goHome: 'ホームに戻る',
      errorMessage: 'エラーメッセージ',
      stackTrace: 'スタックトレース',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 border-stone-200/60 dark:border-stone-700/60 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 border-b border-destructive/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-destructive/10 rounded-xl border border-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">{t.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <p className="text-muted-foreground">{t.description}</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onReset}
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105 shadow-md rounded-xl"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.reset}
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1 border-2 border-stone-200/60 dark:border-stone-700/60 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 rounded-xl"
            >
              <Home className="h-4 w-4 mr-2" />
              {t.goHome}
            </Button>
          </div>

          {/* Technical Details (only in development) */}
          {import.meta.env.DEV && error && (
            <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                {t.technicalDetails}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-foreground">{t.errorMessage}:</span>
                  <pre className="mt-1 p-2 bg-background rounded-lg border border-stone-200/60 dark:border-stone-700/60 text-xs overflow-x-auto">
                    {error.message}
                  </pre>
                </div>

                {error.stack && (
                  <div>
                    <span className="font-medium text-foreground">{t.stackTrace}:</span>
                    <pre className="mt-1 p-2 bg-background rounded-lg border border-stone-200/60 dark:border-stone-700/60 text-xs overflow-x-auto max-h-48">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo && errorInfo.componentStack && (
                  <div>
                    <span className="font-medium text-foreground">Component Stack:</span>
                    <pre className="mt-1 p-2 bg-background rounded-lg border border-stone-200/60 dark:border-stone-700/60 text-xs overflow-x-auto max-h-48">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Wrapper component to use hooks
const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;

