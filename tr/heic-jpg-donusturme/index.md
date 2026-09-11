# HEIC'ten JPG'ye — iPhone fotoğraflarını dönüştürün

Bir iPhone'un ürettiği fotoğraflar, her şeyin açtığı bir biçimde.

> iPhone HEIC fotoğraflarını tarayıcınızda JPG'ye dönüştürün. Çözücü kendi makinenizde çalışır: hiçbir şey yüklenmez, hesap gerekmez, çevrimdışı çalışır ve tarih ile kamera ayrıntıları da gelebilir.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/heic-jpg-donusturme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## fotoğraflarınız **asla yüklenmez**. Sunucu yoktur.

Çözme işi kendi tarayıcınızda, kendi donanımınızda çalışır. HEIC, bir tarayıcının kendi başına açmayacağı tek resim biçimidir; bu yüzden bu sayfa çözücüyü yanında taşır — yaklaşık 1,4 MB, bu siteden sunulur ve ilk ziyaretten sonra önbelleğe alınır. Diğer her HEIC dönüştürücüsünün sizden yükleme istemesinin bütün sebebi budur: kodlayıcıyı bir sunucuya koydular ve fotoğraflarınızın oraya gitmesi gerekiyor. Bu araç ise kodlayıcıyı buraya koyuyor. Bu sayfada hiçbir türde ağ özelliği yok ve öbür ucunda bir fotoğrafın gönderilebileceği bir sunucu da yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## HEIC fotoğrafları JPG'ye nasıl dönüştürülür

1. **HEIC fotoğraflarınızı seçin.** Seçiciye bırakın ya da elle seçin; doğrudan bir telefon yedeğinden ya da masaüstündeki bir klasörden. Tarayıcı onları diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez. Liste, her birinin ne olduğunu ve içinde ne bulunduğunu söyler.
2. **Fotoğrafların ne taşıdığını denetleyin.** Her satır çekildiği tarihi, kamerayı ve — fark edilmeye değer kısım olduğu için yeşil renkte — dosyanın GPS koordinatı taşıyıp taşımadığını adıyla söyler. Bu, resim çözülmeden kaptan okunur; yani hiçbir şeye mal olmaz ve hemen görünür.
3. **Bir biçim seçin ve ayrıntılara karar verin.** Bir sebebiniz yoksa JPEG: her yerde açılan biçim odur ve dönüştürmenin bütün amacı da budur. Kalite kaydırıcısı 92'dedir; bir fotoğrafın orijinalinden ayırt edilmesinin zor olduğu ayar budur. Onay kutusu ise tarihin, kameranın ve konumun birlikte gelip gelmeyeceğine karar verir.
4. **"Dönüştür"e basın ve indirin.** Çözücü ilk dönüştürmede gelir — yaklaşık 1,4 MB, bir kez — ve ondan sonraki her fotoğraf kendi makinenizde çözülüp yazılır. Tek dosya size bir indirme düğmesi verir; birkaç dosya ayrıca bir zip verir.

## Uzun sürüm

[Telefonunuzun kaydettiği fotoğraf ve hiçbir şeyin açmadığı biçim](https://abox.tools/tr/rehberler/heic-jpg-donusturme/): iPhone'lar fotoğrafları HEIC olarak kaydeder ve internetin yarısı bir tanesini açamaz. Bu biçimin ne olduğu, neden yalnızca Safari'nin onu çözdüğü, dönüştürmenin resme neye mal olduğu ve bunu fotoğrafları kimseye yüklemeden nasıl yapacağınız.

## Kutuda ayrıca

- [Vesikalık Fotoğraf Yapıcı](https://abox.tools/tr/biyometrik-vesikalik-fotograf/): Ülkeyi seçin. O ülkenin kuralını tam olarak uygular.
- [Görüntü istifleyici](https://abox.tools/tr/goruntu-istifleme/): Yirmi kare tek karede, yirmi yükleme ve RAW dönüştürücü olmadan.
- [Görsel Karartıcı](https://abox.tools/tr/resim-karartma/): Kapattığınız şey dosyanın içinde örtülmez, dosyadan silinir.
- [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/): Bir fotoğrafın sizin hakkınızda ne söylediğini görün. Sonra onu çıkarın.

## Sorular

### Fotoğrafım herhangi bir yere yükleniyor mu?

Hayır. Dosya kendi donanımınızda, kendi tarayıcınız tarafından okunur, çözülür ve yazılır. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Yüklenen tek şey çözücünün kendisidir ve o da bu siteden, bir kez ve fotoğrafınız işin içine girmeden önce gelir.

### Bu sayfa ilk seferde neden 1,4 MB indiriyor?

Çünkü HEIC, bir tarayıcının açmayacağı tek resim biçimidir. Bir kap içindeki bir HEVC karesidir ve yalnızca Apple donanımındaki Safari'nin onun için bir çözücüsü vardır; Chrome, Firefox ve Edge dosyayı öylece reddeder. Yani bir HEIC dönüştürücüsünün bir yerden çözücüye ihtiyacı vardır ve gelebileceği iki yer vardır: bir sunucu ya da sayfa. Diğer her dönüştürücü sunucuyu seçti; hepsinin fotoğraflarınızın yüklenmesine ihtiyaç duymasının sebebi tam olarak budur. Bu araç ise bunun yerine `libheif`'in WebAssembly'ye derlenmiş hâlini taşır. Bu siteden sunulur, ilk ziyaretten sonra önbelleğe alınır ve fotoğraflarınızın hiçbir yere gitmemesinin bedelinin tamamıdır.

### JPEG tarihi, kamerayı ve konumu koruyor mu?

İsterseniz evet ve bu, sayfadaki bir onay kutusudur. Açık bırakılırsa EXIF bloğu HEIC'ten kopyalanır ve telefonun yazdığı hâliyle tam olarak JPEG'e yazılır; böylece dönüştürülmüş fotoğraf, dönüştürüldüğü güne göre değil çekildiği güne göre sıralanır — ki HEIC dönüştürücüleriyle ilgili olağan şikâyet de budur. Tek bir etiket değişir ve yalnızca o: «dik» olarak ayarlanan yön etiketi; çünkü dönüş piksellere zaten uygulanmıştır ve onu bir kez daha uygulayan bir görüntüleyici her dikey fotoğrafı yan yatırırdı. Onay kutusunu kapatın; JPEG resimle birlikte ve başka hiçbir şey olmadan çıksın.

### GPS koordinatlarını siliyor mu?

Orada olduklarını size söyler, sonra ne isterseniz onu yapar. Her fotoğrafın satırı, siz bir şey dönüştürmeden önce dosyanın koordinat taşıyıp taşımadığını söyler ki bu, telefonun yaptığından fazlasıdır. "Tarihi, kamerayı ve ayarları koru"nun işaretini kaldırmak, onları diğer her şeyle birlikte JPEG'in dışında bırakır; işaretli bırakmak onları karşıya taşır. İstediğiniz şey etiketleri ayrıntılı gözden geçirmek ya da zaten JPEG olan fotoğraflardan onları silmekse [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/) bunun aracıdır ve bunu resmi yeniden sıkıştırmadan yapar.

### Resim yeniden sıkıştırılıyor mu?

Evet ve öyle olmak zorunda: HEIC ve JPEG farklı kodlayıcılardır, yani birinden diğerine resmi çözüp yeniden kodlamadan geçmenin yolu yoktur. Denetleyebildiğiniz şey bunun ne kadara mal olacağıdır. Kalite kaydırıcısı varsayılan olarak 92'dedir; bu değerde bir fotoğrafı orijinalinden ayırmak çok zordur. Hiç kayıp istemediğiniz ve dosyanın beş ila on kat büyük olmasını umursamadığınız durum için de menüde PNG vardır.

### Dosyanın adı .jpg ama aslında HEIC ise ne olur?

Yine çalışır. Buraya bırakılan her dosya adıyla değil ilk baytlarıyla tanınır; çünkü ad, dosyaya en son dokunan uygulamanın ona ne demeye karar verdiğidir — ve ".jpg" adıyla gelmiş bir HEIC, insanların böyle bir aracı aramaya başlamasının en yaygın yollarından biridir. Gerçekten JPEG ya da PNG olan bir dosya, kendisinin bir kopyasına dönüştürülmek yerine bunu söyleyen bir mesajla geri çevrilir.

### Bir Live Photo'yu ya da bir seri çekimi dönüştürebilir mi?

İçindeki hareketsiz resimleri evet. Bir HEIC birden fazla resim tutabilir ve tuttuğu her biri dönüştürülüp orijinal adının sonuna bir numara eklenerek adlandırılır. Bir Live Photo'nun video yarısı, telefonun HEIC'in yanında tuttuğu ayrı bir dosyadır; yani burada dönüştürülecek hâlde değildir. Derinlik haritaları ve küçük resimler kabın içindedir ama kimsenin istediği resimler değildir ve olduğu gibi bırakılır.

### AVIF dosyamı neden almıyor?

Çünkü ona yapılacak bir şey yok. AVIF, HEIC ile aynı kaptır; içinde HEVC yerine AV1 vardır ve her güncel tarayıcı bir tanesini yerel olarak çözer — yani bir dönüştürücü, sizde olmayan bir sorunu çözmek için bir megabaytlık motor taşıyor olurdu. Bir AVIF'i JPEG olarak istiyorsanız [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/) ve [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/), ikisi de tarayıcınızın zaten sahip olduğu çözücüyü kullanarak AVIF okur ve JPEG yazar.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Dosyaların sayısında ya da boyutunda da bir sınır yok, çünkü bunların bedelini ödeyen bir sunucu yok — iş sizin kendi cihazınızda oluyor. Sitede reklam var, masrafı karşılayan da o; reklamlara fotoğraflarınız hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet, çözücüsüyle birlikte. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin; fotoğraflarınız üzerinde tam olarak eskisi gibi çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğine dair var olan en güçlü kanıt: HEIC'lerinizi çözülmek üzere uzağa gönderen bir dönüştürücü, siz fişi çeker çekmez dururdu; bu ise durmuyor.

## Gizlilik iddiası nasıl doğrulanabilir

- **Fotoğraflarınızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Çözücü buradan geldi ve hiçbir yere gitmiyor.** HEIC, bir kap biçimi içindeki HEVC'dir ve Safari dışında hiçbir tarayıcı onu çözmez; bu yüzden bu sayfa `libheif`'in WebAssembly'ye derlenmiş hâlini taşır — yaklaşık 1,4 MB, bu depoya işlenmiş, bu kaynaktan sunulan ve buradaki diğer her dosya gibi hizmet çalışanı tarafından önbelleğe alınan bir dosya. Bir CDN'den getirilmiyor, çünkü bu her ziyaretin yoluna üçüncü bir tarafı koyardı ve aracın çevrimdışı çalışmasını engellerdi. İkili dosyanın betiğin yanında değil içinde olmasının sebebi de tam olarak budur: onu başlatmak için hiçbir getirme gerekmesin diye.
- **Burada hiçbir şey bir şey getirmiyor.** Bu araç için yazılmış hiçbir dosyada `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Beraberinde gelen motor, her Emscripten derlemesi gibi, bir `.wasm` dosyasını bir adresten getirecek yükleyici yollarını içerir; onlara girilmiyor, çünkü ikili dosya zaten elde — ve girilseydi bile `connect-src` yalnızca Google'ın ölçüm uç noktalarını sayar, dolayısıyla tarayıcı bunu reddederdi. Kanıt söz değil, politikadır.
- **Üst veri burada okunuyor ve size bildiriliyor.** Sayfadaki liste her fotoğrafın ne taşıdığını söyler — tarih, kamera ve içinde GPS koordinatı olup olmadığı — çünkü bu, JPEG'i birine vermeden önce bilmek isteyebileceğiniz bir şeydir. Dosyadan bu tarayıcıda `src/boxes.js` tarafından okunur, bu sayfada gösterilir ve tümüyle sizin seçiminize göre JPEG'inize yazılır ya da dışarıda bırakılır. Bu depoda bir dosya adı, bir tarih, bir koordinat ya da bir sayı taşıyan özel bir analitik olayı yoktur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine fotoğraflarınız hakkında bir şey verilmiyor. Bir dosyayı okuyan, çözen ya da yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Sayfayı bir kez yükleyin ve ağ bağlantısını kesin; araç hiç değişmez — çözücü de onunla birlikte önbelleğe alınmıştır. Hepsinin içindeki en basit kanıt bu ve burada bu sitenin herhangi bir yerinden daha güçlü: fotoğraflarınızı çözülmek üzere uzağa gönderen bir dönüştürücü bunu asla başaramazdı.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, çözücünün nasıl yüklendiği ve neye izin verildiği için `src/heif.js`, fotoğrafın üst verisini bulan kap ayrıştırması için `src/boxes.js` ve o üst veriye bir JPEG'e girerken ne olduğu için `src/exif.js`. Motorun kendisi `vendor/libheif.js`'tir; değiştirilmemiş hâlde ve lisansı yanında.
