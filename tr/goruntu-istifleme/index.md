# Görüntü istifleme — bir seri kareyi birleştirin, RAW dosyaları dahil

Yirmi kare tek karede, yirmi yükleme ve RAW dönüştürücü olmadan.

> Bir seri fotoğrafı tek karede birleştirin: gürültüyü öldürmek için ortalamasını alın, sahneden insanları çıkarmak için medyanını alın, yıldız izleri için açın ya da bir makro çekimi odak istifleyin. CR2, NEF, ARW, DNG, RAF ve CR3 dosyalarını, fotoğraf makinesinin kendi önizlemesini çıkararak okur. Tümüyle tarayıcınızda çalışır.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/goruntu-istifleme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## fotoğraflarınız **asla yüklenmez**. Sunucu yoktur.

Her kare kendi tarayıcınızda, kendi makinenizde açılır, çözülür, hizalanır, birleştirilir ve yazılır. Yirmi tane 60 MB'lık RAW dosyası yaklaşık bir gigabayt fotoğraf eder ve bunun tek baytı yerinden kıpırdamaz: aracın hiçbir ağ özelliği yoktur ve dosyaları, hiçbir yere gönderemeyecek bir işçi doğrudan diskinizden okur.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ RAW okur
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Tarayıcınızda bir dizi fotoğrafı nasıl istiflersiniz

1. **Kareleri seçin.** Bir seri çekim, basamaklı pozlanmış bir küme, bir aralıklı çekim dizisi ya da RAW dosyalarıyla dolu bir klasör. Her biri geldiği anda açılır ve satırı ondan ne çıktığını söyler — bir RAW dosyası için makinenin adı, içinde bulunan önizlemenin boyutu ve onu bulmak için dosyanın ne kadar azının okunması gerektiği.
2. **Neyi kaybetmek istediğinize uyan yöntemi seçin.** Gürültü: ortalama, bir şey kımıldadıysa sigma kırpma. İnsanlar, arabalar ya da geçen bir uçak: medyan. Yıldız izine dönüşmesini istediğiniz karanlık bir gökyüzü: açma. Odak halkası boyunca çekilmiş bir makro: odak istifleme. Menünün altındaki not, her birinin sizin kare sayınıza ne yapacağını söyler.
3. **Karelerin hizalanması gerekip gerekmediğine karar verin.** Elde tutuluyorsa: evet, yalnızca kaydırma. Elde tutuluyor ve aynı zamanda dönüyorsanız: kaydırma, döndürme ve ölçekleme. Sabitlenmiş tripod ya da aralıklı çekim: hayır, ve daha hızlı olur. Her kare referans işaretli kareye göre ölçülür; siz başka bir şey söylemedikçe bu, listedeki ilk karedir. «Referans yap» işareti taşır, listeyi koyduğunuz sırada bırakır.
4. **Dört sayıyı okuyun, sonra düğmeye basın.** Hiçbir şey çalışmadan önce sayfa, sonucun ne kadar büyük olacağını, kabaca ne kadar bellek alacağını, karelerin kaç kez çözüleceğini ve dosyalarınızın ne kadarının okunduğunu söyler. Küme belleğe tek parça sığmayacaksa bunu da söyler ve hangi çalışma çözünürlüğünün bunu düzelteceğini de belirtir.

## Uzun sürüm

[Gürültüyü azaltmak ya da insanları kaldırmak için fotoğraflar nasıl istiflenir](https://abox.tools/tr/rehberler/gurultuyu-azaltmak-icin-fotograf-istifleme/): İstifleme bir seri kareyi tek görüntüde birleştirir. Hangi yöntemi kullanacağınız neyi kaybetmek istediğinize bağlıdır: gürültü, geçenler ya da bir makro çekimin sığ alan derinliği. Her birinin nasıl çalıştığı, neye mal olduğu ve RAW dosyalarının bu işin neresinde durduğu.

## Kutuda ayrıca

- [Görsel Karartıcı](https://abox.tools/tr/resim-karartma/): Kapattığınız şey dosyanın içinde örtülmez, dosyadan silinir.
- [EXIF Görüntüleyici ve Silici](https://abox.tools/tr/exif-verisi-silme/): Bir fotoğrafın sizin hakkınızda ne söylediğini görün. Sonra onu çıkarın.
- [DICOM Görüntüleyici](https://abox.tools/tr/dicom-goruntuleyici/): BT, MR, röntgen ve ultrason; penceresi, başlığı ve ölçümleriyle.
- [Görselden ICO'ya](https://abox.tools/tr/favicon-olusturma/): Bir resim girer. Bir tarayıcının, Windows'un ya da bir Mac'in istediği her boyut çıkar.

## Sorular

### Fotoğraflarım bir yere yükleniyor mu?

Hayır. Her kare kendi tarayıcınızda, kendi donanımınızda açılır, çözülür, hizalanır, istiflenir ve yazılır. Bu aracın hiçbir ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy` başlığı iletişim kurabileceği her adresi adıyla sayar; hiçbiri bu siteye ait değildir. Sayfayı bir kez yükleyin, internet bağlantısını kesin, yine de çalışır. Bu, çoğu araçta olduğundan burada daha çok önemlidir ve nedeni yalnızca hacimdir: yirmi RAW kare yaklaşık bir gigabayttır ve ortalamasının alınması için bir gigabaytlık fotoğrafı yüklemek, bu aracın var oluş nedeni olan şeyden kaçınmak istediği durumun ta kendisidir.

### Hangi RAW biçimlerini okuyabilir, nasıl?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL ve birkaçı daha — yani fotoğraf makinelerinin yazdıklarının çoğu. Bunlardan okuduğu şey, makinenin çekim anında kendi oluşturduğu tam boyutlu JPEG önizlemedir: makinenin arkasındaki ekranda gördüğünüz görüntü ve işletim sisteminizin küçük resim olarak çizdiği görüntü. Dosyanın dizin yapısı gezilerek bulunur; bu, her biri birkaç kilobaytlık birkaç okuma eder, sonra tek bir dilim alınır. **Bu, sensör verisinin mozaik çözümü değildir.** Sonuç, bir RAW dönüştürücünün vereceği on iki ya da on dört bitlik doğrusal sensör verisi yerine, makinenin beyaz dengesini ve resim stilini kanal başına sekiz bitle taşır.

### Peki neden sensör verisi düzgünce çözülmüyor?

Çünkü bu, LibRaw ya da dcraw'ı beraberinde taşımak demek olurdu — tek bir biçim ailesi için onlarca megabaytlık ikinci bir motor, üstelik büyük bölümü üreticiye özgü sıkıştırma şemaları. Bu takas, bu sitenin kaynağındaki `docs/what-can-be-built-here.md` dosyasında tartışılmıştır ve fotoğraf makinesi RAW'ı, bu araç var olmadan önce de eleme listesindeydi. Değişen şey o sorunun yanıtı değil, istiflemenin buna ihtiyaç duymadığının anlaşılmasıdır: önizlemeler tam çözünürlüktedir, zaten makinenin size JPEG olarak vereceği görüntüdür ve onları okumak mozaik çözmekten kabaca yüz kat hızlıdır. Sensör verisini istiyorsanız kareleri önce bir RAW dönüştürücüde geliştirin ve onun ürettiği TIFF ya da JPEG'leri istifleyin — bu araç onları da alır.

### Kaç kareyi ve ne büyüklükte kaldırabilir?

Yedi yöntemin altısı akış hâlinde çalışır: tek bir toplayıcı tutar ve her kareyi tam olarak bir kez okur, dolayısıyla yüz kare iki kareyle aynı belleği harcar ve büyüyen tek şey süredir. Medyan istisnadır, çünkü bir kümenin ortadaki değeri, küme tamamlanmadan bilinemez; bu yüzden her kareyi aynı anda tutar — yirmi tane 24 megapiksel kare yaklaşık 1,4 GB eder ve bunu hiçbir tarayıcı size vermez. Bu olduğunda görüntü yatay şeritlere kesilir ve şerit şerit istiflenir; bunun bedeli, her şerit için karelerin yeniden okunmasıdır. Sayfa bunların hepsini siz düğmeye basmadan hesaplar ve sayıyı gösterir, böylece yavaş bir çalıştırma asla sürpriz olmaz.

### Kareleri hizalamak aslında ne yapar?

Her karenin referans kareye göre ne kadar kaydığını bulur ve onu bir pikselin kesirine varan hassasiyetle geri taşır. Yöntem faz korelasyonudur: iki görüntü arasındaki kayma, tayfları arasında bir faz farkı olarak ortaya çıkar; dolayısıyla her birine bir Fourier dönüşümü, iki piksellik bir kaymayı bulduğu ucuzlukta iki yüz piksellik bir kaymayı da bulur. İkinci ayar, aynı numarayı log-polar koordinatlardaki tayfa uygulayarak dönmeyi ve ölçeği de geri kazanır. Bunların hepsi geneldir — tüm kare için tek bir kayma, tek bir açı, tek bir ölçek — yani kımıldamış bir makineyi düzeltir, kımıldamış bir özneyi düzeltemez, bir adım soldan çekilmiş bir fotoğrafı da düzeltemez. Görünür tek bir sonucu vardır: yirmi piksel sola taşınmış bir kare artık sağ kenara ulaşmaz, bu yüzden sonuç her karenin kapsadığı bölüme kırpılır. Hizalanmış bir istifin, içine giren karelerden azıcık daha küçük dönmesinin nedeni budur ve orada olmayan karelerden oluşan koyu bir kenara tek alternatif de budur.

### Hangi yöntemi kullanmalıyım?

Hiçbir şeyin kımıldamadığı bir kümede gürültü için **ortalama**: rastgele gürültüyü kabaca kare sayısının kareköküne göre azaltır. Yalnızca bir süre orada olmuş şeyleri kaldırmak için **medyan** — klasik kullanımı, kalabalık bir meydanı on iki kez fotoğraflayıp onu boş elde etmektir. İkisini birden istiyorsanız **sigma kırpma**: her pikselin genelde ne olduğunu öğrenir ve yalnızca bununla uyuşan değerlerin ortalamasını alır, böylece medyanın geçen bir arabaya karşı bağışıklığı ile ortalamanın gürültü azaltması bir arada olur. Yıldız izleri, havai fişek ve ışıkla boyama için **açma**. Kımıldamış her parlak şeyi kaldırmak için **koyulaştırma**. Tek bir uzun pozlamayı taklit etmek için **toplama**. Odak halkası boyunca çekilmiş bir makro için **odak istifleme**.

### RAW dosyalarım on dört bitken sonucum neden sekiz bit?

Çünkü istiflenen şey makinenin kendi önizlemesidir ve o bir JPEG'dir. Yine de istiflemenin bu bedelin bir kısmını geri kazandırdığını söylemekte yarar var: sekiz bitlik on altı karenin ortalaması, herhangi birinde olduğundan gerçekten daha ince geçişler taşıyan bir sonuç verir, çünkü her karenin yuvarlanmasını farklı kılan gürültünün ta kendisi, ortalamanın iki basamak arasına oturmasını sağlar. Buradaki aritmetik kayan noktayla yapılır ve yalnızca en sonda bir kez yuvarlanır, dolayısıyla yol boyunca hiçbir şey atılmaz. Yine de bu, doğrusal sensör verisini istiflemekle aynı şey değildir ve bu araç öyleymiş gibi davranmaz.

### Farklı boyutlarda ya da farklı makinelerden kareleri istifleyebilir miyim?

Evet, ama bu genellikle bir hatadır ve gerçekten öyle istediğinizi bir kez kontrol etmeye değer. Sonuç en büyük karenin boyutunda olur ve diğer her kare sığacak şekilde ölçeklenip ortalanır. Makineleri karıştırmak renk yorumunu da karıştırır, dolayısıyla ikisinin ortalaması, aynı ışığın iki farklı yorumunun ortalaması olur. Gerçekten işe yaradığı yer, iki çözünürlükte çekilmiş bir küme ya da aynı karenin RAW dosyası ile JPEG'idir.

### Çalıştırmanın şeritli olacağını söylüyor. Bu ne demek?

Yöntemin ihtiyaç duyduğu çalışma belleğinin, aracın tek seferde ayırmaya razı olduğu miktardan fazla olduğu demek; bu yüzden görüntü yatay şeritlere kesilip şerit şerit istiflenecek. Sonuç yine tıpatıp aynıdır; yalnızca her şerit için kareleri yeniden okur, bu yüzden daha uzun sürer ve sayfa bunun kaç çözme işlemi edeceğini söyler. Çalışma çözünürlüğünü bir kademe düşürmek belleği dörde böler ve şeritli bir çalıştırmayı neredeyse her zaman tek geçişe döndürür — not, hangi ayarın bunu yapacağını söyler.

### Neden diğerleri kullanmazken bu araç bir Worker kullanıyor?

Çünkü işi dakikalarla ölçülen tek araç budur. Buradaki her diğer araç bir iki saniye süren bir şey yapar ve orada işi ana iş parçacığından çıkarmak yalnızca merasim olurdu. Yirmi büyük kareyi istiflemek yüzlerce megabayt üzerinde yoğun bir aritmetiktir ve ana iş parçacığında bu, donmuş bir sayfa demektir: ilerleme çubuğu kımıldamaz, İptal düğmesi yanıt vermez ve sonunda tarayıcı sekmeyi kapatmayı önerir. Worker, aynı tarayıcının içindeki ikinci bir iş parçacığıdır; aynı klasördeki bir dosyayı, aynı politika altında çalıştırır. Ne bir sunucudur ne de bir ağ özelliği.

### Ücretsiz mi, hesap gerekiyor mu?

Ücretsizdir; hesap, oturum açma, deneme süresi ve filigran yoktur. Kaç kare istiflediğinize ya da ne kadar büyük olduklarına dair bir sınır da yoktur, çünkü bunun bedelini ödeyen bir sunucu yoktur — iş kendi makinenizde yapılır ve tek tavan kendi belleğinizdir. Site reklam gösterir, masrafını karşılayan da odur; reklamlara fotoğraflarınız hakkında hiçbir şey verilmez.

## Gizlilik iddiası nasıl doğrulanabilir

- **Fotoğraflarınızın gidecek bir yeri yok.** Content-Security-Policy bu sayfanın iletişim kurabileceği her adresi adıyla sayar ve hiçbiri bu siteye ait değildir. Burada dosyalarınızın toplanabileceği bir uç nokta yoktur, olsaydı da onları gönderecek bir kod yoktur — ne `src/` içinde ne de işçide bir `fetch`, bir `XMLHttpRequest` ya da bir `sendBeacon` bulunur.
- **RAW dosyaları yüklenmez, okunur — hem de zar zor.** Bir fotoğraf makinesinin RAW dosyası, makinenin çekim anında oluşturduğu tam boyutlu bir JPEG'i zaten içerir. Bu araç onu birkaç dizin girdisini gezerek bulur, sonra tek bir dilim ister; 60 MB'lık bir dosyada bu genellikle yüz kilobaytın altındadır. Siz çalışırken sayfa o sayıyı dosyalarınızın boyutunun yanında gösterir. Sensör verisi ise hiç okunmaz.
- **İş, bir sunucuda değil, bu makinedeki bir Worker'da yapılır.** Burada Worker kullanan tek araç budur, çünkü istifleme saniyelerin değil dakikaların aritmetiğidir ve donmuş bir sayfa ne ilerleme gösterebilir ne de iptal edilebilir. Worker, aynı tarayıcının içindeki ikinci bir iş parçacığıdır — `src/worker.js`'ye bakın. Ona dosyaların kendisi verilir ve bu bedavadır, çünkü bir dosya tutamacı baytlar değildir; üstelik sayfayla tıpatıp aynı Content-Security-Policy altındadır, yani gönderecek bir yeri yoktur.
- **Bu küme hakkında hiçbir yere hiçbir şey bildirilmez.** Kaç kare istiflediğiniz, onları hangi makinenin yazdığı, her birinin ne kadar kaydığı, hangi yöntemi seçtiğiniz ve ne kadar sürdüğü, siz kapatana dek bu sayfanın belleğinde kalır. Bu depoda bunların herhangi birini taşıyan özel bir analitik olayı yoktur ve bu sitenin indirmeden sonra sorduğu tek soru, bir başparmağın yönünü ve aracın adını gönderir, başka hiçbir şeyi değil.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araçta hiçbir şey değişmez, çünkü içinde hiçbir zaman bir ağ adımı olmadı. Worker ve yüklediği her modül bu sayfanın kendi service worker'ı tarafından önbelleğe alınır, dolayısıyla kurulu bir kopya ağ fişi çekiliyken de RAW dosyalarını istifler.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, bir RAW dosyasının megabaytlar yerine kilobaytlar okunarak nasıl açıldığı için `src/raw.js`, her yöntemin aritmetiği için `src/stack.js`, sayfada görünen bellek ve çözme sayılarının nereden geldiği için de `src/plan.js` — bunlar tahmin değil, o dosyanın verdiği yanıtlardır.
