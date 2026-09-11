# Bir fotoğraf sizin hakkınızda ne söyler ve bunu nasıl çıkarırsınız

Telefondan doğrudan çıkan bir resim tipik olarak çekildiği yerin koordinatlarını, saniyesine kadar saati ve kamera hakkında, onu aynı cihazdan çıkan her fotoğrafa bağlamaya yetecek kadar bilgi taşır. Bunların hiçbiri ekranda görünmez. Bu rehber içinde ne olduğunu ve nasıl sileceğinizi anlatıyor.

[EXIF Görüntüleyici ve Silici aracını açın](https://abox.tools/tr/exif-verisi-silme/): Bir fotoğrafın sizin hakkınızda ne söylediğini görün. Sonra onu çıkarın.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/)'yi açın, fotoğrafları bırakın ve “Tüm üstveriyi sil”e basın. Her etiket, XMP ve IPTC blokları, yorumlar ve gömülü küçük resim, listedeki her fotoğrafta tek seferde gider. Resmin kendisine dokunulmaz — yeniden sıkıştırılmaz, çözülmez, tek bir pikseli bile değişmez.

Bunu yapmadan önce içinde ne olduğuna bakmaya değer. Genellikle insanların beklediğinden fazlasıdır ve liste, bunu yapmanın gerekçesinin kendisidir.

## Bir fotoğrafın içinde gerçekte ne var

Bir JPEG yalnızca sıkıştırılmış bir resim değildir. Bir kaptır ve resmin yanında, kameranızın, telefonunuzun ya da düzenleyicinizin oraya yazdığı birkaç bilgi bloğu durur.

- **EXIF.** Ana blok. Kamera markası ve modeli, mercek, pozlama ayarları, ISO, saniyesine kadar tarih ve saat, resmin gösterilmesi gereken yön ve — kamera için konum servisleri açık bir telefonda — birkaç metre hassasiyetinde bir GPS konumu. Sık sık bir kamera gövdesi seri numarası da.
- **GPS.** Teknik olarak EXIF'in bir parçası ve ayrıca adını anmaya değer; çünkü en çok önem taşıyan odur. Derece, dakika ve saniye olarak yazılır ki bu, bir adrese benzememeyi çok iyi başaran bir biçimdir.
- **XMP.** Düzenleyicilerin yazdığı bir XML paketi. Adınızı, yazılımınızı, puanları, anahtar kelimeleri, düzenleme geçmişini ve EXIF alanlarının bazılarının bir kopyasını taşıyabilir — yalnızca EXIF'i silmenin neden yetmediğinin sebebi de budur.
- **IPTC.** Basında ve stok fotoğrafçılığında kullanılan, daha eski bir altyazı, imza, künye ve telif alanları bloğu.
- **Gömülü küçük resim.** Görüntünün küçük ikinci bir kopyası. Dosya yazıldığında üretilir ve resim düzenlendiğinde her zaman yeniden üretilmez — kırpılmış bir fotoğrafın, kırpılıp atılan kısmın küçük resmiyle yolculuk edebilmesinin sebebi budur.
- **Üretici notu.** Belgelenmemiş bir üretici verisi bloğu. Üretici dışında hiç kimse içinde ne olduğunu tam olarak bilmez.

![İnceleyici: bir fotoğrafın küçük görseli ve yanında içinde bulunanların listesi; fotoğraf makinesinin markası ve modeli, çekildiği tarih ve GPS koordinatları.](https://abox.tools/screens/remove-exif-and-gps-data/inside.webp)

Telefonla çekilmiş bir fotoğrafın gerçekte taşıdıkları. Çoğu kişi hiç bakmamıştır; bu rehberin var olma nedeni de budur.

## Bunu gerçekte kimler görüyor

Bu konuda kesin olmaya değer; çünkü hem telaşlı hem de küçümseyici sürümler yanlıştır.

**Büyük sosyal ağların çoğu, siz paylaştığınızda üstveriyi siler.** Facebook, Instagram ve X yüklenen görselleri yeniden kodlar ve bu sırada etiketleri düşürür. Bu bir iyilik değildir — veriyi kendi taraflarında tutarlar — ama bu hizmetlere gönderilen bir fotoğrafın koordinatlarını her izleyene vermediği anlamına gelir.

**Neredeyse başka her şey onu korur.** Bir e-posta eki. Çoğu sohbet uygulamasında fotoğraf yerine “belge” olarak gönderilmiş bir dosya. Bir forumdaki resim, bir ilan, kişisel bir site, paylaşılan bir sürücü, bir hata raporu, bir destek talebi. Bunların hepsinde dosya el değmemiş hâlde varır ve onu indiren herkes etiketleri, işletim sistemleriyle birlikte gelen araçlarla okuyabilir.

Gerçekçi riskler dramatik değil sıradandır: evde fotoğraflanmış bir satış ilanı, bir çocuğun okulunda çekilmiş resmi, hepsi tek bir kamera seri numarasını paylaşan fotoğraflar paylaşan görünüşte anonim bir hesap, aslında martta çekilmiş bir “geçen hafta çektim”.

## Neden yeniden kaydetmek olmasın?

Bir fotoğrafı bir düzenleyiciden ya da bir sıkıştırıcıdan geçirip yeniden kaydetmek üstveriyi gerçekten siler — resim piksellere çözülür ve yeniden kodlanır ve piksellerle dolu bir tuval hiçbir etiket taşımaz. İşe yarar ve size kaliteye mal olur; çünkü o yeniden kodlama kayıplıdır.

Üstveriyi düzgünce silmek hiçbir şeye mal olmaz. Etiketler, sıkıştırılmış resmin içinde değil *etrafındaki* kapta durur; yani onları temizlemek, bir listeden girdi silmek ve listeyi geri yazmaktır. Sıkıştırılmış görüntü verisi baytı baytına kopyalanır ve sonuç tam olarak aynı piksellere çözülür. Bir dönüştürücü yerine bir üstveri aracı kullanmanın bütün sebebi budur.

İstisna, zaten yeniden kodlayacak olmanızdır. Fotoğrafı zaten sıkıştırıyor ya da boyutlandırıyorsanız etiketler bir yan etki olarak gider ve ikinci bir adıma ihtiyacınız olmaz.

## Korunacak tek şey: yön

Telefonlar siz telefonu çevirdiğinizde resmi döndürmez. Onu sensörün gördüğü gibi kaydeder ve gösterim için nasıl çevrilmesi gerektiğini söyleyen bir Yön etiketi ekler. Her etiketi silin, bazı görüntüleyiciler fotoğrafınızı yan göstersin.

Buradaki aracın, varsayılan olarak açık olan bir “yön etiketini koru” seçeneği bulunmasının sebebi budur. Yalnızca o etiketi içeren ve başka hiçbir şey içermeyen minik bir EXIF bloğu geri yazar ve bunu yalnızca gerçekten ihtiyacı olan fotoğraflar için yapar. GPS, zaman damgaları, seri numarası ve gerisi yine de gitmiştir.

Dosyanın hiç EXIF taşımamasını tercih ederseniz onu kapatın — ve sonra göndermeden önce sonuca bakın; çünkü alışıldık sonuç yan yatmış bir fotoğraftır.

![Temizleme kartı: her şeyi kaldıran bir düğme, yanında yön etiketini ve renk profilini koruyan anahtarlar.](https://abox.tools/screens/remove-exif-and-gps-data/strip.webp)

Hepsi çıksın, korunmaya değen iki şey dışında. Yön, gittiğinde bir dizi fotoğrafın yarısını yan yatıran şeydir.

## Silmek yerine düzenlemek

Her şeyi silmek çoğu insan için doğru cevaptır. Bazen değildir: bir fotoğrafçı telif satırının ve kamera ayarlarının korunmasını ve yalnızca konumun gitmesini isteyebilir; bir arşivci, kamera saati yanlış olduğu için yanlış olan bir tarihi düzeltmek zorunda kalabilir.

İkisi de mümkün. Konum tek başına silinebilir ve metin etiketleri, tarihler, ISO, yön ve çözünürlük yerinde düzenlenebilir.

Yalnızca bu araç için değil, bunu yapan her araç için geçerli bir çekince: dosyayı yazmak EXIF bloğunu yeniden kurar ve bir üretici notu *özgün* bloğun içine ofsetler barındırır. Bu yüzden yeniden kurulmuş bir üretici notu artık üreticinin kendi yazılımı tarafından okunamayabilir. Bu sizin için önemliyse üretici notunu silin ya da dosyayı düzenlemeden bırakın.

## Biçimler ve bu yolla yapılamayanlar

JPEG, PNG ve WebP'nin hepsi temizce yeniden yazılabilir ve buradaki aracın işlediği üç biçim de bunlardır.

Bir iPhone'un varsayılan olarak kaydettiği biçim olan HEIC ve AVIF, iç içe atomlardan kurulmuş kap biçimleridir ve tamamen başka bir ayrıştırıcı ister. Araç onları tanır ve bozuk bir dosya üretmek yerine bunu söyler. Elinizde bir HEIC varsa, onu JPEG'e dönüştürmek üstveriyi dönüşümün bir yan etkisi olarak siler.

Çıplak bir TIFF de işlenmez ve bunun daha ilginç bir sebebi var: bir TIFF'te üstveri ile piksel verisi aynı ofsetlerle adreslenir; yani etiketleri silmek, resmin kendi adreslemesini yeniden yazmak demektir. Yapılabilir bir şeydir ve başka bir iştir.

## Edinmeye değer bir alışkanlık

Paylaştıktan sonra değil, önce bakın. Etiketleri okumak birkaç saniye sürer ve bulgular listesi, bilmeye değen şeylerin adını — konum, zaman damgaları, seri numaraları — her etiketin bulunduğu tam tablodan önce verir; böylece ne arayacağınızı bilmeniz gerekmez.

Konum bilerek önce ondalık derece olarak gösterilir. “51 derece, 30 dakika, 26 saniye”, bir fotoğrafın çekildiği binanın adını verdiğini apaçık kılmaz. Bir haritaya yapıştırabileceğiniz bir ondalık çifti kılar.

## İçinde ne olduğunu öğrenmek için fotoğrafı yüklemeyin

Bu sorunun alışıldık çözülme biçiminde ayrı bir ironi var: fotoğrafının neyi ele verdiğinden endişelenen biri, öğrenmek için onu bir web sitesine yüklüyor. Site artık fotoğrafa, koordinatlara, zaman damgasına ve seri numarasına ve resmin kendi sahip olduğu bir diskteki bir kopyasına sahip.

Bunun bir sebebi yok. Bir JPEG'in etrafındaki kabı okumak ve yeniden yazmak, bir tarayıcının gayet iyi çalıştırdığı birkaç yüz satırlık ayrıştırmadır; buradaki aracın hiç ağ özelliği olmamasının sebebi de budur: `fetch` yok, `XMLHttpRequest` yok, bir şey denese bile bir dosya gönderebilecek hiçbir şey yok. Bir kez yükleyin, bağlantıyı kesin, çalışmaya devam etsin.

[Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) bu iddiayı ister bu sitede ister başka bir yerde nasıl denetleyeceğinizi anlatıyor — ve denetlemeye en çok değen dosya türü budur.
