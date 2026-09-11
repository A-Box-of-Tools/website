# Base64 Kodlayıcı ve Çözücü — ve URL, HTML varlıkları, onaltılık ve kaçışlar

Base64, yüzde kodlaması, HTML varlıkları, onaltılık ve ters bölü kaçışları; iki yönde de. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.

> Base64'ü iki alfabede de kodlayın ve çözün, URL'leri yüzde kodlayın, HTML varlıklarını kaçışlayın; onaltılığı ve ters bölü kaçışlarını okuyun. Hepsi tarayıcınızda çalışır, hiçbir şey yüklenmez — bir belirteç makinenizden hiç çıkmaz.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/base64-kodlama/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## metniniz **asla yüklenmez**. Sunucu yoktur.

Buradaki her kodlama, burada, bu sayfada yapılan, bir dizge üzerinde bir aritmetiktir. Kodekler elle yazılmıştır ve `src/encode.js` içindedir — ve başka bir şey yoktur. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve bu, neredeyse her yerden daha çok burada önemlidir: insanların çevrimiçi bir Base64 çözücüsüne yapıştırdığı şey bir belirteçtir ve bir belirteci bir başkasının sitesine yapıştırmak, onu teslim etmektir.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Base64 yüklemeden nasıl kodlanır ya da çözülür

1. **Kodlamayı seçin.** İki alfabede Base64; tek bir değer ya da bütün bir URL için yüzde kodlaması; beş HTML varlığı; onaltılık baytlar ve bir dizge sabitinin ters bölü kaçışları. Menünün altındaki not her birinin ne işe yaradığını söyler.
2. **Yönü seçin.** *Kodla* düz metni alır ve kodlanmış biçimi üretir; *Çöz* kodlanmış biçimi düz metne geri getirir. Sonuç yazdıkça güncellenir; yön değiştirmek tek tıktır, yeniden yazmak yoktur.
3. **Yapıştırın ya da dosyayı bırakın.** Seçip kopyalayabildiğiniz her şey olur. Seçiciye bırakılan bir dosya kendi tarayıcınız tarafından okunur ve kutuya konur — dışarıda bırakılacak bir yükleme adımı yok.
4. **Varsa hatayı okuyun.** Burada başarısız olan bir çözücü ne bulduğunu söyler — Base64'ün kullanmadığı bir karakter, yanlış yerde dolgu, metin olmayan baytlar — akla yatkın ama yanlış bir şey döndürmek yerine.
5. **Sonucu alın.** Kopyalayın ya da bir metin dosyası olarak indirin. Kutunun altındaki sayaçlar kaç bayt girdiğini ve kaç bayt çıktığını söyler.

## Kutuda ayrıca

- [Metin ve dosya paylaşımı](https://abox.tools/tr/metin-paylasma/): Paylaşım bu açık sekmede yaşar. Okuyucular onu şifreli olarak doğrudan tarayıcınızdan alır ve sekmeyi kapattığınızda biter - hiçbir sunucu hiçbir şey saklamaz.
- [QR ve Barkod Üreteci](https://abox.tools/tr/qr-kod-olusturma/): Yazın, koda dönüşsün. Bir tane üretmek için hiçbir şey gönderilmez.
- [QR ve Barkod Okuyucu](https://abox.tools/tr/qr-kod-okuma/): Bir koda doğrultun ya da onun bir resmini bırakın. Burada okunur, başka hiçbir yerde.
- [Özet ve Sağlama Toplamı](https://abox.tools/tr/saglama-toplami-hesaplama/): Bir indirmeyi, yayıncının bastığı sayıya karşı, kimseye göndermeden denetleyin.

## Sorular

### Metnim herhangi bir yere yükleniyor mu?

Hayır. Bu sayfadaki her kodlayıcı ve her çözücü, kendi donanımınızda, kendi tarayıcınızda çalışan bir işlevdir. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Bunu bir erişim belirteci ya da bir oturum çerezi için kullanmanın sebebi budur: bunlardan birini bir başkasının çözücüsüne yapıştırmak, onu ona vermektir.

### Buradaki Base64, başka her yerdekiyle aynı Base64 mü?

Evet — kendisine karşı değil, RFC 4648'deki test vektörlerine karşı denetleniyor. İki alfabe de çözülür; yani `-` ve `_` ile yazılmış bir JWT, `+` ve `/` ile yazılmış biri kadar kolay okunur ve 64 karakterde satır sonuna sarılmış girdi sizin için açılır. Kodlama UTF-8 baytları üzerinden yapılır; yani şapkalı bir harf ya da bir emoji gidiş dönüşten sağ çıkar.

### Base64 bir şifreleme mi?

Hayır; onu şifreleme sanmak klasik hatadır. Base64 bir yazımdır: aynı baytların, bir URL'de, bir e-postada ya da bir JSON dizgesinde sağ kalan bir alfabeyle yazılmış hali. Herkes geri okuyabilir — bu sayfa bunu bir milisaniyede yapıyor — yani hiçbir şey gizlemez ve hiçbir şeyi korumaz. Elinizdeki şey gizliyse, kodlanmadan önce gerçek bir şifrelemeye ihtiyacı vardır; onun yerine değil.

### Çözme neden başarısız oldu?

Çünkü yapıştırılan şey, kodeğe söylenen şeyin tam olarak kendisi değil ve hata hangi yönden olduğunu söylüyor: Base64 alfabesinin dışında bir karakter, yanlış yerde dolgu, arkasında iki onaltılık basamak olmayan bir yüzde işareti ya da Base64'ten çözülen ama UTF-8 metni olmayan baytlar — bu da genellikle aslın bir dizge değil bir dosya olduğu anlamına gelir. Tarayıcının kendi `atob`'u bunun yerine akla yatkın bir şey döndürürdü; söylenmesi ise bir çözücüye bir şey yapıştırmanın bütün amacıdır.

### İki web adresi kodlamasının farkı ne?

Tek bir değer ya da bütün adres. *Tek bir değeri* kodlamak, URL'nin anlam yüklediği her şeyi kaçışlar — eğik çizgiler, soru işaretleri, ve işaretleri — tek bir sorgu parametresi için istediğiniz de budur. *Bütün bir URL'yi* kodlamak adresi çalışır halde bırakır: eğik çizgiler ve `?` kalır, yalnızca bir URL'nin hiç taşıyamayacağı karakterler kaçışlanır. İlkini bütün bir adrese uygulamak adresi bozar; ikincisini bir değere uygulamak, değerin nerede bittiğini kaybettirir.

### Ne kadar büyük bir dosyayı kaldırabiliyor?

Burada konmuş bir sınır yok; çünkü bunun bedelini ödeyen bir sunucu yok. Pratikteki tavan kendi makinenizdir: birkaç megabaytlık metin gayet iyidir; çok uzun bir belgede ise sayfa, klavye için sizinle kavga etmek yerine yazmanıza bir ara vermenizi bekler ve öyle yeniden kodlar.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok ve ne kadar yapıştırdığınıza dair bir sınır yok. Sitede reklam var, masrafı karşılayan da o; reklamlara metniniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: metninizi çözülmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Yapıştırdığınız şeyin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Yapıştırılan bir belirtecin toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Her kodlayıcı ve her çözücü, bu sayfada bir dizge alıp bir dizge döndüren işlevlerdir.
- **Bir şey yanlışsa çözücü bunu söylüyor.** Tarayıcının kendi `atob`'u reddetmesi gereken girdiyi kabul eder ve akla yatkın bir şey döndürür. Buradaki Base64 elle yazılmıştır ve RFC 4648'in test vektörleriyle sınanır; yapıştırdığınız şey Base64 değilse bunu söyler ve nedenini de söyler. `tests/js/text-encode.test.js` içindeki testler tam olarak bunu sınar.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine metninizden tek bir karakter verilmiyor. Onu okuyan, ayrıştıran ya da yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml` ve kendisiyle değil RFC 4648'in test vektörleriyle sınanan, kötü girdiyi `atob` gibi akla yatkın bir şey döndürmek yerine reddeden Base64 için `src/encode.js`.
