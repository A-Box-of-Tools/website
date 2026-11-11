# XML Biçimlendirici — açın, sıkıştırın ya da JSON'a çevirin

Okunmak için açılmış ya da gönderilmek için sıkıştırılmış XML, ve iki yönde de JSON'a çevrilmiş hâli. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.

> XML'i biçimlendirin, girintileyin ve sıkıştırın; XML'i JSON'a ya da JSON'u XML'e çevirin. Ayrıştırıcı tarayıcınızda çalışır ve hiçbir şey yüklenmez, böylece bir akış, bir fatura ya da bir yapılandırma dosyası cihazınızdan hiç çıkmaz.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/xml-bicimlendirme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## XML ve JSON dosyalarınız **asla yüklenmez**. Sunucu yoktur.

Biçimlendirmek ve çevirmek, bir metin dizisi üzerinde yapılan aritmetiktir; burada, bu sayfada yapılır. Ayrıştırıcı elle yazılmıştır ve `src/shared/parse-xml.js` içindedir, başka da bir şey yoktur. Bu aracın herhangi bir ağ işlevi hiç yoktur — getirecek bir şey de, gönderecek bir şey de — ve bu, burada „XML“ kelimesinin düşündürdüğünden daha çok önemlidir: bu biçimde gelen şey çoğunlukla bir fatura, bir hesap özeti, bir sağlık kaydı ya da başlığında birinin kimlik bilgileri duran bir SOAP isteğidir.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## XML yüklemeden nasıl biçimlendirilir

1. **İşi seçin.** İki sekme, tek kutu: *Biçimlendir* XML'i açar ya da sıkıştırır; *Çevir* onu JSON'a, ya da JSON'u yeniden XML'e döndürür. Az önce açtığınız XML, iki kez yapıştırmadan çevirdiğiniz XML'dir.
2. **Yapıştırın ya da dosyayı bırakın.** Seçip kopyalayabildiğiniz her şey olur; seçiciye bırakılan bir `.xml`, `.svg`, `.rss` ya da `.xsd` dosyasını kendi tarayıcınız okur ve kutuya koyar — atlanacak bir yükleme adımı yoktur.
3. **Girintiyi seçin ya da sıkıştırın.** İki boşluk, dört ya da bir sekme. Düz sıkıştırmak, yalnızca okunsun diye konmuş her boşluğu çıkarılmış aynı belgedir ve sonuç, bunun kaç bayt kazandırdığını söyler.
4. **Hatayı hatanın olduğu yerde okuyun.** Burada başarısız olan bir ayrıştırıcı, tarayıcının bir çırpıda okuduğu bir belge için söylediği „1. satırda hata“ yerine, *hangi etiketin* hiç kapatılmadığını ve hangi satır ile sütunda olduğunu söyler.
5. **Sonucu alın.** Kopyalayın ya da çıktığı biçimin adını taşıyan bir dosya olarak indirin.

## Kutuda ayrıca

- [Metin Karşılaştırma](https://abox.tools/tr/metin-karsilastirma/): İki metin girer; her fark satır satır ve sözcük sözcük işaretlenmiş çıkar. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [Base64 Kodlayıcı ve Çözücü](https://abox.tools/tr/base64-kodlama/): Base64, yüzde kodlaması, HTML varlıkları, onaltılık ve ters bölü kaçışları; iki yönde de. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [Metin ve dosya paylaşımı](https://abox.tools/tr/metin-paylasma/): Paylaşım bu açık sekmede yaşar. Okuyucular onu şifreli olarak doğrudan tarayıcınızdan alır ve sekmeyi kapattığınızda biter - hiçbir sunucu hiçbir şey saklamaz.
- [QR ve Barkod Üreteci](https://abox.tools/tr/qr-kod-olusturma/): Yazın, koda dönüşsün. Bir tane üretmek için hiçbir şey gönderilmez.

## Sorular

### XML'im bir yere yükleniyor mu?

Hayır. Bu sayfadaki ayrıştırıcı ve yazıcı, kendi tarayıcınızda, kendi donanımınızda çalışan işlevlerdir. Bu aracın herhangi bir ağ işlevi hiç yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi sayar; hiçbiri bize ait değildir. Bu, XML için biçimin ününün düşündürdüğünden daha çok önemlidir: içinde gelen şey çoğunlukla bir fatura, bir hesap özeti, bir sağlık kaydı ya da başlığında kimlik bilgileri duran bir SOAP isteğidir.

### Dış varlıkları çözümlüyor mu?

Hayır, ve kapatılacak bir şey de yok. Dış varlık çözümlemesi, bir XML ayrıştırıcısının kendisini çalıştıran makinedeki dosyaları okumaya ikna edilme yoludur — genellikle XXE diye yazılan saldırı — ve `src/shared/parse-xml.js` içinde hiç varlık çözümlemesi olmayan elle yazılmış bir okuyucudur. Metniniz tarayıcının kendi `DOMParser`'ına da hiçbir zaman verilmez. Bir `DOCTYPE`, hiç işletilmeden olduğu gibi taşınır.

### XML'i JSON'a çevirirken ne kaybolur?

Karışık içeriğin sırası, yorumlar ve bir öznitelik ile bir alt öge arasındaki fark — sonuncusu silinmekten çok yumuşatılır, çünkü bir öznitelik adı `@` ile başlayan bir üyeye dönüşür. Bir ögenin kendi metni, başka bir şeyin yanında durmak zorunda kaldığında `#text` olur ve yinelenen alt ögeler bir diziye dönüşür. Her değer metin olarak kalır: XML'in türleri yoktur ve `8080`'in bir sayı olduğuna karar vermek bilgi uydurmak olurdu.

### JSON'u XML'e çevirirken ne kaybolur?

Boş bir nesne, boş bir dizi ve boş bir metin arasındaki fark — üçü de boş bir ögeye dönüşür — ve her değerin türü, çünkü XML'in türleri yoktur. Bir dizi, geri okunabilen tek biçim olan yinelenen bir ögeye dönüşür; bir öge adının taşıyamayacağı bir anahtarın da zor karakterleri, hiçbir ayrıştırıcının okumayacağı bir belge üretmek yerine değiştirilir.

### Bir SVG'yi, bir RSS akışını ya da bir POM dosyasını biçimlendirebilir mi?

Evet. Üçü de XML'dir ve bu, XML'in belirli bir lehçesini değil XML'i okur. Böyle açılmış bir SVG'yi elle düzenlemek daha kolaydır; bir RSS ya da Atom akışı genellikle sıkıştırılmış gönderilir ve bir şey onu açana dek okunmaz. Yerleşimin belgenin anlamına hiçbir etkisi yoktur.

### XML'i yeniden girintilemek anlamını değiştirir mi?

Ögeleri başka ögeler tutan bir belge için hayır. Önemli olabileceği yer metindir: sözcük tutan bir ögenin içindeki boşluk o metnin parçasıdır, bu yüzden yalnızca metin tutan bir öge açılmak yerine tek satırda bırakılır. `CDATA` bölümleri tam olduğu gibi kopyalanır.

### Neden tarayıcının kendi XML ayrıştırıcısı kullanılmıyor?

Belge bozuk olduğunda söylediği şey yüzünden. `DOMParser`, ifadesi her tarayıcıda farklı olan ve çoğu zaman „1. satırda hata“ya inen bir hata belgesi döndürür. Elle yazılmış bir okuyucu, hangi etiketin hiç kapatılmadığını ve nerede açıldığını söyleyebilir; asıl bilmeniz gereken de buydu. Dış varlıkları çözümlememek de öteki nedendir.

### Ne kadar büyük bir dosyayı işleyebilir?

Burada konulmuş bir sınır yoktur, çünkü bunun bedelini ödeyen bir sunucu yoktur. Gerçek tavan kendi cihazınızdır: birkaç megabaytlık XML sorun çıkarmaz ve çok uzun bir belgede sayfa, klavyeyi sizinle paylaşmamak yerine yeniden biçimlendirmeden önce yazmanızda bir duraklama bekler.

### Ücretsiz mi, hesap gerekiyor mu?

Ücretsizdir; hesap, oturum açma, deneme süresi ve ne kadar yapıştıracağınıza dair bir sınır yoktur. Sitede reklam vardır, masrafı karşılayan da odur; reklamlara metninizle ilgili hiçbir şey verilmez.

### Çevrimdışı çalışır mı?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin; çalışmayı sürdürür. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yoludur: XML'inizi biçimlendirilmek üzere gönderen bir araç, fişi çektiğiniz anda dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Yapıştırdığınızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bize ait değildir. Burada yapıştırılmış bir faturanın toplanabileceği hiçbir uç nokta yoktur; olsaydı bile kodda onu oraya gönderecek hiçbir şey yoktur.
- **Burada hiçbir şey bir şey getirmez.** `src/` içinde hiçbir yerde ne bir `fetch`, ne bir `XMLHttpRequest`, ne de bir `sendBeacon` vardır. Ayrıştırıcı ve yazıcı, bu sayfada bir metin alıp bir metin döndüren işlevlerdir.
- **Dış varlıklar hiçbir zaman çözümlenmez.** İçinde dış varlık bulunan bir `DOCTYPE`, bir XML ayrıştırıcısının, ayrıştırma yapan makinedeki bir dosyayı okumaya ikna edilme yoludur ve biçimin en eski açığıdır. `src/shared/parse-xml.js`, içinde hiç varlık çözümlemesi bulunmayan elle yazılmış bir okuyucudur — kapatılmış değil, hiç yok — ve bu sayfa metninizi tarayıcının kendi `DOMParser`'ına da asla vermez.
- **XML'den çıkan her değer bir metindir.** `<port>8080</port>` bunun bir sayı olup olmadığı hakkında bir şey söylemez, bu yüzden JSON `"8080"` der. Bunu sizin yerinize kararlaştırmak, sonra dosyada yazıyormuş gibi yol alacak bir bilgi uydurmak olurdu.
- **Google'ın yüklediği ve kendisine verilmeyen şeyler.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi ise Buy Me a Coffee'den gelir. Hiçbirine metninizden bir karakter verilmez. Onu okuyan, ayrıştıran ve yazan her satır bu kaynaktan sunulur ve depoda listelenmiştir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde zaten hiç ağ adımı olmadı. Bundan daha basit bir kanıt yoktur.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, hangi etiketin hiç kapatılmadığını söyleyen ayrıştırıcı için `src/shared/parse-xml.js`, ve her değerin XML'den tahmin edilmek yerine neden metin olarak çıktığı için `src/convert.js`.
