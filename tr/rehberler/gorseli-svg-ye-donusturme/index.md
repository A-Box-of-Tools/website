# Bir görsel SVG'ye nasıl çevrilir

Büyütülmüş bir PNG merdivendir. Bir SVG ise çizim talimatıdır, dolayısıyla her boyutta keskindir — birini öbürüne dönüştürmeye de çevirme denir. Şekillerde harika, fotoğraflarda kötü çalışır ve bu fark, başlamadan önce anlamaya değer.

[Görselden SVG'ye aracını açın](https://abox.tools/tr/gorseli-svg-ye-donusturme/): Bir şekil, bir dış çizgi. Orada olmaması gerekeni gösterin, yeter.

Son güncelleme 31 Ağustos 2026

## Kısa cevap

[Görselden SVG'ye](https://abox.tools/tr/gorseli-svg-ye-donusturme/)'yi açın, görseli içine bırakın ve kırmızı çizgiye bakın. O çizgi, dış çizginin şu anki hali; geldiği piksellerin üstüne çizilmiş. Şekli izliyorsa dosyayı alın. İçinde orada olmaması gereken bir şey varsa — bir benek, bir zımba teli, bir alt yazı, bir gölge — ona tıklayın, kaybolur.

Aşağıdakilerin tamamı, bunun işe yarayıp yaramayacağına karar veren iki soruyla ilgili: **görseliniz bir şekil mi, bir fotoğraf mı** ve **şekli bulmanın iki yolundan hangisini istiyor**.

![İki panel: solda üstüne kırmızı çevrilmiş dış çizgi çizilmiş görsel, sağda bitmiş SVG.](https://abox.tools/screens/trace-an-image-into-an-svg/outline.webp)

Dış çizgi yalnızca görselin yanına değil, üstüne çizilir. Sorunun karara bağlanabileceği tek yer orası — bir dış çizgi o piksellere göre doğru ya da yanlıştır, başka hiçbir şeye göre değil.

## Çevirme dönüştürme değildir ve fotoğraflar çevrilmez

Bir JPEG'i PNG'ye dönüştürmek bir dönüştürmedir: aynı görsel, başka biçimde anlatılmış ve yolda hiçbir karar verilmemiş. Çevirme bu değildir. Neredeyse her şeyi atar, tek bir şeyi tutar — bir şeklin sınırını — ve sonra o sınırı eğrilerle anlatır. Görselinizde belirgin bir şekil varsa istediğiniz tam olarak budur. Bir odanın fotoğrafıysa tutacak şekil yoktur ve geri gelen, benzer renkteki her lekenin kendi başına bir lekeye dönüşmüş halidir.

Bu, mühendisliğin aşmasını bekleyen bir sınırlama değil; dolayısıyla sayıların neye benzediğini dürüstçe söylemekte yarar var. Bir A4 sayfa çizgi çizim üç şekle ve altı kilobayta çevrilir. Bir sayfa el yazısı elli şekle ve yüz elli kilobayta. Tek bir megapiksel fotoğraf ise **dört bin şekle ve bir buçuk megabayta** çevrilir — JPEG'den büyük, daha yavaş açılan ve fotoğrafa benzemeyen bir dosya. Araç bu noktada çizmeyi bırakır ve bunu söyler; indirdikten sonra keşfetmenize bırakmak yerine.

![Bir fotoğraf çevrildiğinde gösterilen uyarı: binlerce ayrı şekil ve kocaman bir dosya.](https://abox.tools/screens/trace-an-image-into-an-svg/photograph.webp)

Çizgi çizim olarak çevrilen bir fotoğrafın vardığı yer. Dosya yine de indirmeniz için duruyor; sayfa yalnızca onun bir çizim olduğunu varsaymayı reddediyor.

İyi çevrilenler:

- logolar, markalar ve monogramlar;
- şablonlar, kaşeler ve kesim dosyaları;
- imzalar ve el yazısı yazılar;
- çizgi çizimler, taramalar ve çizgi roman mürekkebi;
- silüetler ve zaten beyaz üstüne siyah olan her şey.

Gerçekten işe yarayan bir fotoğraf işi var ve o farklı bir iş: bir nesneyi arka planından dolu bir silüet olarak kesmek. İkinci ayar bunun için.

## Şekli bulmanın iki yolu

Çevirme, piksel başına bir bit ister — içeride ya da dışarıda — ve buna karar vermenin iki yolu var.

**Açık ve koyu**, her pikselin bir seviyeden koyu olup olmadığını sorar ve seviye sizin için hesaplanır. Kâğıt üzerindeki mürekkep için tam doğrudur ve her logo, tarama ve şablon için istediğiniz budur. Yanıldığında genellikle görünür biçimde yanılır: ince çizgiler hayatta kalana, kâğıt onlarla birlikte grileşmeyene kadar eşiği kaydırın.

**Özne** başka bir soru sorar, çünkü bir fotoğrafta ilk sorunun cevabı yoktur. Koyu gri taş üzerinde duran koyu kırmızı bir heykel, koyu üstüne koyudur: ikisini ayıran bir parlaklık yoktur, dolayısıyla hiçbir eşik bunu yapamaz. Bunun yerine bu yol, görselin kenarı boyunca uzanan bir şeritten *arka planın* ne olduğunu öğrenir, her pikseli ona göre ölçer ve ondan olmayan en büyük şeyi tutar. Köşedeki bir alt yazı en büyük şey değildir; bu yüzden çevrilmek yerine atılır.

Önceden bilmekte yarar olan bir başarısızlık durumu var: öznenin iki ya da üç kenardan taştığı kadar sıkı kırpılmış bir fotoğraf. O zaman kenar çoğunlukla öznedir; model öznenin kendi renklerini öğrenir ve cevap tersyüz çıkar. Bunun hiçbir kısmı bir kaydırıcıyı kurcalayarak düzelmez — yanlış olan aritmetik değil, varsayımdı. *Arka planı kenarlardan öğren*'i kapatın, *tıklayınca onun yerine “bu arka plan” de*'yi işaretleyin ve arka plana iki üç kez tıklayın.

## Yanlış yaptığını göstererek düzeltmek

Bir eşik, koca bir görsel için tek bir sayıdır ve her zaman bir yerde yanlıştır: bir gölge mürekkep olur, bir zımba teli hayatta kalır, bir O'nun ortası dolar. Bunların her biri, bariz bir yerel çözümü olan yerel bir hatadır ve çözüm bir kaydırıcı daha değil — o şeyi göstermektir.

Çizimde olmaması gereken herhangi bir şeye tıklayın, kaybolur; yeniden tıklayın, geri gelir. Bir tıklama **o rengin tüm lekesini** alır; bu yüzden tek tıklama bir pikseli değil, koca bir beneği ya da koca bir kaşeyi kaldırır. Çevrili bir arka plan parçasına tıklamak ise onu doldurur; delik olmaması gereken bir delik böyle kapanır. Görsellerin altındaki satır, siz tıklamadan önce hangisi olduğunu ve ne kadar büyük olduğunu söyler; dolayısıyla görselin büyük kısmını alıp götürecek bir tıklama asla sürpriz olmaz.

Düzeltmeler eşikten ayrı tutulur; dolayısıyla sonradan kaydırıcıyı oynatmak onları atmaz ve görseli tersine çevirmek onları da çevirir — sildiğiniz bir benek, arka planda açılmış bir delik olarak geri gelmek yerine silinmiş kalır.

## İki yumuşatma sayısı ve onlara ne zaman dokunulur

**Ayrıntı**, çizginin sadeleştirilirken piksellerden ne kadar uzaklaşabileceğidir. Yaklaşık birin altında hiçbir şey yapmaz — merdivenin bir basamağı ait olduğu çizgiden tam bir piksel uzaktadır; dolayısıyla daha küçük bir tolerans her basamağı tutar ve sadeleştirilecek bir şey kalmaz. Yaklaşık ikinin üstünde ise gerçek eğrileri yemeye başlar. Siz aksini söylemedikçe şekil başına hesaplanır, çünkü tek bir sayı aynı anda hem koca bir figüre hem de bir harfin iki piksellik dikey çizgisine hizmet edemez.

**Köşe keskinliği**, bir dönüşün eğriye yuvarlanmak yerine köşe olarak kalması için dış çizginin ne kadar dönmesi gerektiğidir. Bu, kararın yalnızca yarısıdır — bir tepe noktası, komşularından yeterince uzaktaysa da köşe olarak tutulur ki bu tek başına her belirgin köşeyi yakalar — dolayısıyla bu sayı yalnızca yumuşak dönüşler hakkında karar verir. Yaklaşık yirmi derecenin altında her şey köşe olur ve bir daire çokgen olarak geri gelir.

Çoğu görselde ikisine de dokunmak gerekmez. Gerektiği iki durum için bilmekte yarar var: daha çok ayrıntı isteyen çok küçük bir metnin taraması ve genellikle daha azını isteyen, bir makinede keseceğiniz bir şekil.

## Ne alırsınız ve onunla ne yaparsınız

İçinde tek bir `<path>` olan bir dosya. Dış çizgiler bir yöne, içlerindeki delikler öbür yöne döner ve kırk delikli bir şeklin, ayarlanacak doldurma kuralı olmadan tek bir öğe olmasını sağlayan budur — dolayısıyla Illustrator, Inkscape, Figma, bir tarayıcı ve çoğu kesim yazılımı onu aynı biçimde okur.

![Son adım: çizimde kaç şekil ve nokta olduğu, boyutu ve indirme düğmesi.](https://abox.tools/screens/trace-an-image-into-an-svg/save.webp)

İndirmeden önce sayıya bir göz atmakta yarar var. Bir çizim onlarca ya da yüzlerce noktadır; binlerce nokta, görselin bir fotoğraf olduğu anlamına gelir.

Öbür yön — zaten elinizde olan bir SVG ve ihtiyacınız olan bir PNG — [kendi rehberi olan başka bir iştir](https://abox.tools/tr/rehberler/svg-yi-pnge-donusturme/). Çevirmenin hiçbir kısmı geri alınamaz: buradan çıkan SVG, şeklin yeni bir çizimidir; yapıldığı görsel değil.
