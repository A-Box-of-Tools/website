# Bir SVG doğru boyutta PNG'ye nasıl dönüştürülür

Dönüştürmek işin kolay yarısı. Sonucun bir işe yarayıp yaramayacağına karar veren soru, kimsenin size cevabını vermediği sorudur: kaç piksel? Bu rehber o sayının nereden geldiğini ve bir çizimin piksele dönüşürken neleri kaybettiğini anlatıyor.

[SVG'den Görsele aracını açın](https://abox.tools/tr/svg-yi-pnge-donusturme/): Boyutu siz söyleyin. Bir vektörün kaybedecek kendi boyutu yok.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[SVG'den Görsele](https://abox.tools/tr/svg-yi-pnge-donusturme/)'yi açın, dosyayı bırakın ve bir boyut söyleyin. Size hangi boyutu kullanacağınızı söyleyen bir şey yoksa **en uzun kenarda 1024 piksel** iyi bir varsayılandır: hemen her şeye yetecek kadar büyük, e-postayla göndermeye yetecek kadar küçük. Biçimi PNG'de, arka planı saydamda bırakın ve dosyayı alın.

Aşağıdaki her şey, bu varsayılan yetmediğinde ne yapılacağıdır — sizin için bir sayı belirtildiğinde, iş baskıya gittiğinde ya da sonuç yanlış göründüğünde.

![Önizleme kartı: çizim istenen boyutta çizilmiş, altında piksel ölçüleri.](https://abox.tools/screens/convert-an-svg-to-png/preview.webp)

Araç, kaydetmeden önce ve kaydedeceği boyutta çiziyor. Dışa aktarmada ters giden ne varsa önce burada görünür.

## Boyut neden dosyanın değil sizin kararınız

Bir JPEG, ölçülmüş piksellerden oluşan bir ızgaradır; ne kadar büyük olduğunu sormanın bir cevabı vardır. Bir SVG ise hiç resim değildir, bir talimatlar kümesidir — buraya bir daire çiz, şu yolu şu renkte çiz — ve talimatların boyutu olmaz. Bir tarayıcı onları 16 pikselde de 4000'de de uygulayabilir ve sonuç ikisinde de aynı keskinliktedir; çünkü hiçbir şeyi ölçeklemiyordur. Yeniden çiziyordur.

Dönüşümün sizin yerinize bir sayı seçememesinin ve büyük bir sayı seçmenin size hiçbir şeye mal olmamasının sebebi budur. Bu, “daha büyük yap”ın bedava olduğu tek görsel işidir.

Çoğu SVG dosyası bir `width` ve `height` özniteliği taşır ve bir araç bunu gösterir — ama bu bir sınır değil, bir varsayılandır. `width="24"` diyen bir simge, yalnızca onu çizen kişinin aklında 24 piksellik bir araç çubuğu olduğunu söyler.

## Sayı gerçekte nereden geliyor

**Bir web sitesi için.** Görselin sayfada CSS pikseli cinsinden kapladığı boyutu alın ve önemsediğiniz ekranların piksel yoğunluğuyla çarpın. 200 piksel genişliğindeki bir yuvadaki bir logo, bir Retina dizüstü için 400 piksellik, güncel bir telefon için 600 piksellik bir dosya ister. `@2x` ve `@3x`'in anlamı budur ve onları yazan bir aracın sizi aynı hesabı üç kez yapmaktan kurtarmasının sebebi de budur.

**Bir uygulama simgesi, bir mağaza kaydı ya da bir favicon için.** Sayı yayımlanmıştır ve hesaplanacak bir şey yoktur: mağazanın sayfası ne diyorsa tam olarak o. Bir favicon için hiç piksele çevirmeyin — [bir .ico yapın](https://abox.tools/tr/rehberler/favicon-olusturma/); o, birkaç boyutu tek dosyada tutar, çünkü bir tarayıcı sekmesi, bir yer imi ve bir Windows kısayolunun hepsi başka boyut ister.

**Baskı için.** İnç cinsinden fiziksel boyutu yazıcının çözünürlüğüyle çarpın. Bir kartvizite iki inç genişliğinde ve 300 DPI'da girecek bir logo 600 pikseldir; aynı logo bir A4 sayfası boyunca, yani 8,3 inçte, yaklaşık 2500'dür. Matbaalar alışkanlıkla 300 DPI ister; odanın öbür ucundan bakılan büyük boy bir afiş için ise 150 fazlasıyla yeter.

**Bir sosyal ön izleme ya da bir OG görseli için.** Platform bir kutu belirtir — çoğu bağlantı ön izlemesi için ⁦1200 × 630⁩ — ve o kutu logonuzdan başka şekildedir. “Tamamla” ayarının varlık sebebi budur: esnetilmiş ve herkese denetlemediğinizi söyleyen bir logo yerine, kendi oranlarında ortalanmış bir çizim ve gerisini dolduran bir arka plan rengi.

Bunlardan ikisi birden geçerliyse büyük olanı kullanın. Olması gerekenden büyük bir PNG biraz daha büyük bir indirmedir; fazla küçük olan biri ise bir sonraki bölümdeki sebeple, sonradan düzeltilemez.

![Boyut kartı: boyutu söylemenin yollarını içeren bir menü, genişliğe ayarlı, 1024 yazılmış ve yanında hazır genişlikler.](https://abox.tools/screens/convert-an-svg-to-png/size.webp)

Aynı şeyi söylemenin beş yolu. Hangisinin doğru olduğu, size bir sayı mı yoksa konulacak bir yer mi verildiğine bağlıdır.

## Geri dönemezsiniz

Piksele çevirmek tek yönlüdür. Çizim bir kez PNG olduğunda, başka her resim gibi piksellerden ibarettir ve sonradan büyütmek, hiç ölçülmemiş ayrıntıyı uydurmak zorundadır — bir fotoğrafı büyütmekten aldığınız o yumuşak, bulaşmış sonucun aynısı.

Bu yüzden SVG'yi saklayın. Ana kopya odur, neredeyse her zaman küçük olan dosya odur ve gelecekteki her boyut ondan kusursuz çıkar. PNG, tek bir belirli kullanım için bir dışa aktarımdır ve başka bir boyut gerektiğinde doğru hamle, dışa aktardığınızı boyutlandırmak değil yeniden dışa aktarmaktır.

Bir PNG'yi SVG'ye geri dönüştürdüğünü iddia eden yazılımlar var. Yaptıkları şey iz sürmektir: bir piksel ızgarasını hangi eğrilerin açıklayabileceğini tahmin etmek. Düz iki renkli çizimlerde şöyle böyle çalışır, başka her şeyde pahalı bir saçmalık üretir ve özgün çizimde olanı hiçbir zaman geri getirmez.

## Piksele dönüştüğü anda değişen üç şey

Yanlış görünen, piksele çevrilmiş bir SVG neredeyse her zaman şu üç sebepten biri yüzünden yanlış görünür ve üçünü de dışa aktardıktan sonra değil önce bilmeye değer.

**Metin, makinede hangi yazı tipi varsa onunla çizilir.** Metin içeren bir SVG yazı tipini içermez — birinin adını verir ve bulmayı çizicinin işine bırakır. Yazı tipi kurulu değilse bir yedeği kullanılır ve o yedeğin harf biçimleri ve genişlikleri farklıdır; yani metin yeniden akabilir ya da taşabilir. Yazı tipini bir web adresinden çeken bir dosyanın hâli daha da kötüdür: bir `<img>` üzerinden piksele çevrilen bir SVG'nin hiçbir şey getirmesine izin verilmez, yani hiçbir şey gelmez.

Çözüm her tasarımcının zaten bildiği çözümdür: SVG'yi dışa aktarmadan önce **metni dış hatlara çevirin** (Illustrator buna Create Outlines, Figma Flatten, Inkscape Object to Path diyor). Harfler geometriye dönüşür, yazı tipi önemsizleşir ve resim her makinede aynı görünür. Bunu bir kopya üzerinde yapın — dış hatlara çevrilmiş metin artık metin olarak düzenlenemez.

**Saç teli çizgiler grileşir ya da kaybolur.** Seçtiğiniz boyutta bir pikselden ince düşen bir çizgi düz bir çizgi olarak çizilemez, yani silik çizilir. Zarif bir logonun 64 pikselde soluk görünmesinin ama aynı dosyanın 512'de kusursuz görünmesinin sebebi budur. Gereken küçük bir boyutsa cevap başka bir dışa aktarma ayarı değil, daha kalın çizgileri olan sadeleştirilmiş bir çizimdir — bir faviconun bir kelime logosu değil bir sembol olmasının sebebi de aynıdır.

**Canlandırma durur.** Canlandırmalı bir SVG tek bir kareye dönüşür: ilk kare neyse o. Bunu değiştiren bir dışa aktarma ayarı yoktur. Harekete ihtiyacınız varsa, başka bir yolla yapılmış bir GIF'e ya da videoya ihtiyacınız var demektir.

## Saydamlık ve hangi biçimin seçileceği

Bir sebebiniz yoksa **PNG**. Kayıpsızdır, saydamlığı korur ve sert kenarlı düz renk — bir çizimin büyük kısmı bundan oluşur — onun içinde iyi sıkışır. Piksele çevrilmiş bir logo genellikle JPEG olacağından hem daha temiz hem de *daha küçük* bir PNG olur.

**JPEG**'in saydamlığı hiç yoktur. Her saydam pikselin bir renge dönüşmesi gerekir ve sizin yerinize bir renk seçen olmazsa siyah olur — insanların hata sandığı o siyah kutu içindeki logo sonucu buradan gelir. Ayrıca tam da bu tür bir resimde en kötü görünen biçimde kayıplıdır: her sert kenarın etrafında bir benek halkası. Bir şey ısrar ettiğinde kullanın.

**WebP**, PNG'nin yaptığı her şeyi daha küçük bir dosyada yapar ve güncel her tarayıcı tarafından okunur. Kullanmama sebebi tarayıcıdan sonra olanlardır: eski yazılımlar, bazı matbaalar ve hatırı sayılır sayıda yükleme formu hâlâ bir tanesini açmıyor.

PNG ile bir arka plan rengi seçmek de gayet sıradan bir istektir. Saydamlık yalnızca görselin üstüne düşeceği şey tahmin edemeyeceğiniz bir renk olduğunda işe yarar; bunun beyaz bir sayfa olduğunu zaten biliyorsanız beyaza düzleştirmek koca bir sürpriz sınıfından kurtarır.

## Dışa aktarım boş ya da yanlış çıktığında

**Boşluktan başka bir şey yok.** Genellikle kök öğede eksik bir `xmlns` özniteliği. Onsuz bir dosya, bir görsel etiketi açısından SVG değildir ve hiçbir şey olarak çizilir. Dosyayı bir tarayıcıda açmak hızlı denetimdir: tarayıcı da hiçbir şey göstermiyorsa sorun dönüştürücü değil dosyadır.

**Çizim küçük, sol üst köşede.** Dosyada bir `width` ve `height` var ama `viewBox` yok; yani ölçeklenecek bir koordinat sistemi yok ve çizim daha büyük bir tuvalde kendi özgün birimlerini koruyor. İyi bir dönüştürücü sizin için bir viewBox koyar; sizinki koymadıysa kök öğeye elle `viewBox="0 0 *genişlik* *yükseklik*"` eklemek bunu düzeltir ve dosya düz metin olduğu için bunu yapabilirsiniz.

**Resmin bir kısmı eksik.** Dosyadaki bir şey çizimi içermek yerine bir adresi göstermiş — bağlantı olarak saklanmış gömülü bir fotoğraf, bir stil dosyası, bir yazı tipi. Bunları getirmeyi reddeden bir çizici doğru olanı yapıyordur ve bu, bir yerden indirdiğiniz bir SVG'nin onu yapana geri rapor vermesini engelleyen reddin aynısıdır. Çizim programından, görseller gömülü olarak yeniden dışa aktarın.

**Çok büyük bir boyutu reddediyor.** Tarayıcılar bir tuvalin ne kadar büyük olabileceğine tavan koyar ve nerede olduğu konusunda anlaşamazlar: kenarda kabaca 16.000 pikselin ötesinde hiçbir şey geri gelmez ve bir iPhone ya da iPad'deki Safari çok daha erken, yaklaşık ⁦4096 × 4096⁩'da pes eder. Sizi uyaran bir araç, sizi boş bir dosyadan kurtarıyordur; çünkü bir tarayıcı tükendiğinde bir hata iletisi değil onu üretir.

## Bunların hiçbirinin bir yüklemeye ihtiyacı yok

Bir SVG'yi piksele çevirmek, her tarayıcının günde binlerce kez yaptığı bir şeydir — bir web sayfasında bir simge çizen mekanizmanın aynısı. Çiziminizin bir PNG olarak çıkmak için bir sunucuya gidip gelmesinin teknik bir sebebi yoktur ve buradaki araç onu hiçbir yere göndermez: sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir.

Bu, SVG'de her zamankinden önemlidir; çünkü bir SVG bir resim değil bir belgedir. İçinde bir betik ve uzak bir adres bulunabilir ve bir ajansın size gönderdiği bir logo, sizin yazmadığınız bir dosyadır. Bir görsel etiketi üzerinden çizildiğinde, belirtimin *güvenli durağan kip* dediği yerdedir: betik çalışamaz ve adresle hiçbir zaman iletişim kurulmaz. Bunu web sitesi değil tarayıcı zorunlu kılar.

Size söylenmesindense denetlemeyi tercih ederseniz sayfayı yükleyin, internet bağlantısını kesin ve yine de bir şey dönüştürün. [Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) herhangi bir araçta çalıştırabileceğiniz üç denetim daha anlatıyor.
