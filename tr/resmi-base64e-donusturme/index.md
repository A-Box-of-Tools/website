# Görselden Data URI'ye — CSS ya da HTML için bir resmi base64 ile kodlayın

Resmin tamamı tek satır metin olarak. Doğrudan CSS ya da HTML içine yapıştırın.

> Bir PNG, JPEG, SVG veya WebP'yi CSS ya da HTML içine yapıştırabileceğiniz bir data URI'ye çevirin. SVG'ler base64 yerine yüzde kodlamasıyla yazılır; böylece hem okunur kalır hem de daha kısadır. Tarayıcınızda çalışır, hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/resmi-base64e-donusturme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## görselleriniz **asla yüklenmez**. Sunucu yoktur.

Kodlama kendi tarayıcınızda, kendi donanımınızda çalışır. Sayfanın zaten elinde olan baytlar üzerinde bir aritmetiktir: kodlayıcı yok, sunucu yok ve dışarıda bırakılacak bir ağ adımı yok. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve olsaydı bile bu sayfanın öbür ucunda bir resmin gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Yeniden kodlama yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Bir görsel data URI'ye nasıl çevrilir

1. **Görsellerinizi seçin.** Seçiciye bırakın ya da elle seçin. Tarayıcı onları doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Sonucun nereye gideceğini söyleyin.** URI'nin kendisi, bir CSS kuralı, bir özel özellik, bir `<img>` etiketi ya da Markdown. Hepsi URI'yi tırnak içine alır; satır içine alınmış bir SVG'nin çalışıp çalışmayacağına sessizce karar veren ayrıntı da budur.
3. **Neye mal olduğunu okuyun.** Her sonuç kaç karaktere dönüştüğünü, bunun dosyadan ne kadar büyük olduğunu ve bu boyutta bir şeyi satır içine almanın iyi bir fikir olup olmadığını söyler. Base64 üçte bir ekler; o üçte birin kazanılan bir isteğe değip değmediği tamamen boyuta bağlıdır, bu yüzden sayfa çizginin hangi tarafında olduğunuzu söyler.
4. **Uyarılara bakın.** Resim EXIF, bir renk profili ya da XMP taşıyorsa, sonucunuzun kaç baytının bunlar olduğuyla birlikte adı verilir. Uzantı gerçek biçimle çelişiyorsa sayfa biçimi kullanır ve size söyler. Tarayıcınız sonucu çizemiyorsa onu da söyler.
5. **Kopyalayın ya da indirin.** Sonuç başına bir düğme, hepsi için birden bir düğme — özel özellikler bir `:root` bloğuna sarılı olarak, bir stil dosyasının başına yapıştırılmaya hazır çıkar.

## Uzun sürüm

[Bir resim CSS'inizin içine ne zaman konur, ne zaman konmaz](https://abox.tools/tr/rehberler/cssye-resim-gomme/): Bir data URI'nin bedeli, base64'ün neden üçte bir eklediği ve gzip'in bunu neden geri vermediği, bir SVG'nin neden asla base64 olmaması gerektiği ve satır içi SVG'leri sessizce bozan tırnak hatası.

## Kutuda ayrıca

- [SVG'den Görsele](https://abox.tools/tr/svg-yi-pnge-donusturme/): Boyutu siz söyleyin. Bir vektörün kaybedecek kendi boyutu yok.
- [Görselden SVG'ye](https://abox.tools/tr/gorseli-svg-ye-donusturme/): Bir şekil, bir dış çizgi. Orada olmaması gerekeni gösterin, yeter.
- [Boy Karşılaştırma](https://abox.tools/tr/boy-karsilastirma/): Boyları yazın, resmi alın. Onu çizmek için hiçbir şey gönderilmez.
- [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/): Boyutu siz söyleyin, gerisini o hesaplasın.

## Sorular

### Görselim herhangi bir yere yükleniyor mu?

Hayır. Dosya, tarayıcının zaten sahip olduğu iki işlevle, kendi donanımınızda, kendi tarayıcınız tarafından okunur ve kodlanır. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir.

### Data URI nedir?

Normalde bir web adresinin gideceği yere bütün bir dosyayı yazma yöntemidir. Tarayıcıya gidip bir şey getirmesini söyleyen `url("logo.png")` yerine, resmin kendisini içeren `url("data:image/png;base64,iVBORw0...")` yazarsınız. Tarayıcı onu olduğu yerde çözer. Pratikteki etkisi bir istek eksilmesidir: resim, stil dosyasından ya da sayfadan sonra değil onlarla birlikte gelir.

### SVG'm neden base64 değil?

Çünkü base64 onun için yanlış kodlamadır. Bir SVG metindir ve bir URL zaten metin taşıyabilir — yalnızca bir avuç karakterin kaçırılması gerekir. Onları yüzde kodlamasıyla yazıp gerisine dokunmamak, aynı dosyanın base64'ünden tipik olarak beşte bir daha kısa ve stil dosyanızda hâlâ okuyabileceğiniz bir URI üretir: öğe adları, renkler ve `viewBox` düzenlemek için yerli yerindedir. Bunda ısrar eden nadir bir araç zinciri için base64'ü zorlayan bir onay kutusu var.

### Base64 görselimi ne kadar büyütüyor?

Yaklaşık üçte bir. Dosyanın üç baytı base64'ün dört karakteri olur; bu da öndeki `data:image/png;base64,`'dan önce %33 demektir. Bu tabandır ve kaçınılmazdır: rastgele baytları yalnızca bir URL'nin izin verdiği karakterlerle yazmanın bedeli budur. Sayfanın karakter sayısını dosya boyutunun yanında göstermesinin, siz bunu stil dosyası yayına alındığında öğrenesiniz diye bırakmamasının sebebi de budur.

### Bir görseli satır içine almak ne zaman gerçekten iyi bir fikir?

Küçük olduğunda ve hemen gerektiğinde. Her sayfanın yüklediği bir stil dosyasındaki 2 KB'lik bir simge açık bir kazançtır: bir gidiş dönüş eksilir ve resim, CSS oradaysa oradadır. Yaklaşık 10 KB'den sonra takas döner. Satır içine alınmış bir resim artık ayrı bir dosya değildir; yani kendi başına önbelleğe alınamaz, başka bir şeyle paralel olarak getirilemez ve çevresindeki dosya her değiştiğinde baştan sona yeniden indirilir — bir stil dosyasındaki 200 KB'lik bir fotoğraf, sitedeki her sayfanın kritik yoluna eklenen 200 KB demektir. Sayfa, her sonucun o çizginin hangi tarafına düştüğünü size söyler.

### Gzip, base64'ün getirdiği fazlalığı geri alır mı?

İnsanların beklediğinden azını. Zaten sıkıştırılmış bir dosyanın — bir PNG, bir JPEG ve bir WebP bunların hepsidir — base64'ü kötü sıkışır; çünkü sıkıştırıcının bulacağı neredeyse hiç fazlalık kalmamıştır; tipik olarak base64'ün eklediği üçte birin onda biri kadarını geri alırsınız, tamamını değil. Yüzde kodlamasıyla yazılmış bir SVG ise tam tersi bir durumdur: hâlâ metindir, yani eskiden ne kadar sıkışıyorsa o kadar sıkışır — bir SVG'yi base64'lememek için bir sebep daha.

### Bu, görselimi herhangi bir şekilde değiştiriyor mu?

Hayır ve bu, buradaki araçların çoğundan bilinçli bir farktır. Hiçbir şey piksele çözülüp yeniden kodlanmaz: diskinizden gelen baytlar, URI'ye giren baytlardır. Bir JPEG, aynı kalitede ve aynı boyutlarda, tam olarak olduğu JPEG kalır. Sonucun bir kopyası değil de aynı dosya olarak tarif edilebilmesinin sebebi budur.

### Yani EXIF ve GPS verim de mi stil dosyasına giriyor?

Evet ve yapıştırmadan önce üzerinde düşünmeye değen kısım da budur. Hiçbir şey yeniden kodlanmadığı için kameranın yazdığı her şey resimle birlikte yolculuk eder: konum, zaman damgası, kameranın seri numarası. Bir telefon fotoğrafında bu, dosyanın 30 KB'si olabilir; bu da sayfanızın kritik yolunda 40 KB base64 ve bir depoya işlenecek bir şeyin içinde bir ev adresi demektir. Sayfa, bir JPEG, PNG ya da WebP içinde ne kadar üstveri olduğunu okur ve söyler. Önce onu çıkarmak için [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/)'yi kullanın.

### Neden dosyamın uzantısından farklı bir tür kullandı?

Çünkü uzantı yanlış olabilir, baytlar olamaz. Aslında JPEG olarak dışa aktarılmış `logo.png` adlı bir dosya, her görsel aracının başa çıkmak zorunda olduğu kadar yaygındır ve yanlış türü bildiren bir data URI düpedüz görüntülenmez — bir yedeği ve okumaya değer bir hata iletisi yoktur. Bu yüzden tür, dosyanın ilk birkaç baytından okunur — buradaki her biçimde ne olduğunu tereddütsüz söyleyen kısım orasıdır — ve ikisi çeliştiğinde sayfa size söyler.

### Ön izleme boş. Ne ters gitti?

Muhtemelen URI'yle ilgili bir şey değil. HEIC ve TIFF, Safari dışında hiçbir tarayıcının çizmeyeceği ama gayet geçerli data URI'ler üretir; yani resim, yapıştırdığınız yerde de eksik olacaktır — önce [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/) ya da [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/) ile PNG, JPEG veya WebP'ye çevirin. Biçim sıradan bir biçimse dosyanın kendisi büyük olasılıkla bozuktur: ön izleme bu sayfanın kurduğu URI'den çizilir, yani boş bir ön izleme resmin çözülmediği anlamına gelir.

### Bir data URI'de boyut sınırı var mı?

CSS'te ya da bir `<img>` etiketinde karşılaşacağınız bir sınır yok; güncel tarayıcılar orada pratikte bir tavan koymuyor. Tarayıcıların sınırladığı şey, bir data URI'yi adres çubuğuna yazmaktır ki çoğu artık bunu, bu kullanımla hiç ilgisi olmayan güvenlik sebepleriyle, önemsiz olmayan her şey için reddediyor. Gerçek sınır yukarıdakidir: teknik olarak bir şey bozulmadan çok önce, içinde bulunduğu sayfa sıradan bir görsel dosyasıyla olacağından daha yavaş hâle gelmiştir.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Dosyaların sayısında ya da boyutunda da bir sınır yok, çünkü bunların bedelini ödeyen bir sunucu yok — iş sizin kendi cihazınızda oluyor. Sitede reklam var, masrafı karşılayan da o; reklamlara görselleriniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: görsellerinizi kodlanmak üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Görsellerinizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Kodlama, `btoa` ve `encodeURIComponent`'tir — tarayıcının en başından beri sahip olduğu iki işlev; ikisi de bayt alır ve hiçbir yere gitmeden metin döndürür.
- **Ön izleme, kanıtın kendisi.** Her sonucun yanındaki resim, sizin dosyanızdan değil bu sayfanın az önce kurduğu data URI'den çizilir. URI doğru olduğu için, sizin makinenizde, hiçbir sunucu karışmadan görüntülenir — ve görüntülenmezse sayfa size bozuk bir şey vermek yerine bunu söyler.
- **Üstveri uyarısı sizin tarafınızda.** Bir data URI dosyayı olduğu gibi kopyalar; yani bir fotoğrafın GPS konumu da onunla birlikte stil dosyanıza gider. Bu sayfa bunun ne kadarının orada olduğunu okur ve size söyler; çünkü alternatifi, siz bunu depoya işlendikten sonra öğrenmenizdir.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine resimleriniz hakkında bir şey verilmiyor. Bir dosyayı okuyan ya da kodlayan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, iki kodlama ve her birinin ardındaki gerekçe için `src/encode.js`, ortam türünün dosyanın adından değil kendisinden nasıl okunduğu için `src/sniff.js` ve yapıştırmak üzere olduğunuz şeyin ne kadarının resim olmadığını söyleyen denetim için `src/metadata.js`.
