# Bir DICOM dosyası nasıl açılır ve içinde ne var

Bir hastane diski, uzantısı olmayan dosyalardan oluşan bir klasör ve Windows XP için yazılmış bir görüntüleyicidir. Dosyalar DICOM'dur ve onlarda egzotik hiçbir şey yoktur: bir tarama, alanlarla dolu bir başlık ve bir piksel bloğudur. Bu rehber bir tanesine nasıl bakacağınızı, denetimlerin ne anlama geldiğini ve dosyanın resmin dışında başka neler taşıdığını anlatıyor.

[DICOM Görüntüleyici aracını açın](https://abox.tools/tr/dicom-goruntuleyici/): BT, MR, röntgen ve ultrason; penceresi, başlığı ve ölçümleriyle.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[DICOM Görüntüleyici](https://abox.tools/tr/dicom-goruntuleyici/)'yi açın ve dosyaların bulunduğu klasörün tamamını üzerine sürükleyin. Kendi makinenizde okunur, geldikleri seriye geri konur ve tarayıcının çektiği sırayla üst üste dizilir. Hiçbir şey yüklenmez ve dosyalarınıza hiçbir şey geri yazılmaz.

Size bir disk verildiyse ve dosyalardan hangisini açacağınızı merak ediyorsanız: hepsini, bir seferde. Bir BT ya da MR tek bir dosya değildir. Dilim başına bir dosyadır ve bir göğüs çalışması bunlardan üç yüz tanedir.

## Bir hastane diskinde ne var

Genellikle dört şey ve yalnızca biri önemli.

- **Bir taramalar klasörü**; çoğu zaman `DICOM`, `IMAGES` ya da `ST0001` adında olur ve içinde `IM000001`, `I0000001` ya da uzun noktalı bir sayıyla adlandırılmış dosyalar bulunur. Sık sık hiç uzantısı olmaz. Tarama bunlardır.
- **`DICOMDIR` adlı bir dosya.** Gerisinin bir dizini; bir görüntüleyici her dosyayı açmadan diskteki çalışmaları listeleyebilsin diye yazılmıştır. Ona ihtiyacınız yok.
- **Bir görüntüleyici**; bir Windows çalıştırılabiliri, bir otomatik çalıştırma girdisi ya da ara sıra bir Java uygulamacığı olarak. Disk yazıldığında ne güncelse ona göre derlenmiştir; bu kadar çoğunun artık çalışmamasının sebebi de budur.
- **Hastanenin logosunu taşıyan bir HTML sayfası ya da bir PDF**; görüntüleyicinin nasıl başlatılacağını anlatır.

Taramaların görüntüleyiciye ihtiyacı yoktur. Biçim yayımlanmış bir standarttır ve dosyalar kendi başlarına okunabilir; diskteki çalıştırılabilir, onları okuyabilecek bir programdır, tek program değil.

## Dosyaların neden uzantısı yok

Çünkü DICOM'un buna ihtiyacı yoktur. Her dosya kendi işaretini taşır: 128 baytlık hiçlik, sonra `DICM` dört harfi, sonra dosyanın geri kalanının nasıl yazıldığını tarif eden küçük bir alanlar bloğu. Bir okuyucu, `.dcm` ile biten bir ad yerine bu dört harfi arar.

Bir dosyayı `.dcm` olarak yeniden adlandırmanın hiçbir şeyi değiştirmemesinin ve uzantıda ısrar eden bir görüntüleyicinin gereksiz yere katı davranmasının sebebi de budur. Doğrudan bir hastane ağından yazılmış dosyalarda 128 bayt ve işaret bile yoktur — önlerinde hiçbir şey olmayan çıplak veridirler ve bir okuyucunun nasıl kodlandıklarını ilk alandan çıkarması gerekir. Bu, bozuk değil normal bir dosyadır.

## Pencere ve düzey; asıl önemli denetim

Tıbbi bir görüntüyü bir fotoğraftan ayıran tek şey budur ve bir görüntü düzenleyicinin bir tanesine bakmak için işe yaramamasının sebebi de budur.

Bir BT dilimi yaklaşık dört bin ayrı değer tutar. Ekranınız iki yüz elli altı gri gösterir. Birinin, hangi dört binin hangi iki yüz elli altıya eşleneceğine karar vermesi gerekir ve o karar **penceredir**: altındaki her şey siyah, üstündeki her şey beyazdır ve aradaki aralık grilere yayılır.

Pencereyi oynatın, aynı dosya başka bir tarama gibi görünsün. Bu bir çizim bozukluğu değil, işin özüdür. Akciğer de kemik de dilimin içindedir ve aynı anda görülemez: şişmiş akciğerin dokusunu gösteren bir pencere her kemiği saf beyaz yapar, bir kaburgadaki trabeküler ayrıntıyı gösteren bir pencere ise akciğerin tamamını saf siyah yapar.

Bir BT'de sayılar **Hounsfield birimleridir** ve tarayıcıya göre değil mutlak olarak tanımlanmışlardır: dünyadaki her BT tarayıcısında, tanım gereği su 0 ve hava −1000'dir. Bir görüntüleyicinin adlandırılmış pencereler sunabilmesinin — akciğer, kemik, beyin, yumuşak doku — ve bunların sizin dosyanızda, taramanın okunduğu iş istasyonundakiyle aynı anlama gelmesinin sebebi budur. Alışılmış olanlar:

- **Yumuşak doku** — merkez 40, genişlik 400.
- **Akciğer** — merkez −600, genişlik 1500.
- **Kemik** — merkez 300, genişlik 1500.
- **Beyin** — merkez 40, genişlik 80. Dar bir pencere, çünkü gri ve beyaz madde yalnızca birkaç birim farklıdır.

Bir MR'da böyle bir ölçek yoktur. Değerler diziye, sarmala ve tarayıcıya bağlıdır; yani bir hazır ayarın adını koyacak bir şey yoktur ve başlanacak pencere, dosyanın kendisinin istediğidir. Her tarama bir öneri taşır.

![Görüntüleyici: gri tonlamalı bir kesit, yanında pencere ve düzey kumandaları, yaygın doku aralıkları için hazır ayarlar ve köşelerde çalışma bilgileri.](https://abox.tools/screens/open-a-dicom-file/viewer.webp)

Önemli olan iki kumanda pencere ile düzeydir. Bir tarama, bir ekranın gösterebileceğinden çok tonu tutar ve hangilerine baktığınıza bunlar karar verir.

## Dilimler neden bazen ters yönde kayıyor

Bir görüntüleyicinin dosyaları hangi sıraya koyacağına karar vermesi gerekir ve dosyada kullanabileceği iki şey vardır.

**Instance Number** bir sayaçtır. Apaçık seçimdir ve dosyaları her ne yazdıysa onun tarafından atanır; o da onları hastanın uzandığı yönde numaralamak zorunda değildir. Ayaklardan yukarı doğru yeniden kurulmuş ve baştan aşağı numaralanmış bir çalışma geriye doğru kayar ve iki yeniden kurulumdan bir araya getirilmiş bir seri numaraları düpedüz tekrarlayabilir.

**Image Position (Patient)**, dilimin milimetre cinsinden, tarayıcıya değil hastaya sabitlenmiş bir koordinat sisteminde fiziksel olarak nerede olduğudur. Buna göre sıralamak, numaralandırma ne yapmış olursa olsun doğrudur ve yararlı bir yan etkisi vardır: dilimler bir kez fiziksel sıraya girdiğinde aralarındaki boşluk ölçülebilir; yani bir görüntüleyici size dilimlerin 5 mm arayla olduğunu söyleyebilir — ve birinin eksik olduğunu fark edebilir ki dosya bunu hiçbir zaman söylemez.

## Bir şey ölçmek

Bir tarama ölçülmüş veridir, yani üzerindeki bir uzunluk gerçek bir uzunluktur — dosya piksellerinin birbirinden ne kadar uzak olduğunu söylüyorsa. Bu tek bir alandır, Pixel Spacing, milimetre cinsinden ve esasen her BT ile MR'da bulunur.

Ultrason görüntülerinde, taranmış belgelerde ve DICOM olarak kaydedilmiş ekran görüntülerinde çoğu zaman eksiktir. Eksik olduğu yerde milimetre cinsinden dürüst bir cevap yoktur ve yine de bir cevap veren bir görüntüleyici bir ölçek uydurmuştur. Dosyanın cevaplayamadığı bir soruya doğru cevap, bir piksel sayısıdır.

Kare olmayan piksellere de dikkat edin; BT dışında bu normaldir. Piksel cinsinden ölçüp tek bir aralık rakamıyla çarpmak yalnızca ikisi aynı olduğunda doğrudur; her eksenin kendi rakamıyla ölçülmesi gerekir.

## Bir tarama resmin dışında ne taşır

İnsanların yanıldığı kısım budur ve bu dosyalarda dikkatli olmanın sebebi de budur.

Bir DICOM dosyası, biraz üstverisi olan bir resim değildir. İçinde bir resim olan bir tıbbi kayıttır. Başlık bir alanlar listesidir ve tipik bir klinik taramada şunları tutar:

- hastanın adı, hastane numarası, doğum tarihi ve cinsiyeti;
- hastanenin sistemindeki isteğin anahtarı olan erişim numarası;
- yönlendiren doktor, çekimi yapan tekniker, raporlayan radyolog;
- kurum, adresi ve bölüm;
- tarayıcının üreticisi, modeli ve seri numarası;
- taramanın saniyesine kadar tarihi ve saati;
- ve geldiği arşive geri açılan kusursuz anahtarlar olan bir benzersiz tanımlayıcılar kümesi — çalışma, seri, örnek.

Size verilen her dosya bunların hepsini taşır ve bunlar, dosya nereye giderse onunla birlikte gider. Adı silmek yetmez: bir doğum tarihi, posta kodu büyüklüğünde bir kurum ve bir tarama saati bir insanı kabaca bir ad kadar iyi tanımlar; çalışma UID'si ise arşive erişimi olan herkes için onu tam olarak tanımlar.

Bazı tarayıcılar hastanın adının ikinci bir kopyasını, anlamı hiçbir yerde yayımlanmamış olan özel bir alanda da tutar ve çoğu anonimleştirici, içinde ne olduğunu bilemediği için bu alana dokunmaz.

![Dosyada hastayı tanımlayan şeyleri sıralayan bir kart: ad, kimlik numarası, doğum tarihi ve çalışma açıklaması.](https://abox.tools/screens/open-a-dicom-file/identity.webp)

Bir taramanın görüntünün yanında taşıdıkları. Böyle bir dosyayı e-postayla göndermemek gerektiğini anlatan kart budur.

## Bakmak için taramayı yüklemeyin

Bu sorunun alışıldık çözülme biçimi, “çevrimiçi dicom görüntüleyici” araması ve bir yükleme kutusudur. Az önce olan şey, bir yabancının bir tıbbi kaydın kopyasına sahip olmasıdır: pikseller, ad, doğum tarihi, hastane numarası ve arşive geri açılan anahtar.

Bunun bir sebebi yok. Bir DICOM dosyasını okumak, bir başlığı ayrıştırmak ve birkaç tam sayıyı açmaktır; bir tarayıcı bunu gayet iyi yapar ve [buradaki görüntüleyicinin](https://abox.tools/tr/dicom-goruntuleyici/) hiç ağ özelliği olmamasının sebebi de budur: `fetch` yok, `XMLHttpRequest` yok, bir şey denese bile bir dosya gönderebilecek hiçbir şey yok. Sayfayı bir kez yükleyin, internet bağlantısını kesin, tarama açmaya devam etsin.

[Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) bu iddiayı ister bu sitede ister başka bir yerde nasıl denetleyeceğinizi anlatıyor. Denetlemeye en çok değen dosya türü budur.

## Bir tarayıcının yapamayacağı şeyler

İki şey ve ikisi hakkında da açık konuşmaya değer.

**Bu bir tanısal görüntüleyici değildir.** Ekranınız kalibre edilmemiştir, tarayıcı doğrulanmış bir çizim zinciri değildir ve hiçbir web sayfası bir düzenleyici değerlendirmeden geçmemiştir. Klinik bir karar vermek için bir taramayı okumak, onun raporlandığı iş istasyonunun işidir. Diskte ne olduğuna bakmak, bir ders sunumu için bir dilim çekmek, bir başlık okumak ya da başka bir programın dosyayı neden reddettiğini bulmak ise bir tarayıcıda bir tanesini açmak için gayet iyi sebeplerdir.

**Bazı sıkıştırılmış taramalar çözülmez.** DICOM birkaç sıkıştırma şemasına izin verir ve tarayıcılar bunlardan birini uygular. Düz dosyalar, çalışma uzunluğu kodlanmış olanlar, temel JPEG ve JPEG Lossless — ki çoğu hastane dışa aktarımının kullandığı budur — hepsi açılır. JPEG 2000, JPEG-LS ve video biçimleri, megabaytlarca derlenmiş kütüphane olan kodlayıcılar ister. Resmin çözülemediği yerde başlık yine de baştan sona okunabilir ki zaten geldiğiniz yarı genellikle odur.
