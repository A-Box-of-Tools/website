# PDF Sıkıştırma — bir belgeyi küçültün

Belgeyi hiçbir yere göndermeden küçültün.

> Bir PDF'i yüklemeden küçültün. Dosyayı kendi tarayıcınız okur, yeniden sıkıştırır ve yeniden yazar; araç da hiçbir şeye dokunmadan önce boyutun asıl nerede olduğunu gösterir.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/pdf-sikistirma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## belgeleriniz **asla yüklenmez**. Sunucu yoktur.

Belge bu makinenin belleğinde açılır, parçalarına ayrılır ve yeniden yazılır; bunu yapan kod da bu adresten sunuluyor. Buradaki hiçbir şey bir yükleme yapamaz ve bu sayfanın öbür ucunda bir yüklemeyi alacak bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Dosyalar cihazınızda kalır

## Bir PDF nasıl küçültülür

1. **Bir PDF seçin.** Seçiciye bırakın ya da elle seçin. Tarayıcı onu doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Boyutun nerede olduğuna bakın.** İkinci adımın bütün anlamı bu dökümde. Çubuk ağırlıklı olarak görsellerden oluşuyorsa bu aracın çalışacağı bir malzeme var demektir. Ağırlıklı olarak yazı tipleri ve sayfa içeriğiyse bunu söyler ve dürüst tasarruf yüzde birkaçtır — buna bir dakika harcamadan önce bilmek daha iyidir.
3. **Ne kadar sıkacağını söyleyin.** Adlandırılmış ayarlar belirsiz notlar değil, çözünürlüklerdir: ekranda okumak için 96 DPI, e-postayla göndermek için 130, hâlâ basılacak bir şey için 220. Her biri görselin sayfada gerçekte ne kadar büyük çizildiğine göre ölçülür; yani küçük resim olarak yerleştirilmiş bir fotoğraf, tam sayfa bir taramayla aynı muameleyi görmez.
4. **Sıkıştırın ve denetlendiğini söyleyen satırı okuyun.** Yeniden yazma bittiğinde bitmiş dosya bu sayfadaki aynı okuyucu tarafından yeniden açılır ve sayfaları sayılır. Bu, orijinaliyle uyuşmuyorsa çalışma başarısız olarak bildirilir ve indirme sunulmaz.

## Uzun sürüm

[Bir PDF nasıl küçültülür ve bazıları neden küçülmez](https://abox.tools/tr/rehberler/pdf-boyutunu-kucultme/): Bir PDF'in boyutunun gerçekte nerede olduğu, bir taramanın neden %80 sıkıştığı ama bir sözleşmenin neredeyse hiç kıpırdamadığı, burada DPI'ın ne anlama geldiği ve bir sıkıştırıcının belgenize asla yapmaması gerekenler.

## Kutuda ayrıca

- [PDF Karartıcı](https://abox.tools/tr/pdf-karartma/): Harfler dosyadan silinir ve sonra bunu kanıtlamak için dosyada arama yapılır.
- [Görsellerden PDF'e](https://abox.tools/tr/resimleri-pdfe-donusturme/): Resimlerinizi tek bir belgeye koyun.
- [Belge Tarayıcı](https://abox.tools/tr/belge-tarayici/): Sayfayı fotoğraflayın. Taranmış görünen bir şey geri alın.
- [Videodan Ses Çıkarma](https://abox.tools/tr/videodan-ses-cikarma/): Bir video bırakın, sesini alın. Görüntü hiçbir zaman çözülmez ve hiçbir şey yüklenmez.

## Sorular

### PDF'im herhangi bir yere yükleniyor mu?

Hayır. Dosya, kendi donanımınızda, kendi tarayıcınız tarafından okunur, yeniden sıkıştırılır ve yazılır. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Bu aracın isteğe bağlı bir ağ özelliği de hiç yoktur.

### PDF'im ne kadar küçülecek?

Tamamen içinde ne olduğuna bağlı; araç da bu yüzden hiçbir şeyi sıkıştırmadan önce ölçüp size gösteriyor. Taranmış bir belge neredeyse baştan sona fotoğraftır ve genellikle %⁦60–90⁩ küçülür. Bir sözleşme ya da bir tez ise metin, vektör çizim ve gömülü yazı tiplerinden oluşur; bunların hepsi onları üreten yazılım tarafından zaten sıkıştırılmıştır. Oradaki tasarruf genellikle yüzde birkaçtır ve dosyayı yeniden paketlemekten, artık başvurulmayanı atmaktan gelir. Dosyanıza bakmadan sabit bir yüzde vaat eden her araç tahmin yürütüyordur.

### Bir PDF'i sıkıştırmak kalite kaybettirir mi?

İçindeki görseller yeniden kodlanır, dolayısıyla onlar için evet. Başka hiçbir şeye dokunulmaz: metin metin kalır, seçilebilir ve aranabilir hâlde; yazı tipleri bütün olarak korunur; vektör çizim aynen kopyalanır. Araç ayrıca bir görseli boşuna bozmayı da reddeder — yeniden kodlama orijinalinden küçük çıkmıyorsa orijinal baytlar olduğu gibi belgeye geri konur.

### Buradaki DPI nedir, neden soruyor?

Bir PDF, her görselin sayfada ne kadar büyük çizildiğini kaydeder; böylece araç etkin çözünürlüğü hesaplayabilir: yirmi santimlik bir kâğıda yerleştirilmiş 4000 piksellik bir tarama inç başına 500 piksel taşıyor demektir. Bunu ne bir ekran kullanabilir ne de kâğıt üzerinde pek bir işe yarar; bu yüzden seçtiğiniz ayarın üzerindeki pikseller ilk önce atılır — kimsenin göremeyeceği bir kaliteye mal olurlar. Bu ölçüm, küçük yerleştirilmiş bir logonun tam sayfa bir taramayla aynı muameleyi görmemesinin de sebebidir.

### Parola korumalı bir PDF'i açabilir mi?

Hayır ve bu bilinçli bir tercih. Şifreli bir belge, bunu söyleyen bir mesajla geri çevrilir; parola boş olsa bile — ki pek çok tarayıcı ve fotokopi makinesi böyle kaydeder. Bir dosyanın korumasını kaldırmak, onu sıkıştırmaktan farklı bir iştir ve bunu sessizce yapan bir araç sizin istemediğiniz bir şeyi yapıyor olurdu.

### Sıkıştıramadığı PDF'ler var mı?

İçlerindeki bazı görseller için evet. JPEG 2000, JBIG2 ve faks kodlu (CCITT) görsellerin hiçbir tarayıcıda çözücüsü yoktur; bu yüzden dokunulmadan geçirilir ve öyle bildirilir — son ikisi iki seviyeli kodlayıcılardır ve zaten en küçük hâllerine yakındır. CMYK görseller de olduğu gibi bırakılır, çünkü onları yeniden kodlamak bir matbaanın üreteceği renkleri kaydırma riski taşır. Aracın atladığı her şey, sebebiyle birlikte sonuçlarda adıyla belirtilir.

### Sıkıştırılmış dosya her yerde açılmaya devam eder mi?

Evet. Çıktı, 2003'ten beri sunulan her okuyucunun anladığı PDF 1.5 olarak yazılır ve araç bunu kendi cihazınızda kanıtlar: bitmiş dosyayı size sunmadan önce yeniden açıp sayfalarını sayar. Formlar, bağlantılar, yer imleri, erişilebilirlik yapısı ve gömülü ekler karşıya taşınır; geride bırakılan şey, belgede artık hiçbir şeyin başvurmadığı malzemedir.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok ve kendi cihazınızın belleğinin izin verdiğinin ötesinde bir dosya boyutu sınırı yok. Sitede reklam var, masrafı karşılayan da o; reklamlara belgeniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: belgenizi sıkıştırılmak üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Belgenizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Bu araç o listeye hiçbir şey eklemez: isteğe bağlı olanı bile yok, kendine ait bir ağ özelliği hiç yok. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok.
- **Biçimin tamamı bu depoda.** Bir PDF, nesnelerden oluşan bir liste ve her birinin nerede başladığını gösteren bir tablodur. `src/objects.js` bu söz dizimini okur, `src/reader.js` tabloyu izler, `src/writer.js` yenisini yazar ve üçü de istek yapabilecek hiçbir şeyi içeri almaz. Hiçbir kitaplık getirilmiyor ve hiçbir şey bir sunucuda çizilmiyor.
- **Şifreli dosyalar açılmıyor, geri çevriliyor.** Parola konmuş bir PDF geri çevrilir; tarayıcıların boş parolayla ürettiği ve teknik olarak açılabilecek türü de dahil. Bir belgenin korumasını kaldırmak, onu küçültmekten farklı bir iştir ve bunu sessizce yapmak bir aracın sizin adınıza yapması şaşırtıcı olurdu.
- **Bir şey koymuyor, çıkarıyor.** Bitmiş dosyada oluşturulma tarihi, üretici satırı ya da onu yapan aracın adı yer almaz. Kutu işaretliyken XMP paketini ve sayfa düzeni uygulamalarının geride bıraktığı özel blokları da kaybeder — EXIF aracının öne sürdüğü aynı gerekçenin başka bir kaba uygulanmış hâli.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine belgeniz hakkında bir şey verilmiyor: ne bir dosya, ne bir sayfa, ne bir ad, bir boyut ya da bir sayfa sayısı. Bir PDF'i okuyan, çözen ya da yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de belgeniz hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfadaki her şey çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu: belgenizi sıkıştırılmak üzere uzağa gönderen bir araç dururdu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, okuma ve yeniden yazma işinin tamamı için de `src/reader.js` ile `src/writer.js` — ikisi de ağa erişemez.
