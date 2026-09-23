# Bir görsel bozmadan nasıl boyutlandırılır

Boyutlandırma, hasarın düğmeye basmadan önce — hangi sayıyı yazdığınıza ve hangi şekli istediğinize göre — belirlendiği tek görsel işidir. Bu rehber her seçimin resme ne yaptığını ve hangilerinin geri alınabileceğini anlatıyor.

[Görsel Boyutlandırıcı aracını açın](https://abox.tools/tr/resim-boyutlandirma/): Boyutu söyleyin. Kutuyu çizin. Biçimi seçin.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/)'yı açın, resminizi bırakın, tek bir sayı yazın — genellikle genişlik — ve diğerini boş bırakın. Yükseklik resmin şeklinden gelir ki neredeyse her zaman istenen de budur: “1920 genişliğinde”, “1920 genişliğinde ve bunun getirdiği yükseklikte” demektir.

Aşağıdaki her şey, tek bir sayının yetmediği durumlar içindir: iki kenarı da verilmiş bir kutu aldığınızda, resmin büyümesi gerektiğinde ya da koca bir klasör dolusu dosyanın aynı şekilde çıkması gerektiğinde.

![Boyutlandırıcının 3. adımı: 1920 genişlik, boş bırakılmış ve otomatik yazan bir yükseklik ve altında photo.jpg dosyasının 2400 çarpı 1600 olduğunu ve 1920 çarpı 1280 çıkacağını söyleyen bir satır.](https://abox.tools/screens/resize-an-image/one-number.webp)

Tek bir sayı yazıldı. Aracı öbürünü hesaplar ve hiçbir şey boyutlandırılmadan önce söyler.

## Küçültmek güvenlidir. Büyütmek değildir.

Bunlar aynı işlemin iki yönü değildir ve sebebi konusunda açık olmaya değer.

**Bir resmi küçültmek** bilgiyi atar ve bunu tek iyicil anlamda yapar: içeri giren piksel dışarı çıkandan fazladır, yani sonucun her pikseli gerçekten ölçülmüş ayrıntıdan ortalanmıştır. İyi boyutlandırılmış küçük bir kopya, o boyutta izlenen özgün hâlinden genellikle *daha iyi* görünür; çünkü ortalama gürültüyü kaldırır. Hiçbir şey uydurulmaz.

**Bir resmi büyütmek** uydurmak zorundadır. Ayrıntı dosyada eksik değildir; hiç fotoğraflanmamıştır. Herhangi bir büyütücünün yapabileceği tek şey ara pikselleri komşularından tahmin etmektir ve bilinen iki değer arasındaki bir tahmin, yumuşak bir rampadır — büyütülmüş bir fotoğrafın keskin değil yumuşak görünmesinin sebebi de budur. Aynı resmin daha ayrıntılı değil daha büyük bir kopyasıdır.

Buradaki araçta “bir resmi asla başladığından büyük yapma”nın varsayılan olarak açık olmasının sebebi budur. Piksel sayısına gerçekten ihtiyacınız varsa kapatın — asgari bir boyut isteyen bir matbaa, bir genişliğin altındaki hiçbir şeyi kabul etmeyen bir şablon — ama ayrıntı değil piksel satın aldığınızı bilerek yapın.

Ayrıntı ekliyormuş gibi görünen makine öğrenmeli büyütücüler tamamen başka bir şeydir: resimlerin genellikle nasıl göründüğüne dair bir modelden akla yatkın doku uyduruyorlardır. Bir duvar kâğıdı için bu sorun değildir. Bir insanın fotoğrafı, bir belge ya da birinin bir sonuç çıkaracağı herhangi bir şey için ise fazladan ayrıntının kurgu olduğunu bilin.

## İstediğiniz boyutu söylemenin üç yolu

Bu araç dâhil çoğu araç aynı üçünü kabul eder ve bunlar farklı işlere uyar.

- **Tam piksel.** Birinin sayıyı belirttiği durumlarda kullanın: ⁦400×400⁩ olmak zorunda olan bir avatar, 1500 genişliğinde olmak zorunda olan bir afiş. Size ikisi birden verilmedikçe bir kenarı doldurun ve diğerinin gelmesine izin verin.
- **Bir yüzde.** Her şeyin orantılı olarak küçülmesini istediğiniz ve tam rakamı önemsemediğiniz durumlarda kullanın — bir belgeye girecek bir fotoğraf seti için “yarı boyut”.
- **Bir uzun kenar.** Karışık bir yığın için üçünün en yararlısı. “En uzun kenar 1600”, dikey de yatay da olsa her resmi 1600 piksellik bir karenin içine sığdırır ki pratikte “bunların hepsini makul bir boyuta getir”in anlamı genellikle budur.

## Kutu resimden başka şekilde olduğunda

Boyutlandırmanın asıl belirlendiği yer burasıdır. Hem bir genişlik hem bir yükseklik verirseniz ve bunlar resminizin oranlarına uymuyorsa bir şeyin esnemesi gerekir ve bunu yapabilecek tam olarak dört şey vardır:

- **Kutunun içine sığdır.** Resmin tamamı korunur ve bir eksende kutudan küçük çıkar. Hiçbir şey kaybolmaz ve hiçbir şey bozulmaz; yalnızca istediğiniz tam boyutları almazsınız. Neredeyse her şey için doğru varsayılan budur.
- **Kutuyu doldur ve taşanı kes.** İstediğiniz boyutları tam olarak alırsınız ve resmin kenarlardan taşan kısımları gider. Şeklin sabit ve öznenin ortada olduğu küçük resimler, avatarlar ve kapaklar için doğrudur. Önemli olan şey bir kenara yakınsa yanlıştır.
- **Tamamla.** Resmin tamamı ortalanmış olarak korunur ve artan boşluk seçtiğiniz bir renkle doldurulur. Bir sistem tam boyut dayattığında ve görüntüden hiçbir şey kaybedemediğinizde doğrudur — ürün ilanları çoğu zaman böyle çalışır.
- **Esnet.** Resim sığmak için ezilir ya da çekilir. Bunu bilerek yapmıyorsanız asla istediğiniz şey değildir ve herkesin anında yanlış olduğunu anladığı seçenek de budur.

Kendinizi esnetmeye uzanırken bulursanız muhtemelen istediğiniz şey kırpmaktır.

![Aynı alanlarda iki kez 1200 ve altında bir menü: biçimler uyuşmazsa içine sığdır, fotoğrafın tamamı ve bir kenar istenenden kısa.](https://abox.tools/screens/resize-an-image/fit.webp)

İki kenarı da doldurun, menü belirir. Bu sayfada fotoğrafın bir bölümünü kaybedebilecek tek ayar odur; aşağıdaki dört yanıtı ona dokunmadan önce okumaya değmesinin nedeni budur.

## Kırpmak başka bir iştir ve çoğu zaman doğru olanıdır

Boyutlandırmak, resmin tamamını kaç pikselin tarif ettiğini değiştirir. Kırpmak, resmin hangi kısmını tuttuğunuzu değiştirir. İnsanlar şaşırtıcı biçimde sık, esas olarak ikincisini kastederken birincisine uzanır — “bunun kare olması gerek” bir boyutlandırma değil bir kırpma sorunudur.

Bunları şu sırayla yapın: önce istediğiniz çerçevelemeye kırpın, sonra sonucu ihtiyacınız olan boyuta getirin. Tersini yapmak, çoktan piksel kaybetmiş bir resmin içinden kırpmayı seçmek demektir.

Buradaki aracın ikisini tek geçişte yapmasının sebebi budur — bir kutu sürükleyin, belirli bir oran gerekiyorsa onu bir şekle kilitleyin, sonra sonucun hangi boyutta çıkacağını söyleyin. Tek geçişte yapmak ayrıca resmin yalnızca bir kez kodlanması demektir ki bunun önemi bir sonraki bölümdeki sebeptendir.

### Koca bir yığını kırpmak

Bir resmin üstüne çizilen bir kutu, gerisine aynı *göreli* alan olarak uygulanır: her dosyanın kendi genişliğinin ve yüksekliğinin aynı kesirleri. Hepsi aynı boyutta olan bir ekran görüntüsü ya da dışa aktarım klasörü için bu, tam olarak aynı dikdörtgendir. Karışık bir yığın için ise aynı dikdörtgen değil aynı çerçevelemedir ki genellikle istenen budur ama elli dosyayı ona emanet etmeden önce bilmeye değer.

## Yeniden kodlamanın bedeli ve bunu bir kezde tutmak

Bir JPEG'i ya da bir WebP'yi boyutlandırmak, onu çözmek, pikselleri ölçeklemek ve yeniden kodlamak demektir — ve bu son adım kayıplıdır. Size kaliteye mal olan şey ölçeklemenin kendisi değil, yeniden kodlamadır.

Bundan iki şey çıkar. Birincisi, çıkıştaki kalite ayarı önemlidir: bir fotoğraf için ⁦80–85⁩ civarı bir yer görünmezdir ve 100'den hatırı sayılır ölçüde küçüktür. İkincisi, bunu bir kez yapın. Zaten iki kez boyutlandırılmış bir resmi boyutlandırmak, üç kuşak kayıplı kodlama demektir ve bu belli olur.

Bir PNG'nin böyle bir bedeli yoktur; çünkü kayıpsızdır — boyutlandırılmış bir PNG, tam olarak ölçeklenmiş piksellerdir. Birkaç adımda çalışıyorsanız ve son biçime henüz karar verilmediyse arada PNG'de çalışmak kuşakların üst üste binmesini önler.

Buradaki araçla ilgili bilmeye değer bir ayrıntı: gerçekten hiç değiştirmediğiniz bir dosya, yeniden kodlanmak yerine size baytı baytına geri verilir. Bir yığın için “en uzun kenar 1600” isteyin; zaten 1600'ün altında olanlar etiketleriyle birlikte el değmemiş çıksın. Onları sessizce yeniden kodlayan bir araç, kimsenin değiştirmesini istemediği dosyalarda size kaliteye mal oluyor olurdu.

## Saydamlık ve başına ne geldiği

PNG ve WebP saydamlık saklayabilir. JPEG saklayamaz — biçimde hiç alfa kanalı yoktur. Yani saydam bir görseli JPEG olarak kaydetmek arkasına bir şey koymak zorundadır ve o şey düz bir renktir.

Çoğu araç beyaz kullanır ve bundan söz etmez ki logonuz koyu bir sayfaya etrafında beyaz bir kutuyla düşene kadar bu sorun değildir. Rengi bilerek seçin ya da PNG veya WebP olarak kaydedip saydamlığı koruyun. Tamamlanmış bir çerçevenin arkasında da aynı renk kullanılır; insanların bununla sürpriz biçimde karşılaştığı öbür yer de orasıdır.

## Size bir sayı verildiyse hangi araç

İki farklı sayı veriliyor ve bunlar farklı araçlar istiyor.

**“1200 piksel genişliğinde”** bir boyut sorunudur. Araç [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/)'dır: kaç piksel istediğinizi söylersiniz, o da size onu verir.

**“500 KB'nin altında”** bir dosya boyutu sorunudur ve boyutlandırmak onu çözmenin yollarından yalnızca biridir. [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/), hedefinize sığan en yüksek kaliteyi arar ve yalnızca kalite tek başına yetmiyorsa boyutlandırır; bunun neye mal olduğunu [kendi rehberi](https://abox.tools/tr/rehberler/resmi-hedef-boyuta-sikistirma/) anlatıyor.

## Bunların hiçbirinin bir yüklemeye ihtiyacı yok

Bir görseli çözmek, ölçeklemek ve yeniden kodlamak her tarayıcının yıllardır yapabildiği şeylerdir — bir web sayfasının bir resmi başka bir boyutta çizmek için kullandığı mekanizmanın aynısı. Fotoğrafınızın daha küçük çıkmak için bir sunucuya gidip gelmesinin teknik bir sebebi yoktur ve buradaki araç onu hiçbir yere göndermez: sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir.

Size söylenmesindense denetlemeyi tercih ederseniz sayfayı yükleyin, internet bağlantısını kesin ve yine de bir şey boyutlandırın. [Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) herhangi bir araçta çalıştırabileceğiniz üç denetim daha anlatıyor.
