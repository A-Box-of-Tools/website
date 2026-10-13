# Online bir araca metin yapıştırmak güvenli mi?

Yapıştırmak yüklemek gibi hissettirmez, tuzak da budur: sayfa onları gönderiyorsa aynı baytlar makinenizden yine çıkar. Bu sayfa, yapıştırılan bir config'in ya da log'un gerçekte neler taşıdığını ve önünüzdeki aracın onları gönderecek bir yeri olup olmadığını nasıl anlayacağınızı anlatır.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Bir web sayfasına metin yapıştırmak, o sayfaya dosya yüklemek kadar sonuç doğurabilir. Öyle hissettirmemesinin sebebi, hareketin güvenli bir yerden ödünç alınmış olmasıdır: kendi iki pencereniz arasında yapıştırmak, metni sizin denetiminizdeki bir yerden yine sizin denetiminizdeki başka bir yere taşır. Bir web sayfasında ikinci yer, bir betiğin okuyabildiği bir metin kutusudur — ve sonrasında ne olacağına hareket değil, tamamen sayfa karar verir.

Yapıştırma biçimli pek çok araç işini bir sunucuda görür: sayfa metninizi yollar, sunucu biçimlendirir, doğrular ya da karşılaştırır, sonuç geri gelir. Ekranda hangi türü kullandığınızı söyleyen hiçbir şey yoktur. Metin kutusu iki durumda da aynıdır; “Biçimlendir” düğmesi de. Fark, tek bir ağ isteğidir ve bakmadıkça görünmez.

## Bir yapıştırma gerçekte neler taşır

Online araçlara düşen şey nadiren düzyazıdır. Birinin mesleğinin çalışma metnidir ve tür önemlidir; çünkü bilgisayarcılığın en hassas dizgilerinden bazıları, tam da gece yarısı biçimlendiricilere yapıştırılanlardır:

- **Yapılandırma dosyaları**, bir programın içine gömülmemesi gerekenleri tutmak için vardır ve o şeyler veritabanı parolaları, API anahtarları ve imza sırlarıdır. Bütün hâlinde yapıştırılan bir config hepsini birden taşır.
- **Log'lar ve hata dökümleri** URL'lerde oturum belirteçleri, e-posta adresleri, iç makine adları ve ara sıra içinde birinin kişisel verisi olan bir istek gövdesi taşır.
- **API yanıtları**, üretim verisinin anlık görüntüleridir — gerçek müşteriler, gerçek bakiyeler — okuması rahat olsun diye uygun bir yere yapıştırılmış.
- **Base64 görünümlü her şey**, bir çözücüye yapıştırıldıysa genellikle önemli olduğu için kodlanmıştı: ayıklanan bir belirteç, bir sertifika, bir kimlik doğrulama başlığı.

Bir yabancının sunucusundan geçmiş bir anahtar, fark ettiğiniz anda açığa çıkmış sayılmak zorundadır: iptal edilip yeniden verilmelidir ve bu, üretimdeki bir sistemde kimsenin planlamadığı bir öğleden sonradır. Mesele biçimlendirici sitelerin kimlik bilgisi topluyor olması değil. Mesele bir sunucunun neyi kayda geçirdiğini bilemeyeceğiniz ve açığa çıkmadığından emin olamadığınız bir sırrın, değiştirmek zorunda olduğunuz bir sır olmasıdır.

## Araç metninizin gitmesine neden muhtaç değil

İşte soruyu bitiren teknik gerçek: metni biçimlendirmek, doğrulamak, dönüştürmek ve karşılaştırmak, bilgisayarcılığın en kolay işleri arasındadır. JSON ayrıştırmak, XML'e girinti vermek, iki dosyayı karşılaştırmak, base64 kodlamak — bir tarayıcı bunları milisaniyeler içinde, yerelde yapar ve yıllardır yapabiliyor. Sunucu işe hiçbir şey katmaz. Yapıştırma biçimli bir araç metninizi yüklüyorsa, bu bir mimari kalıntısı ya da işletmecinin rahatlığıdır; işin gereği asla değildir.

Bu sitenin metin araçları tam da bunun karşı örneğidir. [JSON biçimlendirici](https://abox.tools/tr/json-bicimlendirme/) JSON, XML, HTML, CSS ve YAML'ı ayrıştırır, biçimlendirir ve dönüştürür; [metin karşılaştırıcı](https://abox.tools/tr/metin-karsilastirma/) iki metin arasındaki her farkı satır satır, kelime kelime işaretler; [base64 kodlayıcı ve çözücü](https://abox.tools/tr/base64-kodlama/) metin ile kodlamaları arasında iki yönde çalışır. Üçü de sizin makinenizde döner ve yapıştırdığınızın gidecek yeri yoktur — bu sayfalarda onu gönderebilecek bir kod yolu bulunmaz.

İkisinin rehberi de hazır: [JSON'u yüklemeden biçimlendirmek](https://abox.tools/tr/rehberler/json-yuklemeden-bicimlendirme/) ve [iki JSON dosyasını karşılaştırmak](https://abox.tools/tr/rehberler/iki-json-dosyasini-karsilastirma/).

## Hangi türü kullandığınızı anlamak

Denetimler dosya araçlarındakilerle aynıdır ve [yükleme rehberinde](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) tam hâliyle yazılıdır. Yapıştırma diliyle kısa sürümü:

- **Fişi çekin.** Sayfayı yükleyin, bağlantıyı kesin, yapıştırın, düğmeye basın. Yerel araç devam eder; sunucu aracı durur. Otuz saniye, uzmanlık sıfır, sahtesi yapılamaz.
- **Biçimlendir'e basarken Ağ sekmesini izleyin.** O anda yola çıkan, aşağı yukarı yapıştırdığınız boyutta bir istek, yapıştırdığınızın yola çıkışıdır. İstek yoksa yükleme de yok.
- **Yardımsever fazlalıklardan kuşkulanın.** Bir “bu parçayı paylaş” düğmesi, cihazlar arasında gezen bir yapıştırma geçmişi, iş arkadaşına yollanacak bir bağlantı — her biri ancak metin bir sunucuda saklandıysa mümkündür. Özellikler itiraftır: yapıştırdığınızı başkasına gösterebilen sayfa, onu tutmuş demektir.

Ve tek bir alışkanlık üç denetimi de geride bırakır: daha az yapıştırın. Bir doğrulayıcının, bir config'in biçimini doğrulamak için gerçek parolaya ihtiyacı yoktur — `"REDACTED"` birebir aynı ayrıştırılır. Sırrın kendisi olan yapıştırmadaysa kural daha da yalınlaşır: bir parolayı almaya hakkı olan tek sayfa, o parolanın ait olduğu giriş sayfasıdır.
