# Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?

Dürüst cevap genellikle “muhtemelen, ama denetleyemezsiniz”dır. Bu rehber, yüklemenin dosyanıza gerçekte ne yaptığını, çoğu aracın bunu neden hâlâ yaptığını ve önünüzdekinin buna mecbur olup olmadığını söyleyen dört denemeyi anlatıyor.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Çoğu dosya için, çoğu zaman, yüklemek sorun değildir. Saygın dönüştürücüler gönderdiğinizi birkaç saat içinde siler ve tatil fotoğraflarınızla ilgilenmezler.

Sorun yalan söylüyor olmaları değildir. **Söyleyip söylemediklerini anlamanızın bir yolu olmamasıdır.** Bir dosya makinenizden ayrıldığı anda, sonrasında olacaklarla ilgili her söz, güvene dayanarak kabul ettiğiniz bir sözdür: ne kadar saklandığı, ona kimin erişebildiği, silme sayacından daha uzun yaşayan bir yedeğe kopyalanıp kopyalanmadığı, şirket satılırsa ya da ihlale uğrarsa başına ne geleceği. Bunların hiçbiri dışarıdan görünmez.

Yani işe yarayan soru “bu siteye güveniyor muyum?” değildir. **“Bu işin dosyamın buradan ayrılmasına ihtiyacı var mı?”** sorusudur. Giderek artan sayıda iş için cevap hayırdır ve cevap hayır olduğunda güven sorusu, cevaplamak zorunda olduğunuz bir soru olmaktan çıkar.

## “Yükleme” aslında ne yapıyor

Bir dönüştürücü sizden bir dosya seçmenizi isteyip ardından bir ilerleme çubuğu gösterdiğinde, tarayıcınız dosyanın tamamını, baytı baytına, internet üzerinden bir başkasının sahip olduğu bir bilgisayara kopyalıyordur. O bilgisayar onu bir diske yazar, dönüşümü yapar, sonucu aynı diske yazar ve size bir bağlantı verir.

O anda dosyanız, sizin seçmediğiniz en az üç yerde bulunur: sunucunun diski, isteği kaydeden günlükler ve çoğu zaman indirme hızlı olsun diye sonucu önbelleğe almış bir içerik dağıtım ağı. Bir silme politikasının üçüne birden ulaşması gerekir. Çoğu ulaştığını söyler. Hiçbirini denetleyemezsiniz.

Bilmeye değer bir başka şey: giden tek şey dosya değildir. Dosya adı da onunla gider, dosyanın içindeki göremediğiniz her şey de. Telefondan doğrudan çıkan bir fotoğraf tipik olarak çekildiği yerin tam GPS koordinatlarını, saati, kameranın seri numarasını ve bazen siz kırpmadan önceki özgün görüntünün gömülü bir küçük resmini taşır. Resim konusunda dikkatli olan insanlar çoğu zaman bu konuda dikkatli değildir; çünkü ekranda hiçbir şey bunu onlara göstermez.

## Çoğu araç neden yine de yükleme yapıyor

Dosyalarınızı istedikleri için değil. Çünkü webin ömrünün büyük kısmında bir alternatif yoktu. Bir tarayıcı video çözemez, bir görseli seçilen bir kalitede yeniden kodlayamaz ya da bir dosya biçimini ayrıştıramazdı; FFmpeg ve ImageMagick'i olan bir sunucu yapabilirdi. Yükleme bir iş modeli değildi, işin olabileceği tek yerdi.

Bu, yakın zamanda ve sessizce doğru olmaktan çıktı. Tarayıcılar artık aynı derlenmiş kodlayıcıları yerele yakın hızda çalıştıran WebAssembly'yi, makinenizde zaten bulunan donanım video kodlayıcısını açan WebCodecs'i ve görselleri doğrudan çözüp yeniden kodlayabilen bir Canvas API'sini beraberinde getiriyor. Bir zamanlar bir sunucu gerektiren iş, artık dosyaya zaten sahip olan cihazda çalışıyor.

Bir sürü araç hâlâ yükleme yapıyor ve dürüst sebepler var: kimsenin yeniden yazmak istemediği mevcut bir hat, tarayıcı tarafında çözücüsü olmayan bir biçim, bir telefon için gerçekten fazla ağır bir iş. Bir de daha az dürüst bir sebep var: hesapların, kotaların ve ücretli kademelerin yaşadığı yer sunucudur. Tamamen tarayıcınızda çalışan bir aracı ölçmek zordur.

## Kendiniz çalıştırabileceğiniz dört denetim

Bunlar, bu araç dâhil her araçta çalışır. Hiçbiri kimsenin sözüne inanmayı gerektirmez ve ilki yaklaşık on saniye sürer.

### 1. Fişi çekin

Sayfayı yükleyin, sonra wi-fi'yi kapatın ya da kabloyu çıkarın ve kullanmayı deneyin. İşini sizin tarayıcınızda yapan bir araç tam olarak eskisi gibi devam eder. Yükleme yapan bir araç anında durur; çünkü işi yapan şeye artık ulaşılamıyordur.

Bu, var olan en güçlü denemedir ve taklit edilmesi en zorudur; çünkü kelimelerle cevaplanamaz. Dönüşüm ya ağ olmadan tamamlanır ya tamamlanmaz.

### 2. Ağ sekmesini izleyin

Tarayıcınızın geliştirici araçlarını açın, Ağ'ı seçin, sonra aracı kullanın. Sayfanın yaptığı her istek boyutuyla birlikte listelenir. 4 MB'lik fotoğrafınız yüklendiyse o listede 4 MB'lik bir istek vardır. Sayfadan çıkan en büyük şey birkaç kilobaytlık reklamsa yüklenmemiştir.

Boyuta göre sıralayın ve en üste bakın. İstekleri anlamanız gerekmez; içlerinden birinin dosyanız boyutunda olup olmadığını fark etmeniz yeterlidir.

### 3. Content-Security-Policy'yi okuyun

Sayfa kaynağını görüntüleyin ve en üstlerde `Content-Security-Policy`'yi arayın. O, sayfanın iletişim kurmasına izin verilen adreslerin listesidir ve sitenin iyi niyetiyle değil tarayıcınız tarafından zorunlu kılınır — listede olmayan bir şeye yapılan istek, kod ne denerse denesin reddedilir.

Önemli olan yönerge, sayfanın nereye veri gönderebileceğini belirleyen `connect-src`'dir. Bulunduğunuz siteye ait bir adres sayıyorsa sayfa dosyanızı oraya gönderebilir. Hiçbir şey saymıyorsa ya da yalnızca bir reklam ağı gibi üçüncü tarafları sayıyorsa gönderemez.

Hiç Content-Security-Policy'si olmayan bir sayfa kötü bir şeyin kanıtı değildir. Yalnızca bu belirli denetimin size söyleyecek bir şeyi olmadığı anlamına gelir.

### 4. Kodu okuyun

En zahmetlisi, en kesin sonuç vereni. Bir araç kaynağını yayımlıyor ve onu bir derleme adımı olmadan sunuyorsa, tarayıcınızın getirdiği dosyalar okuyabileceğiniz dosyalardır. İçlerinde `fetch`, `XMLHttpRequest` ve `sendBeacon` arayın — bir sayfanın bir şey gönderebileceği üç yol — ve onlara ne verildiğine bakın.

Çoğu insan bunu yapmayacak. Yine de yapılabilir olması önemlidir; çünkü kimsenin denetleyemediği bir iddia gerçekte bir iddia değildir.

## “Tarayıcınızda çalışır” ne demek değildir

Kesin konuşmaya değer; çünkü bu ifade gevşek kullanılıyor ve bu sitenin de önerdiği ölçüte kendini tutması gerekiyor.

- **Hiç istek yok demek değildir.** Sayfanın kendisi ağ üzerinden geldi ve ücretsiz araçların çoğu, biriyle konuşan reklam ya da ölçüm taşır. İddia, genel olarak trafik hakkında değil, *dosyanız* hakkındadır.
- **IP adresinizi gizlemez.** Ziyaret ettiğiniz her site onu görür, bu site dâhil. Yerel işleme, anonimlikle değil dosyalarınızın içeriğiyle ilgilidir.
- **Bir şey getiren bir özellikten sağ çıkmaz.** Bir web adresi yapıştırmanıza izin veren bir aracın o adresle iletişim kurması gerekir ve o sunucu IP adresinizi ve ne istediğinizi öğrenir. Bu, özelliğin bir kusuru değil doğasıdır — ama gerçek bir istisnadır ve bir araç bunu yuvarlamak yerine açıkça söylemelidir.
- **“Dosyalarınızı siliyoruz” ile aynı şey değildir.** İkinci cümle bir şirketin yapmayı seçtiği şeyle ilgilidir. Birincisi teknik olarak neyin mümkün olduğuyla. Yalnızca biri denetlenebilir.

## Yüklemenin gerçekten sorun olmadığı durumlar

Bu, her yüklemenin bir hata olduğu savı değildir. İçerik hassas değilse ve iş böyle daha kolaysa; iş gerçekten cihazınız için fazla ağırsa; biçimin tarayıcı tarafında bir çözücüsü yoksa; ya da zaten bir ilişkiniz olan ve koşullarını gerçekten okuduğunuz bir hizmeti kullanıyorsanız dosyayı gönderin.

Dosya, herkese açık paylaşmayacağınız bir şey içeriyorsa daha dikkatli olun: kimlik belgeleri, tıbbi taramalar, sözleşmeler, paylaşmayı istemediğiniz bir adres ya da yüz içeren her şey veya konum verisine bakmadığınız bir fotoğraf. Bunlar için, denetleyebileceğiniz bir aracı güvenmek zorunda olduğunuz bir araca tercih etmeye değer — güvendiğinizin size ihanet etme ihtimali yüksek olduğu için değil, denetlenebilir olanda sorunun hiç ortaya çıkmamasından dolayı.

## Bu site o dört denetime nasıl cevap veriyor

Size denetleyin deyip sonra muaf tutulmak isteyen bir rehber tuhaf olurdu. O hâlde, sırasıyla:

- **Fişi çekin.** Buradaki herhangi bir aracı açın, bağlantıyı kesin, çalışmaya devam etsin. Her araç sayfasında, şu anda çevrimiçi olup olmadığınızı söyleyen canlı bir gösterge var; böylece değiştiğini izleyebilirsiniz.
- **Ağ sekmesi.** Bir şey dönüştürün ve listeyi okuyun. Hiçbiri dosyanızı, onun bir küçük resmini, adını, boyutunu ya da içinden okunan herhangi bir şeyi taşımıyor. Bu sitede bunlardan birini gönderecek özel bir ölçüm olayı yok.
- **Content-Security-Policy.** Her sayfanın kaynağının en üstünde. `connect-src`, Google'ın reklam ve ölçüm uç noktalarını ve bağış düğmesini sayıyor, başka hiçbir şeyi değil. **O listedeki hiçbir adres bu siteye ait değil**; çünkü bu sitenin bir sunucusu yok — durağan dosyalardan ibaret. Bir şey denese bile bir dosyanın gönderilebileceği bir yer yok.
- **Kod.** Her satırı [herkese açık](https://github.com/A-Box-of-Tools/website). Derleme yorumları ve boşlukları siler, başka hiçbir şeyi değil; onu kendiniz çalıştırıp sonucu sunulanla karşılaştırabilirsiniz.

İstisnalar, gömülmek yerine açıkça söyleniyor: bu site Google reklamları ve bir ziyaret sayacı taşıyor; ikisi de Google'la konuşuyor ve hiçbirine dosyalarınız hakkında bir şey verilmiyor; ayrıca [Görsellerden Videoya](https://abox.tools/tr/resimleri-videoya-donusturme/) aracı, yapıştırdığınız bir adresten bir görsel getirebiliyor ki bu da o sunucunun IP adresinizi gördüğü anlamına geliyor. [Gizlilik sayfası](https://abox.tools/tr/gizlilik/) ikisini de eksiksiz anlatıyor.

Buradaki her araç böyle çalışıyor: söylediğiniz boyutu tutturan bir [görsel sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/), bir [video kırpıcı](https://abox.tools/tr/video-kirpma/), bu sayfanın yukarısında anlatılan gizli veri için bir [EXIF görüntüleyici ve silici](https://abox.tools/tr/exif-verisi-silme/), [görsellerden videoya](https://abox.tools/tr/resimleri-videoya-donusturme/) ve [görsellerden PDF'e](https://abox.tools/tr/resimleri-pdfe-donusturme/). Hepsi ücretsiz, hesap yok ve hiçbirinin dosyalarınızı gönderecek bir yeri yok.

![Bir araç sayfasındaki pano: dosyaların tarayıcıdan hiç çıkmadığını söyleyen bir satır, bunu dayandıran veriler ve sayfanın hiçbir ağ isteği yapmadığını bildiren canlı bir denetim.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

Dört denetimin sonuncusu, bir paragrafta değil sayfanın kendisinde yanıtlanmış: sayımı sayfa kendisi hakkında yapıyor ve aynı sayımı kendi tarayıcınızda siz de yapabilirsiniz.
