# Video Tersleyici — videoyu geriye oynatın

Önce son kare, sesiyle birlikte.

> Bir MP4, MOV veya WebM'i geriye oynatın; sesi de ters çevrilir. Tarayıcınızda çalışır: hiçbir şey yüklenmez, filigran yoktur ve çevrimdışı da çalışır.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/videoyu-ters-oynatma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## videolarınız **asla yüklenmez**. Sunucu yoktur.

Her kare kendi tarayıcınız tarafından, kendi donanımınızda çözülür, ters çevrilir ve yeniden kodlanır. Buradaki hiçbir şey bir şey getiremez ya da gönderemez — bu araçta hiçbir türde ağ özelliği yok — ve olsaydı bile bu sayfanın öbür ucunda bir videonun gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Sesi de ters çevirir
- ✓ Çevrimdışı çalışır

## Bir video nasıl ters çevrilir

1. **Bir video seçin.** Seçiciye bir MP4, MOV, M4V ya da WebM bırakın veya elle seçin. Tarayıcı onu doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Sese karar verin.** «Sesi de ters çevir», parçayı örnek örnek döndürür; konuşmanın sessizlik olarak değil, geriye oynatılan konuşma olarak çıkmasını sağlayan da budur. Sessiz bir klip için kapatın, daha hızlıdır.
3. **Ne kadar kalite harcayacağınızı seçin.** Görüntünün yeniden kodlanması gerekir, çünkü kareler dosyadaki hiçbir şeyin kodlanmadığı bir sırayla çıkar. «Dengeli», orijinalin harcadığına yakın kalır; «En iyi kalite» daha fazlasını harcar.
4. **Ters çevirin ve indirin.** İş kendi donanımınızda olduğu için ne kadar süreceği bir sıraya değil makinenize bağlıdır. Bitmiş video doğrudan tarayıcınızın indirmelerine verilir.

## Uzun sürüm

[Bir video nasıl ters oynatılır](https://abox.tools/tr/rehberler/videoyu-ters-oynatma/): Bir klibi geriye doğru oynatın: ters çevirmenin resme ve sese ne yaptığı, neden yeniden kodlamadan yapılamayacağı, neden kesmekten yavaş olduğu ve önce ne yapılması gerektiği.

## Kutuda ayrıca

- [Time-Lapse Yapıcı](https://abox.tools/tr/time-lapse-video-olusturma/): Bir saatlik görüntü, yirmi saniyede.
- [Video Kare Yakalayıcı](https://abox.tools/tr/videodan-kare-yakalama/): Herhangi bir andan tam kaliteli bir kare.
- [Videodan GIF'e](https://abox.tools/tr/videoyu-gife-donusturme/): Bölümü, boyutu ve kare hızını siz seçin.
- [GIF Yapıcı](https://abox.tools/tr/gif-olusturma/): Bir dizi resmi tek bir animasyona çevirin.

## Sorular

### Videom herhangi bir yere yükleniyor mu?

Hayır. Kendi donanımınızda, kendi tarayıcınız tarafından okunur, çözülür, ters çevrilir ve kodlanır. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Size söylenene güvenmek yerine denetlemeyi tercih ediyorsanız internet bağlantısını kesin ve yine de bir klibi ters çevirin.

### Hangi video biçimlerini ters çevirebilirim?

MP4, M4V ve MOV içlerinde ne olursa olsun doğrudan okunur: H.264, HEVC, AV1 ya da VP9 — yeter ki tarayıcınız o kodlayıcıyı çözebilsin. Tarayıcınızın oynatabildiği başka her şey — en bilineni WebM — bunun yerine tarayıcının kendi oynatıcısı içinde geriye doğru adım adım gezilerek ters çevrilir; bu da işe yarar ama daha yavaştır. Tarayıcının ne okuyabildiği ne de oynatabildiği bir dosya, ki pratikte AVI, WMV, FLV ve çoğu MKV demektir, yarı yolda başarısız olmak yerine bunu söyleyen bir mesajla geri çevrilir. Çıkan şey her zaman bir MP4'tür.

### Ses de ters çevriliyor mu?

Kapatmadığınız sürece evet. Parçanın tamamı çözülür, örnekler öbür sıraya konur ve AAC olarak yeniden kodlanır. Bu ikinci kodlamadan kaçmanın yolu yok: bir ses paketi, kendinden önceki pakete göre kodlanmış birkaç on milisaniyelik sestir; dolayısıyla paketleri tersten yazmak, kısa parçaları yanlış sırada ileriye doğru oynatırdı — ki bu bir ters çevirmeye değil, bir arızaya benzer.

### Ters çevirmek kalite kaybettirir mi?

Görüntü ikinci kez kodlanır ve bu biraz kaliteye mal olur. Burada, kesmede olduğu gibi bundan kaçınmak mümkün değil: ters çevrilmiş bir klip, karelerini orijinal dosyadaki hiçbir şeyin kodlanmadığı bir sırada gösterir; bu yüzden her karenin yeniden yazılması gerekir. Aracın yapmayacağı şey orijinalin harcadığından fazlasını harcamaktır; bunun üzerinde kodlamak dosyayı yalnızca büyütür, daha iyi göstermez.

### Videonun boyutunda veya uzunluğunda bir sınır var mı?

Araçta yerleşik bir sınır yok ve dosya belleğe bir seferde tümüyle okunmuyor — geriye doğru, kare grubu kare grubu geziliyor. Pratik tavanlar, indirmeden önce bellekte kurulan bitmiş video ile sestir; çünkü ters çevirmek ilk örneği yazabilmek için son örneği gerektirdiğinden sesin bütün olarak tutulması gerekir.

### Neden bazı dosyalarda daha yavaş?

Çünkü iki ayrı giriş yolu var. Bir MP4 ya da MOV bu araç tarafından doğrudan okunur ve her seferinde bir kare grubu çözülür ki bu makinenizin gidebildiği kadar hızlıdır. Başka her şey, tarayıcının kendi oynatıcısından klibin bir anı arkasından öbürü istenerek ters çevrilir ve bu aramaların her biri tarayıcıyı kendinden önceki anahtar kareden itibaren çözmeye zorlar. Sayfa, başlamadan önce hangisini kullandığını ve nedenini söyler.

### Bir klibin yalnızca bir bölümünü ters çevirebilir miyim?

Burada değil. Bu araç bütününü ters çevirir: çıkan klip, girenle tam olarak aynı uzunlukta olur, son kare başta. Önce istediğiniz bölümü [Video Kesici](https://abox.tools/tr/video-kesme/) ile kesin — ki o bunu tek bir kareyi bile yeniden kodlamadan yapar — sonra oradan çıkanı ters çevirin.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Sitede reklam var, masrafı karşılayan da o; reklamlara videonuz hakkında hiçbir şey verilmiyor.

## Gizlilik iddiası nasıl doğrulanabilir

- **Videolarınızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** Bu araçta hiçbir türde ağ özelliği yok: yapıştırılacak bir adres, indirilecek bir şey, ilk kullanımda getirilen bir motor yok. Videonuza dokunan her bayt, sayfa yüklenirken bu kaynaktan geldi.
- **Çözme ve kodlama yerelde.** Kareler kendi tarayıcınızdaki WebCodecs'ten geçer ya da klibi zaten size gösterecek olan aynı oynatma motorundan. Bitmiş dosya bu makinenin belleğinde kurulur ve doğrudan bir indirmeye verilir.
- **Ses de burada ters çevriliyor.** Bir parçayı ters çevirmek onu çözmek demektir ve o çözme işi tarayıcının kendi işidir, bu makinede çalışır. Hiçbir şey onu dinlemez, hiçbir şey saklamaz ve hiçbir şey onu bir yere iletemez: burada bir bayt gönderen bir kod yolu yok.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine videonuz hakkında bir şey verilmiyor: ne bir dosya, ne bir kare, ne bir ad, bir boyut ya da bir uzunluk. Okuyan, çözen, ters çeviren ya da kodlayan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de videonuz hakkında bir şey verilir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfadaki her şey çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, hangi karenin ne zaman çıkacağına karar veren hesap için `src/timeline.js` ve dosyayı her seferinde bir kare grubu geriye doğru gezen döngü için `src/reverse.js`. Hiçbiri istek yapabilecek bir şeyi içeri almaz.
