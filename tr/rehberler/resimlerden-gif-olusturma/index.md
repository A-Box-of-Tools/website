# Görsellerden nasıl hareketli GIF yapılır

GIF'i yapmak kolay kısım. Okumaya değen kısım, gerçekten paylaşılabilecek kadar küçük bir tane elde etmektir; çünkü bir GIF'in kalite kaydırağı yoktur ve boyutunu oynatan yalnızca üç şey vardır.

[GIF Yapıcı aracını açın](https://abox.tools/tr/gif-olusturma/): Bir dizi resmi tek bir animasyona çevirin.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[GIF Yapıcı](https://abox.tools/tr/gif-olusturma/)'yı açın, resimleri bırakın, oynamaları gereken sıraya dizin, her karenin ne kadar tutulacağını belirleyin ve GIF'i yapın. Siz kaydetmeden önce sayfada oynar.

Aşağıdaki her şey, sonrasında ters giden iki şeyle ilgili: dosya beklenenden çok daha büyüktür ya da canlandırma, sayıların söylediğinden yavaş oynar. İkisinin de belirli sebepleri var ve hiçbiri araçtaki bir kusur değil.

## Bir GIF neden beklediğinizden bu kadar büyük

640 pikselde 20 karelik bir GIF alışıldık biçimde 8 ila 15 MB'dir. Aynı canlandırma MP4 olarak birkaç yüz kilobayttır. Bu, kötü yapılmış bir GIF değildir; biçimin kendisi budur.

Kullandığınız diğer her hareketli görüntü biçimi *farkları* saklar. Bir video kodlayıcısı bir tam kare yazar ve ondan sonraki kareler için yalnızca neyin ve nereye hareket ettiğini yazar — durağan bir arka planın önünde konuşan birinin videosunun kare başına neredeyse hiçbir şeye mal olmamasının sebebi budur. Bir GIF bunu yapamaz. Her kare, kayıpsız bir sıkıştırıcıdan geçirilmiş bütün pikseller olarak saklanır ve alet çantasının tamamı budur.

Ayrıca bir kalite ayarı da yoktur; çünkü kısılacak kayıplı bir adım yoktur. %60 kalitede bir JPEG, arkasında gerçek bir kaydırak olan gerçek bir seçimdir; bir GIF'in dengi yoktur. Yani boyut kabaca **alan × kare sayısı**dır ve onu oynatmanın tek yolu bu iki sayıdan birini oynatmaktır.

## Onu gerçekten küçülten üç şey

Yardım ettikleri sırayla:

**1. Küçültün.** Bu, birkaç seçenekten biri değil, seçeneğin kendisidir. Boyut alandır; yani uzun kenarı yarıya indirmek dosyayı dörtte bire düşürür: 640 pikselden 320 piksele inmek 12 MB'yi yaklaşık 3 MB'ye çevirir. Bir web sayfasındaki ya da bir sohbet penceresindeki bir GIF zaten birkaç yüz piksel olarak izleniyor. Araçtaki varsayılanın 480 piksel olmasının sebebi tam olarak budur ve 320 piksel gayet saygın bir cevaptır.

**2. Daha az kare kullanın.** Beşte bir saniye tutulan on kare, onda bir saniyede yirmi kareyle aynı iki saniyelik canlandırmadır ve dosyanın yarısıdır. Akıcılık doğrudan orantılı olarak bayta mal olur, yani onu yalnızca hareketin gerektirdiği yerde harcayın.

**3. Titremeyi kapatın ve renkleri düşürün.** Bu, sezgiye aykırıdır. Titreme (dither), paletin sahip olmadığı renkleri taklit etmek için dönüşümlü piksellerden ince bir desen serper ve o desen *gürültü*dür — ki kayıpsız bir sıkıştırıcının sıkıştıramadığı şey tam olarak budur. Düz çizimlerde, ekran görüntülerinde ve çizgi çalışmalarında onu kapatmak dosyanın üçte birini alabilir ve üstelik daha iyi görünebilir. Fotoğraflarda ise kazanç karşılığında görünür bantlanma takas eder; ikisini de deneyin ve bakın.

256'dan 64 renge düşmek de yardımcı olur, ama insanların umduğundan az: piksel kaldırmak yerine kod kelimelerini kısaltır.

Bunların hiçbiri onu yeterince küçültmüyorsa dürüst cevap, yaptığınız şeyin bir video olduğudur. [Aynı görselleri bir MP4'e çevirmek](https://abox.tools/tr/rehberler/resimleri-videoya-donusturme/) belki de onda biri boyutunda olacaktır ve bir GIF'i bir `<img>` etiketinden başka bir şey için kabul eden her yer — her sosyal ağ dâhil — onu yüklemede yine de videoya dönüştürür.

## Bir GIF gerçekte ne kadar hızlı oynayabilir

Biçim, her karenin gecikmesini saniyenin yüzde biri cinsinden saklar; bu da 0,01 sn isteyip saniyede yüz kare alabileceğinizi düşündürür. Alamazsınız.

Her tarayıcı, saniyenin yüzde ikisinin altındaki bir gecikmeyi saniyenin onda birine yükseltir. Kural, sayfaların olabildiğince hızlı oynasın diye ayarlanmış canlandırmalarla dolu olduğu ve günün makinelerinin buna dayanamadığı 1990'lardan kalmadır ve konduğu her sebepten uzun yaşamıştır. Hiçbir zaman kaldırılmadı ve bugün sizin GIF'iniz için de geçerli.

Yani pratikteki aralık şudur:

- **0,02 sn** (saniyede 50 kare) — bir GIF'in olmasına izin verilen en hızlı hâl ve genellikle gerektiğinden hızlı.
- **0,05 sn** (saniyede 20 kare) — akıcı canlandırma ve hareket canlandırıyorsanız başlanacak yer.
- **0,1 sn** (saniyede 10 kare) — klasik GIF görünümü. Karelerin yarısı, dosyanın yarısı ve bilerek yapılmış gibi okunur.
- **0,5 sn ve üstü** — bir slayt gösterisi. Her resme canlandırılıyor değil bakılıyordur.

0,02 sn'nin altındaki hiçbir şey sunulmuyor; çünkü var olan her tarayıcıda sessizce 0,1 sn'ye dönüşecek bir sayıdır.

## Palet ve gerçekte neyi seçtiği

Bir GIF karesi en fazla 256 renk tutar. Bir fotoğrafta on binlerce renk vardır. Birinin bunların 256'sını seçmesi gerekir ve o seçim, çıktının nasıl göründüğüdür — başka her ayardan çok.

Araç bunu yapmanın iki yolunu sunar:

**Her kare için en iyi renkler**, her resme kendi 256'sını verir. En keskin görünen budur ve her biri zaten tamamen farklı bir küme isteyen, birbiriyle ilgisiz fotoğraflardan oluşan bir set için doğrudur.

**Bütün GIF için tek palet**, tüm karelerden aynı anda tek bir tablo kurar. Kareler bir *dizi* olduğunda kullanın — aynı sahne, birkaç an arayla. Kare başına paletle, resimdeki herhangi bir değişiklik hangi 256 rengin seçildiğini değiştirir ve arka planın tamamı her karede hafifçe renk kaydırır. Ev yapımı bir GIF'i ev yapımı gösteren şey o titreşimdir. Paylaşılan bir palet onu kaldırır ve üstüne daha küçük bir dosya yapar; çünkü tablo her karede değil bir kez yazılır.

Daha az renk — 128, 64, 32 — düz olan her şeyde denemeye değer. İçinde sekiz renk olan bir logo canlandırması 32'de hiçbir şey kaybetmez ve farkı bir fotoğrafta anında görürsünüz.

![Renk ayarları: 128 renklik bir palet, ortak palet ile kare başına palet arasında bir seçim, kapalı taramalama ve kare, süre ile tahmini boyut özeti.](https://abox.tools/screens/make-a-gif-from-images/colours.webp)

Palet, boyut üzerinde en büyük etkiyi yapan ve çoğu aracın gizlediği ayardır. Altındaki özet, siz değiştirdikçe kıpırdar.

## Saydamlık tek bittir ve hikâyenin tamamı budur

Bir GIF pikseli ya tam boyalıdır ya da tamamen görünmezdir. Arası yoktur: %50 gölge yok, yumuşak kenar yok, geçiş yok.

Yani kaynak görsellerinizde saydamlık varsa onu açmak saydam alanları saydam tutar — ama şekilden hiçliğe bir geçiş olan her kenar yumuşatması, tam ortadan kesilerek sert ve gözle görülür biçimde tırtıklı bir kenara dönüşür. En çok yuvarlak şekiller ve metin zarar görür.

GIF'in hangi rengin üstünde duracağını biliyorsanız onu o renge düzleştirmek her seferinde daha iyi görünecektir. Saydamlığı yalnızca üstüne düşeceği arka plan gerçekten bilinmiyorsa koruyun — ve cevap "her arka planda yumuşak bir kenara ihtiyacı var" ise bunun biçimi GIF değil, hareketli PNG ya da WebP'dir.

## Sıra, zamanlama ve döngünün yerine oturması

Keşfetmekten daha hızlı öğrenilebilecek birkaç şey:

**Ada göre sıralama düzgün sayar.** Bir render ya da dışa aktarma dizisi kastettiğiniz gibi sıralanır; yani `frame_2`, `frame_10`'dan sonra değil önce düşer. Tarihe göre sıralamak bir kamera rulosunu çekildiği sıraya geri koyar ki dosya adları 0001'den yeniden başlamışsa istediğiniz de budur.

**Son kareye daha uzun süre verin.** Her karesi aynı uzunlukta olan bir döngü amansız okunur. Son kareyi yarım saniye kadar tutmak göze dinlenecek bir yer verir ve bütün işi kasıtlı gösterir. Bunun için her karenin kendi tutma süresi var.

**Bir döngü sıçramamalı.** Son kareden hemen sonra ilki gelir; yani bu ikisi çok farklıysa döngü şak diye kopar. Ya onları birbirine benzetin ya da son kareyi tutarak kesmeyi bilerek kullanın.

**Bir kez oynat, bir kez oynat demektir.** Bazı araçlar bir döngü sayısı olarak bir yazar; çözücüler bu konuda hiçbir zaman tam anlaşamamıştır — birkaçı iki kez oynatır. Burada "Bir kez oynat"ı seçmek hiçbir döngü bilgisi yazmaz ki şimdiye kadar kurulmuş her çözücü buna aynı şekilde davranır.

![Sırayla beş kare, her birinin kendi gecikme alanı ve üstlerinde tüm gecikmeleri bir kerede ayarlayan bir satır.](https://abox.tools/screens/make-a-gif-from-images/frames.webp)

Sıra ve zamanlama, ikisi de kare kare değiştirilebilir. Hepsini bir kerede ayarlamak üstteki satırdır ve üçten çok karesi olan herkesin istediği budur.

## Bunun neden bir sunucuya ihtiyacı yok

Bir GIF yapmak, tarayıcının sunmadığı iki iştir: paleti seçmek ve pikselleri LZW ile sıkıştırmak. İkisi de büyük değildir. İkisi birlikte belki dört yüz satırdır, depoda yazılıdır ve buradaki her şey gibi kendi makinenizde çalışır — sayfanın ağ fişi çekilmişken çalışmaya devam etmesinin sebebi de budur.

Bu kadar çok GIF yapıcısının yükleme yapmasının sebebi işin zor olması değildir. Reklamın ve hesapların bulunduğu yerin sunucu olmasıdır. Bir fotoğraf setini bir canlandırmaya çevirmenin, fotoğraflarınızın bulundukları odadan ayrılmasını gerektiren bir yanı yoktur.

[Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) size bu araç dâhil herhangi bir araç hakkında aynı şeyi söyleyecek dört denetim anlatıyor.
