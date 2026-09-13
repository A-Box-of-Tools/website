# Bir video başka bir şekle nasıl kırpılır

Kırpmak resmin şeklini değiştirir; bu da yeni kareler yazmak demektir — bunun etrafından dolaşmanın bir yolu yok ve aksini iddia eden her araç başka bir şey yapıyordur. Bu rehber bunun bedelini ve o bedeli iyi harcamayı anlatıyor.

[Video Kırpıcı aracını açın](https://abox.tools/tr/video-kirpma/): Bir klibi asıl önemli olan kısma indirin.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Video Kırpıcı](https://abox.tools/tr/video-kirpma/)'yı açın, klibi bırakın, kutuyu tutmak istediğiniz kısmın üzerine sürükleyin — size bir şekil verildiyse ona kilitleyin — ve dışa aktarın. Çıkan klip, giren kadar uzundur; zamanlaması ve sesi el değmemiştir.

Kesmenin aksine bu iş yeni kareler yazmak zorundadır. Bu, herhangi bir aracın eksikliği değildir; kırpmanın kendisi budur. Bu sayfanın geri kalanı bunun neye mal olduğu ve bedeli küçük tutmakla ilgili.

## Kırpmak neden yeniden kodlamaktan kaçamaz

Bir kesme kareleri bütün hâlde tutar; yani iyi bir kesici onları el değdirmeden karşıya taşır ve hiçbir şey çözülmez. Bir kırpma ise her karenin bir kısmını tutar — ve bir karenin bir kısmı başka bir resimdir. Başka bir resmi, pikselleri baştan yazmadan saklamanın yolu yoktur.

Dar bir istisna var ve birinin bunu iddia ettiğini tanıyabilmeniz için bilmeye değer. Video bloklar hâlinde kodlanır ve bir kırpma dört kenarda da tam blok sınırlarına denk gelseydi verinin bir kısmı ilkesel olarak yeniden kullanılabilirdi. Pratikte karenin kendi boyutları, hareket vektörleri ve kestirimi yine de yeniden yazılmak zorundadır; yani gerçekte hiçbir şey böyle kurulmaz. Bir kırpmanın yeniden kodlama demek olduğunu varsayın.

İyi davranan bir kırpıcının yapacağı şey, aynı alana özgün dosyanın harcadığından *fazlasını* harcamamaktır. Kırpılmış bir bölgeyi kaynağından yüksek bir bit hızında kodlamak yalnızca dosyayı büyütür; özgün dosyada olmayan ayrıntıyı geri koyamaz.

![Dışa aktarma kartı: bir biçim menüsü, bir kalite kaydıracı, sesi koruma anahtarı ve çıktı boyutunu, kadrajın ne kadarının kaldığını ve süreyi veren bir özet.](https://abox.tools/screens/crop-a-video/export.webp)

Bu kart, görüntünün yeniden kodlanması gerektiği için var. Özet, aracın bunu yapmadan önce bedelini söylemesidir.

## Aslında sizden istenen şekiller

Kırpmanın çoğu, bir yerin zorunlu bir en boy oranı olduğu için yapılır. Kısa liste:

- **9:16 — uzun.** Hikâyeler, reels, shorts, TikTok. Normal tutulan bir telefonda tam ekran. Birinin bir videoyu kırpmasının en yaygın sebebi.
- **1:1 — kare.** Birkaç platformda akış gönderileri. İzleyen kişi telefonunu hangi yönde tutarsa tutsun çalışır; varlığını sürdürmesinin sebebi de budur.
- **4:5 — hafif uzun.** Bazı akışların izin verdiği en büyük şekil; yani tam dikey bir video olmadan ekranın kareden fazlasını kaplar.
- **16:9 — geniş.** Genel olarak videonun standardı. Buna *doğru* kırpmayı genellikle yalnızca siyah bantları kaldırmak için, bundan *çıkarak* kırpmayı da yukarıdakilerden birine ulaşmak için yaparsınız.

Kutuyu göz kararı sürüklemek yerine orana kilitleyin. Birkaç piksel şaşmak, platformun sizin kırpmanızı kırpması demektir ve nereden kırpacağını size danışmaz.

![Kırpma kartı: ortasında kare bir çerçeve bulunan bir video karesi ve sol, üst, genişlik ile yükseklik veren sayı alanları.](https://abox.tools/screens/crop-a-video/box.webp)

Çerçeve sürüklenir ya da yazılır, sayılar da tam olarak neyin kalacağını söyler. Geniş bir klipten kare bir parça, en sık gelen istektir.

## Yatay bir klibi dikeye çevirmek

Bu, en zor yaygın durumdur ve kırpmanın bir çözüm değil bir uzlaşma olduğunu açıkça söylemeye değer.

9:16'ya kırpılmış bir 16:9 videosu, resim genişliğinin yaklaşık %32'sini korur. Yanlarda ne varsa gitmiştir — ve yatay bir çekimde bağlam genellikle yanlardadır. İki kişi karenin karşıt yanlarında konuşuyorsa hiçbir tek kırpma ikisini birden tutmaz.

Kırpmayı, klibi bir kez izleyip öznenin çoğu zaman gerçekte nerede olduğunu sorarak seçin. Cevap “yer değiştiriyor” ise durağan bir kırpma yanlış araçtır ve istediğiniz şey, kırpmayı zaman içinde kaydırabilen bir düzenleyicidir. Cevap “çoğunlukla ortada” ise ortalanmış bir kırpma gayet iyidir ve on saniye sürer.

Hatırlamaya değer alternatif: birçok platform yatay bir videoyu kabul edip siyah bantları kendisi ekler. Kırpma, videonun kabul edilmesini istediğiniz için değil, tam ekranı istediğiniz zaman içindir.

## Genişlik ve yükseklik neden ikişer ikişer değişiyor

Kırpma kutusunun tek sayıları reddettiğini fark ettiyseniz, zorluk çıkaran arayüz değil kodlayıcıdır.

Bir MP4'ün içindeki kodlayıcı olan H.264, rengi yatayda ve dikeyde yarı çözünürlükte saklar; çünkü göz, renk ayrıntısına parlaklığa olduğundan çok daha az duyarlıdır. Bu, resmin iki piksellik birimler hâlinde ele alındığı ve bir kenarında tek sayıda piksel olan bir kareyi tarif etmenin bir yolu olmadığı anlamına gelir.

Araçlar bunu, siz kırpmayı ayarladıktan sonra yuvarlayarak — ki bu kutunuzu size söylemeden bir piksel oynatır — ya da en baştan yalnızca çift sayılar sunarak çözer. Burada olan ikincisidir.

## Sese ne oluyor

MP4 yolunda hiçbir şey. Kırpmak resmi değiştirir ve sese dokunmak için bir sebebi yoktur; yani ses hiç çözülmeden örnek örnek karşıya kopyalanır — dosyada ne varsa baytı baytına aynısı.

Aşağıda anlatılan kayıt yedeğinde ise ses, oynatımdan yakalanır ve yeniden kodlanır; bu da bir parça kaliteye mal olur. Her hâlükârda sesi tamamen dışarıda bırakan bir onay kutusu var; klip zaten sessiz oynatılan bir yere gidiyorsa ve en küçük dosyayı istiyorsanız kullanmaya değer.

## Biçimler ve ne kadar sürdüğü

**MP4, M4V ve MOV**, tarayıcınız o kodlayıcıyı çözebildiği sürece içlerinde ne olursa olsun — H.264, HEVC, AV1 ya da VP9 — doğrudan okunur. Kesmenin aksine kırpmak çözmek zorundadır; yani kodlayıcı burada, orada olmadığı biçimde önemlidir.

**Tarayıcınızın oynatabildiği başka her şey**, en bilineni WebM, oynatılıp sonuç kaydedilerek kırpılır; bu yöntem çalışır ve klip ne kadar uzunsa o kadar sürer.

**AVI, WMV, FLV ve çoğu MKV**'yi tarayıcı ne okuyabilir ne oynatabilir; araç da yarı yolda çuvallamak yerine bir iletiyle reddeder.

Uzun bir klipte bir kırpmanın gerçek zaman almasını bekleyin; çünkü her kare çözülüyor ve yeniden kodlanıyor. Araca yerleşik bir sınır yok ve dosya bütünüyle yüklenmek yerine birkaç megabaytlık parçalar hâlinde geçiliyor; pratikteki tavan, siz indirmeden önce bellekte bir araya getirilen bitmiş videodur.

## Her şeyden önce kesin, sonra kırpın

Bir klibin hem kesilmesi hem kırpılması gerekiyorsa önce kesin — bedavadır ve kestiğiniz her saniye, kimsenin yeniden kodlamak zorunda olmadığı bir saniyedir. Sonra kısalmış klibi bir kez kırpın.

Tersini yapmak, birazdan atacağınız görüntüyü kırpmak demektir; bu da hiç yoktan zaman ve kalite harcar. [Video Kesici](https://abox.tools/tr/video-kesme/) hemen yanı başınızda ve o adımın size neden hiçbir şeye mal olması gerekmediğini [kendi rehberi](https://abox.tools/tr/rehberler/video-kesme/) anlatıyor.

Daha genel olarak: her kayıplı adım üst üste biner. Özgün bir dosyanın bir kırpması bir kuşaktır. Bir indirmenin bir dışa aktarımının bir kesmesinin bir kırpması dört kuşaktır ve öyle de görünür.

## Bunun neden bir yüklemeye ihtiyacı yok

Bir tarayıcıda video çözüp yeniden kodlamak yenidir ve gerçektir: WebCodecs, telefonunuzun video kaydetmek için kullandığı donanım kodlayıcısının aynısını açar ve aynı sebeple hızlıdır. İş, dosyaya zaten sahip olan makinede olur ki gigabaytlarca büyüklükteki bir video için anlamı olan tek düzen de budur — onu yükleyip sonucu indirmek, kodlamanın kendisinden fazla zaman alır.

Buradaki aracın hiçbir türde ağ özelliği yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Size söylenmesindense denetlemeyi tercih ederseniz internet bağlantısını kesin ve yine de bir klip kırpın.

[Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) herhangi bir araçta çalıştırabileceğiniz üç denetim daha anlatıyor.
