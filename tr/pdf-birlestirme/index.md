# PDF Birleştirme — sayfaları bölün ve yeniden sıralayın

Sunucuya gidip gelmeden yerinden oynatılmış sayfalar.

> PDF'leri birleştirin, birini birkaç dosyaya bölün ve sayfaları istediğiniz sıraya sürükleyin — hepsi kendi tarayıcınızın içinde. Hiçbir şey yüklenmez, hesap gerekmez ve bitmiş dosya size sunulmadan önce yeniden açılıp sayılır.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/pdf-birlestirme/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## belgeleriniz **asla yüklenmez**. Sunucu yoktur.

Seçtiğiniz her belge bu makinenin belleğinde açılır, parçalarına ayrılır ve yeniden yazılır; bunu yapan kod da bu adresten sunuluyor. Buradaki hiçbir şey bir yükleme yapamaz ve bu sayfanın öbür ucunda bir yüklemeyi alacak bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak
- ✓ Dosyalar cihazınızda kalır

## Bir PDF nasıl birleştirilir, bölünür veya yeniden sıralanır

1. **PDF'lerinizi seçin.** Seçiciye bırakın ya da elle seçin ve sonradan daha fazlasını ekleyin — her dosyanın sayfaları geçerli sıranın sonuna eklenir; iki ayrı klasörü birleştirmeyi mümkün kılan da budur. Tarayıcı onları doğrudan diskinizden okur.
2. **Sayfaları istediğiniz sıraya koyun.** Bir sayfayı tutamağından sürükleyin ya da oklarla kaydırın. Yan taranmış birini döndürün, birini çıkarın ya da bir dizisini bir seferde tutmak, kaldırmak veya döndürmek için kutuya `1-3, 8, 12-` yazın. Numaralar siz ilerledikçe yeniden verilir; yani gördüğünüz şey her zaman bitmiş dosyanın kendisidir.
3. **Tek belge mi yoksa birkaç belge mi çıkacağını söyleyin.** Olağan cevap tektir. Gerisi kesme yollarıdır: her kaç sayfada bir, belirttiğiniz sayfa numaralarında, sayfa başına bir dosya ya da sayfaların geldiği dosyalara geri. Birden fazla dosya tek bir ZIP olarak verilir; yani elli kaydetme yerine bir kaydetme.
4. **Kurun ve denetlendiğini söyleyen satırı okuyun.** Belgeler yazıldığında her biri bu sayfadaki aynı okuyucu tarafından yeniden açılır ve sayfaları sayılır. Bu, istediğinizle uyuşmuyorsa çalışma başarısız olarak bildirilir ve indirme sunulmaz.

## Uzun sürüm

[PDF sayfaları nasıl birleştirilir, bölünür ve yeniden sıralanır](https://abox.tools/tr/rehberler/pdf-birlestirme-ve-bolme/): PDF'leri birleştirin, birini birkaç parçaya ayırın ve sayfaları oynatın: yeniden dizmeden neyin sağ çıktığı, hiçbir aracın karşıya taşıyamadığı şeyler ve bunların hiçbirinin neden belgelerinizi bir yere yüklemeyi gerektirmediği.

## Kutuda ayrıca

- [PDF Sıkıştırıcı](https://abox.tools/tr/pdf-sikistirma/): Belgeyi hiçbir yere göndermeden küçültün.
- [PDF Karartıcı](https://abox.tools/tr/pdf-karartma/): Harfler dosyadan silinir ve sonra bunu kanıtlamak için dosyada arama yapılır.
- [Görsellerden PDF'e](https://abox.tools/tr/resimleri-pdfe-donusturme/): Resimlerinizi tek bir belgeye koyun.
- [Belge Tarayıcı](https://abox.tools/tr/belge-tarayici/): Sayfayı fotoğraflayın. Taranmış görünen bir şey geri alın.

## Sorular

### PDF'lerim herhangi bir yere yükleniyor mu?

Hayır. Kendi donanımınızda, kendi tarayıcınız tarafından okunur, kopyalanır ve yazılır. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Bu aracın isteğe bağlı bir ağ özelliği de hiç yoktur.

### Kaç dosya birleştirebilirim ve ne kadar büyük olabilirler?

Araca yazılmış bir sınır yok. Sınır kendi makineniz: belgeler üzerlerinde çalışılırken bellekte tutulur, yani bir dizüstü birkaç yüz megabaytı şikâyet etmeden birleştirir ve bunun bir yerlerinde üstünde zorlanır. Hiçbir şey ücretlendirilmiyor, kısıtlanmıyor, filigranlanmıyor ya da sıraya alınmıyor; çünkü öbür uçta bunları yapacak kimse yok.

### Birleştirmek ya da bölmek kalite kaybettirir mi?

Hayır. Bir sayfadaki hiçbir şey yeniden kodlanmaz, yeniden çizilmez ya da yeniden sıkıştırılmaz. Her sayfanın içerik akışı ve başvurduğu her yazı tipi, görsel ve vektör çizim bayt bayt kopyalanır; yani metin seçilebilir ve aranabilir kalır, bir fotoğraf da aynı fotoğraf olur. Değişen tek şey sayfaların sırası ve etraflarındaki yapıdır.

### Yer imlerine ve bağlantılara ne oluyor?

İkisi de atılmaz, yeniden kurulur. Sayfası çıktıda duran bir yer imi, o sayfa nereye taşındıysa oraya işaret eder; sayfasını kaldırdığınız bir yer imi çıkarılır — altında hayatta kalan girdiler yoksa; varsa bir başlık olarak kalır. Birkaç dosyayı birleştirmek her dosyanın yer imlerini o dosyanın adıyla bir başlığın altına koyar. Sayfalar arası bağlantılar da aynı şekilde izlenir; Word ve LaTeX'in yazdığı adlandırılmış hedefler dahil. Hedefi gelmemiş bir bağlantı ise okuyucuyu yanlış bir yere göndermek yerine arkasında hiçbir şey olmadan bırakılır. Web adreslerine giden bağlantılar olduğu gibi korunur.

### Neler karşıya taşınmıyor?

Dört şey ve araç bunu küçük puntoda değil sonuçlarda söyler: ekran okuyucuların kullandığı etiketli okuma sırası ağacı, sayfa etiketleri ("iii, iv, 1, 2" numaralandırması), gömülü dosya ekleri ve "bir sayfaya git" ya da "bir web adresi aç" olmayan her eylem — belge JavaScript'i de dahil. İlk ikisi, sayfalar taşındıktan sonra artık var olmayan bir sırayı tarif eder; sonuncusu ise yeni bir dosyaya taşımayı istediğiniz bir şey değildir. Bir belgenin etiketlemesi sizin için önemliyse orijinali de saklayın.

### Doldurulmuş formlar hayatta kalıyor mu?

Evet. Form alanları ve içlerine yazılanlar sayfalarıyla birlikte gelir ve yeni belge bir form olarak kaydedilir; böylece okuyucular onu form gibi işler. Birleştirirken bilinmesi gereken bir şey var: aynı adı taşıyan iki alan, herhangi bir okuyucu için tek bir alandır; yani aynı formun iki kopyasını birleştirirseniz bir sayfadaki bir kutuyu doldurmak diğerini de doldurur. Araç bu durumu fark eder ve söyler.

### Parola korumalı bir PDF'i açabilir mi?

Hayır ve bu bilinçli bir tercih. Şifreli bir belge, bunu söyleyen bir mesajla geri çevrilir; parola boş olsa bile — ki pek çok tarayıcı ve fotokopi makinesi böyle kaydeder. Bir dosyanın korumasını kaldırmak, sayfalarını taşımaktan farklı bir iştir ve bunu sessizce yapan bir araç sizin istemediğiniz bir şeyi yapıyor olurdu.

### Neden sayfa ön izlemeleri yok?

Çünkü bir sayfayı çizmek eksiksiz bir PDF çizicisi demektir — yazı tipleri, gölgelendirme, saydamlık grupları, karışım modları — ki bu da bir küçük resim seti için getirilip çalıştırılacak bir megabayt ya da daha fazla motor eder. Kutucukların bunun yerine gösterdiği şey, yeniden sıralamanın gerçekte üzerinde çalıştığı şeydir: sayfa numarası, kâğıdın şekli ve boyutu, yazılacağı dönüş ve hangi dosyadan geldiği. Dikey sayfalardan oluşan bir yığındaki yatay bir tarama yine de bir bakışta bellidir.

### Bitmiş dosya her yerde açılır mı?

Evet. Çıktı, PDF 1.5 olarak ya da verdiğiniz dosyalardan hangisi daha yüksek bir sürüm gerektiriyorsa o sürümle yazılır ve 1.5, 2003'ten beri sunulan her okuyucunun anladığı sürümdür. Araç ayrıca bunu kendi cihazınızda kanıtlar: bitmiş her dosyayı size sunmadan önce yeniden açar ve sayfa ağacını gezerek sayfalarını sayar.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok ve kendi cihazınızın belleğinin izin verdiğinin ötesinde bir dosya boyutu sınırı yok. Sitede reklam var, masrafı karşılayan da o; reklamlara belgeleriniz hakkında hiçbir şey verilmiyor.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: belgelerinizi birleştirilmek üzere uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Belgelerinizin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Bu araç o listeye hiçbir şey eklemez: isteğe bağlı olanı bile yok, kendine ait bir ağ özelliği hiç yok. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onları oraya gönderecek bir kod yok.
- **Birleştirmek, yüklememeye en değer iştir.** İnsanların bir araya getirdiği belgeler, bir yerden gelmiş olanlardır: bir sözleşme ve imza sayfası, bir pasaport taraması ve bir hesap özeti, bir doktor mektubu ve bir talep formu. Çevrimiçi bir birleştirici bunların hepsine, tek bir yerde, önceden derlenmiş hâlde sahip olur. Bunun ise tarayıcınızda bir sayfası var ve öbür yarısı yok.
- **Biçimin tamamı bu depoda.** Bir PDF, nesnelerden oluşan bir liste ve her birinin nerede başladığını gösteren bir tablodur. `src/objects.js` bu söz dizimini okur, `src/reader.js` tabloyu izler, `src/assemble.js` sayfaları belgeler arasında kopyalar ve `src/writer.js` sonucu yazar. Dördü de istek yapabilecek hiçbir şeyi içeri almaz. Hiçbir kitaplık getirilmiyor ve hiçbir şey bir sunucuda çizilmiyor.
- **Şifreli dosyalar açılmıyor, geri çevriliyor.** Parola konmuş bir PDF geri çevrilir; tarayıcıların boş parolayla ürettiği ve teknik olarak açılabilecek türü de dahil. Bir belgenin korumasını kaldırmak, sayfalarını yerinden oynatmaktan farklı bir iştir ve bunu sessizce yapmak bir aracın sizin adınıza yapması şaşırtıcı olurdu.
- **Bitmiş dosya nerede yapıldığına dair bir şey söylemez.** Üretici satırı yok, oluşturulma tarihi yok, aracın adı yok. XMP paketini ya da bir sayfa düzeni uygulamasının geride bıraktığı özel blokları da taşımaz — onlar eskiden var olan belgeye aittir, sizin az önce kurduğunuza değil. Sayfaların kendi içindeki her şey aynen kopyalanır: bu araç sayfaları taşır, üzerlerinde yazanı yeniden yazmaz.
- **"Bir sayfaya git" olmayan eylemler kopyalanmaz.** Bir PDF, açıldığında çalışan talimatlar taşıyabilir: şunu oynat, bu formu şu adrese gönder, şu JavaScript'i çalıştır. Bu araçtan geçen sayfalar başka sayfalara ve web adreslerine olan bağlantılarını korur, gerisini kaybeder. Birinin sayfalarını yeniden sıralamak, onun belgesinin betiklerini sizin yeni dosyanıza taşımak için bir sebep değildir.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine belgeleriniz hakkında bir şey verilmiyor: ne bir dosya, ne bir sayfa, ne bir ad, bir boyut ya da bir sayfa sayısı. Bir PDF'i okuyan, kopyalayan ya da yazan her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de belgeleriniz hakkında bir şey verilir. Siz tıklamadıkça hiçbir şey olmaz ve tıkladığınızda gideceğiniz yer başkasının sitesidir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfadaki her şey çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu: belgelerinizi birleştirilmek üzere uzağa gönderen bir araç dururdu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, ve kopyalama işinin tamamı için `src/assemble.js` — bir sayfanın bir belgeden nasıl alınıp başkasına konduğu ve neyin bilinçli olarak geride bırakıldığı. O da ağa erişemez, yanındaki okuyucu ve yazıcı da erişemez.
