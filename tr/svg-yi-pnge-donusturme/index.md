# SVG'den Görsele — bir vektörü istediğiniz boyutta PNG, JPEG ya da WebP'ye çevirin

Boyutu siz söyleyin. Bir vektörün kaybedecek kendi boyutu yok.

> Bir SVG'yi tarayıcınızda istediğiniz boyutta PNG, JPEG ya da WebP'ye dönüştürün. Genişliği, bir çarpanı ya da bir kutuyu söyleyin; @2x ve @3x kopyalarını da alın. Saydamlık korunur, hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/svg-yi-pnge-donusturme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## SVG dosyalarınız **asla yüklenmez**. Sunucu yoktur.

Çizim, onu az önce ekranınıza koyan aynı motor tarafından piksele çevrilir. Dosyanız diskinizden okunur, kök etiketi `src/svg.js` içindeki, okuyabileceğiniz yüz satır tarafından istediğiniz boyuta göre yeniden yazılır ve tarayıcınızın zaten beraberinde getirdiği bir tuvale çizilir. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve olsaydı bile bu sayfanın öbür ucunda bir logonun gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Bir SVG, yüklenmeden nasıl PNG'ye dönüştürülür

1. **SVG'yi seçin.** Seçiciye bir tane bırakın ya da bir klasör dolusunu seçip hepsini tek seferde dönüştürün. Tarayıcı dosyayı doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez. Her satır, dosyanın kendini hangi boyutta sandığını söyler — ve o boyut `viewBox`'ından geldiyse ya da dosya hiçbir şey bildirmediği için varsayıldıysa bunu farklı söyler.
2. **Ne kadar büyük olacağını söyleyin.** Dosyanın kendi boyutunun bir çarpanı en hızlı cevaptır ve bir yığın için doğru olandır: her çizim kendi başlangıç noktasından ölçeklenir, böylece bir simge seti orantısını korur. Bunun dışında bir genişlik, bir yükseklik, en uzun kenar ya da iki kenarı da verilmiş bir kutu belirtin. Burada büyük bir sayının, bir fotoğraftaki gibi bir bedeli yoktur — çizim o boyutta yeniden çizilir, o boyuta esnetilmez.
3. **Gerekirse yüksek yoğunluklu kopyaları ekleyin.** Bir telefon ve bir Retina dizüstü, her CSS pikseli için iki ya da üç cihaz pikseli çizer; yani 200 piksellik bir logonun arkasında 400 ya da 600 piksellik bir dosya olmalıdır. `@2x` ve `@3x` isteyin; Xcode'un, Android araçlarının ve CSS `image-set()`'in beklediği adlarla çıksınlar ve her biri ayrı ayrı yuvarlanmak yerine ilkinin tam iki ya da üç katı olsun.
4. **Biçimi seçin ve saydamlığa karar verin.** Bir sebebiniz yoksa PNG: kayıpsızdır, saydamlığı korur ve düz renk onda iyi sıkışır. JPEG'in hiç saydamlığı yoktur; bu yüzden siz seçseniz de seçmeseniz de bir arka plan rengi boyanır — o olmadan her saydam piksel siyah çıkar. WebP ikisini de yapar ve daha küçük bir dosya üretir; bedeli, onu okuyamayacak kadar eski yazılımlardır.
5. **İndirmeden önce ön izlemeye bakın.** Dosyayı yazan aynı kod tarafından, sizin dosyanızdan, sizin makinenizde çizilir. Bir çizim piksele dönüştüğünde iki şey değişir ve ikisi de burada görünür: yarım piksel genişliğindeki bir saç teli çizgi grileşir ve varsa metin, webden getirilmiş bir yazı tipiyle değil bu bilgisayarda bulunan bir yazı tipiyle çizilir.
6. **Dosyaları alın.** Dosya başına bir indirme ya da yığının tamamı tek bir zip olarak. Adlar geldikleri SVG'yi izler, kopyalarda `@2x` ve `@3x` eklenir ve aynı adı alacak iki dosya, biri sessizce diğerinin yerine geçmek yerine numaralandırılır.

## Uzun sürüm

[Bir SVG doğru boyutta PNG'ye nasıl dönüştürülür](https://abox.tools/tr/rehberler/svg-yi-pnge-donusturme/): Bir vektörün kendine ait bir piksel boyutu yoktur; yani sayıyı siz seçersiniz. O sayının bir ekran, bir uygulama simgesi ve bir yazıcı için nereden geldiği ve bir çizim piksele dönüştüğünde nelerin değiştiği.

## Kutuda ayrıca

- [Görselden SVG'ye](https://abox.tools/tr/gorseli-svg-ye-donusturme/): Bir şekil, bir dış çizgi. Orada olmaması gerekeni gösterin, yeter.
- [Boy Karşılaştırma](https://abox.tools/tr/boy-karsilastirma/): Boyları yazın, resmi alın. Onu çizmek için hiçbir şey gönderilmez.
- [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/): Boyutu siz söyleyin, gerisini o hesaplasın.
- [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/): Boyutu söyleyin. Kutuyu çizin. Biçimi seçin.

## Sorular

### SVG'im herhangi bir yere yükleniyor mu?

Hayır. Dosya kendi donanımınızda, kendi tarayıcınız tarafından okunur, gördüğünüz diğer her resmi çizen aynı motor tarafından bir tuvale çizilir ve bir indirme olarak geri verilir. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir.

### Bir SVG'yi hangi boyutta piksele çevirmeliyim?

Onu okuyacak şey ne istiyorsa onu; görüleceği ekranın cihaz piksel oranıyla çarpılmış hâlde. 200 CSS pikseli kaplayan bir logonun bir Retina dizüstü için 400, güncel bir telefon için 600 piksele ihtiyacı vardır; buradaki `@2x` ve `@3x` kopyaları da budur. Bir uygulama simgesi ya da bir mağaza görseli için mağaza tam bir sayı söyler ve o sayı odur. Size bir şey söylenmediğinde en uzun kenarda 1024 kullanışlı bir varsayılandır: neredeyse her kullanım için yeterince büyük ve e-postayla gönderilecek kadar küçük.

### Büyütmek kalite kaybettirir mi?

Hayır ve bu cevabın dürüstçe hayır olduğu tek yer burasıdır. Bir vektör piksel değil talimattır; yani tarayıcı eğrileri, istenen boyutta yeniden çizer. 24 piksellik bir simgeden çıkan 4000 piksel, 24'ün olduğu kadar keskindir. Yapamayacağınız şey ters yöne gitmektir: bir kez PNG olduğunda o da diğer her şey gibi pikseldir; bu yüzden sonucu sonradan boyutlandırmak yerine ihtiyacınız olan boyutta piksele çevirin.

### SVG'imin genişliği ya da yüksekliği yok. Hangi boyutu alırım?

Varsa `viewBox`'ı — genişliği ve yüksekliği piksel değil kullanıcı birimidir, ama dosyadaki tek sayılar onlardır ve bir tarayıcı onları çizimin doğal boyutu olarak kabul eder. viewBox da yoksa sayfa, satırın yanında *varsayılan* der ve bir `<img>`'in onu çizeceği boyut olan ⁦300 × 150⁩'yi kullanır. Her iki durumda da istediğiniz boyutu söyleyebilirsiniz ve dosya o boyutta çizilir.

### PNG'de metin neden farklı görünüyor?

Çünkü yazı tipi SVG'nin içinde değildir. Metin çizen bir SVG bir yazı tipini adlandırır ve onu bulmayı makineye bırakır; bir `@import` ile Google Fonts'tan yazı tipi çeken bir dosya ise burada hiçbir şey alamaz: bir `<img>` üzerinden çizilen bir SVG'nin hiçbir şey getirmesine izin verilmez ve bu, onun dosyanızla eve haber vermesini engelleyen kuralın aynısıdır. Çözüm, her tasarımcının zaten bildiği şeydir — dışa aktarmadan önce metni çizim programında yollara dönüştürün. O zaman metin geometridir ve her yerde aynı görünür.

### Aynı anda birkaç dosyayı dönüştürebilir mi?

Evet. Listedeki her SVG aynı ayarlarla çizilir ve yığın tek bir zip olarak iner. Bir çarpan — «dosyanın istediği boyutun 4×'i» — genellikle bir yığın için doğru ayardır; çünkü her çizim, hepsi aynı piksel sayısına zorlanmak yerine kendi boyutundan ölçeklenir. O dosyayı ön izlemeye koymak için herhangi bir satıra tıklayın.

### Bir boyut sınırı var mı?

Bizim değil tarayıcının sınırı. Bir tuval, bir kenarda 16.384 pikselin biraz ötesinde pes eder ve iPhone ya da iPad'deki Safari yaklaşık 16,7 megapiksel alanda durur — ⁦4096 × 4096⁩. Bunun üstünde sayfa, size boş bir görüntü vermek yerine uyarır; çünkü bir tarayıcı tükendiğinde yaptığı şey budur: `toBlob` kendini açıklayan bir hata bile vermeden hiçbir şey döndürür. 100 megapikselin ötesinde araç reddeder, çünkü bu, tek bir bayt kodlanmadan önce 400 MB tuval demektir.

### Saydamlığa ne oluyor?

PNG'de ve WebP'de korunur. JPEG'in hiç alfa kanalı yoktur; bu yüzden siz isteseniz de istemeseniz de resmin tamamının arkasına bir renk boyanır — o olmadan saydam olan her şey siyah çıkardı ki bu, JPEG'e değil bir hataya benzer. PNG ile bir arka plan rengi seçmek de gayet olağan bir istektir: çizimi bir delik bırakmak yerine o renge düzleştirir.

### İçinde betik ya da dış görsel olan bir SVG'yi okuyabilir mi?

Bir tanesini okuyabilir ve tam olarak bir tarayıcının çizmeye razı olduğu parçaları çizer. Bir `<img>` üzerinden yüklenen bir SVG *güvenli durağan kip*tedir: betikler çalışmaz, dış başvurular getirilmez ve animasyon oynamaz — aldığınız şey ilk karedir. Yani içinde uzak bir `<image>` olan bir dosya, o parça eksik çıkar. Bu, tarayıcının sizin adınıza reddetmesidir ve bu sayfanın hiç görmediği bir dosyayı güvenle açabilmesinin sebebidir.

### Bununla Görsel Boyutlandırıcı arasındaki fark ne?

Kaynağın ne olduğu. Görsel Boyutlandırıcı piksellerden başlar — bir JPEG, bir PNG — yani onu büyütmek, hiç orada olmamış bir ayrıntıyı uydurmak zorundadır. Bu araç ise bir çizimden başlar; yani uydurulacak bir şey ve endişelenmeye değer bir üst sınır yoktur. Elinizdeki bir SVG ise keskin bir sonuç veren budur; elinizdeki bir fotoğrafsa öbürüdür.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Dosyaların sayısında ya da boyutunda da bir sınır yok, çünkü bunların bedelini ödeyen bir sunucu yok — iş sizin kendi cihazınızda oluyor. Sitede reklam var, masrafı karşılayan da o; reklamlara dosyalarınız hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: çiziminizi çizilmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Çiziminizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Piksele çeviricinin tamamı, kendi dosyanızın bir yığınını tutan bir `<img>`, bir tuvale tek bir `drawImage` ve tek bir `canvas.toBlob`.
- **Bir SVG bir belgedir ve bu, onun eyleme geçemediği kiptir.** Bir SVG bir `<script>`, uzak bir `<image href="https://…">`, bir stil sayfası ve bir web yazı tipi taşıyabilir. Bir `<img>` üzerinden çizildiğinde ise şartnamenin *güvenli durağan kip* dediği durumdadır: betik çalışmaz ve o adreslerin hiçbiri getirilmez. Bu, bizim bir sözümüz değil tarayıcının bir garantisidir ve bu sayfanın, hiç görmediği bir dosyayı, o dosya eve haber veremeyecek şekilde açabilmesinin sebebi de budur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine çiziminiz hakkında bir şey verilmiyor. Bir dosyayı okuyan, boyutlandıran ya da çizen her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, bir dosyanın kendi boyutunun nasıl okunduğu ve kök etiketinin nasıl yeniden yazıldığı için `src/svg.js` ve piksele çevirme işini yapan sekiz satır için `src/render.js` — bir <img>, bir `drawImage` ve bir `toBlob`; aralarında başka hiçbir şey yok.
