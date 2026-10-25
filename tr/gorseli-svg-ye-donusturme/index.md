# Görselden SVG'ye — bir logoyu, şablonu ya da silüeti eğrilere çevirin

Bir şekil, bir dış çizgi. Orada olmaması gerekeni gösterin, yeter.

> Siyah beyaz bir görseli tarayıcınızda gerçek bir SVG dış çizgisine çevirin. Logolar, şablonlar, imzalar, çizgi çizimler ve silüetler istediğiniz boyuta büyüyen eğrilere dönüşür. Yanlışlıkla alınanı bir tıkla çıkarın. Hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/gorseli-svg-ye-donusturme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## görselleriniz **asla yüklenmez**. Sunucu yoktur.

Görseli diskinizden kendi tarayıcınız okur; `src/mask.js` onu piksel başına bir bite indirir, `src/contour.js` şeklin kenarını dolaşır ve `src/fit.js` üzerine eğriler oturtur — okuyabileceğiniz altı yüz kadar satır; arkasında bir motor yok ve çalıştırmak için indirilen hiçbir şey yok. Bu aracın hiçbir türde ağ özelliği yoktur: getirecek bir şey yok, gönderecek bir şey yok ve olsaydı bile bu sayfanın öbür ucunda bir çizimin gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Bir görsel, yüklenmeden nasıl SVG'ye çevrilir

1. **Görseli seçin.** Bir logo, bir şablon, bir imza, bir kaşe, taranmış bir çizim, bir silüet. İçinde belirgin bir şekil olan her şey temiz çevrilir; bir odanın fotoğrafı çevrilmez ve bunun için sonda bir sürpriz yerine aşağıda dürüst bir uyarı var. Dosya doğrudan diskinizden okunur ve bu sırada hiçbir yere hiçbir şey gönderilmez.
2. **Şeklin ne olduğunu söyleyin.** Kâğıt üzerindeki bir çizim **açık ve koyu** ile ayrılır ve seviye sizin için hesaplanır. Bir nesnenin fotoğrafı ayrılmaz — koyu gri taş üzerindeki koyu kırmızı bir heykel, koyu üstüne koyudur ve hiçbir parlaklık ikisini ayırmaz. O, görselin kenarı boyunca uzanan bir şeritten arka planın ne olduğunu öğrenen ve ondan olmayan her şeyi tutan **özne**yi ister.
3. **Ayarlara değil, kırmızı çizgiye bakın.** Dış çizgi, geldiği piksellerin üstüne çizilir; çünkü sorunun karara bağlanabileceği tek yer orasıdır: bir dış çizgi o piksellere göre doğru ya da yanlıştır, başka hiçbir şeye göre değil. İki görselden birini sürükleyin, ikisi birden kayar; çizginin gerçekte ne yaptığını görecek kadar yakınlaştırmak için tekerleği çevirin.
4. **Orada olmaması gerekeni tıklayıp çıkarın.** Bir benek, bir zımba teli, bir kaşe, bir alt yazı, bir gölge. Bir tıklama tek bir piksel değil, o rengin tüm lekesini alır; yani bir şekli gösteriyorsunuz. Geri koymak için yeniden tıklayın. Çevrili bir arka plan parçasına tıklamak ise onu doldurur; delik olmaması gereken bir delik böyle kapanır.
5. **Yumuşatmayı yalnızca gerekirse ayarlayın.** *Ayrıntı*, çizginin sadeleştirilirken piksellerden ne kadar uzaklaşabileceğidir ve siz aksini söylemedikçe şekil başına hesaplanır. *Köşe keskinliği*, bir dönüşün yuvarlanmak yerine köşe olarak kalması için dış çizginin ne kadar dönmesi gerektiğine karar verir. Çoğu görselde ikisine de dokunmak gerekmez.
6. **SVG'yi alın.** Tek dosya, tek `<path>`, dert edilecek doldurma kuralı yok: dış çizgiler bir yöne, delikler öbür yöne döner ve kırk delikli bir şekli tek bir öğe yapan da budur. Illustrator'da, Inkscape'te, Figma'da, bir tarayıcıda ve bir kesim makinesinde açılır.

## Uzun sürüm

[Bir görsel SVG'ye nasıl çevrilir](https://abox.tools/tr/rehberler/gorseli-svg-ye-donusturme/): Bir logoyu, şablonu, imzayı ya da silüeti tarayıcınızda gerçek bir vektör dış çizgisine dönüştürün. Hangi görseller iyi çevrilir, hangileri asla çevrilmez ve çeviricinin yanlış yaptığı kısımlar nasıl düzeltilir.

## Kutuda ayrıca

- [Boy Karşılaştırma](https://abox.tools/tr/boy-karsilastirma/): Boyları yazın, resmi alın. Onu çizmek için hiçbir şey gönderilmez.
- [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/): Boyutu siz söyleyin, gerisini o hesaplasın.
- [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/): Boyutu söyleyin. Kutuyu çizin. Biçimi seçin.
- [HEIC'ten JPG'ye](https://abox.tools/tr/heic-jpg-donusturme/): Bir iPhone'un ürettiği fotoğraflar, her şeyin açtığı bir biçimde.

## Sorular

### Görselim bir yere yükleniyor mu?

Hayır. Dosya kendi donanımınızda kendi tarayıcınız tarafından okunur, bu kaynaktan sunulan birkaç yüz satır JavaScript tarafından çevrilir ve bir indirme olarak geri verilir. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez, hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si bağlanabileceği her adresi sayar; hiçbiri bu siteye ait değildir.

### Fotoğrafımı SVG'ye çevirir mi?

İşe yarar biçimde çevirmez ve sayfa bunu indirdikten sonra keşfetmenize bırakmak yerine söyler. Çevirme, benzer renkteki her lekeyi kendi başına bir şekle dönüştürür; bu yüzden bir fotoğraf binlerce üst üste binmiş leke ve JPEG'den kat kat büyük, yavaş açılan ve fotoğrafa benzemeyen bir dosya olarak döner. İyi çevrilen, içinde bir *şekil* olan görseldir: bir logo, bir şablon, bir imza, bir çizgi çizim, bir silüet. Tek bir nesnenin fotoğrafı içinse *özne* ayarı onu tek bir dolu silüet olarak keser; bu farklı bir iştir ve gerçekten işe yarar.

### Şekli bulmanın iki yolu arasındaki fark ne?

Sordukları soru. **Açık ve koyu**, her pikselin bir seviyeden koyu olup olmadığını sorar; bu, kâğıt üzerindeki mürekkep için tam doğru, özne ile arka plan eşit koyulukta olduğunda ise işe yaramaz. **Özne** ise arka planın ne olduğunu sorar — bunu görselin kenarı boyunca uzanan bir şeritten öğrenir, her pikseli ona göre ölçer ve ondan olmayan en büyük şeyi tutar. Bu, az çok düz bir arka plan önündeki bir nesnenin fotoğrafında işe yarar; öznenin üç kenardan taştığı kadar sıkı kırpılmış bir görselde ise başarısız olur, çünkü öğrendiği kenarlar o zaman öznenin kendisidir. Böyle olduğunda arka planı kendiniz gösterebilirsiniz.

### Çevrilen şekilde neden delikler var ya da ince kısımlar neden kayboluyor?

Çünkü görsel piksel başına bir bite indiği anda öyleydi. Görmek için *çeviricinin aldığı*nı açın: on iki piksel kadarın altında bir harfin gözü çoktan dolmuş, dikey çizgileri çoktan birleşmiştir ve hiçbir çevirme, orada olmayan bir deliği geri getiremez. Çareler daha öncede — eşiği kaydırın ya da daha büyük bir taramadan başlayın. *Özne* kipinde *şu kadara kadar boşlukları kapat* küçük delikleri kapatır; *içini tamamen doldur* ise arka planın görselin kenarından ulaşamadığı her deliği kapatır.

### Yanlış yaptığı kısımları düzeltebilir miyim?

Evet; üçüncü adımın çoğu bunun için. Çizimde olmaması gereken herhangi bir şeye tıklayın, kaybolur; yeniden tıklayın, geri gelir. Bir tıklama o rengin tüm lekesini alır; bu yüzden tek tıklama bir pikseli değil, koca bir beneği ya da koca bir kaşeyi kaldırır. Çevrili bir arka plan parçasına tıklamak onu doldurur. Düzeltmeler eşikten ayrı tutulur; dolayısıyla sonradan kaydırıcıyı oynatmak onları atmaz.

### SVG ne kadar büyük olur?

Bir şekil için görselden küçük: çevrilmiş bir silüet genellikle bir ila beş kilobayttır, bir logo birkaç kilobayt daha fazla. Sayfa indirmenin yanında tam sayıyı söyler. Bir fotoğraf içinse devasa olur; bu da o dosya için yanlış aracın bu olduğunun en açık işaretidir — ve yaklaşık bin ayrı şekilden sonra sayfa çizmeyi bırakıp bunu söyler.

### Renkli çevirir mi?

Hayır. Bu araç tek renkte tek şekil yapar ki kötü bir fotokopi yerine bir çizim olarak çıkan durum budur. Renkli çevirmek, birkaç renge indirgeyip her birini kendi katmanı olarak çevirmek demektir ve sonuç, bunu isteyenlerin çoğunu hayal kırıklığına uğratır. Renk gerekiyorsa şekli burada çevirin ve çizim programınızda doldurun.

### Sonrasında SVG ile ne yapabilirim?

Bulanıklaşmadan istediğiniz boyuta büyütün, tek bir öznitelikle rengini değiştirin, canlandırın, yazdırın ya da bir kesim makinesine veya lazere gönderin. Yanlış ayarlanacak doldurma kuralı olmayan tek bir `<path>`; dolayısıyla Illustrator, Inkscape, Figma, bir tarayıcı ve çoğu CNC yazılımı onu aynı biçimde okur.

### Görsel boyutunda bir sınır var mı?

Makinenizin sınırı var, bizim değil. 300 dpi'de taranmış bir A4 sayfası — yaklaşık dokuz megapiksel — saniyenin bir kesrinde çevrilir. Daha büyük görseller de çalışır; yalnızca daha uzun sürer ve iş bir yerlerdeki bir kuyrukta değil, kendi işlemcinizde olur.

### Ücretsiz mi, hesap gerekiyor mu?

Ücretsiz; hesap, giriş, deneme süresi ya da filigran yok. Dosya sayısında ya da boyutunda da sınır yok, çünkü bunların bedelini ödeyen bir sunucu yok — iş kendi makinenizde olur. Sitede reklam var ve masrafı o karşılıyor; reklamlara dosyalarınızla ilgili hiçbir şey verilmez.

### Çevrimdışı çalışır mı?

Evet. Sayfayı bir kez yükleyin, sonra interneti kesin; çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: görselinizi çevrilmek üzere uzağa gönderen bir araç, kabloyu çektiğiniz anda dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Görselinizin gidecek yeri yok.** Content-Security-Policy, bu sayfanın bağlanabileceği her adresi sayar ve hiçbiri bu siteye ait değildir. Burada dosyalarınızın toplanabileceği bir uç nokta yok; olsaydı bile onları oraya gönderecek bir kod da yok.
- **Burada hiçbir şey bir şey getirmez.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Aracın tamamı tek bir görselin pikselleri üzerinde aritmetik: bir eşik, bulduğu şeyin kenarında bir tur ve biraz eğri oturtma.
- **İndirilecek bir motor yok.** Çevirme işi genellikle başkasının programıdır ve web'de bu, ilk tıklamadan önce birkaç megabayt derlenmiş kodun gelmesi demektir. Burada öyle bir şey yok. Tamamı bu kaynaktan sunulan birkaç yüz satır sıradan JavaScript; sayfanın bir bekleme sonrasında değil, açıldığı anda çalışmasının nedeni de bu.
- **Google'ın yüklediği ve verilmeyen şeyler.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi Buy Me a Coffee'den gelir. Hiçbirine görselinizle ilgili hiçbir şey verilmez. Onu okuyan, eşikten geçiren ya da çeviren her satır bu kaynaktan sunulur ve depoda listelidir.
- **Çevrimdışı çalışır.** Ağı kesin; araç aynı kalır, çünkü içinde hiçbir zaman bir ağ adımı olmadı. Bu, kanıtların en basiti.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, bir görselin piksel başına bir bite nasıl indiği için `src/mask.js`, şeklin kenarındaki tur için `src/contour.js`, bir merdivenin nasıl eğriye dönüştüğü için `src/fit.js` ve ayrılacak açık-koyu olmadığında arka planın nasıl bulunduğu için `src/subject.js`.
