import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Truck,
  Package,
  CreditCard,
  RefreshCw,
  Shield,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';

const FAQPage = () => {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const translations = {
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about our products and services",
      searchPlaceholder: "Search for questions...",
      categories: {
        general: "General",
        orders: "Orders & Shipping",
        returns: "Returns & Refunds",
        products: "Products",
        payment: "Payment",
        account: "Account"
      },
      faqs: {
        general: [
          {
            question: "What is Koshiro Fashion?",
            answer: "Koshiro Fashion is an authentic Japanese fashion brand that combines traditional Japanese aesthetics with modern design principles. We offer high-quality clothing and accessories inspired by Zen, Wabi-sabi, and Minimalism."
          },
          {
            question: "Where are you located?",
            answer: "Our headquarters is located in Tokyo, Japan, with operations in Vietnam and other countries. We ship worldwide to bring authentic Japanese fashion to customers around the globe."
          },
          {
            question: "How can I contact customer service?",
            answer: "You can reach us through our contact page, email at contact@koshiro.com, or phone at +84 123 456 789. Our customer service team is available Monday to Friday, 9 AM to 6 PM (GMT+7)."
          },
          {
            question: "Do you offer international shipping?",
            answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. Please check our shipping information page for details."
          }
        ],
        orders: [
          {
            question: "How long does shipping take?",
            answer: "Standard shipping typically takes 5-7 business days for domestic orders and 10-15 business days for international orders. Express shipping options are available for faster delivery."
          },
          {
            question: "Can I track my order?",
            answer: "Yes! Once your order ships, you'll receive a tracking number via email. You can track your order using our order tracking page or through the shipping carrier's website."
          },
          {
            question: "What shipping methods do you offer?",
            answer: "We offer standard shipping, express shipping, and premium express shipping. Shipping costs and estimated delivery times are calculated at checkout based on your location."
          },
          {
            question: "Do you ship to PO boxes?",
            answer: "Yes, we can ship to PO boxes for standard shipping methods. However, express and premium express shipping may require a physical address."
          }
        ],
        returns: [
          {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for unworn, unwashed items in their original packaging with tags attached. Items must be in resellable condition."
          },
          {
            question: "How do I return an item?",
            answer: "To initiate a return, log into your account, go to your order history, and select the item you want to return. Follow the instructions to print a return label and send the item back to us."
          },
          {
            question: "How long does it take to process a refund?",
            answer: "Once we receive your returned item and verify its condition, we'll process your refund within 5-7 business days. The refund will be credited back to your original payment method."
          },
          {
            question: "Can I exchange an item?",
            answer: "Yes, you can exchange items for a different size or color. Please follow the same return process and specify that you'd like an exchange when submitting your return request."
          }
        ],
        products: [
          {
            question: "How do I know what size to order?",
            answer: "We provide detailed size charts for all our products. You can find size information on each product page, or visit our Size Guide page for comprehensive sizing information."
          },
          {
            question: "Are your products made from sustainable materials?",
            answer: "We are committed to sustainability and use eco-friendly materials whenever possible. Look for our sustainability badge on product pages to identify items made with sustainable materials."
          },
          {
            question: "Do you offer plus sizes?",
            answer: "Yes, we offer extended sizing options for many of our products. Check the product page for available sizes, which typically range from XS to XXL."
          },
          {
            question: "Can I pre-order items that are out of stock?",
            answer: "Yes, if a product is temporarily out of stock, you can join the waitlist to be notified when it's back in stock. Pre-orders may be available for upcoming collections."
          }
        ],
        payment: [
          {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All transactions are secured with SSL encryption."
          },
          {
            question: "Is my payment information secure?",
            answer: "Absolutely! We use industry-standard SSL encryption to protect your payment information. We never store your complete credit card information on our servers."
          },
          {
            question: "Do you charge sales tax?",
            answer: "Sales tax is calculated based on your shipping address and applicable local tax laws. The tax amount will be displayed before you complete your purchase."
          },
          {
            question: "Can I pay with multiple payment methods?",
            answer: "Currently, we only accept one payment method per order. If you need to split payment, please contact our customer service team."
          }
        ],
        account: [
          {
            question: "How do I create an account?",
            answer: "Creating an account is easy! Click on 'Register' in the top navigation, fill in your information, and verify your email address. You can also create an account during checkout."
          },
          {
            question: "I forgot my password. How do I reset it?",
            answer: "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
          },
          {
            question: "Can I update my account information?",
            answer: "Yes, you can update your account information anytime by logging in and going to your Profile page. You can change your name, email, password, and shipping addresses."
          },
          {
            question: "Do you have a loyalty program?",
            answer: "Yes! We offer a rewards program where you earn points for every purchase. Points can be redeemed for discounts on future orders. Check your account dashboard for details."
          }
        ]
      }
    },
    vi: {
      title: "Câu Hỏi Thường Gặp",
      subtitle: "Tìm câu trả lời cho các câu hỏi phổ biến về sản phẩm và dịch vụ của chúng tôi",
      searchPlaceholder: "Tìm kiếm câu hỏi...",
      categories: {
        general: "Chung",
        orders: "Đơn Hàng & Giao Hàng",
        returns: "Đổi Trả & Hoàn Tiền",
        products: "Sản Phẩm",
        payment: "Thanh Toán",
        account: "Tài Khoản"
      },
      faqs: {
        general: [
          {
            question: "Koshiro Fashion là gì?",
            answer: "Koshiro Fashion là thương hiệu thời trang Nhật Bản chính hãng kết hợp thẩm mỹ truyền thống Nhật Bản với nguyên tắc thiết kế hiện đại. Chúng tôi cung cấp quần áo và phụ kiện chất lượng cao lấy cảm hứng từ Zen, Wabi-sabi và Minimalism."
          },
          {
            question: "Bạn có trụ sở ở đâu?",
            answer: "Trụ sở chính của chúng tôi nằm tại Tokyo, Nhật Bản, với hoạt động tại Việt Nam và các quốc gia khác. Chúng tôi giao hàng toàn cầu để mang thời trang Nhật Bản chính hãng đến khách hàng trên thế giới."
          },
          {
            question: "Làm thế nào để liên hệ dịch vụ khách hàng?",
            answer: "Bạn có thể liên hệ chúng tôi qua trang liên hệ, email tại contact@koshiro.com, hoặc điện thoại +84 123 456 789. Đội ngũ dịch vụ khách hàng có sẵn từ thứ Hai đến thứ Sáu, 9:00 - 18:00 (GMT+7)."
          },
          {
            question: "Bạn có giao hàng quốc tế không?",
            answer: "Có, chúng tôi giao hàng đến hầu hết các quốc gia trên thế giới. Chi phí vận chuyển và thời gian giao hàng khác nhau tùy theo địa điểm. Vui lòng kiểm tra trang thông tin giao hàng để biết chi tiết."
          }
        ],
        orders: [
          {
            question: "Giao hàng mất bao lâu?",
            answer: "Giao hàng tiêu chuẩn thường mất 5-7 ngày làm việc cho đơn hàng trong nước và 10-15 ngày làm việc cho đơn hàng quốc tế. Có các tùy chọn giao hàng nhanh cho việc giao hàng nhanh hơn."
          },
          {
            question: "Tôi có thể theo dõi đơn hàng không?",
            answer: "Có! Khi đơn hàng của bạn được gửi đi, bạn sẽ nhận được mã theo dõi qua email. Bạn có thể theo dõi đơn hàng bằng trang theo dõi đơn hàng của chúng tôi hoặc qua trang web của nhà vận chuyển."
          },
          {
            question: "Bạn cung cấp những phương thức giao hàng nào?",
            answer: "Chúng tôi cung cấp giao hàng tiêu chuẩn, giao hàng nhanh và giao hàng nhanh cao cấp. Chi phí vận chuyển và thời gian giao hàng ước tính được tính tại trang thanh toán dựa trên vị trí của bạn."
          },
          {
            question: "Bạn có giao hàng đến hộp thư PO không?",
            answer: "Có, chúng tôi có thể giao hàng đến hộp thư PO cho các phương thức giao hàng tiêu chuẩn. Tuy nhiên, giao hàng nhanh và giao hàng nhanh cao cấp có thể yêu cầu địa chỉ thực tế."
          }
        ],
        returns: [
          {
            question: "Chính sách đổi trả của bạn là gì?",
            answer: "Chúng tôi cung cấp chính sách đổi trả 30 ngày cho các sản phẩm chưa mặc, chưa giặt trong bao bì gốc với thẻ tag còn nguyên. Sản phẩm phải ở tình trạng có thể bán lại."
          },
          {
            question: "Làm thế nào để đổi trả một sản phẩm?",
            answer: "Để bắt đầu đổi trả, đăng nhập vào tài khoản của bạn, đi đến lịch sử đơn hàng, và chọn sản phẩm bạn muốn đổi trả. Làm theo hướng dẫn để in nhãn đổi trả và gửi sản phẩm trở lại cho chúng tôi."
          },
          {
            question: "Mất bao lâu để xử lý hoàn tiền?",
            answer: "Khi chúng tôi nhận được sản phẩm đổi trả của bạn và xác minh tình trạng, chúng tôi sẽ xử lý hoàn tiền trong vòng 5-7 ngày làm việc. Khoản hoàn tiền sẽ được ghi có lại vào phương thức thanh toán gốc của bạn."
          },
          {
            question: "Tôi có thể đổi một sản phẩm không?",
            answer: "Có, bạn có thể đổi sản phẩm sang size hoặc màu khác. Vui lòng làm theo quy trình đổi trả tương tự và chỉ định rằng bạn muốn đổi khi gửi yêu cầu đổi trả."
          }
        ],
        products: [
          {
            question: "Làm thế nào để biết nên đặt size nào?",
            answer: "Chúng tôi cung cấp biểu đồ size chi tiết cho tất cả sản phẩm. Bạn có thể tìm thông tin size trên mỗi trang sản phẩm, hoặc truy cập trang Hướng Dẫn Size của chúng tôi để biết thông tin size đầy đủ."
          },
          {
            question: "Sản phẩm của bạn có được làm từ vật liệu bền vững không?",
            answer: "Chúng tôi cam kết về tính bền vững và sử dụng vật liệu thân thiện với môi trường khi có thể. Tìm biểu tượng tính bền vững của chúng tôi trên trang sản phẩm để xác định các sản phẩm được làm bằng vật liệu bền vững."
          },
          {
            question: "Bạn có cung cấp size lớn không?",
            answer: "Có, chúng tôi cung cấp các tùy chọn size mở rộng cho nhiều sản phẩm. Kiểm tra trang sản phẩm để biết các size có sẵn, thường từ XS đến XXL."
          },
          {
            question: "Tôi có thể đặt trước các sản phẩm hết hàng không?",
            answer: "Có, nếu sản phẩm tạm thời hết hàng, bạn có thể tham gia danh sách chờ để được thông báo khi có hàng trở lại. Đặt trước có thể có sẵn cho các bộ sưu tập sắp tới."
          }
        ],
        payment: [
          {
            question: "Bạn chấp nhận những phương thức thanh toán nào?",
            answer: "Chúng tôi chấp nhận tất cả các thẻ tín dụng chính (Visa, MasterCard, American Express), PayPal và chuyển khoản ngân hàng. Tất cả các giao dịch được bảo mật bằng mã hóa SSL."
          },
          {
            question: "Thông tin thanh toán của tôi có an toàn không?",
            answer: "Chắc chắn! Chúng tôi sử dụng mã hóa SSL tiêu chuẩn ngành để bảo vệ thông tin thanh toán của bạn. Chúng tôi không bao giờ lưu trữ thông tin thẻ tín dụng đầy đủ trên máy chủ của chúng tôi."
          },
          {
            question: "Bạn có tính thuế bán hàng không?",
            answer: "Thuế bán hàng được tính dựa trên địa chỉ giao hàng của bạn và luật thuế địa phương áp dụng. Số tiền thuế sẽ được hiển thị trước khi bạn hoàn tất mua hàng."
          },
          {
            question: "Tôi có thể thanh toán bằng nhiều phương thức thanh toán không?",
            answer: "Hiện tại, chúng tôi chỉ chấp nhận một phương thức thanh toán cho mỗi đơn hàng. Nếu bạn cần chia thanh toán, vui lòng liên hệ đội ngũ dịch vụ khách hàng của chúng tôi."
          }
        ],
        account: [
          {
            question: "Làm thế nào để tạo tài khoản?",
            answer: "Tạo tài khoản rất dễ! Nhấp vào 'Đăng Ký' ở thanh điều hướng trên cùng, điền thông tin của bạn và xác minh địa chỉ email của bạn. Bạn cũng có thể tạo tài khoản trong quá trình thanh toán."
          },
          {
            question: "Tôi quên mật khẩu. Làm thế nào để đặt lại?",
            answer: "Nhấp vào 'Quên Mật Khẩu' trên trang đăng nhập, nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết đặt lại mật khẩu. Làm theo hướng dẫn trong email để tạo mật khẩu mới."
          },
          {
            question: "Tôi có thể cập nhật thông tin tài khoản không?",
            answer: "Có, bạn có thể cập nhật thông tin tài khoản bất cứ lúc nào bằng cách đăng nhập và đi đến trang Hồ Sơ của bạn. Bạn có thể thay đổi tên, email, mật khẩu và địa chỉ giao hàng."
          },
          {
            question: "Bạn có chương trình khách hàng thân thiết không?",
            answer: "Có! Chúng tôi cung cấp chương trình phần thưởng nơi bạn tích điểm cho mỗi lần mua hàng. Điểm có thể được đổi lấy giảm giá cho các đơn hàng trong tương lai. Kiểm tra bảng điều khiển tài khoản của bạn để biết chi tiết."
          }
        ]
      }
    },
    ja: {
      title: "よくある質問",
      subtitle: "製品とサービスに関するよくある質問の回答を見つける",
      searchPlaceholder: "質問を検索...",
      categories: {
        general: "一般",
        orders: "注文と配送",
        returns: "返品と返金",
        products: "商品",
        payment: "支払い",
        account: "アカウント"
      },
      faqs: {
        general: [
          {
            question: "Koshiro Fashionとは何ですか？",
            answer: "Koshiro Fashionは、伝統的な日本の美学と現代的なデザイン原則を組み合わせた本格的な日本ファッションブランドです。禅、侘寂、ミニマリズムにインスパイアされた高品質の衣類とアクセサリーを提供しています。"
          },
          {
            question: "所在地はどこですか？",
            answer: "本社は日本の東京にあり、ベトナムやその他の国で事業を展開しています。世界中のお客様に本格的な日本ファッションをお届けするため、世界中に配送しています。"
          },
          {
            question: "カスタマーサービスに連絡するにはどうすればよいですか？",
            answer: "お問い合わせページ、メール（contact@koshiro.com）、または電話（+84 123 456 789）でお問い合わせいただけます。カスタマーサービスチームは月曜日から金曜日、9:00〜18:00（GMT+7）に利用可能です。"
          },
          {
            question: "国際配送を提供していますか？",
            answer: "はい、世界中のほとんどの国に配送しています。配送料金と配送時間は場所によって異なります。詳細については配送情報ページをご確認ください。"
          }
        ],
        orders: [
          {
            question: "配送にはどのくらい時間がかかりますか？",
            answer: "標準配送は、国内注文で通常5〜7営業日、国際注文で10〜15営業日かかります。より速い配送のために速達配送オプションもご利用いただけます。"
          },
          {
            question: "注文を追跡できますか？",
            answer: "はい！注文が発送されると、メールで追跡番号が届きます。注文追跡ページまたは配送業者のウェブサイトで注文を追跡できます。"
          },
          {
            question: "どの配送方法を提供していますか？",
            answer: "標準配送、速達配送、プレミアム速達配送を提供しています。配送料金と推定配送時間は、お客様の場所に基づいてチェックアウト時に計算されます。"
          },
          {
            question: "私書箱に配送できますか？",
            answer: "はい、標準配送方法で私書箱に配送できます。ただし、速達配送とプレミアム速達配送には実際の住所が必要な場合があります。"
          }
        ],
        returns: [
          {
            question: "返品ポリシーは何ですか？",
            answer: "未使用、未洗濯で元のパッケージに入った商品でタグが付いた状態で、30日間の返品ポリシーを提供しています。商品は再販可能な状態である必要があります。"
          },
          {
            question: "商品を返品するにはどうすればよいですか？",
            answer: "返品を開始するには、アカウントにログインし、注文履歴に移動して、返品したい商品を選択してください。返品ラベルを印刷して商品を返送する手順に従ってください。"
          },
          {
            question: "返金の処理にはどのくらい時間がかかりますか？",
            answer: "返品商品を受け取り、状態を確認した後、5〜7営業日以内に返金を処理します。返金は元の支払い方法に戻されます。"
          },
          {
            question: "商品を交換できますか？",
            answer: "はい、異なるサイズや色に商品を交換できます。返品リクエストを送信する際に、同じ返品プロセスに従い、交換を希望することを指定してください。"
          }
        ],
        products: [
          {
            question: "どのサイズを注文すればよいかどうやって知りますか？",
            answer: "すべての商品に詳細なサイズ表を提供しています。各商品ページでサイズ情報を見つけるか、サイズガイドページにアクセスして包括的なサイズ情報を確認できます。"
          },
          {
            question: "商品は持続可能な素材で作られていますか？",
            answer: "私たちは持続可能性に取り組んでおり、可能な限り環境に優しい素材を使用しています。商品ページで持続可能性バッジを探して、持続可能な素材で作られた商品を識別してください。"
          },
          {
            question: "プラスサイズを提供していますか？",
            answer: "はい、多くの商品で拡張サイズオプションを提供しています。商品ページで利用可能なサイズを確認してください。通常、XSからXXLまであります。"
          },
          {
            question: "在庫切れの商品を事前注文できますか？",
            answer: "はい、商品が一時的に在庫切れの場合、入荷通知リストに登録できます。今後のコレクションでは事前注文が利用可能な場合があります。"
          }
        ],
        payment: [
          {
            question: "どの支払い方法を受け入れていますか？",
            answer: "すべての主要なクレジットカード（Visa、MasterCard、American Express）、PayPal、銀行振込を受け入れています。すべての取引はSSL暗号化で保護されています。"
          },
          {
            question: "支払い情報は安全ですか？",
            answer: "もちろんです！業界標準のSSL暗号化を使用して支払い情報を保護しています。サーバーに完全なクレジットカード情報を保存することはありません。"
          },
          {
            question: "消費税を請求しますか？",
            answer: "消費税はお客様の配送先住所と適用される現地税法に基づいて計算されます。税金額は購入を完了する前に表示されます。"
          },
          {
            question: "複数の支払い方法で支払えますか？",
            answer: "現在、注文ごとに1つの支払い方法のみを受け入れています。支払いを分割する必要がある場合は、カスタマーサービスチームにお問い合わせください。"
          }
        ],
        account: [
          {
            question: "アカウントを作成するにはどうすればよいですか？",
            answer: "アカウントの作成は簡単です！上部ナビゲーションの「登録」をクリックし、情報を入力し、メールアドレスを確認してください。チェックアウト時にアカウントを作成することもできます。"
          },
          {
            question: "パスワードを忘れました。リセットするにはどうすればよいですか？",
            answer: "ログインページで「パスワードを忘れた場合」をクリックし、メールアドレスを入力すると、パスワードリセットリンクが送信されます。メールの指示に従って新しいパスワードを作成してください。"
          },
          {
            question: "アカウント情報を更新できますか？",
            answer: "はい、ログインしてプロフィールページに移動することで、いつでもアカウント情報を更新できます。名前、メール、パスワード、配送先住所を変更できます。"
          },
          {
            question: "ロイヤルティプログラムはありますか？",
            answer: "はい！購入ごとにポイントを獲得できる報酬プログラムを提供しています。ポイントは将来の注文の割引に使用できます。詳細についてはアカウントダッシュボードをご確認ください。"
          }
        ]
      }
    }
  };

  const t = translations[language] || translations.en;

  const toggleFAQ = (index: number, category: keyof typeof t.faqs) => {
    const baseIndex = Object.keys(t.faqs).indexOf(category as string) * 4;
    const actualIndex = baseIndex + index;
    setOpenIndex(openIndex === actualIndex ? null : actualIndex);
  };

  const getFAQIndex = (category: keyof typeof t.faqs, index: number) => {
    const categories = Object.keys(t.faqs);
    const categoryIndex = categories.indexOf(category as string);
    return categoryIndex * 4 + index;
  };

  const categoryIcons = {
    general: MessageSquare,
    orders: Truck,
    returns: RefreshCw,
    products: Package,
    payment: CreditCard,
    account: Shield
  };

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
                  src="/images/banners/banner-05.png"
                  alt="FAQ Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                    <HelpCircle className="h-12 w-12 md:h-16 md:w-16 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-6 font-light leading-relaxed">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Content */}
          <section>
            <div className="max-w-4xl mx-auto space-y-8">
              {Object.entries(t.faqs).map(([categoryKey, faqs]) => {
                const category = categoryKey as keyof typeof t.faqs;
                const Icon = categoryIcons[category];
                const faqsArray = faqs as Array<{ question: string; answer: string }>;

                return (
                  <Card key={categoryKey} className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center text-xl font-bold">
                        <Icon className="h-6 w-6 mr-3 text-primary" />
                        <span>{t.categories[category]}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {faqsArray.map((faq, index) => {
                        const faqIndex = getFAQIndex(category, index);
                        const isOpen = openIndex === faqIndex;

                        return (
                          <div
                            key={index}
                            className="rounded-lg border-2 border-muted hover:border-primary transition-all overflow-hidden"
                          >
                            <button
                              onClick={() => toggleFAQ(index, category)}
                              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-all"
                            >
                              <span className="font-semibold text-foreground pr-4">
                                {faq.question}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                            {isOpen && (
                              <div className="px-6 py-4 bg-muted/20 border-t border-muted">
                                <p className="text-muted-foreground leading-relaxed font-medium">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Contact Support */}
              <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    <span>{language === 'vi' ? 'Cần Thêm Hỗ Trợ?' : language === 'ja' ? 'さらにサポートが必要ですか？' : 'Need More Help?'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium leading-relaxed">
                    {language === 'vi'
                      ? 'Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, đội ngũ dịch vụ khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn.'
                      : language === 'ja'
                        ? '質問の回答が見つからない場合、カスタマーサービスチームがいつでもサポートいたします。'
                        : "If you couldn't find the answer to your question, our customer service team is always ready to help you."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="mailto:contact@koshiro.com"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold"
                    >
                      <Mail className="h-4 w-4" />
                      {language === 'vi' ? 'Gửi Email' : language === 'ja' ? 'メール送信' : 'Send Email'}
                    </a>
                    <a
                      href="tel:+84123456789"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all font-semibold"
                    >
                      <Phone className="h-4 w-4" />
                      {language === 'vi' ? 'Gọi Điện' : language === 'ja' ? '電話する' : 'Call Us'}
                    </a>
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

export default FAQPage;

