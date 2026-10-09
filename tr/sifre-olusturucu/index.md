# Şifre ve parola cümlesi — tarayıcınızda üretilmiş güçlü ve rastgele bir tane

Burada, kendi tarayıcınız tarafından üretilir ve hiçbir yere gönderilmez. Hiçbir şey saklanmaz ve geçmiş yoktur.

> Güçlü ve rastgele bir şifre ya da beraberinde gelen 7.776 kelimelik listeden bir diceware parola cümlesi üretin. Tarayıcınızın kendi kriptografik üreteciyle çekilir, hiçbir yere gönderilmez, hiçbir zaman saklanmaz. Ücretsiz, kayıt gerekmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/sifre-olusturucu/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## şifreleriniz ve parola cümleleriniz **asla yüklenmez**. Sunucu yoktur.

Her karakter, tarayıcının kendi kriptografik üreteci olan `crypto.getRandomValues`'dan gelir; her kelime de bu klasörde `src/wordlist.js` olarak bulunan bir listeden. `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok; yani burada üretilen bir şifrenin bize ya da başka birine ulaşabileceği bir kod yolu yok — ve hiçbir şey depolamaya da yazılmıyor, dolayısıyla bu sayfayı yeniden yüklemek size gösterdiği her şifreyi yok eder.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Hiçbir şey saklanmaz
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Bir web sitesi görmeden nasıl güçlü bir şifre üretilir

1. **Şifre mi parola cümlesi mi seçin.** Şifre, rastgele karakterlerden oluşan bir dizidir: saklaması kısa, yazması zahmetli ve şifre yöneticinizin sizin yerinize doldurduğu yüzlerce hesap için tam da doğru olan. Parola cümlesi ise bir listeden rastgele çekilmiş kelimelerdir: daha uzun ama hatırlanabilir ve söylenebilir; ezberden yazmanız gereken birkaç sır için gereken de budur — şifre yöneticinizin kendi şifresi, dizüstünüzünki, telefonunuzun kurtarma kodu.
2. **Uzunluğu ya da kelime sayısını ayarlayın.** Önemli olan ayar budur, diğerleri çoğunlukla değildir. Korumaya değer her şey için yirmi karakter ya da altı kelime makul bir alt sınırdır; diğerlerinin hepsini sıfırlamaya yarayacak hesap için oradan yukarı çıkın. Alttaki gösterge siz sürüklerken hareket eder, böylece her fazladan karakterin ne kazandırdığını görebilirsiniz.
3. **Formun dayatacağı kuralları açın.** «Her türden en az bir tane», sonda bir rakam, her sitenin kabul ettiği kısa listeden bir simge. Bunların hiçbiri hiçbir şeyi güçlendirmez — ilki onu çok hafif zayıflatır ve sayfa bunu zaten düşmüştür — ama arka arkaya altı tane üretmeden bir kayıt formunu geçmenin yolu bunlardır.
4. **Rengi değil sayıyı okuyun.** Bitler, dizeyi üreten ayarlardan sayılır: alfabenin büyüklüğü, çekiliş sayısı ve başka hiçbir şey. Bu, gerçek bir ölçümdür; kayıt sayfasındaki göstergenin aksine, ki o yalnızca önündeki karakterleri puanlayabilir ve onları sizin mi yoksa bir üretecin mi seçtiğini bilmesinin bir yolu yoktur.
5. **Ayrılmadan önce kopyalayın ve bir yere koyun.** Burada geçmiş yok ve geri istemenin bir yolu yok; sayfayı yeniden yüklemek onu yok eder. Önce şifre yöneticisine, sonra kayıt formuna yapıştırın; böylece onu hatırlamak zorunda olan taraf, bir şeyler ters gitmeden önce ona sahip olur.
6. **Gerekiyorsa bir yığın alın.** Alttaki kaydırıcı bir seferde yüz taneye kadar üretir ve onları düz bir metin dosyası olarak kaydeder; bu dosyayı, zaten ekranınızda olandan bu sayfa yazar. Hesap kurmak ya da başlangıç kimlik bilgileri dağıtmak için kullanışlıdır ve daha iyi bir yere kavuştukları anda silmeye değer: diskinizdeki şifre dolu bir dosya hâlâ şifre dolu bir dosyadır.

## Kutuda ayrıca

- [JSON Biçimlendirici](https://abox.tools/tr/json-bicimlendirme/): JSON, XML, HTML, CSS ve YAML; biçimlendirilmiş ya da dönüştürülmüş. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.
- [YAML'den JSON'a Dönüştürücü](https://abox.tools/tr/yaml-json-donusturme/): İki yön de var, ve her birinin neye mal olduğunu söylüyor. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.
- [XML Biçimlendirici](https://abox.tools/tr/xml-bicimlendirme/): Okunmak için açılmış ya da gönderilmek için sıkıştırılmış XML, ve iki yönde de JSON'a çevrilmiş hâli. Bunların hiçbiri başkasının sunucusuna yapıştırılmaz.
- [Metin Karşılaştırma](https://abox.tools/tr/metin-karsilastirma/): İki metin girer; her fark satır satır ve sözcük sözcük işaretlenmiş çıkar. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.

## Sorular

### Şifreler bir yere gönderiliyor ya da saklanıyor mu?

İkisi de değil. Kendi donanımınızda, tarayıcınızda üretilirler ve bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez. Depolamaya da hiçbir şey yazılmaz: localStorage yok, çerez yok, geçmiş yok. Sayfayı yeniden yükleyin; size gösterdiği her şifre gitmiştir, hem ekrandan hem de kendi belleğinden. Sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi sayar ve hiçbiri bize ait değildir; yani bir şey denese bile bir şifrenin toplanabileceği bir yer yok.

### Rastgelelik nereden geliyor?

`crypto.getRandomValues`'dan; tarayıcıların kriptografik kullanım için sağladığı, işletim sisteminizin kendi entropi havuzuyla tohumlanan ve yeniden tohumlanan üreteçten. Bir tarayıcının TLS anahtar malzemesi için kullandığı kaynağın aynısıdır. Bu araçta hiçbir yerde `Math.random` kullanılmaz ve bu ayrım bir kılı kırk yarma değildir: `Math.random`, iç durumunun tamamı birkaç ardışık çıktıdan yeniden kurulabilen hızlı bir aritmetik üreteçtir; yani onun üzerine kurulmuş bir şifre üreteci, rastgele görünen ve onlardan birini görmüş olan herkes tarafından sayılıp dökülebilen şifreler üretir.

### Tarayıcıda üretilmiş bir şifre, masaüstü bir programdan çıkan kadar iyi mi?

Rastgelelik açısından evet — her iki durumda da aynı işletim sistemi kaynağıdır, yalnızca başka bir kapıdan erişilir. Farklı olan, odada başka ne olduğudur. Bir tarayıcı sekmesi eklentilerinizin yanında çalışır ve sayfaları okuma izni olan bir eklenti bunu da okuyabilir. Bu, bu sayfa dahil her web tabanlı üreteç için doğrudur ve elinizde varsa şifre yöneticinizin yerleşik üretecini kullanmanın dürüst sebebi de budur: aynı hesap, yanında daha az şey duran bir süreçte. Bu sayfa, elinizde öyle bir şey olmadığı zamanlar içindir.

### Şifre mi parola cümlesi mi — hangisini kullanmalıyım?

Bir şifre yöneticisinin sizin için yazdığı her şey için şifre; çünkü ona hiç bakmayacaksınız ve uzunluk bedavadır. Ezberden yazmanız ya da sesli okumanız gereken birkaç şey için parola cümlesi: şifre yöneticisinin ana şifresi, bir disk şifreleme anahtarı, uzaktan kurduğunuz bir cihaz. Uzun listeden altı kelime 77 bittir; on iki karakterlik rastgele bir şifreden güçlüdür ve sabahın dördünde doğru girmesi kıyaslanmayacak kadar kolaydır.

### Bir şifre ne kadar uzun olmalı?

Tam alfabe üzerinden yirmi karakter yaklaşık 130 bittir ve uzunluğun endişelenilecek şey olmaktan çıktığı noktanın ötesindedir. On altı gayet iyidir. On iki, kaybetmeyi umursayacağınız her şey için alt sınırdır ve hedef değil alt sınırdır. Bunun altında, sitenin onu düzgün sakladığına bahse girmiş olursunuz ki son yirmi yılın ihlal bildirimleri bu bahse girmemeniz gerektiğini söylüyor. Uzunluk, sayfadaki her ayarı yener; bir karakter eklemek, hangi karakterlerin bulunması gerektiğine dair her kuraldan daha değerlidir.

### Bir parola cümlesi kaç kelime olmalı?

Uzun listeden altı; başka şifreleri koruyorsa yedi. Meşhur dört kelimelik çizim 2011'de yapıldı, 51 bittir ve bugün ciddi bir çevrimdışı saldırının erişim menzilindedir. Beş 64'tür. Altı 77'dir ve bir saldırganın sıradan bir hesap için harcayacağı her şeyin ötesindedir. Uzun listeden her fazladan kelime 12,9 bit ekler ve bir şey ekleyen tek parça kelimelerdir — tireler ve büyük harfler eklemez.

### «Bit» nedir ve bu sayfa neden onları sayıyor?

Bir bit, bir katına çıkmadır. Altmış bit demek, bu sayfanın üretebileceği eşit olasılıklı 2^60 sonuç vardı demektir; yani nasıl çalıştığını tam olarak bilen bir saldırganın hâlâ deneyecek o kadar şeyi vardır. Bu, dizenin değil *sürecin* bir özelliğidir: sayfa bunu kesin olarak söyleyebilir, çünkü seçimi yapan şey odur ve kaç seçim yaptığını bilir. Bunu, karakterleri okuyup tahmin yürüten kayıt formundaki renkli çubuktan ayıran şey budur. O çubukta `correct horse battery staple` kötü puan alır ve 44 bit değerindedir; `P@ssw0rd!` iyi puan alır ve neredeyse hiçbir değeri yoktur.

### «Bir simge içermeli» kuralı bir şifreyi neden zayıflatıyor?

Çünkü bir kural yalnızca olasılıkları eleyebilir. Her kümeden en az bir karakter istemek, tesadüfen öyle bir karakteri olmayan her şifreyi eler ve olası şifrelerin daha küçük bir kümesi, aranacak daha küçük bir sayı demektir. Etki küçüktür — tipik bir uzunlukta yarım bit kadar — ve gerçektir; bu sayfa da gurur okşayan rakamı vermek yerine onu düşer. Kuralın elediklerini değil gerçekten izin verdiği şifreleri sayarak, tam olarak hesaplanır.

### Bu hangi kelime listesi ve saldırganın onu indirebilmesi önemli mi?

Electronic Frontier Foundation'ın diceware listeleri, değiştirilmeden beraberinde geliyor: uzunda 7.776, kısada 1.296 kelime. Tam da bunun için kuruldular — rahatsız edici hiçbir şey yok, eş sesli yok, yan yana gelince üçüncü bir kelimeye dönüşen çift yok ve kısa listede bir başkasının başlangıcı olan kelime yok. Ve hayır, listenin herkese açık olması önemli değil: burada söylenen güç, bir saldırganın listeye sahip olduğunu, bu sayfanın kaynağına baktığını ve kullandığınız her ayarı bildiğini varsayar. Bilmediği tek şey, her seferinde 7.776'dan hangisinin çıktığıdır. Sayıyı güvenilir kılan da bu varsayımdır.

### Parola cümlesi, olmayı bekleyen bir sözlük saldırısı değil mi?

Kelimeler bu şekilde seçildiğinde değil. Bir sözlük saldırısı *insanların* seçtiği cümlelere karşı işe yarar, çünkü insanlar birbirine yakışan kelimeleri, anlamlı bir sırada ve her gün kullandıkları birkaç binin içinden seçer. Bu sayfa her kelimeyi bağımsız olarak, düzgün dağılımla, sabit bir listeden ve sonucun kulağa hoş gelip gelmediğine hiç bakmadan seçer — genellikle gelmemesinin sebebi de budur. Listeyi ve uzunluğu bilen bir saldırganın karşısında yine de 7.776'nın kelime sayısı kuvveti vardır.

### Sayfadan ayrıldıktan sonra bir şifreyi geri alabilir miyim?

Hayır ve bu bilinçli bir tercih. Hiçbir yere hiçbir şey yazılmaz, yani kurtarılacak bir şey yoktur: geçmiş paneli yok, «son üretilenler» listesi yok, önbellek yok. Size geçen salı üretilen şifreyi gösterebilen bir üreteç, onu saklamış bir üreteç olurdu ve sizin erişebileceğiniz yerde saklanmış olmak, başka bir şeyin de erişebileceği yerde saklanmış olmak demektir. Sayfadan ayrılmadan önce onu bir şifre yöneticisine kopyalayın.

### Panoya kopyalamak güvenli mi?

Olağan risktir ve endişelenmekten çok bilmeye değer. Pano, sizin adınıza çalışan diğer her şeyle paylaşılır, genellikle bir sonraki kopyalamaya kadar orada kalır ve bazı kurulumlarda cihazlar arasında eşitlenir. Bu, onu ait olduğu yere hemen yapıştırmak ve sonrasında başka bir şey kopyalamak için iyi bir sebeptir; elle daha zayıf bir şifre yazmak için bir sebep değildir. Bu sayfa panonuzu okuyamaz; yalnızca ona yazabilir ve yalnızca siz düğmeye bastığınızda.

### Aynısını birden fazla yerde kullanmalı mıyım?

Hayır ve bu, bu sayfadaki diğer her şeyin üstünde duran tek tavsiyedir. Ele geçirilen neredeyse her hesap, önce başka bir yerde doğru olan bir şifreyle ele geçirilir: bir site ihlal edilir, liste yayımlanır ve aynı adres ile şifre her yerde denenir. Site başına benzersiz bir şifre, bir ihlali hepsi yerine tek bir hesaba indirger ve bir şifre yöneticisi tutmanın sebebi de budur — içindeki herhangi bir şifrenin gücü değil.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok ve kaç tane ürettiğinizde bir sınır yok. Sitede reklam var, masrafı karşılayan da o; reklamlara bu sayfanın ürettiği şey hakkında, ne kadar uzun ya da ne kadar güçlü olduğu dahil, hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, şifre üretmeye devam eder. Rastgelelik kendi makinenizden gelir ve kelime listesi zaten sayfadadır. Bu aynı zamanda hiçbir şeyin getirilmediğini ya da gönderilmediğini kanıtlamanın en basit yolu: sayılarını bir sunucudan isteyen bir üreteç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Şifre, bunu okuduğunuz yerde üretiliyor.** Bu sayfada, bu sayfa tarafından, kendi işletim sisteminizin tarayıcıya verdiği rastgelelikten çekilir. Onu üretmek için hiçbir şey istenmez ve var olduktan sonra hiçbir şey bildirilmez. `Content-Security-Policy`, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir: üretilmiş bir şifrenin toplanabileceği bir uç nokta burada yok, olsaydı bile onu gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Kelime listesi indirilmiyor; `src/wordlist.js`, sayfanın geri kalanıyla birlikte bu kaynaktan sunuluyor ve onu okuyabilirsiniz.
- **Rastgelelik tarayıcınınki ve doğru türden.** `crypto.getRandomValues`, tarayıcıların anahtarlar ve belirteçler için sağladığı üreteçtir; işletim sistemi tarafından tohumlanır ve yeniden tohumlanır. Bu klasörde hiçbir yerde `Math.random` geçmez ve geçseydi gerçek bir kusur olurdu: onun iç durumu bir avuç çıktıdan geri çıkarılabilir, bu da üreteceği her şifreyi, onlardan birini görmüş olan herkes için hesaplanabilir kılar.
- **Hiçbir şey saklanmıyor, yani temizlenecek bir geçmiş yok.** localStorage yok, sessionStorage yok, çerez yok, adres parametresi yok ve tarayıcının hatırlamayı önereceği bir `<input>` yok. Ekranda olan şey bu sayfanın belleğindeki tek bir dizide var olur ve sekmeyi kapatmak temizliğin tamamıdır. Burada üretilen herhangi bir şeyin tek kopyaları, sizin yanınızda götürdükleridir.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine bu sayfanın ürettiği şeyden tek bir karakter, uzunluğu, gücü ya da hangi ayarların onu ürettiği verilmiyor. Bir karakter ya da bir kelime çeken her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu: rastgeleliğini bir sunucudan isteyen bir üreteç, siz fişi çeker çekmez dururdu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, bu sayfa ile ürettiği her şifre arasında duran kırk satır için `src/random.js` — tek bir girdisi vardır ve o girdi tarayıcının kendi üretecidir — ayarların nasıl bir dizeye dönüştüğü için `src/generate.js` ve tahmin etmek yerine sayan rakamın arkasındaki hesap için `src/strength.js`.
