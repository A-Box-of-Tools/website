# QR ve Barkod — çevrimdışı QR kod ya da barkod üretin

Yazın, koda dönüşsün. Bir tane üretmek için hiçbir şey gönderilmez.

> Bir bağlantı, bir Wi-Fi ağı ya da bir kartvizit için QR kod üretin; ya da EAN-13, UPC-A, Code 128 veya Code 39 barkodu. SVG ya da PNG olarak indirin. Hepsi tarayıcınızda olur.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/qr-kod-olusturma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## kodlarınız ve içlerindeki metin **asla yüklenmez**. Sunucu yoktur.

Bir QR kod, bir dize üzerinde yapılan bir hesaptır: gönderilecek bir dosya ve sorulacak bir hizmet yoktur. Her adım — kipin seçilmesi, sürümün belirlenmesi, Reed-Solomon hata düzeltmesi, maske, bir barkodun çubukları ve altındaki kontrol hanesi — bu sayfada, okuyabileceğiniz yaklaşık bin satırlık JavaScript içinde olur. Bu aracın hiçbir türde ağ özelliği yoktur ve bu, çoğu sayfadan çok burada önemlidir: kodlanan şey çoğu zaman bir Wi-Fi şifresidir.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Süre sonu yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Hiçbir şey yüklemeden nasıl QR kod üretilir

1. **Kodun türünü seçin.** Bir QR kod her şeyi taşır ve bir telefon kamerasının aradığı şeydir; yani biri size aksini söylemedikçe cevap odur. Bir barkod bir sayı taşır ve hangisine ihtiyacınız olduğuna, onu tarayacak olan karar verir — bir mağaza EAN-13 ya da UPC-A ister, bir sevkiyat kolisi ITF-14 ve şirket içi olan her şey genellikle Code 128'dir.
2. **İçine ne gireceğini söyleyin.** Yaygın olan bir bağlantıdır ve üstündeki kutular telefonların bildiği diğer biçimleri kurar: kendini katmayı öneren bir Wi-Fi ağı, kaydedilmeyi öneren bir kartvizit, bir e-posta, bir kısa mesaj, bir telefon numarası, haritada bir yer. Hangisini seçerseniz seçin, bitmiş dize sayfada gösterilir — bir QR kodun taşıdığı tek şey budur.
3. **Ne kadar hasar alabileceğini seçin.** Dört seviye, daha çok ya da daha az hata düzeltmesi koyar ve daha çok düzeltme daha büyük, daha yoğun bir kod demektir. L bir ekran için yeter, M sıradan kâğıt için ve H tutulacak, küçük basılacak ya da güneşte bir camda duracak bir şey için. Her gün silinen bir menüdeki bir kod, Q ya da H'ye değer.
4. **Boyutu, kenar boşluğunu ve renkleri ayarlayın.** Kenar boşluğu kodun bir parçasıdır: mevzuatın istediği şey çevresinde dört modülük sessiz alandır ve onu kırpmak, basılı bir kodun taranmamasının en yaygın tek sebebidir. Açık üzerine koyu, gerçek bir kontrastla — bir tarayıcı ikisi arasındaki farkı okur, yani beyaz üzerine soluk gri olmaz ve koyu üzerine açık, pek çok okuyucuda doğrudan başarısız olur.
5. **Elinizdeki telefonla denetleyin.** Bin tane basmadan önce ekranınızdakini tarayın. Bu on saniye sürer ve bir ön izlemenin yakalayamayacağı hata sınıfının tamamını yakalar: kaçış karakteri gereken bir karakteri olan bir Wi-Fi şifresi, `https://` eksik bir bağlantı, bir hane eksik bir barkod numarası.
6. **SVG'yi alın.** Kodun piksel değil talimat hâlidir; yani her boyutta yumuşamadan basılır ve bir tarayıcının çözemediği şey tam olarak yumuşak bir kenardır. Yapıştıracağınız yer SVG kabul etmiyorsa PNG'yi de alın; o da modül başına tam sayıda pikselle çizilir, yani onun da bulanık kenarı olmaz.

## Uzun sürüm

[Bir başkasının telefonunda da okunan bir QR kod nasıl yapılır](https://abox.tools/tr/rehberler/qr-kod-olusturma/): Hangi hata düzeltme düzeyini seçmelisiniz, bir QR kodun etrafındaki beyaz boşluk neden kodun bir parçasıdır, ne kadar büyük basmalısınız ve ücretsiz bir üreticinin 'dinamik' kodu size sonradan neye mal olur.

## Kutuda ayrıca

- [QR ve Barkod Okuyucu](https://abox.tools/tr/qr-kod-okuma/): Bir koda doğrultun ya da onun bir resmini bırakın. Burada okunur, başka hiçbir yerde.
- [Özet ve Sağlama Toplamı](https://abox.tools/tr/saglama-toplami-hesaplama/): Bir indirmeyi, yayıncının bastığı sayıya karşı, kimseye göndermeden denetleyin.
- [Şifre ve Parola Cümlesi Üreteci](https://abox.tools/tr/sifre-olusturucu/): Burada, kendi tarayıcınız tarafından üretilir ve hiçbir yere gönderilmez. Hiçbir şey saklanmaz ve geçmiş yoktur.
- [JSON Biçimlendirici](https://abox.tools/tr/json-bicimlendirme/): JSON, XML, HTML, CSS ve YAML; biçimlendirilmiş ya da dönüştürülmüş. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.

## Sorular

### Yazdığım hiçbir şey bir yere gönderiliyor mu?

Hayır. Bir QR kod, bir dize üzerinde yapılan bir hesaptır ve o hesap kendi makinenizde, kendi tarayıcınızda çalışır. Bu aracın hiçbir türde ağ özelliği yoktur — hiçbir zaman bir şey getirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar; bunların hiçbiri bu siteye ait değildir. Bu, çoğu sayfadan çok burada değerlidir; çünkü insanların bir QR koda en sık koyduğu şey Wi-Fi şifreleridir.

### Bu kodların süresi doluyor mu, sonradan çalışmayı bırakıyor mu?

Hayır ve bırakamazlar. Yazdığınız şey, kodun taşıdığı şeydir; yani onu taramak sonsuza kadar tam olarak o dizeyi geri verir. Süresi dolan kodlar, içinde başkasının adresi olanlardır: bir "dinamik" QR kod, üretecin sunucusuna bir bağlantı taşır ve oradan sizinkine yönlendirir; bu da her taramayı sayabilecekleri, nereye gittiğini değiştirebilecekleri ya da bir deneme süresi bittiğinde kapatabilecekleri anlamına gelir. Burada hiçbir şey hiçbir şeyin üzerinden yönlendirmez.

### Ücretsiz mi ve ticari olarak kullanabilir miyim?

Ücretsiz; hesap yok, filigran yok ve kaç tane ürettiğinizde bir sınır yok; sonucu bir ürüne, bir afişe ya da bir vitrine koyabilirsiniz. QR Code, Denso Wave'in tescilli markasıdır ve şirket bu hakkı kodları kullananlara karşı kullanmayacağını açıklamıştır — şartname ISO/IEC 18004 olarak yayımlanmıştır ve uygulaması serbesttir; bu sayfanın yaptığı da budur. Sitede reklam var, masrafı karşılayan da o.

### Hangi hata düzeltme seviyesini seçmeliyim?

Bir sebebiniz yoksa M. L en küçük kodu yapar ve bir ekranda gayet iyidir; M sıradan bir kullanımdan sağ çıkar; Q ve H ise küçük basılacak, lamine edilecek, bir cama yapıştırılacak ya da kısmen bir logoyla kapatılacak bir kod içindir. Her bir üst basamak daha çok denetim verisi koyar ki bu da aynı miktarda metin için daha büyük bir simge gerektirir — L'den H'ye geçmek, aynı dize için modül sayısını kabaca iki katına çıkarır.

### Bir QR kod ne kadar taşıyabilir?

En büyük boyutta, 177 modül kare, 7.089 rakama, 4.296 büyük harf ve rakama ya da başka her şeyden 2.953 bayta kadar — ve bu, en zayıf hata düzeltmesinde; en güçlüsünde bunların yaklaşık üçte biri kadar. Pratikte sınır biçim değil tarayıcıdır: birkaç yüz karakterden sonra modüller o kadar küçülür ki sıradan bir telefon kamerası onları kol mesafesinden çözemez. Uzun bir kod genellikle, içine kısa bir bağlantının girmesi gerektiğinin işaretidir.

### Bağlantıyı küçük harfle yazınca kodum neden büyüyor?

Çünkü bir QR kodun büyük harfler ve rakamlar için, iki karakteri on bir bite paketleyen bir kipi vardır; küçük harf için böyle bir kip yoktur ve her biri sekiz bite mal olur. `HTTPS://EXAMPLE.COM/PAGE` diye yazılmış bir adres, küçük harfli hâlinden üçte bir daha küçük olabilir. Şema ve sunucu adı büyük/küçük harfe duyarsızdır, yani onları bağırmak boyuttan başka bir şeyi değiştirmez; sunucudan sonraki yol ise duyarlıdır, onu olduğu gibi bırakın.

### Bir QR kodu üretmenin yanı sıra okuyabiliyor mu?

Bu sayfa okuyamaz ama yan kapıdaki okur: [okuyucu](https://abox.tools/tr/qr-kod-okuma/), bir fotoğrafı, bir ekran görüntüsünü ya da kameranızı alır ve dizeyi geri verir. Bir tane çizmekten epeyce büyük bir iştir — simgeyi bir resimde bulmak, çekildiği açıyı düzeltmek ve hasarı onarmak, bu sayfanın hiç yaşamadığı üç sorundur — kendi başına bir araç olmasının ve burada bir düğme olmamasının sebebi de budur. Diğer her şeyle aynı şartlarla çalışır: hiçbir şey yüklenmez ve hiçbir kamera karesi saklanmaz.

### Kenar boşluğu ne işe yarıyor, onu küçültebilir miyim?

Bir QR kodun çevresindeki beyaz alan kodun bir parçasıdır. Bir okuyucu simgenin nerede bittiğini onunla bulur ve şartname her kenarda dört modül ister; bir barkod on kadar ister. Burada sıfıra ayarlayabilirsiniz ve resim daha derli toplu görünür; sonra da pek çok tarayıcı onu hiç göremez — özellikle kalabalık bir arka planda. Sorun yerse kodun kenar boşluğunu kırpmak yerine kodu küçültün.

### Hangi barkoda ihtiyacım var?

Onu tarayacak kişi hangisini isterse. EAN-13 Kuzey Amerika dışındaki perakende barkodu, UPC-A ise Kuzey Amerika'daki — ikisi de size GS1 tarafından verilmiş bir numara gerektirir, çünkü numara yalnızca ürünü değil şirketinizi tanımlar. EAN-8, küçük ambalajlar için kısa sürümdür. ITF-14 sevkiyat kolisine gider. Code 128 ve Code 39 rakamın yanı sıra metin de taşır ve hiçbir kayıt gerektirmez; bu da onları şirket içi her şey için doğru cevap yapar: demirbaşlar, raflar, iş emirleri.

### Kontrol hanesi nedir ve araç neden bir tane ekledi?

Bir perakende barkodunun, kendinden öncekilerden hesaplanan son hanesidir; böylece bir tarayıcı yanlış okumayı doğru okumadan ayırabilir. EAN-13 on iki hane ister ve on üçüncüyü hesaplar; UPC-A on bir ister ve on ikinciyi hesaplar. Kısa numarayı yazın, bu sayfa onu eklesin. Tam numarayı yazın, verdiğinizi denetlesin — ve sessizce düzeltmek yerine reddetsin; çünkü sessizce düzeltilmiş yanlış bir hane, başkasının ürünü olarak taranan bir etiket demektir.

### Bir QR kodun ortasına logo koyabilir miyim?

Burada değil; ama başka yerlerde işe yaramasının sebebi bilinmeye değer: onu mümkün kılan hata düzeltmesidir. H seviyesinde modüllerin kabaca %30'u yok edilebilir ve kod yine okunur; yani merkezde — hiçbir tanıma deseninin bulunmadığı yerde — bundan azını kaplayan bir logo, onarılabilir bir hasardır. Kodu H seviyesinde alıp görsel düzenleyicinizden geçirin, logoyu alanın yaklaşık beşte birinin altında tutun ve ona güvenmek yerine gerçek bir telefonla deneyin.

### SVG neden PNG'den iyi?

Çünkü bir kod kenarlardan oluşur ve bir PNG'nin onları yapacak sabit sayıda pikseli vardır. Bir tanesini büyütün, her kenar yumuşar; yumuşak bir kenar ise bir tarayıcının tam da zorlandığı şeydir ve 1200 dpi'lık bir yazıcıya 512 piksellik bir PNG vermek, ondan aradaki farkı uydurmasını istemektir. Bir SVG, kareleri talimat olarak taşır; yani bir kartvizitte de bir bilbordda da keskin basılır. Buradaki PNG, modül başına tam sayıda pikselle çizilir ki bir PNG'nin yapabileceğinin en iyisi budur.

### Çevrimdışı çalışıyor mu?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin, çalışmaya devam eder. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yolu: metninizi bir kod çizilsin diye uzağa gönderen bir araç, siz fişi çeker çekmez dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Yazdığınız şeyin gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Bir Wi-Fi şifresinin toplanabileceği bir uç nokta burada yok, olsaydı bile onu gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** `src/` içinde hiçbir yerde `fetch`, `XMLHttpRequest` ya da `sendBeacon` yok. Kod, dizeden aritmetikle kurulur ve bu sayfada, sizin makinenizde bir SVG olarak çizilir.
- **Kod bizi işaret etmez.** Yazdığınız şey, kodun taşıdığı şeydir. Birkaç ücretsiz üreteç size, kendi sitelerine bir bağlantı içeren ve oradan sizinkine yönlendiren bir kod verir — yani her tarama onlar tarafından sayılır ve alan adının parasını ödemeyi bıraktıkları ya da ücretsiz katmanın bittiğine karar verdikleri gün kod çalışmayı durdurur. Burada hiçbir şey kısaltmaz, yönlendirmez ya da izlemez: sayfada gösterilen dize, resimdeki dizedir.
- **PNG, ekrandaki SVG'den üretiliyor.** İndirme, ön izlemeyle uyuşmayabilecek ikinci bir çizim değildir. Aynı biçimlendirme tarayıcıya verilir ve bir tuvale boyanır; bunun hiçbir şeyle iletişim kurmadan yapılabilmesinin sebebi de budur: getirilecek bir yazı tipi ve içinde yüklenecek bir görsel yoktur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi de Buy Me a Coffee'den geliyor. Hiçbirine yazdığınız hiçbir şey verilmiyor. Bir dizeyi koda çeviren her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde en baştan beri bir ağ adımı yoktu. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, QR kodun kendisi için `src/qr-encode.js` ve `src/qr.js` — kipler, sürüm ve bloklar birinde; desenler, maske ve biçim bitleri diğerinde — hata düzeltmesi için `src/gf256.js` ve çizgili olanlar için `src/barcode.js`.
