# Base64 şifreleme mi?

Hayır. Base64 kılık değiştirmektir, kilit değil: onu tanıyan herkes milisaniyeler içinde, hiçbir anahtar olmadan geri çevirir. Ama soru gerçek bir cevabı hak ediyor; çünkü kodlama, şifreleme ve özet ekranda birbirine benzer ve vaat ettikleri bundan daha farklı olamazdı.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Hayır. Base64 bir *kodlamadır*: herhangi bir veriyi yalnızca altmış dört zararsız karakterle yazmanın yolu; düz metin için kurulmuş sistemlerden geçerken sağ kalsın diye. Anahtarı yok, sırrı yok, hiçbir türde güvenlik özelliği yok. Çözmek için onu tanımak yeter, başka bir şey gerekmez — insana bir bakış, bilgisayara bir milisaniye.

Soru yine de sorulmaya değer; çünkü karışıklık evrensel ve zaman zaman pahalı. Bir base64 dizgisi karışık *görünür* — `cGFzc3dvcmQ=` göze hiçbir şey söylemez — ve karışık görünen, “güvenli” rafına kaldırılır. Gerçek ürünler, parolaları böyle “korunmuş” hâlde piyasaya çıktı. Devası bir kez öğrenilen tek bir ayrımdır: **kodlama makineler için, şifreleme sırlar için, özet parmak izleri içindir.** Üç iş, üç araç; ve yalnızca biri bir şeyi korur.

## Kodlama: herkes geri çevirir

Kodlama, verinin *yazılışını* değiştirir; söylediğini asla. E-posta ekleri, stil dosyalarına gömülü resimler, adreslerdeki belirteçler — her yerde gelişigüzel baytların, yalnızca metni güvenle taşıyan kanallardan geçmesi gerekir ve base64 standart kılıktır: üç bayt girer, harflerden, rakamlardan ve iki işaretten örülü dört karakter çıkar; sonu `=` ile doldurulur. O son `=` alamettir; bir kez öğrenince base64'ü her yerde görürsünüz.

Her şeyi belirleyen özellik şu: tarif herkese açık ve tersine doğru da aynen çalışıyor. Bilinecek bir şey yok, o yüzden bilinmeyecek bir şey de yok. Adreslerdeki yüzde kodlaması (boşluk için `%20`), HTML varlıkları (`&amp;`), onaltılık ve ters bölü kaçışları aynı fikrin başka kıyafetleridir ve buradaki [base64 kodlayıcı ve çözücü](https://abox.tools/tr/base64-kodlama/) hepsini, iki yönde, sizin makinenizde konuşur. Bulduğunuz bir dizgiyi çözmek, onu okumak kadar meşrudur; çünkü kodlama hiçbir zaman kilit olmadı.

## Şifreleme: anahtarın sahibi geri çevirir

İçeriği gerçekten koruyan, şifrelemedir. Veriyi bir *anahtarla* dönüştürür ve matematik öyle kurulmuştur ki dönüşümü anahtarsız geri çevirmek yalnızca zor değil, hesapça erişilmezdir — anahtarla ise anındadır. Gizlilik bütünüyle anahtarda yaşar, yöntemde değil: algoritmalar yayımlanmış, standartlaşmıştır ve tam da bu yüzden güçlüdür.

Görsel karışıklığın ısırdığı yer burası; çünkü şifrelenmiş baytlar yolculuk edebilsin diye rutin olarak base64'e kodlanır — önce bir anahtarla karıştırılır, sonra taşınmak için giydirilir. İki katman, iki iş. JSON Web Token ders kitabı örneğidir: noktalarla birleşmiş üç base64 parçası; ilk ikisi, deneyen herkes için okunur JSON'a *çözülür*. İnsanlar her gün, bütünün mühürlü olduğunu sanarak halka açık web çözücülerine belirteç yapıştırır; dürüst tarif şudur: JWT, sahteciliğe dayanıklı imzalı bir kartpostaldır, zarf değil.

## Özet: kimse geri çeviremez

Özet tek yönde koşar. İstediğiniz kadar veriyi SHA-256'dan geçirin; sabit boyutta bir sayı çıkar — aynı veri için her seferinde aynı sayı, tek biti farklı veri için bambaşka bir sayı, ve sayıdan veriye dönen bir yol yok; kimse için, anahtarlı ya da anahtarsız. Ne kılıktır ne kilit; bir *parmak izidir*.

Onu, kendisine ait iki işin doğru aracı yapan da budur. İndirilen dosyanın tam olarak yayıncının yayımladığı dosya olduğunu doğrulamak — parmak izlerini karşılaştırmak; bunu [sağlama toplamı aracı](https://abox.tools/tr/saglama-toplami-hesaplama/) sizin makinenizde yapar, [kendi rehberiyle](https://abox.tools/tr/rehberler/dosya-saglama-toplamini-dogrulama/) birlikte. Ve parolaları saklamak: düzgün işletilen bir hizmet sizinkinin yalnızca özetini tutar; öyle ki çalınan veritabanı bile parolayı içermez. Bir site unuttuğunuz parolayı e-postayla geri gönderebiliyorsa, onu hiç özetlemediğini söylemiş demektir — ve bir yapılandırma kendi parolasını `cGFzc3dvcmQ=` olarak “koruyorsa”, onu yalnızca kodladığını söylemiştir.

## Sahada birbirinden ayırmak

Önünüzdeki dizgi için işe yarayan kestirme:

- **Okunur bir şeye mi çözülüyor?** Kodlamaymış. Harfler, rakamlar, belki `+` ve `/`, çoğu kez sonda `=` — bir çözücüden geçirin ve bakın.
- **İkili gürültüye mi çözülüyor?** O hâlde base64 yalnızca kılıkmış; altındaki ya şifreli ya sıkıştırılmış ya da zaten hiç metin olmamış — kodlama iki durumda da size bir şey söylemez.
- **Sabit uzunluk, onaltılık karakterler, hiç mi çözülmüyor?** 64 onaltılık karakter SHA-256'nın silüetidir; 32, MD5'in. Özetler çözülmez; yalnızca tutar ya da tutmaz.

Ve her birinin işe dönük dersi: gizliliği asla kodlamaya emanet etmeyin; platformunuz şifrelemeyi hazır veriyorken asla kendiniz kurmayın; parolayı asla özetten başka bir şey olarak saklamayın. Bu arada, denemek için çözdüğünüz dizgi pekâlâ hassas kısmın kendisi olabilir — ayıklanmakta olan bir belirteç genellikle öyledir — ve buradaki [çözücünün](https://abox.tools/tr/base64-kodlama/) sırrın zaten bulunduğu yerde, sizin makinenizde koşmasının sebebi de budur; [bir web aracına yapıştırmanın gerçekte ne yaptığının](https://abox.tools/tr/rehberler/online-araca-metin-yapistirmak-guvenli-mi/) kendi sayfası olmasının sebebi de.
