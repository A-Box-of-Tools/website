# EXIF Görüntüleyici ve Silici — fotoğraf üst verisini silin

Bir fotoğrafın sizin hakkınızda ne söylediğini görün. Sonra onu çıkarın.

> Bir fotoğrafta saklı EXIF ve GPS verisini görün, düzenleyin ya da tek tıklamayla hepsini silin. Tarayıcınızda: hiçbir şey yüklenmez ve fotoğraf hiçbir zaman yeniden kodlanmaz.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/exif-verisi-silme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## fotoğraflarınız **asla yüklenmez**. Sunucu yoktur.

Dosya kendi tarayıcınız tarafından açılır, ayrıştırılır ve yeniden yazılır. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve olsaydı bile bu sayfanın öbür ucunda bir fotoğrafın gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Resmi asla yeniden kodlamaz

## Bir fotoğraftan EXIF verisi nasıl silinir

1. **Fotoğraflarınızı seçin.** Seçiciye bırakın ya da elle seçin. Tarayıcı onları doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **İsterseniz içlerinde ne olduğunu okuyun.** Bulgular listesi, her etiketin tam tablosundan önce bilinmeye değer şeyleri adıyla anar — GPS konumu, zaman damgaları, seri numaraları.
3. **"Tüm üst veriyi sil"e basın.** Çoğu kişi için işin tamamı budur. Her etiket, XMP ve IPTC blokları, yorumlar ve gömülü küçük resim; listedeki her fotoğrafta hepsi birden gider.
4. **Ya da silmek yerine düzenleyin.** Bir tarihi değiştirin, bir telif satırını düzeltin, konumu atıp kamera ayarlarını koruyun — sonra o fotoğrafı tek başına kaydedin.

## Uzun sürüm

[Bir fotoğraf sizin hakkınızda ne söyler ve bunu nasıl çıkarırsınız](https://abox.tools/tr/rehberler/exif-ve-gps-verisini-silme/): Telefondan çıkan bir fotoğraf genellikle çekildiği tam noktayı, saniyesine kadar saati ve kameranın seri numarasını taşır. İçinde ne var, kimler okuyabilir ve resme hiç dokunmadan bunu nasıl çıkarırsınız.

## Kutuda ayrıca

- [DICOM Görüntüleyici](https://abox.tools/tr/dicom-goruntuleyici/): BT, MR, röntgen ve ultrason; penceresi, başlığı ve ölçümleriyle.
- [Görselden ICO'ya](https://abox.tools/tr/favicon-olusturma/): Bir resim girer. Bir tarayıcının, Windows'un ya da bir Mac'in istediği her boyut çıkar.
- [Görselden Data URI'ye](https://abox.tools/tr/resmi-base64e-donusturme/): Resmin tamamı tek satır metin olarak. Doğrudan CSS ya da HTML içine yapıştırın.
- [SVG'den Görsele](https://abox.tools/tr/svg-yi-pnge-donusturme/): Boyutu siz söyleyin. Bir vektörün kaybedecek kendi boyutu yok.

## Sorular

### Fotoğrafım herhangi bir yere yükleniyor mu?

Hayır. Dosya kendi donanımınızda, kendi tarayıcınız tarafından okunur, ayrıştırılır ve yeniden yazılır. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir.

### EXIF nedir ve bir fotoğrafta başka ne saklanır?

EXIF, bir kameranın resmin yanına yazdığı bir etiket bloğudur: marka ve model, pozlama ayarları, saniyesine kadar tarih ve saat, çoğu zaman bir GPS konumu ve bazen bir seri numarası. Fotoğraflar sık sık bunun ötesinde de bir şeyler taşır — bir düzenleyiciden gelen XML'den oluşan bir XMP paketi, açıklama ve künye alanlarından oluşan bir IPTC bloğu, bir renk profili, görüntünün küçük ikinci bir kopyası olan bir küçük resim ve belgelenmemiş üretici verisinden oluşan bir üretici notu. Bu araç hepsini listeler.

### Üst veriyi silmek görüntü kalitesini düşürür mü?

Hayır ve fotoğrafı yeniden kaydetmek yerine böyle bir araç kullanmanın başlıca sebebi budur. Üst veri, sıkıştırılmış resmin içinde değil etrafındaki kapta durur. Onu silmek, bir listeden öğe silip listeyi yeniden yazmak demektir; sıkıştırılmış görüntü verisi bayt bayt kopyalanır, yani sonuç tam olarak aynı piksellere çözülür. Hiçbir şey çözülmez ve hiçbir şey yeniden sıkıştırılmaz.

### Hangi dosya biçimlerini işliyor?

JPEG, PNG ve WebP. HEIC ve AVIF tanınır ama yeniden yazılmaz: iç içe geçmiş atomlardan kurulmuş kap biçimleridir ve farklı bir ayrıştırıcı gerektirirler; bu yüzden araç, bozuk bir dosya üretmek yerine bunu söyler. Çıplak bir TIFF de işlenmez, çünkü bir TIFF'te üst veri ile pikseller aynı ofsetlerle adreslenir.

### Üst veri silindikten sonra fotoğrafım döndürülmüş görünür mü?

Görünebilir ve bunun için bir ayar var. Telefonlar genellikle resmi mercekten göründüğü gibi kaydeder ve nasıl döndürüleceğini söyleyen bir Orientation etiketi ekler. O etiketi silin, bazı görüntüleyiciler fotoğrafı yan gösterir. Varsayılan olarak açık olan "yön etiketini koru" seçeneği, yalnızca o tek etiketi içeren ufacık bir EXIF bloğunu geri yazar — ve yalnızca fotoğrafın gerçekten ihtiyacı olduğunda. Dosyanın hiç EXIF taşımamasını tercih ediyorsanız kapatın.

### GPS konumunu siliyor mu?

Evet. Her şeyi silmek GPS dizininin tamamını siler; ayrıca konumu tek başına silip gerisini de koruyabilirsiniz. Konum önce ondalık derece olarak gösterilir; çünkü "51 derece, 30 dakika, 26 saniye", bir fotoğrafın çekildiği binayı adlandırdığını bariz hâle getirmez.

### Bir etiketi silmek yerine değiştirebilir miyim?

Evet. Metin etiketleri, tarihler, ISO, yön ve çözünürlük düzenlenebilir ve hiç etiketi olmayan bir fotoğrafa birkaç yaygın etiket eklenebilir. Bir tek uyarı: dosyayı yazmak EXIF bloğunu yeniden kurar ve bir üretici notu orijinal bloğa ofsetler içerir; dolayısıyla yeniden kurulmuş bir üretici notu, sonrasında üreticinin kendi yazılımı tarafından okunamayabilir. Bu sizin için önemliyse onu silin ya da dosyayı düzenlemeden bırakın.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok. Sitede reklam var, masrafı karşılayan da o; reklamlara fotoğraflarınız hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: fotoğraflarınızı işlenmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Fotoğraflarınızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** Bu kutudaki diğer araçların aksine bunun bir "web adresinden yükle" özelliği ve hiçbir isteğe bağlı ağ adımı yok. `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok.
- **Okuduğumuz üst veri hiçbir zaman birine okunmaz.** GPS konumunuz bu sayfada gösterilir ve başka hiçbir yere gitmez. Bu depoda bir etiket, bir dosya adı, bir boyut ya da bir sayı taşıyan özel bir analitik olayı yoktur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine fotoğraflarınız hakkında bir şey verilmiyor. Bir dosyayı okuyan, ayrıştıran ya da yeniden yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de dosyalarınız hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, EXIF ayrıştırıcısı için `src/tiff.js` ve resmin kendisinin yalnızca kopyalandığının kanıtı için `src/jpeg.js`.
