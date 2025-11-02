import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RotateCcw, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Shield
} from 'lucide-react';

const ReturnsPage = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Returns & Refunds",
      subtitle: "Easy and Hassle-Free Returns",
      description: "We want you to love your purchase. If you're not completely satisfied, we offer a hassle-free return policy.",
      sections: {
        returnPolicy: {
          title: "Return Policy",
          description: "We offer a 30-day return policy for items in their original condition",
          conditions: [
            "Items must be unworn, unwashed, and unaltered",
            "Original tags and labels must be attached",
            "Items must be in original packaging if possible",
            "Proof of purchase required"
          ]
        },
        eligibleItems: {
          title: "Eligible Items",
          description: "Most items are eligible for return, with some exceptions",
          items: [
            "Regular clothing and accessories",
            "Home and lifestyle products",
            "Jewelry and watches",
            "Shoes and footwear"
          ],
          exceptions: [
            "Personalized or custom items",
            "Underwear and intimate apparel",
            "Items damaged by misuse",
            "Items without proof of purchase"
          ]
        },
        returnProcess: {
          title: "How to Return",
          description: "Returning items is easy with our simple process",
          steps: [
            {
              step: "Log into your account",
              description: "Go to your order history and select the item you want to return"
            },
            {
              step: "Request Return",
              description: "Click 'Return Item' and select the reason for return"
            },
            {
              step: "Print Return Label",
              description: "Download and print the prepaid return shipping label"
            },
            {
              step: "Package Items",
              description: "Package the item securely with original packaging if possible"
            },
            {
              step: "Ship Item",
              description: "Drop off at the nearest shipping location or schedule pickup"
            },
            {
              step: "Track Return",
              description: "Track your return shipment and receive confirmation once processed"
            }
          ]
        },
        refunds: {
          title: "Refunds",
          description: "Refunds are processed quickly after we receive and verify your return",
          process: [
            "Refunds processed within 5-7 business days",
            "Refunded to your original payment method",
            "Email confirmation sent when refund is processed",
            "Allow 5-10 business days for refund to appear in your account"
          ]
        },
        exchanges: {
          title: "Exchanges",
          description: "Exchange items for a different size, color, or style",
          process: [
            "Follow the same return process",
            "Specify that you want an exchange",
            "Select the size, color, or style you prefer",
            "Exchange processed once return is received",
            "New item shipped at no additional cost"
          ]
        },
        returnShipping: {
          title: "Return Shipping",
          description: "Return shipping costs and options",
          free: "Free return shipping on all orders",
          note: "We provide prepaid return labels for your convenience. Simply print the label and attach it to your return package."
        },
        timeLimit: {
          title: "Return Time Limit",
          description: "Return window and important deadlines",
          window: "30 days from date of delivery",
          deadline: "Items must be postmarked within 30 days",
          note: "Returns postmarked after 30 days may be denied"
        },
        condition: {
          title: "Item Condition",
          description: "Items must meet condition requirements for return acceptance",
          requirements: [
            "Unworn and unwashed",
            "Original tags attached",
            "No signs of wear or damage",
            "Original packaging if applicable",
            "All accessories and items included"
          ]
        },
        deniedReturns: {
          title: "Denied Returns",
          description: "Some returns may be denied if items don't meet our return policy",
          reasons: [
            "Items not in original condition",
            "Missing tags or labels",
            "Past the 30-day return window",
            "No proof of purchase",
            "Items damaged by misuse"
          ]
        },
        contact: {
          title: "Need Help?",
          description: "If you have questions about returns or need assistance, please contact us:",
          email: "returns@koshiro.com",
          phone: "+84 123 456 789"
        }
      }
    },
    vi: {
      title: "Đổi Trả & Hoàn Tiền",
      subtitle: "Đổi Trả Dễ Dàng và Không Phiền Phức",
      description: "Chúng tôi muốn bạn yêu thích sản phẩm đã mua. Nếu bạn không hoàn toàn hài lòng, chúng tôi cung cấp chính sách đổi trả không phiền phức.",
      sections: {
        returnPolicy: {
          title: "Chính Sách Đổi Trả",
          description: "Chúng tôi cung cấp chính sách đổi trả 30 ngày cho các sản phẩm ở tình trạng ban đầu",
          conditions: [
            "Sản phẩm phải chưa mặc, chưa giặt và chưa thay đổi",
            "Thẻ tag và nhãn gốc phải còn nguyên",
            "Sản phẩm phải ở bao bì gốc nếu có thể",
            "Yêu cầu có bằng chứng mua hàng"
          ]
        },
        eligibleItems: {
          title: "Sản Phẩm Đủ Điều Kiện",
          description: "Hầu hết các sản phẩm đều đủ điều kiện để đổi trả, với một số ngoại lệ",
          items: [
            "Quần áo và phụ kiện thông thường",
            "Sản phẩm gia đình và lối sống",
            "Trang sức và đồng hồ",
            "Giày dép"
          ],
          exceptions: [
            "Sản phẩm cá nhân hóa hoặc tùy chỉnh",
            "Đồ lót và quần áo lót",
            "Sản phẩm bị hư hỏng do lạm dụng",
            "Sản phẩm không có bằng chứng mua hàng"
          ]
        },
        returnProcess: {
          title: "Cách Đổi Trả",
          description: "Đổi trả sản phẩm rất dễ với quy trình đơn giản của chúng tôi",
          steps: [
            {
              step: "Đăng nhập vào tài khoản",
              description: "Đi đến lịch sử đơn hàng và chọn sản phẩm bạn muốn đổi trả"
            },
            {
              step: "Yêu Cầu Đổi Trả",
              description: "Nhấp 'Đổi Trả Sản Phẩm' và chọn lý do đổi trả"
            },
            {
              step: "In Nhãn Đổi Trả",
              description: "Tải xuống và in nhãn vận chuyển đổi trả đã thanh toán trước"
            },
            {
              step: "Đóng Gói Sản Phẩm",
              description: "Đóng gói sản phẩm an toàn với bao bì gốc nếu có thể"
            },
            {
              step: "Gửi Sản Phẩm",
              description: "Gửi tại điểm vận chuyển gần nhất hoặc lên lịch lấy hàng"
            },
            {
              step: "Theo Dõi Đổi Trả",
              description: "Theo dõi lô hàng đổi trả của bạn và nhận xác nhận sau khi xử lý"
            }
          ]
        },
        refunds: {
          title: "Hoàn Tiền",
          description: "Hoàn tiền được xử lý nhanh chóng sau khi chúng tôi nhận và xác minh đổi trả của bạn",
          process: [
            "Hoàn tiền được xử lý trong vòng 5-7 ngày làm việc",
            "Hoàn lại vào phương thức thanh toán gốc của bạn",
            "Email xác nhận được gửi khi hoàn tiền được xử lý",
            "Cho phép 5-10 ngày làm việc để hoàn tiền xuất hiện trong tài khoản của bạn"
          ]
        },
        exchanges: {
          title: "Đổi Hàng",
          description: "Đổi sản phẩm sang size, màu hoặc style khác",
          process: [
            "Làm theo quy trình đổi trả tương tự",
            "Chỉ định rằng bạn muốn đổi",
            "Chọn size, màu hoặc style bạn muốn",
            "Đổi được xử lý sau khi nhận đổi trả",
            "Sản phẩm mới được gửi không tính phí bổ sung"
          ]
        },
        returnShipping: {
          title: "Vận Chuyển Đổi Trả",
          description: "Chi phí và tùy chọn vận chuyển đổi trả",
          free: "Miễn phí vận chuyển đổi trả cho tất cả đơn hàng",
          note: "Chúng tôi cung cấp nhãn đổi trả đã thanh toán trước cho sự tiện lợi của bạn. Chỉ cần in nhãn và dán vào gói đổi trả của bạn."
        },
        timeLimit: {
          title: "Thời Hạn Đổi Trả",
          description: "Thời gian đổi trả và các thời hạn quan trọng",
          window: "30 ngày từ ngày giao hàng",
          deadline: "Sản phẩm phải được gửi bưu điện trong vòng 30 ngày",
          note: "Đổi trả được gửi bưu điện sau 30 ngày có thể bị từ chối"
        },
        condition: {
          title: "Tình Trạng Sản Phẩm",
          description: "Sản phẩm phải đáp ứng yêu cầu điều kiện để được chấp nhận đổi trả",
          requirements: [
            "Chưa mặc và chưa giặt",
            "Thẻ tag gốc còn nguyên",
            "Không có dấu hiệu mặc hoặc hư hỏng",
            "Bao bì gốc nếu có",
            "Tất cả phụ kiện và sản phẩm được bao gồm"
          ]
        },
        deniedReturns: {
          title: "Đổi Trả Bị Từ Chối",
          description: "Một số đổi trả có thể bị từ chối nếu sản phẩm không đáp ứng chính sách đổi trả của chúng tôi",
          reasons: [
            "Sản phẩm không ở tình trạng ban đầu",
            "Thiếu thẻ tag hoặc nhãn",
            "Quá thời hạn đổi trả 30 ngày",
            "Không có bằng chứng mua hàng",
            "Sản phẩm bị hư hỏng do lạm dụng"
          ]
        },
        contact: {
          title: "Cần Hỗ Trợ?",
          description: "Nếu bạn có câu hỏi về đổi trả hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi:",
          email: "returns@koshiro.com",
          phone: "+84 123 456 789"
        }
      }
    },
    ja: {
      title: "返品と返金",
      subtitle: "簡単でストレスフリーな返品",
      description: "ご購入いただいた商品を気に入っていただきたいと考えています。完全にご満足いただけない場合は、ストレスフリーな返品ポリシーを提供しています。",
      sections: {
        returnPolicy: {
          title: "返品ポリシー",
          description: "元の状態の商品に対して30日間の返品ポリシーを提供しています",
          conditions: [
            "未使用、未洗濯、未変更の商品であること",
            "元のタグとラベルが付いていること",
            "可能な限り元のパッケージに入っていること",
            "購入証明が必要"
          ]
        },
        eligibleItems: {
          title: "返品可能な商品",
          description: "ほとんどの商品が返品可能ですが、いくつかの例外があります",
          items: [
            "通常の衣類とアクセサリー",
            "ホームとライフスタイル製品",
            "ジュエリーと時計",
            "靴と履物"
          ],
          exceptions: [
            "パーソナライズまたはカスタムアイテム",
            "下着とインナーウェア",
            "誤用による損傷商品",
            "購入証明のない商品"
          ]
        },
        returnProcess: {
          title: "返品方法",
          description: "当社のシンプルなプロセスで返品は簡単です",
          steps: [
            {
              step: "アカウントにログイン",
              description: "注文履歴に移動し、返品したい商品を選択してください"
            },
            {
              step: "返品リクエスト",
              description: "「商品を返品」をクリックし、返品理由を選択してください"
            },
            {
              step: "返品ラベルを印刷",
              description: "事前支払い済みの返品配送ラベルをダウンロードして印刷してください"
            },
            {
              step: "商品を包装",
              description: "可能な限り元のパッケージで商品を安全に包装してください"
            },
            {
              step: "商品を発送",
              description: "最寄りの配送場所に持参するか、ピックアップをスケジュールしてください"
            },
            {
              step: "返品を追跡",
              description: "返品配送を追跡し、処理されたら確認を受け取ってください"
            }
          ]
        },
        refunds: {
          title: "返金",
          description: "返品を受け取り確認後、返金を迅速に処理します",
          process: [
            "5〜7営業日以内に返金を処理",
            "元の支払い方法に返金",
            "返金処理時にメール確認を送信",
            "返金がアカウントに表示されるまで5〜10営業日お待ちください"
          ]
        },
        exchanges: {
          title: "交換",
          description: "異なるサイズ、色、またはスタイルに商品を交換",
          process: [
            "同じ返品プロセスに従う",
            "交換を希望することを指定",
            "希望のサイズ、色、またはスタイルを選択",
            "返品を受け取ったら交換を処理",
            "追加費用なしで新しい商品を発送"
          ]
        },
        returnShipping: {
          title: "返品配送",
          description: "返品配送料金とオプション",
          free: "すべての注文で返品配送無料",
          note: "お客様の利便性のために事前支払い済みの返品ラベルを提供しています。ラベルを印刷して返品パッケージに貼り付けるだけです。"
        },
        timeLimit: {
          title: "返品期限",
          description: "返品期間と重要な締め切り",
          window: "配送日から30日間",
          deadline: "商品は30日以内に郵便局で出荷する必要があります",
          note: "30日を過ぎて郵送された返品は拒否される場合があります"
        },
        condition: {
          title: "商品の状態",
          description: "返品を受け入れるには、商品が状態要件を満たしている必要があります",
          requirements: [
            "未使用で未洗濯",
            "元のタグが付いている",
            "摩耗や損傷の痕跡がない",
            "該当する場合は元のパッケージ",
            "すべてのアクセサリーとアイテムが含まれている"
          ]
        },
        deniedReturns: {
          title: "拒否された返品",
          description: "商品が当社の返品ポリシーを満たしていない場合、一部の返品は拒否される場合があります",
          reasons: [
            "元の状態でない商品",
            "タグやラベルがない",
            "30日間の返品期間を過ぎている",
            "購入証明がない",
            "誤用による損傷商品"
          ]
        },
        contact: {
          title: "ヘルプが必要ですか？",
          description: "返品に関する質問がある場合、またはサポートが必要な場合は、お問い合わせください：",
          email: "returns@koshiro.com",
          phone: "+84 123 456 789"
        }
      }
    }
  };

  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-8">
        <div className="container mx-auto px-4 space-y-12">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Banner Background */}
              <div className="absolute inset-0">
                <img 
                  src="/images/banners/banner-08.png" 
                  alt="Returns & Refunds Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                    <RotateCcw className="h-12 w-12 md:h-16 md:w-16 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-6 font-light leading-relaxed">
                  {t.subtitle}
                </p>
                <p className="text-lg max-w-3xl mx-auto text-white/80 leading-relaxed">
                  {t.description}
                </p>
              </div>
            </div>
          </section>

          {/* Content */}
          <section>
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Return Policy */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.returnPolicy.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.returnPolicy.description}
                  </p>
                  <div className="space-y-2">
                    {t.sections.returnPolicy.conditions.map((condition, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground">{condition}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Eligible Items */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Package className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.eligibleItems.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.eligibleItems.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold mb-3 text-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {language === 'vi' ? 'Đủ Điều Kiện' : language === 'ja' ? '返品可能' : 'Eligible'}
                      </h3>
                      <ul className="space-y-2">
                        {t.sections.eligibleItems.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-muted-foreground font-medium">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3 text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        {language === 'vi' ? 'Ngoại Lệ' : language === 'ja' ? '例外' : 'Exceptions'}
                      </h3>
                      <ul className="space-y-2">
                        {t.sections.eligibleItems.exceptions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-muted-foreground font-medium">
                            <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Return Process */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <RotateCcw className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.returnProcess.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.returnProcess.description}
                  </p>
                  <div className="space-y-4">
                    {t.sections.returnProcess.steps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/30 border-l-4 border-primary hover:bg-muted/50 transition-all">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1 text-foreground">{step.step}</h3>
                          <p className="text-sm text-muted-foreground font-medium">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Refunds */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.refunds.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.refunds.description}
                  </p>
                  <div className="space-y-2">
                    {t.sections.refunds.process.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Exchanges */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Package className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.exchanges.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.exchanges.description}
                  </p>
                  <div className="space-y-2">
                    {t.sections.exchanges.process.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Return Shipping */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Package className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.returnShipping.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <p className="font-bold text-foreground">{t.sections.returnShipping.free}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {t.sections.returnShipping.note}
                  </p>
                </CardContent>
              </Card>

              {/* Time Limit */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.timeLimit.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.timeLimit.description}
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                      <p className="font-bold text-foreground mb-1">{t.sections.timeLimit.window}</p>
                      <p className="text-sm text-muted-foreground font-medium">{t.sections.timeLimit.deadline}</p>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                      <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-muted-foreground">{t.sections.timeLimit.note}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Item Condition */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.condition.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.condition.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {t.sections.condition.requirements.map((req, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground">{req}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Denied Returns */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.deniedReturns.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.deniedReturns.description}
                  </p>
                  <div className="space-y-2">
                    {t.sections.deniedReturns.reasons.map((reason, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground">{reason}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.contact.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.contact.description}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{t.sections.contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{t.sections.contact.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReturnsPage;

