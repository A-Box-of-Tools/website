# GIF Ayırıcı — her kare kendi PNG'si olarak

Her kare kendi PNG'si olarak dışarı.

> Hareketli bir GIF'i karelerine ayırın ve her birini PNG olarak kaydedin; ücretsiz ve tamamen tarayıcınızda. Saydamlığı ve zamanlamayı korur. Hiçbir şey yüklenmez ve çevrimdışı da çalışır.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/gifi-karelere-ayirma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## GIF'leriniz **asla yüklenmez**. Sunucu yoktur.

GIF kendi tarayıcınız tarafından okunur, açılır ve çizilir; her PNG de bu makinenin belleğinde kodlanır. Buradaki herhangi bir şey istese bile, bu sayfanın öbür ucunda bir animasyonun gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Dosyalar cihazınızda kalır

## Bir GIF karelere nasıl ayrılır

1. **GIF'i seçin.** Seçiciye bırakın ya da elle seçin. Tarayıcı onu doğrudan diskinizden okur ve sayfa bulduğunu söyler: boyutu, kare sayısı, ne kadar oynadığı ve kaç kez tekrarladığı.
2. **Her PNG'nin ne taşıyacağına karar verin.** **Göründüğü hâliyle kare**, neredeyse herkesin istediğidir: animasyonun o anındaki görüntünün tamamı. **Yalnızca o karenin sakladığı pikseller** ise dosyanın gerçekten taşıdığı yamadır; kendi boyutunda ve kendi yerinde, ki bir GIF böyle küçük kalır ve animasyonun görünüşü bu değildir.
3. **Saydamlığa ne olacağına karar verin.** PNG onu korur ki dürüst varsayılan budur. Kareler saydamlığı yok sayan ve onu siyaha çevirecek bir yere gidiyorsa onun yerine bir renkle doldurun.
4. **İstediğiniz kareleri seçin.** Varsayılan olarak hepsi. "Her ikinci kareyi koru" uzun bir kaydı seyreltir ve ızgaradaki onay kutuları bunu geçersiz kılar — numaralandırma hiç değişmez, yani komşularından ne kadar azını tutarsanız tutun 42. kare yine 42. karedir.
5. **İndirin.** Izgaradan tek tek ya da yüzlerce kaydetme sorusu yerine tek bir ZIP olarak hepsi birden. ZIP, her karenin ne kadar tutulduğunu listeleyen bir `frames.txt` taşıyabilir; bir PNG klasörünün kendi başına söyleyemediği tek şey de budur.

## Uzun sürüm

[Bir GIF karelerine nasıl ayrılır](https://abox.tools/tr/rehberler/gifi-karelere-ayirma/): Hareketli bir GIF'in her karesini PNG olarak alın: bazı kareler neden resmin yalnızca küçük bir yamasıdır, saydamlığa ne olur ve yeniden birleştirebilmek için zamanlamayı nasıl korursunuz.

## Kutuda ayrıca

- [GIF Çözümleyici](https://abox.tools/tr/gif-analiz-etme/): Kareler, gecikmeler, paletler ve her baytın nereye gittiği.
- [Görsellerden Videoya](https://abox.tools/tr/resimleri-videoya-donusturme/): Bir görsel klasörünü videoya çevirin.
- [Video Kesici](https://abox.tools/tr/video-kesme/): Tutmaya değer parçaları oynarken işaretleyin. Onları tek video olarak geri alın.
- [Video Kırpıcı](https://abox.tools/tr/video-kirpma/): Bir klibi asıl önemli olan kısma indirin.

## Sorular

### GIF'im herhangi bir yere yükleniyor mu?

Hayır. Dosya kendi donanımınızda, kendi tarayıcınız tarafından okunur, açılır ve çizilir; her PNG de burada, bellekte kodlanır. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Ağ bağlantısını kesin, yine de GIF ayırır.

### Bir kare neden görüntünün küçük bir parçası gibi duruyor?

Çünkü dosyanın taşıdığı şey bu. Bir GIF, bir ilk görüntü ve ardından gelen yamalardır: sonraki her kare yalnızca değişen dikdörtgeni saklar ve ekrandaki geri kalan her şey, kendinden önceki karelerin orada bıraktığı şeydir. Sabit bir duvarın önünde konuşan bir kafa bu yüzden kare başına bir görüntü değil kare başına bir yüz saklar; biçimin devasa olmamasının bütün sebebi de budur. \
\
Bunu görmenizin sebebi "Yalnızca o karenin sakladığı pikseller"in seçili olması. "Göründüğü hâliyle kare"ye geçin; o zaman her PNG, animasyonun o andaki görüntüsünün tamamı olur.

### Saydamlığı koruyor mu?

Evet. GIF saydamlığı tek bittir — bir piksel ya boyalıdır ya görünmez, arası yoktur — ve PNG bunu tam olarak saklar; dolayısıyla kareler saydam alanları el değmemiş hâlde çıkar. Düz bir arka planı tercih ederseniz "Saydam alanlar"ı bir renkle doldurmaya ayarlayın; o renk PNG'nin içine yazılır ve sonradan geri alınamaz.

### Kare gecikmeleri neden beklediğim sayılar değil?

Bir GIF her gecikmeyi saniyenin yüzde biri cinsinden saklar ve tarayıcılar 1990'lardan beri bunun ikisinin altındaki her şeyi saniyenin onda birine sabitliyor — o zamanın dönen dünya küreleri için yazılmış ve hiç kaldırılmamış bir kural. Yani dosyası 0,01 sn diyen bir kare her yerde 0,10 sn'de oynatılır. Bu araç gecikmeyi gerçekten oynatıldığı hâliyle gösterir ve ikisi farklıysa dosyanın sakladığını yanında söyler.

### Kareleri tekrar bir araya getirebilir miyim?

Evet; bu sitedeki [GIF Yapıcı](https://abox.tools/tr/gif-olusturma/) ile ya da bir görsel klasörü kabul eden başka herhangi bir şeyle. ZIP'in içindeki `frames.txt` tam da bunun için var: bir animasyonu ayırmak zamanlamayı atar, çünkü bir PNG'nin ne kadar tutulduğunu kaydedecek bir yeri yoktur; bu yüzden liste her karenin gecikmesini ve konumunu dışarıya taşır.

### Kareler hangi biçimlerde kaydedilebilir?

PNG ve bilinçli olarak yalnızca PNG. Bir GIF karesi en fazla 256 renk ve bir bit saydamlıktır; PNG bunu tam ve kayıpsız saklar, JPEG ise saydamlığı atar, karenin hiç sahip olmadığı renkler uydurur ve düz çalışmalarda genellikle *daha büyük* bir dosya yapar. JPEG gerekiyorsa PNG'leri sonradan [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/) ile dönüştürün.

### Kaç kare okuyacağına dair bir sınır var mı?

Sabit bir sınır yok. Pratik tavan kendi makinenizin belleği: bir GIF okunurken kare başına piksel başına yaklaşık bir bayta açılır, yani küçük bir dosya çok büyük bir bellek demek olabilir ve bu sayfa sekmenin ölmesine izin vermek yerine okumayı durdurur. Bu olursa bunu söyler ve elde ettiği kareleri geri verir.

### Bozuk bir GIF'i açar mı?

Genellikle. Yarıda kesilmiş indirmeler, eksik bir bitiş işareti ve akışın ortasında duran son bir kare hep yaygındır ve bunları reddeden bir okuyucu, insanların en çok parçalarına ayırmak istediği dosyalar için tam anlamıyla işe yaramaz. Tam olan hangi kareler varsa geri gelir, neyin yanlış olduğunu söyleyen bir notla birlikte. Yalnızca hiç GIF olmayan bir dosya doğrudan reddedilir.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok. Karelerde filigran da yok. Sitede reklam var, masrafı karşılayan da o; reklamlara dosyalarınız hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: animasyonunuzu işlenmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **GIF'inizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok. Burada eskiden `connect-src 'none'` yazıyordu ki bu mutlaktı; reklam eklemek buna mal oldu ve bunu söylemek anlaşmanın bir parçası.
- **GIF okuyucu bu depodaki iki dosya.** Bir tarayıcı GIF'i oynatır ama parçalarını size vermez; bu yüzden biçim burada okunuyor: `src/gif.js` kap ve LZW açıcısı, `src/compose.js` ise kendinden öncekiler altına serildiğinde her karenin nasıl görüneceğine karar veren tasfiye kuralları. Bir dosyayı açmak için hiçbir şey getirilmiyor ve ilk kullanımda indirilen bir motor yok.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine animasyonunuz hakkında bir şey verilmiyor: ne bir dosya, ne bir kare, ne bir ad, bir boyut ya da bir sayı. Bir görseli okuyan, açan, çizen ya da kodlayan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de dosyalarınız hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfanın her parçası çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu: animasyonunuzu parçalarına ayrılmak üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, kareleri açan okuyucu için `src/gif.js` ve onları üst üste bindiren kurallar için `src/compose.js` — ikisinde de ağa erişebilecek tek bir satır yok.
