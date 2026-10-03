# Bir PDF, metin gerçekten gidecek şekilde nasıl karartılır

Bir adın üstündeki siyah dikdörtgen ile silinmiş bir ad ekranda birbirinin aynısı görünür. Bunlardan biri seçilip kopyalanmaktan sağ çıkar. Bu rehber aradaki farkı, bir kelimenin sayfada hiç bulunmayan saklanma yerlerini ve hangisine sahip olduğunuzu söyleyen otuz saniyelik denetimi anlatıyor.

[PDF Karartıcı aracını açın](https://abox.tools/tr/pdf-karartma/): Harfler dosyadan silinir ve sonra bunu kanıtlamak için dosyada arama yapılır.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[PDF Karartıcı](https://abox.tools/tr/pdf-karartma/)'yı açın, belgeyi bırakın, gitmesi gereken kelimeleri yazın, kastettiklerinizi işaretleyin ve “Onları çıkar”a basın. Harfler sayfanın kendi çizim talimatlarından silinir, aynı kelimeler yer imlerinden, yorumlardan, form alanlarından ve belge özelliklerinden çıkarılır ve bitmiş dosya, size sunulmadan önce gözünüzün önünde yeniden açılıp aranır.

Aşağıdaki her şey, o son cümlenin neden önemli olduğu ve zaten kullandığınız aracın aynı şeyi söyleyip söyleyemeyeceğini nasıl anlayacağınızla ilgili.

## Konu olan çuvallama

Bir PDF okuyucusunda bir adın üstüne siyah bir dikdörtgen çizin. Gördüğünüz şey, üstünde siyah bir dikdörtgen olan bir addır. Çoğu okuyucunun *kaydettiği* şey ise adı ve ondan ayrı olarak bir konumu, bir boyutu ve bir rengi olan bir dikdörtgeni içeren bir belgedir.

Böyle çizilmiş bir dikdörtgen bir **açıklamadır**: sayfanın içinde değil yanında duran bir nesne. Altındaki metin tam olarak olduğu gibidir. Alanı seçip kopyala'ya basın, ya da dosyanın üstünde herhangi bir metin çıkarıcı çalıştırın, ya da onu açıklamaları başka türlü çizen bir programda açın; ad geri gelsin. Ekranda bunu gerçek bir karartmadan ayıran hiçbir şey yoktur; hukukçu çalıştıran kuruluşların başına gelmeye devam etmesinin sebebi tam olarak budur.

Bu, mahkeme dosyalarını, istihbarat değerlendirmelerini, sözleşmeleri ve — Aralık 2025'te — Amerika Birleşik Devletleri Adalet Bakanlığı belgelerinin toplu bir yayımında karartılmış adları ifşa etti; o adlar yayımdan saatler sonra okunabiliyordu. Örüntü her zaman aynıdır. Dikdörtgen açıklamaydı ve açıklama hiçbir zaman metin değildi.

## Gerçek bir karartma bunun yerine ne yapar

Bir PDF'teki bir sayfa bir talimatlar listesidir: şu yazı tipini ayarla, kalemi buraya götür, şu harf biçimlerini çiz. Sayfadaki kelimeler tam olarak tek bir yerde, o çizim talimatlarının işlenenleri olarak bulunur:

```
BT /F1 12 Tf 72 700 Td (Sayin Bay Smith) Tj ET
```

Adı karartmak, **o harfleri o talimattan silmek** ve sayfayı geri yazmak demektir. Ondan sonra geri getirilecek bir şey yoktur; dosya onu iyi sakladığı için değil, harfler dosyada olmadığı için. Altında bir şey olan bir dikdörtgen yoktur, çünkü altında bir şey yoktur.

Bir şeyin geri konması gerekir, yoksa sonuç gözle görülür biçimde yanlış olur. Metin, kalem sayfa boyunca ilerletilerek çizilir; yani beş harf silmek satırın geri kalanını beş harf sola çeker: sütunlar hizadan çıkar ve toplamlar yanlış başlıkların altına kayar. Bunu düzgün yapan bir araç, kaldırılan harflerin ne kadar ilerleyeceğini ölçer ve o mesafeyi, kalemi hiçbir şey çizmeden oynatan bir aralık talimatı olarak geri koyar.

Siyah kutu, varsa, *sonradan* ve zaten boş olan bir boşluğun üstüne çizilir. Belgeyi okuyan kişiye bir nezakettir — bir şeyin çıkarıldığının işareti — ve karartmanın kendisi değildir. Bütün ayrım tek cümlede budur: gerçek bir karartmada kutu süstür; sahte olanda kutu, karartmanın *kendisidir*.

![Bulma kartı: yazılmış iki terim, eşleşme sayısı ve belgede geçtikleri her yerin listesi.](https://abox.tools/screens/redact-a-pdf/find.webp)

Neyin gitmesi gerektiğini siz söylersiniz, araç da her geçtiği yeri bulur; kimsenin hatırlamadığı üçüncü sayfadakiler dâhil.

## Bir kelimenin sayfa dışında saklandığı dört yer

Bu, ilk kısmı düzgün yapmış olanları yakalayan kısımdır. Bir PDF metni aynı anda birkaç yerde taşır ve bir okuyucu hepsini gösterir, arar ya da kopyalar. Bir adı sayfadan kaldırıp bunlardan birinde bırakmak, onu kaldırmış olmaz.

- **Belge özellikleri.** Başlık, yazar ve bunun dışa aktarıldığı dosyanın adı. Sayfalarından bir ad çıkarılmış ve özelliklerinde hâlâ `Smith uzlasma taslak 3.docx` yazan bir belge karartılmamıştır. Aynı bilginin genellikle bir XMP paketinde ikinci bir kopyası bulunur ve onun da gitmesi gerekir.
- **Yer imleri.** Bir okuyucunun yanındaki içindekiler listesi, sayfa numaraları iliştirilmiş başlıklardan oluşan bir listedir — ve bir başlık, sayfadaki hiçbir şeyin denetlemediği bir metin satırıdır.
- **Form alanları ve yorumlar.** Birinin bir forma yazdığı şey iki kez saklanır: bir kez alanın değeri olarak, bir kez de okuyucunun çizdiği görünüm olarak. İkisinin de gitmesi gerekir. Bir yapışkan not, hem metnini hem de onu yazanın adını taşır.
- **Karşılık metni.** Bir PDF, bir dizi harf biçiminin başka bir şey “yazdığını” bildirebilir; böylece bir bitişik harf ya da tireyle bölünmüş bir satır, temsil ettiği kelime olarak kopyalanır. Bu, bir belgenin bir şey gösterip Ctrl+C'de okuyucuya başka bir şey verebileceği anlamına gelir ve yalnızca çizileni kaldıran bir karartma, paragrafı seçen herkes için cümleyi olduğu gibi bırakırdı.

Ekler beşincisidir. Bir PDF içinde bütün başka dosyalar taşıyabilir ve sayfalara yaptığınız hiçbir şey onlara dokunmaz.

![Sayfa kartı: bir sayfanın metni, çıkarılmış ve seçilebilir hâlde, bulunan terimler vurgulanmış.](https://abox.tools/screens/redact-a-pdf/page.webp)

İnsanı şaşırtan kısım budur. PDF bir resim değildir: içindeki sözcükler, dosyayı alan herkesçe seçilebilir, aranabilir ve kopyalanabilir.

## Bir dosya otuz saniyede nasıl denetlenir

Bunu, hangi araç üretmiş olursa olsun göndermek üzere olduğunuz her şeye yapın. Yayımlanmış çuvallamaların her birini yakalayacak olan denetim budur.

1. **Bitmiş dosyayı açın ve Ctrl+F'ye basın** (bir Mac'te Cmd+F). Kaldırdığınız kelimeyi arayın. Gerçek bir karartma hiçbir şey döndürmez. Okuyucu siyah bir dikdörtgene atlıyorsa kelime hâlâ oradadır ve dikdörtgen onun üstünde oturuyordur.
2. **Karartılmış alanı seçin ve kopyalayın.** Dikdörtgenin üzerinden sürükleyin, Ctrl+C'ye basın ve bir metin kutusuna yapıştırın. Bir şey geliyorsa aynı çuvallamayı öbür yönden bulmuşsunuzdur.
3. **Belgenin tamamını seçin ve onu kopyalayın.** Ctrl+A, sonra Ctrl+C; herhangi bir metin düzenleyiciye yapıştırın ve çıkanı okuyun. Üçünün en yararlısı budur; çünkü belgeyi size bir metin çıkarıcının gördüğü gibi gösterir — orada olduğunu hiç bilmediğiniz metin dâhil; ki taranmış bir sayfada bu yaygındır.
4. **Özelliklere bakın** — çoğu okuyucuda Dosya → Özellikler — ve yer imleri paneline. İkisi de bir adın, sayfa açısından kusursuz bir karartmadan sağ çıktığı yerlerdir.

[PDF Karartıcı](https://abox.tools/tr/pdf-karartma/) bunların birincisini ve üçüncüsünü sizin yerinize çalıştırır ve sayıyı gösterir; çünkü bir aracın bir şeyi kaldırdığını iddia etmesi kanıt değildir, bitmiş dosyada yapılan bir arama ise kanıttır.

## Taranmış belgeler başka bir sorundur

Bir tarama, bir sayfanın fotoğrafıdır. Üzerindeki kelimeler metin değil pikseldir ve metin katmanını ne kadar düzenlerseniz düzenleyin onlara dokunmazsınız — çünkü ya metin katmanı yoktur ya da olan katman resmin kendisi değil onun tarifidir.

Güncel tarayıcıların ve PDF araçlarının çoğu, sayfa aranabilsin diye resmin üstüne optik karakter tanımayla yazılmış görünmez bir metin katmanı ekler. O katman gerçek metindir ve kaldırılabilir. Kaldırmaya değer: bir aramanın, bir kopyalamanın ve belge okuyan her otomatik sistemin bulacağı şey odur. Resimle ilgili hiçbir şeyi değiştirmez; sayfaya bakan herkes için kelimeler orada hâlâ gayet okunaklıdır.

Yani bir tarama için dürüst sıra şudur: kelimeleri metin katmanından çıkarın, sonra resimle ayrıca ilgilenin — ki bu, pikselleri üzerine yazmak demektir. [Görsel karartıcı](https://abox.tools/tr/rehberler/resim-karartma/) bunu yapar ve yanındaki rehber, bir bulanıklaştırmanın ya da bir mozaiğin metin için neden yeterli olmadığını anlatır.

## Neden basıp yeniden taramak olmasın

Çünkü işe yarar ve size başka her şeye mal olur. Karartılmış bir sayfayı basıp yeniden taramak, sızdıracak metin katmanı olmayan bir belge üretir — ve kimsenin arayamayacağı, hiçbir ekran okuyucunun okuyamayacağı, beş ila elli kat büyük ve kalitesi ofis tarayıcısının canı ne isterse o olan bir belge. Ayrıca sayfanın göründüğü gibi basılmış olmasına dayanır: bir açıklama, ekranda görünüp kâğıtta görünmeyecek şekilde işaretlenebilir ve siyah kutunuz o olduğu zaman, yazıcıdan çıkan sayfada ad durur.

Aynı sav, bazı araçların karartma olarak sunduğu “görsele düzleştir” için de geçerlidir. Her sayfayı kendi fotoğrafına çevirir. Kelimeler silinmek yerine örtülmüşse örtü artık kalıcıdır — ama belgeyle ilgili başka her şey de onunla birlikte gitmiştir ve gönderdiğiniz dosya kimsenin üzerinde çalışamayacağı bir dosyadır.

## Bu iş neden yüklemeye en az değen iştir

Bir karartma hizmetine, karartılmamış dosyanın verilmesi gerekir. Bütün alışveriş budur: özel sürüm önce, el değmemiş hâlde varır ve bir başkasının diskindeki sürüm odur. Gizlilik politikası ne derse desin sıra tartışılamaz — dikkat ettiğiniz belge, teslim ettiğiniz belgedir.

İnsanların ne karartığı bunu kulağa geldiğinden kötü yapar. Tanık ifadeleri, sağlık raporları, ev sahibine gidecek banka hesap özetleri, bir müşterinin adı geçen ve başka bir müşteriye gidecek bir sözleşme, üstünde ev adresi olan bir başvuru. Belgeler bunlardır ve tam da bu yüzden onların aracının öbür ucunda bir sunucu olmamalıdır.

[Bu sitenin karartıcısındaki](https://abox.tools/tr/pdf-karartma/) her şey kendi tarayıcınızda olur: dosya sizin makinenizde okunur, düzenlenir, yazılır ve denetlenir ve aradığınız kelimeler de sekmeden hiç çıkmaz. İnternet bağlantısını kesin, çalışmaya devam etsin; hiçbir şeyin bir yere gönderilmediğinin var olan en basit kanıtı budur. Bir yüklemenin gerçekte neyi içerdiği için [dosya yüklemek güvenli mi](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) sayfasına bakın.
