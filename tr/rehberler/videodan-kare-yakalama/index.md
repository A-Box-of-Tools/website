# Bir videodan kare nasıl resim olarak kaydedilir

Oynatıcıyı duraklatıp ekran görüntüsü tuşuna basmak size bir pencerenin resmini verir. Bazen ihtiyacınız olan yalnızca budur. Bu rehber aradaki farkı ve önemli olduğunda karenin kendisini nasıl alacağınızı anlatıyor.

[Video Kare Yakalayıcı aracını açın](https://abox.tools/tr/videodan-kare-yakalama/): Herhangi bir andan tam kaliteli bir kare.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Video Kare Yakalayıcı](https://abox.tools/tr/videodan-kare-yakalama/)'yı açın, klibi bırakın, anı bulun ve *Bu kareyi yakala*'ya basın. İndirmeler klasörünüze düşen şey, karenin videonun kendi çözünürlüğündeki hâlidir — sayfadaki ön izleme ne boyutta olursa olsun, 4K bir klipten ⁦3840 × 2160⁩.

Dosya boyutu bir sorun değilse biçimi PNG'de bırakın. Bu sayfanın geri kalanı, bu iki cümlenin neden bir ekran görüntüsüyle aynı şey olmadığı ve farkın ne zaman önemsemeye değdiğiyle ilgili.

## Duraklatılmış bir oynatıcının ekran görüntüsü neden başka bir resim

Bunu yapmanın bir yolu herkeste zaten var: duraklat, ekran görüntüsü tuşuna bas, denetimleri kırp. İşe yarar ve hızlı bir paylaşım için doğru miktarda çabadır. Ama o noktada resmin başına dört şey gelmiştir ve hiçbiri geri alınamaz:

- **Videonun değil pencerenin boyutundadır.** Yarım ekran bir oynatıcıdaki 4K bir klip size yarım ekran bir oynatıcının resmini verir. Dosyada olup ekranda olmayan her piksel gitmiştir.
- **Ölçeklenmiştir.** Oynatıcı kareyi o pencereye sığdırmak için ne yaptıysa — yumuşatma, keskinleştirme ya da düpedüz yeniden örnekleme — içine pişmiştir.
- **Ekran hattından geçmiştir.** Renk yönetimi ve HDR bir klipte, dosya için değil sizin ekranınız için seçilmiş bir ton eşleme geçişi.
- **Genellikle mobilya da içerir.** Denetimler, bir ilerleme çubuğu, bir altyazı izi, imleç.

Bir kare yakalayıcı dördünü de atlar: dosyanın gerçekten tuttuğu kareyi çözer ve o pikselleri yazar. Resim, videonun olduğu boyuttadır ve üzerine hiçbir şey çizilmemiştir.

## İstediğiniz kareye konmak

Bu, çoğu aracın sessizce yanlış yaptığı kısımdır ve hangisinde olursa olsun neye bakacağınızı bilmeye değer.

Video, izlediğiniz sırada dizilmiş bir resim şeridi değildir. Karelerin çoğu, başka karelerden nasıl farklı olduklarının bir tarifi olarak saklanır ve B kareleri olan herhangi bir dosyada saklanma sıraları gösterilme sıraları değildir. Bir oynatıcıyı bir zaman damgasına götürüp ne çıkarsa yakalayan bir araç, o oynatıcının nasıl yuvarladığına mahkûmdur ve "bir kare ileri" adımını saniyenin otuzda birini ekleyerek atan bir araç, tam olarak 30 fps olmayan her klipte yanılır — ki buna hemen her telefon videosu dâhildir, çünkü ışık değiştikçe kare hızlarını değiştirirler.

Çözüm, dosyanın kendi kare listesini okumak ve karelere o listedeki yerlerinden seslenmektir. Bir MP4'te buradaki araç bunu yapar: kaydırak adım başına bir kare oynar, ok tuşları bir kare oynar ve size 3.540 karenin 812'sinde olduğunuzu söyleyebilir; çünkü onları saymıştır. Doğrudan okuyamadığı biçimlerde bunu söyler ve öyleymiş gibi yapmak yerine kabaca bir kare kadar adım atar.

Herhangi bir kare yakalayıcıyı denemenin hızlı bir yolu: hareketi hızlı bir şeyin birkaç karesinde ileri adımlayın. Resim bazen değişmiyorsa ya da ikişer atlıyorsa araç zaman damgalarını tahmin ediyordur.

![Kare bulucu: üzerine zaman kodu basılmış bir donuk kare, bir sürgü, adım düğmeleri ve tam zamanı ile kare numarasını veren alanlar.](https://abox.tools/screens/grab-a-frame-from-a-video/find.webp)

Kare kare ilerlemek, kastettiğiniz kareye böyle konulur. Zaman da kare numarası da aynı şeyi adlandırır ve ikisi de yazılabilir.

## Hangi biçimde kaydetmeli

Gerçekte yalnızca üç cevap var ve seçim, resmin başına sonra ne geleceğiyle ilgili.

- **PNG** — varsayılan ve kareyi tam olarak saklayan tek biçim. Kare düzenlenecek, basılacak, başka bir kareyle karşılaştırılacak ya da saklanacaksa bunu seçin. Ayrıca en büyüğüdür: 1080p'den birkaç megabayt, 4K'dan yaklaşık sekiz megabayt bekleyin; çünkü PNG'nin sıkıştırması fotoğrafa benzeyen görüntülerde iyi değildir.
- **JPEG** — onda biri boyutunda ve evrensel olarak kabul gören biçim. Bir küçük resim, bir ön izleme ya da doğrudan bir belgeye veya bir sohbete gidecek her şey için bunu seçin. Videonun kendi sıkıştırmasının üstüne ikinci bir kayıplı sıkıştırma turudur; yani daha fazla düzenleme için yanlış başlangıç noktasıdır.
- **WebP** — aynı görsel kalitede daha da küçüktür ve artık önemli olan her yerde desteklenir. Tek çekince eski yazılımlardır: bazı masaüstü uygulamaları hâlâ bir tanesini açmaz.

Açık olmaya değen bir şey: bir videodan çıkan kare zaten sıkıştırılmış bir resimdir. Onu PNG olarak kaydetmek bunu geri almaz ve klip yapılırken kodlayıcının attığı ayrıntıyı geri getiremez. PNG'nin size kazandırdığı şey, hiçbir şeyin *iki kez* atılmamasıdır. Kareyi sonradan renk düzeltmesinden geçirecek ya da kırpacaksanız bu önemlidir; birine gönderecekseniz değildir.

## Bir seferde çok sayıda kare yakalamak

Birkaç saniyede bir kare almak, tek bir anda kare almaktan başka bir iştir ve kulağa geldiğinden daha sık karşınıza çıkar: uzun bir kaydın bir kontak sayfası, aralarından bir kapak görseli seçmek için küçük resimler ya da bir çekim boyunca odağı veya pozlamayı denetlemek için eşit aralıklı bir görüntü örneği.

Bir aralık belirleyin, dizi düğmesine basın; araç klibi bir kez baştan sona geçsin ve her işarette bir kare alsın. İki pratik not. Uzun bir klipte aralığı bol tutun — bir saatlik görüntüden saniyede bir kare 3.600 resim demektir; aracın bir çalışmayı 500'de sınırlamasının sebebi de budur. Ve aksini gerektiren bir sebebiniz yoksa bunun için JPEG seçin: yüz tane 4K PNG, siz daha hiçbirini indirmeden sayfada tutulan bir gigabaytın büyük kısmıdır.

Zaman koduyla adlandırılmış, tek bir ZIP olarak geri gelirler; böylece gerçekleştikleri sıraya dizilirler ve her biri videoda yeniden bulunabilir.

![Aynı klipten alınmış üç donuk kare, zamanlarıyla birlikte küçük görseller hâlinde ve hepsini bir kerede kaydeden bir düğme.](https://abox.tools/screens/grab-a-frame-from-a-video/shots.webp)

Birkaç tane alın, seçimi sonra yapın. Siz kaydedene kadar sayfada dururlar ve kaydetmek tek düğmedir.

## Dikey videolar ve o klasik yan yatmış kare

Bir telefon videosundan hiç kare çekip yan yatmış hâlde aldıysanız, sebebi budur. Bir telefon yatay çeker ve pikselleri döndürmek yerine dosyaya bir çeyrek tur yazar. Oynatıcılar o turu okur ve uygular; yalnızca pikselleri okuyan bir araç uygulamaz ve sonuç, doğru anın 90 derece döndürülmüş, gayet iyi bir resmidir.

Dosyada yanlış bir şey yok ve kareyi sonradan yeniden döndürmek size sinir bozukluğu dışında hiçbir şeye mal olmaz. Buradaki araç döndürmeyi izden okur ve çizmeden önce uygular; yani dikey bir klip dikey bir resim verir.

## Geri getiremeyeceğiniz şeyler

Bir kare, ancak geldiği kare kadar iyi olabilir ve hangi aracı kullanırsanız kullanın iki şey bunu sınırlar.

**Hareket bulanıklığı karenin içindedir.** Özne pozlama sırasında hareket ediyorduysa o hareketin her karesi bulanıktır ve içeride bulunacak keskin bir kare yoktur. Tek çözüm daha yüksek bir enstantane hızıyla çekmektir ve bu, kayıttan önce olmak zorundadır.

**Sıkıştırma da karenin içindedir.** Video bir fotoğraftan çok daha sert sıkıştırılır ve anahtar kareler arasındaki karelerde çok daha serttir. Bir kare bloklu görünüyorsa bir iki kare öne ya da geriye adımlamayı deneyin: bir anahtar kare eksiksiz saklanır ve genellikle komşularından gözle görülür biçimde temiz görünür.

Karenin sonradan başka bir boyutta ya da şekilde olması gerekiyorsa bunu ayrı bir adım olarak yapın: [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/) boyutlandırır, kırpar ve dönüştürür; bunların her birinin neye mal olduğunu [kendi rehberi](https://abox.tools/tr/rehberler/resim-boyutlandirma/) anlatıyor.

## Bunun neden bir yüklemeye ihtiyacı yok

Bir tarayıcıda video çözmek yenidir ve gerçektir: WebCodecs, telefonunuzun video oynatmak için kullandığı donanım çözücüsünün aynısını açar. İş, dosyaya zaten sahip olan makinede olur ki gigabaytlarca büyüklükteki bir klip için anlamı olan tek düzen de budur — 8 MB'lik tek bir resim almak için bir saatlik 4K yüklemek her yönden kötü bir takastır.

Buradaki aracın hiçbir türde ağ özelliği yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Size söylenmesindense denetlemeyi tercih ederseniz internet bağlantısını kesin ve yine de bir kare yakalayın.

[Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) herhangi bir araçta çalıştırabileceğiniz üç denetim daha anlatıyor.
