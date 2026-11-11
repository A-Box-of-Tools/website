# GIF Yapıcı — görsellerden hareketli GIF

Bir dizi resmi tek bir animasyona çevirin.

> JPG, PNG veya WebP görselleri hareketli bir GIF'e çevirin; ücretsiz ve tamamen tarayıcınızda. Sırayı, hızı ve boyutu siz belirleyin. Hiçbir şey yüklenmez ve çevrimdışı da çalışır.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/gif-olusturma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## görselleriniz **asla yüklenmez**. Sunucu yoktur.

Her kare kendi tarayıcınız tarafından çizilir, renk sayısı düşürülür ve sıkıştırılır; bitmiş GIF de bu makinenin belleğinde kurulur. Buradaki herhangi bir şey istese bile, bu sayfanın öbür ucunda bir görselin gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Dosyalar cihazınızda kalır

## Görsellerden nasıl GIF yapılır

1. **Görsellerinizi seçin.** Seçiciye bir klasör bırakın ya da dosyaları elle seçin. Tarayıcı onları doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Oynayacakları sıraya koyun.** Tutamağından sürükleyin ya da okları kullanın. "Ada göre sırala" beklediğiniz gibi sayar, yani `frame_2`, `frame_10`'dan önce gelir.
3. **Her karenin ne kadar duracağını ayarlayın.** Kare başına yarım saniye bir slayt gösterisidir; yirmide bir animasyondur. Ya her kareye aynı süreyi bir seferde verin ya da bir tanesini oyalanması için ayrı ayarlayın.
4. **Bir boyut ve renklerin nasıl seçileceğini belirleyin.** Bir GIF alanıyla ve kare sayısıyla büyür ve onu geri küçültecek bir kalite kaydırıcısı yoktur; bu yüzden en çok önemli olan ayar boyuttur. Kare başına 256 renk en iyi görünen varsayılandır; tek bir ortak palet daha küçük ve daha durağandır.
5. **GIF'i yapın ve indirin.** Kendi donanımınızda kurulur, yani ne kadar süreceği bir sıraya değil makinenize bağlıdır. Bitmiş animasyon siz kaydetmeden önce sayfada oynar.

## Uzun sürüm

[Görsellerden nasıl hareketli GIF yapılır](https://abox.tools/tr/rehberler/resimlerden-gif-olusturma/): Bir resim setini tek bir hareketli GIF'e çevirin: bir GIF gerçekte ne kadar hızlı oynayabilir, palet ayarı neyi değiştirir ve dosyayı gerçekten küçülten üç şey.

## Kutuda ayrıca

- [GIF Ayırıcı](https://abox.tools/tr/gifi-karelere-ayirma/): Her kare kendi PNG'si olarak dışarı.
- [GIF Çözümleyici](https://abox.tools/tr/gif-analiz-etme/): Kareler, gecikmeler, paletler ve her baytın nereye gittiği.
- [Görsellerden Videoya](https://abox.tools/tr/resimleri-videoya-donusturme/): Bir görsel klasörünü videoya çevirin.
- [Video Kesici](https://abox.tools/tr/video-kesme/): Tutmaya değer parçaları oynarken işaretleyin. Onları tek video olarak geri alın.

## Sorular

### Görsellerim herhangi bir yere yükleniyor mu?

Hayır. Görselleriniz kendi donanımınızda, kendi tarayıcınız tarafından okunur, çizilir, renk sayısı düşürülür ve sıkıştırılır. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Ağ bağlantısını kesin, yine de GIF yapar.

### Hangi görsel biçimlerini kullanabilirim?

Tarayıcınızın çözebildiği her hareketsiz görsel biçimini; pratikte bu JPG, PNG, WebP, GIF, AVIF ve Apple cihazlarda HEIC demektir. Burada güncel tutulacak ayrı bir liste yok, çünkü çözme işi bizim değil tarayıcının işi.

### GIF'im neden bu kadar büyük?

Çünkü bir GIF her kareyi bütün pikseller olarak saklar. Hareket telafisi yoktur, hiçbir şey "geçen seferkiyle aynı ama kaymış" diye saklanmaz ve bir kalite düğmesi yoktur: boyut kabaca alan çarpı kare sayısıdır ve onu yalnızca üç şey aşağı çeker. \
\
Daha küçük yapın — boyutu yarıya indirmek dosyayı dörtte bire düşürür. Daha az kare kullanın ya da her birini daha uzun tutun. 64 ya da 32 renge inin ve dithering'i kapatın; bu, düz çalışmalarda kulağa geldiğinden daha az, fotoğraflarda ise epeyce maliyetlidir. Yine de sığmıyorsa dürüst cevap şudur: yaptığınız şey bir videodur ve onun MP4'ü belki de onda biri kadar olur.

### Bir GIF ne kadar hızlı oynayabilir?

Sayının ima ettiği kadar hızlı değil. Biçim her karenin gecikmesini saniyenin yüzde biri cinsinden saklar ve tarayıcılar 1990'lardan beri bunun ikisinin altındaki her şeyi saniyenin onda birine sabitliyor — o zamanın dönen dünya küreleri için yazılmış ve hiç kaldırılmamış bir kural. Yani 0,01 sn'lik bir gecikme saniyede 100 kare oynamaz; 10 oynar. Bu araç bu yüzden size 0,02 sn'nin altını hiç sunmaz ve 0,05 sn (saniyede 20 kare) istemeye değer en hızlı sınır sayılır.

### Palet ayarı neyi değiştiriyor?

Bir GIF karesi en fazla 256 renk tutar ve birinin bunları seçmesi gerekir. \
\
**Her kare için en iyi renkler**, her resim için ayrı ayrı 256 renk seçer; bu en keskin görünendir ve birbiriyle ilgisiz fotoğraflardan oluşan bir set için doğru cevaptır. **GIF'in tamamı için tek palet** ise bütün karelerden tek bir tablo kurar. Daha küçük bir dosya yapar ve aynı sahnenin kareleri arasında palet sıçradığında ortaya çıkan titremeyi durdurur — yani kareler bir koleksiyon değil bir dizi olduğunda başvurulacak olan budur.

### Saydam bir arka planı koruyabilir miyim?

Görsellerinizde varsa evet: "Saydamlık"ı "Saydam alanları koru"ya alın. Bunu yapmadan önce bilinmesi gereken bir şey var. GIF saydamlığı tek bittir — bir piksel ya görünmezdir ya da tümüyle boyalı, arası yoktur — dolayısıyla kenar yumuşatmalı kenarlar, yumuşak gölgeler ve solmuş her şey sert bir kenara dönüşür. Animasyonunuz rengini bildiğiniz bir arka plana gidecekse onu o renge düzleştirmek daha iyi görünür.

### Kaç görsel kullanabileceğime dair bir sınır var mı?

Araçta yerleşik bir sınır yok. Pratik tavan, kendi makinenizin belleği ve çıkan dosyaya karşı sabrınızdır: resimler teker teker okunur, yani yüz kare sorun değildir; ama 640 piksellik yüz kare aynı zamanda çok büyük bir GIF demektir. Yukarıdaki "GIF'im neden bu kadar büyük?" başlığına bakın.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok. Çıktıda filigran da yok. Sitede reklam var, masrafı karşılayan da o; reklamlara görselleriniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: görsellerinizi işlenmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Görsellerinizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok. Burada eskiden `connect-src 'none'` yazıyordu ki bu mutlaktı; reklam eklemek buna mal oldu ve bunu söylemek anlaşmanın bir parçası.
- **Kodlayıcı bu depodaki dört dosya.** Bir GIF için renk indirgeyici ve LZW sıkıştırıcısı gerekir ve tarayıcı ikisini de getirmez — bu yüzden ikisi de burada, `src/quantize.js` ve `src/lzw.js` içinde yazılı, kabı da `src/gif.js` içinde. Bir tane yapmak için hiçbir şey getirilmiyor ve ilk kullanımda indirilen bir motor yok.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine görselleriniz hakkında bir şey verilmiyor: ne bir dosya, ne bir küçük resim, ne bir ad, bir boyut ya da bir sayı. Bir görseli okuyan, çözen, çizen ya da sıkıştıran her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de görselleriniz hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfanın her parçası çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu: resimlerinizi GIF'e çevrilmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, her karenin indirgendiği palet için `src/quantize.js` ve sıkıştırıcı ile onun girdiği dosya için `src/lzw.js` ile `src/gif.js` — hiçbirinde ağa erişebilecek tek bir satır yok.
