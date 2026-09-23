# DICOM Görüntüleyici — bir .dcm taramasını tarayıcınızda açın

BT, MR, röntgen ve ultrason; penceresi, başlığı ve ölçümleriyle.

> BT, MR, röntgen ve ultrason taramalarını tarayıcınızda açın. Pencere ve seviye, bütün bir seriyi kaydırma, milimetre cinsinden ölçüm, her DICOM etiketini okuma ve dosyada hastayı tam olarak neyin tanımladığını görme. Hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/dicom-goruntuleyici/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## taramalarınız **asla yüklenmez**. Sunucu yoktur.

Tarama kendi tarayıcınız tarafından açılır ve çözülür: başlık, pikseller, pencere, ölçümler. Buradaki herhangi bir şey istese bile bu sayfanın öbür ucunda korunan sağlık bilgilerinin gönderilebileceği bir sunucu yok ve dosya hakkında hiçbir şey - ne hastanın adı, ne çalışma, ne de dosya adı - hiç kimseye okunmaz.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Dosyalar cihazınızda kalır

## Bir DICOM dosyası nasıl açılır

1. **Dosyaları seçin.** Tek bir `.dcm` dosyası ya da diskteki klasörün tamamı — bir BT ya da MR, kesit başına bir dosyadır ve hepsini birden bırakmak seriyi yeniden bir araya getiren şeydir. Dosyalar tarayıcı tarafından doğrudan diskinizden okunur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Seriyi seçin.** Bir çalışma genellikle birkaç seri taşır: önce kılavuz görüntü, sonra her çekim. Her biri, tarayıcının aldığı sırayla dizilir; bu sıra, her zaman aynı yönde ilerlemeyen numaralandırmadan değil, her kesitin hastadaki konumundan hesaplanır.
3. **Pencereyi ayarlayın.** Bir taramayı okunur yapan ve bir görsel düzenleyicide bulunmayan denetim budur. Pencereyi genişletmek için görüntü üzerinde yatay, merkezini kaydırmak için dikey sürükleyin ya da bir BT'de adlandırılmış pencerelerden birini seçin — akciğer, kemik, beyin, yumuşak doku — ki BT'de birimler dünyadaki her tarayıcıda aynıdır.
4. **Yığını kaydırın.** Görüntünün altındaki kaydırıcı kesitler arasında ilerler; görüntüye bir kez tıkladıktan sonra ok tuşları da aynı şeyi yapar. Çok kareli bir dosya — bir ultrason döngüsü, bir anjiyogram — yanındaki düğmeyle oynar.
5. **Bir şey ölçün.** Ölç kipine geçin ve bir çizgi sürükleyin. Dosya piksellerinin birbirine ne kadar uzak olduğunu söylüyorsa cevap milimetre cinsindendir ve kare olmayan pikselleri hesaba katar; dosya söylemiyorsa cevap piksel cinsindendir ve bir ölçek uydurmak yerine bunu söyler.
6. **Başlığı okuyun.** Dosyadaki her öğe; numarası, standardın ona verdiği ad ve taşıdığı değerle, aranabilir hâlde. Onun üstünde ise bu dosyada hastayı neyin tanımladığının listesi — ki bu, addan çok daha fazlasıdır.
7. **İhtiyacınız olanı alın.** Ekrandaki kareyi, ayarladığınız pencereyle ve üzerine hiçbir şey yakılmadan PNG olarak ya da başlığın tamamını düz metin olarak. İkisi de sayfada, zaten orada olandan kurulur.

## Uzun sürüm

[Bir DICOM dosyası nasıl açılır ve içinde ne var](https://abox.tools/tr/rehberler/dicom-dosyasi-acma/): Bir hastane diskinde ne var, dosyaların neden uzantısı yok, bir .dcm taraması tarayıcıda nasıl açılır, pencere ve düzey gerçekte ne yapar ve bir tarama resmin dışında hasta hakkında neler taşır.

## Kutuda ayrıca

- [Görselden ICO'ya](https://abox.tools/tr/favicon-olusturma/): Bir resim girer. Bir tarayıcının, Windows'un ya da bir Mac'in istediği her boyut çıkar.
- [Görselden Data URI'ye](https://abox.tools/tr/resmi-base64e-donusturme/): Resmin tamamı tek satır metin olarak. Doğrudan CSS ya da HTML içine yapıştırın.
- [SVG'den Görsele](https://abox.tools/tr/svg-yi-pnge-donusturme/): Boyutu siz söyleyin. Bir vektörün kaybedecek kendi boyutu yok.
- [Görselden SVG'ye](https://abox.tools/tr/gorseli-svg-ye-donusturme/): Bir şekil, bir dış çizgi. Orada olmaması gerekeni gösterin, yeter.

## Sorular

### Taramam herhangi bir yere yükleniyor mu?

Hayır. Dosya kendi donanımınızda, kendi tarayıcınız tarafından okunur, çözülür ve çizilir. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Ağ bağlantısını kesin, yine de tarama açar. \
\
Bu, bu sitenin başka hiçbir sayfasında olmadığı kadar burada değerlidir. Bir DICOM dosyası başlığında hastanın adını, doğum tarihini ve hastane numarasını taşır; yani birini bir görüntüleyiciye yüklemek, bir yabancıya bir resim değil bir tıbbi kayıt vermek demektir.

### Hangi DICOM dosyalarını açabiliyor?

Üç temel aktarım söz diziminin herhangi birindeki sıkıştırılmamış dosyalar — örtük ve açık little endian ve kullanımdan kaldırılmış big endian — ayrıca deflated, RLE Lossless, baseline JPEG ve bir hastane diskindeki BT ve MR çalışmalarının çoğunun sıkıştırıldığı JPEG Lossless. \
\
JPEG 2000, JPEG-LS ve video için kullanılan MPEG ile HEVC söz dizimlerini çözemez. Bunlar megabaytlarca derlenmiş kitaplık eden kodlayıcılar gerektirir ve istendiğinde böyle bir şey indiren bir sayfa, çevrimdışı çalışan bir sayfa olmazdı. Bunlardan birindeki bir dosya yine de açılır: başlığın tamamı okunup gösterilir ve resmin yerine, size hiçbir şey söylemeyen bozuk görsel simgesi yerine kodlayıcının adını veren bir satır gelir.

### «Pencere ve seviye» nedir, neden gerekiyor?

Bir BT kesiti yaklaşık dört bin farklı değer taşır, ekranınız ise iki yüz elli altı gri gösterir. Pencere, o aralığın hangi diliminin bu grilerin hepsini alacağının seçimidir: altındaki her şey siyah, üstündeki her şey beyaz ve arada kalan grilere yayılır. \
\
Aynı dosyanın iki ayarda başka bir tarama gibi görünmesinin ve akciğerle kemiğin aynı anda görülememesinin sebebi budur. Bir BT'de sayılar Hounsfield birimidir ve mutlak olarak tanımlıdır — su 0, hava −1000 — dolayısıyla bu sayfadaki adlandırılmış pencereler bir radyoloğun iş istasyonunda kullandığı sayıların aynısıdır. Bir MR'da ya da ultrasonda böyle bir ölçek yoktur ve açılan pencere, dosyanın kendi istediği penceredir.

### Ölçümümün piksel cinsinden olduğunu neden söylüyor?

Çünkü o dosya bir pikselin ne kadar büyük olduğunu söylemiyor. Bunu milimetre cinsinden taşıyan şey Pixel Spacing (0028,0030) etiketidir ve pek çok ultrason görüntüsü, taranmış belge ve ikincil yakalama bunu taşımaz. \
\
Orada olduğu yerde ölçüm milimetre cinsindendir ve her eksen kendi aralığıyla ölçülür; pikselleri kare olmayan görüntülerde önemli olan da budur. Olmadığı yerde dürüst cevap bir piksel sayısıdır ve bu araç bir ölçek seçip sonucu bir uzunluk gibi sunmak yerine bunu söyler.

### Klasörümü birkaç seri olarak açtı. Neden?

Çünkü içindeki bu. Bir çalışma serilerden oluşur — kılavuz görüntü, sonra her çekim ya da yeniden yapılandırma — ve her dosya hangisine ait olduğunu Series Instance UID (0020,000E) içinde söyler. Açılır liste, genellikle hepsini tek bir ad listesinde karışık tutan klasörden değil bundan kurulur. \
\
Bir seri içinde kesitler, her birinin hastadaki konumuna göre sıralanır; bu da Image Position ve Image Orientation'dan hesaplanır. Instance Number bariz anahtardır ve ilk tercih değil yedektir: onu dosyaları yazan şey atar ve hastanın uzandığı yönde ilerlemek zorunda değildir.

### «Hastayı ne tanımlıyor» listesi ne demek?

Dosyanızda, taramanın kimin olduğunu söyleyen ya da kim olabileceğini daraltan her alan; makinenizde bu dosyadan okunmuş hâliyle. Liste, DICOM standardının PS3.15 bölümünden gelir — bir veri kümesine kimliksizleştirilmiş denebilmesi için nelerin gitmesi gerektiğini söyleyen bölüm. \
\
Orada olmasının sebebi şu: insanların yanıldığı şey bir taramada bir ad bulunması değildir. Başka ne kadar çok şey bulunduğudur: doğum tarihi, istem numarası, sevk eden hekim, kurum, tarayıcının seri numarası ve dosyayı üreten arşive geri açılan mükemmel anahtarlar olan çalışma UID'leri. Yalnızca adı silinmiş bir tarama anonim değildir. \
\
Bu araç size yalnızca gösterir. Hiçbir şey yazmaz ve hiçbir şey değiştirmez, dolayısıyla bunların hiçbirini çıkaramaz.

### Bir taramayı anonimleştirebilir mi?

Hayır ve bilinçli olarak öyleymiş gibi de yapmıyor. Bu sayfa okur; bir DICOM dosyası yazan bir kodu yoktur. Yaptığı şey, sizinkinde tam olarak ne olduğunu söylemektir; öğrenmesi zor olan ve insanların yanıldığı kısım da odur. \
\
Tanımlayıcıları çıkaran bir araç, çıtası çok daha yüksek ayrı bir iştir — dosyayı piksellere dokunmadan yeniden yazması, UID'leri bütün bir çalışma boyunca tutarlı biçimde değiştirmesi ve bazı tarayıcıların adın ikinci bir kopyasını sakladığı özel öğeler konusunda haklı olması gerekir. Bu sitenin yol haritasında yer alıyor; bir görüntüleyiciye cıvatalanmıyor.

### Uzantısı .dcm olmayan ya da bozuk bir dosyayı açabilir mi?

İkisine de evet. Uzantıya bakılmaz: denetlenen şey dosyanın kendisidir. Olağan 128 baytlık ön ek olmadan yazılmış bir veri kümesi — ağdan doğrudan çekilmiş bir tarama böyle görünür — kodlaması ilk öğesinden hesaplanarak okunur ve sayfa bunu yaptığını söyler. \
\
Ortasında biten bir dosya, gittiği yere kadar okunur. Hasardan önceki her şey gösterilir ve hangi baytta durduğunu söyleyen bir not düşülür. Bir görüntüleyicinin en çok istendiği durum budur; bu yüzden son on iki baytı yüzünden dosyanın tamamını çöpe atmak yanlış davranış olurdu.

### Bu bir tanı görüntüleyicisi mi?

Hayır. Tıbbi cihaz değildir, hiçbir düzenleyici değerlendirmeden geçmemiştir ve buradaki hiçbir şey klinik bir karar vermek için kullanılmamalıdır. Ekranınız kalibre değildir, tarayıcı doğrulanmış bir çizim zinciri değildir ve bunların ikisi de bir web sayfasının içinden düzeltilemez. \
\
İyi olduğu şey, insanların bir taramayı açtığı diğer her şeydir: bir diskte ne olduğuna bakmak, bir ders sunumu ya da bir makale için kesit almak, bir başlık okumak, başka bir programın dosyayı neden reddettiğini anlamak ve bir taramanın kimin olduğu hakkında ne taşıdığını görmek.

### Dosyamı değiştiriyor mu?

Hayır. Bu araç yalnızca okur. Çıktı dosyası, yeniden kodlama ya da DICOM yazan bir düğme yoktur — indirebileceğiniz şey, ekrandaki karenin bir PNG'si ve başlığın düz metin kopyasıdır. Orijinaliniz diskinizde el değmemiş durur.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok. Kendi makinenizin belleğinin ötesinde dosya boyutu ya da kaç dosya açtığınız konusunda bir sınır da yok. Sitede reklam var, masrafı karşılayan da o; reklamlara dosyanız hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: taramanızı çizilmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Taramanızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyanızın toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok. Burada eskiden `connect-src 'none'` yazıyordu ki bu mutlaktı; reklam eklemek buna mal oldu ve bunu söylemek anlaşmanın bir parçası.
- **Bu, burada diğer sayfalardan daha çok önemli.** Bir DICOM dosyası, üzerine biraz üst veri iliştirilmiş bir resim değildir. İçinde bir resim olan bir tıbbi kayıttır: hastanın adı, doğum tarihi, hastane numarası, istem numarası, sevk eden doktor, kurum ve tarayıcının seri numarası, hepsi başlıktaki alanlardır ve dosya nereye giderse onunla birlikte giderler. Bakmak için bir tanesini bir siteye yüklemek, bunların hepsini o siteyi kim işletiyorsa ona vermek demektir. Bu sayfa tam da bunu yapmamak için var.
- **Okuyucu bu depodaki on dört dosya.** Buradaki hiçbir şey herhangi bir yerden getirilmiş bir kitaplık kullanmıyor. `src/dicom.js` dosyayı geziyor, `src/dictionary.js` etiketlerin adlarını biliyor, `src/pixels.js` baytları tekrar ölçüme çeviriyor, `src/rle.js` ve `src/jpeg-lossless.js` bu sayfanın çözebildiği iki sıkıştırılmış biçimi açıyor ve `src/window.js` ölçüleni ekranınızın grilerine eşliyor.
- **Tanımlayıcılar size listeleniyor, başka hiç kimseye değil.** Sayfa, dosyanızda kimin taraması olduğunu söyleyen ya da daraltan her alanı basar; çünkü bu, bir kesiti paylaşmak üzere olan birinin cevabına ihtiyaç duyduğu ve hiçbir görüntüleyicinin cevaplamadığı bir sorudur. Önünüzdeki ekrana konur ve başka hiçbir yere gitmez: bu depoda bunlardan herhangi birini taşıyan bir analitik olayı yok ve olsaydı bile sayfa onu gönderemezdi.
- **Okur. Yazmaz.** Burada dosyanızı değiştiren bir düğme yok ve değiştirebilecek bir kod da yok. Yanınızda götürebileceğiniz şey, ekrandaki karenin bir PNG'si ve başlığın metin kopyasıdır; ikisi de sayfada, zaten üzerinde olandan kurulur. Orijinaliniz diskinizde el değmemiş durur; sekmeyi kapatırsanız ne olacağının dürüst cevabı da budur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine dosyanız hakkında bir şey verilmiyor: ne pikseller, ne bir küçük resim, ne bir ad, bir etiket, bir hasta ya da bir dosya adı. Bir taramayı ayrıştıran, çözen ya da çizen her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de dosyalarınız hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfanın her parçası çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu: taramanızı çizilmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, dosyayı gezen ayrıştırıcı için `src/dicom.js`, piksel çözme için `src/pixels.js`, hastane dışa aktarmalarının çoğunun kullandığı kodlayıcı için `src/jpeg-lossless.js` ve pencere ile seviye için `src/window.js` — hiçbirinde ağa erişebilecek tek bir satır yok.
