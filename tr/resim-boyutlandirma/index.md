# Görsel Boyutlandırıcı — boyutlandırın, kırpın, dönüştürün

Boyutu söyleyin. Kutuyu çizin. Biçimi seçin.

> JPEG, PNG ve WebP görselleri tarayıcınızda boyutlandırın, kırpın ve dönüştürün. Tam piksel, yüzde ya da uzun kenar — tek bir görsel veya koca bir klasör. Hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/resim-boyutlandirma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## görselleriniz **asla yüklenmez**. Sunucu yoktur.

Boyutlandırma, kırpma ve biçim değişikliğinin hepsi kendi tarayıcınızda, kendi donanımınızda, tarayıcının zaten beraberinde getirdiği görsel kodlayıcılarla çalışır. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve olsaydı bile bu sayfanın öbür ucunda bir resmin gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Bir görsel yüklemeden nasıl boyutlandırılır

1. **Görsellerinizi seçin.** Seçiciye bırakın ya da elle seçin. Tarayıcı onları doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **İsterseniz kırpın.** Kutu resmin tamamının üstünde başlar; yani ona dokunmazsanız hiçbir şey kırpılmaz. Sürükleyin ya da bir şekle kilitleyin — profil fotoğrafı için 1:1, hikâye için 9:16, küçük resim için 16:9 — ve sığanların en büyüğü için "En büyük"e basın. Her görsel kendi kutusunu taşır: bunun yerine bir başkasının üstüne çizmek için listedeki herhangi bir satıra tıklayın. Hepsinin aynı şekilde çerçevelenmesi gerekiyorsa onu da tek bir düğme yapar.
3. **Ne boyutta çıkacağını söyleyin.** Bir genişlik, bir yükseklik ya da ikisi; dikey ve yatay çekimleri birbiriyle aynı boyutta tutan bir uzun kenar; ya da düpedüz bir yüzde. İki kutudan birini boş bırakın, resim kendi şeklini korusun.
4. **Biçimi seçin, sonra düğmeye basın.** Her dosyayı geldiği hâliyle bırakın ya da hepsini JPEG, PNG veya WebP olarak yazın. Her sonuç neye dönüştüğünü ve ne kadar küçüldüğünü söyler; arkasındaki her rakamla birlikte tam boyutta açmak ve karşılaştırmak için yanındaki özgün hâliyle görmek üzere birine tıklayın. Bir yığın tek bir zip olarak iner.

## Uzun sürüm

[Bir görsel bozmadan nasıl boyutlandırılır](https://abox.tools/tr/rehberler/resim-boyutlandirma/): Piksel boyutlarını değiştirdiğinizde resminizin başına ne gelir: küçültmek neden güvenli, büyütmek neden değil, kutu yanlış şekilde olduğunda ne yapmalı ve ne zaman bunun yerine kırpmalı.

## Kutuda ayrıca

- [HEIC'ten JPG'ye](https://abox.tools/tr/heic-jpg-donusturme/): Bir iPhone'un ürettiği fotoğraflar, her şeyin açtığı bir biçimde.
- [Vesikalık Fotoğraf Yapıcı](https://abox.tools/tr/biyometrik-vesikalik-fotograf/): Ülkeyi seçin. O ülkenin kuralını tam olarak uygular.
- [Görüntü istifleyici](https://abox.tools/tr/goruntu-istifleme/): Yirmi kare tek karede, yirmi yükleme ve RAW dönüştürücü olmadan.
- [Görsel Karartıcı](https://abox.tools/tr/resim-karartma/): Kapattığınız şey dosyanın içinde örtülmez, dosyadan silinir.

## Sorular

### Görselim herhangi bir yere yükleniyor mu?

Hayır. Dosya, tarayıcının zaten beraberinde getirdiği JPEG, PNG ve WebP kodlayıcılarıyla, kendi donanımınızda, kendi tarayıcınız tarafından çözülür, kırpılır, ölçeklenir ve yazılır. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir.

### Genişlik verip yükseklik vermezsem ne olur?

Yükseklik, resmin kendi şeklinden gelir ki neredeyse her zaman istenen de budur: "1920 genişliğinde", "1920 genişliğinde ve bunun getirdiği yükseklikte" demektir. İkisini birden doldurun, ikisi resmin şekliyle çelişebilir; "şekiller uyuşmazsa" seçiminin ortaya çıktığı tek an da budur — kutunun içine sığdır, kutuyu doldur ve taşanı kes, arka planla tamamla ya da esnetip bozulmayı kabul et.

### Boyutlandırmak görselin kalitesini düşürür mü?

Bir resmi küçültmek, görebileceğiniz hiçbir biçimde düşürmez: içeri giren piksel, dışarı çıkandan fazladır; yani korunan ayrıntı gerçek ayrıntıdır. Bir resmi büyütmek ise hiç fotoğraflanmamış olanı ekleyemez — sonuç aynı resmin daha keskin değil daha yumuşak bir kopyasıdır — "bir resmi başladığından büyük yapma"nın varsayılan olarak açık olmasının sebebi de budur. Bir parça bedeli olan şey, biçim JPEG ya da WebP ise sonrasındaki yeniden kodlamadır; kalite kaydırağı da orada harcadığınızdır.

### Her görseli farklı kırpabilir miyim?

Evet — varsayılan da budur. Listedeki her görsel kendi pikselleriyle kendi kutusunu taşır ve bir satıra tıklamak o görseli, kendi kutusu ve kendi kilitli şekliyle birlikte ön izlemeye koyar. Birine yaptığınız hiçbir şey bir diğerini etkilemez. Her kutu ayrıca resmin tamamının üstünde başlar; yani hiç üstüne çizmediğiniz bir görsel hiç kırpılmaz.

### Koca bir yığını tek seferde aynı şekilde kırpabilir mi?

Evet, ön izlemenin altındaki düğmeyle. Diğer her görsele aynı göreli alanı — kendi genişlik ve yüksekliğinin aynı kesirlerini — verir ki hepsi aynı boyutta olan bir ekran görüntüsü ya da dışa aktarım seti için bu, tam olarak aynı kutu demektir ve sayfa da bunu söyler. Bir şekil kilitliyse bunun yerine her birine, o alanın içindeki o şekilden en büyük kutuyu verir; yani 1:1'e ve ardından o düğmeye basmak, dikey ve yatay çekimlerin karışık olduğu bir klasörden size kareler çıkarır. Her kutu sonrasında da düzenlenebilir kalır.

### Hangi biçimleri okuyabiliyor ve yazabiliyor?

Tarayıcınızın çözebildiği her şeyi okur; pratikte bu JPEG, PNG, WebP, GIF, BMP ve — güncel tarayıcıların çoğunda — AVIF demektir. JPEG, PNG ve WebP yazar; çünkü tarayıcıların beraberinde getirdiği kodlayıcılar bunlardır. "Biçimi koru"da bir JPEG JPEG kalır ve bir PNG PNG kalır; tarayıcının yazamadığı bir şey, örneğin bir GIF ya da bir BMP, PNG olarak çıkar — saydamlığı ve düz rengi bozulmadan koruyan biçim odur.

### JPEG olarak kaydettiğimde saydamlığa ne olur?

Arka plan rengiyle doldurulur; çünkü JPEG'in onu saklayacak bir alfa kanalı yoktur. Rengi siz seçersiniz ve beyazdan başlar; çoğu insanın istediği ve başka hemen her aracın size söylemeden yaptığı da budur. Tamamlanmış bir çerçevenin arkasında da aynı renk kullanılır. Bunun yerine PNG ya da WebP olarak kaydedin, saydamlık dokunulmadan geçsin.

### EXIF ve GPS verisini siliyor mu?

Gerçekten işlediği her şeyde evet, bir yan etki olarak: kırpmak ya da boyutlandırmak, resmi piksellere çözmek ve o pikselleri yeniden kodlamak demektir; piksellerle dolu bir tuval de hiçbir etiket taşımaz, yani konum, kamera modeli ve zaman damgaları yeni dosyaya yazılmaz. Hiç değiştirmediğiniz bir dosya ise başka bir durumdur — etiketleriyle birlikte, baytı baytına geri verilir. Üstverinin gitmesini ama resmin el değmemiş kalmasını istiyorsanız, kabı hiçbir şeyi yeniden sıkıştırmadan yeniden yazan [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/)'yi kullanın.

### Bunun görsel sıkıştırıcıdan farkı ne?

Bu araç boyutlarla ilgilidir: kaç piksel istediğinizi söylersiniz, o da size onu verir. [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/) ise dosya boyutuyla ilgilidir: kaç kilobayta izniniz olduğunu söylersiniz, o da sığan en yüksek kaliteyi arar ve yalnızca kalite tek başına yetmiyorsa boyutlandırır. Size "1200 piksel genişliğinde" dendiyse doğru yerdesiniz. "500 KB'nin altında" dendiyse diğeri sizi daha yakına götürür.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Dosyaların sayısında ya da boyutunda da bir sınır yok, çünkü bunların bedelini ödeyen bir sunucu yok — iş sizin kendi cihazınızda oluyor. Sitede reklam var, masrafı karşılayan da o; reklamlara görselleriniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: görsellerinizi boyutlandırılmak üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Görsellerinizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Boyutlandırma, bir tuvale yapılan bir `drawImage` ve bir `canvas.toBlob`'dur — tarayıcınızda zaten kurulu olan ölçekleyici ve kodlayıcı.
- **Değiştirilmesi istenmeyen dosya değiştirilmez.** Kırpma yoksa, boyutlandırma yoksa ve biçim değişikliği yoksa seçtiğiniz dosya yeniden kaydedilmez, size baytı baytına geri verilir. Bu yalnızca bir nezaket değildir: bu aracın bir resmi sessizce yeniden kodlayamamasının ya da yalnızca bakmak istediğiniz bir resmin üstverisini sessizce düşürememesinin sebebi budur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine resimleriniz hakkında bir şey verilmiyor. Bir dosyayı okuyan, kırpan, ölçekleyen ya da yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, neyin korunacağına ve sonucun ne kadar büyük çıkacağına karar veren aritmetik için `src/geometry.js` ve kırpma ile boyutlandırmayı birlikte yapan tek `drawImage` çağrısı için `src/codecs.js`.
