# Birden çok sayfa tek ve küçük bir PDF'e nasıl taranır

Bu iş nadiren tek sayfadır. Bir sözleşme ve imza sayfasıdır, ya da bir yıllık fişlerdir; sonunda da birkaç megabaytın üstünü reddeden bir posta kutusu vardır. Üç araç yolun tamamını kapsar ve evraklar baştan sona kendi makinenizde kalır.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

Her sayfayı fotoğraflayın, sonra bütün fotoğrafları tek seferde [Belge Tarayıcı](https://abox.tools/tr/belge-tarayici/)'ya bırakın. Her sayfanın köşelerini bulur, her fotoğrafı düzeltir ve *fotoğraf başına bir sayfalık tek bir PDF* yazar: ayrıca birleştirme adımı yoktur ve sayfalar eklediğiniz sırada durur.

Tarayıcının durduğu yerden iki araç devralır. Belgenin bir kısmı zaten PDF ise — e-postayla gelen sözleşme, taranmış imza sayfanızın etrafında — ikisini [PDF Birleştirici](https://abox.tools/tr/pdf-birlestirme/) ile iç içe geçirin. Ve biten dosya posta kutusunun izin verdiğinden hâlâ büyükse, [PDF Küçültücü](https://abox.tools/tr/pdf-sikistirma/) onu sınırın altına indirir.

İki devir de tek tıklama uzağındadır: tarayıcı PDF'sini yazdığında, indirme düğmesinin altındaki bir satır sonucu doğrudan birleştiriciye ya da sıkıştırıcıya taşımayı önerir, yüklenmiş olarak — birleştirici de kendi sonucunu aynı yolla sıkıştırıcıya devreder.

Zincirde hiçbir şey hiçbir şey yüklemez. Bu, burada neredeyse her yerden daha önemlidir: taranan şeyler sözleşmeler, kimlikler ve tıbbi evraklardır; bu iş için alışılmış uygulamalarsa her sayfayı kendi sunucularından geçirir.

## Fotoğrafları doğru çekmek

Tarayıcı şaşırtıcı derecede çok şeyi kurtarır — açılı kareler, dengesiz lamba ışığı, sayfaya düşen gölge — ama kameranın hiç yakalamadığını kurtaramaz. Üç alışkanlık çoğunu halleder:

- **Kadrajı doldurun**, her kenarın çevresinde görünür bir masa payı bırakarak. Köşeler, sayfa arka plana karşı aranarak bulunur; fotoğraftan taşan sayfanın bulunacak köşesi yoktur.
- **Yukarıdan çekin**, aşağı yukarı dik. Perspektif düzeltilir; ama yatık bir çekimin uzak kenarında daha az piksel vardır ve düzeltme piksel uyduramaz.
- **Fotoğraf başına bir sayfa**, okuma sırasında. Sonradan yeniden sıralamak da olur; ama çektiğiniz sıra aldığınız sıradır ve sırayla çekmek bedavadır.

[Tarama rehberi](https://abox.tools/tr/rehberler/telefonla-belge-tarama/) geri kalanı anlatıyor: köşeler nasıl bulunur, ne zaman kendiniz sürüklemelisiniz ve siyah-beyaz kip dosya boyutuna ne yapar.

![Tarayıcı, bir şeritte fotoğraflanmış üç sayfa; ilki açık ve köşeleri işaretli.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/pages.webp)

Üç sayfa, birlikte fotoğraflanmış ve düzeltilmiş. Her biri kendi köşelerini tutar, böylece kötü çıkmış bir fotoğraf takımı bozmaz.

## Birleştirici yerini ne zaman hak eder

Tarayıcı *fotoğrafları* birleştirir. Birleştirici *PDF'leri* birleştirir; gerçek bir işin ortası ise çoğu zaman ikisidir: az önce fotoğraflanmış imzalı bir sayfa, dosya olarak gelmiş bir belgenin içinde. Önce sayfalarınızı tarayın; sonra taramayı ve asıl PDF'i birlikte birleştiriciye bırakın, sayfaları yerlerine sürükleyin ve tek belge dışa aktarın. Aslın yer imleri ve iç bağlantıları kalan sayfalara göre yeniden kurulur; doldurulmuş form alanları da birlikte gelir.

Farklı günlerde yapılan taramalar için de aynısı geçerlidir: her oturumun PDF'i bir sayfa öbeği olarak düşer ve öbeklerin tek dosya olduğu yer birleştiricidir.

![PDF oluşturucu, listede temizlenmiş üç sayfa; üstünde sayfa boyutu, yön ve kenar boşluğu ayarları.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/document.webp)

Ve ardından aynı üç sayfa tek belge olarak; birleştiricinin yerini hak ettiği adım budur.

## Boyut sınırının altına inmek

Önce ucuz kolu deneyin; o da tarayıcının içinde: kâğıt üstünde mürekkep olan sayfalar için — metin, formlar, fişler — siyah-beyaz kip her sayfayı piksel başına bir bitle saklar ve PDF çoğunlukla hiçbir şey sıkıştırılmadan sayfa başına bir megabaytın epey altına iner. Renk, bedelini yalnızca rengin anlam taşıdığı yerde hak eder.

Dosya yine de gitmek bilmiyorsa — renkli sayfalar, ya da başkasının taramasını içeri almış bir birleştirme — küçültücü önce boyutun gerçekte nerede oturduğunu gösterir, sonra sayfa görüntülerini gösterildikleri çözünürlüğe göre yeniden kodlar. Ayrıca sonucu sunmadan önce açıldığını da denetler; dosya süreli bir sözleşmeyse bunun kıymeti bilinir.

## Bunu her hafta yapıyorsanız

Adımların burada üç sayfada yaşaması bilinçli bir tercihtir: her sayfa tek iş yapar ve her biri evrakların makinenizden hiç çıkmadığını kendi başına kanıtlar. Ama hepsi açık kaynaktır: MIT lisansı, araç başına bir klasör; köşe bulucuyu, birleştiricinin sayfa kopyalamasını ve küçültücünün bütçesini anlatan README'leriyle bağımlılıksız ES modülleri.

Aynı iş masanıza her hafta düşüyorsa, bir kod ajanını [depoya](https://github.com/A-Box-of-Tools/website) yönlendirin ve bu modülleri ona göre tek sayfada birleştirmesini isteyin: kapak sayfanız çoktan yerinde, doğrudan birleşmiş ve küçülmüş bir belgeye tarayın. Modüller okunmak için yazıldı; onları alıp götürmek de lisansın tam olarak var olma sebebi.
