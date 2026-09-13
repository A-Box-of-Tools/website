# Özet ve sağlama toplamı — MD5, SHA-1, SHA-256, SHA-512

Bir indirmeyi, yayıncının bastığı sayıya karşı, kimseye göndermeden denetleyin.

> Herhangi bir dosyanın MD5, SHA-1, SHA-256, SHA-384 ya da SHA-512 değerini hesaplayın ve indirme sayfasının yayımladığı sağlama toplamıyla karşılaştırın. Dosya tarayıcınızda okunur ve hiçbir boyutta yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/saglama-toplami-hesaplama/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## dosyalarınız **asla yüklenmez**. Sunucu yoktur.

Bir sağlama toplamı, dosyanızın baytları üzerinde yapılan bir hesaptır ve burada, bu sayfada, kendi işlemcinizde yapılır. Dosya diskinizden dört megabaytlık parçalar hâlinde okunur ve her parça sayılır sayılmaz atılır; yani hiçbir şey hiçbir yerde bir araya getirilmez — ne bellekte, ne de elbette bir sunucuda. Buradaki herhangi bir şey istese bile bu sayfanın öbür ucunda bir dosyanın gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Dosyalar cihazınızda kalır

## Bir indirme, sağlama toplamına karşı nasıl denetlenir

1. **Dosyayı seçin.** Seçiciye bırakın ya da elle seçin. Doğrudan diskinizden parçalar hâlinde okunur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez ve sayfanın pes ettiği bir boyut yoktur.
2. **Okumasını bekleyin.** MD5 ve SHA-256 varsayılan olarak, tek bir geçişte hesaplanır. Çubuk, dosyanın ne kadarında olduğunu ve bunun ne hızda gittiğini gösterir — büyük bir disk imajı, kopyalamak kadar sürer, çünkü aynı miktarda okuma yapılır.
3. **Ne olması gerektiğini yapıştırın.** İndirme sayfası size ne verdiyse, hangi şekilde verdiyse: düz onaltılık, bir `sha256sum` çıktısı satırı, bütün bir `SHA256SUMS` dosyası ya da bir betik etiketinden alınmış `integrity` özniteliği. Hangi algoritma olduğu uzunluğundan anlaşılır ve doğru kutu kendini işaretler.
4. **Rengi değil cevabı okuyun.** Sayfa, bunun o sağlama toplamının tarif ettiği dosya olup olmadığını bir cümleyle söyler. Eşleşme, baytların yayıncının ölçtüğü baytlarla aynı olduğu anlamına gelir. Eşleşmeme ise aynı olmadıkları anlamına gelir ve indirme, açılmadan önce yeniden alınmalıdır.
5. **Gerekiyorsa sağlama toplamlarını alın.** Birini kopyalayın, hepsini kopyalayın ya da komut satırı araçlarının yazdığı etiketli biçimde küçük bir metin dosyası olarak kaydedin; böylece algoritma sayıyla birlikte yolculuk eder.

## Uzun sürüm

[Bir indirme, sağlama toplamına karşı nasıl denetlenir](https://abox.tools/tr/rehberler/dosya-saglama-toplamini-dogrulama/): Windows, macOS ve Linux'ta ya da tarayıcınızda bir MD5 veya SHA-256 sağlama toplamı nasıl denetlenir, bir eşleşme gerçekte neyi kanıtlar ve bütün işi anlamsız kılan hata.

## Kutuda ayrıca

- [Şifre ve Parola Cümlesi Üreteci](https://abox.tools/tr/sifre-olusturucu/): Burada, kendi tarayıcınız tarafından üretilir ve hiçbir yere gönderilmez. Hiçbir şey saklanmaz ve geçmiş yoktur.
- [JSON Biçimlendirici](https://abox.tools/tr/json-bicimlendirme/): JSON, XML, HTML, CSS ve YAML; biçimlendirilmiş ya da dönüştürülmüş. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [YAML'den JSON'a Dönüştürücü](https://abox.tools/tr/yaml-json-donusturme/): İki yön de var, ve her birinin neye mal olduğunu söylüyor. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.
- [XML Biçimlendirici](https://abox.tools/tr/xml-bicimlendirme/): Okunmak için açılmış ya da gönderilmek için sıkıştırılmış XML, ve iki yönde de JSON'a çevrilmiş hâli. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.

## Sorular

### Dosyam herhangi bir yere yükleniyor mu?

Hayır. Kendi tarayıcınız tarafından diskinizden okunur ve kendi işlemcinizde, dört megabaytlık parçalar hâlinde özetlenir. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Ağ bağlantısını kesin, yine de çalışır.

### Boyut sınırı var mı?

Hayır. Dosya hiçbir zaman bütün olarak tutulmaz: parçalar hâlinde okunur ve her parça sayılıp bırakılır; yani kırk gigabaytlık bir disk imajı, bir metin dosyasıyla aynı birkaç megabayt belleği kullanır. Maliyeti zamandır ve sayfa ilerledikçe bunun ne kadar olduğunu söyler. \
\
Algoritmaların, daha hızlı olacak olan tarayıcının kendi `crypto.subtle.digest` çağrısına verilmek yerine burada yazılmış olmasının sebebi de budur. O çağrı mesajın tamamını tek bir arabellekte alır ve ona bir dosyayı parçalar hâlinde vermenin yolu yoktur; yani onu kullanmak, denetleyebileceğiniz en büyük dosyayı bu sekmenin ne kadar belleğe izin verildiğinin insafına bırakırdı. Bir telefonda bu birkaç yüz megabayttır ve insanların en çok denetlemek istediği dosya bir disk imajıdır.

### Sağlama toplamı eşleşti. Bu aslında neyi kanıtladı?

Diskinizdeki baytların, o sayıyı yazan kişinin ölçtüğü baytlar olduğunu. Daha fazlasını değil ve sınırları konusunda kesin olmaya değer. \
\
İndirmenin yarıda kesilmediğini, bozuk bir diskten zarar görmediğini ya da yolda başka bir şeyle değiştirilmediğini kanıtlar. Dosyanın güvenli olduğunu **kanıtlamaz**, çünkü bir yayıncı zararlı bir yazılımı da diğer her şey kadar doğru ölçebilir. Ve sağlama toplamı, dosyayla aynı sayfadan, aynı bağlantı üzerinden geldiyse çok az şey kanıtlar: birini değiştirebilen, diğerini de değiştirebilirdi. Bir sağlama toplamı en çok, size farklı bir yoldan ulaştığında değerlidir — imzalı bir `SHA256SUMS` dosyası, bir dağıtımın sürüm duyurusu, ikinci bir yansı ya da onu zaten bilen bir paket yöneticisi.

### Eşleşmedi. Şimdi ne olacak?

Önce onu aynı yerden yeniden indirin. Yarıda kesilmiş ya da devam ettirilmiş bir aktarım, en yaygın sebeptir ve ikinci bir kopya genelde meseleyi çözer. \
\
İkinci kopya da aynı yanlış cevabı veriyorsa doğru satırla karşılaştırdığınızdan emin olun: sürüm sayfaları birkaç dosya listeler ve ARM sürümünün sağlama toplamı x86 sürümüyle asla eşleşmez. Sonra sürüm numarasını denetleyin. Bunların hepsi doğruysa ve yine eşleşmiyorsa dosyayı açmayın. Onu başka bir yansıdan alın ve iki sağlama toplamını birbiriyle karşılaştırın.

### Hangisini kullanmalıyım?

Yayıncı hangisini bastıysa onu. Bu işin bütün amacı onların sayısıyla karşılaştırmaktır ve onlarınkini onlar adına siz seçemezsiniz. \
\
Bir sağlama toplamını denetlemek yerine üretiyorsanız SHA-256 kullanın. MD5 ve SHA-1, önemli olan anlamda kırıktır: aynı özete sahip iki farklı dosya bilerek üretilebilir; MD5'te saatler içinde, SHA-1'de ise makul bir masrafla. Bu, onları kazalara karşı işe yaramaz yapmaz — yarıda kesilmiş bir indirme, orijinaliyle tesadüfen çakışmaz — ama hiçbiri size kimsenin karışmadığını söyleyemez demektir. SHA-384 ve SHA-512 gayet iyidir ve pratikte daha iyi değildir; burada olmalarının sebebi bazı projelerin onları yayımlamasıdır.

### MD5 kırıksa neden burada?

Çünkü hâlâ basılan şey o. Yansılar, donanım yazılımı indirmeleri, üniversite yazılım sayfaları ve pek çok üretici sitesi yirmi yıl önce bir MD5 yayımladı ve o sayfaya bir daha bakmadı; bir tane hesaplamayı reddeden bir araç, ziyaretçilerinin gerçekten geldiği soruyu yanıtlamayı reddediyor olurdu. \
\
Bunun yerine yapabileceği şey, cevabın ne değerde olduğunu söylemektir; onay kutusunun yanındaki notun yaptığı da budur. Eşleşen bir MD5, bozuk bir indirmeyi hâlâ eler. Kasıtlı bir tanesini elemez.

### Karşılaştırma kutusuna hangi biçimleri yapıştırabilirim?

Alışıldık olanların hepsini ve hangisinin hangisi olduğunu kendisi çıkarır. \
\
Aralarında boşluk olsun olmasın düz onaltılık. Bir `md5sum` ya da `sha256sum` çıktısı satırı, arkasında dosya adıyla. Kırk satırlık bütün bir `SHA256SUMS` dosyası; bu durumda dosyanızı adlandıran satır kullanılır. BSD biçimi, `SHA256 (disk.iso) = …`. Önünde bir etiket, örneğin `SHA-256: …`. Ve bir alt kaynak bütünlüğü özniteliği, `sha384-…`; bu onaltılık değil base64'tür ve karşılaştırılmadan önce çözülür. \
\
Hangi algoritma olduğu uzunluğundan gelir: 32 onaltılık karakter bir MD5, 40 bir SHA-1, 64 bir SHA-256, 96 bir SHA-384 ve 128 bir SHA-512'dir. İkisi aynı uzunlukta değildir, yani seçilecek bir şey ve yanlış yapılacak bir şey yoktur.

### sha256sum ya da certutil ile aynı cevabı verir mi?

Evet, bayt bayt. Bunlar, yayımlanmış test vektörleri olan kesin şartnamelerdir ve buradaki her algoritma her yapımda hem o vektörlere hem de işletim sisteminin kendi uygulamasına karşı denetlenir. \
\
Göreceğiniz tek fark sunumdur. Windows'un `certutil -hashfile` komutu büyük harfle basar ve araya boşluk koyar; bu sayfa küçük harfle basar ki neredeyse her yayıncının kullandığı budur. Karşılaştırma ikisini de yok sayar, yani certutil'den kopyalanmış bir sağlama toplamı, buraya yapıştırılmış küçük harfli bir tanesiyle eşleşir.

### İki dosyayı birbirine karşı denetleyebilir miyim?

Evet, tek bir ek adımla: birincisini denetleyin, sağlama toplamını kopyalayın, sonra ikincisini seçin ve o sağlama toplamını kutuya yapıştırın. İki dosya aynıysa sayfa bunu söyler. \
\
Bu, sağlama toplamlarının sessizce en iyi olduğu durum için bilinmeye değer — yedek diskteki kopyanın gerçekten dizüstündekiyle aynı dosya olup olmadığına karar vermek; ikisi de aynı boyutu ve aynı tarihi iddia ederken.

### Dosyamı değiştiriyor mu?

Hayır. Bu araç yalnızca okur. Çıktı dosyası, yeniden kodlama ya da geri yazılan bir şey yoktur — indirebileceğiniz tek şey, sağlama toplamlarını listeleyen küçük bir metin dosyasıdır. Orijinaliniz diskinizde el değmemiş durur; sekmeyi kapatırsanız ne olacağının dürüst cevabı da budur.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok. Dosya boyutunda ve kaç dosya denetlediğinizde bir sınır da yok. Sitede reklam var, masrafı karşılayan da o; reklamlara dosyanız hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: dosyanızı özetlenmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Dosyanızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyanızın toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok. Burada eskiden `connect-src 'none'` yazıyordu ki bu mutlaktı; reklam eklemek buna mal oldu ve bunu söylemek anlaşmanın bir parçası.
- **Dosya hiçbir boyutta bütün olarak tutulmaz.** Dört megabaytlık parçalar hâlinde okunur ve her parça yürüyen duruma katılıp bırakılır. Yani bu sayfanın kullandığı bellek, kırk gigabaytlık bir disk imajı için de bir metin dosyası için de aynıdır ve pes ettiği bir boyut yoktur. Tarayıcının kendi `crypto.subtle.digest` çağrısının kullanılmamasının sebebi de budur: o, dosyanın tamamını bir seferde bellekte ister ki bu araç tam da bu tavana sahip olmamak için var.
- **Beş algoritma, bu depoda beş dosya.** `src/md5.js`, `src/sha1.js`, `src/sha256.js` ve `src/sha512.js`, yayımlanmış şartnamelerin yazıya dökülmüş hâlidir; her biri yaklaşık altmış satır ve sabit tabloları hesaplanmak yerine tek tek yazılmış, böylece cevapla ilgili hiçbir şey tarayıcınıza bağlı olamaz. Her biri, yayımlanmadan önce resmî test vektörlerine ve işletim sisteminin kendi uygulamasına karşı denetlenir.
- **Yapıştırdığınız sağlama toplamı da hiçbir yere gönderilmez.** Burada, sayfada, burada hesaplanan özetle karşılaştırılır. Karşılaştırmayla ilgili hiçbir şey — ne değer, ne eşleşip eşleşmediği, ne de dosyanın adı — kimseye okunmaz. Bu kulağa geldiğinden daha önemli: bir sağlama toplamı artı bir dosya adı, onu toplayana hangi yazılımın hangi sürümünü az önce indirdiğinizi tam olarak söyler.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine dosyanız hakkında bir şey verilmiyor: ne dosya, ne adı, ne boyutu, ne de özetlerden herhangi biri. Bir baytı okuyan ya da özetleyen her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de dosyalarınız hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfanın her parçası çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu: dosyanızı özetlenmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, dört sıkıştırma işlevi için `src/md5.js`, `src/sha1.js`, `src/sha256.js` ve `src/sha512.js`, paylaştıkları dolgu için `src/blocks.js` ve dosyanızı parçalar hâlinde okuyan döngü için `src/hash.js` — hiçbirinde ağa erişebilecek tek bir satır yok.
