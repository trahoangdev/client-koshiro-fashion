import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Truck, RotateCcw, HelpCircle, FileText, Shield } from "lucide-react";

const InfoPage = () => {
  const { pageType } = useParams<{ pageType: string }>();
  const { language } = useLanguage();

  const pageConfigs = {
    'shipping-info': {
      icon: Truck,
      title: {
        en: "Shipping Information",
        vi: "Thông Tin Vận Chuyển",
        ja: "配送情報"
      },
      content: {
        en: {
          title: "Shipping Information",
          subtitle: "Fast and Reliable Delivery",
          description: "We offer worldwide shipping with tracking and insurance.",
          sections: [
            {
              title: "Shipping Methods",
              content: [
                "Standard Shipping: 7-14 business days",
                "Express Shipping: 3-7 business days",
                "Priority Shipping: 1-3 business days"
              ]
            },
            {
              title: "Shipping Costs",
              content: [
                "Free shipping on orders over $100",
                "Standard shipping: $15",
                "Express shipping: $25",
                "Priority shipping: $35"
              ]
            },
            {
              title: "Tracking",
              content: [
                "All orders include tracking numbers",
                "Real-time updates via email",
                "Track your package on our website"
              ]
            }
          ]
        },
        vi: {
          title: "Thông Tin Vận Chuyển",
          subtitle: "Giao Hàng Nhanh Chóng Và Đáng Tin Cậy",
          description: "Chúng tôi cung cấp vận chuyển toàn cầu với theo dõi và bảo hiểm.",
          sections: [
            {
              title: "Phương Thức Vận Chuyển",
              content: [
                "Vận chuyển tiêu chuẩn: 7-14 ngày làm việc",
                "Vận chuyển nhanh: 3-7 ngày làm việc",
                "Vận chuyển ưu tiên: 1-3 ngày làm việc"
              ]
            },
            {
              title: "Chi Phí Vận Chuyển",
              content: [
                "Miễn phí vận chuyển cho đơn hàng trên $100",
                "Vận chuyển tiêu chuẩn: $15",
                "Vận chuyển nhanh: $25",
                "Vận chuyển ưu tiên: $35"
              ]
            },
            {
              title: "Theo Dõi",
              content: [
                "Tất cả đơn hàng đều có mã theo dõi",
                "Cập nhật thời gian thực qua email",
                "Theo dõi gói hàng trên website của chúng tôi"
              ]
            }
          ]
        },
        ja: {
          title: "配送情報",
          subtitle: "迅速で信頼できる配送",
          description: "追跡と保険付きの世界中への配送を提供しています。",
          sections: [
            {
              title: "配送方法",
              content: [
                "標準配送: 7-14営業日",
                "速達配送: 3-7営業日",
                "優先配送: 1-3営業日"
              ]
            },
            {
              title: "配送料",
              content: [
                "$100以上の注文で配送料無料",
                "標準配送: $15",
                "速達配送: $25",
                "優先配送: $35"
              ]
            },
            {
              title: "追跡",
              content: [
                "すべての注文に追跡番号が含まれます",
                "メールでのリアルタイム更新",
                "当社ウェブサイトでパッケージを追跡"
              ]
            }
          ]
        }
      }
    },
    'returns': {
      icon: RotateCcw,
      title: {
        en: "Returns & Exchanges",
        vi: "Đổi Trả & Hoàn Tiền",
        ja: "返品・交換"
      },
      content: {
        en: {
          title: "Returns & Exchanges",
          subtitle: "Easy and Hassle-Free Returns",
          description: "We want you to be completely satisfied with your purchase.",
          sections: [
            {
              title: "Return Policy",
              content: [
                "30-day return window for unused items",
                "Items must be in original packaging",
                "Free return shipping for defective items",
                "Refund processed within 5-7 business days"
              ]
            },
            {
              title: "Exchange Policy",
              content: [
                "Free exchanges for different sizes",
                "Exchange for different colors if available",
                "No restocking fees for exchanges",
                "Exchanges processed within 3-5 business days"
              ]
            },
            {
              title: "How to Return",
              content: [
                "Contact our customer service",
                "Print return label from your account",
                "Package item securely",
                "Drop off at any authorized location"
              ]
            }
          ]
        },
        vi: {
          title: "Đổi Trả & Hoàn Tiền",
          subtitle: "Đổi Trả Dễ Dàng Và Không Phiền Phức",
          description: "Chúng tôi muốn bạn hoàn toàn hài lòng với việc mua hàng.",
          sections: [
            {
              title: "Chính Sách Đổi Trả",
              content: [
                "Thời gian đổi trả 30 ngày cho sản phẩm chưa sử dụng",
                "Sản phẩm phải trong bao bì gốc",
                "Miễn phí vận chuyển đổi trả cho sản phẩm lỗi",
                "Hoàn tiền trong vòng 5-7 ngày làm việc"
              ]
            },
            {
              title: "Chính Sách Đổi Hàng",
              content: [
                "Đổi hàng miễn phí cho kích thước khác",
                "Đổi màu sắc khác nếu có sẵn",
                "Không phí phục vụ cho việc đổi hàng",
                "Xử lý đổi hàng trong vòng 3-5 ngày làm việc"
              ]
            },
            {
              title: "Cách Đổi Trả",
              content: [
                "Liên hệ dịch vụ khách hàng",
                "In nhãn đổi trả từ tài khoản",
                "Đóng gói sản phẩm an toàn",
                "Gửi tại bất kỳ địa điểm được ủy quyền"
              ]
            }
          ]
        },
        ja: {
          title: "返品・交換",
          subtitle: "簡単でストレスのない返品",
          description: "お客様の購入に完全に満足していただきたいと思います。",
          sections: [
            {
              title: "返品ポリシー",
              content: [
                "未使用商品の30日間返品期間",
                "商品は元の包装である必要があります",
                "不良品の返品送料無料",
                "5-7営業日以内に返金処理"
              ]
            },
            {
              title: "交換ポリシー",
              content: [
                "サイズ違いの無料交換",
                "在庫があれば色違いへの交換",
                "交換の再入荷手数料なし",
                "3-5営業日以内に交換処理"
              ]
            },
            {
              title: "返品方法",
              content: [
                "カスタマーサービスにお問い合わせ",
                "アカウントから返品ラベルを印刷",
                "商品を安全に梱包",
                "認可された場所に投函"
              ]
            }
          ]
        }
      }
    },
    'faq': {
      icon: HelpCircle,
      title: {
        en: "Frequently Asked Questions",
        vi: "Câu Hỏi Thường Gặp",
        ja: "よくある質問"
      },
      content: {
        en: {
          title: "Frequently Asked Questions",
          subtitle: "Find Answers to Common Questions",
          description: "Everything you need to know about our products and services.",
          sections: [
            {
              title: "Product Questions",
              content: [
                "Q: How do I know my size? A: Check our size guide or contact us for assistance.",
                "Q: Are your products authentic? A: Yes, all our products are authentic Japanese fashion.",
                "Q: Do you offer customization? A: Currently, we don't offer customization services."
              ]
            },
            {
              title: "Order Questions",
              content: [
                "Q: How long does shipping take? A: 7-14 business days for standard shipping.",
                "Q: Can I cancel my order? A: Orders can be cancelled within 24 hours of placement.",
                "Q: Do you ship internationally? A: Yes, we ship to most countries worldwide."
              ]
            },
            {
              title: "Payment Questions",
              content: [
                "Q: What payment methods do you accept? A: We accept all major credit cards and PayPal.",
                "Q: Is my payment secure? A: Yes, we use industry-standard SSL encryption.",
                "Q: Do you offer payment plans? A: Currently, we don't offer payment plans."
              ]
            }
          ]
        },
        vi: {
          title: "Câu Hỏi Thường Gặp",
          subtitle: "Tìm Câu Trả Lời Cho Các Câu Hỏi Thường Gặp",
          description: "Tất cả những gì bạn cần biết về sản phẩm và dịch vụ của chúng tôi.",
          sections: [
            {
              title: "Câu Hỏi Về Sản Phẩm",
              content: [
                "Q: Làm thế nào để biết kích thước của tôi? A: Kiểm tra hướng dẫn kích thước hoặc liên hệ với chúng tôi.",
                "Q: Sản phẩm của bạn có chân chính không? A: Có, tất cả sản phẩm đều là thời trang Nhật Bản chân chính.",
                "Q: Bạn có cung cấp tùy chỉnh không? A: Hiện tại, chúng tôi không cung cấp dịch vụ tùy chỉnh."
              ]
            },
            {
              title: "Câu Hỏi Về Đơn Hàng",
              content: [
                "Q: Vận chuyển mất bao lâu? A: 7-14 ngày làm việc cho vận chuyển tiêu chuẩn.",
                "Q: Tôi có thể hủy đơn hàng không? A: Đơn hàng có thể được hủy trong vòng 24 giờ.",
                "Q: Bạn có vận chuyển quốc tế không? A: Có, chúng tôi vận chuyển đến hầu hết các quốc gia."
              ]
            },
            {
              title: "Câu Hỏi Về Thanh Toán",
              content: [
                "Q: Bạn chấp nhận phương thức thanh toán nào? A: Chúng tôi chấp nhận tất cả thẻ tín dụng chính và PayPal.",
                "Q: Thanh toán của tôi có an toàn không? A: Có, chúng tôi sử dụng mã hóa SSL tiêu chuẩn.",
                "Q: Bạn có cung cấp kế hoạch thanh toán không? A: Hiện tại, chúng tôi không cung cấp kế hoạch thanh toán."
              ]
            }
          ]
        },
        ja: {
          title: "よくある質問",
          subtitle: "よくある質問への回答を見つける",
          description: "当社の製品とサービスについて知っておくべきすべて。",
          sections: [
            {
              title: "製品に関する質問",
              content: [
                "Q: サイズの選び方は？ A: サイズガイドをご確認いただくか、お問い合わせください。",
                "Q: 商品は本物ですか？ A: はい、すべて本格的な日本のファッション商品です。",
                "Q: カスタマイズは可能ですか？ A: 現在、カスタマイズサービスは提供していません。"
              ]
            },
            {
              title: "注文に関する質問",
              content: [
                "Q: 配送にはどのくらい時間がかかりますか？ A: 標準配送で7-14営業日。",
                "Q: 注文をキャンセルできますか？ A: 注文後24時間以内にキャンセル可能です。",
                "Q: 国際配送はありますか？ A: はい、世界中のほとんどの国に配送しています。"
              ]
            },
            {
              title: "支払いに関する質問",
              content: [
                "Q: どのような支払い方法を受け付けていますか？ A: 主要なクレジットカードとPayPalを受け付けています。",
                "Q: 支払いは安全ですか？ A: はい、業界標準のSSL暗号化を使用しています。",
                "Q: 分割払いはありますか？ A: 現在、分割払いは提供していません。"
              ]
            }
          ]
        }
      }
    },
    'shipping-policy': {
      icon: FileText,
      title: {
        en: "Shipping Policy",
        vi: "Chính Sách Vận Chuyển",
        ja: "配送ポリシー"
      },
      content: {
        en: {
          title: "Shipping Policy",
          subtitle: "Comprehensive Shipping Information",
          description: "Detailed information about our shipping policies and procedures.",
          sections: [
            {
              title: "Shipping Zones",
              content: [
                "Domestic (Japan): 1-3 business days",
                "Asia Pacific: 5-10 business days",
                "North America: 7-14 business days",
                "Europe: 7-14 business days",
                "Rest of World: 10-21 business days"
              ]
            },
            {
              title: "Shipping Restrictions",
              content: [
                "We do not ship to PO boxes",
                "Signature required for orders over $200",
                "No shipping to restricted countries",
                "Customs duties may apply"
              ]
            },
            {
              title: "Shipping Insurance",
              content: [
                "All orders include basic insurance",
                "Additional insurance available",
                "Claims must be filed within 30 days",
                "Documentation required for claims"
              ]
            }
          ]
        },
        vi: {
          title: "Chính Sách Vận Chuyển",
          subtitle: "Thông Tin Vận Chuyển Toàn Diện",
          description: "Thông tin chi tiết về chính sách và quy trình vận chuyển của chúng tôi.",
          sections: [
            {
              title: "Khu Vực Vận Chuyển",
              content: [
                "Nội địa (Nhật Bản): 1-3 ngày làm việc",
                "Châu Á Thái Bình Dương: 5-10 ngày làm việc",
                "Bắc Mỹ: 7-14 ngày làm việc",
                "Châu Âu: 7-14 ngày làm việc",
                "Các nước khác: 10-21 ngày làm việc"
              ]
            },
            {
              title: "Hạn Chế Vận Chuyển",
              content: [
                "Chúng tôi không vận chuyển đến hộp thư PO",
                "Yêu cầu chữ ký cho đơn hàng trên $200",
                "Không vận chuyển đến các nước bị hạn chế",
                "Có thể áp dụng thuế hải quan"
              ]
            },
            {
              title: "Bảo Hiểm Vận Chuyển",
              content: [
                "Tất cả đơn hàng đều có bảo hiểm cơ bản",
                "Bảo hiểm bổ sung có sẵn",
                "Yêu cầu bồi thường phải được nộp trong vòng 30 ngày",
                "Cần tài liệu cho yêu cầu bồi thường"
              ]
            }
          ]
        },
        ja: {
          title: "配送ポリシー",
          subtitle: "包括的な配送情報",
          description: "当社の配送ポリシーと手順に関する詳細情報。",
          sections: [
            {
              title: "配送エリア",
              content: [
                "国内（日本）: 1-3営業日",
                "アジア太平洋: 5-10営業日",
                "北米: 7-14営業日",
                "ヨーロッパ: 7-14営業日",
                "その他の地域: 10-21営業日"
              ]
            },
            {
              title: "配送制限",
              content: [
                "私書箱への配送は行っていません",
                "$200以上の注文には署名が必要",
                "制限された国への配送はありません",
                "関税が適用される場合があります"
              ]
            },
            {
              title: "配送保険",
              content: [
                "すべての注文に基本保険が含まれます",
                "追加保険が利用可能",
                "請求は30日以内に提出する必要があります",
                "請求には書類が必要です"
              ]
            }
          ]
        }
      }
    },
    'terms-of-service': {
      icon: Shield,
      title: {
        en: "Terms of Service",
        vi: "Điều Khoản Dịch Vụ",
        ja: "利用規約"
      },
      content: {
        en: {
          title: "Terms of Service",
          subtitle: "Please Read Carefully",
          description: "By using our website, you agree to these terms and conditions.",
          sections: [
            {
              title: "Acceptance of Terms",
              content: [
                "By accessing our website, you accept these terms",
                "We reserve the right to modify these terms",
                "Continued use constitutes acceptance of changes",
                "Terms are effective immediately upon posting"
              ]
            },
            {
              title: "Use of Website",
              content: [
                "Website is for personal, non-commercial use",
                "No unauthorized copying or distribution",
                "Respect intellectual property rights",
                "No harmful or illegal activities"
              ]
            },
            {
              title: "Privacy and Data",
              content: [
                "We collect and use data as described in Privacy Policy",
                "Your information is protected and secure",
                "We do not sell personal information",
                "You can request data deletion at any time"
              ]
            }
          ]
        },
        vi: {
          title: "Điều Khoản Dịch Vụ",
          subtitle: "Vui Lòng Đọc Kỹ",
          description: "Bằng việc sử dụng website của chúng tôi, bạn đồng ý với các điều khoản và điều kiện này.",
          sections: [
            {
              title: "Chấp Nhận Điều Khoản",
              content: [
                "Bằng việc truy cập website, bạn chấp nhận các điều khoản này",
                "Chúng tôi có quyền sửa đổi các điều khoản này",
                "Tiếp tục sử dụng có nghĩa là chấp nhận thay đổi",
                "Điều khoản có hiệu lực ngay khi đăng"
              ]
            },
            {
              title: "Sử Dụng Website",
              content: [
                "Website dành cho mục đích cá nhân, phi thương mại",
                "Không sao chép hoặc phân phối trái phép",
                "Tôn trọng quyền sở hữu trí tuệ",
                "Không có hoạt động có hại hoặc bất hợp pháp"
              ]
            },
            {
              title: "Quyền Riêng Tư Và Dữ Liệu",
              content: [
                "Chúng tôi thu thập và sử dụng dữ liệu như mô tả trong Chính Sách Bảo Mật",
                "Thông tin của bạn được bảo vệ và an toàn",
                "Chúng tôi không bán thông tin cá nhân",
                "Bạn có thể yêu cầu xóa dữ liệu bất cứ lúc nào"
              ]
            }
          ]
        },
        ja: {
          title: "利用規約",
          subtitle: "注意深くお読みください",
          description: "当社のウェブサイトを使用することで、これらの利用規約に同意したことになります。",
          sections: [
            {
              title: "利用規約の承諾",
              content: [
                "当社のウェブサイトにアクセスすることで、これらの規約を受け入れます",
                "当社はこれらの規約を変更する権利を留保します",
                "継続的な使用は変更の承諾を構成します",
                "規約は投稿時に即座に有効になります"
              ]
            },
            {
              title: "ウェブサイトの使用",
              content: [
                "ウェブサイトは個人的、非商業的用途のためです",
                "無断での複製や配布は禁止",
                "知的財産権を尊重",
                "有害または違法な活動は禁止"
              ]
            },
            {
              title: "プライバシーとデータ",
              content: [
                "プライバシーポリシーに記載されているようにデータを収集・使用",
                "お客様の情報は保護され、安全です",
                "個人情報を販売することはありません",
                "いつでもデータ削除を要求できます"
              ]
            }
          ]
        }
      }
    }
  };

  const config = pageConfigs[pageType as keyof typeof pageConfigs];
  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

        <main className="py-8">
          <div className="container mx-auto px-4">
            <Card className="rounded-xl border-2 shadow-xl bg-background/95 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
                <Link to="/">
                  <Button className="rounded-xl font-semibold px-8 py-3">
                    Go Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
    );
  }

  const Icon = config.icon;
  const t = config.content[language as keyof typeof config.content] || config.content.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


      <main className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <section className="text-center mb-12">
            <Card className="rounded-2xl border-2 shadow-xl bg-background/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Icon className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {config.title[language as keyof typeof config.title] || config.title.en}
                </h1>
                <p className="text-xl md:text-2xl mb-4 text-muted-foreground font-medium">
                  {t.subtitle}
                </p>
                <p className="text-lg max-w-3xl mx-auto text-muted-foreground leading-relaxed">
                  {t.description}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Content */}
          <section className="max-w-4xl mx-auto space-y-6">
            {t.sections.map((section, index) => (
              <Card key={index} className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-muted-foreground font-medium leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Back to Home */}
          <section className="text-center">
            <Link to="/">
              <Button variant="outline" size="lg" className="rounded-xl font-semibold px-8 py-3 border-2 shadow-lg hover:shadow-xl transition-all">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'vi' ? 'Về Trang Chủ' : language === 'ja' ? 'ホームに戻る' : 'Back to Home'}
              </Button>
            </Link>
          </section>
        </div>
      </main>


    </div>
  );
};

export default InfoPage; 