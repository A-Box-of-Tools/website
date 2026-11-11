# Telefonunuzun kaydettiği fotoğraf ve hiçbir şeyin açmadığı biçim

Bir iPhone fotoğrafları HEIC olarak kaydeder; bu biçim JPEG'den hem küçük hem iyidir ve epeyce yazılım onu hâlâ açmayı reddediyor. Bu rehber biçimin gerçekte ne olduğunu, dönüştürmenin resme neye mal olduğunu ve neredeyse her dönüştürücünün neden önce sizden onu yüklemenizi istediğini anlatıyor.

[HEIC'ten JPG'ye aracını açın](https://abox.tools/tr/heic-jpg-donusturme/): Bir iPhone'un ürettiği fotoğraflar, her şeyin açtığı bir biçimde.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[HEIC'ten JPG'ye dönüştürücüyü](https://abox.tools/tr/heic-jpg-donusturme/) açın, fotoğrafları bırakın ve “Dönüştür”e basın. Kalite kaydırağını olduğu yerde bırakın ve aksini gerektiren bir sebebiniz yoksa “tarihi, kamerayı ve ayarları koru”yu işaretli bırakın. Geriye JPEG'ler alırsınız; her birinin bir indirme düğmesi olur, birkaç tane varsa bir zip.

Siz bunu yaparken hiçbir şey yüklenmiyor. Bu, tam da bu iş için alışılmadık bir durumdur ve sebebi bu sayfanın ilginç yarısıdır.

![Seçenekler kartı: JPEG'e ayarlı bir biçim menüsü, 85'te bir kalite kaydıracı ve özgün dosyadaki tarihi, fotoğraf makinesini ve konumu koruyan bir anahtar.](https://abox.tools/screens/convert-heic-to-jpg/options.webp)

Dönüştürmenin tamamı bu üçü. Üstünde durmaya değen, üstveri anahtarıdır; aşağıdaki bölüm nedenini söylüyor.

## HEIC aslında nedir

HEIC, JPEG'in olduğu anlamda gerçekten bir görsel biçimi değildir. Bir kaptır — bir MP4'ün kurulduğu kutu yapısının aynısı — ve içinde bir **HEVC** videosunun tek bir karesi vardır. H.265 de denen HEVC, eski kameranızın kullandığı kodlayıcının yerini alan kodlayıcıdır ve çok iyidir: HEIC'teki bir iPhone fotoğrafı, aynı kalitedeki JPEG hâlinin kabaca yarısı boyutundadır.

Apple 2017'de, iOS 11'de buna geçti ve varsayılan yaptı. Yani biri Ayarlar'a girip “En Uyumlu”yu seçmediyse, telefonunun neredeyse on yıldır çektiği her fotoğraf şu özelliklere sahip bir biçimdedir:

- Windows, Mağaza'dan bir uzantı olmadan ön izlemesini göstermez;
- çoğu web yükleme formu düpedüz reddeder;
- epeyce eski masaüstü yazılımı adını bile duymamıştır;
- ve Safari dışında hiçbir web tarayıcısı göstermez.

Fotoğrafta bir sorun yok. JPEG'in olacağından daha iyi bir dosya. Yalnızca dünyanın çoğunun hiç öğrenmediği bir dilde yazılmış.

## Neden bir tanesini yalnızca Safari açıyor

Bu kısım şimdiye kadar kullandığınız her dönüştürücüyü açıklıyor, o yüzden bir paragrafa değer.

HEVC'yi çözmek bir HEVC çözücüsü ister ve HEVC patentlidir. Lisanslama birden fazla patent havuzu tarafından yürütülür ve bir çözücü göndermek birine para ödemek demektir. Tarayıcılar bunu işletim sistemine yaslanarak çözer — Chrome, donanımında lisanslı bir çözücü zaten bulunan bir makinede HEVC *videosu* oynatır — ama o yol video oynatımı için döşenmiştir, duran görüntüler için değil. Yani `<img>`'e verilen bir HEIC, her işletim sisteminde, Chrome'da da Firefox'ta da Edge'de de reddedilir.

Apple donanımındaki Safari istisnadır; çünkü macOS ve iOS çözücüye sahiptir ve Safari'nin ona sormasına izin verilir. Başka her yerde resim, tarayıcı açısından düpedüz çözülemezdir.

Bu da bir dönüştürücüye tam olarak iki seçenek bırakır ve ikisi arasındaki seçim, bu tür bir aracın bütün hikâyesidir.

## Neredeyse her HEIC dönüştürücüsü neden bir yükleme istiyor

Birinci seçenek: çözücüyü bir sunucuya koymak. Fotoğraf yüklenir, hiç görmediğiniz bir makinede çözülür, JPEG olarak yeniden kodlanır ve geri gönderilir. Hemen her “ücretsiz çevrimiçi HEIC dönüştürücü”nün yaptığı budur ve hepsinin dosyalarınıza ihtiyaç duymasının sebebi de budur. Tembellik değil — tarayıcı bunu gerçekten yardımsız yapamıyor.

Bunun bedeli konusunda açık sözlü olmaya değer. Telefondan çıkan fotoğraflar çoğu insanın sahip olduğu en kişisel dosyalardır ve bir iPhone'dan doğrudan çıkan bir HEIC tipik olarak, çekildiği yerin birkaç metre hassasiyetindeki koordinatlarını, saniyesine kadar tarihi ve bir kamera tanımlayıcısını taşır. Bir klasör dolusunu ücretsiz bir hizmete yüklemek, hem resimleri hem de bunu teslim etmek demektir. Sonrasında ne olacağını, okumadığınız bir gizlilik politikası, inceleyemediğiniz bir sunucu ve seçmediğiniz bir yargı bölgesi belirler.

İkinci seçenek: çözücüyü sayfaya koymak. [Bu araç](https://abox.tools/tr/heic-jpg-donusturme/) onu yapıyor. WebAssembly'ye derlenmiş `libheif`'i, bu siteden sunulan bir dosya olarak taşıyor — yaklaşık 1,4 MB, bir kez indirilip sonra önbelleğe alınıyor. Tarayıcınız onu kendi makinenizde, kendi donanımınızda çalıştırır ve fotoğraf hiçbir yere gitmez. Sayfayı bir kez yükleyin, sonra internet bağlantısını tamamen kesin, çalışmaya devam eder ki bu, yükleme yapan hiçbir dönüştürücünün yapamayacağı bir şeydir ve var olan en basit kanıttır.

1,4 MB'nin tamamı, ödenen bedeldir. Ölçülen bir bağlantıdaysanız bu gerçek bir maliyettir ve bilmeye değer; sayfanın onu sessizce indirmek yerine yüksek sesle söylemesinin sebebi de budur.

## Dönüştürmek resme neye mal oluyor

HEIC ve JPEG farklı kodlayıcılardır; yani resmi çözüp yeniden kodlamayı içermeyen bir geçiş yolu yoktur. O ikinci kodlama kayıplıdır. Pratikte bu, kulağa geldiğinden çok daha az önemlidir:

- **92 kalitede** — dönüştürücünün başladığı yer — bir fotoğrafı normal bir izleme boyutunda özgün hâlinden ayırmak çok zordur. Açık bir gökyüzü gibi yumuşak geçişlerde fark ararsınız ve genellikle bulamazsınız.
- **JPEG daha büyük olacak.** Genellikle üçte bir büyükle iki katı arasında bir yerde; çünkü JPEG 1992'den kalma bir kodlayıcıdır, HEVC ise değil. Takas budur: her şeyin açtığı, daha büyük bir dosya.
- **Kaçınılacak şey iki kez dönüştürmektir.** Her kayıplı kodlama bir parça bedele mal olur. Birinin sizin için çoktan yaptığı bir JPEG'den değil, özgün HEIC'ten dönüştürün ve bunu bir kez yapın.

Hiç kayıp istemiyorsanız biçim menüsünde PNG var. Dosyaya hazır olun: bir fotoğraf PNG olarak, genellikle JPEG hâlinin beş ila on katı boyutundadır; çünkü PNG'nin sıkıştırması çimen ve ten için değil, düz renk ve çizgi çalışması için tasarlanmıştı.

## Tarih, kamera ve koordinatlar

HEIC dönüştürücüleriyle ilgili alışıldık şikâyet, fotoğrafların çekildikleri günü kaybetmiş olarak geri gelmesidir; böylece bir tatil dolusu resim, kütüphanenin en altına bugünün tarihiyle sıralanır. Bu, bir tuval üzerinden dönüştürmenin size piksellerden başka bir şey vermemesinden olur — bir tuval hiçbir etiket tutmaz — yani bir dönüştürücü gidip üstveriyi ayrıca getirmediyse üstveri düpedüz gitmiştir.

Buradaki araç EXIF bloğunu HEIC'ten kopyalayıp JPEG'in içine yazar, böylece tarih hayatta kalır. Bir onay kutusu var ve varsayılan olarak işaretli. İşareti kaldırın, JPEG resimden başka bir şey olmadan çıksın.

Karar vermeden önce listeye bakın: her fotoğrafın satırı, dosyanın GPS koordinatları taşıyıp taşımadığını söyler ve bunu herhangi bir şey dönüştürülmeden önce söyler. Fotoğraflar herkese açık bir yere gidiyorsa okunacak satır odur. Kendi kütüphanenize gidiyorlarsa üstveriyi korumak neredeyse kesinlikle istediğiniz şeydir.

Ne seçerseniz seçin bir etiket değişir ve sebebini bilmeye değer. Bir HEIC döndürmesini iki yerde kaydeder: kapta ve EXIF bloğunda. Çözücü, çözerken kabın döndürmesini uygular, yani teslim edilen pikseller zaten doğru yöndedir. EXIF hâlâ “bunu 90 derece döndür” deseydi bir görüntüleyici bunu bir kez daha yapardı ve her dikey fotoğraf yan yatmış çıkardı. Bu yüzden yön etiketi dik olarak ayarlanır ve geri kalan her şey telefonun yazdığı gibi, olduğu gibi kopyalanır.

İstediğiniz şey etiketleri ayrıntısıyla gözden geçirmek ya da zaten JPEG olan fotoğraflardan silmekse, o başka bir iştir ve onun için bir [rehberi var](https://abox.tools/tr/rehberler/exif-ve-gps-verisini-silme/).

## İnsanları yanıltan şeyler

- **“.jpg” adlı bir HEIC.** Son derece yaygın: yol boyunca bir şey onu dönüştürmeden yeniden adlandırmıştır; hâlâ açılmamasının sebebi de budur. Dönüştürücüye bırakılan her dosya adından değil ilk baytlarından tanınır, yani bunlardan biri sorunsuz çalışır. Gerçekten JPEG olan bir dosyanın kendisinin bir kopyasına dönüştürülmek yerine bunun söylenmesinin sebebi de budur.
- **Tek dosya, birkaç resim.** Bir seri çekim ya da bir Live Photo birden fazla kare tutabilir. Hepsi dönüştürülür ve fazladan olanlar özgün adın ardından numaralanır. Bir Live Photo'nun video yarısı, telefonun HEIC'in yanında tuttuğu ayrı bir dosyadır, yani dönüştürülmek üzere orada değildir.
- **AVIF, HEIC değildir.** Birbirlerine benzerler — aynı kap, içinde farklı kodlayıcı — ama güncel her tarayıcı bir AVIF'i kendiliğinden açar, yani dönüştürülecek bir şey yoktur ve araç, çalışıyormuş gibi yapmak yerine bunu söyler.
- **Sorunu kaynağında durdurmak.** Telefonda: Ayarlar → Kamera → Biçimler → En Uyumlu. O andan sonra yeni fotoğraflar JPEG olur. Daha fazla depolama kullanır ve zaten sahip olduğunuz fotoğraflara dokunmaz, ama bunu bir daha hiç yapmamak demektir.
- **Paylaşmak bazen zaten dönüştürüyor.** Bir fotoğrafı Apple dışı bir cihaza AirDrop'lamak ya da e-postayla göndermek çoğu zaman bir JPEG teslim eder; çünkü iOS çıkışta dönüştürür. Bir fotoğraf yine de HEIC olarak geldiyse, dönüştürmeyen bir yoldan gelmiştir.

## Bir dönüştürücünün yükleme yapıp yapmadığını nasıl anlarsınız

Bu, yalnızca bu araç için değil her araç için geçerlidir ve yaklaşık on beş saniye sürer.

1. Sayfayı açın, sonra tarayıcınızın geliştirici araçlarını açıp Ağ sekmesine gidin.
2. Bir fotoğraf dönüştürün ve izleyin. Sizin makinenizde çözen bir araç o anda hiçbir istek yapmaz. Yükleme yapan bir araç, fotoğrafınızın boyutunda bir istek yapar ve boyutunu görebilirsiniz.
3. Ya da daha basiti: sayfayı yükleyin, internet bağlantısını kesin ve bir şey dönüştürmeye çalışın. Fotoğrafınızı çözülmek üzere uzağa gönderen bir araç çalışmayı bırakır. Çözücüyü taşıyan bir araç bırakmaz.

Buradaki dönüştürücü iki denetimi de geçecek şekilde kuruldu ve bu tartışmanın daha uzun bir sürümü [dosya yüklemek güvenli mi](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) sayfasında.
