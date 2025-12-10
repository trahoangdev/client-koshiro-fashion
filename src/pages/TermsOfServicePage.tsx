import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  CreditCard,
  ShoppingBag,
  Mail,
  Globe,
  Users
} from 'lucide-react';

const TermsOfServicePage = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Terms of Service",
      subtitle: "Terms and conditions for using our services",
      lastUpdated: "Last updated",
      effectiveDate: "January 1, 2024",
      overview: {
        title: "Overview",
        content: "These Terms of Service govern your use of the Koshiro Fashion website and services. By accessing or using our services, you agree to be bound by these terms. Please read them carefully before using our services."
      },
      sections: {
        acceptance: {
          title: "Acceptance of Terms",
          content: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        useOfService: {
          title: "Use of Service",
          content: "You may use our service for lawful purposes only. You agree not to use the service:",
          restrictions: [
            "In any way that violates any applicable law or regulation",
            "To transmit or procure the sending of any advertising or promotional material without our prior written consent",
            "To impersonate or attempt to impersonate the company or any employee",
            "In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful"
          ]
        },
        products: {
          title: "Products and Pricing",
          content: "We strive to provide accurate product information and pricing. However, we reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice. Prices are subject to change without notice."
        },
        orders: {
          title: "Orders and Payment",
          content: "By placing an order, you make an offer to purchase the products. We reserve the right to accept or reject your order for any reason. Payment must be received before we can ship your order. We accept major credit cards, PayPal, and bank transfers."
        },
        shipping: {
          title: "Shipping and Delivery",
          content: "Shipping costs and estimated delivery times are provided at checkout. We are not responsible for delays caused by shipping carriers, customs, or other factors beyond our control. Risk of loss passes to you upon delivery."
        },
        returns: {
          title: "Returns and Refunds",
          content: "We offer a 30-day return policy for items in their original condition with tags attached. Refunds will be processed to your original payment method within 5-7 business days after we receive and verify the returned item."
        },
        intellectualProperty: {
          title: "Intellectual Property",
          content: "All content on this website, including text, graphics, logos, images, and software, is the property of Koshiro Fashion and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our prior written permission."
        },
        userAccounts: {
          title: "User Accounts",
          content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms."
        },
        warranties: {
          title: "Product Warranties",
          content: "We warrant that our products will be free from defects in materials and workmanship for a reasonable period. However, we are not liable for normal wear and tear, misuse, or damage caused by improper care."
        },
        liability: {
          title: "Limitation of Liability",
          content: "To the fullest extent permitted by law, Koshiro Fashion shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services or products."
        },
        indemnification: {
          title: "Indemnification",
          content: "You agree to indemnify and hold harmless Koshiro Fashion from any claims, damages, losses, liabilities, and expenses arising out of your use of the service or violation of these terms."
        },
        modifications: {
          title: "Modifications to Terms",
          content: "We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the updated terms on this page and updating the 'Last Updated' date. Your continued use of the service constitutes acceptance of the modified terms."
        },
        termination: {
          title: "Termination",
          content: "We may terminate or suspend your access to our service immediately, without prior notice, for any breach of these terms. Upon termination, your right to use the service will cease immediately."
        },
        governingLaw: {
          title: "Governing Law",
          content: "These terms shall be governed by and construed in accordance with the laws of Japan, without regard to its conflict of law provisions. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Tokyo, Japan."
        },
        contact: {
          title: "Contact Us",
          content: "If you have any questions about these Terms of Service, please contact us at:",
          email: "legal@koshiro.com",
          address: "123 Fashion Street, Tokyo, Japan",
          phone: "+81 3-1234-5678"
        }
      }
    },
    vi: {
      title: "Điều Khoản Dịch Vụ",
      subtitle: "Điều khoản và điều kiện sử dụng dịch vụ của chúng tôi",
      lastUpdated: "Cập nhật lần cuối",
      effectiveDate: "1 tháng 1, 2024",
      overview: {
        title: "Tổng Quan",
        content: "Các Điều Khoản Dịch Vụ này điều chỉnh việc sử dụng website và dịch vụ của Koshiro Fashion. Bằng cách truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý bị ràng buộc bởi các điều khoản này. Vui lòng đọc kỹ trước khi sử dụng dịch vụ của chúng tôi."
      },
      sections: {
        acceptance: {
          title: "Chấp Nhận Điều Khoản",
          content: "Bằng cách truy cập và sử dụng website này, bạn chấp nhận và đồng ý bị ràng buộc bởi các điều khoản và quy định của thỏa thuận này. Nếu bạn không đồng ý tuân thủ các điều khoản trên, vui lòng không sử dụng dịch vụ này."
        },
        useOfService: {
          title: "Sử Dụng Dịch Vụ",
          content: "Bạn chỉ có thể sử dụng dịch vụ của chúng tôi cho mục đích hợp pháp. Bạn đồng ý không sử dụng dịch vụ:",
          restrictions: [
            "Theo bất kỳ cách nào vi phạm luật hoặc quy định hiện hành",
            "Để truyền tải hoặc yêu cầu gửi bất kỳ tài liệu quảng cáo hoặc khuyến mãi nào mà không có sự đồng ý bằng văn bản trước của chúng tôi",
            "Để giả mạo hoặc cố gắng giả mạo công ty hoặc bất kỳ nhân viên nào",
            "Theo bất kỳ cách nào xâm phạm quyền của người khác, hoặc theo bất kỳ cách nào là bất hợp pháp, đe dọa, gian lận hoặc gây hại"
          ]
        },
        products: {
          title: "Sản Phẩm và Giá",
          content: "Chúng tôi cố gắng cung cấp thông tin sản phẩm và giá cả chính xác. Tuy nhiên, chúng tôi bảo lưu quyền sửa bất kỳ lỗi, sai sót hoặc thiếu sót nào và thay đổi hoặc cập nhật thông tin bất cứ lúc nào mà không cần thông báo trước. Giá có thể thay đổi mà không cần thông báo."
        },
        orders: {
          title: "Đơn Hàng và Thanh Toán",
          content: "Bằng cách đặt hàng, bạn đưa ra đề nghị mua sản phẩm. Chúng tôi bảo lưu quyền chấp nhận hoặc từ chối đơn hàng của bạn vì bất kỳ lý do nào. Thanh toán phải được nhận trước khi chúng tôi có thể giao hàng cho bạn. Chúng tôi chấp nhận các thẻ tín dụng chính, PayPal và chuyển khoản ngân hàng."
        },
        shipping: {
          title: "Giao Hàng",
          content: "Chi phí vận chuyển và thời gian giao hàng ước tính được cung cấp tại trang thanh toán. Chúng tôi không chịu trách nhiệm về các sự chậm trễ do nhà vận chuyển, hải quan hoặc các yếu tố khác ngoài tầm kiểm soát của chúng tôi. Rủi ro mất mát chuyển sang bạn khi giao hàng."
        },
        returns: {
          title: "Đổi Trả và Hoàn Tiền",
          content: "Chúng tôi cung cấp chính sách đổi trả 30 ngày cho các sản phẩm ở tình trạng ban đầu với tag còn nguyên. Hoàn tiền sẽ được xử lý về phương thức thanh toán gốc của bạn trong vòng 5-7 ngày làm việc sau khi chúng tôi nhận và xác minh sản phẩm đổi trả."
        },
        intellectualProperty: {
          title: "Sở Hữu Trí Tuệ",
          content: "Tất cả nội dung trên website này, bao gồm văn bản, đồ họa, logo, hình ảnh và phần mềm, là tài sản của Koshiro Fashion và được bảo vệ bởi luật bản quyền và thương hiệu. Bạn không thể sao chép, phân phối hoặc tạo tác phẩm phái sinh mà không có sự cho phép bằng văn bản trước của chúng tôi."
        },
        userAccounts: {
          title: "Tài Khoản Người Dùng",
          content: "Bạn chịu trách nhiệm duy trì tính bảo mật của thông tin đăng nhập tài khoản của bạn. Bạn đồng ý thông báo cho chúng tôi ngay lập tức về bất kỳ việc sử dụng trái phép tài khoản của bạn. Chúng tôi bảo lưu quyền tạm ngừng hoặc chấm dứt các tài khoản vi phạm các điều khoản này."
        },
        warranties: {
          title: "Bảo Hành Sản Phẩm",
          content: "Chúng tôi đảm bảo rằng sản phẩm của chúng tôi sẽ không có lỗi về vật liệu và tay nghề trong một khoảng thời gian hợp lý. Tuy nhiên, chúng tôi không chịu trách nhiệm về hao mòn bình thường, lạm dụng hoặc thiệt hại do chăm sóc không đúng cách."
        },
        liability: {
          title: "Giới Hạn Trách Nhiệm",
          content: "Theo phạm vi tối đa được pháp luật cho phép, Koshiro Fashion sẽ không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hậu quả hoặc trừng phạt nào phát sinh từ việc sử dụng dịch vụ hoặc sản phẩm của chúng tôi."
        },
        indemnification: {
          title: "Bồi Thường",
          content: "Bạn đồng ý bồi thường và giữ Koshiro Fashion vô hại khỏi bất kỳ khiếu nại, thiệt hại, tổn thất, trách nhiệm và chi phí nào phát sinh từ việc sử dụng dịch vụ hoặc vi phạm các điều khoản này."
        },
        modifications: {
          title: "Sửa Đổi Điều Khoản",
          content: "Chúng tôi bảo lưu quyền sửa đổi các điều khoản này bất cứ lúc nào. Chúng tôi sẽ thông báo cho người dùng về bất kỳ thay đổi quan trọng nào bằng cách đăng các điều khoản đã cập nhật trên trang này và cập nhật ngày 'Cập nhật lần cuối'. Việc tiếp tục sử dụng dịch vụ của bạn cấu thành sự chấp nhận các điều khoản đã sửa đổi."
        },
        termination: {
          title: "Chấm Dứt",
          content: "Chúng tôi có thể chấm dứt hoặc tạm ngừng quyền truy cập của bạn vào dịch vụ của chúng tôi ngay lập tức, không cần thông báo trước, vì bất kỳ vi phạm nào của các điều khoản này. Khi chấm dứt, quyền sử dụng dịch vụ của bạn sẽ chấm dứt ngay lập tức."
        },
        governingLaw: {
          title: "Luật Áp Dụng",
          content: "Các điều khoản này sẽ được điều chỉnh và giải thích theo luật của Nhật Bản, không tính đến các quy định về xung đột luật. Bất kỳ tranh chấp nào phát sinh từ các điều khoản này sẽ thuộc thẩm quyền độc quyền của các tòa án Tokyo, Nhật Bản."
        },
        contact: {
          title: "Liên Hệ",
          content: "Nếu bạn có câu hỏi về các Điều Khoản Dịch Vụ này, vui lòng liên hệ:",
          email: "legal@koshiro.com",
          address: "123 Fashion Street, Tokyo, Nhật Bản",
          phone: "+81 3-1234-5678"
        }
      }
    },
    ja: {
      title: "利用規約",
      subtitle: "当社のサービスの利用に関する規約と条件",
      lastUpdated: "最終更新日",
      effectiveDate: "2024年1月1日",
      overview: {
        title: "概要",
        content: "この利用規約は、Koshiro Fashionのウェブサイトとサービスの使用を規定しています。当社のサービスにアクセスまたは使用することにより、これらの規約に拘束されることに同意したものとみなされます。サービスを使用する前に、必ずお読みください。"
      },
      sections: {
        acceptance: {
          title: "規約の受諾",
          content: "このウェブサイトにアクセスし使用することにより、この契約の規約と規定に拘束されることに同意します。上記に同意しない場合は、このサービスを使用しないでください。"
        },
        useOfService: {
          title: "サービスの使用",
          content: "お客様は、合法的な目的でのみ当社のサービスを使用できます。以下を行うことに同意しないものとします：",
          restrictions: [
            "適用される法律または規制に違反する方法",
            "事前の書面による同意なしに、広告または宣伝資料の送信または送信の要求",
            "会社または従業員を装うまたは装うことを試みること",
            "他人の権利を侵害する方法、または違法、脅迫、詐欺、または有害な方法"
          ]
        },
        products: {
          title: "商品と価格",
          content: "当社は、正確な商品情報と価格の提供に努めています。ただし、エラー、不正確さ、または省略を訂正し、事前通知なしにいつでも情報を変更または更新する権利を留保します。価格は予告なく変更される場合があります。"
        },
        orders: {
          title: "注文と支払い",
          content: "注文をすることにより、商品を購入するオファーを行います。当社は、いかなる理由でも注文を承認または拒否する権利を留保します。注文を発送する前に、支払いを受ける必要があります。主要なクレジットカード、PayPal、銀行振込を受け付けています。"
        },
        shipping: {
          title: "配送と配達",
          content: "配送料金と推定配達時間は、チェックアウト時に提供されます。当社は、配送業者、税関、または当社の制御を超えたその他の要因による遅延について責任を負いません。損失のリスクは配達時に移転します。"
        },
        returns: {
          title: "返品と返金",
          content: "当社は、タグが付いた元の状態の商品に対して30日間の返品ポリシーを提供しています。返品商品を受け取り確認した後、5〜7営業日以内に元の支払い方法に返金が処理されます。"
        },
        intellectualProperty: {
          title: "知的財産",
          content: "このウェブサイト上のすべてのコンテンツ（テキスト、グラフィックス、ロゴ、画像、ソフトウェアを含む）は、Koshiro Fashionの財産であり、著作権法および商標法によって保護されています。事前の書面による許可なしに、複製、配布、または派生的作品を作成することはできません。"
        },
        userAccounts: {
          title: "ユーザーアカウント",
          content: "お客様は、アカウント認証情報の機密性を維持する責任があります。アカウントの不正使用があった場合は、直ちに当社に通知することに同意します。当社は、これらの規約に違反するアカウントを一時停止または終了する権利を留保します。"
        },
        warranties: {
          title: "商品保証",
          content: "当社は、当社の商品が合理的な期間、材料と技術の欠陥がないことを保証します。ただし、通常の摩耗、誤用、または不適切な手入れによる損傷については責任を負いません。"
        },
        liability: {
          title: "責任の制限",
          content: "法律で許可される最大限において、Koshiro Fashionは、当社のサービスまたは商品の使用から生じる、間接的、偶発的、特別、結果的、または懲罰的な損害について責任を負いません。"
        },
        indemnification: {
          title: "補償",
          content: "お客様は、サービスの使用またはこれらの規約の違反から生じる、請求、損害、損失、責任、および費用からKoshiro Fashionを補償し、無害に保つことに同意します。"
        },
        modifications: {
          title: "規約の変更",
          content: "当社は、いつでもこれらの規約を変更する権利を留保します。更新された規約をこのページに掲載し、「最終更新日」を更新することにより、重要な変更についてユーザーに通知します。サービスの継続的な使用は、変更された規約の受諾を構成します。"
        },
        termination: {
          title: "終了",
          content: "当社は、これらの規約の違反に対して、事前通知なしに、即座にサービスのアクセスを終了または一時停止する場合があります。終了時、サービスの使用権は即座に停止します。"
        },
        governingLaw: {
          title: "準拠法",
          content: "これらの規約は、法の抵触規定に関係なく、日本国の法律に従って解釈および解釈されます。これらの規約から生じる紛争は、日本の東京の裁判所の専属管轄に属します。"
        },
        contact: {
          title: "お問い合わせ",
          content: "この利用規約に関するご質問がございましたら、以下までお問い合わせください：",
          email: "legal@koshiro.com",
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
                  src="/images/banners/banner-06.png"
                  alt="Terms of Service Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                    <Scale className="h-12 w-12 md:h-16 md:w-16 text-white" />
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
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.overview.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.overview.content}
                  </p>
                </CardContent>
              </Card>

              {/* Acceptance of Terms */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.acceptance.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.acceptance.content}
                  </p>
                </CardContent>
              </Card>

              {/* Use of Service */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.useOfService.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.useOfService.content}
                  </p>
                  <ul className="space-y-3">
                    {t.sections.useOfService.restrictions.map((restriction, index) => (
                      <li key={index} className="flex items-start p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border-l-4 border-primary">
                        <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 mr-3" />
                        <span className="text-muted-foreground font-medium leading-relaxed">{restriction}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Products and Pricing */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.products.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {t.sections.products.content}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Orders and Payment */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.orders.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.orders.content}
                  </p>
                </CardContent>
              </Card>

              {/* Shipping */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.shipping.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.shipping.content}
                  </p>
                </CardContent>
              </Card>

              {/* Returns */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.returns.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.returns.content}
                  </p>
                </CardContent>
              </Card>

              {/* Intellectual Property */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.intellectualProperty.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {t.sections.intellectualProperty.content}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* User Accounts */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.userAccounts.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.userAccounts.content}
                  </p>
                </CardContent>
              </Card>

              {/* Warranties */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.warranties.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.warranties.content}
                  </p>
                </CardContent>
              </Card>

              {/* Limitation of Liability */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.liability.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {t.sections.liability.content}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Indemnification */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.indemnification.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.indemnification.content}
                  </p>
                </CardContent>
              </Card>

              {/* Modifications */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.modifications.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.modifications.content}
                  </p>
                </CardContent>
              </Card>

              {/* Termination */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.termination.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {t.sections.termination.content}
                  </p>
                </CardContent>
              </Card>

              {/* Governing Law */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.governingLaw.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {t.sections.governingLaw.content}
                    </p>
                  </div>
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

export default TermsOfServicePage;

