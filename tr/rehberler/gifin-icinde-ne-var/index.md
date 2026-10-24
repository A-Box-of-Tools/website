# Bir GIF'in içinde gerçekte ne var

Bir GIF, her birinin bir zamanlayıcısı ve bir renk tablosu olan bir dikdörtgenler yığınıdır ve insanların bu biçim hakkındaki hemen her şikâyeti bu üç şeyden birinden doğar. Bu rehber her parçanın ne yaptığını ve dosyanızın boyutunu hangisine harcadığını nasıl öğreneceğinizi anlatıyor.

[GIF Çözümleyici aracını açın](https://abox.tools/tr/gif-analiz-etme/): Kareler, gecikmeler, paletler ve her baytın nereye gittiği.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Bir GIF; bir tuval, onun üstüne boyanacak bir dikdörtgenler listesi ve o dikdörtgenlerdeki sayıların ne anlama geldiğini söyleyen bir renk tablosudur. Her dikdörtgen üç şey taşır: ne kadar kalacağı, sonrasında ona ne yapılacağı ve isteğe bağlı olarak kendine ait bir renk tablosu.

İnsanların bu biçimde şaşırtıcı bulduğu hemen her şey o listeden çıkar. GIF'iniz devasaysa, sebep dikdörtgenlerin her seferinde tuvalin tamamı olması ya da içinde üç yüz renk tablosu bulunmasıdır. Fazla yavaş oynuyorsa, sebep gecikmelerin hiçbir tarayıcının altına inmeyeceği bir tabanın altında olmasıdır. Bulaşıyorsa, sebep *elden çıkarma* denen alandır.

Belirli bir dosyada bunlardan hangisi olduğunu görmek için [GIF Çözümleyici](https://abox.tools/tr/gif-analiz-etme/)'yi açın ve dosyayı bırakın. Bu sayfanın geri kalanı, sayıların ne anlama geldiğidir.

![Bir GIF'in özet kartı: sürümü, tuval boyutu, dosya boyutu, kare sayısı, kaç kez döndüğü ve kaç renk kullandığı.](https://abox.tools/screens/whats-inside-a-gif/facts.webp)

Bir oynatıcının asla göstermediği her şey, tek dosyadan.

## Kareler resim değil, dikdörtgendir

GIF'leri yalnızca oynarken görmüş insanları şaşırtan kısım budur. Bir kare, canlandırmanın o andaki resmi değildir. Kendi konumu ve kendi boyutu olan, önceki karelerin geride bıraktığının üstüne boyanmış bir dikdörtgendir.

O dikdörtgen tuvalin tamamı olabilir ve kötü yapılmış bir dosyada her zaman öyledir. Ama bir GIF'in, resmin yalnızca son kareden bu yana değişen kısmını saklamasına izin verilir — ve resmin çoğunun durduğu yerde bu, 12 MB'lik bir dosyayla 900 KB'lik bir dosya arasındaki farktır. Çoğunlukla durağan bir pencerenin ekran kaydının küçük olabilmesinin ve aynı kaydın özensiz bir dönüştürücüden çıkanının olmamasının sebebi budur.

Hangisine sahip olduğunuzu canlandırmayı izleyerek anlayamazsınız. İkisi de aynı görünür. Görmenin tek yolu, her karenin ne sakladığına bakmaktır; çözümleyicinin tam olarak bu yüzden bir görünümü var: onu *her karenin yalnızca sakladığı* hâline getirin; ya saydam bir arka planda küçük şekillerden oluşan bir sıra görürsünüz ki bu, kodlayıcının işini yaptığı anlamına gelir, ya da resmin tamamını tekrar tekrar görürsünüz ki bu, yapmadığı anlamına gelir.

Biçimin hiçbir yerinde hareket telafisi yoktur. Hiçbir şey, bir video kodlayıcısının yapacağı gibi “geçen seferkiyle aynı ama dört piksel sola” olarak saklanmaz. Değişen dikdörtgen numarası, GIF'in sahip olduğu tek kazançtır ve epeyce değerlidir.

## Gecikmeler ve her tarayıcının dayattığı taban

Her kare, saniyenin yüzde biri cinsinden ne kadar tutulacağını saklar. Biçimin sahip olduğu tek birim budur; yani bir dosyanın isteyebileceği en hızlı değer 0,01 saniyedir — saniyede yüz kare — ve en uzunu yaklaşık 655 saniyedir.

Saniyede yüz kare alamayacaktır. **Her tarayıcı, 0,02 saniyenin altındaki bir gecikmeyi 0,10'a yuvarlar.** Kural, 1996'da dönemin dönen dünyaları ve hareketli "yapım aşamasında" tabelaları için Netscape Navigator'a yazıldı ve o günden beri her tarayıcı onu kopyaladı. Hiçbir zaman kaldırılmadı ve kaldırılmayacak.

Yani kareleri 0,01 sn diyen bir GIF, saniyede yüz değil on karede oynar. Onu yapan şeyin niyetinden on kat yavaş çalışır ve dosya buna dair hiçbir ipucu vermez: içindeki gecikmeler tam olarak istenen gecikmelerdir. Bu, biçimdeki en yaygın tek sürprizdir ve çözümleyicinin iki süre bildirmesinin sebebi de budur — dosyanın söylediği ve bir tarayıcının onunla gerçekten yapacağı.

Dosya nerede yapılmış olursa olsun çözüm, 0,01 yerine 0,02 yazmaktır. Bu, gerçek tavan olan saniyede 50 kareyi verir ve hiçbir şeyin ihtiyaç duyacağından hızlıdır. Pratikte 0,05 sn — saniyede yirmi kare — kabaca istemeye değecek en hızlı değerdir.

Gecikmelerin size söylediği bir şey daha. Hepsi aynıysa dosya, sabit hızlı bir kare setinden yapılmıştır. Dağınıklarsa — burada 0,04, şurada 0,11 — bir şey bir videoyu dönüştürüp kareler düşürmüş ve boşlukları kapatmak için komşuları uzatmıştır. Ve sonuncusu gerisinden çok daha uzunsa bu bilinçlidir: bir canlandırmayı döngüye girmeden önce duraklatmanın yolu budur.

## Elden çıkarma: bulaşıp bulaşmayacağına karar veren alan

Her kare, süresi dolduğunda ekranda ne bırakılması gerektiğini söyler. Dört olası cevap var ve bilmeye değerler; çünkü bir canlandırmanın yanlış görünebileceği dört yoldan üçü, bu alanın yanlış olmasıdır.

- **Yerinde bırak.** Bir sonraki kare doğrudan bunun üstüne boyar. Kareler opaksa ve birbirini tamamen kapatıyorsa doğrudur ve en ucuz seçenektir; çünkü temizlenecek bir şey yoktur.
- **Arka plana geri temizle.** Karenin dikdörtgeni, bir sonraki çizmeden önce silinir. Saydamlığın istediği budur: onsuz, bir sonraki karenin saydam kısımları altındaki önceki kareyi gösterir ve ayrı resimlerden oluşan bir canlandırma, onların bir yığınına dönüşür.
- **Altındakini geri getir.** Bu kare çizmeden önce tuvalde ne varsa geri konur. Durağan bir arka planın üstünde hareket eden küçük bir nesnenin saklanma biçimi budur — her kare nesneyi boyar, sonra arka plan geri gelir ve yalnızca nesnenin dikdörtgeni yazılır.
- **Belirtilmemiş.** Dosya söylemedi. Her görüntüleyici bunu “yerinde bırak” olarak işler ki genellikle doğrudur ve ara sıra saydam bir GIF'in bulaşmasının sebebidir.

Belirtimle gerçeğin yollarının ayrıldığı bir ayrıntı. “Arka plana geri temizle”, dosyanın başlığında bir arka plan rengi adlandırır ve her tarayıcı onu yok sayıp bunun yerine saydama temizler. Yirmi beş yıldır böyle yapıyorlar. O arka plan renginin görünmesine dayanan bir dosya, onu yapana, yapıldığı yerde doğru görünür ve başka her yerde yanlış görünür.

## Renk tabloları ve mal oldukları 768 bayt

Bir GIF pikseli bir renk değildir. Her biri üç baytta saklanan, en fazla 256 renklik bir tabloya işaret eden bir sayıdır. Yani tam bir tablo 768 bayttır ve bir dosyada her şeyin paylaştığı bir tane, ya kare başına bir tane ya da ikisi birden olabilir.

İki düzen de meşrudur ve farklı takaslar yapar:

- **Tek paylaşılan tablo**, bütün dosya için 768 bayttır ve renkleri kareler arasında sabit tutar. GIF titremesi — videodan yapılmış bir dosyadaki o rahatsız edici titreşim — çok sık, paletin kareden kareye sendelemesinden başka bir şey değildir.
- **Kare başına bir tablo**, her karenin paylaşılan tabloda olmayan renkleri kullanmasını sağlar ki sahne tamamen değiştiğinde bu önemlidir. Her seferinde 768 bayta mal olur. 300 karelik bir canlandırmada bu, tek bir piksel saklanmadan önce 230 KB renk tablosu demektir.

İkinci ve daha sessiz bir bedeli var. Bir renk tablosunun uzunluğunun ikinin bir kuvveti olması gerekir; yani dokuz renk kullanan bir kare yine on altılık bir tablo alır ve 130 kullanan bir kare yine 256 alır. Bir miktar yukarı yuvarlama kaçınılmazdır. Tabloları, piksellerinin hiç göstermediği beş bin renk bildiren bir dosya ise başka bir şeydir: karede sonunda yer alandan başka bir resim için kurulmuş paletler. Çözümleyici, kullanılmayan girdileri işaretler; böylece bunun şekli bir bakışta görünür.

## Baytlar gerçekte nereye gidiyor

Bir GIF'in her baytı az sayıda yerden birindedir ve bir dosyanın fazla büyük olduğuna karar vermeden önce bunların ne olduğunu bilmeye değer.

- **Sıkıştırılmış pikseller.** Sağlıklı bir dosyada neredeyse tamamı. Resmin kendisi, LZW'den geçirilmiş hâlde — 1984'ten kalma ve hesap tablosu ekran görüntüleri için tasarlanmış bir sıkıştırma şeması; düz renkte iyi, fotoğraflarda kötü olmasının sebebi de budur.
- **Renk tabloları.** Yukarıdaki gibi, tam tablo başına 768 bayt.
- **Kare başına başlıklar.** Her kare için sekiz bayt zamanlama ve on bir bayt tanımlayıcı. Normal bir dosyada hiçbir şey; iki bin minik kareden oluşan bir canlandırmada 38 KB.
- **Blok çerçeveleme.** Sıkıştırılmış veri, her birinin önünde bir uzunluk baytı olan en fazla 255 baytlık dizilere bölünür. Kabaca her 256 baytta bir bayt; kaçınılmaz ve görmeye değer, çünkü aksi hâlde görünmez.
- **Üstveri.** Yorumlar, renk profilleri ve XMP paketleri. Gerçekten saçma sonuçlar üreten kısım budur: bir görüntü düzenleyici, yıllar önce yapılmış bir düzenlemeyi tarif eden 40 KB'lik XML bırakabilir ve küçük bir GIF'te bu, dosyanın büyük kısmıdır. Hiçbir görüntüleyici bunların hiçbirini çizmez.

Buna tahmin yerine bir tablo olarak bakmanın sebebi, cevabın farklı dosyalarda farklı olması ve çözümün cevaptan doğmasıdır. %95'i sıkıştırılmış piksel olan bir dosya düpedüz çok fazla resimdir ve yalnızca daha az kare, daha küçük bir boyut ya da daha az renk yardımcı olur. %30'u renk tablosu ya da %40'ı XMP olan bir dosyanın ise çok daha ucuz bir sorunu vardır.

![Bir GIF'i baytlarının nereye gittiğine göre ayrıştıran bir çubuk; kare başına bir satırda boyut ve dosyadaki pay.](https://abox.tools/screens/whats-inside-a-gif/budget.webp)

Baytların gerçekte nereye gittiği, kare kare. Fazla büyük bir GIF neredeyse her zaman, bunun apaçık gösterdiği bir nedenle büyüktür.

## Döngü, biçimin bir parçası değildir

GIF belirtiminde bir canlandırmanın tekrarlandığını söyleyen bir alan yoktur. Döngü, Netscape'in 1995'te icat ettiği bir bloktan gelir — içinde `NETSCAPE2.0` dizgesi olan bir “uygulama uzantısı” — ki her şey yine de onu uyguladı ve şimdi internetteki her hareketli GIF'in içinde.

Bu, o bloğu olmayan bir dosyanın her tarayıcıda tam olarak bir kez oynayıp duracağı ve onu yapana bozuk görüneceği anlamına gelir. Bir canlandırma yalnızca bir kez oynuyorsa o blok eksiktir; denetlemeye değen ilk şeylerden biridir ve hiçbir görüntüleyicide görünmez.

Blok bir sayı da belirtebilir — beş kez oyna ve dur. Sıfır sonsuz demektir ve neredeyse her dosyanın söylediği de budur.

## Bir GIF'in taşıyabildiği diğer şeyler

Hiç resim tutmayan ve her görüntüleyicinin atladığı üç blok:

- **Yorumlar.** Serbest metin; genellikle dosyayı yazan şeyin adı, ara sıra da yazarın yayımlamayı seçmeyeceği bir şey. Hiçbir şey onu göstermez ve dosyanın her kopyası onu taşır.
- **XMP.** Adobe'nin XML üstverisi: dosyayı neyin, ne zaman, bazen kimin düzenlediği. Sonunda 258 baytlık sihirli bir kuyrukla gelir; bu, blok uzunlukları doğru çıksın diye kullanılan bir numaradır ve bir tanesini saf saf okumanın size neden bir ekran dolusu ikili verdiğinin sebebidir.
- **Düz metin.** 1989 belirtiminden kalma, görüntüleyiciden resmin üstüne bir hücre ızgarasında metin çizmesini isteyen bir blok. Hiçbir şey tarafından hiç uygulanmadı. Bir dosyada varsa, ne diyorsa görünmeyecektir.

Üçünü de bir dosyayı bir yere göndermeden önce bilmeye değer: bunlar, bir GIF'in sizin hakkınızda bir şey söyleyebilecek kısımlarıdır ve bir şey onları bilerek temizlemedikçe her kopyadan ve yeniden yüklemeden sağ çıkarlar.

## Hasarlı bir dosyayı okumak

GIF'ler kesilir — duran bir indirme, bozulan bir diskten kurtarılmış bir dosya, bir uygulamanın yarısını yazdığı bir şey. Biçim, tek bir dizinlenmiş yapı değil bir bloklar akışı olduğu için kesilmiş bir GIF genellikle durduğu noktaya kadar hâlâ okunabilir: kopmadan önceki her kare eksiksiz ve sağlamdır.

Bunu bilmeye değer; çünkü çoğu yazılım dosyayı düpedüz reddeder. Okuyabildiği kadar okuyup nerede durduğunu söyleyen bir çözümleyici, en azından ne kadarının hayatta kaldığını ve eksik kısmın bir kare mi yoksa son iki yüz kare mi olduğunu söyler.

Bunun tersi sorun da var: dosyanın bitiş işaretinden *sonra* duran baytlar. Her çözücü o işarette durur, yani onlar hiç okunmaz ve hiç çizilmez ve genellikle ters giden bir şey tarafından birincinin sonuna eklenmiş ikinci bir dosyadır. Saf ağırlıktırlar ve kesip atmak hiçbir şey kaybettirmez.

## Bunların hiçbirinin bir yüklemeye ihtiyacı yok

Bir GIF'in yapısını okumak zorlu bir iş değildir — bir bloklar listesinde bir gezinti ve küçük bir açıcı — ve bunu yapmak için dosyayı bir sunucuya göndermenin hiçbir zaman teknik bir sebebi olmadı. Buradaki [GIF Çözümleyici](https://abox.tools/tr/gif-analiz-etme/) her şeyi sayfanın içinde yapıyor: blok gezintisi, LZW, ekrana çizilen kareler ve bayt muhasebesi.

Bu, çoğu işten çok bu iş için önemlidir; çünkü insanların en çok parçalarına ayırmak istediği dosyalar, çoğu zaman paylaşmak konusunda en az emin oldukları dosyalardır — kurtarılmış bir şey, birinin onlara gönderdiği bir şey, henüz okumadıkları bir yorum bloğu olan bir şey. [Dosya yüklemek üzerine daha uzun sav](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/), burada da bu sitenin her yerindeki kadar güçlü biçimde geçerlidir.
