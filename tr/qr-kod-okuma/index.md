# QR ve Barkod Okuyucu — bir görselden ya da kameranızdan QR kod okuyun

Bir koda doğrultun ya da onun bir resmini bırakın. Burada okunur, başka hiçbir yerde.

> Bir fotoğraftan, ekran görüntüsünden ya da kameranızdan QR kod okuyun ve bağlantının nereye gittiğini açmadan önce tam olarak görün. EAN, UPC, Code 128, Code 39 ve ITF barkodları da. Hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/qr-kod-okuma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## resimleriniz ve içlerindeki kodlar **asla yüklenmez**. Sunucu yoktur.

Bir kodu okumak, pikseller üzerinde yapılan bir hesaptır ve pikseller zaten burada. Simgeyi bulmak, açıyı düzeltmek, maskeyi geri almak, hasarı Reed-Solomon ile onarmak ve bitleri geri okumak; hepsi bu sayfada, okuyabileceğiniz yaklaşık iki bin satırlık JavaScript içinde olur. **Kamera, bu sözün bir istisnası değil aynısıdır:** bir kare bu sekmeye piksel olarak gelir, incelenir ve gider. Hiçbir şey kaydedilmez, hiçbir şey saklanmaz ve bu sayfanın bir tanesini gönderebileceği hiçbir türde ağ özelliği yoktur.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Hiçbir şey kaydedilmez
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Resmi yüklemeden nasıl QR kod okunur

1. **Resmi verin.** Kutuya bir fotoğraf ya da ekran görüntüsü bırakın, doğrudan bir tane yapıştırın ya da kamera düğmesine basın. Bir seferde birkaç tane olabilir — her biri kendi başına okunur ve her biri kendi cevabını alır. Zaten ekranınızda olan bir kodun ekran görüntüsü en hızlı ve en güvenilir yoldur; çünkü işin içinde ne bir mercek, ne bir açı, ne de bir ışık vardır.
2. **Simgenin tamamını, kenar boşluğuyla birlikte kadraja alın.** Bir kodun çevresindeki beyaz alan kodun bir parçasıdır: bir okuyucu simgenin nerede bittiğini onunla bulur. Karelerin kenarına kadar kırpılmış bir fotoğraf, bir kodun okunmamasının en yaygın tek sebebidir ve kadrajın yaklaşık yarısını kodla doldurmak doğru ölçüdür — bundan yakını köşelerin resmin dışında kalması demektir.
3. **Bir şeye karar vermeden önce adresi okuyun.** Bir afişteki, bir parkmetredeki ya da bir mektuptaki kodu taramanın amacı nereye gittiğini öğrenmektir ve bir telefon kamerasının gerçekten yapmanıza izin vermediği tek şey de budur. Sunucu burada kendi satırında basılır. Beklediğiniz bir ad değilse geldiğiniz şeyi zaten aldınız ve açılacak bir şey kalmadı.
4. **Uyarıları, özellikle sessiz olanları ciddiye alın.** Düz bir `http://` adresi, göründüğü alfabede olmayan bir ad, bir bağlantı kısaltıcı ya da adreste bir `@`'in önünde duran her şey — bunların her biri göründükleri yerde adlarıyla anılır. Hiçbiri tek başına bir şey kanıtlamaz. Hepsi, oraya gitmeden önce on saniyeye değer.
5. **Okumuyorsa başka bir şeyi değiştirmeden önce ışığı değiştirin.** Neredeyse her başarısızlık bir eşik sorunudur: ortadan geçen bir yansıma, bir köşeyi örten bir gölge ya da arka ışığı yakalayan bir açıdan fotoğraflanmış bir ekran. Parlama kodun üzerinden çıkacak şekilde yer değiştirin ya da kamera ışığını açın. O da olmazsa düz ve tam karşıdan tek bir fotoğraf çekip onu bırakın — durağan bir resim, canlı bir karenin yapabileceğinden çok daha kapsamlı bir arama görür.
6. **Cevap tuhaf görünüyorsa örneklenen resmi denetleyin.** «Bu nasıl okundu»yu açın ve küçük ızgaraya bakın. Bu sayfanın kodun ne olduğuna inandığı şeyin, örneklediği modüllerden geri çizilmiş hâlidir. Bir simgeyi yanlış okuyup makul bir şeye onarmış bir okuyucu bunu orada gösterir, başka hiçbir yerde değil.

## Uzun sürüm

[QR kod nasıl oluşturulur ve okunduğu nasıl kanıtlanır](https://abox.tools/tr/rehberler/qr-kod-yapip-okundugunu-kanitlama/): Kodu üretin, sonra aynı sitenin okuyucusuyla doğrulayın: tam içerik, gerçek bağlantı, baskı boyutunda ve bir fotoğraftan, baskıya gitmeden önce. Hepsi tarayıcıda, hiçbir şey yüklenmeden.

## Kutuda ayrıca

- [Özet ve Sağlama Toplamı](https://abox.tools/tr/saglama-toplami-hesaplama/): Bir indirmeyi, yayıncının bastığı sayıya karşı, kimseye göndermeden denetleyin.
- [Şifre ve Parola Cümlesi Üreteci](https://abox.tools/tr/sifre-olusturucu/): Burada, kendi tarayıcınız tarafından üretilir ve hiçbir yere gönderilmez. Hiçbir şey saklanmaz ve geçmiş yoktur.
- [JSON Biçimlendirici](https://abox.tools/tr/json-bicimlendirme/): JSON, XML, HTML, CSS ve YAML; biçimlendirilmiş ya da dönüştürülmüş. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [YAML'den JSON'a Dönüştürücü](https://abox.tools/tr/yaml-json-donusturme/): İki yön de var, ve her birinin neye mal olduğunu söylüyor. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.

## Sorular

### Resim herhangi bir yere yükleniyor mu?

Hayır ve ondan okunan hiçbir şey de yüklenmiyor. Resim, bu sayfadaki bir tuvale çözülür ve orada, bu siteden sunulan JavaScript tarafından okunur. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bize ait değildir. En açık kanıt internet bağlantısını kesmektir: çalışmaya devam eder.

### Kamera bir şey kaydediyor mu?

Hayır. Bir kamera karesi bu sekmeye piksel olarak gelir, bir tuvale çizilir, incelenir ve yaklaşık onda bir saniye sonra bir sonraki kare tarafından üzerine yazılır. Diske hiçbir şey yazılmaz ve hiçbir şey saklanmaz. Akış, siz durdur'a bastığınız anda, sekme arka plana geçtiğinde ve sayfadan ayrıldığınızda durur — ve güvenilecek gösterge kameranızdaki ışıktır, çünkü hiçbir sayfa onu söndüremez.

### Bağlantıyı açmak yerine neden bana gösteriyor?

Çünkü işe yarar olan kısım bu. Bir QR kod, okuyamadığınız bir adrestir; bir parkmetredeki kodun üzerine yapıştırılan bir çıkartmanın işe yaramasının bütün sebebi de budur: nereye gittiğini öğrendiğinizde çoktan oradasınızdır. Burada dize tam olarak basılır, sunucu kendi satırında belirtilir ve onu açmak, okuduktan sonra basacağınız ayrı bir düğmedir. Bu, fazladan bir tıklamadır ve biçimin en başından beri ihtiyaç duyduğu tıklamadır.

### Neleri okuyabiliyor?

1'den 40'a kadar her sürümde, dört hata düzeltme seviyesinin hepsinde, sayısal, alfasayısal, bayt ve kanji kipinde QR kodları; ECI karakter kümeleri ve yapılandırılmış ekleme simgeleri sessizce atılmak yerine bildirilir. Çizgili tarafta: EAN-13, EAN-8, UPC-A, UPC-E, ITF-14, Interleaved 2 of 5, Code 128 ve Code 39. Data Matrix, PDF417, Aztec ve MaxiCode okumaz.

### Kodumu okumuyor. Sorun ne?

Onda dokuz kez üç şeyden biridir. Beyaz kenar boşluğu kırpılmıştır ve bir okuyucu simgenin nerede bittiğini o boşlukla bulur. Kodun bir bölümünde bir yansıma ya da gölge vardır, yani hiçbir eşik koyu kareleri açık olanlardan ayırmaz. Ya da kod kadrajda o kadar küçüktür ki modülleri bir iki pikselden geniş değildir. Işığı değiştirin, kadrajın yaklaşık yarısını doldurun ve resmi açıyla değil tam karşıdan çekin.

### Hasarlı ya da kısmen kapalı bir kodu okuyabilir mi?

Çoğu zaman evet ve bu, buradaki bir zekâ gösterisi değil biçimin tasarlandığı gibi çalışmasıdır. Her QR kod Reed-Solomon denetim verisi taşır ve H seviyesinde üretilmiş bir simge modüllerinin yaklaşık %30'unu kaybedip yine de tam olarak yeniden kurulabilir. Sayfa, «bu nasıl okundu» başlığı altında kaç kod kelimesini onarmak zorunda kaldığını söyler; böylece sınıra ne kadar yaklaştığını görebilirsiniz. Yapmayacağı şey tahmin etmektir: denetimlerin taşıyabileceğinin ötesinde hasar görmüş bir simge, yanlış yanıtlanmak yerine okunamaz olarak bildirilir.

### Bir bit.ly bağlantısının nereye gittiğini neden söyleyemediğini yazıyor?

Çünkü bunu öğrenmek bit.ly'ye sormak demektir ve bu bir ağ isteğidir. Bu sayfadaki diğer her iddia, burada bir şeyle iletişim kuran bir kodun olmamasına dayanır ve bunun için sessizce bir istisna yapmak, cevaptan daha az değerli olurdu. Bu yüzden kısaltıcı adıyla anılır ve gizlediği şey dürüstçe bilinmez bırakılır. Onu çözmek istiyorsanız getirmeye razı bir şeye yapıştırın.

### Bir QR kodu taramak güvenli mi?

Taramak güvenlidir. Riskli olan ona göre davranmaktır ve bu gerçek bir risktir: parkmetrelerde, restoran masalarında ve kargo teslim kartlarında gerçek kodun üzerine yapıştırılmış kodlar artık kendi adı olacak kadar yaygındır. Onları işe yaratan şey, kimsenin bir koda bakarak onu okuyamamasıdır. Onu açmadan okumak — ki bu sayfanın yaptığı budur — bu avantajın tamamını ortadan kaldırır ve sunucuya bakmanın aldığı on saniye savunmanın tamamıdır.

### Her sonucun altındaki küçük ızgara nedir?

Bu sayfanın resminizden gerçekten örneklediği modüllerin, modül başına bir kare olacak şekilde geri çizilmiş hâli. Orada olmasının sebebi, okumanın güvenilmek yerine gözle denetlenebilmesidir: o ızgara fotoğrafladığınız koda benziyorsa üstündeki cevap doğru piksellerden gelmiştir. Neredeyse hiçbir okuyucu bunu size göstermez ve denetleyebileceğiniz bir araçla inanmak zorunda olduğunuz bir araç arasındaki fark budur.

### Bir resimdeki birkaç kodu okuyor mu?

Şimdilik resim başına bir tane. Bir seferde birkaç resim bırakın, her biri kendi başına okunsun; kamera ise siz gezdirdikçe kod ardına kod okur ve daha önce görmediği her yenisini tutar. Bir sayfa dolusu kod taşıyan tek bir fotoğraf, onu kırpmayı ya da kamerayı onlara teker teker doğrultmayı gerektiren bir iştir.

### Barkodumun istediğimden başka bir biçim olduğunu neden söyledi?

Çünkü bir barkod kendi adını taşımaz. UPC-A, ilk hanesi sıfır olan bir EAN-13'tür; ITF-14, on dört haneli ve geçerli bir kontrol hanesi olan bir Interleaved 2 of 5'tir ve sayısal kipindeki Code 128 başka hiçbir şeye benzemez. Bu sayfanın bildirdiği şey, çubukların söylediği artı kontrol hanesinin doğruladığı şeydir; simgenin kendisinin bildiği de bu kadardır.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, kamerasıyla birlikte çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: resminizi çözülmek üzere uzağa gönderen bir okuyucu, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Resim hiçbir zaman yüklenmez ve kamera bunun istisnası değildir.** Buraya bıraktığınız bir fotoğraf, bu sayfadaki bir tuvale çözülür ve orada okunur. Bir kamera karesi, saniyede otuz kez gelen aynı şeydir: o tuvale çizilir, incelenir ve bir sonraki tarafından üzerine yazılır. Hiçbir kare kaydedilmez, hiçbiri saklanmaz ve siz durdur'a bastığınızda kamera ışığının sönmesi işin tamamıdır.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok ve sayfanın `Content-Security-Policy`'si, olsaydı bile bu kaynağın gönderebileceği hiçbir adres bırakmıyor. Bu sayfanın kısaltılmış bir bağlantının nerede bittiğini size söyleyememesinin sebebi de budur: bunu öğrenmek sormak demektir ve o sormaz.
- **Adresi size gösterir. Onu asla açmaz.** Basılı bir QR kod, kimsenin okuyamadığı bir adrestir; üzerine yapıştırılmış bir çıkartmayı birinin zahmetine değer kılan da tam olarak budur. Burada hiçbir şey açılmaz. Dizenin tamamı bakmanız için basılır, gerçekten ulaşacağı sunucu ayrı olarak belirtilir ve bir adresi bir başkası gibi gösteren numaralar — bir `@`'in önündeki bir kullanıcı adı, harfleri bizimkilere benzeyen bir alfabeyle yazılmış bir ad, bir yönlendirme — göründükleri yerde adlarıyla anılır.
- **Neyi örneklediğini de size gösterir.** Her QR sonucunun altında, bu sayfanın fotoğrafınızdan gerçekten okuduğu modüllerin bir resmi vardır. Taradığınız koda benziyorsa üstündeki cevap sağlamdır; parazite benziyorsa değildir. Size bir dize verip başka bir şey vermeyen hiçbir okuyucu bu şekilde denetlenemez.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine bir resim, bir kare ya da birinden okunmuş bir şey verilmiyor. Pikselleri bir dizeye çeviren her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, kamera dahil araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, bir fotoğrafta simge bulmak için `src/binarize.js` ve `src/detect.js` — eşik, tanıma desenleri ve perspektif dönüşümü — onu geri okumak için `src/qr-decode.js`, yanlış okunanı onarmak için `src/reed-solomon.js`, çizgili olanlar için `src/linear.js` ve bu sayfada bir kameraya dokunan her satır olan `src/camera.js`.
