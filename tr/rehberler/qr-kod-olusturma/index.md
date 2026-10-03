# Bir başkasının telefonunda da okunan bir QR kod nasıl yapılır

Bir QR kod yapmak bir saniye sürer. Islanmış bir menüde, bir otobüs durağında ya da kötü ışıkta kol boyu tutulmuş bir telefonda çalışan bir tane yapmak dört karar gerektirir ve dördü de siz bir şey basmadan önce verilir. İşte her birinin ne yaptığı.

[QR ve Barkod Üreteci aracını açın](https://abox.tools/tr/qr-kod-olusturma/): Yazın, koda dönüşsün. Bir tane üretmek için hiçbir şey gönderilmez.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[QR ve Barkod Üreteci](https://abox.tools/tr/qr-kod-olusturma/)'ni açın, bağlantınızı yapıştırın, düzeyi **M**'de ve kenar boşluğunu **4**'te bırakın ve SVG'yi indirin. En az iki santimetre genişliğinde, mat bir şeye, açık üzerine koyu basın. Sonra bin tane sipariş etmeden önce basılı olanı sizinki olmayan bir telefonla okutun.

Bu, neredeyse her durumu kapsar. Bu sayfanın geri kalanı, durum bunlardan biri olmadığında ne yapacağınızdır: elden ele geçmeye dayanması gereken bir kod, üzerinde logo olan bir kod, küçük bir şeye gidecek bir kod ve bir yıl sonra öğreneceğiniz biçimde yanlış yapılması kolay olan tek karar.

## Bir QR kodun içinde gerçekte ne var

Bir dizge. Tamamı bu. Bir QR kodu okutmak telefona bir metin parçası verir ve geri kalan her şey — bir sayfa açmak, bir ağa katılmak, bir kişiyi kaydetmeyi önermek — telefonun o metnin şeklini tanıyıp ona göre işlem önermesidir.

Yani bir kod türü olarak "Wi-Fi QR kodu" diye bir şey yoktur. İçinde `WIFI:T:WPA;S:Ağım;P:parola;;` tutan bir QR kod vardır ve son on yılda yapılmış her telefon bunu nasıl okuyacağını bilir. Üretecin size bitmiş dizgeyi göstermesinin sebebi tam olarak budur: bir kod beklediğinizi yapmadığında bakmaya değen tek şey dizgedir.

Bu aynı zamanda bir QR kodun basıldıktan sonra değiştirilemeyeceği, eve haber veremeyeceği ve süresinin dolamayacağı anlamına gelir — biri içine kendi sunucusuna giden bir bağlantı koymadıysa; ki buradaki son bölümün konusu da odur.

![Bitmiş bir QR kodu, altında bilgileri: sembolojisi, sürümü, hata düzeltme düzeyi ve taşıdığı karakter sayısı.](https://abox.tools/screens/make-a-qr-code/result.webp)

Kodun içinde ne olduğu, bu rehberin geri kalanının kullandığı terimlerle. Sürüm içerikle birlikte büyür, altındaki iki ayarın önemi de bundandır.

## Birinci karar: hata düzeltme düzeyi

Bir QR kod, verinin yanında bir denetim kod kelimeleri kümesi taşır; bunlar bir okuyucunun göremediğini yeniden kurabilmesi için hesaplanmıştır. Bir köşesi kopmuş bir kodun hâlâ okunmasının sebebi budur. Bu kod kelimelerinin kaç tane olduğu düzeydir ve dört tanedir:

- **L** — kodun yaklaşık %7'si kaybedilebilir.
- **M** — yaklaşık %15.
- **Q** — yaklaşık %25.
- **H** — yaklaşık %30.

Daha fazla düzeltme bedava değildir: denetim verisi aynı karenin içine girer, yani aynı metin H'de L'dekinden daha büyük ve daha yoğun bir kod ister. Kabaca, L'den H'ye geçmek aynı dizge için modül sayısını iki katına çıkarır ve daha yoğun modülleri bir kameranın ayırt etmesi zorlaşır. Burada gerçek bir takas vardır ve cevap kodun nereye gideceğine bağlıdır.

**L** bir ekran içindir: bir slayttaki, bir e-postadaki, bir web sayfasındaki kod. Ona hiçbir şey zarar vermeyecektir ve her fazladan modül uzaktan okunmasını zorlaştırır.

**M** varsayılandır ve çoğu baskı için doğru cevaptır. Biraz elden geçecek kâğıt, bir broşür, bir kartvizit.

**Q ve H**, hırpalanacak kodlar içindir: her gün silinen bir menü, bir atölyedeki makinenin üstündeki bir etiket, bir kasanın üstündeki bir etiket, doğrudan güneş alan bir vitrindeki kod. H, aynı zamanda ortadaki bir logoyu mümkün kılan şeydir — aşağıya bakın.

![QR seçenekleri: ortaya ayarlı bir hata düzeltme düzeyi menüsü ve dört modüllük bir sessiz alan.](https://abox.tools/screens/make-a-qr-code/options.webp)

İkisi de kodun gerçek dünyada, bir kırışıkta, bir logoda, kötü bir baskıda ayakta kalmasıyla ilgilidir ve ikisi de çizilmeden önce belirlenir.

## İkinci karar: kodun bir parçası olan kenar boşluğu

Bir QR kodun etrafındaki beyaz boşluk bir dolgu değildir ve bir tasarım tercihi de değildir. Bir okuyucu, sembolün nerede bittiğini bulmak için onu kullanır. Belirtim her kenarda dört modül sessiz alan ister ve kenarına kadar kırpılmış bir kod, basılı bir kodun çuvallamasının en yaygın tek sebebidir.

Bu konuda açık sözlü olmaya değer; çünkü kırpmak son derece doğal bir davranıştır. Kodun etrafında fazla beyaz varmış gibi görünür, o yüzden düzende kırpılır ya da karelerin dibine kadar gelen renkli bir panelin üstüne konur ya da bir fotoğrafın üstüne yerleştirilir. Bunların her biri, okuyucunun kullanacağı sınırı ortadan kaldırır.

Kod kenar boşluğuyla birlikte fazla büyük görünüyorsa kodu küçültün. Kenar boşluğunu kaldırmayın.

## Üçüncü karar: ne kadar büyük basılacağı

Gerçekle temastan sağ çıkmış kaba kural **bire on**'dur: bir kodun, okunacağı mesafenin yaklaşık onda biri kadar geniş olması gerekir.

- 30 cm'den okunan bir kartvizit ya da menü: yaklaşık 2 cm.
- İki metreden okunan bir afiş: yaklaşık 20 cm.
- Beş metreden okunan bir otobüs durağı ya da vitrin: yaklaşık 50 cm.

İki santimetre bir hedef değil bir tabandır. Yaklaşık 1,5 cm'nin altında, baskı ne kadar iyi olursa olsun sıradan bir telefon zorlanmaya başlar; çünkü tek tek modüller kamerasındaki bir pikselin boyutuna yaklaşır.

Daha az metin, daha az modül, dolayısıyla belirli bir basılı boyut için uzaktan okunan bir kod demektir — bir kodu, sonunda yüz karakterlik izleme parametresi olan bir adres yerine `example.com/x`'e yöneltmek için iyi bir sebep.

Ve **SVG**'den basın. Bir QR kod kenarlardan oluşur ve bir PNG'nin onları oluşturacak sabit sayıda pikseli vardır; birini büyütün, her kenar yumuşasın; ki bir okuyucunun zorlandığı şey tam olarak budur. Bir SVG ise kareleri talimat olarak taşır, yani bir kartvizitte de bir bilbordda da keskin çıkar.

## Renk, karşıtlık ve iki hata

Bir okuyucu koyu modüllerle açık olanlar arasındaki farkı ölçer, yani karşıtlık işin tamamıdır. İki şey düzenli olarak ters gider:

**Koyu arka plan üzerine açık kod.** Çarpıcı görünür ve epeyce okuyucu bunu düpedüz reddeder: koyu üzerine açık arıyorlardır ve tersini denemezler. Bazıları dener. Müşterilerinizin hangisine sahip olduğunu bilemezsiniz.

**Yeterince fark olmaması.** Beyaz üzerine orta gri ya da benzer ağırlıkta iki marka rengi, ekranda gayet iyi ölçülebilir ve mürekkep yayılması ile bir telefonun otomatik pozlaması işin içine girdiğinde kâğıtta çuvallayabilir. Bir kodu renklendiriyorsanız koyu kısmı gerçekten koyu tutun.

Bir ışık altında okutulacak her şey için mat, parlağı yener ve ikisi de bir fotoğrafın üstüne basmayı yener. Saydam arka planlar bir kodu renkli bir panelin üstüne koymak için yararlıdır — ama arkasında gerçekte ne kaldığını denetleyin; çünkü koyu bir panelin üstündeki saydam bir kod, yukarıdaki ilk hatanın fazladan adımlarla yapılmış hâlidir.

## Ortadaki logo

Bu işe yarar ve hata düzeltmeye rağmen değil, onun sayesinde işe yarar. H düzeyinde modüllerin kabaca %30'u yok edilebilir ve kod yine de okunur; yani bundan azını kaplayan bir logo — ortada, hiçbir bulucu deseninin olmadığı yerde — okuyucunun onardığı bir hasardır.

Uyulacak üç şey. H düzeyini kullanın. Logoyu alanın yaklaşık beşte birinin altında, kuramsal sınırın epeyce berisinde tutun; çünkü payınızı yiyen tek şey baskı değildir. Ve köşelerdeki üç büyük kareyi ya da yanlarındaki küçükleri asla kapatmayın: bir okuyucunun sembolü en baştan bulup yönlendirme biçimi onlardır ve hiçbir miktarda hata düzeltme onları yeniden kurmaz.

Sonra gerçek telefonlarda deneyin. Bir logo, kodu "her zaman çalışır"dan "bu kadar payla çalışır"a taşır ve ne kadar pay kaldığını bilmenin tek yolu denemektir.

## İnsanların pişman olduğu karar: durağan mı, "dinamik" mi

Bir QR üreteci arayın; sonuçların çoğu sizden hesap açmanızı isteyecektir; çünkü *dinamik* kod satıyorlar. Dinamik bir kod sizin bağlantınızı içermez. Üretecin kendi sunucusuna giden kısa bir bağlantı içerir, o da sizinkine yönlendirir.

Size kazandırdığı şey gerçektir: kodun basıldıktan sonra nereyi gösterdiğini değiştirebilirsiniz ve her okutmanın sayısını alırsınız. Altı haneli bir baskı adedi olan bir kampanya için buna para ödemeye değer.

Bedeli de gerçektir ve sonradan değil önceden bilmeye değer:

- **Onlar durduğunda kod çalışmayı bırakır.** Hizmet kapanırsa, alan adının süresi dolarsa ya da ücretsiz kademe biterse bastığınız her kod ölür — ve o zamana kadar on bin menünün üstündedirler.
- **Her okutma bir başkasının verisidir.** Yönlendirme, kodunuzu okutan herkesin IP adresini, zamanını ve cihazını görür.
- **Bağlantı sizin değil onlarındır.** Okutan herkes tanımadığı bir alan adının geçip gittiğini görür ki insanlara şüphelenmeleri söylenen şey tam olarak budur.

Orta yol hiçbir şeye mal olmaz: *kendi alan adınızdaki* kısa bir adresin etrafına durağan bir QR kod koyun ve yönlendirmeyi kendiniz yapın. Hedefi değiştirme yeteneğini korursunuz, ölçümleri korursunuz ve kodla ilgili hiçbir şey, hiç tanışmadığınız bir şirketin gelecek yıl da var olmasına bağlı olmaz.

[Buradaki üreteç](https://abox.tools/tr/qr-kod-olusturma/) yalnızca durağan kod yapar ve açılacak bir hesabı yoktur. Ne yazarsanız kodun tuttuğu şey odur.

## Bin tane basmadan önce

Kodu okutun. Ekranınızdakini değil — basılı provayı, gideceği yerde, onu yaptığınız telefon olmayan bir telefonla. Bu bir dakika sürer ve bu sayfanın konusu olan sorun sınıfının tamamını yakalar: düzenin yediği bir kenar boşluğu, `https://`'i eksik bir bağlantı, kâğıtta başka türlü ölçen bir renk, bir masada işe yarayıp bir duvarda yaramayan bir boyutta basılmış bir kod.

Ve okutmadan sonra ne olduğunu denetleyin. Bir telefonda okunmayan bir sayfa açan kod, okunmuş olsa bile çuvallamış bir koddur.

## Bunların hiçbiri bir şey yüklemeyi gerektirmiyor

Bir QR kod, bir dizge üzerinde bir aritmetiktir. Gönderilecek bir dosya ve bir sunucunun yapıp bir tarayıcının yapamayacağı bir şey yoktur; [buradaki aracın](https://abox.tools/tr/qr-kod-olusturma/) hepsini kendi makinenizde yapmasının ve ağ fişi çekilmişken çalışmasının sebebi de budur.

Bu, kulağa geldiğinden önemlidir; çünkü insanlar QR kodların içine ne koyuyor. Wi-Fi biçiminin en yaygın kullanımı, bir web sayfasına yazılmış, bir ağın gerçek parolasıdır. O sayfanın onu gönderecek bir yeri olup olmadığını bilmeye değer.
