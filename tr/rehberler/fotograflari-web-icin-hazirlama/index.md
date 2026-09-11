# Telefon fotoğrafları web için nasıl hazırlanır

Bir telefon fotoğrafı yanlış biçimdedir, gerekenden dört kat büyüktür ve nerede oturduğunuzu bilir. Paylaşılır hale getirmek kısa bir zincirdir — dönüştür, kadrajla, sıkıştır — ve her adım kendi makinenizde çalışır; içinde GPS'iniz olan fotoğrafların ait olduğu yer de tam orasıdır.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

1. **Önce iPhone fotoğrafları:** HEIC dosyalarını [HEIC dönüştürücüden](https://abox.tools/tr/heic-jpg-donusturme/) geçirin ve üstveriyi dışarıda bırakmayı seçin. Daha hiçbir şey dönüştürülmeden, hangi fotoğrafların GPS koordinatı taşıdığını söyler. Zaten JPEG olan fotoğraflar bu adımı atlar.
2. **Kadraj ve boyut:** desteyi [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/)'ya bırakın. Uzun kenarı belirleyin — çoğu sayfa için 1600 piksel iyidir, okuyucular yakınlaştıracaksa 2000 — ya da tek tıkla bütün desteye aynı oranı uygulayın.
3. **Bütçeyi tutturun:** işi [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/)'da bitirin; kalite sürgüsü yerine kilobayt cinsinden hedef alır ve desteyi tek zip olarak geri verir.

Hepsi tarayıcınızda çalışır. Asıllar — tam çözünürlük, GPS ve hepsi — makinenizden hiç çıkmaz; bunu bir dönüştürme sitesi yerine yerelde yapmanın anlamı da budur.

## Üstveri nereye gider

Telefon fotoğrafının sessiz riski pikseller değildir; etiketlerdir. EXIF üstverisi kamerayı, zaman damgalarını ve — neredeyse her telefonda — fotoğrafın çekildiği yerin GPS koordinatlarını yazar. Bunu paylaşmak, ev adresinizi bakan herkesin okuyabileceği bir biçimde yayımlamak olabilir.

Bu zincirin işe yarar yanı, etiketleri kendi kendine halletmesidir. Boyutlandırmak da sıkıştırmak da görüntüyü piksellerden yeniden çizer ve yeniden çizilmiş pikseller etiket taşımaz: 2. ya da 3. adımdan çıkan her şey, siz istemeden temizdir. Karar isteyen iki durum:

- **HEIC dönüştürmek:** dönüştürücü üstveriyi yanında taşıyabilir ya da dışarıda bırakabilir — bir kutucuktur — ve hangi fotoğraflarda GPS olduğunu haber verir. Halka açık her şey için: dışarıda bırakın.
- **Boyutlandırmadığınız bir fotoğraf:** pikseller bayt bayt el değmemiş kalacaksa [EXIF düzenleyiciyi](https://abox.tools/tr/exif-verisi-silme/) kullanın; etiketleri görüntüyü yeniden kodlamadan kaldırır. [Üstveri rehberi](https://abox.tools/tr/rehberler/exif-ve-gps-verisini-silme/) uzun halidir.

## Neden sıkıştırmadan önce boyutlandırılır

Çünkü bütçe piksellerdir. 300 KB'lik bir yuvaya sığacak kadar sıkılmış 12 megapiksellik bir fotoğraf, aynı yuvaya nazikçe sıkıştırılmış 2 megapiksellik olandan gözle görülür biçimde kötü görünür: aynı kilobaytlar altı kat alana yayılır. Önce gösterim boyutuna karar vermek, sıkıştırıcının bütçesini kimsenin görmeyeceği çözünürlüğe değil kaliteye harcamasını sağlar.

Sıkıştırıcı hedefe başka türlü varılamıyorsa kendiliğinden de boyutlandırır; ama bunu son çare sayar. Kadrajı boyutlandırıcıda kendiniz yapmak, kararı — neyin kırpılacağı, hangi kenarın önemli olduğu — ait olduğu yerde tutar.

[Boyutlandırma rehberi](https://abox.tools/tr/rehberler/resim-boyutlandirma/) ile [sıkıştırma rehberi](https://abox.tools/tr/rehberler/resmi-hedef-boyuta-sikistirma/) kendi yarılarında derine iner; kalite sayılarının gerçekte neyi ölçtüğü de buna dahildir.

![Uzun kenara ayarlanmış boyutlandırıcı, 1600 yazılmış ve yanında hazır uzun kenarlar.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

Önce uzun kenar, çünkü dikey ve yatay bir fotoğrafa aynı biçimde davranan tek ayar odur.

## Bütün deste tek seferde

Zincirdeki her araç bir klasör dolusu dosyayı tek bırakışta alır: dönüştürücü seri çekimler dahil her HEIC'i yapar, boyutlandırıcı bütün sete tek kadraj uygular ya da her fotoğrafı ayrı kırpmanıza izin verir, sıkıştırıcı da hepsini tek zip olarak geri verir. Yirmi fotoğraf, dikkatinizden bir fotoğraftan pek fazlasını istemez: makine zamanı sizin makinenizindir ve herhangi bir yüklemeden daha kısa sürer.

![Üç sonuç satırı; her biri megabaytlardan yaklaşık 150 kB'a indirilmiş bir fotoğraf ve ulaştığı kalite.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

Ardından kalite, hepsi bir arada. Sıra önemlidir: yukarıdaki bölüm nedenini söylüyor.

## Bunu her hafta yapıyorsanız

Zincirin burada üç dört sayfada yaşaması bilinçli bir tercihtir: her sayfa tek iş yapar ve her biri hiçbir şeyin makinenizden çıkmadığını kendi başına kanıtlar. Ama her adım açık kaynaktır: MIT lisansı, araç başına bir klasör; çözücüyü, yeniden örneklemeyi ve boyut hedefi aramayı anlatan README'leriyle bağımlılıksız ES modülleri.

Fotoğraflarınız her seferinde aynı biçimi alıyorsa — aynı uzun kenar, aynı bütçe, aynı etiketler-gitsin — bir kod ajanını [depoya](https://github.com/A-Box-of-Tools/website) yönlendirin ve bu modülleri, ön ayarlarınız içine gömülü tek bir bırakma alanında birleştirmesini isteyin. Modüller okunmak için yazıldı; onları alıp götürmek de lisansın tam olarak var olma sebebi.
