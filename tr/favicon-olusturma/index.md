# Görselden ICO'ya — favicon, Windows ve macOS simge yapıcı

Bir resim girer. Bir tarayıcının, Windows'un ya da bir Mac'in istediği her boyut çıkar.

> Bir PNG, JPEG veya SVG'yi tarayıcınızda gerçek, çok boyutlu bir .ico ya da bir macOS .icns dosyasına dönüştürün. Favicon, Windows uygulama simgesi, Mac uygulama simgesi ve bir sitenin ihtiyaç duyduğu Apple ile Android dosyaları. Hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/favicon-olusturma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## görselleriniz **asla yüklenmez**. Sunucu yoktur.

Ölçekleme de simge dosyalarının kendisi de kendi tarayıcınızda üretilir. Resim, tarayıcınızın zaten beraberinde getirdiği tuval tarafından çizilir ve her kap — Windows `.ico`'su, macOS `.icns`'i — o piksellerden, `src/ico.js` ve `src/icns.js` içindeki, okuyabileceğiniz birkaç yüz satırla kurulur. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve olsaydı bile bu sayfanın öbür ucunda bir logonun gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Hiçbir şey yüklemeden nasıl .ico dosyası yapılır

1. **Resmi seçin.** Seçiciye bir PNG, JPEG, WebP ya da SVG bırakın veya birkaç tane seçip hepsini tek seferde dönüştürün. Kare olanı en kolayıdır ve 256 pikselden yukarısı her boyut için yeterli ayrıntı taşır. Tarayıcı onu doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **İhtiyacınız olan dosyaları seçin.** Windows ve bir tarayıcı `.ico` okur; bir Mac `.icns` okur ve diğerine hiç bakmaz. Birini işaretleyin ya da yaptığınız şey ikisinde de yayımlanacaksa ikisini birden. Bir web sitesi ayrıca Apple, Android ve kutucuk görsellerini de ister ve üçüncü kutu odur.
3. **Simgenin ne için olduğunu söyleyin.** Bir web sitesi faviconu 16, 32 ve 48 pikseldir; bir Windows uygulaması 256'yı da ister; yüksek yoğunluklu bir dizüstünde düzgün görünmesi gereken bir uygulama, Windows'un %125 ve %150 ölçeklemede istediği ara boyutları ister. İşe uyanı seçin ya da boyutları kendiniz işaretleyin. Listedeki her boyut, onu neyin istediğini söyler. `.icns`'te böyle bir seçim yoktur: Apple tam olarak on yuva belirler ve onu da girer.
4. **Şekli ve arka planı halledin.** Bir simge karedir ve çoğu logo değildir. Doldurun; resmin tamamı, üstünde ve altında boşlukla korunur. Kırpın; ortası alınır. Esnetin; ezilir. Arkasına oturacak bir renk seçmediğiniz sürece saydamlık saydamlık olarak korunur.
5. **İndirmeden önce 16 piksellik olana bakın.** Simgenin en sık görüleceği boyut odur ve ince çizgilerle küçük harflerin kaybolduğu yer de orasıdır. Ön izlemedeki her kare, sizin dosyanızdan gerçek boyutunda çizilir. En küçüğü bir lekeyse çözüm başka bir ayar değil, daha basit bir çizimdir.
6. **Dosyaları alın.** İçinde her boyutu olan tek bir .ico; istediğiniz buysa `favicon.ico` adıyla, çünkü tarayıcıların aradığı adres odur. İşaretlediyseniz yanında bir .icns; bir Mac uygulama paketine girmeye hazır. Web sitesi setini de işaretleyin; Apple, Android ve Windows kutucuk görsellerini, bildirimi ve sayfanıza yapıştıracağınız HTML bloğunu da alın. Tek dosyadan fazlası tek bir zip olarak iner.

## Uzun sürüm

[On altı pikselde hâlâ okunan bir favicon nasıl yapılır](https://abox.tools/tr/rehberler/favicon-olusturma/): Bir favicon.ico'nun gerçekte hangi boyutlara ihtiyacı olduğu, iPhone'ların, Android'in ve bir Mac'in hangi ek dosyaları istediği ve bir afişte işe yarayan bir logonun on altı pikselde neden kaybolduğu.

## Kutuda ayrıca

- [Görselden Data URI'ye](https://abox.tools/tr/resmi-base64e-donusturme/): Resmin tamamı tek satır metin olarak. Doğrudan CSS ya da HTML içine yapıştırın.
- [SVG'den Görsele](https://abox.tools/tr/svg-yi-pnge-donusturme/): Boyutu siz söyleyin. Bir vektörün kaybedecek kendi boyutu yok.
- [Görselden SVG'ye](https://abox.tools/tr/gorseli-svg-ye-donusturme/): Bir şekil, bir dış çizgi. Orada olmaması gerekeni gösterin, yeter.
- [Boy Karşılaştırma](https://abox.tools/tr/boy-karsilastirma/): Boyları yazın, resmi alın. Onu çizmek için hiçbir şey gönderilmez.

## Sorular

### Görselim herhangi bir yere yükleniyor mu?

Hayır. Resim kendi donanımınızda, kendi tarayıcınız tarafından çözülür ve ölçeklenir; .ico da o piksellerden, bu sayfadan sunulan kodla kurulur. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir.

### Bir favicon.ico hangi boyutları içermeli?

16, 32 ve 48. Bu bir tercih değildir: 16, bir tarayıcının bir sekmede çizdiğidir; 32, Windows'un bir masaüstü kısayolu için kullandığı ve birkaç tarayıcının bir yer imi için kullandığıdır; 48 ise Google'ın bir site simgesini okuduğu boyuttur. Daha büyüğü .ico'nun içinde değil yanında bir PNG'de olmalıdır — buradaki web sitesi setinin ürettiği de budur.

### Bir Windows uygulama simgesi hangi boyutlara ihtiyaç duyar?

16, 32, 48 ve 256; Visual Studio'nun kendi varsayılan app.ico'sunun tuttuğu da budur. 16 başlık çubuğu ve küçük Explorer görünümü, 32 masaüstü ve görev çubuğu, 48 Explorer'ın orta simgeleri ve 256 başlat menüsü ile çok büyük görünümdür. Yüksek yoğunluklu bir ekranda Windows ayrıca 20, 24, 40, 64 ve 96'yı da ister ve yoklarsa elindeki en yakın boyuttan yeniden örnekler — "her ölçek" hazır ayarı onları da koyar.

### Dosya neden başladığım resimden büyük?

Çünkü bir .ico tek bir resim değil birkaç resimdir ve küçük olanlar, her şey okuyabilsin diye sıkıştırılmadan saklanır. 32x32'lik bir girdi içinde ne olursa olsun tam 4.264 bayttır ve sıkıştırılmamış bir 256x256 girdisi 264 KB'dir — 64'ün üstündeki boyutların varsayılan olarak PNG saklanmasının sebebi de budur. "Her boyut için PNG" seçmek var olan en küçük dosyayı yapar; her boyut için sıkıştırılmamışı seçmek ise en uyumlusunu.

### PNG ve sıkıştırılmamış girdiler arasındaki fark ne?

Yalnızca piksellerin .ico içinde nasıl saklandığı. Sıkıştırılmamış bir girdi, özgün Windows düzenidir — bir bit eşlem başlığı, baş aşağı pikseller ve bir bitlik bir saydamlık maskesi — ve şimdiye kadar çıkmış her Windows sürümü onu okuyabilir. Bir PNG girdisi ise simgenin içine sıkıştırılmış bütün bir PNG dosyasıdır; büyük boyutlarda üç ila on kat daha küçüktür ama yalnızca Windows Vista'dan itibaren anlaşılır. Varsayılan, her birini kazandığı yerde kullanır: 64 piksele kadar sıkıştırılmamış, üstünde PNG.

### 256 pikselden büyük bir simge yapabilir mi?

Hayır ve hiçbir şey yapamaz. Biçim her kenarı tek bir baytta saklar ve 0'ın bir karşılığı vardır — 256 demektir. Tavan budur; yani içinde 512 piksellik bir görüntü olan bir .ico daha büyük bir simge değil bozuk bir simgedir. 512 gerekiyorsa bir PNG gerekir ki web sitesi setinin Android ve bir web uygulamasının açılış ekranı için içerdiği de odur.

### Saydamlığı koruyor mu?

Evet, her iki girdi türünde de; ayrıca alfa kanalının yanına eski bir bitlik maskeyi de yazar, böylece alfayı okuyamayacak kadar eski yazılımlar siyah bir kutu çizmek yerine simgeyi yine de kesip çıkarır. Bilinçli olarak opak yapılan tek dosya, web sitesi setindeki Apple dokunma simgesidir: iOS onu kendi kutucuğuna yerleştirir ve saydamlığı siyaha çevirir; bu yüzden varsayılan olarak beyaz olan arka plan renginize düzleştirilir.

### Logom geniş, kelime biçiminde. Ona ne olur?

Bir şey olmak zorunda, çünkü bir simge karedir. Doldurmak her şeyi korur ve küçültür — 16 piksellik bir kareye doldurulmuş bir kelime logosu yaklaşık üç piksel yüksekliğinde ve okunmazdır. Ortaya kırpmak genellikle daha iyi sonuç verir: neredeyse her markanın faviconu için yaptığı gibi, semboli kompozisyondan çıkarıp onu kullanın. Ön izleme, siz bir şey indirmeden önce hangisinin hayatta kaldığını gösterir.

### Web sitesi setinde neler var ve hepsine ihtiyacım var mı?

Yedi PNG, bir web uygulaması bildirimi, bir browserconfig.xml ve yapıştırılacak bir HTML bloğu. Onlara ihtiyacınız var, çünkü bir .ico tarayıcıları ve Windows'u kapsar, başka hiçbir şeyi kapsamaz: bir iPhone ana ekranı kendi adıyla 180 piksellik bir PNG okur, Android ve her kurulum istemi bildirimi okur ve başlat menüsüne sabitlenmiş bir kutucuk XML'i okur. Bunların hiçbiri bir .ico'nun içine bakmaz. Her şey burada, sizin makinenizde üretilir ve zip'in içinde her dosyanın ne işe yaradığını söyleyen bir not vardır.

### Bir macOS simgesi de yapabilir mi?

Evet — *macOS simgesi*'ni işaretleyin; `.ico`'nun yanında ya da onun yerine bir `.icns` alın. Aynı fikrin başka bir kabıdır ve iki sistem de diğerininkini okumaz: Windows .ico ister, bir Mac uygulama paketi ise .icns ister. Orada boyutlar bir seçim değildir, çünkü Apple tam olarak on yuva yayımlar — 16, 32, 64, 128, 256, 512 ve 1024 piksel; bunlardan üçü, bir altındaki boyutun Retina sürümü olarak iki kez görünür. Onu da girer; yedi çizimden çıkarılırlar ve bir .icns'in daha büyük dosya olmasının sebebi de budur.

### .icns dosyasını nasıl kullanırım?

Bir uygulama için, pakette `YourApp.app/Contents/Resources/` içine konur ve `Info.plist` içinde `CFBundleIconFile` altında adlandırılır; her Mac paketleme aracının bunun için bir alanı vardır. Başka her şey için dosyayı Finder'da seçin, Command-C'ye basın, sonra değiştirmek istediğiniz klasör ya da disk imajında Get Info açın, sol üstteki küçük simgeye tıklayın ve Command-V'ye basın.

### .icns, iconutil'in ürettiğiyle aynı mı?

Aynı dört harfli türlerle aynı on yuva ve her birinde PNG; bir `.iconset` klasöründen `iconutil`'in ürettiği de budur. Bilinçli tek fark: Apple'ın aracı ayrıca, ardından gelen türlerin ve uzunlukların bir dizini olan bir `TOC` öğesi yazar. Bu, biçimin parçası değil bir iyileştirmedir — onsuz bir okuyucu öğeleri baştan sona gezer ve aynı cevaba varır — ve yanlış bir dizin, dizinsizlikten kötüdür; bu yüzden dışarıda bırakılır.

### Aynı anda birkaç resmi dönüştürebilir miyim?

Evet. Listedeki her resim aynı ayarlarla kendi .ico'suna dönüşür ve yığın, resim başına bir klasör içeren tek bir zip olarak iner — yoksa ikisinin de adı favicon.ico olur ve biri diğerinin üzerine yazardı. İşaretlediğiniz her çıktı, her resim için üretilir. O resmi ön izlemeye koymak için herhangi bir satıra tıklayın.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Dosyaların sayısında ya da boyutunda da bir sınır yok, çünkü bunların bedelini ödeyen bir sunucu yok — iş sizin kendi cihazınızda oluyor. Sitede reklam var, masrafı karşılayan da o; reklamlara görselleriniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: logonuzu dönüştürülmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Logonuzun gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Ölçekleme, bir tuvale yapılan bir `drawImage`'dir; her simge de bu sayfada, o piksellerin önüne `src/ico.js` ya da `src/icns.js` tarafından yazılmış bir başlıktır.
- **Dosya kendi baytlarından tarif ediliyor.** Bitmiş bir simgenin yanında gösterilen boyut listesi, istediğiniz boyutların listesi değildir. Az önce yazılan dosyadan `readIcoDirectory` ya da `readIcnsElements` tarafından geri okunur; yani bir yazıcı ayarlarla çelişseydi sayfa bunu söylerdi, siz Windows hiçbir şey çizmediğinde ve macOS boş bir kâğıt çizdiğinde öğrenmezdiniz.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine resminiz hakkında bir şey verilmiyor. Bir dosyayı okuyan, ölçekleyen ya da yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, iki simge biçimi için `src/ico.js` ve `src/icns.js` — birinde dizin, girdiler ve maske; diğerinde Apple'ın adlandırılmış on yuvası — ve sayfadaki her boyutun nereden geldiği için `src/sizes.js`.
