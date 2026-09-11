# abox.tools hakkında

Ontario’da tek bir kişi, sürekli ihtiyaç duyduğu ve sürekli güvenemediği araçları kendisi yazıyor. Buradaki her şey sizin kendi cihazınızda çalışır, kaynak kodu herkese açıktır, ve bu sayfa ikisinin de gerekçesini anlatır.

Son güncelleme 27 Ağustos 2026

## Bu site nedir

abox.tools, her biri tek bir işi yapan küçük araçlardan oluşan bir derlemedir: bir fotoğrafı yeniden boyutlandırmak, bir videoyu kesmek, iki PDF’yi birleştirmek, bir QR kodunun içinde gerçekte ne yazdığını okumak. Şu an 44 tane var, yanlarında da bu işleri anlatan bir [rehber derlemesi](https://abox.tools/tr/rehberler/) bulunuyor.

Alışılmadık olan, ne yaptıkları değil, nerede yaptıklarıdır. Hepsi tamamen tarayıcınızın içinde, kendi donanımınızda, tarayıcınızın zaten barındırdığı çözücü ve kodlayıcılarla çalışır. Açtığınız hiçbir şey herhangi bir yere iletilmez. Bu sayfaların arkasında iletilecek bir sunucu da yoktur: sitenin tamamı statik dosyalardan oluşur ve araçlar, onların yanında sunulan sıradan JavaScript modülleridir.

Ürün budur. Bu sayfanın geri kalanı, bunun neden bu şekilde yapılmaya değer olduğunu ve bunu kimin yaptığını anlatır.

## Kim yapıyor

Kanada’nın Ontario eyaletinde, tek başına çalışan bir kişi. Burası bir şirket değildir. Ekip yok, yatırımcı yok, bağlı bulunulan bir kuruluş yok, satın alınma planı da yok. Yazışmalar [hi@abox.tools](mailto:hi@abox.tools) adresine gider ve kodu yazan kişiye ulaşır; bu adresin ne işe yaradığı ve ne işe yaramadığı [iletişim sayfasında](https://abox.tools/tr/iletisim/) yazılıdır.

Site bilinçli olarak kişisel bir imza taşımadan yayımlanır. Burası kişisel bir marka değil, küçük bir projedir; ve burada güvenilmesi gereken şey bir sayfanın altındaki isim değil, [herkesin okuyabileceği kaynak kodu](https://github.com/A-Box-of-Tools/website) ile geliştirici araçları açıkken otuz saniye içinde herkesin sınayabileceği sayfa davranışıdır. Bu ikisi doğrulanabilir. Bir imza değildir.

## Neden böyle yapılmış

Bu araçların alışılmış yapılış biçimi şudur: dosya yüklenir, iş bir sunucuda yapılır, sonuç geri gönderilir. Bu daha kolaydır, her cihazda çalışır ve neredeyse her “ücretsiz çevrimiçi dönüştürücü” böyle çalışır.

Aynı zamanda dosyanızı bir yabancıya teslim etmek anlamına gelir. Bir espri görseli için önemsizdir; bir pasaport taraması, bir tıbbi görüntü, imzalı bir sözleşme ya da üstverisinde ev adresinizi taşıyan bir fotoğraf için hiç önemsiz değildir. Dosya bir kez başkasının makinesine geçtiğinde başına ne geleceği o tarafın politikalarına ve dikkatine kalmıştır, ve ikisini de denetlemenin bir yolu yoktur. Böyle bir sitenin gizlilik politikası bir vaattir, bir kısıt değil.

Tarayıcılar bu vaadi gereksiz kılacak kadar iyileşti. JPEG, PNG ve WebP’yi okuyup yazabiliyorlar; videoyu ayrıştırıp çözebiliyorlar; bir dosyanın özetini hesaplayabiliyor, bir QR kodu okuyabiliyor ve PDF yazabiliyorlar. İş sizin kendi makinenizde yapılabiliyorsa, “dosyamı saklarlar mı” sorusu artık birinin niyetiyle ilgili olmaktan çıkar ve kodun fiziksel olarak neyi yapabildiğiyle ilgili bir soru hâline gelir. Onu da kendiniz yanıtlayabilirsiniz.

Bütün gerekçe budur, ve bunu hakkıyla anlatan bir rehber var: [bir siteye dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/)

## Güvenmek yerine doğrulamak

Yukarıdaki her iddia sınanmak için yazılmıştır. Zahmet sırasına göre dört yol:

- **İnterneti kesin.** Herhangi bir araç sayfasını açın, bağlantıyı kesin ve aracı yine de kullanın. Çalışmaya devam eder, çünkü içinde hiçbir zaman bir ağ adımı olmamıştır. Dosyanızı işlenmek üzere dışarı gönderen bir araç bu noktada dururdu.
- **Ağı izleyin.** Geliştirici araçlarını açın, Ağ sekmesine geçin ve bir dosya işleyin. Tek bir istek bile dosyanızı, onun küçük önizlemesini, adını veya içeriğinden tek bir baytı taşımaz. Göreceğiniz şey sayfanın kendisi, betikleri, reklamlar ve ziyaret sayacıdır.
- **Sayfanın kendine koyduğu kuralı okuyun.** Her sayfa, bağlanmasına izin verilen bütün adresleri tek tek sayan bir `Content-Security-Policy` taşır ve bunların hiçbiri bu siteye ait değildir. Koddaki bir hata bile bir dosyayı herhangi bir yere gönderemez, çünkü tarayıcı bağlantıyı reddederdi.
- **Kodu okuyun.** Kod [tamamen açıktır](https://github.com/A-Box-of-Tools/website), derleme adımı ve paketleyici yoktur: depoda ne varsa tarayıcınızın çalıştırdığı şey bayt bayt odur. Her aracın nasıl çalıştığını anlatan bir README dosyası vardır, ve her araç sayfası önce hangi dosyaların okunmaya değer olduğunu söyler.

“Ağ yok” kuralının bilinçli olarak yalnızca tek bir istisnası vardır ve o da kendi sayfasında uzun uzun anlatılır: [Metin Paylaşma](https://abox.tools/tr/metin-paylasma/), metni sizin iki cihazınız arasında taşır ve bu ağsız yapılamaz. Hiçbir şey saklamayan ve yalnızca iki tarayıcının tanıştırılmak istediği söylenen bir aracıya tek bir bağlantı açar.

## Araçlar nasıl yazılıyor ve nasıl sınanıyor

Bir araç, yazıldığı dosyayla çalıştığında değil, gerçek dosyalarla çalıştığında yayımlanır. Uygulamada bu, her aracın bir tarayıcıda elle, zor girdilerle denenmesi demektir: kesmek istediğiniz yerde anahtar karesi olmayan video, kapsayıcıyı biraz yanlış yazan bir telefonun HEIC dosyası, yazı tipi yalnızca kısmen gömülmüş PDF. İnsanların elinde gerçekten olan şeyler bunlardır, ve hatayı yazan kişinin yazdığı bir sınamanın bulamayacağı şeyler de bunlardır.

Bunun altında iki yarımı da kapsayan otomatik bir sınama takımı vardır: siteyi üreten üreteç ve tarayıcının çalıştırdığı modüller. Her değişiklikte koşar ve bir başarısızlığın ardından hiçbir şey yayımlanmaz. Aynı işin birden fazla araçta bulunduğu yerlerde, ki birkaçı MP4 dosyalarını okur, bir sınama kopyaların hâlâ birbiriyle uyuştuğunu doğrular; böylece birinde yapılan düzeltme diğerlerini sessizce yanlış bırakamaz.

Rehberler de aynı ölçüyle yazılır. Ekran görüntüleri çizilmez ya da canlandırılmaz, üretilmiş siteden bir betikle alınır; dolayısıyla bir rehberdeki resim, sayfanın bugün gerçekten göründüğü hâlidir.

## Masrafı ne karşılıyor

Reklamlar ve araçları yararlı bulanların bağışları. İş modelinin tamamı budur, ve neyi kapsayıp neyi kapsamadığını açıkça söylemek gerekir.

**Satın alınacak bir şey yok.** Hesap yok, kayıt yok, üstünde ücretli bir katman bulunan ücretsiz bir katman yok, kaldırılacak filigran yok, dosya boyutu sınırı yok, günlük sınır yok ve geri tutulan bir özellik yok. Sitede ne varsa tamamı odur.

**Dosyalarınız bu anlaşmanın parçası değildir.** Reklamlar Google’ın, ziyaret sayımı ise Google Analytics’indir; ve ikisine de ne açtığınız, ne ürettiğiniz, adının ne olduğu ya da ne kadar büyük olduğu söylenmez, çünkü bu bilgi hiçbir betiğe verilmez ve biri denese bile sayfanın güvenlik politikası göndermeyi reddederdi. Bu ikisinin gerçekte ne topladığı ve her birinin nasıl kapatılacağı [gizlilik sayfasında](https://abox.tools/tr/gizlilik/) yazılıdır. İkisi de engelli hâldeyken bütün araçlar çalışmaya devam eder.

**Araçlar reklam için yazılmaz.** Buradaki hiçbir araç bir anahtar kelime para ettiği için var olmamıştır, ve hiçbiri daha fazla gösterim satmak uğruna yavaşlatılmamış, zorlaştırılmamış ya da daha çok sayfaya bölünmemiştir. Sırada neyin yapılacağı herkesin gözü önünde tartışılır: [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md) dosyasında fikir başına bir paragraf, üstelik bariz görünen birkaç önerinin neden reddedildiği de dâhil.

## Diller

Site on beş dilde yayımlanır. Her biri gerçek bir çeviridir, olduğu yerde bırakılmış bir makine çıktısı değil: araç adları, açıklamalar, rehberler ve adreslerin kendisi çevrilmiştir, ve bir sayfa ancak o dil gerçekten yazıldıktan sonra o dilde listelenir. Üzerinde hâlâ çalışılan bir dil okunabilir kalır ama site haritasının ve dil seçicinin dışında tutulur; böylece kimse yarısı İngilizce olan bir sayfaya davet edilmez.

Yazışmalar İngilizce yanıtlanır; bu ölçekte bir proje için söylenebilecek tek dürüst şey budur.

## Bu sitenin yapmayacakları

- Hesap açmanızı istemek ya da e-posta adresinizi istemek.
- Burada açtığınız bir dosyayı yüklemek, saklamak, incelemek ya da tutmak.
- Bir sonuca filigran koymak ya da bir özelliği ücretli katman için geri tutmak.
- İhtiyacı olmayan bir araca ağ adımı eklemek.
- Bir araç sayfasında, depodaki kodun yapmadığı bir şeyi iddia etmek.

Bunlardan birinin gerçekleştiğini görürseniz bu hem bir hata hem de bozulmuş bir sözdür, ve haber vermeye değer. [İletişim sayfası](https://abox.tools/tr/iletisim/) en hızlı yoldur.
