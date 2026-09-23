# QR kod nasıl oluşturulur ve okunduğu nasıl kanıtlanır

QR'ın pahalı hatası kodu yapmak değildir: afişlerin bir yazım hatasına okunduğunu sahada öğrenmektir. Üretmek ve doğrulamak burada iki ayrı araçtır; ikincisini baskıdan önce çalıştırmak bir dakika sürer ve baskının yollayacağı hataların neredeyse hepsini yakalar.

[QR ve Barkod Okuyucu aracını açın](https://abox.tools/tr/qr-kod-okuma/): Bir koda doğrultun ya da onun bir resmini bırakın. Burada okunur, başka hiçbir yerde.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

1. **Oluşturun.** [QR ve barkod oluşturucuyu](https://abox.tools/tr/qr-kod-olusturma/) açın, işi seçin — bir bağlantı, bir Wi-Fi ağı, bir kişi kartı — ve kodun taşıyacağı tam diziyi kontrol edin; sayfa onu saklamak yerine gösterir. Baskı için SVG'yi, ekranlar için PNG'yi dışa aktarın.
2. **Bir tane basın.** Gerçek boyutta, gerçek kâğıda, iki yüzlük baskıdan önce.
3. **Kanıtlayın.** Provayı telefonla fotoğraflayın — açılı, mekânın kendi ışığında — ve fotoğrafı [QR ve barkod okuyucuya](https://abox.tools/tr/qr-kod-okuma/) bırakın. Çözülen içeriği ve bağlantıysa gerçekte ulaştığı ana makineyi gösterir. Kastettiğinizle örtüşüyorsa baskı güvendedir.

İki araç da tarayıcınızda çalışır ve hiçbir yere hiçbir şey göndermez — bu, bir Wi-Fi kodu için, içindeki parolanın hiçbir zaman başkasının sitesine yazılmadığı anlamına gelir.

![Adres yazılmış QR oluşturucu; bitmiş kodu ve bilgilerini gösteriyor: sürümü, hata düzeltme düzeyi ve geriye kalan yer.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

Kod, yapıldı.

## Doğrulamanın gerçekten yakaladıkları

- **Yazım hatası.** En yaygın arıza kod değildir: içindeki adrestir. Geri okumak, yapıştırdığınızı sandığınızı değil, gerçekte kodlananı sınayan tek kontroldür.
- **Boyut ve mesafe.** Salonun karşısından okunacak bir kod, kartvizittekinden daha iri modüller ister. Provayı insanların duracağı yerden fotoğraflamak dürüst testtir; oluşturucunun hata düzeltme seviyeleri, her birinin yoğunlukta neye mal olduğunu açıkça söyler.
- **Renkler.** Açık zemine koyu basılmış kodlar okunur; düşük kontrastlı marka paletleri çoğu zaman okunmaz. Okuyucu çoğu telefondan dayanıklıdır: fotoğrafta *o* zorlanıyorsa, lobideki en eski telefonun hiç şansı yoktur.
- **Kat yeri ve parlama.** Reed-Solomon düzeltmesi, yarı örtülmüş bir kodun yine de okunmasını sağlar — sizin seçtiğiniz seviyeye kadar. Havaya açık asılacak bir afiş, en yüksek seviyeyi ve onun bedeli olan biraz daha sık kodu hak eder.

![Aynı görsel verilmiş okuyucu: kodun içerdiği adresi, sembolojiyi ve görselin neresinde bulduğunu bildiriyor.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

Ve aynı görselin başka bir araçça geri okunması; yanlış çıkmış bir kodu yakalayan tek sınama budur. Okuyucu bulduğunu gösterir, açmaz.

## Aynı okuyucu, sizin olmayan kodlar için

Doğrulamak, başkasının bastığı QR'ı açmanın da güvenli yoludur. Okuyucu, *herhangi bir şey açılmadan önce* adresin tamamını ve gerçekte ulaştığı ana makineyi gösterir ve bağlantıyı gizleyen numaraları adıyla söyler: @ işaretinden önceki kullanıcı adı, benzer görünüşlü bir alfabe, bir yönlendirme. Parkmetredeki çıkartma bu incelemeyi hak eder; kongre yaka kartı da. Sizin adınıza hiçbir şey açılmaz ve taradığınız hiçbir şey hiçbir yere gönderilmez.

## Bunu her hafta yapıyorsanız

Oluşturmak ve denetlemek bilerek iki sayfada yaşar: her biri tek bir iş yapar ve her biri hiçbir şeyin makinenizden ayrılmadığını tek başına kanıtlayabilir. Ama ikisi de açık kaynaktır: MIT lisansı, bağımlılıksız ES modülleri — oluşturucunun kodlayıcısı ve okuyucunun Reed-Solomon çözücüsü, her biri kendini anlatan bir README ile.

Masanızdan her hafta kod çıkıyorsa, bir kod aracısını [depoya](https://github.com/A-Box-of-Tools/website) yönlendirin ve üretip çizilen kodu hemen çözücüden geri geçiren bir sayfa isteyin: her dışa aktarmada bir öz sınama. Modüller okunmak için yazıldı ve onları alıp götürmek, lisansın tam da var olma nedenidir.
