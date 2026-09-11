# Fotoğrafı dönüştürmek üst verisini siler mi?

Bazen; ve iki cevap da insanları yakmıştır. Bir tuval üzerinden yeniden kodlamak her şeyi söker; özenli bir dönüştürücü her şeyi taşır; resim iki durumda da aynı görünür. Güvenilir tek hamle, tahmin etmeyi bırakıp dosyaya bakmaktır.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Bazen. Bir fotoğrafı dönüştürmek, boyutlandırmak ya da sıkıştırmak, araç resmi piksellerden yeniden kuruyorsa üst verisini siler; araç üst veriyi bile isteye taşıyorsa tutar — ve ekranda hangisinin olduğunu söyleyen hiçbir şey yoktur. Resim iki durumda da aynı görünür, çünkü üst veri zaten hiçbir zaman resmin parçası olmadı.

İki sonuç da şaşırtır; ters yönlerde. Biri konumun “şöyle bir boyutlandırmakla” silineceğine güvenir; konum sağ çıkar. Bir başkası çekim tarihinin format değişikliğini atlatacağına güvenir; tarih gitmiştir. İki yanılgının da devası aynıdır: aracın muhtemelen ne yaptığını tahmin etmeyi bırakmak ve dosyanın gerçekte ne içerdiğine bakmak.

## Yanında ne yolculuk ediyor, ve neden ayrı

Bir fotoğraf dosyası tek kapta iki şeydir: kodlanmış resim ve onun hakkında bir etiket bloğu — EXIF, çoğu kez yanında XMP ve bir renk profili. Etiketler genellikle fotoğrafın ne zaman çekildiğini, makineyi ve objektifi, pozlamayı, durduğunuz yerin GPS koordinatlarını ve sıklıkla gömülü küçük bir önizlemeyi taşır — bazen resmin bir düzenlemeden *önceki* hâlinin önizlemesini; bir kırpmanın tam da kırptığı şeyi kaçırabilmesi bundandır. O bloğun tam turu [EXIF rehberinde](https://abox.tools/tr/rehberler/exif-ve-gps-verisini-silme/).

Her şeyi belirleyen nokta: etiketler piksellerin *yanında* durur, içinde değil. Resmi çözen araç, piksel alır, etiket almaz; dışarı yazdığı, geri koymayı seçtiklerinden ibarettir. Dosyayı yeniden kodlamadan düzenleyen araç ise etiketlere hiç dokunmayabilir — ya da tam olarak onları söküp başka hiçbir şeye dokunmayabilir.

## Yeniden kodlamak neden söker, kopyalamak neden tutar

Tarayıcıdaki resim işlerinin çoğu bir tuvalden geçer: dosyayı ham piksellere çöz, dönüştür, taze bir dosya kodla. Tuval etiket taşımaz; taze dosyada da olmaz — ilke gereği değil, yapı gereği. Buradaki [resim sıkıştırıcının](https://abox.tools/tr/resim-sikistirma/) ve [resim boyutlandırıcının](https://abox.tools/tr/resim-boyutlandirma/) çıktılarında EXIF, GPS ve XMP olmamasının sebebi budur ve sayfaları bunu söyler: kaçınılmazdır — ve çekim tarihini tutmak istiyorduysanız bilmeye değer.

Bir dönüştürücü ise korumak için özel çaba harcayabilir. Bu sitenin [HEIC'ten JPG'ye dönüştürücüsü](https://abox.tools/tr/heic-jpg-donusturme/) tam olarak bunu yapar: üst veri bloğunu HEIC kabından kaldırıp JPEG'e yerleştirir; tarihler, GPS, hepsi — çünkü dönüştürme, aynı fotoğrafın başka bir palto giymesi olmalıdır. (Bir etiket bilerek yeniden yazılır: yön, resim yan yatmasın diye; ve blok yalnızca JPEG çıktısına sığar — format menüsü bunu söyler.) İki dürüst araç, iki zıt davranış, ikisi de kendi işi için doğru — araç türünden tahmin yürütmenin işe yaramamasının sebebi tam da bu.

Tarayıcının dışında tablo aynı ölçüde karışıktır ve altında aynı mantık yatar. Ekran görüntüleri ve dışa aktarmalar taze kodlamalardır: makine üst verisi yok. Mesaj uygulamaları sertçe yeniden sıkıştırır; fotoğraf olarak gönderilen fotoğraflar etiketlerini genellikle kaybeder — ama aynı dosya “belge olarak” gönderilirse bayt bayt yolculuk eder, etiketler dahil. E-posta ekleri ve bulut sürücüleri dosyaları değiştirmeden taşır. Desen tutar: yeniden kurulan söküktür, kopyalanan tutulmuştur.

## Varsaymak yerine denetlemek

Denetim bir dakikadan kısa sürer: çıktı dosyasını — orijinali değil — [EXIF görüntüleyici ve silicide](https://abox.tools/tr/exif-verisi-silme/) açın ve içinde ne olduğunu okuyun. Dosyayı kendi makinenizde ayrıştırır ve gömülü önizleme dahil her etiketi gösterir. İçinde bir şey yoksa, sızan da yoktur. Hâlâ oradaysa, tam olarak neyin orada olduğunu görürsünüz.

Yukarıdakilerin hepsinden üç alışkanlık çıkar:

- **Amaç mahremiyetse, bilerek silin.** Etiketleri EXIF aracıyla sökün — dosyayı yeniden kodlamadan düzenler, resim hiçbir şey kaybetmez — sonra sonucu denetleyin. Yan etki olarak söken bir boyutlandırmaya bel bağlamayın.
- **Amaç kaydı korumaksa, koruduğunu söyleyen bir araçla dönüştürün** — ve onu da denetleyin; çünkü “herhalde tutmuştur” öbür yönde de yanılır: tarihleri uçup gitmiş bir fotoğraf arşivi de bir kayıptır.
- **Gerçekten gönderdiğiniz dosyayı denetleyin**; zincirinizin son adımından sonra. Zincirdeki her araç kendi kararını verir ve yalnızca son dosyanın içeriği sayılır.

Ve denetleme aracının kendisi bir web sayfasıysa, alışıldık soru ona da sorulur — bir üst veri görüntüleyici fotoğrafınızı alır, GPS'iyle birlikte. Buradaki, hiçbir şeyi hiçbir yere göndermeden tamamen tarayıcınızda çalışır ve [yükleme rehberi](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) bu iddiayı inanmak yerine nasıl doğrulayacağınızı gösterir.
