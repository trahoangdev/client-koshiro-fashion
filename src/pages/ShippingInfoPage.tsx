import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Truck,
  Package,
  Clock,
  Globe,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  CreditCard,
  Shield
} from 'lucide-react';

const ShippingInfoPage = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Shipping Information",
      subtitle: "Fast and Reliable Delivery Worldwide",
      description: "We offer worldwide shipping with tracking and insurance. Your order is carefully packaged and delivered to your door.",
      sections: {
        shippingMethods: {
          title: "Shipping Methods",
          description: "We offer multiple shipping options to meet your needs",
          methods: [
            {
              name: "Standard Shipping",
              time: "7-14 business days",
              description: "Most economical option, ideal for non-urgent orders",
              price: "$15"
            },
            {
              name: "Express Shipping",
              time: "3-7 business days",
              description: "Faster delivery for time-sensitive orders",
              price: "$25"
            },
            {
              name: "Priority Shipping",
              time: "1-3 business days",
              description: "Fastest delivery option with premium handling",
              price: "$35"
            }
          ]
        },
        shippingCosts: {
          title: "Shipping Costs",
          freeShipping: "Free shipping on orders over $100",
          costs: [
            "Standard shipping: $15",
            "Express shipping: $25",
            "Priority shipping: $35"
          ],
          note: "Shipping costs are calculated at checkout based on your location and selected shipping method."
        },
        processingTime: {
          title: "Processing Time",
          description: "Orders are typically processed within 1-2 business days after payment confirmation. Processing time may vary during peak seasons or holidays.",
          timeline: [
            "Order placed",
            "Payment confirmation",
            "Order processing (1-2 business days)",
            "Package shipped",
            "Delivery to your address"
          ]
        },
        tracking: {
          title: "Order Tracking",
          description: "All orders include tracking numbers for real-time updates",
          features: [
            "Tracking number sent via email",
            "Real-time shipping updates",
            "Track your package on our website",
            "SMS notifications available"
          ]
        },
        internationalShipping: {
          title: "International Shipping",
          description: "We ship to over 50 countries worldwide",
          notes: [
            "Customs duties and taxes may apply",
            "Delays may occur due to customs clearance",
            "Delivery times may vary by destination",
            "International orders may take longer during holidays"
          ]
        },
        restrictions: {
          title: "Shipping Restrictions",
          description: "Some items may have shipping restrictions based on destination country regulations",
          restricted: [
            "Hazardous materials",
            "Items restricted by customs",
            "Certain countries may have import restrictions"
          ]
        },
        insurance: {
          title: "Shipping Insurance",
          description: "All orders are automatically insured against loss or damage during transit. If your order arrives damaged, please contact us within 48 hours of delivery.",
          coverage: [
            "Loss during transit",
            "Damage during shipping",
            "Theft protection",
            "Full refund or replacement"
          ]
        },
        deliveryAddress: {
          title: "Delivery Address",
          description: "Please ensure your delivery address is correct and complete",
          tips: [
            "Double-check your address before placing order",
            "Include apartment/unit numbers if applicable",
            "Provide contact phone number for delivery",
            "Ensure someone is available to receive the package"
          ]
        },
        contact: {
          title: "Need Help?",
          description: "If you have questions about shipping, please contact us:",
          email: "shipping@koshiro.com",
          phone: "+84 123 456 789"
        }
      }
    },
    vi: {
      title: "Thông Tin Vận Chuyển",
      subtitle: "Giao Hàng Nhanh Chóng và Đáng Tin Cậy Toàn Cầu",
      description: "Chúng tôi cung cấp vận chuyển toàn cầu với theo dõi và bảo hiểm. Đơn hàng của bạn được đóng gói cẩn thận và giao đến tận cửa.",
      sections: {
        shippingMethods: {
          title: "Phương Thức Vận Chuyển",
          description: "Chúng tôi cung cấp nhiều tùy chọn vận chuyển để đáp ứng nhu cầu của bạn",
          methods: [
            {
              name: "Vận Chuyển Tiêu Chuẩn",
              time: "7-14 ngày làm việc",
              description: "Tùy chọn tiết kiệm nhất, lý tưởng cho các đơn hàng không gấp",
              price: "$15"
            },
            {
              name: "Vận Chuyển Nhanh",
              time: "3-7 ngày làm việc",
              description: "Giao hàng nhanh hơn cho các đơn hàng cần thời gian",
              price: "$25"
            },
            {
              name: "Vận Chuyển Ưu Tiên",
              time: "1-3 ngày làm việc",
              description: "Tùy chọn giao hàng nhanh nhất với xử lý cao cấp",
              price: "$35"
            }
          ]
        },
        shippingCosts: {
          title: "Chi Phí Vận Chuyển",
          freeShipping: "Miễn phí vận chuyển cho đơn hàng trên $100",
          costs: [
            "Vận chuyển tiêu chuẩn: $15",
            "Vận chuyển nhanh: $25",
            "Vận chuyển ưu tiên: $35"
          ],
          note: "Chi phí vận chuyển được tính tại trang thanh toán dựa trên vị trí và phương thức vận chuyển bạn chọn."
        },
        processingTime: {
          title: "Thời Gian Xử Lý",
          description: "Đơn hàng thường được xử lý trong vòng 1-2 ngày làm việc sau khi xác nhận thanh toán. Thời gian xử lý có thể thay đổi trong mùa cao điểm hoặc ngày lễ.",
          timeline: [
            "Đặt hàng",
            "Xác nhận thanh toán",
            "Xử lý đơn hàng (1-2 ngày làm việc)",
            "Gói hàng được gửi",
            "Giao đến địa chỉ của bạn"
          ]
        },
        tracking: {
          title: "Theo Dõi Đơn Hàng",
          description: "Tất cả đơn hàng đều có mã theo dõi để cập nhật thời gian thực",
          features: [
            "Mã theo dõi được gửi qua email",
            "Cập nhật vận chuyển thời gian thực",
            "Theo dõi gói hàng trên website của chúng tôi",
            "Thông báo SMS có sẵn"
          ]
        },
        internationalShipping: {
          title: "Vận Chuyển Quốc Tế",
          description: "Chúng tôi giao hàng đến hơn 50 quốc gia trên thế giới",
          notes: [
            "Thuế quan và thuế có thể áp dụng",
            "Có thể bị chậm trễ do thủ tục hải quan",
            "Thời gian giao hàng có thể thay đổi theo điểm đến",
            "Đơn hàng quốc tế có thể mất nhiều thời gian hơn trong ngày lễ"
          ]
        },
        restrictions: {
          title: "Hạn Chế Vận Chuyển",
          description: "Một số mặt hàng có thể có hạn chế vận chuyển dựa trên quy định của quốc gia đích",
          restricted: [
            "Vật liệu nguy hiểm",
            "Mặt hàng bị hạn chế bởi hải quan",
            "Một số quốc gia có thể có hạn chế nhập khẩu"
          ]
        },
        insurance: {
          title: "Bảo Hiểm Vận Chuyển",
          description: "Tất cả đơn hàng đều được tự động bảo hiểm chống mất mát hoặc hư hỏng trong quá trình vận chuyển. Nếu đơn hàng của bạn đến bị hư hỏng, vui lòng liên hệ với chúng tôi trong vòng 48 giờ sau khi giao hàng.",
          coverage: [
            "Mất mát trong quá trình vận chuyển",
            "Hư hỏng trong quá trình giao hàng",
            "Bảo vệ chống trộm",
            "Hoàn tiền đầy đủ hoặc thay thế"
          ]
        },
        deliveryAddress: {
          title: "Địa Chỉ Giao Hàng",
          description: "Vui lòng đảm bảo địa chỉ giao hàng của bạn chính xác và đầy đủ",
          tips: [
            "Kiểm tra kỹ địa chỉ của bạn trước khi đặt hàng",
            "Bao gồm số căn hộ/phòng nếu có",
            "Cung cấp số điện thoại liên lạc để giao hàng",
            "Đảm bảo có người sẵn sàng nhận gói hàng"
          ]
        },
        contact: {
          title: "Cần Hỗ Trợ?",
          description: "Nếu bạn có câu hỏi về vận chuyển, vui lòng liên hệ với chúng tôi:",
          email: "shipping@koshiro.com",
          phone: "+84 123 456 789"
        }
      }
    },
    ja: {
      title: "配送情報",
      subtitle: "世界中への迅速で信頼できる配送",
      description: "追跡と保険付きの世界中への配送を提供しています。ご注文は慎重に包装され、お客様のドアまでお届けします。",
      sections: {
        shippingMethods: {
          title: "配送方法",
          description: "お客様のニーズに合わせて複数の配送オプションを提供しています",
          methods: [
            {
              name: "標準配送",
              time: "7-14営業日",
              description: "最も経済的なオプション、緊急でない注文に最適",
              price: "$15"
            },
            {
              name: "速達配送",
              time: "3-7営業日",
              description: "時間に敏感な注文のためのより速い配送",
              price: "$25"
            },
            {
              name: "優先配送",
              time: "1-3営業日",
              description: "プレミアムハンドリング付きの最速配送オプション",
              price: "$35"
            }
          ]
        },
        shippingCosts: {
          title: "配送料金",
          freeShipping: "$100以上の注文で配送無料",
          costs: [
            "標準配送: $15",
            "速達配送: $25",
            "優先配送: $35"
          ],
          note: "配送料金は、お客様の場所と選択した配送方法に基づいてチェックアウト時に計算されます。"
        },
        processingTime: {
          title: "処理時間",
          description: "注文は通常、支払い確認後1-2営業日以内に処理されます。処理時間は繁忙期や休日により異なる場合があります。",
          timeline: [
            "注文を確定",
            "支払い確認",
            "注文処理（1-2営業日）",
            "パッケージを発送",
            "お客様の住所に配送"
          ]
        },
        tracking: {
          title: "注文追跡",
          description: "すべての注文にはリアルタイム更新用の追跡番号が含まれています",
          features: [
            "メールで追跡番号を送信",
            "リアルタイム配送更新",
            "当社のウェブサイトでパッケージを追跡",
            "SMS通知が利用可能"
          ]
        },
        internationalShipping: {
          title: "国際配送",
          description: "世界中の50以上の国に配送しています",
          notes: [
            "関税と税金が適用される場合があります",
            "通関手続きにより遅延が発生する可能性があります",
            "配送時間は目的地によって異なる場合があります",
            "休日中の国際注文は時間がかかる場合があります"
          ]
        },
        restrictions: {
          title: "配送制限",
          description: "一部の商品は、宛先国の規制に基づいて配送制限がある場合があります",
          restricted: [
            "危険物",
            "税関で制限されている商品",
            "特定の国には輸入制限がある場合があります"
          ]
        },
        insurance: {
          title: "配送保険",
          description: "すべての注文は、輸送中の紛失や損傷に対して自動的に保険がかけられています。注文が損傷して届いた場合は、配送後48時間以内にお問い合わせください。",
          coverage: [
            "輸送中の紛失",
            "配送中の損傷",
            "盗難保護",
            "全額返金または交換"
          ]
        },
        deliveryAddress: {
          title: "配送先住所",
          description: "配送先住所が正確で完全であることを確認してください",
          tips: [
            "注文を確定する前に住所を再確認してください",
            "該当する場合はアパート/ユニット番号を含めてください",
            "配送用の連絡先電話番号を提供してください",
            "パッケージを受け取る人が利用可能であることを確認してください"
          ]
        },
        contact: {
          title: "ヘルプが必要ですか？",
          description: "配送についてご質問がある場合は、お問い合わせください：",
          email: "shipping@koshiro.com",
          phone: "+84 123 456 789"
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
                  src="/images/banners/banner-07.png"
                  alt="Shipping Information Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                    <Truck className="h-12 w-12 md:h-16 md:w-16 text-white" />
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

              {/* Shipping Methods */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Truck className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.shippingMethods.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 font-medium leading-relaxed">
                    {t.sections.shippingMethods.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {t.sections.shippingMethods.methods.map((method, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary hover:bg-muted/50 transition-all">
                        <h3 className="font-bold mb-2 text-foreground">{method.name}</h3>
                        <div className="flex items-center gap-2 text-primary mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-semibold">{method.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">{method.description}</p>
                        <p className="text-lg font-bold text-primary">{method.price}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Costs */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.shippingCosts.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <p className="font-bold text-foreground">{t.sections.shippingCosts.freeShipping}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {t.sections.shippingCosts.costs.map((cost, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Package className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{cost}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground font-medium italic">
                    {t.sections.shippingCosts.note}
                  </p>
                </CardContent>
              </Card>

              {/* Processing Time */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.processingTime.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.processingTime.description}
                  </p>
                  <div className="space-y-3">
                    {t.sections.processingTime.timeline.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tracking */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.tracking.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.tracking.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {t.sections.tracking.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* International Shipping */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.internationalShipping.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.internationalShipping.description}
                  </p>
                  <div className="space-y-2">
                    {t.sections.internationalShipping.notes.map((note, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground">{note}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Restrictions */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.restrictions.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.restrictions.description}
                  </p>
                  <ul className="space-y-2">
                    {t.sections.restrictions.restricted.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground font-medium">
                        <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Insurance */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.insurance.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.insurance.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {t.sections.insurance.coverage.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-medium text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>{t.sections.deliveryAddress.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {t.sections.deliveryAddress.description}
                  </p>
                  <div className="space-y-2">
                    {t.sections.deliveryAddress.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground">{tip}</span>
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


    </div>
  );
};

export default ShippingInfoPage;

