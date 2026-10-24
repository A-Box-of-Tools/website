# İki JSON dosyası nasıl karşılaştırılır

İki JSON dosyasını geldikleri gibi karşılaştırın; yanan şeylerin çoğu hiçbir şeydir: girinti, satır sarmaları, farklı sırada anahtarlar. Çare daha akıllı bir karşılaştırma değil — iki dosyayı önce aynı biçimlendiriciden geçirmektir; geriye yalnızca gerçek farklar kalır. İki adım da tarayıcınızda çalışır; içinde sırlar olan yapılandırma dosyalarının ait olduğu yer de orasıdır.

[Metin Karşılaştırma aracını açın](https://abox.tools/tr/metin-karsilastirma/): İki metin girer; her fark satır satır ve sözcük sözcük işaretlenmiş çıkar. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

1. [JSON Biçimlendirici](https://abox.tools/tr/json-bicimlendirme/)'yi açın, ilk dosyayı yapıştırın, girintiyi iki boşluğa ayarlayın ve *Her nesnenin anahtarlarını sırala* kutusunu işaretleyin. Sonucu kopyalayın.
2. [Metin Karşılaştırma](https://abox.tools/tr/metin-karsilastirma/)'yı açın ve soldaki kutuya yapıştırın.
3. Aynısını ikinci dosyayla, sağdaki kutuya yapın.

Şimdi yanan gerçektir: değişen bir değer, beliren bir anahtar, giden bir kayıt. Sıradan bir karşılaştırmayı boğacak olan biçimlendirme farkları ve yeri değişmiş anahtarlar yok; çünkü karşılaştırma başlamadan önce iki taraf da aynı yazımla yazılmıştı.

İki sayfanın da hiçbir ağ özelliği yok; bunu bilmekte yarar var: insanların karşılaştırdığı JSON, çok zaman içinde kimlik bilgileri hâlâ duran bir yapılandırma dosyasıdır.

## Ham bir JSON karşılaştırması neden neredeyse tamamen gürültüdür

JSON boşluğu umursamaz ve anahtar sırasına anlam yüklemez. Aynı belge bir satır da olabilir dört yüz satır da; anahtarlar yazıldıkları sırada da olabilir, bir kitaplığın yaydığı sırada da — ve araçlar ikisini de sormadan yeniden yazar. Bir taraf küçültülmüş, öbürü açılmış; biri elle kaydedilmiş, öbürü alfabetik sıralayan bir serileştiriciyle: satır karşılaştırması iki yabancı dosya görür.

En kötü iki durum meseleyi anlatır. **Küçültülmüş** dosya tek satırdır; ona karşı karşılaştırma tek ve devasa bir değişmiş satırdır: doğru ve işe yaramaz. **Aynı içeriği farklı sırada** taşıyan iki dosya ise her-şey-değişti diye karşılaştırılır; oysa dürüst yanıt “hiçbir şey” olurdu.

![Karşılaştırma seçenekleri: yan yana ya da satır içi görünüm, yalnızca değişen satırları gösteren bir anahtar ve boşlukları, büyük küçük harfi ve boş satırları yok sayan anahtarlar.](https://abox.tools/screens/compare-two-json-files/options.webp)

Bir dosya farklı satır sonlarıyla kaydedildi diye karşılaştırmanın her satırı bildirmesini engelleyen şey bunlardır.

## Biçimlendiricinin kurallı biçimi neyi düzeltir

İki dosyayı aynı ayarlarla aynı biçimlendiriciden geçirmek, bir karşılaştırmanın tam ihtiyacıdır: belge başına tek yazım.

- **Aynı girinti** her anahtarı kendi satırına koyar: karşılaştırma böylece satır satır çalışır ve sözcük işaretleri, bir satırın içinde değişen o tek değeri gösterebilir.
- **Sıralı anahtarlar** iki tarafı aynı sıraya sokar; sıra, fark olmaktan çıkar. Sıralama kod noktalarına göre değil, anahtarların okunuşuna göredir — `item2`, `item10`'dan önce — ve iki tarafa birebir aynı uygulanır.
- **Başka hiçbir şey kımıldamaz.** Bu biçimlendirici sayıları yazdığınız basamaklarla tutar ve yinelenen anahtarları çözmek yerine saklar: kurallı biçime sokmak kendi başına fark uyduramaz. [Biçimlendirici rehberi](https://abox.tools/tr/rehberler/json-yuklemeden-bicimlendirme/), bunun olması gerekenden neden daha ender olduğunu anlatıyor.

Dürüst bir çekince: sıralı çıktı, anahtarları yer değiştirmiş belgedir. İleride bir araç anahtar sırasına bakıyorsa — azı bakar ama vardır — sıralı kopyaları asılların yerine geçen şey olarak değil, karşılaştırılan şey olarak görün.

## Sonucu okumak ve yanında götürmek

Karşılaştırma silinen satırları solda, eklenenleri sağda işaretler ve değişen bir satırın içinde farklı sözcükleri vurgular: kurallı biçim üzerinde bu, çoğunlukla `false`'tan `true`'ya geçen o tek değerdir. Değişmeyen orta bir sayıya katlanır; iki bin satırlık, üç rötuşlu bir yapılandırma böylece üç kısa parça gibi okunur.

İndirilen, birleşik biçimde bir `.patch`'tir: kod incelemesinin anladığı biçim. Kurallı biçimleri anlatır; bir incelemenin zaten istediği de genellikle budur: değişiklik, yeniden biçimlendirme olmadan.

Aynı tarif, iki sayfanın konuştuğu diğer her şeyde işler. YAML ve XML aynı yolla kurallı biçime girer; farklı kaynaklardan gelmiş aynı biçimli iki dosya içinse karşılaştırmanın görmezden gelme anahtarları — boşluk, büyük-küçük harf, boş satırlar — aynı fikrin hafif halidir.

![Bir JSON yapılandırmasının iki sürümü yan yana, değişen satırlar işaretli: bir sürüm numarası, bir yeniden deneme sayısı, eklenmiş bir özellik ve eklenmiş bir bölge.](https://abox.tools/screens/compare-two-json-files/diff.webp)

Dört gerçek fark, başka da bir şey bildirilmemiş. Okumak kolay yarısı; işi yukarıdaki ayarlar yaptı.

## Bunu her hafta yapıyorsanız

İki kez biçimlendir, iki kez yapıştır: adımlar iki sayfada yaşar; çünkü her sayfa tek iş yapar ve her biri, yapıştırdığınız hiçbir şeyin hiçbir yere gitmediğini kendi başına kanıtlayabilir. Ama ikisi de açık kaynaktır: MIT lisansı, bağımlılıksız ES modülleri — biçimlendiricinin ayrıştırıcısı anahtar sırasını ve basamakları korur, karşılaştırma Myers algoritmasıdır — her biri kendini anlatan bir README ile.

Bu, gününüzün parçasıysa, bir kod ajanını [depoya](https://github.com/A-Box-of-Tools/website) yönlendirin ve karşılaştırırken kurallı biçime sokan iki kutulu bir sayfa isteyin: `parseJson`, `printJson` ve `compareText` üç import ötede. Modüller okunmak için yazıldı; onları alıp götürmek de lisansın tam olarak var olma sebebi.
