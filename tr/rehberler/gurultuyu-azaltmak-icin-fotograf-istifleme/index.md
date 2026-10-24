# Gürültüyü azaltmak ya da insanları kaldırmak için fotoğraflar nasıl istiflenir

Bir seri kare, içlerinden herhangi birinin taşıdığından daha fazla bilgi taşır. Ortalamalarını almak gürültüyü söndürür; her pikselin ortadaki değerini almak ise yalnızca bir süre orada olmuş her şeyi siler. Hangisini istediğiniz tümüyle neyin kımıldadığına bağlıdır.

[Görüntü istifleyici aracını açın](https://abox.tools/tr/goruntu-istifleme/): Yirmi kare tek karede, yirmi yükleme ve RAW dönüştürücü olmadan.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

[Görüntü istifleyiciyi](https://abox.tools/tr/goruntu-istifleme/) açın, serinin tamamını içine bırakın ve neden kurtulmak istediğinize göre yöntemi seçin:

- **Gürültü** ve hiçbir şey kımıldamadıysa — ortalama.
- **Gürültü** ve bir şey kımıldadıysa — sigma kırpma.
- **İnsanlar, arabalar, bir uçak** — medyan.
- **Yıldız izine dönüşmesini istediğiniz karanlık bir gökyüzü** — açma.
- **Neredeyse hiç alan derinliği olmayan bir makro çekim** — odak istifleme.

Makine elinizdeyse hizalamayı açık bırakın, tripottaysa kapatın. RAW dosyaları doğrudan girebilir; önce geliştirmeye gerek yoktur.

Aşağıdaki her şey, o beş satırın neden öyle olduğunu anlatıyor.

## Bir seri neden tek bir kareden fazlasını taşır

Zayıf ışıkta çekilmiş bir fotoğraf, görüntü artı gürültüdür ve gürültü her seferinde başkadır. İstiflemeyi işe yaratan da işte bu son kısımdır. Aynı çekimi on altı kez yapın: görüntü on altısında da aynıdır, gürültü ise değil; dolayısıyla ortalamalarını almak görüntüyü bırakır ve gürültünün çoğunu söndürür.

İyileşme, kare sayısının kareköküdür. Dört kare gürültüyü yarıya indirir. On altı kare dörtte bire. Yüz kare onda bire. Üstünde bulunmak için zalim bir eğridir bu — on altı kareden altmış dört kareye çıkmak aynı iyileşmeyi bir kez daha satın alır, dört katı çekim karşılığında — ve neredeyse her pratik istifin sekiz ile otuz kare arasında olmasının nedeni de budur.

İkinci ve daha sessiz bir kazanç daha var. Sekiz bitlik on altı karenin ortalaması, herhangi birinde olduğundan daha ince geçişler taşıyan bir sonuç verir, çünkü her karenin yuvarlanmasını farklı kılan gürültünün ta kendisi, ortalamanın iki basamak arasına oturmasını sağlar. Gürültülü bir kümeyi istiflemek yalnızca gürültüyü kaldırmaz; tek bir karenin nicemleyerek yitirdiği tonu da geri getirir.

## Yöntemi seçen soru

Soru "neyi saklamak istiyorum" değil, **kareler arasında neyin farklı olduğu**. Geri kalan her şey bundan çıkar.

### Hiçbir şey kımıldamadı: ortalama

Düpedüz aritmetik ortalama. Kareler arasındaki tek farkın gürültü olduğu bir kümede elde edilebilecek en etkili gürültü azaltmadır ve bozulması da en kolayıdır: içinde bir kuş olan tek bir kare, istifin tamamına soluk bir kuş koyar, çünkü ortalamanın, diğerleriyle uyuşmayan bir değer hakkında bir görüşü yoktur. Onu da hesaba katar, o kadar.

### Kareyi bir şey kesip geçti: medyan

Kalabalık bir meydanın on iki fotoğrafını üst üste getirin ve tek bir piksele bakın. Çoğunda o piksel kaldırım taşıdır; birinde ikisinde birinin paltosu. Bu on iki değeri sıralayıp ortadakini alın, kaldırım taşını elde edersiniz, çünkü palto hiçbir zaman çoğunlukta olmadı.

Bunu her piksel için yapın, meydan boş çıkar. "Tatil fotoğrafınızdan turistleri kaldırın" tarzı her yazının arkasındaki numara budur ve bir seri çekim ile sabırdan daha zekice bir şey gerektirmez. Tek dayattığı şey, **sahnenin hiçbir parçasının zamanın yarısından fazlasında dolu olmaması**dır. On iki karenizin sekizinde kımıldamadan duran biri, o piksellerde çoğunluktur ve medyan onu saklar.

### İkisi birden: sigma kırpma

Medyan, sağlamlığını kazanmak için bilginin çoğunu atar — her pikselde on iki değerinizden on biri atılır — dolayısıyla gürültüyü, aynı kümenin ortalamasının indireceğinden çok daha az indirir.

Sigma kırpma bu uzlaşmadır ve gerçek dünyadan gelen herhangi bir küme için genellikle doğru varsayılandır. Her piksele bütün kareler boyunca bakar, onun genelde ne olduğunu ve ne kadar değiştiğini çıkarır, sonra yalnızca bununla uyuşan değerlerin ortalamasını alır. Bir kareyi kesip geçen bir araba o piksellerde dışarıda bırakılır; diğer her kare ise her yerde saymaya devam eder. Böylece medyanın kımıldayan şeylere karşı bağışıklığını ve ortalamanın gürültü azaltmasının çoğunu birlikte elde edersiniz.

Eşik standart sapma cinsindendir ve iki, alışılmış başlangıç noktasıdır. Daha düşüğü daha çok eler ve arabayla birlikte gerçek ayrıntıyı da elemeye başlar.

### Yalnızca parlak şeyler önemli: açma

Her pikselin ulaştığı en parlak değeri saklayın. Gece gökyüzünü otuz saniyelik iki yüz pozlama olarak çekin ve bunları açarak birleştirin: her yıldız sonuç üzerinde kendi yayını çizer — tek tek hiçbiri yanmamış kısa pozlamalardan kurulmuş bir yıldız izi. Aynı yöntem bir havai fişeği kendi patlamasının karelerinden kurar, karanlık bir odada elde fenerle yürümeyi de bir ışık resmine çevirir.

Karşıtı olan koyulaştırma, bu ikilinin sessiz olanıdır: bir piksel yalnızca *her* karede parlaksa parlak kalır, dolayısıyla camdaki yansımalar, geçen farlar ve flaşın aydınlattığı yağmur damlaları yok olur.

### Özne odaktan daha derin: odak istifleme

f/8'de bir makro çekimde belki bir milimetre odaktadır ve bu bir böcek için yetmez. Yanıt, odak halkası boyunca yirmi kare çekmek ve her birinden yalnızca o karede net olan bölümü saklamaktır. Araç, her pikselin komşularından ne kadar farklı olduğunu ölçer — bir kenarda büyük, bir bulanıklıkta sıfıra yakın — ve kazananı alır.

Bu yöntem tripodu diğerlerinin hepsinden çok ister, çünkü odak halkasını elle çevirmek makineyi oynatır ve azıcık daha uzaktan çekilmiş bir kare, aynı görüntünün başka bir odaktaki hâli değildir.

![Kip listesi; ortalama, ortanca, en açık, en koyu; altında çıktı boyutunu, gereken belleği ve her dosyanın ne kadarının okunacağını veren bir plan.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

Kip, bu bölümün sorusudur. Altındaki plan, aracın işlemi başlatmadan önce bedelini söylemesidir.

## Kareleri hizalamak

İstifleme piksel başına aritmetiktir, dolayısıyla belirli bir pikselin her karede sahnenin aynı parçası olduğunu varsayar. Elde tutulduğunda öyle değildir: bir seri onlarca piksel kayar ve bunun ortalamasını almak temiz bir görüntü yerine bir bulanıklık üretir. İstiflemedeki ilk denemenin hayal kırıklığı yaratmasının en yaygın nedeni budur.

Bu yüzden kareler önce içlerinden birine göre ölçülür ve yerlerine geri taşınır, bir pikselin kesirine varan hassasiyetle. Üç ayar vardır:

- **Yalnızca kaydırma** elde tutulan hemen her şey için doğrudur. Kaymayı ve titremeyi düzeltir.
- **Kaydırma, döndürme ve ölçekleme**, hafifçe de dönmekte olduğunuz ya da yakınlaştırmanın sinsice kaydığı bir küme için. Kare başına bir ölçüm fazladan maliyeti vardır ve kareler düz çıkarsa hiçbir maliyeti olmaz.
- **Hiçbiri**, sabitlenmiş bir tripod ya da aralıklı bir dizi için; kareler zaten hizalıdır ve onları ölçmek boşa geçen zamandır.

Hiçbir hizalamanın düzeltemeyeceği şey, kımıldamış bir makine yerine kımıldamış bir öznedir; bir adım soldan çekilmiş bir fotoğrafı da düzeltemez. Yana hareket etmek, yakındaki şeylerin uzaktakilere göre ne kadar kaydığını değiştirir ve tek bir düzeltme ikisini birden anlatmaz. Olduğunuz yerde dönmek sorun değil; yürümek sorundur.

![Sonuç: üst üste bindirilmiş görüntü ve her karenin ilkine oturması için ne kadar kaydırılması gerektiğini söyleyen bir not.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Hizalama sayıları okunmaya değer. Elde çekilmiş bir seri kare başına birkaç piksel kayar ve hizalayıcının sessizce geri aldığı şey tam olarak budur.

## RAW dosyaları bu işin neresinde

CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF ve gerisini doğrudan bırakabilirsiniz; onlara ne olduğu konusunda kesin konuşmakta yarar var, çünkü bu, bir RAW dönüştürücünün yaptığı şey değildir.

Her RAW dosyası, **makinenin çekim anında oluşturduğu tam boyutlu bir JPEG**'i zaten içerir. Makinenin arkasında size gösterilen görüntü budur ve işletim sisteminizin küçük resim olarak çizdiği de budur. İstifleyici o görüntüyü bulur ve onu kullanır. Sensör verisini çözmez.

Bunun iki sonucu vardır; biri iyi, biri bilinmeye değer:

- **Hızlıdır.** Önizlemeyi bulmak birkaç kilobaytlık dizin okumak ve sonra tek bir dilim almak demektir, dolayısıyla 60 MB'lık bir kare aşağı yukarı bir JPEG kadar hızlı açılır. Bir RAW dönüştürücünün tek bir kareye harcayacağı sürede yirmi tanesi açılır. Sayfa, dosyalarınızın ne kadar azını gerçekten okuduğunu size gösterir.
- **Bu, sizin değil makinenin yorumudur.** Kanal başına sekiz bit, makinenin ayarlı olduğu beyaz dengesi ve resim stiliyle — bir dönüştürücüden alacağınız on iki ya da on dört bitlik doğrusal sensör verisi değil.

Gürültü azaltma, yıldız izleri, geçenleri kaldırma ve odak istifleme için bu takas neredeyse her zaman kârlıdır: önizlemeler tam çözünürlüktedir ve zaten JPEG olarak alacağınız görüntüdür. Gölgeleri sertçe kaldırıyorsanız ya da dinamik aralığın son kırıntısının bütün mesele olduğu astrofotoğrafçılık için istifliyorsanız, kareleri önce bir RAW dönüştürücüde geliştirin ve onun verdiği TIFF ya da JPEG'leri istifleyin. Onlar da aynı şekilde girer.

## Çalıştırmanın maliyeti

Bilmeye değer, çünkü sekiz saniye süren bir istif ile iki dakika süren bir istif arasındaki fark budur.

Yedi yöntemin altısının yalnızca tek bir şeyi hatırlaması gerekir. Yürüyen bir maksimum, daha önce gördüğü kareleri umursamaz; yürüyen bir toplam da öyle. Bu yüzden o yöntemler her kareyi tam olarak bir kez okur ve yüz kare için iki kare kadar bellek kullanır.

Medyan böyle çalışamaz, çünkü bir kümenin ortadaki değeri, küme tamamlanmadan bilinemez. Yirmi tane 24 megapiksel kare, aynı anda tutulan yaklaşık 1,4 GB pikseldir ve bunu hiçbir tarayıcı size vermez; bu yüzden görüntü yatay şeritlere kesilir ve şerit şerit istiflenir — doğru, ve daha yavaş, çünkü kareler her şerit için yeniden okunur.

Araç bunların hepsini siz düğmeye basmadan hesaplar ve size söyler: sonucun ne kadar büyük olacağını, kabaca ne kadar belleğe ihtiyaç duyduğunu ve karelerinizin kaç kez çözüleceğini. Çalıştırmanın şeritli olacağını söylüyorsa, çalışma çözünürlüğünü bir kademe düşürmek belleği dörde böler ve bunu neredeyse her zaman tek geçişe döndürür — üstelik gürültüyü kaldırmak için istifliyorsanız, yarım çözünürlük zaten tamdan daha temiz görünecekti.

## Bunun için çekmek

Bir istifin kalitesinin çoğu, herhangi bir yazılım onu görmeden önce belirlenir.

- **İhtiyacınız olduğunu sandığınızdan fazla kare çekin.** Karekök eğrisi başta acımasız, sonda merhametlidir: dört kareden dokuza çıkmak, yirmi kareden kırka çıkmaktan daha büyük bir görünür değişikliktir.
- **Kareler arasında pozlamayı değiştirmeyin.** İstifleme, karelerin aynı parlaklıkta aynı sahne olduğunu varsayar. Pozlamayı kilitleyin, yoksa araç iki farklı görüntünün ortalamasını alıyor olur.
- **İnsanları kaldırmak için kareler arasında bekleyin.** İki saniyede çekilmiş bir seri, aynı kişiyi her karede aynı yerde yakalar ve medyan onu saklar. Birkaç saniye arayla çekilmiş on kare, seri hâlinde çekilmiş elli kareden çok daha iyi iş görür.
- **Yıldız izleri için araları kısa tutun.** Açma, karelerin tam olarak neyi kaydettiğini çizer, dolayısıyla iki pozlama arasındaki duraklama her izde görünür bir kesinti hâline gelir.

## Bunların hiçbiri makinenizden ayrılmaz

Yirmi RAW kareden oluşan bir istif yaklaşık bir gigabayt fotoğraf eder ve ortalamasının alınması için bunu bir web sitesine vermek epey fazladır. [Görüntü istifleyici](https://abox.tools/tr/goruntu-istifleme/) dosyaları kendi diskinizden okur ve aritmetiği kendi tarayıcınızda yapar. Yükleme adımı yok, hesap yok, kuyruk yok; ve bu iddiayı herkesinkini kontrol edeceğiniz gibi kontrol edebilirsiniz: çalışırken tarayıcınızın ağ panelini açın ya da doğrudan internet bağlantısını kesip yine de istifleyin.

İlgili soru — herhangi bir araç için, ona bir dosya vermenin gerekli olup olmadığını nasıl anlarsınız — [kendi rehberine](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) sahiptir.
