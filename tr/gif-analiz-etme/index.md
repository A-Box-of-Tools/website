# GIF Çözümleyici — bir GIF'in içinde gerçekte ne var

Kareler, gecikmeler, paletler ve her baytın nereye gittiği.

> Bir GIF'i tarayıcınızda parçalarına ayırın: gecikmesi ve tasfiye kuralıyla her kare, renk tabloları, döngü sayısı ve dosya boyutunun nereye gittiğine dair bayt bayt bir döküm. Hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/gif-analiz-etme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## GIF'leriniz **asla yüklenmez**. Sunucu yoktur.

Dosya kendi tarayıcınız tarafından açılır ve parçalarına ayrılır: blok yapısı, LZW açma işlemi ve bu sayfada çizilen her kare bu makinede yapılır. Buradaki herhangi bir şey istese bile, bu sayfanın öbür ucunda bir dosyanın gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Dosyalar cihazınızda kalır

## Bir GIF nasıl çözümlenir

1. **Bir GIF seçin.** Seçiciye bırakın ya da elle seçin. Tarayıcı onu doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Önce özeti okuyun.** Tuval boyutu, kare sayısı, animasyonun ne kadar sürdüğünü söylediği ve gerçekte ne kadar oynadığı. Bu son ikisi insanların beklediğinden daha sık farklı çıkar ve sebebi bir sonraki bölümde.
3. **Göze çarpanlara bakın.** Oradaki her satır sizin dosyanızdan ölçülmüştür: hiçbir tarayıcının uymayacağı gecikmeler, eksik bir döngü bloğu, hiçbir şeyin başvurmadığı renk tabloları, bazı karelerden daha büyük olan üst veri. Hiçbiri neyi yapmak istediğinize dair bir tahmin değildir.
4. **Baytların nereye gittiğini görün.** Dosyanın her baytı tam olarak bir satırdadır ve satırların toplamı dosyayı verir. Büyük kısmı "sıkıştırılmış pikseller"de değilse, tablonun geri kalanı nerede olduğunu söyler.
5. **Kareleri gezin.** Her biri gecikmesini, dikdörtgenini, tasfiye yöntemini ve boyutunu gösterir. "Her kareden sonraki tuval" ile "yalnızca her karenin sakladığı" arasında geçiş yapın — dosyanın iyileştirilmiş olup olmadığını ikincisiyle görürsünüz; çünkü iyi yapılmış bir GIF küçücük dikdörtgenler saklar, kötü yapılmış olan ise her seferinde görüntünün tamamını.
6. **Gerekirse raporu alın.** Çözümlemenin tamamı düz metin olarak; bir mesaja yapıştırmak ya da dosyanın yanında saklamak için. Zaten ekranınızda duranlardan sayfa içinde kurulur.

## Uzun sürüm

[Bir GIF'in içinde gerçekte ne var](https://abox.tools/tr/rehberler/gifin-icinde-ne-var/): Kareler, gecikmeler, elden çıkarma yöntemleri ve renk tabloları anlatılıyor; tarayıcılar en hızlı gecikmeleri neden reddediyor ve bir GIF'in dosya boyutunun gerçekte nereye gittiğini nasıl bulursunuz.

## Kutuda ayrıca

- [Görsellerden Videoya](https://abox.tools/tr/resimleri-videoya-donusturme/): Bir görsel klasörünü videoya çevirin.
- [Video Kesici](https://abox.tools/tr/video-kesme/): Tutmaya değer parçaları oynarken işaretleyin. Onları tek video olarak geri alın.
- [Video Kırpıcı](https://abox.tools/tr/video-kirpma/): Bir klibi asıl önemli olan kısma indirin.
- [Video Tersleyici](https://abox.tools/tr/videoyu-ters-oynatma/): Önce son kare, sesiyle birlikte.

## Sorular

### GIF'im herhangi bir yere yükleniyor mu?

Hayır. Dosya kendi donanımınızda, kendi tarayıcınız tarafından okunur, açılır ve çizilir. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Ağ bağlantısını kesin, yine de GIF çözümler.

### GIF'im neden gecikmelerin söylediğinden yavaş oynuyor?

Çünkü her tarayıcı saniyenin yüzde ikisinin altındaki bir gecikmeye uymayı reddeder ve kareyi onda bir saniye tutar. Kural 1996'da Netscape'e, o zamanın dönen dünya küreleri ve "yapım aşamasında" tabelaları için yazıldı ve o günden beri her tarayıcıya kopyalandı; hiçbir zaman kaldırılmadı. \
\
Yani kareleri hep 0,01 sn diyen bir GIF saniyede 100 kare oynamaz. 10 oynar ki bu, onu yapan neyse onun istediğinden beş ila on kat daha yavaştır. Bu sayfa iki sayıyı da gösterir — dosyanın söylediğini ve gerçekte yapacağını — ve etkilenen kareleri işaretler. Dosyayı yapan neyse orada çözüm, 0,01 yerine 0,02 yazmaktır.

### «Tasfiye» ne demek?

Bir karenin süresi dolduğunda ekranda ne bırakılacağı; bir animasyonun doğru mu görüneceğine yoksa bulaşacak mı olduğuna karar veren alan da bu. \
\
**Yerinde kalsın**, bir sonraki karenin bunun üzerine boyayacağı anlamına gelir; kareler opaksa ve birbirini kapatıyorsa istediğiniz budur. **Arka plana kadar temizle** önce karenin dikdörtgenini siler; saydamlığın ihtiyaç duyduğu şey budur — o olmadan bir sonraki karenin saydam yerlerinden bir önceki görünür. **Altında ne varsa geri koy**, bu kare çizilmeden önce orada ne varsa onu geri getirir; sabit bir arka plan üzerinde hareket eden küçük bir nesne böyle saklanır. **Belirtilmemiş** ise dosyanın söylemediği anlamına gelir ve her görüntüleyici bunu "yerinde kalsın" gibi işler.

### GIF'im neden bu kadar büyük?

"Baytlar nereye gitti" tablosu bunu genel olarak değil sizin dosyanız için yanıtlar ve olası cevaplar birkaç tanedir. \
\
Neredeyse tamamı **sıkıştırılmış pikseller** ise dosya yalnızca çok fazla görüntüdür: GIF her kareyi bütün pikseller olarak saklar; hareket telafisi ve kalite düğmesi yoktur, yani boyut kabaca alan çarpı kare sayısıdır. Daha az kare, daha küçük boyut ya da daha az renk tek kaldıraçtır. \
\
Büyük bir dilim **renk tabloları** ise dosya kare başına 768 bayttan bir palet yazıyor demektir. Büyük bir dilim **üst veri** ise bir düzenleyici geride bir XMP paketi bırakmıştır ve bu, görüntüye dokunmadan kaldırılabilir. Kareler tuvalin tamamını kaplıyorsa da kodlayıcı hangi bölümün gerçekten değiştiğini hiç hesaplamamıştır — ki çekilmiş ya da kaydedilmiş her şeyde bu, dosyanın büyük kısmıdır.

### İki kare görünümü arasındaki fark ne?

**Her kareden sonraki tuval**, bir görüntüleyicinin o anda gösterdiğidir: bu kare, kendinden öncekilerin bıraktığının üzerine çizilmiş hâlde. **Yalnızca her karenin sakladığı** ise dosyanın o kare için gerçekten tuttuğu dikdörtgendir; tek başına, altında hiçbir şey olmadan. \
\
İlginç olan ikincisi. Bir GIF bir kareyi yalnızca görüntünün değişen bölümü olarak saklayabilir; çoğunlukla sabit duran bir pencerenin ekran kaydının küçük olabilmesinin sebebi budur. Dosyanızdaki her kare tuvalin tamamıysa hiçbir şey bu işi yapmamıştır — ve bunu animasyonu izleyerek anlayamazsınız, yalnızca saklanana bakarak anlarsınız.

### Dosyamda bir yorum ya da XMP olduğunu söylüyor. Bu ne?

Görüntüyle birlikte yolculuk eden ve hiçbir görüntüleyicinin çizmediği metin. Bir yorum bloğu genellikle dosyayı yazan şeyin adıdır. Bir XMP paketi ise bir görsel düzenleyicinin ne yaptığını kaydetmek için yazdığı XML'dir ve düzenleme geçmişini, yazılım sürümünü ve bazen yazarın adını taşıyabilir. \
\
Bu sayfa ikisini de tam olarak basar, çünkü üst veriyle ilgili ilginç soru onun var olması değil ne dediğidir. Size gösterilir ve başka hiç kimseye gösterilmez: bu depoda bunların herhangi birini birine okuyan bir şey yok.

### Bozuk bir GIF'i açabilir mi?

Dener ve nerede pes ettiğini söyler. Bir bloğun ortasında biten, blok işaretinin olması gereken yerde bir bayt bulunan ya da sıkıştırılmış verisi erken tükenen bir kare taşıyan bir dosya, o noktaya kadar okunan her şeyi yine de gösterir ve sorun en üstte adıyla belirtilir. Bir çözümleyicinin en çok istendiği durum tam da budur; bu yüzden tek bir bozuk bayt yüzünden dosyanın tamamını çöpe atmak yanlış davranış olurdu.

### Dosyamı değiştiriyor mu?

Hayır. Bu araç yalnızca okur. Çıktı dosyası, yeniden kodlama ya da GIF yazan bir düğme yoktur — indirebileceğiniz tek şey çözümlemenin düz metin bir kopyasıdır. Orijinaliniz diskinizde el değmemiş durur; sekmeyi kapatırsanız ne olacağının dürüst cevabı da budur.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok. Kendi makinenizin belleğinin ötesinde bir dosya boyutu sınırı da yok. Sitede reklam var, masrafı karşılayan da o; reklamlara dosyanız hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: GIF'inizi çözümlenmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **GIF'inizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyanızın toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok. Burada eskiden `connect-src 'none'` yazıyordu ki bu mutlaktı; reklam eklemek buna mal oldu ve bunu söylemek anlaşmanın bir parçası.
- **Okuyucu bu depodaki dört dosya.** Buradaki hiçbir şey, dosyada ne olduğunu anlamak için tarayıcının kendi GIF çözücüsünü kullanmıyor; çünkü o çözücü bir baytın nereye gittiğini söylemez. Bu yüzden biçim elle okunuyor: `src/gif.js` blokları geziyor, `src/lzw.js` pikselleri açıyor, `src/frames.js` onları üst üste diziyor ve `src/budget.js` parçaları toplayıp dosyanın boyutunu tutturup tutturmadığını denetliyor.
- **Yorumlar ve üst veri size gösteriliyor, başka hiç kimseye değil.** Bir GIF bir yorum bloğu, bir düzenlemeyi anlatan bir XMP paketi ya da bir renk profili taşıyabilir ve bu sayfa bunların hepsini basar. Onlar önünüzdeki ekrana konur ve başka hiçbir yere gitmez: bu depoda bunlardan herhangi birini taşıyan bir analitik olayı yok ve olsaydı bile sayfa onu gönderemezdi.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine dosyanız hakkında bir şey verilmiyor: ne dosya, ne bir küçük resim, ne bir ad, bir boyut, bir kare sayısı ya da bir yorum. Bir GIF'i okuyan, açan ya da çizen her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de dosyalarınız hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfanın her parçası çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu: GIF'inizi çözümlenmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, dosyayı gezen blok okuyucu için `src/gif.js`, açıcı için `src/lzw.js` ve bayt muhasebesi için `src/budget.js` — hiçbirinde ağa erişebilecek tek bir satır yok.
