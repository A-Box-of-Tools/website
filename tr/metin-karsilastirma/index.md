# Metin Karşılaştırma — iki metni yan yana karşılaştırın

İki metin girer; her fark satır satır ve sözcük sözcük işaretlenmiş çıkar. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.

> İki metni karşılaştırın ve her farkı satır satır, sözcük sözcük, yan yana ya da tek sütunda görün. Karşılaştırma tarayıcınızda çalışır, hiçbir şey yüklenmez — yayımlanmamış kod makinenizden hiç çıkmaz.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/metin-karsilastirma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## metinleriniz **asla yüklenmez**. Sunucu yoktur.

Bir karşılaştırma, burada, bu sayfada yapılan, iki dizge üzerinde bir aritmetiktir. Algoritma Myers'ınkidir — `git diff`'in kullandığının aynısı — ve `src/diff.js` içinde elle yazılmıştır; gidip okuyabilirsiniz. Bu aracın hiçbir türde ağ özelliği yoktur — getirecek bir şey yok, gönderecek bir şey yok — ve burada bu önemlidir: insanların karşılaştırdığı şeyler sözleşmeler, yapılandırma dosyaları ve yayımlanmamış kodlardır; hem de hep çift halinde.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## İki metin yüklemeden nasıl karşılaştırılır

1. **İki metni yapıştırın ya da iki dosyayı bırakın.** Asıl solda, değişmiş olan sağda. Seçiciye aynı anda bırakılan iki dosya, bıraktığınız sırayla biri bir yana biri öbür yana düşer; ters olduysa yanları değiştirin.
2. **Nasıl okuyacağınızı seçin.** Yan yana ya da tek sütun. Telefon tek sütunla başlar; çünkü yan yana iki metin sütunu ister ve telefonda aşağı yukarı bir tanesine yer vardır. Menü zaten hemen orada.
3. **Önemsiz olanı görmezden gelin.** Boşluk, büyük-küçük harf, boş satırlar — her biri ayrı ayrı görmezden gelinebilir; böylece yeniden biçimlendirilmiş bir dosya yüz değişiklik gibi okunmaz. Varsayılan olarak değişmeyen orta kısım bir sayıya katlanır; her değişikliğin iki yanında üçer satır tutulur.
4. **Neyin değiştiğini okuyun.** Silinen satırlar solda, eklenenler sağda işaretlidir; değişen bir satırın içinde de farklı olan sözcükler vurgulanır — iki paragrafın karşılaştırması böylece iki koca paragrafı değil, yer değiştiren sözcüğü gösterir.
5. **Yamayı alın.** İndirilen dosya, birleşik biçimde bir `.patch`'tir; bir kod incelemesinin, `git apply`'ın ve her fark görüntüleyicisinin beklediği de budur. Kopyala aynısını panonuza koyar.

## Uzun sürüm

[İki JSON dosyası nasıl karşılaştırılır](https://abox.tools/tr/rehberler/iki-json-dosyasini-karsilastirma/): İki dosyayı aynı biçimde biçimlendirin, anahtarları sıralayın, sonra karşılaştırın. Ham bir JSON karşılaştırması neden neredeyse tamamen gürültüdür, iki taraf tarayıcıda nasıl kurallı biçime sokulur ve yamaya ne kalır.

## Kutuda ayrıca

- [Base64 Kodlayıcı ve Çözücü](https://abox.tools/tr/base64-kodlama/): Base64, yüzde kodlaması, HTML varlıkları, onaltılık ve ters bölü kaçışları; iki yönde de. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [Metin ve dosya paylaşımı](https://abox.tools/tr/metin-paylasma/): Paylaşım bu açık sekmede yaşar. Okuyucular onu şifreli olarak doğrudan tarayıcınızdan alır ve sekmeyi kapattığınızda biter - hiçbir sunucu hiçbir şey saklamaz.
- [QR ve Barkod Üreteci](https://abox.tools/tr/qr-kod-olusturma/): Yazın, koda dönüşsün. Bir tane üretmek için hiçbir şey gönderilmez.
- [QR ve Barkod Okuyucu](https://abox.tools/tr/qr-kod-okuma/): Bir koda doğrultun ya da onun bir resmini bırakın. Burada okunur, başka hiçbir yerde.

## Sorular

### Metinlerim herhangi bir yere yükleniyor mu?

Hayır. Karşılaştırma, kendi donanımınızda, kendi tarayıcınızda çalışan bir işlevdir. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Bunu bir sözleşme, bir yapılandırma dosyası ya da yayımlanmamış kod için kullanmanın sebebi budur: bunları bir başkasının karşılaştırıcısına yapıştırmak, iki sürümü birden aynı anda vermektir.

### Karşılaştırma tam olarak ne yapıyor?

Soldaki metni sağdakine çeviren en kısa düzenleme kümesini, Myers algoritmasıyla bulur — `git diff`'in kullandığı algoritma. Bir karşılaştırmayı okunur kılan şey en kısa olmasıdır: ortaya eklenmiş bir satır, ondan sonraki her satır değişmiş gibi değil tek bir ekleme olarak görünmelidir. Değişmiş bir satırın içinde farklı olan kelimeler de işaretlenir; yani iki paragrafın karşılaştırması, iki koca paragrafı değil yer değiştiren kelimeyi gösterir.

### İki yapıştırma yerine iki dosyayı karşılaştırabilir mi?

Evet. İkisini birden aynı anda seçiciye bırakın; bıraktığınız sırayla biri bir yana biri öbür yana düşer. Tarayıcınız tarafından bu sayfaya okunurlar; gittikleri tek yer de burasıdır. Ters bıraktıysanız yanları değiştirin.

### Bir karşılaştırmadan ne çıkıyor ve onu uygulayabilir miyim?

İnen dosya birleşik bir karşılaştırmadır — `git apply`, `patch` ve her kod inceleme aracının okuduğu `@@ -3,5 +3,5 @@` biçimi. Kopyala da panonuza aynı şeyi yapar. Ekranda gördüğünüz onun bir görünümüdür: yan yana ya da tek sütunda, hepsini istemediğiniz sürece değişmemiş kısımlar bir sayıya katlanmış hâlde.

### Boşluğu, büyük-küçük harfi ya da boş satırları görmezden gelebilir mi?

Evet, her birini ayrı ayrı. Boşluğu görmezden gelmek, yeniden biçimlendirilmiş bir dosyanın değişmemiş olarak karşılaştırılmasını sağlar; büyük-küçük harfi görmezden gelmek `Error` ile `error`'u aynı sözcük sayar; boş satırları görmezden gelmek hiçbir şey taşımayan satırları atlar. Sonucun üstündeki sayaçlar o zaman, görmezden gelinmesini istediğiniz farklar görmezden gelindiğinde ikisinin aynı olduğunu söyler — bu, birebir aynı demekle aynı iddia değildir ve sayfa iki iddiayı birbirinden ayrı tutar.

### Ne kadar büyük bir karşılaştırmayı kaldırabiliyor?

Burada konmuş bir sınır yok; çünkü bunun bedelini ödeyen bir sunucu yok. Bir avuç değişikliği olan yirmi bin satırlık iki metin anında karşılaştırılır; çünkü ortak baş ve son, asıl iş başlamadan önce kırpılır. Ortak hiçbir yanı olmayan iki metnin karşılaştırması, zaten apaçık olanı kanıtlamak için bir dakika harcamak yerine erken durur ve bunu söyler; çok uzun bir karşılaştırma ise ilk birkaç bin satırı çizer ve gerisini indirilen yamaya bırakır.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok ve ne kadar yapıştırdığınıza dair bir sınır yok. Sitede reklam var, masrafı karşılayan da o; reklamlara metniniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: metinlerinizi karşılaştırılmak üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Yapıştırdığınız şeyin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Yapıştırılan bir belirtecin toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Karşılaştırma, bu sayfada iki dizge alıp neyin değiştiğini döndüren bir işlevdir.
- **Algoritma bilinen algoritma; baştan sona okunabilir.** Myers'ın en kısa düzenleme betiği algoritması, `git diff`'in kullandığının aynısı; `src/diff.js` içinde elle yazılmış, kararları yorumlarla açıklanmış. `tests/js/text-diff.test.js` içindeki testler, silmelerin soldaki metni, eklemelerin de sağdakini yeniden kurduğunu kanıtlar; bir karşılaştırma için doğru olmak tam da budur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine metninizden tek bir karakter verilmiyor. Onu okuyan, ayrıştıran ya da yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml` ve Myers algoritması, her değişen satırın içindeki sözcük sözcük geçiş ve patolojik bir karşılaştırmanın sayfayı dondurmasını önleyen üç koruma için `src/diff.js`.
