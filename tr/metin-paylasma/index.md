# Metin ve dosya paylaşımı — sizin tarayıcınızdan onlarınkine, hiçbir şey yüklemeden

Paylaşım bu açık sekmede yaşar. Okuyucular onu şifreli olarak doğrudan tarayıcınızdan alır ve sekmeyi kapattığınızda biter - hiçbir sunucu hiçbir şey saklamaz.

> Metni veya dosyaları bir tarayıcıdan diğerine doğrudan ve şifreli bir bağlantıyla gönderin. Söylenebilir bir bağlantı adı, siz yazarken canlı güncelleme, okuyucu başına onay - ve hiçbir sunucuda asla hiçbir şey. Ücretsiz, kayıt yok.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/metin-paylasma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## paylaşılan metinler ve dosyalar **asla yüklenmez**. Sunucu yoktur.

Burada paylaştıklarınız, uçtan uca şifreli bir WebRTC kanalı üzerinden sizin tarayıcınızdan her okuyucunun tarayıcısına gider, başka hiçbir yere değil. İşin içindeki tek sunucu — bu sayfanın `Content-Security-Policy`'sinde adı geçer, kodu depodadır — iki tarayıcıyı birbirine tanıştırır ve kenara çekilir: hiçbir şey saklamaz ve içerik asla ondan geçmez. Geçmiş de hesap da yoktur. Bu sekmeyi kapatın; paylaşım, okuyucuların açık sayfaları dahil her yerde aynı anda sona erer.

- ✗ Hiçbir şey saklanmaz
- ✗ Hesap yok
- ✓ Uçtan uca şifreli
- ✓ Sekmenizle biter
- ✓ Açık kaynak

## Metin ve dosyaları hiçbir yere yüklemeden nasıl paylaşırsınız

1. **Metni yazın, ya da dosyaları ekleyin.** Düzenleyici paylaşımın kendisidir: bir okuyucu bağlandığında içinde ne varsa onu alır ve sonrasındaki her değişiklik, siz yazarken bağlı okuyuculara canlı ulaşır. Dosyalar aynı kanaldan gider, her biri 200 MB'a kadar; okuyucular listeyi görür ve yalnızca istediklerini indirir — kimsenin bant genişliği istemediği bir dosyaya harcanmaz.
2. **Metin biçimlendirmeyi hak ediyorsa Markdown'ı açın.** Tek bir anahtar. Başlıklar, kalın yazı, listeler, kod ve bağlantılar siz yazarken düzenleyicinin yanında canlı olarak işlenir; okuyucular varsayılan olarak biçimli görünümü alır, kaynağa dönmek için bir düğmeleri vardır. İşleyici bu sayfayla birlikte gelir ve her şeyi kaçışlar: paylaşılan metin, kim yazmış olursa olsun, bir okuyucunun makinesinde betiğe dönüşemez.
3. **Bağlantıya bir ad verin, ya da öneriyi bırakın.** Ad, adresin kendisidir: `brave-otter-42` bir odanın öbür ucuna söylenebilir, telefonda okunabilir, tahtadan kopyalanabilir. Aynı zamanda tek sırdır: özel bir şey için ya kimsenin tahmin edemeyeceği bir ad seçin ya da özel anahtarına güvenin. Başkasının o an paylaştığı bir ad reddedilir; sizinki, durduğunuz anda yeniden boşa çıkar.
4. **Kimin gireceğine karar verin.** Özel, varsayılandır: her okuyucudan kendini tanıtması istenir — bir ad, bir ipucu, tanıyacağınız herhangi bir şey — ve siz mesajı, okumasına izin vermek ya da geri çevirmek için düğmelerle görürsünüz. Tanıtım doğrudan kanaldan gider; kapıyı kimin çaldığını aracı bile bilmez. İşareti kaldırırsanız, adı bilen herkesin okuyabildiği açık bir paylaşım olur.
5. **Paylaşımı başlatın ve sekmeyi açık tutun.** Sekme sunucudur: paylaşım, sekme açık ve uyanık olduğu sürece erişilebilir, bir an bile fazla değil. Kapanan bir dizüstü de paylaşımı bitirir. Bağlantıyı kopyalayın ya da adı söyleyin yeter — okuyucu onu bu sayfanın adresinin sonuna `#ad` olarak yazabilir.
6. **Öbür tarafta: önce onay, sonra kapıyı çalmak.** Bağlantıyı açan, birinin paylaştığını öğrenir; doğrudan bir bağlantının iki tarafa birbirinin ağ adresini göstereceği konusunda uyarılır ve yalnızca kendi seçimiyle bağlanır. Özel bir paylaşımda kendini tanıtır ve sizi bekler. Aldığı şey siz yazarken canlı güncellenir ve sekmeyi kapattığınızda kaybolur.

## Uzun sürüm

[Metin ve dosyaları yüklemeden cihazlar arasında nasıl paylaşırsınız](https://abox.tools/tr/rehberler/cihazlar-arasi-metin-paylasma/): Metni veya dosyaları doğrudan ve şifreli bir bağlantıyla bir tarayıcıdan diğerine taşıyın - kendinize e-posta atmadan, sohbet geçmişi bırakmadan, hesap açmadan ve hiçbir sunucu kopya tutmadan.

## Kutuda ayrıca

- [QR ve Barkod Üreteci](https://abox.tools/tr/qr-kod-olusturma/): Yazın, koda dönüşsün. Bir tane üretmek için hiçbir şey gönderilmez.
- [QR ve Barkod Okuyucu](https://abox.tools/tr/qr-kod-okuma/): Bir koda doğrultun ya da onun bir resmini bırakın. Burada okunur, başka hiçbir yerde.
- [Özet ve Sağlama Toplamı](https://abox.tools/tr/saglama-toplami-hesaplama/): Bir indirmeyi, yayıncının bastığı sayıya karşı, kimseye göndermeden denetleyin.
- [Şifre ve Parola Cümlesi Üreteci](https://abox.tools/tr/sifre-olusturucu/): Burada, kendi tarayıcınız tarafından üretilir ve hiçbir yere gönderilmez. Hiçbir şey saklanmaz ve geçmiş yoktur.

## Sorular

### Herhangi bir şey herhangi bir yere yükleniyor mu?

Hayır. Metin ve dosyalar, şifreli bir WebRTC kanalıyla doğrudan sizin tarayıcınızdan her okuyucunun tarayıcısına gider. İşin içindeki tek sunucu tanıştırmayı taşır — birkaç kilobaytlık bağlantı pazarlığı — içeriği asla. Onda sızacak, el konacak ya da kaybolacak hiçbir şey yoktur: sizden tek bayt tutmaz ve siz bağlantıyı kestiğiniz anda oda yok olur.

### Peki bu araç neden bir sunucuyla konuşuyor, hem de bu sitede?

Çünkü iki tarayıcı birbirini kendi başına bulamaz: bir şeyin, `brave-otter-42` yazan kişiyle o adla paylaşan kişiyi buluşturması ve bağlantı teklifini aralarında taşıması gerekir. O şey aracıdır: bu sayfanın tek ağ bağımlılığı, `Content-Security-Policy`'sinde adı geçer ve sayfayla aynı depoda yayımlanmıştır. İşi yapabilecek en küçük sunucudur: hiçbir şey saklamaz, hiçbir şey okumaz ve iki tarayıcı doğrudan bir kanala kavuştuğu anda kenara çekilir.

### O sunucu tam olarak ne görebilir?

Bir bağlantı adının kullanımda olduğunu, paylaşanın ve okuyucuların ne zaman bağlanıp ayrıldığını, IP adreslerini ve aralarında alışveriş ettikleri şifreli bağlantı kurulumunu. Metni göremez, dosyaları göremez, adlarını ve boyutlarını göremez, özel bir paylaşıma kimin alındığını göremez, kendini tanıtırken kimin ne yazdığını da göremez — bunların hepsi, sunucudan geçmeyen uçtan uca şifreli doğrudan kanaldan gider. Sunucuyu çalıştıran Cloudflare, her bağlantının kaydını yedi gün tutar: bağlantı adı, adres ve saat. Paylaşımdan geriye başka hiçbir şey kalmaz.

### Sekmeyi kapattığımda ne olur?

Paylaşım her yerde aynı anda biter. Bağlantı bir iki saniye içinde çalışmaz olur; sayfası hâlâ açık olan okuyucular, paylaşımın sona erdiğini söyleyen bir notla birlikte kopyalarının kaybolduğunu görür. Bu bir sunucuya silme isteği değildir — silinecek bir sunucu kopyası yoktur. Paylaşımın var olduğu tek yer sekmeydi ve onu kapatmak temizliğin tamamıdır.

### Bir okuyucu paylaştığım şeyi saklayabilir mi?

Paylaşım açıkken, evet — paylaşmak budur. Bir okuyucu metni kopyalayabilir ya da bir dosyayı indirebilir ve aldığı şey onundur; tıpkı başka herhangi bir yolla elden vermişsiniz gibi. Bitirmenin garanti ettiği şey gelecektir: yeni kimse ulaşamaz ve açık sayfalar onu göstermeyi bırakır. Hiçbir araç, çoktan varmış olanı geri çekemez ve bu sayfa aksini iddia etmez.

### Özel mod nedir?

Varsayılan. Gelen her okuyucuya paylaşımın özel olduğu söylenir ve kendini tanıtması istenir; siz mesajı — “benim, stand-up'taki Alice” — okumasına izin vermek ya da geri çevirmek için düğmelerle görürsünüz ve siz karar verene dek hiçbir şey gönderilmez. Tanıtım zaten şifreli olan doğrudan kanaldan gider; yani sunucu kapıyı kimin çaldığını da ne karar verdiğinizi de asla bilmez. Paylaşmadan önce işaret kaldırılırsa açık bir paylaşım olur.

### Okuyucu IP adresimi neden görecek?

Çünkü bağlantı gerçekten doğrudandır ve doğrudan bir bağlantı iki adres arasında kurulur: her uç, ötekininkini ister istemez öğrenir, tıpkı bir telefon görüşmesindeki gibi. Okuyucu, herhangi bir bağlantı var olmadan önce uyarılır ve yalnızca kendi seçimiyle bağlanır; o ana dek siz bağlantıyı açtığını bile bilmezsiniz. Bu takas belirli bir paylaşım için uygun değilse, alternatif bir sunucu üzerinden aktaran bir hizmettir — ters takasla.

### Dosyalar ne kadar büyük olabilir, hız nasıl?

Dosya başına 200 MB'a kadar, her tür; hız ise iki bağlantıdan yavaş olanı kadardır — arada yavaşlatacak ya da sayacak bir sunucu yoktur. Aynı Wi-Fi'daki iki makine yerel ağ hızında aktarır ve baytlar binadan çıkmaz. Okuyucular her dosyayı istek üzerine indirir; büyük bir şey eklemek, biri gerçekten isteyene dek hiçbir şeye mal olmaz.

### Çevrimdışı çalışıyor mu?

Dürüst olmak gerekirse: yarısı. Düzenleyici evet — sayfa yüklenir, taslağınız yerindedir, Markdown işlenir; yazmak ve kaydetmek hiç ağ olmadan olur. Paylaşmak hayır, olamaz da: bir başkasının tarayıcısına ulaşmak bir ağ eylemidir ve tanıştırma aracıyı gerektirir. Bu sitede görevi çevrimdışı imkânsız olan tek araç budur; aksini ima etmek dürüst olmazdı.

### Ya bağlanamazsak?

Tarayıcı çiftlerinin çoğu tanıştırıldıktan sonra birbirine doğrudan ulaşır; bir azınlık ulaşamaz, genellikle bir taraf bir mobil operatörün paylaşımlı adres ağındayken ya da katı bir kurumsal ağın arkasındayken. Bu sayfa hiçbir zaman sessizce bir aktarıcıya geçmez — bu, aracın ne olduğunu söylemeden değiştirmek olurdu —: yirmi saniye sonra doğrudan bağlantının kurulamadığını açıkça söyler ve okuyucuya bir aktarıcı önerir: iki tarayıcı arasında şifreli baytları ileten ve anahtar iki uçtan hiç ayrılmadığı için onları okuyamayan, Cloudflare'ın işlettiği bir aktarıcı. Okuyucu onu kendi sayfasında, neyi gördüğü — doğrudan bağlantının göreceği gibi iki adresi — kendisine söylendikten sonra açıkça seçer ve orada da hiçbir şey saklanmaz. Sizin tarafınız değişmez: tarayıcınız, okuyucu bir VPN'in arkasında olsaydı yapacağı gibi, yine yalnızca o tek okuyucuya gönderir.

### Herkes her şeyi paylaşabiliyorsa Markdown'ı işlemek güvenli mi?

Bu soru, işleyicinin bir kitaplık değil de bu sayfanın kodundaki seksen satır olmasının nedenidir. Her karakter, herhangi bir etiket üretilmeden önce kaçışlanır; yalnızca sabit ve zararsız bir etiket kümesi doğabilir; bağlantılar yalnızca `http`, `https` ve `mailto` kabul eder — bir `javascript:` bağlantısı cansız metin olarak kalır. Paylaşılan metin, kim yazmış olursa olsun makinenizde betiğe dönüşemez ve o seksen satırı okuyabilirsiniz.

### İki kişi aynı adla paylaşabilir mi?

Aynı anda hayır. Ad başına tek canlı paylaşım, aracıda zorunlu kılınır: ikinci gelen reddedilir ve başka bir ad seçmesi istenir. Bir paylaşım biter bitmez adı yeniden boşa çıkar — bu, saklanan bir bağlantının ancak arkasındaki paylaşım kadar taze olduğu anlamına da gelir: aynı ad gelecek hafta başkasının olabilir. Bir bağlantıya bir kişinin değil, bir anın malı gibi davranın.

### Ücretsiz mi, hesap gerekiyor mu?

Ücretsiz; hesap yok, kayıt yok ve sözü edilecek bir sınır da yok — paylaşım başına on altı eşzamanlı okuyucu. Site reklam taşır, masrafını o karşılar; reklamlar bu sayfanın paylaştığı hiçbir şeyi almaz ve aracı, tam da hiçbir şey saklamadığı ve neredeyse hiçbir şey yapmadığı için ücretsiz pakete rahatça sığar.

## Gizlilik iddiası nasıl doğrulanabilir

- **İçerik okuyucunuza gider, başka hiçbir yere değil.** Metin ve dosyalar bir WebRTC veri kanalından gider: tarayıcınız ile her okuyucunun tarayıcısı arasında doğrudan, DTLS ile şifreli bir bağlantı. O yolda sunucu yoktur. Aynı ağda baytlar binadan bile çıkmaz — aynı Wi-Fi'daki iki dizüstü her şeyi yerel olarak aktarır. Tek istisna, ağına doğrudan ulaşılamayan ve bunun üzerine kendi sayfasında şifreli bir aktarıcı seçen okuyucudur: aktarıcı aynı şifreli metni iletir ve onu okuyamaz.
- **Aracı nedir, ve gördüğü her şey.** Doğrudan bir bağlantı bir tanıştırma ister; bu yüzden bu sayfa — bu sitede yalnızca bu sayfa — bize ait bir sunucuya tek bir WebSocket açar. O sunucu, bir bağlantı adını yazan kişiyle o adla paylaşan kişiyi buluşturur, birkaç kilobaytlık pazarlığı iletir ve hiçbir şey tutmaz: hiçbir zaman depolamaya yazmaz ve paylaşan bağlantıyı kestiği anda oda yok olur. Görebildikleri: bir adın kullanımda olduğu, kimin ne zaman gelip gittiği ve IP adresleri. Göremedikleri: metin, dosyalar, kimin içeri alındığı ya da kimin ne yazdığı — özel bir paylaşımın kapısını çalmak bile şifreli doğrudan kanaldan gider. Tam kaynak kodu, bu aracınkiyle yan yana depodadır. Bir paylaşımdan geriye tek bir şey kalır: sunucuyu çalıştıran Cloudflare, her bağlantının kaydını yedi gün tutar — bağlantı adı, adres ve saat; içerik asla.
- **Hiçbir şey saklanmaz: sekmeyi kapatmak silmenin ta kendisidir.** Paylaşım yalnızca sekmeniz açıkken vardır. Kapatın: yeni okuyucular hiçbir şey bulamaz, o an okuyanlar ise kopyalarının kaybolduğunu görür — gerçi birinin daha önce kopyaladığı ya da indirdiği şey onundur, elden verdiğiniz her şey gibi. Yazdığınız taslak, bir dahaki sefere yerinde olsun diye kendi tarayıcınızın depolamasında durur, yalnızca orada; tek seferlik işaretlenirse hiçbir yerde durmaz.
- **Bağlantı adı tek sırdır, özel modu ise kilit.** Bir adı bilen ya da tahmin eden herkes arkasındaki paylaşımı açabilir. Önerilerin üç rastgele sözcük olması bu yüzdendir; hassas olan her şeyin tahmin edilemez bir ad hak etmesi de — ya da varsayılan olarak açık gelen özel anahtarı: gelen her okuyucu, doğrudan kanal üzerinden kendini tanıtmak zorundadır ve siz onu içeri alana kadar hiçbir şey gönderilmez.
- **Doğrudan bağlantı, iki tarafa birbirinin adresini gösterir.** Eşler arası demek budur ve okuyucu bunu olmadan önce öğrenir: bir paylaşım bağlantısını açmak yalnızca aracıya birinin paylaşıp paylaşmadığını sorar; sonra sayfa, bağlanmanın iki tarafa birbirinin IP adresini göstereceğini açıkça söyler ve bir tıklama bekler. O tıklamaya kadar paylaşan, okuyucunun varlığından bile habersizdir.
- **Google'ın yüklediği, ve eline geçmeyen.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi Buy Me a Coffee'den gelir. Hiçbiri metni, dosyaları, adlarını ya da boyutlarını, kimin bağlandığını almaz. İstisna, bu sayfanın kendi adresidir: okuyucunun bağlantısı bağlantı adını taşır ve reklam betiği adresi okur. Gizli kalması gereken bir paylaşım, özel anahtarını ister. İçeriğe dokunan her satır bu kaynaktan sunulur ve depodadır.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, alışverişin iki yarısı için `src/main.js` — paylaşanın sekmesi ile okuyucununki aynı dosyadır — ve telin öbür ucundan gelen metin üzerinde çalıştığı için her şeyi önce kaçış karakterleriyle işleyen işleyici için `src/markdown.js`. Sunucunun tam kaynak kodu aynı depodaki `workers/rendezvous/worker.js` dosyasıdır: bağlantı adı başına bir oda, açık bağlantılardan başka hiçbir şey tutmaz.
