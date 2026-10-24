# JSON Biçimlendirici — düzenli yazdırın, sıkıştırın ya da dönüştürün

JSON, XML, HTML, CSS ve YAML; biçimlendirilmiş ya da dönüştürülmüş. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.

> JSON, XML, HTML, CSS ve YAML biçimlendirin ve küçültün; JSON'u YAML ya da XML'e çevirin ve geri alın. Ayrıştırıcılar tarayıcınızda çalışır, hiçbir şey yüklenmez — bir belirteç ya da bir yapılandırma dosyası makinenizden hiç çıkmaz.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/json-bicimlendirme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## metniniz ve kodunuz **asla yüklenmez**. Sunucu yoktur.

Biçimlendirmek ve dönüştürmek, burada, bu sayfada yapılan, bir dizge üzerinde bir aritmetiktir. Ayrıştırıcılar elle yazılmıştır ve `src/` içindedir — `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js` — ve başka bir şey yoktur. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve bu, sitenin neredeyse başka hiçbir yerinde olmadığı kadar burada önemlidir: insanların bir biçimlendiriciye yapıştırdığı şeyler erişim belirteçleri, oturum çerezleri, müşteri kayıtları ve yayımlanmamış kodlardır.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## JSON yüklemeden nasıl biçimlendirilir ya da dönüştürülür

1. **İşi seçin.** İki sekme, tek kutu: *Biçimlendir* JSON, XML, HTML, CSS ve YAML'ı düzenli yazdırır ya da dümdüz sıkıştırır; *Dönüştür* JSON'u YAML ya da XML'e çevirir ve geri alır. Az önce biçimlendirdiğiniz metin, iki kez yapıştırmadan dönüştürdüğünüz metindir.
2. **Yapıştırın ya da dosyayı bırakın.** Seçip kopyalayabildiğiniz her şey olur. Seçiciye bırakılan bir dosya kendi tarayıcınız tarafından okunur ve kutuya konur — dışarıda bırakılacak bir yükleme adımı yok.
3. **Dili o bulsun ya da siz söyleyin.** Menü, metni ne olarak okuduğunu söyler ve düzeltmek tek tıklamadır. Bir tahmin yalnızca bir başlangıç noktasıdır; sessizce uygulanmak yerine gösterilmesinin sebebi de budur.
4. **Girintiyi seçin ya da düz sıkıştırın.** İki boşluk, dört ya da bir sekme. Düz sıkıştırmak, yalnızca okumak için orada olan her boşluğu çıkarılmış aynı belgedir ve sonuç bunun kaç bayt kazandırdığını söyler.
5. **Hatayı, hatanın olduğu yerde okuyun.** Burada çuvallayan bir ayrıştırıcı, "4193. konumda beklenmedik belirteç" demek yerine ne bulduğunu ve hangi satır ile sütunda bulduğunu söyler. Bu genellikle başka hiçbir şey açmadan bir yapılandırma dosyasını düzeltmeye yeter.
6. **Sonucu alın.** Kopyalayın ya da çıktığı dilin adıyla bir dosya olarak indirin.

## Uzun sürüm

[JSON kimseye vermeden nasıl biçimlendirilir](https://abox.tools/tr/rehberler/json-yuklemeden-bicimlendirme/): JSON'u kendi tarayıcınızda nasıl düzenli yazar, denetler ve küçültürsünüz: bir biçimlendiricinin dosyanızda asla değiştirmemesi gereken şeyler, hata iletisinin nasıl okunacağı ve yapıştırdığınız sitenin neden önemli olduğu.

## Kutuda ayrıca

- [YAML'den JSON'a Dönüştürücü](https://abox.tools/tr/yaml-json-donusturme/): İki yön de var, ve her birinin neye mal olduğunu söylüyor. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.
- [XML Biçimlendirici](https://abox.tools/tr/xml-bicimlendirme/): Okunmak için açılmış ya da gönderilmek için sıkıştırılmış XML, ve iki yönde de JSON'a çevrilmiş hâli. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.
- [Metin Karşılaştırma](https://abox.tools/tr/metin-karsilastirma/): İki metin girer; her fark satır satır ve sözcük sözcük işaretlenmiş çıkar. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [Base64 Kodlayıcı ve Çözücü](https://abox.tools/tr/base64-kodlama/): Base64, yüzde kodlaması, HTML varlıkları, onaltılık ve ters bölü kaçışları; iki yönde de. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.

## Sorular

### Metnim herhangi bir yere yükleniyor mu?

Hayır. Bu sayfadaki her ayrıştırıcı ve her yazıcı, kendi donanımınızda, kendi tarayıcınızda çalışan bir işlevdir. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Bunu bir erişim belirteci, bir oturum çerezi ya da bir müşteri kaydı için kullanmanın sebebi budur: bunlardan birini bir başkasının biçimlendiricisine yapıştırmak, onu ona vermektir.

### JSON biçimlendirmek düzenden başka bir şeyi değiştirir mi?

Hayır ve bu kulağa geldiğinden zordur. Anahtarlar yazdığınız sırayı korur — `JSON.parse` üzerine kurulmuş bir biçimlendirici, tamsayı benzeri anahtarları sessizce öne alır; yani `{"10":a,"2":b}`, `{"2":b,"10":a}` olarak geri gelir. Sayılar yazdığınız haneleri korur; yani yirmi haneli bir kimlik son üç hanesini bir çift duyarlıklı sayıya kaptırmaz ve `1e999`, `null` olmaz. Yinelenen anahtarların ikisi de tutulur; çünkü standart hangisinin kazandığını söylemez ve birini düşürmek, sizin yerinize seçmek olurdu.

### Hangi dilleri biçimlendirebiliyor?

JSON, XML, HTML, CSS ve YAML. JSON, XML, HTML ve CSS ayrıca düz de sıkıştırılabilir; YAML sıkıştırılamaz, çünkü onun kısa biçimi akış biçimidir, o da okunmazdır ve okunmazlık, bir dosyayı YAML'da tutmanın sebebinin tam tersidir. JavaScript bilinçli olarak listede değil — aşağıdaki ilgili soruya bakın.

### Neden JavaScript, Python ya da SQL biçimlendirmiyor?

Çünkü bir programlama dilini düzenli yazmak, onu düzgünce ayrıştırmak demektir ve neredeyse doğru yapan bir biçimlendirici, hiç olmamasından kötüdür: iyi görünen ama başka bir şey yapan kod üretir. JSON, XML, CSS ve YAML'ın dil bilgisi, elle okunacak ve çalıştırabileceğiniz testlerle denetlenecek kadar küçüktür. Bir JavaScript biçimlendiricisi Prettier'dır; o da bir megabaytlık ayrıştırıcıdır ve bir web sayfasında değil, sizin düzenleyicinizde durması gerekir.

### YAML'ımda no yazıyor, JSON'da dizge olarak çıktı. Neden?

Çünkü o bir dizgedir ve bu araç YAML'ı 1.1 olarak değil 1.2 olarak okur. YAML 1.1'de `yes`, `no`, `on` ve `off` mantıksal değerlerdi; Norveç'in ülke kodunu `false`'a çeviren o meşhur hata da budur. YAML 1.2 bundan vazgeçti, bu araç da öyle: metinden başka bir şey olarak okunanlar yalnızca `true`, `false`, `null` ve `~`'dir. Ters yönde ise bu kelimeler *tırnak içinde* yazılır; bu araç onları tırnaksız da metin olarak okuyacak olsa bile — çünkü dosyayı sonra açan şey okumayabilir. PyYAML hâlâ varsayılan olarak 1.1 kullanıyor. Katı okuyup ihtiyatlı yazmak, iki durumda da doğru olan tek birleşimdir.

### YAML'ı JSON'a çevirmek neyi kaybettirir?

Yorumları; çünkü JSON'un bir yorumu koyacak yeri yok. Bağlantı noktaları, takma adlar ve etiketler tahmin edilmek yerine düpedüz reddedilir — her biri JSON'un söyleyemeyeceği bir şey söyler ve sessizce bir yorum seçen bir dönüştürücü, size dosyanın söylediği şey olmayan bir belge verirdi. Ters yön hiçbir şey kaybettirmez: her JSON belgesi zaten bir YAML belgesidir.

### JSON'u XML'e çevirmek neyi kaybettirir?

Boş bir nesne, boş bir dizi ve boş bir dizge arasındaki farkı — hepsi boş bir öğeye dönüşür — ve her değerin türünü; çünkü XML'in türleri yoktur. Ters dönüşümün `8080`'in bir sayı olduğuna karar vermek yerine her şeyi dizge bırakmasının sebebi de budur. Bir dizi, yinelenen bir öğeye dönüşür — geri okunan tek şekil odur — ve bir öğe adının taşıyamayacağı bir anahtarın sorunlu karakterleri, hiçbir ayrıştırıcının okumayacağı bir belge olarak çıkmak yerine değiştirilir.

### HTML'i yeniden girintilemek sayfanın görünüşünü değiştirir mi?

Değiştirebilir ve bu araç bu konuda dürüsttür. İki satır içi öğe arasındaki boşluk, iki kelime arasındaki bir boşluktur; yani onu oynatmak bedelsiz değildir. İki şey bunu dizginler: `<pre>` ve `<textarea>` tam olduğu gibi kopyalanır ve metinden başka bir şey içermeyen bir öğe tek satırda kalır. Geri kalan her şey düzenli yazılır.

### Ne kadar büyük bir dosyayı kaldırabiliyor?

Burada konmuş bir sınır yok; çünkü bunun bedelini ödeyen bir sunucu yok. Pratikteki tavan kendi makinenizdir: birkaç megabaytlık JSON gayet iyidir; çok uzun bir belgede ise sayfa, klavye için sizinle kavga etmek yerine yazmanıza bir ara vermenizi bekler ve öyle yeniden biçimlendirir.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok ve ne kadar yapıştırdığınıza dair bir sınır yok. Sitede reklam var, masrafı karşılayan da o; reklamlara metniniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: metninizi biçimlendirilmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Yapıştırdığınız şeyin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Yapıştırılan bir belirtecin toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Her ayrıştırıcı ve her yazıcı, bu sayfada bir dizge alıp bir dizge döndüren işlevlerdir.
- **Biçimlendiriciler kendilerine verileni koruyor.** Bir JSON nesnesi, anahtarları yazdığınız sırada ve sayıları yazdığınız gibi geri gelir; çünkü `src/shared/parse-json.js`, tamsayı benzeri anahtarları yeniden sıralayan ve yirmi haneli bir kimliği en yakın çift duyarlıklı sayıya çeviren `JSON.parse` çağrısı değil, bir ayrıştırıcıdır. `tests/js/text-format.test.js` içindeki testler tam olarak bunu denetler.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine metninizden tek bir karakter verilmiyor. Onu okuyan, ayrıştıran ya da yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, anahtarlarınızı yazdığınız sırada tutan ayrıştırıcı için `src/shared/parse-json.js`; bir dönüştürmenin neden iki biçimi aynı anda bilen hiçbir şey olmadan bir ayrıştırıcı ile bir yazıcıdan ibaret olduğu için de `src/convert.js`.
