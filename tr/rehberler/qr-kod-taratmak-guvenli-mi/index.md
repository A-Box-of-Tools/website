# QR kod taratmak güvenli mi?

Taramanın kendisi güvenli. QR kod bir metin parçasıdır ve kamerayı ona doğrultmak o metni okumaktan başka hiçbir şey yapmaz. Ters gidebilecek her şey bir dokunuş sonra, bir şey okunanı açtığında olur — ve o dokunuşu yapmamak sizin elinizde.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Taramak güvenlidir. QR kod, karecikler halinde çizilmiş kısa bir metin parçasıdır ve kamerayı ona doğrultmak tam olarak tek bir şey yapar: o metni geri okur. Bu okuma hiçbir şey kuramaz, hiçbir yeri ziyaret edemez ve telefonunuzda hiçbir şeye dokunamaz — yazılı bir adrese bakmanın sizi oraya götürmemesiyle aynı sebepten.

Tehlike bir adım sonra, bir şey okunanı *açtığında* başlar — ve her QR dolandırıcılığının bütün numarası, o adımı siz nereye gittiğinizi görmeden önce gerçekleştirmektir. Kodun içindeki metin, kimsenin gözle okuyamadığı bir adrestir ve çoğu telefon ona tek bir hevesli dokunuşla cevap verir. Okumayı ve açmayı birbirinden ayrı tutun; dolandırıcılığın elinde çalışacak hiçbir şey kalmaz.

## QR kod gerçekte nedir

Kareciklerin altında bir karakter dizisinden başka bir şey yoktur: en fazla birkaç bin karakter, çoğunlukla çok daha az. Bir web adresi, bir Wi-Fi ağının adı ve parolası, bir kartvizit, bir satır metin. Biçim, 1994'te bir Toyota fabrikasında araba parçalarını izlemek için tasarlandı ve hiçbir türde talimat içermez. Bir QR kod, bir yol tabelasının içeremeyeceği gibi “virüs içeremez”.

İçerebildiği şey, telefonunuzdan bir şey *isteyen* metindir: bu adresi aç, bu ağa katıl, bu kişiyi kaydet. Bunların her biri bir ricadır, emir değil. Kod önerir; onu tarayan karar verir. Size metni gösterip bekleyen bir tarayıcı tamamen güvenlidir. Metin üzerinde kendi başına harekete geçen bir tarayıcı ise kararı, kodu basan kişiye devretmiştir — güvenli bir taramayla tehlikeli bir tarama arasındaki bütün fark budur.

Dürüstlük adına bir dipnot: kodu çözen program, girdi işleyen her program gibi hatalı olabilir ve yıllar içinde tarayıcılarda böyle hatalar görüldü. Ama o risk tarayıcıya aittir, koda değil, ve dolandırıcılıkların dayandığı şey o değildir. Dayandıkları şey dokunuştur.

## Etiket numarası

Kendine bir ad kazandıracak kadar yaygınlaşan dolandırıcılık — quishing — utandıracak kadar basittir: kendi kodunu bas, gerçeğinin üstüne yapıştır, bekle. Parkomatta; sahtesi, belediyeninkine benzeyen bir ödeme sayfasına götürür. Restoran masasında, menünün üstünde. Kapıdan atılan kargo kağıdında, “sizi evde bulamadık” sözlerinin yanında.

Neyin işe yaradığına dikkat edin. Teknik bir ustalık değil — ortada ustalık yok. QR kodun, bir insanın takip etmeden önce okuyamadığı tek adres türü olması. Harflerle yazılmış çarpık bir web adresi, bakan herkese kendini ele verir; aynı adres karecikler halinde çizildiğinde dürüst olanından farksız görünür. Kodun nereye gittiğini görebildiğiniz anda çoktan oradasınızdır: beklediğiniz sayfaya benzesin diye kurulmuş, kart numaranızı soran bir sayfada.

Savunma, taramayı bırakmak değildir. Taramayla ziyaret *arasında* adrese bakmaktır; bu yaklaşık iki saniye sürer ve numarayı tamamen bozar.

## Bir adresin yalan söylediği üç yol

İki saniyelik bakış yeter, ama yalnızca neye bakacağınızı bilirseniz. Çarpık bir adresin büründüğü, dürüst görünüşlü üç kılık vardır ve üçünü de görünce tanımaya değer.

### 1. @ işaretinden önceki ad

Bir web adresi, `@` işaretinden önce yazılmış bir kullanıcı adı taşıyabilir: `@` işaretine kadar olan her şey süstür, gerçek hedef ondan sonra başlar. `bankaniz.com.tr@evil.example` bankanıza gitmez. `evil.example` adresine gider ve “bankaniz.com.tr” ifadesini anlamsız bir kullanıcı adı olarak yanında taşır. Göz bir adresin başını okur; tarayıcı sonunu.

### 2. Göründüğü harf olmayan harfler

Alfabeler örtüşür. Kiril `а` harfi, Latin `a` harfiyle tıpatıp aynı çizilir ve onunla yazılmış bir adres, ekranda özdeş görünen bambaşka bir adrestir. Bu numaranın bir adı var — homograf saldırısı — ve bir hedefin, güvendiğiniz adresle harfi harfine örtüşüp yine de başka bir yerde olabilmesinin sebebi budur.

### 3. Dürüst ilk durak

Koddaki adres sahiden saygın olabilir — bir bağlantı kısaltıcı, bir pazarlama yönlendirmesi, bir arama motorunun tıklama takibi — ve sizi yalnızca saygın olmayan bir yere *iletebilir*. İlk adres denetimden geçer; hedefi, siz çoktan yola çıktıktan sonra bir sunucu belirler. Basılı bir koddaki kısaltılmış adres kötü bir şeyi kanıtlamaz ama şu anlama gelir: denetleyebildiğiniz adres, varacağınız adres değildir.

## Bir kodu güvenle nasıl taratırsınız

Kural tek cümledir: **önce oku, sonra aç, ve tek bir hareketin ikisini birden yapmasına asla izin verme.** Uygulamada:

- Çözülen metni gösterip duran bir tarayıcı kullanın. Çoğu telefon kamerası hedefi açmadan önce küçük bir şeritte gösterir — şeridi refleksle tıklamak yerine okuyun ve adresin başını değil, *sonunu* okuyun.
- En çok, bedelin en yüksek ve yüzeyin herkese açık olduğu yerde kuşkulanın: ödemeyle biten her şeyde, dışarıda yaşayan her şeyde. Parkomattaki kod, müze etiketindekinden daha fazla düşünmeyi hak eder.
- Doğrudan bir giriş ya da kart bilgisi sayfasına götüren kod, durup onun yerine zaten bildiğiniz adresi yazma anıdır. O sayfanın gerçek sürümü hiçbir zaman birkaç tuş vuruşundan uzakta değildir.
- Wi-Fi kodları ve kartvizit kodları da aynı duraksamayı hak eder: biri telefonunuzdan bir ağı aklında tutmasını ister, öteki bir kişiyi kaydetmesini. İkisi de bilerek kabul edildiğinde gayet yerindedir ve ikisi de sessizce olup bitmemelidir.

## Buradaki okuyucu nasıl davranır

Bu sitede bir [QR kod ve barkod okuyucu](https://abox.tools/tr/qr-kod-okuma/) var ve bu sayfanın savunduğu kural üzerine kurulu: **hiçbir zaman hiçbir şey açmaz.** Çözülen metin eksiksiz yazdırılır, adresin gerçekte ulaşacağı sunucu adı kendi satırına çekilir ve yukarıdaki üç kılık denetlenip ortaya çıktıklarında adıyla söylenir. Bağlantıyı açmak ayrı bir düğmedir; okuduktan sonra basılır — ya da hiç basılmaz.

Okumanın kendisi sizin makinenizde olur. Tarattığınız resim tarayıcınızda çözülür ve hiçbir yere gönderilmez; böylece kuşkulandığınız bir kodu, hiç kimse — bu site dahil — ne dediğini öğrenmeden inceleyebilirsiniz. Sayfa Wi-Fi kapalıyken de çalışmaya devam eder ve bu iddiayı sınamanın en kolay yolu budur. Açıkça düşmanca bir içerik, örneğin açan tarafta kod çalıştıracak bir `javascript:` adresi, hiç bağlantı almaz ve olduğu şeyle adlandırılır.

Öteki yarısı da var: kodları kendi makinenizde çizen bir [QR kod oluşturucu](https://abox.tools/tr/qr-kod-olusturma/) ve baskıya gitmeden önce [bir kod yapıp okunduğunu kanıtlama](https://abox.tools/tr/rehberler/qr-kod-yapip-okundugunu-kanitlama/) üzerine yol arkadaşı bir rehber. Sorunuzun ardında daha genişi yattıysa — bir web sitesine herhangi bir şey teslim etmek gerçekte ne yapar — onun da [kendi sayfası](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) var.
