# Bir GIF kare kare nasıl düzenlenir

Burada GIF düzenleyici yok ve gerek de yok: animasyonu karelere ayıran bir ayırıcı ile karelerden animasyon kuran bir oluşturucu, ortasında bir klasör olan bir düzenleyicidir — ve klasör, düzenlemeyi sizin, görseller için zaten kullandıklarınızla yaptığınız kısımdır.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

1. **Ayırın.** [GIF ayırıcıyı](https://abox.tools/tr/gifi-karelere-ayirma/) açın ve GIF'i içine bırakın. Her kare kendi PNG'sine dönüşür — ekranda göründüğü gibi, saydamlığı korunmuş — ve ZIP'in içinde bir zamanlama listesi vardır: yeniden kurulum için yazılmış, kare başına gecikmeler.
2. **Klasörü düzenleyin.** Gitmesi gereken kareleri silin, değişmesi gerekenleri herhangi bir görsel düzenleyicide rötuşlayın, sıralamak için yeniden adlandırın. PNG dolu bir klasör, her şeyin anladığı bir biçimdir.
3. **Yeniden kurun.** Klasörü [GIF oluşturucuya](https://abox.tools/tr/gif-olusturma/) bırakın, kare sürelerini ayarlayın — ya da listeye yaslanın — paleti seçin ve dışa aktarın.

Üç adım da tarayıcınızda çalışır. Hiçbir aşamada hiçbir şey yüklenmez ve bu burada her zamankinden önemlidir: insanların onardığı GIF'ler çoğu zaman içinde hassas bir şeyin yarı görünür durduğu ekran kayıtlarıdır.

## Düzenlemeden önce ayırıcının söyleyebilecekleri

Ayırıcı her kare için gecikmeyi, konumu, boyutu ve eleme kuralını gösterir — ve bir şeye dokunmadan önce o panele bakmaya değer, çünkü çoğu GIF'in iki sürprizini açıklar.

Birincisi: kareler her zaman tam resim değildir. Birçok GIF yalnızca değişen pikselleri saklar, önceki karenin üstüne yamanmış hâlde; ayırıcı her kareyi *göründüğü gibi* ya da *saklandığı gibi* sunar ve düzenlemek için neredeyse her zaman *göründüğü gibi* olanı istersiniz; böylece her PNG kendi başına ayakta durur. İkincisi: gecikmeler tek bir sayı değil, kare başınadır. Vuruş anındaki duraklama, gerçek bir karedeki gerçek bir gecikmedir ve onu gidiş dönüşten geçiren şey zamanlama listesidir.

Sıradan kırpmalar için klasör adımı isteğe bağlı bile kalır: her ikinci ya da beşinci kareyi tutmak veya kalacakları işaretlemek zaten ayırıcının içindedir — ve kare sayısını yarıya indirmek, bir GIF'in görebileceği en etkili zayıflama kürüdür.

![Ayırıcı, bir animasyonun numaralanmış on iki karesini gösteriyor; her birinin ekranda kalma süresi yanında.](https://abox.tools/screens/edit-a-gif-frame-by-frame/apart.webp)

Her kare, numaralı, kendi gecikmesiyle. Siz düzenlemeye başlamadan önce neyi düzenlediğinizi söyleyen yarısı budur.

## Yeniden kurmanın bedeli, dürüstçe

Bir GIF en fazla 256 renk taşır ve bunlar kurulurken seçilir. Yeniden kurulum kareleri yeniden nicemler — ortak bir palet ya da kare başına en iyi renkler — ve fotoğrafik malzemede bu ikinci niceleme görünebilir. Ekran kayıtlarında ve çizimlerde, yani olağan yükte görünmez: onlar 256 rengi zaten hiç kullanmamıştır.

Oluşturucunun diğer kolları [GIF bütçe rehberindekilerle](https://abox.tools/tr/rehberler/videonun-bir-kisminden-gif/) aynıdır: daha az renk, geçişler için Floyd-Steinberg titremesi ve döngü davranışı — sonsuz, bir kez ya da bir sayı.

Ameliyatın tutup tutmadığını — ve baytların gerçekte nerede oturduğunu — görmek için sonucu [GIF çözümleyiciye](https://abox.tools/tr/gif-analiz-etme/) bırakın: kareleri baytlara karşı çizer ve ağır kare genellikle birilerinin kırpabileceği tam bir yeniden boyamadır.

O yolculuğu oluşturucu kendisi önerir: dışa aktarmadan sonra, indirme düğmesinin altındaki bir satır taze GIF'i doğrudan çözümleyiciye taşır, yüklenmiş olarak.

![GIF oluşturucu, sırayla altı kare, her birinde bir gecikme alanı ve tüm gecikmeleri bir kerede ayarlayan bir satır.](https://abox.tools/screens/edit-a-gif-frame-by-frame/together.webp)

Ve geri dönüş. Gecikmeler elle yeniden konmak zorunda ve bu, gidiş dönüşün önceden bilinmesi gereken kısmı.

## Bunu her hafta yapıyorsanız

Ayır, klasör, yeniden kur: adımlar ayrı sayfalarda yaşar, çünkü her sayfa tek bir iş yapar ve her biri hiçbir şeyin makinenizden ayrılmadığını tek başına kanıtlayabilir. Ama hepsi açık kaynaktır: MIT lisansı, araç başına bir klasör, README'leri çözücüyü, eleme kurallarını ve nicemleyiciyi anlatan bağımlılıksız ES modülleri.

GIF cerrahisi dönüp duran bir işse, bir kod aracısını [depoya](https://github.com/A-Box-of-Tools/website) yönlendirin ve ayırıcının kare tablosuyla oluşturucunun kodlayıcısını, kare silmenin tek tık olduğu tek bir sayfada katlamasını isteyin. Modüller okunmak için yazıldı ve onları alıp götürmek, lisansın tam da var olma nedenidir.
