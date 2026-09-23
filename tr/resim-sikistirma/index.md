# Görsel Sıkıştırıcı — tam istediğiniz boyuta

Boyutu siz söyleyin, gerisini o hesaplasın.

> JPEG, PNG veya WebP'yi tam istediğiniz boyuta sıkıştırın: 100 KB, 2 MB, ne gerekiyorsa. Tarayıcınızda çalışır, hiçbir şey yüklenmez, çevrimdışı da çalışır.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/resim-sikistirma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## görselleriniz **asla yüklenmez**. Sunucu yoktur.

Sıkıştırma, kendi tarayıcınızda, kendi donanımınızda, tarayıcının zaten beraberinde getirdiği kodlayıcılarla çalışır. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve olsaydı bile bu sayfanın öbür ucunda bir görselin gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Bir görsel belirli bir boyuta nasıl sıkıştırılır

1. **Görsellerinizi seçin.** Seçiciye sürükleyip bırakın ya da elle seçin. Tarayıcı onları doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Ulaşmanız söylenen boyutu yazın.** Fotoğrafınızı sürekli geri çeviren yükleme formu için 100 KB, başvuru portalı için 500 KB, hızlı açılması gereken bir sayfa için 2 MB. Sık kullanılan dördü düğme olarak duruyor.
3. **"Hedefe sıkıştır"a basın.** Araç sığan en yüksek kaliteye yaklaşırken her görsel birkaç kez kodlanır. Hedefin zaten altında olan her şey olduğu gibi bırakılır.
4. **Neye mal olduğuna bakın, sonra indirin.** Her sonuç neyle yazıldığını, hangi kalitede olduğunu, boyutların değişip değişmediğini ve ölçüldüğünde orijinaliyle ne kadar örtüştüğünü söyler. "Karşılaştır" iki görseli yan yana koyar.

## Uzun sürüm

[Bir resim tam olarak istenen dosya boyutuna nasıl sıkıştırılır](https://abox.tools/tr/rehberler/resmi-hedef-boyuta-sikistirma/): Bir yükleme formu 500 KB istiyor, fotoğrafınız ise 4 MB. Bir boyut sınırının gerçek bedeli, önce hangi ayarı oynatmanız gerektiği ve bir PNG'nin neden bir JPEG gibi küçülmediği.

## Kutuda ayrıca

- [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/): Boyutu söyleyin. Kutuyu çizin. Biçimi seçin.
- [HEIC'ten JPG'ye](https://abox.tools/tr/heic-jpg-donusturme/): Bir iPhone'un ürettiği fotoğraflar, her şeyin açtığı bir biçimde.
- [Vesikalık Fotoğraf Yapıcı](https://abox.tools/tr/biyometrik-vesikalik-fotograf/): Ülkeyi seçin. O ülkenin kuralını tam olarak uygular.
- [Görüntü istifleyici](https://abox.tools/tr/goruntu-istifleme/): Yirmi kare tek karede, yirmi yükleme ve RAW dönüştürücü olmadan.

## Sorular

### Görselim herhangi bir yere yükleniyor mu?

Hayır. Dosya, tarayıcınızın zaten beraberinde getirdiği JPEG, PNG ve WebP kodlayıcılarıyla, kendi donanımınızda, kendi tarayıcınız tarafından çözülür, sıkıştırılır ve ölçülür. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir.

### Tam olarak istenen boyuta nasıl ulaşıyor?

Deneyerek. Bir kalite ayarını bayt sayısına çeviren bir formül yok — bu tamamen görsele bağlı — bu yüzden araç görseli birkaç kez kodlayıp cevabı arar. Kalite aralığının tepesinden başlar ve ikiye bölerek daraltır; bu da sığan en yüksek kaliteyi yaklaşık sekiz kodlamada bulur. Sayfada gördüğünüz her boyut gerçekten kodlanmış bir dosyadır, tahmin değil.

### Buradaki "en az kayıp" tam olarak ne demek?

Üç somut şey. Birincisi, hedefinizin zaten altında olan bir görsel yeniden kodlanmak yerine bayt bayt aynen geçirilir. İkincisi, kalite çözünürlükten önce harcanır ve yalnızca sıkıştırma izlerinin görünmeye başladığı tabana kadar — o noktadan sonra araç görseli küçültüp kaliteyi geri yükseltir, çünkü az sayıda iyi piksel, çok sayıda bozulmuş pikselden daha iyi görünür. Üçüncüsü, sığan bir sonuç bulunduktan sonra arama bütçe kullanılana dek yeniden yukarı iter; yani 500 KB istediğinizde elinize 300 KB'lık bir dosya geçmez.

### Her sonuçtaki SSIM ve PSNR rakamları nedir?

Sıkıştırmanın neye mal olduğunun ölçümüdür; sonuç çözülüp orijinal görselle karşılaştırılarak alınır. SSIM yerel parlaklığı, kontrastı ve yapıyı karşılaştırır ki bu, değişen piksel saymaya kıyasla gözün itiraz ettiği şeye çok daha yakındır; yaklaşık 0,98'in üzerinde ikisini yan yana ayırt etmek zordur. PSNR ise geleneksel desibel rakamı. Her ikisi de sizin cihazınızda hesaplanır ve her ikisi de gösterilir; böylece düşük kayıp iddiası öne sürülmekle kalmaz, denetlenebilir olur.

### Hangi biçimleri okuyabiliyor ve yazabiliyor?

Tarayıcınızın çözebildiği her şeyi okur; pratikte bu JPEG, PNG, WebP, GIF, BMP ve — güncel tarayıcıların çoğunda — AVIF demektir. JPEG, PNG ve WebP yazar, çünkü tarayıcıların beraberinde getirdiği kodlayıcılar bunlar. "Otomatik"te dosyanızın geldiği biçimi korur ve yalnızca korumak yeniden boyutlandırma ya da gözle görülür bir kalite düşüşü anlamına gelecekse WebP'ye geçer.

### Bir PNG neden çok fazla sıkıştırılamıyor?

Çünkü PNG kayıpsızdır: çevrilecek bir kalite düğmesi yoktur. Bir PNG'yi küçültmenin tek yolu ona daha az piksel ya da daha az renk vermektir; bu yüzden PNG seçiliyken araç hedefe yalnızca yeniden boyutlandırarak ulaşır. Görsel bir fotoğrafsa JPEG ya da WebP, gözle bakınca gayet iyi olduğunu göreceğiniz bir boyutta hedefinize çok daha fazla yaklaşır — ve bir logo ya da saydamlığı olan bir ekran görüntüsüyse WebP, JPEG'in beyazla dolduracağı saydamlığı korur.

### Bir görseli sıkıştırmak EXIF ve GPS verisini siler mi?

Evet, yan etki olarak. Sıkıştırmak, görseli piksellere çözüp o pikselleri yeniden kodlamak demektir ve piksellerle dolu bir tuval hiçbir etiket taşımaz; dolayısıyla konum, kamera modeli, zaman damgaları ve geri kalan her şey yeni dosyaya hiç yazılmaz. Üst verinin gitmesini ama görselin el değmemiş kalmasını istiyorsanız bunun yerine [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/)'yi kullanın — o, hiçbir şeyi yeniden sıkıştırmadan kabı yeniden yazar.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Dosyaların sayısında ya da boyutunda da bir sınır yok, çünkü bunların bedelini ödeyen bir sunucu yok — iş sizin kendi cihazınızda oluyor. Sitede reklam var, masrafı karşılayan da o; reklamlara görselleriniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: görsellerinizi sıkıştırılmak üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Görsellerinizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Sıkıştırmayı yapan `canvas.toBlob` — yani tarayıcınızda zaten kurulu olan kodlayıcı.
- **Sayılar ölçülüyor, rapor edilmiyor.** Boyutlar, kalite değeri ve SSIM karşılaştırması bu sayfada hesaplanıp size gösteriliyor. Bu depoda bir dosya adı, bir boyut, bir sayı ya da bir sonuç taşıyan özel bir analitik olayı yok.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine görselleriniz hakkında bir şey verilmiyor. Bir dosyayı okuyan, sıkıştıran ya da ölçen her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Bu, hepsinin içindeki en basit kanıt.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, kalitenin ne kadarının harcanacağına karar veren arama için `src/compress.js` ve "görsel eşleşme" rakamının arkasındaki karşılaştırma için `src/measure.js`.
