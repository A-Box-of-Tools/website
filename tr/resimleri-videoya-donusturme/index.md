# Görsellerden Videoya — MP4 slayt gösterisi yapın

Bir görsel klasörünü videoya çevirin.

> JPG, PNG veya WebP görselleri MP4 slayt gösterisi videosuna çevirin; ücretsiz ve tamamen tarayıcınızda. Hiçbir şey yüklenmez, kayıt gerekmez ve çevrimdışı da çalışır.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/resimleri-videoya-donusturme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## görselleriniz **asla yüklenmez**. Sunucu yoktur.

Her kare kendi tarayıcınız tarafından kodlanır ve video bu makinenin belleğinde kurulur. Kodlayıcı ağa hiç dokunmaz ve dokunsaydı bile bu sayfanın öbür ucunda bir görselin gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Dosyalar cihazınızda kalır

## Görseller videoya nasıl çevrilir

1. **Görsellerinizi seçin.** Seçiciye bir klasör bırakın ya da dosyaları elle seçin. Tarayıcı onları doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Sıraya koyun ve her birinin ne kadar duracağını ayarlayın.** Sıralamayı değiştirmek için sürükleyin. Bekleme süresi kare ya da saniye olarak verilebilir; ya hepsine birden ya da tek tek.
3. **Bir çözünürlük ve kare hızı seçin.** "En yüksek çözünürlükle eşleş" en büyük görselinizi izler; hazır ayarlar 4K, 1080p, 720p, kare ve dikeyi kapsar ve hiçbiri uymazsa özel bir boyut da var.
4. **Videoyu oluşturun ve indirin.** Kodlama kendi donanımınızda çalışır, yani ne kadar süreceği bir sıraya değil makinenize bağlıdır. Bitmiş MP4 doğrudan tarayıcınızın indirmelerine verilir.

## Uzun sürüm

[Bir klasör dolusu görsel nasıl videoya çevrilir](https://abox.tools/tr/rehberler/resimleri-videoya-donusturme/): Fotoğraflardan bir MP4 slayt gösterisi yapın: kare hızı ve süre gerçekte neyi denetler, yanlış şekildeki resimlerle nasıl başa çıkılır ve sonucun neden ses izi yoktur.

## Kutuda ayrıca

- [Video Kesici](https://abox.tools/tr/video-kesme/): Tutmaya değer parçaları oynarken işaretleyin. Onları tek video olarak geri alın.
- [Video Kırpıcı](https://abox.tools/tr/video-kirpma/): Bir klibi asıl önemli olan kısma indirin.
- [Video Tersleyici](https://abox.tools/tr/videoyu-ters-oynatma/): Önce son kare, sesiyle birlikte.
- [Time-Lapse Yapıcı](https://abox.tools/tr/time-lapse-video-olusturma/): Bir saatlik görüntü, yirmi saniyede.

## Sorular

### Görsellerim herhangi bir yere yükleniyor mu?

Hayır. Görselleriniz kendi donanımınızda, kendi tarayıcınız tarafından okunur, yerleştirilir ve kodlanır. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Tek istisna, yapıştırdığınız bir görseli getiren isteğe bağlı "bir web adresinden ekle" özelliğidir ve o sunucu IP adresinizi görür.

### Hangi görsel biçimlerini kullanabilirim?

Tarayıcınızın çözebildiği her hareketsiz görsel biçimini; pratikte bu JPG, PNG, WebP, GIF, AVIF ve Apple cihazlarda HEIC demektir. Burada güncel tutulacak ayrı bir liste yok, çünkü çözme işi bizim değil tarayıcının işi.

### Hangi video biçimini üretiyor?

H.264 görüntülü MP4 ki bu neredeyse her şeyde oynar. WebCodecs olmayan bir tarayıcıda araç bunun yerine WebM kaydına düşer — aynı görüntü, daha az düzenleyicinin kabul ettiği bir kapta.

### Bunu bir Blender veya After Effects render dizisi için kullanabilir miyim?

Evet — numaralandırılmış bir render dizisi tam da bunun için. Render'ınızın yazdığı kareleri ekleyin, bekleme süresini kare başına bir karede bırakın ve kare hızını render'la eşleştirin. "Ada göre sırala" beklediğiniz gibi sayar, yani `frame_2`, sonrasına değil `frame_10`'un öncesine düşer. \
\
Başlamadan önce bilinmeye değer bir şey: H.264'ün alfa kanalı yoktur, bu yüzden saydamlık karşıya taşınmaz, arka plan rengine düzleştirilir. Alfa kanalını korumanız gerekiyorsa kareleri kendi düzenleyicinizde birleştirin.

### Fotoğraflardan time-lapse yapabilir miyim?

Evet ve bu, bir render dizisiyle aynı iş: her fotoğrafı tek bir kare tutun ve bir kare hızı seçin. 30 fps'te her otuz fotoğraf bir saniye video olur; 12 fps'te aynı fotoğraflar iki buçuk saniye sürer. \
\
"Tarihe göre sırala" bir kamera rulosunu çekildiği sıraya geri koyar ki dosya adları 0001'den yeniden başlamışsa bu önemlidir. Farklı boyutlardaki fotoğraflar sorun değil — "En yüksek çözünürlükle eşleş" videoyu hiçbiri küçültülmeyecek şekilde boyutlandırır.

### Kaç görsel kullanabileceğime ya da videonun ne kadar uzun olabileceğine dair bir sınır var mı?

Araçta yerleşik bir sınır yok. Pratik tavan kendi makinenizin belleği, çünkü bitmiş video siz indirmeden önce orada kuruluyor. Bunu ilk hisseden şey çok büyük 4K slayt gösterileridir.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok. Sitede reklam var, masrafı karşılayan da o; reklamlara görselleriniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: görsellerinizi işlenmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

### Müzik veya ses parçası ekleyebilir miyim?

Henüz değil. Araç yalnızca görüntü üretir: yazdığı MP4'te tek bir video parçası vardır, ses parçası yoktur. Gerekiyorsa ses parçasını sonradan bir video düzenleyicide ekleyin.

## Gizlilik iddiası nasıl doğrulanabilir

- **Görsellerinizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok. Burada eskiden `connect-src 'none'` yazıyordu ki bu mutlaktı; reklam eklemek buna mal oldu ve bunu söylemek anlaşmanın bir parçası.
- **Kodlama yerelde.** WebCodecs tarayıcınızda çalışır ve bitmiş dosya doğrudan bir indirmeye verilir. Bu uygulamanın sunucu tarafı yoktur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine görselleriniz hakkında bir şey verilmiyor: ne bir dosya, ne bir küçük resim, ne bir ad, bir boyut ya da bir sayı. Bir görseli okuyan, çözen, yerleştiren ya da kodlayan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de görselleriniz hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Bilinçli tek istisna.** "Bir web adresinden ekle"yi kullanırsanız, görseli getirmek için o sunucuyla iletişim kurulur ve o sunucu IP adresinizi görür. Yalnızca sizin yapıştırdığınız görseller getirilir ve yalnızca içeri doğru: `img-src` açılmıştır, `connect-src` açılmamıştır. Aşağıdaki sayaç, iletişim kurulan her dış kaynağı listeler.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, web adresinden yükleme dışında her şey çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, ve ağa hiç dokunmayan kodlama döngüsü için `src/encoder.js`.
