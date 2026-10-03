# Belge Tarayıcı — bir sayfanın fotoğrafı, düzeltilmiş

Sayfayı fotoğraflayın. Taranmış görünen bir şey geri alın.

> Bir sayfanın telefon fotoğrafını düzeltilmiş, eşit aydınlatılmış bir PDF'e çevirin. Köşeler sizin için bulunur, perspektif geri alınır, gölge bölünüp atılır. Tamamen tarayıcınızda çalışır: hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/belge-tarayici/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## belgeleriniz **asla yüklenmez**. Sunucu yoktur.

Fotoğraf kendi tarayıcınız tarafından çözülür, düzeltilir, temizlenir ve bir PDF'e yazılır; kullanılan tek şey aritmetik ve tarayıcının zaten beraberinde getirdiği kodlayıcılardır. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve bunun burada önemli olmasının sebebi, insanların hangi sayfaları fotoğrafladığıdır: bir pasaport, bir maaş bordrosu, bir kira sözleşmesi, bir ofisin «tarayıp geri gönderin» dediği bir form.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Telefon kameranızla bir belge nasıl taranır

1. **Sayfayı fotoğraflayın.** Yukarıdan, sayfanın tamamı kadrajda ve dört köşesi görünür ya da neredeyse görünür olacak şekilde. Tam karşıdan olması gerekmez ve eşit aydınlatılmış olması gerekmez: açı ve gölge zaten bu aracın işidir. Önemli olan kadrajı doldurmaktır — odanın öbür ucundan fotoğraflanmış bir sayfada geri kazanılacak ayrıntı yoktur.
2. **Dört köşeyi denetleyin.** Fotoğraf okunurken sizin için bulunurlar ve emin olunmadığında sayfa bunu söyler — kâğıtla aynı renkteki bir masanın üzerindeki bir sayfanın kenarını görmek gerçekten zordur. Fotoğrafın herhangi bir yerine basın, en yakın köşe parmağınıza gelsin; ya da `Tab` ile birine ulaşıp ok tuşlarıyla oynatın.
3. **Işıkla ne yapılacağını seçin.** «Renkli, eşitlenmiş», kâğıdın kendi parlaklığını sayfa boyunca ölçer ve bölüp atar; böylece gölge gider, bir mühür ya da bir imza rengini korur. «Siyah beyaz» daha ileri gider ve bir taramayı e-postayla gönderilebilecek kadar küçük yapan da odur. Ekranda gördüğünüz şey gerçek sonuçtur; dosyayı yazan aynı kod tarafından üretilmiştir.
4. **Diğer sayfaları ekleyin.** Eklediğiniz her fotoğraf, listelendikleri sırayla aynı belgenin bir başka sayfası olur ve her biri kendi köşelerini korur. Şeritteki bir sayfanın üzerindeki oklar onu öne ya da arkaya alır.
5. **PDF'i kaydedin ve göndermeden önce açın.** Belge burada, bu sayfanın belleğinde yazılır. Onu yapmak için hiçbir şey yüklenmedi ve onun hakkında hiçbir şey hiçbir yere bildirilmedi.

## Uzun sürüm

[Bir belge telefonla nasıl taranır](https://abox.tools/tr/rehberler/telefonla-belge-tarama/): Bir sayfanın fotoğrafını, o sayfanın taramasından ayıran şey: açı, dengesiz ışık ve dosya boyutu. Fotoğrafın nasıl çekileceği, sonradan neyin düzeltileceği ve bunların hiçbirinin neden bir sunucuya ihtiyacı olmadığı.

## Kutuda ayrıca

- [Videodan Ses Çıkarma](https://abox.tools/tr/videodan-ses-cikarma/): Bir video bırakın, sesini alın. Görüntü hiçbir zaman çözülmez ve hiçbir şey yüklenmez.
- [Ses Kesici](https://abox.tools/tr/ses-kesme/): Tutmaya değer parçaları oynarken işaretleyin. Onları tek dosya olarak, tam söylediğiniz yerden kesilmiş hâlde geri alın.
- [Ses Düzenleyici](https://abox.tools/tr/ses-duzenleme/): Geriye oynatın, hızını değiştirin, sessiz bir kaydı yükseltin — hepsi burada, kendi makinenizde.
- [PDF Birleştirici ve Bölücü](https://abox.tools/tr/pdf-birlestirme/): Sunucuya gidip gelmeden yerinden oynatılmış sayfalar.

## Sorular

### Belgem herhangi bir yere yükleniyor mu?

Hayır. Fotoğraf kendi donanımınızda, kendi tarayıcınız tarafından çözülür, düzeltilir, temizlenir ve bir PDF'e yazılır. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Sayfayı bir kez yükleyin, internet bağlantısını kesin, yine de çalışır.

### Model olmadan sayfanın köşelerini nasıl buluyor?

Bir dikdörtgeni oluşturan dört uzun düz kenarı arayarak. Fotoğraf küçültülür, gradyanı alınır — görüntünün nerede ve hangi yönde değiştiği — ve bir kenarın üzerinde duran her piksel, üzerinde yatacağı düz çizgi için oy verir. Güçlü çizgiler aday dikdörtgenlere eşlenir ve her aday, dört kenarı gezilerek puanlanır: her kenarın ne kadarının altında gerçekten bir kenar var ve bu dördü tek bir şeyin sınırı mı? Bir sayfa etrafındakinden ya daha açıktır ya daha koyu, ama dört kenarında da aynı yönde farklıdır; bir metin satırının sayfanın alt kenarı sanılmasını engelleyen de budur. Ağırlık yoktur, hiçbir şey indirilmez ve aritmetik, içinden geçen her belge için aynı aritmetiktir.

### Bulduğu köşeler yanlış. Şimdi ne olacak?

Onları sürükleyin. Köşeler bir başlangıç konumudur, asla bir karar değil: tarama, dördü nerede biterse oradan alınır. Fotoğrafın herhangi bir yerine basın, en yakın köşe parmağınıza sıçrasın — bu, küçük bir tutamağı tutturmaktan kolaydır — ve ok tuşları odaktaki köşeyi birer piksel oynatır. Sayfa ayrıca köşelerin bir bulgu değil bir tahmin olduğu durumu söyler ve o sayfayı şeritte işaretler — kendi rengine yakın bir masanın üzerinde duran bir sayfa bunun olağan sebebidir, çünkü orada bulunacak neredeyse hiç kenar yoktur.

### Düzeltilmiş sayfa neden doğru şekilde çıkıyor da ezik çıkmıyor?

Çünkü şekil kenarlardan ölçülmüyor, perspektiften geri kazanılıyor. Açıyla fotoğraflanmış bir sayfanın uzak kenarı kısalmış olur; bu yüzden bariz yöntem — en uzun karşılıklı kenar çiftini alıp orana bu demek — gözle görülür biçimde bodur bir A4 üretir ki çoğu web tarayıcının size verdiği de budur. Bir dikdörtgenin fotoğrafı, kameranın sıradan bir kamera olduğu bilgisinden başka bir şey gerekmeden, hem dikdörtgenin en boy oranını hem de kameranın odak uzaklığını geri kazanmaya yetecek bilgiyi gerçekten taşır; bu, Zhang ve He'nin 2003 tarihli bir sonucudur ve `src/geometry.js`'in yaptığı da budur. Fotoğrafın tam karşıdan çekildiği yerde çalışılacak bir perspektif yoktur ve gerekmez de, çünkü o zaman kenarlar zaten kesindir — öyle durumlarda onlara döner ve sayfa hangisinin cevap verdiğini söyler.

### «Temizleme» görüntüye aslında ne yapıyor?

Işığı bölüp atıyor. Kâğıdın kendi parlaklığı sayfa boyunca ölçülür — bir mozaik ızgarası ve her karede parlaklığın yüksek bir yüzdelik değeri; metin bunu oynatamayacak kadar koyu ve seyrektir — ve her piksel, o noktada tahmin edilen kâğıda bölünür. Geriye kalan şey, eşit aydınlatılmış mürekkeptir; gölge ve kenarlardaki karartı gitmiştir. Bu, kontrastı artırmakla aynı şey değildir: fotoğraflanmış bir sayfanın kontrastını artırmak parlak kısmı beyaz, koyu kısmı siyah ve koyu kısımdaki yazıyı okunamaz yapar; «otomatik seviyeler»in bu resimleri iyileştirmek yerine bozmasının sebebi de budur.

### Siyah beyaz kip neden bu kadar küçük?

Çünkü iki renkli bir resim, on altı milyon renkli bir resmin verisinin gerçekten küçük bir kesridir ve burada öyle saklanır: piksel başına bir bit, sekizi bir bayta paketlenmiş ve tam olarak sıkıştırılmış — siyah beyaz bir resmin JPEG'i olarak değil. Aynı sayfalarda renkli kipten yaklaşık on sekiz kat küçük çıkar; yani yirmi sayfalık bir sözleşme on beş civarı yerine bir megabaytın altına iner. Eşikleme Sauvola'nın yöntemidir; her pikseli, sayfanın tamamı için tek bir sayıya göre değil, kendi komşuluğunun ortalamasına ve yayılımına göre karara bağlar — gölge içindeki yazıyı ayakta tutan da budur. Ara tonu yoktur, bu yüzden üzerinde fotoğraf olan bir sayfa diğer kiplerden birini kullanmalıdır.

### Bir PDF'e birkaç sayfa koyabilir miyim?

Evet. Eklediğiniz her fotoğraf, listelendikleri sırayla bir başka sayfa olur ve her sayfa kendi köşelerini korur — yani arka arkaya fotoğraflanmış bir sayfa yığını tek bir belgeye dönüşür. Şeritteki her sayfanın üzerindeki oklar onu öne ya da arkaya alır. Temizleme ayarı bilinçli olarak hepsi için ortaktır: bir belgede farklı temizlenmiş sayfalar iki belge gibi görünür.

### Metni okuyor mu, PDF'te arama yapabilecek miyim?

Hayır. Metin katmanı ve karakter tanıma yok: çıkan şey, bir sayfa üzerinde sayfanın resmidir. Bunu doğru dürüst yapmak bir OCR motoru demektir ki bu da indirilecek onlarca megabayt model eder — ve maaş bordronuzu okuyabilmek için önce bir model getiren bir belge tarayıcı, maaş bordroları hakkında eve haber vermek için bir sebebi olan bir belge tarayıcı olurdu. Metin gerekiyorsa siyah beyaz kip, kendi makinenizdeki OCR yazılımının en iyi çalıştığı türden bir dosya üretir.

### Bulanık çıktı. Neden?

Neredeyse her zaman sayfa fotoğrafta küçük olduğu için. Ön izlemenin altındaki panel, sayfanın kadrajın ne kadarını doldurduğunu ve o boyutta bir kâğıtta bunun kabaca inç başına kaç noktaya denk geldiğini söyler — yaklaşık 150 DPI'ın altında basılmış bir tarama yumuşak görünür ve hiçbir aracın, dosyada hiç olmamış bir ayrıntı için yapabileceği bir şey yoktur. Yakınlaştırmak yerine yaklaşın, sabit tutun ve düğmeye basmadan önce kameranın sayfaya odaklanmasını bekleyin. Kamera sarsıntısı diğer sebeptir ve o da geri kazanılamaz.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, sayfa sınırı yok, filigran yok. Fotoğrafların boyutunda da bir sınır yok, çünkü bunun masrafını ödeyen bir sunucu yok — iş sizin kendi cihazınızda oluyor. Sitede reklam var, masrafı karşılayan da o; reklamlara belgeleriniz hakkında hiçbir şey verilmiyor.

## Gizlilik iddiası nasıl doğrulanabilir

- **Belgelerinizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Fotoğraflarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Model yok; yani indirilecek bir şey de sorulacak bir şey de yok.** Bir sayfanın dört köşesini bulmak aritmetikle yapılıyor: görüntünün gradyanı, içindeki düz çizgiler için bir oylama ve kazanan dikdörtgenin her kenarının altında gerçekte ne olduğunun denetlenmesi. Ağırlık yok, çıkarım çalışma zamanı yok, ilk kullanımda getirilen bir şey yok ve başkasının belgesinde sizinkinden farklı davranan bir şey yok — `src/detect.js`'e bakın.
- **Belge tarih, yazar ya da makine adı taşımaz.** Bir tarama, insanların başka insanlara gönderdiği bir şeydir; genellikle bir ofis istediği için. Sayfaların kendisi dışında PDF'e yazılan tek şey bu aracın adıdır, bir de yazarsanız bir başlık. Oluşturulma tarihi yok, yazar yok, seri numarası yok ve saatinizden, dosya adlarınızdan ya da bilgisayarınızdan türetilmiş hiçbir şey yok — `src/document.js`'e bakın.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. İş, `getImageData`, baytlar üzerinde birkaç döngü ve tarayıcının kendi JPEG kodlayıcısı — hepsi makinenizde zaten kurulu.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu — ve bir pasaport taramadan önce çalıştırmaya değen de bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, köşelerin hiçbir model olmadan nasıl bulunduğu için `src/detect.js`, düzeltme için `src/warp.js` ve eşitsiz ışığın nasıl bölünüp atıldığı için `src/clean.js`.
