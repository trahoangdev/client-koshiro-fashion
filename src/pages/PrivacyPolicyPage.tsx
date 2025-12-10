import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  Eye,
  Users,
  Mail,
  Globe,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Privacy Policy",
      subtitle: "How we collect, use, and protect your information",
      lastUpdated: "Last updated",
      effectiveDate: "January 1, 2024",
      overview: {
        title: "Overview",
        content: "At Koshiro, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us."
      },
      sections: {
        informationWeCollect: {
          title: "Information We Collect",
          personalInfo: {
            title: "Personal Information",
            content: "We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us. This may include your name, email address, postal address, phone number, and payment information."
          },
          automaticInfo: {
            title: "Automatically Collected Information",
            content: "We automatically collect certain information about your device when you access our website, including your IP address, browser type, operating system, access times, and the pages you have viewed."
          },
          cookies: {
            title: "Cookies and Tracking Technologies",
            content: "We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent."
          }
        },
        howWeUseInfo: {
          title: "How We Use Your Information",
          purposes: [
            "Process and fulfill your orders",
            "Communicate with you about your purchases",
            "Send you marketing communications (with your consent)",
            "Improve our website and services",
            "Prevent fraud and enhance security",
            "Comply with legal obligations"
          ]
        },
        informationSharing: {
          title: "Information Sharing and Disclosure",
          content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with service providers who assist us in operating our website and conducting our business."
        },
        dataRetention: {
          title: "Data Retention",
          content: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law."
        },
        security: {
          title: "Data Security",
          content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure."
        },
        yourRights: {
          title: "Your Rights",
          rights: [
            "Access your personal information",
            "Correct inaccurate information",
            "Delete your personal information",
            "Object to processing of your information",
            "Request data portability",
            "Withdraw consent at any time"
          ]
        },
        internationalTransfers: {
          title: "International Data Transfers",
          content: "Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are subject to appropriate safeguards in accordance with applicable data protection laws."
        },
        minors: {
          title: "Children's Privacy",
          content: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us."
        },
        updates: {
          title: "Changes to This Policy",
          content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date."
        },
        contact: {
          title: "Contact Us",
          content: "If you have any questions about this Privacy Policy, please contact us at:",
          email: "privacy@koshiro.com",
          address: "123 Fashion Street, Tokyo, Japan",
          phone: "+81 3-1234-5678"
        }
      }
    },
    vi: {
      title: "Chính Sách Bảo Mật",
      subtitle: "Cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn",
      lastUpdated: "Cập nhật lần cuối",
      effectiveDate: "1 tháng 1, 2024",
      overview: {
        title: "Tổng Quan",
        content: "Tại Koshiro, chúng tôi cam kết bảo vệ quyền riêng tư của bạn và đảm bảo an toàn thông tin cá nhân. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn khi bạn truy cập website hoặc mua hàng từ chúng tôi."
      },
      sections: {
        informationWeCollect: {
          title: "Thông Tin Chúng Tôi Thu Thập",
          personalInfo: {
            title: "Thông Tin Cá Nhân",
            content: "Chúng tôi thu thập thông tin bạn cung cấp trực tiếp, chẳng hạn như khi bạn tạo tài khoản, mua hàng, đăng ký newsletter hoặc liên hệ với chúng tôi. Bao gồm tên, email, địa chỉ, số điện thoại và thông tin thanh toán."
          },
          automaticInfo: {
            title: "Thông Tin Tự Động Thu Thập",
            content: "Chúng tôi tự động thu thập một số thông tin về thiết bị của bạn khi truy cập website, bao gồm địa chỉ IP, loại trình duyệt, hệ điều hành, thời gian truy cập và các trang bạn đã xem."
          },
          cookies: {
            title: "Cookies và Công Nghệ Theo Dõi",
            content: "Chúng tôi sử dụng cookies và các công nghệ theo dõi tương tự để theo dõi hoạt động trên website và lưu trữ thông tin. Bạn có thể cài đặt trình duyệt từ chối tất cả cookies hoặc thông báo khi có cookie được gửi."
          }
        },
        howWeUseInfo: {
          title: "Cách Chúng Tôi Sử Dụng Thông Tin",
          purposes: [
            "Xử lý và thực hiện đơn hàng của bạn",
            "Liên lạc về các giao dịch mua hàng",
            "Gửi thông tin marketing (với sự đồng ý)",
            "Cải thiện website và dịch vụ",
            "Ngăn chặn gian lận và tăng cường bảo mật",
            "Tuân thủ nghĩa vụ pháp lý"
          ]
        },
        informationSharing: {
          title: "Chia Sẻ và Tiết Lộ Thông Tin",
          content: "Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân cho bên thứ ba mà không có sự đồng ý của bạn, trừ khi được mô tả trong chính sách này. Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp dịch vụ hỗ trợ vận hành website."
        },
        dataRetention: {
          title: "Lưu Trữ Dữ Liệu",
          content: "Chúng tôi lưu giữ thông tin cá nhân của bạn trong thời gian cần thiết để thực hiện các mục đích nêu trong chính sách này, trừ khi pháp luật yêu cầu hoặc cho phép thời gian lưu trữ lâu hơn."
        },
        security: {
          title: "Bảo Mật Dữ Liệu",
          content: "Chúng tôi triển khai các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân khỏi truy cập trái phép, thay đổi, tiết lộ hoặc phá hủy. Tuy nhiên, không có phương pháp truyền tải qua internet nào an toàn 100%."
        },
        yourRights: {
          title: "Quyền Của Bạn",
          rights: [
            "Truy cập thông tin cá nhân",
            "Sửa chữa thông tin không chính xác",
            "Xóa thông tin cá nhân",
            "Phản đối việc xử lý thông tin",
            "Yêu cầu chuyển giao dữ liệu",
            "Rút lại sự đồng ý bất cứ lúc nào"
          ]
        },
        internationalTransfers: {
          title: "Chuyển Giao Dữ Liệu Quốc Tế",
          content: "Thông tin của bạn có thể được chuyển giao và xử lý ở các quốc gia khác. Chúng tôi đảm bảo rằng việc chuyển giao đó tuân thủ các biện pháp bảo vệ phù hợp theo luật bảo vệ dữ liệu."
        },
        minors: {
          title: "Quyền Riêng Tư Trẻ Em",
          content: "Dịch vụ của chúng tôi không dành cho người dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 18 tuổi. Nếu bạn là phụ huynh và tin rằng con bạn đã cung cấp thông tin cho chúng tôi, vui lòng liên hệ."
        },
        updates: {
          title: "Thay Đổi Chính Sách",
          content: "Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo về mọi thay đổi bằng cách đăng chính sách mới trên trang này và cập nhật ngày 'Cập nhật lần cuối'."
        },
        contact: {
          title: "Liên Hệ",
          content: "Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:",
          email: "privacy@koshiro.com",
          address: "123 Fashion Street, Tokyo, Nhật Bản",
          phone: "+81 3-1234-5678"
        }
      }
    },
    ja: {
      title: "プライバシーポリシー",
      subtitle: "お客様の情報の収集、使用、保護について",
      lastUpdated: "最終更新日",
      effectiveDate: "2024年1月1日",
      overview: {
        title: "概要",
        content: "Koshiroでは、お客様のプライバシーを保護し、個人情報のセキュリティを確保することをお約束いたします。このプライバシーポリシーでは、ウェブサイトにアクセスいただいたり、商品をご購入いただいた際に、どのようにお客様の情報を収集、使用、開示、保護するかについて説明いたします。"
      },
      sections: {
        informationWeCollect: {
          title: "収集する情報",
          personalInfo: {
            title: "個人情報",
            content: "アカウント作成、商品購入、ニュースレター登録、お問い合わせの際に直接提供いただく情報を収集いたします。これには、お名前、メールアドレス、住所、電話番号、支払い情報が含まれる場合があります。"
          },
          automaticInfo: {
            title: "自動収集情報",
            content: "ウェブサイトにアクセスされた際に、IPアドレス、ブラウザタイプ、オペレーティングシステム、アクセス時間、閲覧されたページなど、お使いのデバイスに関する特定の情報を自動的に収集いたします。"
          },
          cookies: {
            title: "Cookieと追跡技術",
            content: "ウェブサイトでの活動を追跡し、特定の情報を保存するためにCookieや類似の追跡技術を使用しています。ブラウザの設定ですべてのCookieを拒否したり、Cookieが送信される際に通知を受けるよう設定できます。"
          }
        },
        howWeUseInfo: {
          title: "情報の使用目的",
          purposes: [
            "ご注文の処理と履行",
            "ご購入に関するコミュニケーション",
            "マーケティング情報の送信（同意に基づき）",
            "ウェブサイトとサービスの改善",
            "不正行為の防止とセキュリティ強化",
            "法的義務の遵守"
          ]
        },
        informationSharing: {
          title: "情報の共有と開示",
          content: "このポリシーに記載される場合を除き、お客様の同意なしに個人情報を第三者に販売、取引、または譲渡することはありません。ウェブサイトの運営とビジネスの実施を支援するサービスプロバイダーと情報を共有する場合があります。"
        },
        dataRetention: {
          title: "データ保持",
          content: "このプライバシーポリシーに概説された目的を達成するために必要な期間、法律で長期間の保持が要求または許可されている場合を除き、お客様の個人情報を保持いたします。"
        },
        security: {
          title: "データセキュリティ",
          content: "不正アクセス、改変、開示、破壊から個人情報を保護するため、適切な技術的・組織的セキュリティ対策を実施しています。ただし、インターネット上の伝送や電子ストレージの方法で100％安全なものはありません。"
        },
        yourRights: {
          title: "お客様の権利",
          rights: [
            "個人情報へのアクセス",
            "不正確な情報の訂正",
            "個人情報の削除",
            "情報処理への異議申し立て",
            "データポータビリティの要求",
            "いつでも同意の撤回"
          ]
        },
        internationalTransfers: {
          title: "国際データ転送",
          content: "お客様の情報は、お住まいの国以外の国に転送され処理される場合があります。そのような転送は、適用されるデータ保護法に従って適切な保護措置が講じられることを確保いたします。"
        },
        minors: {
          title: "子どもプライバシー",
          content: "当社のサービスは18歳未満の個人を対象としていません。18歳未満のお子様から個人情報を故意に収集することはありません。保護者の方で、お子様が個人情報を提供したと思われる場合は、お問い合わせください。"
        },
        updates: {
          title: "ポリシーの変更",
          content: "このプライバシーポリシーを随時更新する場合があります。新しいプライバシーポリシーをこのページに掲載し、「最終更新日」を更新することで、変更をお知らせいたします。"
        },
        contact: {
          title: "お問い合わせ",
          content: "このプライバシーポリシーに関するご質問がございましたら、以下までお問い合わせください：",
          email: "privacy@koshiro.com",
          address: "123 Fashion Street, Tokyo, Japan",
          phone: "+81 3-1234-5678"
        }
      }
    }
  };

  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


      <main className="py-8">
        <div className="container mx-auto px-4 space-y-12">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Banner Background */}
              <div className="absolute inset-0">
                <img
                  src="/images/banners/banner-04.png"
                  alt="Privacy Policy Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                    <Shield className="h-12 w-12 md:h-16 md:w-16 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-6 font-light leading-relaxed">
                  {t.subtitle}
                </p>

                <div className="flex items-center justify-center space-x-2 text-sm text-white/80">
                  <Clock className="h-4 w-4" />
                  <span>{t.lastUpdated}: {t.effectiveDate}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section>
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Overview */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Eye className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.overview.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.overview.content}
                  </p>
                </CardContent>
              </Card>

              {/* Information We Collect */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Database className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.informationWeCollect.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h3 className="font-bold mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <span>{t.sections.informationWeCollect.personalInfo.title}</span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {t.sections.informationWeCollect.personalInfo.content}
                    </p>
                  </div>

                  <Separator />

                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h3 className="font-bold mb-2 flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-primary" />
                      <span>{t.sections.informationWeCollect.automaticInfo.title}</span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {t.sections.informationWeCollect.automaticInfo.content}
                    </p>
                  </div>

                  <Separator />

                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h3 className="font-bold mb-2 flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-primary" />
                      <span>{t.sections.informationWeCollect.cookies.title}</span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {t.sections.informationWeCollect.cookies.content}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* How We Use Information */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.howWeUseInfo.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {t.sections.howWeUseInfo.purposes.map((purpose, index) => (
                      <li key={index} className="flex items-start p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 mr-3" />
                        <span className="text-muted-foreground font-medium leading-relaxed">{purpose}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Information Sharing */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.informationSharing.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.informationSharing.content}
                  </p>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Lock className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.security.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground leading-relaxed font-medium">
                        {t.sections.security.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Your Rights */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.yourRights.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {t.sections.yourRights.rights.map((right, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border-l-4 border-primary">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium leading-relaxed">{right}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Retention */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.dataRetention.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.dataRetention.content}
                  </p>
                </CardContent>
              </Card>

              {/* International Transfers */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.internationalTransfers.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.internationalTransfers.content}
                  </p>
                </CardContent>
              </Card>

              {/* Children's Privacy */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.minors.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {t.sections.minors.content}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Policy Updates */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.updates.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.updates.content}
                  </p>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.contact.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">{t.sections.contact.content}</p>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{t.sections.contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{t.sections.contact.address}</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <Users className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{t.sections.contact.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </section>
        </div>
      </main>


    </div>
  );
};

export default PrivacyPolicyPage;
