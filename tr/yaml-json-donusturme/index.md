# YAML'den JSON'a — ve JSON'dan yeniden YAML'e

İki yön de var, ve her birinin neye mal olduğunu söylüyor. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.

> YAML'i JSON'a, JSON'u YAML'e tarayıcınızda dönüştürün. YAML 1.2 okur, böylece yes ve no metin olarak kalır, ve her yönün tam olarak neyi kaybettirdiğini söyler. Hiçbir şey yüklenmez: bir yapılandırma dosyası cihazınızdan hiç çıkmaz.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/yaml-json-donusturme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## YAML ve JSON dosyalarınız **asla yüklenmez**. Sunucu yoktur.

Dönüştürmek, bir metin dizisi üzerinde yapılan aritmetiktir; burada, bu sayfada yapılır. İki ayrıştırıcı da elle yazılmıştır ve `src/` içindedir — `shared/parse-yaml.js` ve `shared/parse-json.js` — başka da bir şey yoktur. Bu aracın herhangi bir ağ işlevi hiç yoktur — getirecek bir şey de, gönderecek bir şey de — ve bu, burada bu sitenin hemen her yerinden daha çok önemlidir: bir YAML dosyası çoğunlukla bir dağıtım yapılandırmasıdır, ve bir dağıtım yapılandırması çoğunlukla ana makine adları, kova adları ve sırlarla doludur.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## YAML yüklemeden JSON'a nasıl dönüştürülür

1. **Yönü seçin.** *YAML'den JSON'a* ya da *JSON'dan YAML'e*. Menünün altındaki not, o yönün neyi kaybettirdiğini siz bir şey yapıştırmadan önce söyler, sonra değil.
2. **Yapıştırın ya da dosyayı bırakın.** Seçip kopyalayabildiğiniz her şey olur. Seçiciye bırakılan bir dosyayı kendi tarayıcınız okur ve kutuya koyar — atlanacak bir yükleme adımı yoktur — ve bir `.json` ya da `.yaml` uzantısı yönü sizin için belirler.
3. **Girintiyi seçin.** İki boşluk, dört ya da bir sekme. Sekme yalnızca JSON için sunulur: YAML boşluklarla tanımlanır ve sekme onun içinde geçerli bir girinti değildir.
4. **Hatayı hatanın olduğu yerde okuyun.** Burada başarısız olan bir ayrıştırıcı, „4193. konumda beklenmeyen belirteç“ demek yerine ne bulduğunu ve hangi satır ile sütunda olduğunu söyler. Bu, genellikle bir yapılandırma dosyasını başka hiçbir şey açmadan onarmaya yeter.
5. **Sonucu alın.** Kopyalayın ya da çıktığı biçimin adını taşıyan bir dosya olarak indirin.

## Kutuda ayrıca

- [XML Biçimlendirici](https://abox.tools/tr/xml-bicimlendirme/): Okunmak için açılmış ya da gönderilmek için sıkıştırılmış XML, ve iki yönde de JSON'a çevrilmiş hâli. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.
- [Metin Karşılaştırma](https://abox.tools/tr/metin-karsilastirma/): İki metin girer; her fark satır satır ve sözcük sözcük işaretlenmiş çıkar. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [Base64 Kodlayıcı ve Çözücü](https://abox.tools/tr/base64-kodlama/): Base64, yüzde kodlaması, HTML varlıkları, onaltılık ve ters bölü kaçışları; iki yönde de. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [Metin ve dosya paylaşımı](https://abox.tools/tr/metin-paylasma/): Paylaşım bu açık sekmede yaşar. Okuyucular onu şifreli olarak doğrudan tarayıcınızdan alır ve sekmeyi kapattığınızda biter - hiçbir sunucu hiçbir şey saklamaz.

## Sorular

### YAML'im bir yere yükleniyor mu?

Hayır. Bu sayfadaki iki ayrıştırıcı da iki yazıcı da, kendi tarayıcınızda, kendi donanımınızda çalışan işlevlerdir. Bu aracın herhangi bir ağ işlevi hiç yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi sayar; hiçbiri bize ait değildir. Bunu bir dağıtım yapılandırması için kullanmanın sebebi de tam olarak budur: o dosyalar ana makine adları, kova adları ve arada birinin taşımak istediği bir sırla doludur, ve birini başkasının dönüştürücüsüne yapıştırmak onu ona vermektir.

### YAML'i JSON'a çevirirken ne kaybolur?

Yorumlar, çünkü JSON'un onları koyacak bir yeri yoktur. Çıpalar, takma adlar ve etiketler tahmin edilmek yerine doğrudan geri çevrilir — her biri JSON'un söyleyemeyeceği bir şey söyler, ve sessizce bir yorum seçen bir dönüştürücü size dosyanın söylediği şey olmayan bir belge verirdi. Öbür yön hiçbir şey kaybettirmez: her JSON belgesi zaten bir YAML belgesidir.

### YAML'imde no yazıyor ama JSON'da metin olarak çıktı. Neden?

Çünkü o gerçekten bir metin, ve burada 1.1 değil YAML 1.2 okunuyor. YAML 1.1'de `yes`, `no`, `on` ve `off` mantıksal değerlerdi; Norveç'in ülke kodunu `false`'a çeviren o ünlü hata budur. YAML 1.2 bunu bıraktı, burası da bıraktı: metinden başka bir şey olarak okunanlar yalnızca `true`, `false`, `null` ve `~`'dir. Öbür yönde bu sözcükler *tırnak içinde* geri yazılır — burada tırnaksız da metin olarak okunacak olsalar bile — çünkü dosyayı sonra açacak şey öyle okumayabilir. PyYAML hâlâ varsayılan olarak 1.1 kullanıyor. Katı okuyup temkinli yazmak, iki yönde de doğru olan tek birleşimdir.

### Anahtarlarımın sırasını koruyor mu?

Evet, iki yönde de, ve bu kulağa geldiğinden daha zordur. `JSON.parse` üzerine kurulmuş bir dönüştürücü, tam sayıya benzeyen anahtarları sessizce başa alır; böylece `{"10":a,"2":b}`, `{"2":b,"10":a}` olarak geri gelir. Sayılar yazdığınız basamakları korur, yani yirmi basamaklı bir hesap kimliği son üç basamağını bir double'a kaptırmaz. Sıralanmasını *istiyorsanız* bir kutucuk var, ve o, kod noktalarına göre değil, anahtarların okunuşuna göre sıralar.

### Birden çok YAML belgesini bir kerede dönüştürebilir mi?

Hayır, ve birini seçmek yerine bunu söyler. `---` ayırıcıları olan bir dosya birden çok belge taşır, ve JSON'un „birkaç belge“ anlamına gelen bir biçimi yoktur — bir dizi, dosyanın hiç öne sürmediği bir iddia olurdu. Onları birer birer dönüştürün.

### Burada neden bir YAML biçimlendirici yok?

Çünkü YAML'in yazmaya değer sıkıştırılmış bir biçimi yok — kısa olanı akış biçemidir, o da okunmaz, ve okunmazlık bir dosyayı YAML'de tutmanın sebebinin tam tersidir. JSON, XML, HTML ve CSS'i açmak [JSON biçimlendiricinin](https://abox.tools/tr/json-bicimlendirme/) işidir, ve o YAML'i de açar.

### Ne kadar büyük bir dosyayı işleyebilir?

Burada konulmuş bir sınır yoktur, çünkü bunun bedelini ödeyen bir sunucu yoktur. Gerçek tavan kendi cihazınızdır: birkaç megabaytlık YAML sorun çıkarmaz ve çok uzun bir belgede sayfa, klavyeyi sizinle paylaşmamak yerine dönüştürmeden önce yazmanızda bir duraklama bekler.

### Ücretsiz mi, hesap gerekiyor mu?

Ücretsizdir; hesap, oturum açma, deneme süresi ve ne kadar yapıştıracağınıza dair bir sınır yoktur. Sitede reklam vardır, masrafı karşılayan da odur; reklamlara metninizle ilgili hiçbir şey verilmez.

### Çevrimdışı çalışır mı?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin; çalışmayı sürdürür. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yoludur: yapılandırmanızı dönüştürülmek üzere gönderen bir araç, fişi çektiğiniz anda dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Yapıştırdığınızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bize ait değildir. Burada yapıştırılmış bir yapılandırmanın toplanabileceği hiçbir uç nokta yoktur; olsaydı bile kodda onu oraya gönderecek hiçbir şey yoktur.
- **Burada hiçbir şey bir şey getirmez.** `src/` içinde hiçbir yerde ne bir `fetch`, ne bir `XMLHttpRequest`, ne de bir `sendBeacon` vardır. İki ayrıştırıcı da iki yazıcı da, bu sayfada bir metin alıp bir metin döndüren işlevlerdir.
- **YAML 1.2 okur, yani Norveç yine Norveç kalır.** YAML 1.1'de `no` bir mantıksal değerdi; Norveç'in ülke kodunu `false`'a çeviren o ünlü hata budur. Burada 1.2 okunur ve o, göründüğü gibi bir metindir. Öbür yönde bu sözcükler *tırnak içinde* geri yazılır, çünkü dosyayı sonra açacak şey hâlâ bir 1.1 okuyucusu olabilir. `tests/js/text-convert.test.js` iki yarıyı da denetler.
- **Dürüst olamayacak bir dönüşüm, onun yerine durur.** YAML içindeki bir çıpa, bir takma ad ya da bir etiket, sessizce başka bir şey demek olan bir JSON belgesi üretmek yerine, hangi satırda olduğunu söyleyen bir iletiyle dönüşümü bitirir. JSON'un „aynı düğüm iki kez“ demenin bir yolu yoktur ve bir yorum seçmek, sizin yerinize seçmek olurdu.
- **Google'ın yüklediği ve kendisine verilmeyen şeyler.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi ise Buy Me a Coffee'den gelir. Hiçbirine metninizden bir karakter verilmez. Onu okuyan, ayrıştıran ve yazan her satır bu kaynaktan sunulur ve depoda listelenmiştir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde zaten hiç ağ adımı olmadı. Bundan daha basit bir kanıt yoktur.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, bir çıpanın ne demek istediğini tahmin etmek yerine onu geri çeviren okuyucu için `src/shared/parse-yaml.js`, ve bir dönüşümün neden iki biçimi birden bilen hiçbir şey araya girmeden bir ayrıştırıcı ile bir yazıcıdan ibaret olduğu için `src/convert.js`.
