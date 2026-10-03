# Videodan GIF'e — videoyu GIF'e dönüştürün

Bölümü, boyutu ve kare hızını siz seçin.

> Bir MP4, MOV veya WebM'in bir bölümünü hareketli GIF'e çevirin. Bölümü, genişliği ve kare hızını seçin; kareler okunur ve GIF tarayıcınızda yazılır. Hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/videoyu-gife-donusturme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## videolarınız **asla yüklenmez**. Sunucu yoktur.

Her kare kendi tarayıcınız tarafından, kendi donanımınızda okunur, yeniden boyutlandırılır, renk sayısı düşürülür ve yazılır. Buradaki hiçbir şey bir şey getiremez ya da gönderemez — bu araçta hiçbir türde ağ özelliği yok — ve olsaydı bile bu sayfanın öbür ucunda bir videonun gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Her uzunlukta
- ✓ Çevrimdışı çalışır

## Bir video GIF'e nasıl çevrilir

1. **Bir video seçin.** Seçiciye bir MP4, MOV, M4V ya da WebM bırakın veya elle seçin. Tarayıcı onu doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Bölümü işaretleyin.** Klibi oynatın ve başlaması gereken yerde `I`'ya, bitmesi gereken yerde `O`'ya basın ya da çubuktaki tutamakları sürükleyin. Bir GIF birkaç saniyeliktir — dosyanın küçük mü yoksa devasa mı olacağına karar veren ayar, diğer ikisinden çok daha fazla, budur.
3. **Genişliği ve kare hızını seçin.** 480 piksel genişlik ve saniyede 12 kare, bir GIF'in işine yarayan çoğu şeye uyar. Genişliği yarıya indirmek piksel sayısını dörtte bire düşürür; saniyede on iki kare, kimsenin görmediği kareleri ödemeden hareket olarak okunur.
4. **Yapın ve indirin.** Kareler okunur, animasyonun tamamı için 256 renklik tek bir palet seçilir ve her kare yalnızca görüntünün değişen bölümü olarak yazılır. Bittiğinde sayfada oynar; indirmenin size verdiği de aynı dosyadır.

## Uzun sürüm

[Bir video nasıl GIF'e çevrilir](https://abox.tools/tr/rehberler/videoyu-gife-donusturme/): Hangi bölümü, hangi genişliği ve hangi kare hızını seçmelisiniz, bir videonun GIF'i neden videonun on katı boyutunda olur ve GIF'i ne zaman kullanmalısınız.

## Kutuda ayrıca

- [GIF Yapıcı](https://abox.tools/tr/gif-olusturma/): Bir dizi resmi tek bir animasyona çevirin.
- [GIF Ayırıcı](https://abox.tools/tr/gifi-karelere-ayirma/): Her kare kendi PNG'si olarak dışarı.
- [GIF Çözümleyici](https://abox.tools/tr/gif-analiz-etme/): Kareler, gecikmeler, paletler ve her baytın nereye gittiği.
- [Görsellerden Videoya](https://abox.tools/tr/resimleri-videoya-donusturme/): Bir görsel klasörünü videoya çevirin.

## Sorular

### Videom herhangi bir yere yükleniyor mu?

Hayır. Kendi donanımınızda, kendi tarayıcınız tarafından okunur, örneklenir ve dönüştürülür. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Size söylenene güvenmek yerine denetlemeyi tercih ediyorsanız internet bağlantısını kesin ve yine de bir GIF yapın.

### Hangi video biçimlerini dönüştürebilirim?

MP4, M4V ve MOV içlerinde ne olursa olsun doğrudan okunur: H.264, HEVC, AV1 ya da VP9 — yeter ki tarayıcınız o kodlayıcıyı çözebilsin. Tarayıcınızın oynatabildiği başka her şey — en bilineni WebM — bunun yerine oynatıcı her ana ayrı ayrı aranarak okunur; bu daha yavaştır ve hangi karenin nereye düşeceği konusunda biraz daha az kesindir. Tarayıcının ne okuyabildiği ne de oynatabildiği bir dosya, ki pratikte AVI, WMV, FLV ve çoğu MKV demektir, yarı yolda başarısız olmak yerine bunu söyleyen bir mesajla geri çevrilir.

### GIF'im neden bu kadar büyük?

Çünkü GIF, hareketi değil bütün görüntüleri saklayan 1987'den kalma bir biçim. Beş saniyelik bir klipten, geldiği beş saniyelik MP4 kadar küçük bir GIF yapmanın yolu yok — bir videonun GIF'i çoğu zaman videonun on katı olur. Bunu asıl belirleyen üç ayar, sırasıyla: bölümün ne kadar uzun olduğu, görüntünün ne kadar geniş olduğu ve saniyedeki kare sayısı. Genişliği yarıya indirmek piksel sayısını dörtte bire düşürür ve maliyeti yaratan pikseldir.

### Neden yalnızca 256 renk?

Biçim böyle: bir GIF en fazla 256 renkten oluşan tek bir tablo taşır ve her pikseli o tabloya bir sayı olarak saklar. Bu araç, bölümünüzün her karesindeki renkleri sayıp 256 gruba bölerek o 256'yı seçer — medyan kesme, standart yöntem — böylece palet sabit bir renk kümesi olmak yerine klibinize uyar. Bir rengin eksik olduğu yerde dithering en yakın iki rengi karıştırır, böylece bir geçiş çizgilere dönüşmek yerine geçiş olarak kalır.

### Dithering ayarı ne yapıyor?

Az miktarda gürültüyü çok miktarda bantlaşmayla takas eder. Açıkken, yoksa dört düz banda dönüşecek bir gökyüzü geçiş olarak kalır; bunun bedeli hafif bir doku ve daha büyük bir dosyadır. Kapalıyken görüntü daha düz, dosya daha küçük olur ki bu da ekran kayıtlarına, çizgi çalışmalarına ve zaten düz renkten oluşan her şeye uyar. Burada kullanılan dithering, hata yayan türden değil sıralı türdendir; böylece değişmeyen bir arka plan kareler arasında titremek yerine tam olarak sabit kalır.

### Uzunlukta veya boyutta bir sınır var mı?

Sınırlı olan bölüm ve bunu bir kural değil bellek belirliyor: palet seçilirken bölümün her karesi aynı anda tutulur, bu yüzden sayfa ayarlarınızın neye mal olacağını hesaplar ve başlamadan önce söyler. Sekmenin belleği tüketip yok olmasına izin vermek yerine reddeder. Daha kısa bir bölüm, daha küçük bir genişlik ya da daha düşük bir kare hızı, üçü de bunu aşağı çeker.

### Sesi koruyor mu?

Bir GIF ses taşıyamaz. Biçimin sesi olan bir sürümü yok; webin GIF'lerin yerine büyük ölçüde sessiz döngü videolarını koymasının başlıca sebebi de bu. Ses önemliyse videoyu saklayın — [Video Kesici](https://abox.tools/tr/video-kesme/) ondan bir bölümü tek bir kareyi bile yeniden kodlamadan keser.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Sitede reklam var, masrafı karşılayan da o; reklamlara videonuz hakkında hiçbir şey verilmiyor.

## Gizlilik iddiası nasıl doğrulanabilir

- **Videolarınızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** Bu araçta hiçbir türde ağ özelliği yok: yapıştırılacak bir adres, indirilecek bir şey, ilk kullanımda getirilen bir motor yok. Videonuza dokunan her bayt, sayfa yüklenirken bu kaynaktan geldi.
- **Çözme işi yerelde.** Kareler kendi tarayıcınızdaki WebCodecs'ten geçer ya da klibi zaten size gösterecek olan aynı oynatma motorundan. Hangisinin kullanıldığı sayfanın üstünde yazar, çünkü bu karelerin nasıl seçildiğini değiştirir ve bunu görebilmelisiniz.
- **GIF burada, okuyabileceğiniz bir kodla yazılıyor.** Palet, dithering ve LZW sıkıştırması bu aracın kendi klasöründe yaklaşık altı yüz satır. Bir kodlayıcı hizmeti, çalışma anında getirilen bir kitaplık ya da bunların herhangi bir yerinde bir görselin gönderilebileceği bir yer yok.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine videonuz hakkında bir şey verilmiyor: ne bir dosya, ne bir kare, ne bir ad, bir boyut, bir uzunluk ya da işaretlediğiniz bölüm. Okuyan, örnekleyen, renk sayısını düşüren ya da kodlayan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de videonuz hakkında bir şey verilir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfadaki her şey çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, karelerin bir videodan okunmasının iki yolu için `src/frames.js`, palet için `src/quantize.js` ve LZW'siyle birlikte dosyanın kendisi için `src/gif.js`. Hiçbiri istek yapabilecek bir şeyi içeri almaz.
