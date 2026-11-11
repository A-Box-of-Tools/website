# Bir resim tam olarak istenen dosya boyutuna nasıl sıkıştırılır

Biri size bir sayı söyledi — 100 KB, 500 KB, 2 MB — fotoğrafınız ise ona yakın bile değil. Bu rehber, o sayının neye mal olduğunu, onu neye harcayacağınızı ve sonucun göndermeye yetecek kadar iyi olup olmadığını nasıl anlayacağınızı anlatıyor.

[Görsel Sıkıştırıcı aracını açın](https://abox.tools/tr/resim-sikistirma/): Boyutu siz söyleyin, gerisini o hesaplasın.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/)'yı açın, fotoğrafı bırakın, size verilen sayıyı yazın ve düğmeye basın. Araç resmi birkaç kez kodlar, hedefinizin altına sığan en iyi sonucu tutar ve bunun neye mal olduğunu söyler. Çoğu fotoğraf ve çoğu hedef için dürüst özet şudur: aradaki farkı göremeyeceksiniz.

Bu sayfanın geri kalanı, bu olmadığında içindir: sonuç yumuşak göründüğünde, bir PNG neredeyse hiç kıpırdamadığında ya da resminizi birine göndermeden önce aracın ona tam olarak ne yaptığını bilmek istediğinizde.

![Hedef kartı: 200 kB yazılmış, yaygın sınırlar için düğmeler, bir biçim menüsü ve aracın ne deneyeceğini söyleyen bir not.](https://abox.tools/screens/compress-an-image-to-a-target-size/target.webp)

Size verilen sayıyı yazın. Altındaki her şey, sizin bir kalite kaydıracında tahmin yürütmeniz yerine, aracın o sayıya doğru çalışmasıdır.

## Bir dosya boyutu sınırı aslında ne istiyor

Bir JPEG ya da bir WebP fotoğrafınızı saklamaz. Onun bir tarifini saklar ve kalite ayarı, bu tarifin ne kadar ayrıntılı olabileceğine karar verir. Ayarı düşürün, dosya küçülür; çünkü tarif belirsizleşir: ince doku ortalanıp gider, renk geçişleri bantlanır ve kenarlar hafif bir blok halesi kapar.

Yani bir boyut sınırı, ayrıntı için bir bütçedir. İşe yarayan soru “500 KB'yi tutturabilir miyim” değil — her sayıyı her zaman tutturabilirsiniz — “oraya varmak için resmin ne kadarından vazgeçmem gerekiyor ve bu, onunla yapacağım iş için önemli mi?” sorusudur.

İki kaba kural. Gerçek bir sahnenin fotoğrafı — yüzler, yapraklar, kumaş — sıkıştırmayı iyi gizler; çünkü gözün hasarı fark edeceği kusursuzca düz bir alan yoktur. Bir ekran görüntüsü, bir grafik, bir logo ya da geniş düz renkleri ve sert metin kenarları olan her şey ise bunu hemen gösterir ve genellikle JPEG olmak yerine PNG ya da WebP olmalıdır.

## Neden bir formül yok ve bu konuda ne yapmalı

500 KB'lik bir dosya üreten kalite ayarını hesaplamanın bir yolu yoktur. İkisi arasındaki ilişki tamamen resmin içindekine bağlıdır: aynı ayarda, düz bir duvarın fotoğrafı bir ormanın fotoğrafının onda biri boyutunda çıkabilir. Size “kalite: 60” önerip umut eden her araç, sizin adınıza tahmin yürütüyordur.

Tek güvenilir yöntem denemektir. Görseli kodla, boyuta bak, ayarla, yeniden kodla. Bunu elle yapmak yorucudur; sıkıştırıcıların bunun yerine bir kalite sayısı istemesinin sebebi de budur — yorgunluğu size aktarır. Otomatik yapmak kabaca sekiz kodlamadır ve bir telefon fotoğrafının sekiz kodlaması, bu on yılda yapılmış herhangi bir makinede saniyenin küçük bir kısmıdır; bu sitedeki aracın boyutu isteyip aramayı kendisi yapmasının sebebi de budur.

Bildirdiği her boyut bir tahmin değil, gerçekten kodlanmış bir dosyadır. Bir formun katı bir sınırı olduğunda bu önemlidir: %2 iyimser bir tahmin, reddedilmiş bir yükleme demektir.

## Piksel harcamadan önce kalite harcayın

Bir görsel dosyasını küçültmenin yalnızca iki yolu vardır. Aynı resmi daha az hassas tarif edebilirsiniz ki bu kalitedir. Ya da daha az piksel tarif edebilirsiniz ki bu boyutlandırmadır. Bunlar denk değildir ve sıra önemlidir.

Kalite önce gelir; çünkü kalite düşüşünün ilk %30 kadarı bir fotoğrafta gerçekten görünmezdir — biçimin, hiçbir gözün denetleyemeyeceği kadar özenle sakladığı ayrıntıyı atıyorsunuzdur. Pikseller sonra gelir; çünkü kalite bozulmaların görüneceği kadar düştüğünde, makul kalitede küçük bir resim, mahvedilmiş tam boyutlu bir resimden iyi görünür. Az sayıda iyi piksel, çok sayıda kötü pikseli yener.

Bütün strateji budur ve başka bir araç kullansanız bile bilmeye değer: kaliteyi yanlış görünmeye başlayana kadar düşürün, sonra daha da düşürmek yerine resmi küçültün.

### Bilerek ne zaman boyutlandırmalı

Bazen o piksellere zaten hiç ihtiyaç yoktu. Bir web sayfasında 600 piksel genişliğinde bir sütunda gösterilen 4000 piksel genişliğindeki bir fotoğraf, kimsenin göreceğinin altı katı ayrıntı taşıyor demektir. Resmin son yerini biliyorsanız önce ona göre boyutlandırın; boyut sorunu çoğu zaman hiç kalite harcanmadan ortadan kalkar. Bu iş için araç [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/)'dır ve boyut seçmeyi [kendi rehberi](https://abox.tools/tr/rehberler/resim-boyutlandirma/) anlatıyor.

## Biçim seçmek

Bilmeye değer üç biçim var ve tarayıcılar üçünü de yazabiliyor.

- **JPEG** fotoğraflar içindir. Kayıplıdır, şimdiye kadar yapılmış her şey tarafından anlaşılır ve gerçek bir sahnenin resmi için hâlâ mükemmel bir seçimdir. Saydamlık saklayamaz.
- **WebP** aynı işi daha iyi yapar: ayırt edemeyeceğiniz bir kalitede JPEG'den kabaca %⁦25–35⁩ daha küçüktür ve saydamlığı korur. Güncel her tarayıcı onu okur. Birkaç eski masaüstü uygulaması ve bazı kurumsal yükleme formları hâlâ okumuyor; onu kullanmamak için tek gerçek sebep de budur.
- **PNG** kayıpsızdır; yani tamdır ve büyüktür. Ekran görüntüleri, logolar, çizgi çalışmaları ve keskin kenarları ya da düz rengi olan her şey için doğru, bir fotoğraf için yanlış cevaptır.

Dosyayı isteyen taraftan gelen bir kısıt yoksa WebP sizi bir hedefe JPEG'den daha az görünür hasarla götürür. Dosya eski bir şeyin ya da deneyemeyeceğiniz bir sistemin içine gidiyorsa güvenli cevap JPEG'dir.

## PNG'niz neden pek küçülmeyecek

Bu, en sık karşılaşılan sürprizdir ve kullandığınız araçtaki bir hata değildir. PNG kayıpsız bir biçimdir: pikselleri tam olarak saklar ve çevrilecek bir kalite düğmesi yoktur; çünkü birini çevirmek onu başka bir biçim yapardı. Bir PNG sıkıştırıcısının yapabileceği tek şey aynı pikselleri daha akıllıca paketlemektir ki bu genellikle yüzde birkaç eder.

Yani çok daha küçük bir dosyanız olması ve dosyanın PNG kalması gerekiyorsa geriye kalan tek kol boyuttur — daha az piksel ya da daha az renk. PNG olmaktan çıkabilecekse, soru içinde ne olduğudur:

- **PNG olarak kaydedilmiş bir fotoğraf.** Çok yaygın, genellikle kazara ve bu sayfadaki en kolay kazanç: JPEG veya WebP'ye çevirmek çoğu zaman onu görünür bir değişiklik olmadan beş ila on kat küçültür.
- **Bir ekran görüntüsü ya da bir şema.** WebP'ye çevirin; o da istediğinizde kayıpsızdır ve aynı pikseller için genellikle PNG'den küçüktür. JPEG'e gitmek metin kenarlarını bulandırır.
- **Saydamlığı olan bir logo.** WebP saydamlığı korur; JPEG onu düz bir renkle doldurur ki bu neredeyse hiçbir zaman istediğiniz şey değildir.

## Sonucun yeterince iyi olup olmadığını nasıl anlarsınız

Bir küçük resme bakmak hiçbir şey kanıtlamaz — küçük resim boyutunda her şey iyi görünür. Daha iyi iki denetim:

**Tam boyutta ve karedeki en düz şeye bakın.** Gökyüzü, ten, boyalı bir duvar. Sıkıştırma hasarı, ayrıntılı alanlara dokunmadan çok önce, önce yumuşak geçişlerde silik bloklar ya da bantlar olarak ortaya çıkar.

**Araç size bir ölçüm veriyorsa onu okuyun.** Buradaki sıkıştırıcı kendi sonucunu yeniden çözüp özgün hâliyle karşılaştırır ve SSIM bildirir: değişen piksel saymak yerine yerel parlaklığı, karşıtlığı ve yapıyı karşılaştıran bir sayı; gözün itiraz ettiği şeye çok daha yakın. Kabaca 0,98'in üstünde iki resim yan yana bile ayırt edilemez. Yaklaşık 0,95'in altında, göndermeden önce bakın. Tercih edenler için geleneksel desibel rakamı olan PSNR de bildirilir.

İkisi de kendi makinenizde hesaplanır ve size gösterilir; onları bulundurmanın amacı da budur: “asgari kalite kaybı”nı bir iddia olmaktan çıkarıp denetleyebileceğiniz bir sayıya çevirir.

![Bir sonuç satırı: özgün dosya 1,4 MB, sıkıştırılmış kopya 196 kB, oraya ulaşan kalite ve ikisini karşılaştırmak için bir bağlantı.](https://abox.tools/screens/compress-an-image-to-a-target-size/results.webp)

Gerçekte ne çıktığı, ne girdiğinin yanında. Karşılaştırma bağlantısı, o sayının size görünür bir şeye mal olup olmadığını öğrenme yoludur.

## Dosyayı göndermeden önce bilmeye değer üç şey

**Sıkıştırmak üstveriyi siler.** Yeniden kodlamak, resmi piksellere çözüp o pikselleri yeniden kodlamak demektir ve piksellerle dolu bir tuval hiçbir etiket taşımaz — yani GPS konumu, kamera modeli, zaman damgaları ve gerisi yeni dosyaya yazılmaz. Genellikle bu bir kazançtır. Etiketlerin gitmesini ama resmin el değmemiş kalmasını istiyorsanız, o başka bir iştir: [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/) kabı hiçbir şeyi yeniden sıkıştırmadan yeniden yazar ve içinde ne olduğunu [kendi rehberi](https://abox.tools/tr/rehberler/exif-ve-gps-verisini-silme/) anlatıyor.

**Aynı dosyayı asla iki kez sıkıştırmayın.** Her kayıplı kodlama ayrıntıyı kalıcı olarak atar ve zaten sıkıştırılmış bir resmi kodlamak daha fazlasını atar — buna ilk geçişten kalan bozulmalar da dâhildir; onları gerçek ayrıntı pahasına sadakatle korur. Her zaman özgün dosyaya dönün ve bir kez sıkıştırın.

**Özgün dosyayı saklayın.** Kayıplı bir kodlamadan geri dönüş yoktur. Ne gönderirseniz gönderin, başladığınız dosyayı bir yerde saklayın.

## Bunların hiçbirinin bir yüklemeye ihtiyacı yok

Her tarayıcı yıllardır bir JPEG, PNG ve WebP kodlayıcıyla geliyor — bir resmi bir tuvalden kaydeden kodun aynısı. Bir görseli sıkıştırmak, bir sunucunun karışmasını gerektiren hiçbir teknik sebebi olmayan işlerden biridir; buradaki aracın bir sunucusu olmamasının sebebi de budur: resim kendi makinenizde çözülür, kodlanır ve ölçülür ve sayfanın `Content-Security-Policy`'sinde onun gönderilebileceği, bu siteye ait bir adres yoktur.

Bunu ister burada ister başka bir yerde doğrulamanın en basit yolu sayfayı yüklemek, internet bağlantısını kesmek ve yine de bir şey sıkıştırmaktır. Hâlâ çalışıyorsa hiçbir şey yüklenmiyordu. [Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) buna benzer üç denetim daha anlatıyor.
