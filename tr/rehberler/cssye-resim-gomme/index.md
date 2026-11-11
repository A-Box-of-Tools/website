# Bir resim CSS'inizin içine ne zaman konur, ne zaman konmaz

Bir stil dosyasına yazılmış bir görsel onunla birlikte gelir: ikinci bir istek yok, bekleme yok. Ayrıca dosya olmaktan çıkar — yani kendi başına önbelleğe alınamaz ve çevresindeki her şey değiştiğinde yeniden indirilir. Bu rehber bu takasın nerede yapmaya değdiğini ve nerede sessizce değmediğini anlatıyor.

[Görselden Data URI'ye aracını açın](https://abox.tools/tr/resmi-base64e-donusturme/): Resmin tamamı tek satır metin olarak. Doğrudan CSS ya da HTML içine yapıştırın.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Görselden Data URI'ye](https://abox.tools/tr/resmi-base64e-donusturme/)'yi açın, resmi bırakın, *Bir CSS özel özelliği*'ni seçin ve satırı stil dosyanızın başına yapıştırın. Sonra ihtiyacınız olan her yerde `background-image: var(--logo)` olarak kullanın.

Bunu resim küçükse — bir simge, bir madde imi, bir ok, bir desen — ve her sayfada gerekiyorsa yapın. Bir fotoğrafla yapmayın. Aşağıdaki her şey bu iki cümlenin neden farklı olduğu ve hangisine baktığınızı nasıl anlayacağınızla ilgili.

## Bir data URI aslında nedir

Bir şeyi göstermek yerine onu içeren bir adres. Bir stil dosyasının normalde

```
background-image: url("logo.png");
```

dediği ve tarayıcının gidip `logo.png`'yi getirdiği yerde, bir data URI

```
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...");
```

der ve getirilecek bir şey yoktur: resim, karakterlerle yazılmış olarak zaten oradadır. Üç parçası vardır. `data:` şemadır. `image/png` ortam türüdür ve tarayıcı ona tamamen inanır — buna aşağıda döneceğiz. Virgülden sonraki her şey dosyanın kendisidir.

Bütün fikir budur. Bir numara ya da bir kurnazlık değildir; 1998'den beri standartların içindedir ve o zamandan bu yana çıkmış her tarayıcıda çalışır.

## Size kazandırdığı şey: bir gidiş dönüş eksiği

Kazanç bant genişliği değildir. İstektir.

Bir tarayıcı, `logo.png`'yi ondan söz eden stil dosyasını okuyana kadar isteyemez ve o stil dosyasını da getirene kadar okuyamaz. Yani sıradan bir arka plan görseli, sayfa yüklemesinde en az iki gidiş dönüş derinliktedir ve yavaş bir ağdaki bir telefonda bir gidiş dönüş, dosya ne kadar küçük olursa olsun birkaç yüz milisaniye olabilir. 600 baytlık bir ok işareti aktarım olarak neredeyse hiçbir şeye mal olmaz ama yine de gelmesi çeyrek saniye tutabilir.

Satır içine alındığında stil dosyasıyla birlikte gelir. Bütün kazanç budur ve sayfanın üst kısmında görünen küçük bir simge için gerçek bir kazançtır.

## Bedeli: üçte bir, sonra da önbellek

**Base64 yaklaşık üçte bir ekler.** Dosyanın üç baytı dört karaktere dönüşür; çünkü rastgele baytları yalnızca bir URL'nin izin verdiği karakterlerle yazmanın bedeli budur. Bundan kaçan akıllı bir kodlayıcı yoktur. 9 KB'lik bir PNG, 12 KB'lik stil dosyası eder.

**Sıkıştırma bunu geri vermez.** İnsanların olmamış saydığı kısım budur. Gzip ve Brotli fazlalık bularak çalışır; bir PNG, bir JPEG ve bir WebP ise çoktan sıkıştırılmıştır — içlerinde çok az fazlalık kalmıştır ve base64 fazlalık eklemez. Pratikte üçte birin onda biri kadarını geri alırsınız, tamamını değil. (Bir SVG bunun tersi bir durumdur ve bir sonraki bölüm de onunla ilgili.)

**Dosya olmaktan çıkar.** Bu, muhtemelen yapacağınız hiçbir ölçümde görünmeyen bedeldir ve boyut büyüdüğünde asıl önemli olan da odur:

- **Kendi başına önbelleğe alınamaz.** Sıradan bir görsel bir kez getirilir ve bir yıl boyunca yeniden kullanılır. Satır içine alınmış biri stil dosyasının parçasıdır, yani stil dosyasının önbellek kaydıyla birlikte yaşar ve ölür.
- **Bir şeyi değiştirmek her şeyi yeniden indirtir.** Bir kenar boşluğunu düzeltin, yeni bir stil dosyası yayına alın ve her ziyaretçi, iki yıldır değişmemiş olan satır içi resmi de onunla birlikte yeniden indirsin.
- **Kritik yolun üstündedir.** Bir stil dosyası çizimi engeller. Bir görsel engellemez. Bir resmi satır içine almak onu ikinci sınıftan birinciye taşır: resim dâhil her şey gelene kadar sayfa boyanamaz.
- **Paralel getirilemez.** Tarayıcılar aynı anda birçok şey indirir. Satır içi bir resim ayrı bir şey değildir, yani bundan hiç pay almaz.

Kaba eşikler — bunlar bir tarayıcının farklı bir şey yaptığı yerler değil, tavsiyenin değiştiği yerlerdir: yaklaşık 2 KB'nin altında açık bir kazançtır; 10 KB'ye kadar her sayfada bulunan bir şey için genellikle hâlâ değer; 50 KB'yi geçtiğinde hata iletisi olmayan bir hatadır. [Araç](https://abox.tools/tr/resmi-base64e-donusturme/) her sonucun hangi aralığa düştüğünü, yanında karakter sayısıyla birlikte söyler.

![Çıktı kartı: base64 bir veri URI'si içeren bir CSS kuralı, yanında özgün dosya boyutu ile kodlanmış boyut.](https://abox.tools/screens/embed-an-image-in-css/output.webp)

Kodlanmış kopya, geldiği dosyadan yaklaşık üçte bir büyüktür. Bu bölümün konusu olan bedel budur ve keşfedilmeye bırakılmak yerine yazılı durur.

## Bir SVG'yi asla base64 yapmayın

Bu, satır içi görsellerdeki en yaygın tek hatadır ve dışa aktarıcılar ile derleme eklentileri bunu insanlar kadar sık yapar.

Bir SVG metindir. Bir URL zaten metin taşır. Yalnızca bir avuç karakterin kaçırılması gerekir — `%`, `#`, `<`, `>` ve onu sardığınız tırnak — ve geri kalan her şey tam olduğu gibi bırakılabilir. Böyle kodlamak size, aynı dosyanın base64'ünden tipik olarak beşte bir kısa ve sonrasında gürültü gibi değil metin gibi sıkışan bir URI verir.

Ayrıca hâlâ okunabilir:

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E...");
```

`viewBox`'ı görebilirsiniz. Dolgu rengini hiçbir şeyi çözmeden düzenleyicinizde değiştirebilirsiniz. Aynı dosyayı base64 yapın; kimsenin bir daha asla dokunmayacağı bir harf duvarına dönüşsün. [Görselden Data URI'ye](https://abox.tools/tr/resmi-base64e-donusturme/), SVG olduğu anlaşılan her şey için bunu kendiliğinden yapar ve `;base64` konusunda ısrar eden nadir araç zincirleri için bir onay kutusu bulundurur.

## Yalnızca SVG'leri bozan tırnak hatası

CSS, `url()`'yi tırnaksız yazmanıza izin verir ve sıradan bir dosya adı için bu sorunsuzdur:

```
background-image: url(logo.png);
```

Aynısını yüzde kodlamalı bir SVG'yle yapın, bozulsun. Tırnaksız bir `url()` belirteci ilk boşlukta, parantezde, tırnakta ya da denetim karakterinde biter — bir SVG ise her öznitelik ve bir yoldaki her sayı arasında boşluk doludur. Bildirim böylece geçersiz olur, CSS geçersiz bildirimleri sessizce atar ve elinizde ne arka plan ne de bir hata kalır.

Çözüm, her seferinde tırnaktır:

```
background-image: url("data:image/svg+xml,%3Csvg ... %3E");
```

Bir kodlayıcının boşlukları kaçırmasına gerek olmamasının sebebi de budur — tırnak içindeki bir URL'nin içinde gayet yasaldırlar ve her birini `%20` olarak kaçırmak, dosyadaki her boşluk için üç karaktere mal olurdu. İki karar birlikte gider: URI'yi tırnaklayın, boşluklara dokunmanız gerekmesin. Aracın ürettiği her şeklin tırnaklanmasının sebebi tam olarak budur.

## Ortam türü doğru olmak zorunda

Bir data URI kendi türünü bildirir ve tarayıcı sözüne inanır. Getirilen bir dosyada olduğu gibi bir koklama yedeği yoktur: aslında JPEG olan bir şey için `image/png` deyin, resim görüntülenmesin ve hiçbir işe yarar yerde bir ileti çıkmasın.

Bunun önemi, dosya uzantılarının yalan söylemesindendir. JPEG olarak dışa aktarılıp `logo.png` diye yeniden adlandırılmış bir fotoğraf, bir diskte bulunması gayet sıradan bir şeydir. Bir görsel dosyasının ilk birkaç baytı ise ne olduğunu tereddütsüz söyler — her biçimin bir imzası vardır — yani bir araç adına değil dosyanın kendisine bakmalıdır. Buradaki araç bakar ve ikisi çeliştiğinde size söyler.

Kafa karıştırıcı biçimde çuvalladıkları için bilmeye değer iki biçim var. Bir iPhone'un fotoğraf çektiği biçim olan **HEIC** ve tarayıcıların ürettiği **TIFF**; ikisi de Safari dışında hiçbir tarayıcının çizmeyeceği ama gayet geçerli data URI'ler üretir. URI bozuk değildir; biçim, düpedüz webin desteklediği bir biçim değildir. Önce dönüştürün.

## Yayımlamak istemediğiniz üstveri

Bir data URI, dosyanın baytı baytına bir kopyasıdır. Hiçbir şey çözülüp yeniden kodlanmaz ki genellikle amaç da budur — kalite kaybı olmaz — ama bu aynı zamanda dosyadaki diğer her şeyin de birlikte geldiği anlamına gelir.

Telefondan doğrudan çıkan bir fotoğraf EXIF taşır: çekildiği yerin GPS koordinatları, zaman damgası, kamera modeli ve çoğu zaman seri numarası. Bu, dosyanın 30 KB'si olabilir. Satır içine alındığında, stil dosyanızda 40 KB base64'e, her sayfanın kritik yoluna ve bir depoya işlenmiş, kimsenin bakmayı akıl etmeyeceği bir biçimdeki bir ev adresine dönüşür.

Önce resme dokunmadan kabı yeniden yazan [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/) ile temizleyin; onun da [bir rehberi var](https://abox.tools/tr/rehberler/exif-ve-gps-verisini-silme/). Görselden Data URI'ye, bir JPEG, PNG ya da WebP içinde ne kadar üstveri olduğunu okur ve siz bir şey kopyalamadan önce söyler.

## Elde ettikten sonra onu nereye koymalı

Resim tek bir kuralda görünüyorsa URI'yi o kurala koyun. Birden fazlasında görünüyorsa — ki üzerine gelme durumunu ve koyu temayı da sayınca simgeler genellikle öyledir — onu bir kez özel özellik olarak tanımlayın:

```
:root {
  --icon-search: url("data:image/svg+xml,%3Csvg ... %3E");
}

.search-field { background-image: var(--icon-search); }
.search-button::before { content: var(--icon-search); }
```

Dört kurala yapıştırılmış 3 KB'lik bir URI, 12 KB stil dosyası ve simge değiştiğinde düzenlenecek dört yer demektir. Özel özellik, her birinden bir tane demektir. Ayrıca tema değiştirmeyi çalıştıran şekil de budur: bir ortam sorgusunun içinde `--icon-search`'ü yeniden tanımlayın, onun her kullanımı buna uysun.

CSS yerine bir `<img>` etiketi için `width` ve `height` ekleyin. Satır içine alınmış bir görsel anında yüklenir, yani eksik bir boyut, görülemeyecek kadar hızlı gerçekleşen ama yine de aleyhinize sayılan bir düzen kaymasıdır. İstisna SVG'dir: yalnızca bir `viewBox` taşıyan bir SVG'nin kendine ait bir piksel boyutu yoktur ve tarayıcının ⁦300×150⁩ varsayılanını etikete yazmak, ölçeklenebilir bir resmi kimsenin seçmediği bir boyuta çakar.

İçine koyacak doğru bir şeyiniz yoksa `alt`'u boş bırakın. Resmin bir anlam taşıyıp taşımadığını ya da süs olup olmadığını yalnızca siz bilirsiniz ve bir dosya adından tahmin edilmiş bir açıklama, ekran okuyucu kullanan biri için hiç açıklama olmamasından daha kötüdür.

![Biçim kartı: çıktının ne olacağını seçen düğmeler; bir CSS arka plan kuralı, bir img etiketi ya da yalın URI, bir de base64 mü düz SVG mi anahtarı.](https://abox.tools/screens/embed-an-image-in-css/shape.webp)

Nereye gideceği ne çıkacağına karar verir, bu yüzden kopyala yapıştır alıştırmasına bırakılmadan önce sorulur.

## Cevabın “yapmayın” olduğu durum

Resim kodlandığında yaklaşık 50 KB'yi geçiyorsa satır içine almak yanlış araçtır ve kodlamada ne kadar özenli olursanız olun bunu düzeltmez. Denemeye değer sırayla alternatifler:

- **Küçültün.** Satır içine alınamayacak kadar büyük olan görsellerin çoğu genel olarak da fazla büyüktür. [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/) bir fotoğrafı söylediğiniz boyuta indirir ve [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/) piksel boyutlarını düzenin gerçekten kullandığına düşürür — ki asıl sorun çoğu zaman budur.
- **SVG olarak yeniden çizin.** 40 KB'lik bir PNG olarak dışa aktarılmış bir simge sık sık 900 baytlık bir SVG'dir. Bu bir sıkıştırma farkı değil bir biçim farkıdır ve retina sorununu da çözer.
- **Dosya olarak bırakın ve ön yükleyin.** `<link rel="preload" as="image">`, baytları kritik yola taşımadan getirmeyi hemen başlatır. Satır içine almanın kazancının çoğunu, önbellek bedelinin hiçbirini almadan verir.

## Bunların hiçbirinin bir yüklemeye ihtiyacı yok

Bir dosyayı base64 olarak kodlamak bir aritmetiktir. Tarayıcının en başından beri sahip olduğu iki işlevdir — `btoa` ve `encodeURIComponent` — ve bir resmin başka türlü yazılmak için bir sunucuya gidip gelmesinin en ufak bir teknik sebebi yoktur. Bunu yapmak için dosyanızı yükleyen her dönüştürücü, onu sizin sebeplerinizle değil kendi sebepleriyle yüklüyordur.

[Buradaki araç](https://abox.tools/tr/resmi-base64e-donusturme/) onu hiçbir yere göndermez: sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Size söylenmesindense denetlemeyi tercih ederseniz sayfayı yükleyin, internet bağlantısını kesin ve yine de bir şey kodlayın. [Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) herhangi bir araçta çalıştırabileceğiniz üç denetim daha anlatıyor.
