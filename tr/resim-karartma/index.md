# Görsel Karartıcı — karartın, pikselleştirin ya da bulanıklaştırın

Kapattığınız şey dosyanın içinde örtülmez, dosyadan silinir.

> Bir fotoğraftaki ya da ekran görüntüsündeki bir ismi, adresi veya hesap numarasını kapatın ve resmi yeniden kodlayın; böylece gizlenen pikseller bir dikdörtgenin altında durmak yerine dosyadan gitmiş olur. Tamamen tarayıcınızda çalışır.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/resim-karartma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## görselleriniz **asla yüklenmez**. Sunucu yoktur.

Resim kendi tarayıcınız tarafından, zaten beraberinde getirdiği kodlayıcılarla çözülür, üzeri boyanır ve yeniden kodlanır. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve bu, bu sitedeki neredeyse her yerden çok burada önemlidir: insanların bir karartma aracına getirdiği resimler, üzerinde hâlâ okunabilir bir isim, adres ya da hesap numarası olanlardır.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Bir görsel, gizlenen kısım gerçekten gidecek şekilde nasıl karartılır

1. **Görseli seçin.** Bir ekran görüntüsü, bir tarama ya da bir fotoğraf — tarayıcınızın açabildiği her şey. Doğrudan diskinizden okunur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Görünmemesi gerekenin üzerine bir kutu sürükleyin.** Bir sonraki için yeniden sürükleyin. Bir kutu taşınabilir, tutamaklarından yeniden boyutlandırılabilir ya da Tab tuşuyla erişilip oklarla oynatılabilir. Kutunun altında görünen şey gerçek sonuçtur; dosyayı yazan aynı kod tarafından çizilmiştir.
3. **Karartma, pikselleştirme ya da bulanıklaştırma seçin — ve karartmayı tercih edin.** Karartma altında hiçbir şey bırakmaz. Pikselleştirme ve bulanıklaştırma ise pikselleri kendi ortalamalarıyla değiştirir; bu, arka plandaki bir yüz için yeterlidir ve metin olarak okunan hiçbir şey için yeterli değildir.
4. **"Karart ve kaydet"e basın, sonra dosyayı denetleyin.** Sonrasında gösterilen resim, yeniden çözülmüş hâliyle bitmiş dosyadır. Onu bir düzenleyicide açıp bir katman arayın ya da kapattığınız metni seçmeyi deneyin: tek bir düz resim vardır ve kapattığınız kısımların üzerine, dosya yazılmadan önce yazılmıştır.

## Uzun sürüm

[Bir görsel, gizlenen kısım gerçekten gidecek şekilde nasıl karartılır](https://abox.tools/tr/rehberler/resim-karartma/): Çoğu programda çizilen siyah kutular resmin üstünde oturur ve kenara çekilebilir. Gerçek bir karartmayı örtülmüş bir karartmadan ayıran şey, pikselleştirilmiş metnin neden geri okunabildiği ve bir dosyayı göndermeden önce nasıl denetleyeceğiniz.

## Kutuda ayrıca

- [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/): Bir fotoğrafın sizin hakkınızda ne söylediğini görün. Sonra onu çıkarın.
- [DICOM Görüntüleyici](https://abox.tools/tr/dicom-goruntuleyici/): BT, MR, röntgen ve ultrason; penceresi, başlığı ve ölçümleriyle.
- [Görselden ICO'ya](https://abox.tools/tr/favicon-olusturma/): Bir resim girer. Bir tarayıcının, Windows'un ya da bir Mac'in istediği her boyut çıkar.
- [Görselden Data URI'ye](https://abox.tools/tr/resmi-base64e-donusturme/): Resmin tamamı tek satır metin olarak. Doğrudan CSS ya da HTML içine yapıştırın.

## Sorular

### Görselim herhangi bir yere yükleniyor mu?

Hayır. Dosya kendi donanımınızda, kendi tarayıcınız tarafından çözülür, karartılır ve kodlanır. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Sayfayı bir kez yükleyin, internet bağlantısını kesin, yine de çalışır.

### Kapatılan kısım dosyadan gerçekten gitti mi?

Evet ve bu aracın var olma sebebi budur. Resim bir piksel arabelleğine çözülür; kutular içlerindeki piksellerin üzerine yazar; sonra arabellek yeni bir dosya olarak kodlanır. Orijinal değerler, kodlayıcıya bir şey verilmeden önce bellekten gitmiştir; yani gizlenecek bir katman, kaldırılacak bir açıklama ve geri alınacak bir geçmiş yoktur. Bunu, başkasının iddiasını denetleyeceğiniz gibi denetleyebilirsiniz: sonucu bir görsel düzenleyicide açıp ikinci bir katman arayın ya da kapattığınız metni seçmeyi deneyin.

### Pikselleştirilmiş ya da bulanıklaştırılmış bir alan geri kazanılabilir mi?

Bazen ve seçim yapmadan önce okumaya değen tek şey budur. Karartma, altındaki her şeyi tek bir düz renkle değiştirir; yani hiçbir şey hayatta kalmaz — ne bir kenar, ne bir ortalama, ne de karakter sayısı. Pikselleştirme her bloğu o bloğun ortalamasıyla değiştirir ve bir ortalamalar ızgarası hâlâ altında ne olduğunun bir ölçümüdür: sıradan bir yazı tipinde ve tahmin edilebilir bir boyuttaki metin için, yayımlanmış çalışmalar aday dizeleri çizip ortalamalarını karşılaştırarak orijinali yeniden kurmuştur. Bulanıklaştırma bir konvolüsyondur ve konvolüsyonlar ilkesel olarak tersine çevrilebilir. Yani arka plandaki bir yüzü isterseniz pikselleştirin ya da bulanıklaştırın; metin olarak okunan her şeyi ise karartın.

### Bir belge düzenleyicide çizilmiş siyah bir dikdörtgen neden aynı şey değil?

Çünkü çoğu düzenleyici dikdörtgeni resmin içine değil yanına kaydeder. Bir PDF okuyucuda, bir sunum programında, bir kelime işlemcide ya da katmanlı bir görsel düzenleyicide çizilmiş bir şekil, sayfanın üzerinde duran ve bir konumu olan bir nesnedir — onu taşımak, silmek ya da dosyayı başka bir programda açmak, kapattığı şeyi olduğu gibi geri getirir. Gazeteler, mahkemeler ve devlet kurumlarının hepsi bu şekilde "karartılmış" belgeler yayımladı. Burada ise dikdörtgen hiç kaydedilmez: o, orada olanların üzerine yazılmış bir dizi piksel değeridir.

### EXIF ve GPS verisini de siliyor mu?

Evet, yan etki olarak. Kaydetmek, piksellerle dolu bir tuvali kodlamak demektir ve bir tuval hiçbir etiket taşımaz; dolayısıyla konum, kamera modeli, zaman damgaları ve gömülü küçük resim yeni dosyaya hiç yazılmaz. Burada küçük resim önemlidir: görüntünün küçük ikinci bir kopyasıdır, bir fotoğraf düzenlendiğinde her zaman yeniden üretilmez ve karartılmamış bir küçük resimle yolculuk eden karartılmış bir fotoğraf, bu emeği boşa çıkarmanın gerçek bir yoludur. Üst verinin, resim hiç yeniden kodlanmadan gitmesini istiyorsanız [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/) bunun yerine kabı yeniden yazar.

### Hangi biçimleri okuyabiliyor ve yazabiliyor?

Tarayıcınızın çözebildiği her şeyi okur; pratikte bu JPEG, PNG, WebP, GIF, BMP ve — güncel tarayıcıların çoğunda — AVIF demektir. JPEG, PNG ve WebP yazar, çünkü tarayıcıların beraberinde getirdiği kodlayıcılar bunlardır. "Otomatik"te bir JPEG JPEG olarak, başka her şey PNG olarak geri döner; bu da bir fotoğrafı fotoğraf boyutunda tutar ve bir ekran görüntüsünde kalan metni keskin bırakır. Seçim, karartma açısından hiçbir fark yaratmaz: pikseller kodlayıcı onları görmeden çoktan gitmiştir.

### Bunu faresiz yapabilir miyim?

Evet. "Ortaya bir kutu ekle" resmin üzerine bir tane koyar, Tab kutular arasında gezer, ok tuşları odaktakini oynatır ve Alt ile ok tuşları onu yeniden boyutlandırır — Shift her adımı on piksel yapar — Delete ise onu kaldırır. Her kutunun ayrıca resmin altında boyutunu, konumunu, ne yaptığını ve onu kaldıracak bir düğmeyi taşıyan bir satırı vardır; yani aracın tamamı klavyeden kullanılabilir ve bir ekran okuyucu tarafından okunabilir.

### Telefonda çalışıyor mu?

Evet. Çizme, taşıma ve yeniden boyutlandırma; hepsi fare olayları değil işaretçi olaylarıdır, yani bir parmak da aynı şekilde çalışır ve tutamaklar dokunmatik ekranda daha büyük çizilir. Ekrandaki resim siz çalışırken ekran boyutunda yeniden çizilir — dosyanın kendisi ise düğmeye bastığınızda her zaman kendi tam çözünürlüğünde karartılır.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Resmin boyutunda da bir sınır yok, çünkü bunun bedelini ödeyen bir sunucu yok — iş sizin kendi cihazınızda oluyor. Sitede reklam var, masrafı karşılayan da o; reklamlara görselleriniz hakkında hiçbir şey verilmiyor.

## Gizlilik iddiası nasıl doğrulanabilir

- **Görsellerinizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Kapatılan pikseller çıkış yolunda değil burada var olmayı bırakıyor.** Resim bir piksel arabelleğine çözülür, kutular o arabelleğin üzerine yazılır ve arabellek kodlayıcıya verilir. Bu sayfada, kutuları ayrı bir katman olarak taşıyan bir resim sürümü yoktur; çünkü öyle bir sürüm hiç üretilmez — `src/redact.js`'e bakın.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. İş, `getImageData`, baytlar üzerinde üç döngü ve `canvas.toBlob` — hepsi tarayıcınızda zaten kurulu.
- **Kutular hiçbir yere bildirilmez.** Nereye çizdiğiniz, kaç tane olduğu, ne kadar büyük olduğu ve hangi stili seçtiğiniz, siz sayfayı kapatana kadar bu sayfanın belleğinde tutulur. Bu depoda bunlardan herhangi birini taşıyan özel bir analitik olayı yoktur ve bu sitenin bir indirmeden sonra sorduğu tek soru, bir başparmak yönü ile aracın adını gönderir, başka hiçbir şeyi.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu — ve bir pasaportu karartmadan önce çalıştırmaya değen de bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, piksellerin üzerine yazan üç işlev için `src/redact.js` ve ekranda gördüğünüz şeyin neden aynı üç işlev tarafından çizildiği için `src/preview.js`.
