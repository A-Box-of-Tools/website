# Ses kalite kaybetmeden nasıl kesilir

Bir ses kesmesi, her oynatıcıda, her zaman, işaretlediğiniz tam ana düşebilir — ki bu video için doğru değildir. Bu rehber bunun sebebini, tek gerçek püf noktasını ve bu konuda ne yapacağınızı anlatıyor.

[Ses Kesici aracını açın](https://abox.tools/tr/ses-kesme/): Tutmaya değer parçaları oynarken işaretleyin. Onları tek dosya olarak, tam söylediğiniz yerden kesilmiş hâlde geri alın.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Ses Kesici](https://abox.tools/tr/ses-kesme/)'yi açın, kaydı bırakın, istediğiniz her parçayı işaretlemek için `I` ve `O`'ya basın — kaç tane isterseniz — ve dışa aktarın. Her kesme işaretlediğiniz tam örneğe düşer, tutulan örnekler girdikleri gibi çıkar ve birleşme yerleri tıklayamasınlar diye beş milisaniyelik bir geçiş alır.

İşin tamamı bu. Bu sayfanın geri kalanı, tamlığın bir pazarlama iddiası değil gerçek olmasının sebebi ve iki ses parçasını birleştirdiğinizde gerçekten ters giden tek şeyle ilgili.

## Bir video kesmesi olamazken bir ses kesmesi neden tam olabilir

Video, eksiksiz resimlerden oluşan bir dizi olarak saklanmaz — bu devasa olurdu. Karelerin çoğu, komşularından nasıl farklı olduklarının bir tarifi olarak saklanır, yani kendi başlarına çözülemezler. Yalnızca bir **anahtar kare** tek başına durur ve anahtar kareler tipik olarak bir ila on saniye arayla bulunur. Bu yüzden kareleri kopyalayan bir kesici istediğiniz yerden başlayamaz: bir anahtar kareden başlamak zorundadır; kesilmiş bir videonun bazen işaretinizden bir iki saniye önce başlamasının sebebi de budur. [Video rehberi](https://abox.tools/tr/rehberler/video-kesme/) büyük ölçüde bunu anlatıyor.

Sesin bir dengi yoktur. Bir kayıt bir kez çözüldüğünde bir sayılar dizisidir — kanal başına bir tane, saniyede on binlerce — ve her biri tamamen kendi başına durur. 1.234.567. örneğin anlamlı olmak için 1.234.566. örneğe ihtiyacı yoktur. Yani kesme herhangi bir örnekte yapılabilir ve "tam olarak işaretlediğiniz yer" tam olarak bunu ifade eder: saniye cinsinden işaretiniz, örnekleme hızıyla çarpılıp en yakın tam örneğe yuvarlanır. 48 kHz'de bu yuvarlama en fazla on mikrosaniyedir.

Endişelenecek, oynatıcıya bağlı bir davranış da yoktur. Kesilmiş bir video, çoğu oynatıcının uyduğu ve bazılarının yok saydığı bir düzenleme işaretine dayanır; kesilmiş bir WAV ise yalnızca örneklerdir, yani bir oynatıcının anlaşmazlığa düşeceği bir şey kalmaz.

## Püf noktası: bir birleşme yeri bir süreksizliktir

Ses keserken gerçekten ters giden şey ve iyi bir kesicinin bunun için bir ayarı olmasının sebebi burada.

Ses bir dalgadır. Bir kelimenin ortasından başka bir kelimenin ortasına kestiğinizde, birinci parçanın sonundaki örnekle ikincinin başındaki örneğin hiç ilişkisi yoktur: dalga biçimi tek bir örnekte aralığının tepesine yakın bir yerden dibine yakın bir yere sıçrayabilir. Bu sıçramayı yapması istenen bir hoparlör konisi, yapabildiği en keskin sesi çıkarır; siz de bunu birleşme yerinde bir **tık** olarak duyarsınız.

Bunun kalite kaybıyla ya da biçimle hiç ilgisi yoktur. Kusursuzca temiz bir kaydın kusursuzca kayıpsız bir kesmesinde de olur. Düpedüz bir süreksizliğin sesidir. Tam örnekte kesip başka bir şey yapmayan bir kesici, tamamen dalga biçiminde iki ucun nereye denk geldiğine bağlı olarak bazı birleşme yerlerinde tıklar, bazılarında tıklamaz.

## Beş milisaniyelik bir geçiş gerçekte ne yapıyor

Çözüm, kesmeden hemen önce düzeyi sessizliğe indirmek ve hemen sonra geri yükseltmektir; böylece yapılacak bir sıçrama kalmaz. Buradaki “geçiş”in tamamı budur: her kenarda birkaç yüz örneğe uygulanan bir rampa.

Uzunluk, ilginç kısmıdır. Beş milisaniye, 48 kHz'de yaklaşık iki yüz kırk örnektir. Bu, koninin yol alması için yeterince uzun — tık tamamen gitmiş olur — ve bir geçiş olarak duyulamayacak kadar kısadır: beş milisaniye, kabaca tek bir ünsüzü söylemenin beşte biri kadar zamandır. Düzeyin oynadığını algılamazsınız. Yalnızca birleşme yerinin temiz olduğunu algılarsınız.

Daha uzun geçişler sunuluyor; çünkü bazı malzemeler onları ister. Kesintiye uğrayan şeyin bir hece değil sürdürülen bir nota olduğu ve en kısa rampanın bile duyulabilir bir pat bırakabildiği müzik birleştirirken yirmi ya da elli milisaniyeye uzanmaya değer. Konuşma neredeyse hiçbir zaman beşten fazlasını istemez.

Bir geçiş, yalnızca *gerçekten* bir kesme olan bir kenara aittir. Bir parça kaydın en başında başlıyorsa önünden hiçbir şey kaldırılmamıştır — dosya, herhangi bir şey kesilmeden önce de orada başlıyordu — yani onu geçişle açmak, kimsenin istemediği bir düzenleme olurdu. Buradaki araç geçişleri yalnızca bir birleşme yerinin bulunduğu yerlere koyar; hiçbir şey kesmemenin her örneği el değmemiş bırakmasının sebebi de budur.

![Dışa aktarma kartı: bir bit derinliği menüsü, milisaniye cinsinden bir geçiş uzunluğu ve parçaları, ekleri ve süreyi sayan bir özet.](https://abox.tools/screens/trim-an-audio-file/export.webp)

Geçiş yalnızca bir ekte uygulanır ve önemli olan ayrıntı budur: bir kaydın başındaki geçiş, kimsenin istemediği bir değişiklik olurdu.

## Bir MP3'ü kesmek ve çıkan şeyin neden WAV olduğu

Bir MP3, bir M4A, bir Ogg ya da bir Opus dosyası açıp kesebilirsiniz. Geri gelen şey bir WAV'dır ve bunu bir özellik gibi sunmak yerine temsil ettiği takas konusunda açık olmaya değer.

Sıkıştırılmış sesi kesmenin iki yolu var. Biri, sıkıştırılmış veriyi doğrudan kesmek; kodlanmış kareleri çözmeden bütün hâlde yeni bir dosyaya taşımak. Bu dosyayı küçük tutar ve kaliteye mal olmaz — ama bir MP3 karesi yaklaşık yirmi altı milisaniye uzunluğundadır, yani her kesme en yakın kare sınırına yuvarlanır ki bu, anahtar kare sorununun ses sürümüdür. Ayrıca biçime özgü bir iştir: bir MP3 okuyucusu hiçbir Opus dosyasını kesmez.

Öbür yol, çözmek, tam örnekte kesmek ve örnekleri yazmaktır. Hiçbir şey yuvarlanmaz, tarayıcının oynatabildiği her biçim aynı şekilde çalışır ve geçişler ancak böyle mümkün olur — çözmediğiniz bir düzeye rampa uygulayamazsınız. Bedeli, örneklerin bir biçimde geri yazılması gerekmesidir ve hiçbir tarayıcı burada kullanılabilecek bir MP3 ya da AAC kodlayıcısıyla gelmez. Bir WAV kodlayıcı istemez: önünde kısa bir başlık olan örneklerdir, yani o adım hiçbir şey kaybettiremez.

Pratikteki sonuçlar: çıkan şey girenden çok daha büyüktür — stereoda kabaca dakikada on megabayt — ve geldiği MP3'ten *daha iyi* değildir; çünkü çoktan olmuş sıkıştırma geri alınamaz. Bir WAV'ı her şey açar ve MP3'e ihtiyacı olan her şey ondan tek adımda bir tane yapabilir.

## Bir seferde birkaç parça işaretlemek

Çevrimiçi kesicilerin çoğu size tek bir tutamaç çifti verir ve hangi tek parçayı tutacağınızı sorar. Bu, gerçek kayıtların çoğu için yanlış soruyu cevaplar. Bir saatlik bir röportajın tek bir iyi kısmı yoktur; araya serpilmiş altı kısmı vardır ve onları bir kez dinleyerek bulursunuz.

O yüzden dinlerken işaretleyin: bir parça başladığında `I`, bittiğinde `O`, istediğiniz kadar. Her çift, süresini değiştirebileceğiniz ya da yeniden sıralayabileceğiniz bir satıra ve dalga biçiminin üstüne çizilmiş bir banda dönüşür. Bitmiş dosya, o satırların sırayla birleştirilmiş hâlidir.

Aynı işaret listesi ters soruyu da cevaplar. Gitmesini istediğiniz şey "eee"ler, çalan telefon ve yanlış başlangıçlarsa *onları* işaretleyin ve “bunları kesip çıkar”a geçin — bunun yerine işaretlemediğiniz her şey birleştirilsin. Her iki durumda da aynı işaretler olduğu için ikisi arasında gidip gelebilir ve hiçbir şeyi iki kez işaretlemeden bitmiş uzunluğun değiştiğini izleyebilirsiniz.

İşaretlemek özenli bir iştir ve kapanan bir sekme buna mal olmamalıdır; bu yüzden işaretler düz bir metin dosyası olarak kaydedilir ve geri yüklenir. Düzen, [video kesicinin](https://abox.tools/tr/video-kesme/) yazdığı düzendir; yani bir videoya karşı yapılmış işaretler onun çıkarılmış sesinin üstüne bırakılabilir ve tersi de geçerlidir.

## Dalga biçimine bakın

Sesi ileri geri sararak işaretlemek tahmin işidir; gözle işaretlemek değildir. Sessizlik sessizliğe benzer, bir öksürük öksürüğe benzer ve biri konuşmaya başlamadan önceki dört saniyelik oda tonu, aranıp bulunmak yerine anında görünür.

Bu en çok, insanların biraz yanlış yaptığı işaretler için önemlidir: bir cümlenin başlangıcı genellikle nefesten *önceki* sessizlikte durmak ister, sonrasında değil; ve sonu genellikle son ünsüzde bir kesme değil bir tempoluk oda tonu ister. İkisi de resimde apaçıktır ve yalnızca kulakla tutturmak neredeyse imkânsızdır. İşaretlenmiş bir parçanın uçlarını dalga biçimi boyunca sürükleyerek oynatın.

![İki bölümün işaretlendiği bir dalga biçimi, cümleler arasındaki boşluklar açıkça görünür ve her bölümün başlangıcını, bitişini ve süresini veren bir tablo.](https://abox.tools/screens/trim-an-audio-file/marks.webp)

Boşluklar, birinin konuşmayı kestiği yerlerdir. Bir dalga biçimini kronometreden farklı olarak bakmaya değer kılan şey budur.

## Kesmek geçiş yapmak değildir ve düzenlemek de değildir

Birbirinin yerine kullanılan üç kelime. Kesmek, kaydın hangi kısımlarının hayatta kalacağını değiştirir. Bir geçiş — saniyeler süren, müzikteki türü — düzey üzerinde bilinçli bir etkidir ve yukarıda anlatılan birkaç milisaniye o değildir; onlar, tesadüfen aynı aritmetiği kullanan bir tık temizliğidir.

İstediğiniz şey kaydın geriye doğru oynatılması, hızlandırılması, perdesi oynamadan yavaşlatılması ya da fazla kısık kaydedildiği için yükseltilmesiyse, o [Ses Düzenleyici](https://abox.tools/tr/ses-duzenleme/)'dir. Aynı çözücü ve aynı WAV yazıcıdır; yalnızca arada başka bir aritmetik yapar.

## Bunun neden bir yüklemeye ihtiyacı yok

Kesmek, bir dizi üzerinde bir aritmetiktir. Tarayıcının zaten bir çözücüsü var — dosyayı bir `<audio>` öğesinde oynatan çözücünün aynısı — ve örnekler bir kez çözüldüğünde bazılarını tutup gerisini düşürmek bir kopyalamadır. Bu tarifin içinde bir sunucunun daha iyi yapabileceği hiçbir adım yoktur ve bir sunucuya gidiş dönüş, bütün işin en yavaş kısmı olurdu.

Ayrıca yüklemenin insanların sandığından pahalıya patladığı bir dosya türüdür. Kayıtlar seslerdir: röportajlar, dersler, aramalar, sesli notlar, terapi oturumları, bir çocuğun saklamak istediğiniz bir sözü. Buradaki aracın hiçbir türde ağ özelliği yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir.

Size söylenmesindense denetlemeyi tercih ederseniz internet bağlantısını kesin ve yine de bir kayıt kesin. [Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) buna benzer üç denetim daha anlatıyor.
