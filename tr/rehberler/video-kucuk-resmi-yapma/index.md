# Tam istediğiniz kareden video küçük resmi nasıl yapılır

Küçük resimle ekran görüntüsü arasındaki fark aşağı yukarı çeyrek saniyedir: gözlerin açık olduğu ve topun hâlâ havada durduğu kare. O kareye, platformun boyutunda, bayt sınırının altında ulaşmak, tamamı tarayıcınızda çalışan üç adımlık bir zincirdir.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

1. **Kareyi alın.** [Kare yakalayıcıyı](https://abox.tools/tr/videodan-kare-yakalama/) açın, videoyu içine bırakın ve dosyanın kendi kare listesi boyunca tam ana kadar ilerleyin. PNG olarak kaydedin: kayıpsız kopya; böylece henüz hiçbir karar verilmemiş olur.
2. **Kareyi çerçeveleyin.** PNG'yi [Görsel boyutlandırıcıya](https://abox.tools/tr/resim-boyutlandirma/) götürün: platformun biçimine kırpın — YouTube için 16:9 — ve uzun kenarı sabitleyin; 1280 piksel, YouTube'un gerçekten istediği sayıdır.
3. **Tavana oturtun.** [Görsel sıkıştırıcıda](https://abox.tools/tr/resim-sikistirma/) platformun sınırını hedef olarak verin — YouTube küçük resmi için 2 MB — ve JPEG mi WebP mi seçeceğine o karar versin.

Zincirin hiçbir halkası hiçbir şey yüklemez — video yayımlanmamışken bu önemlidir ve küçük resim zaten video henüz herkese açık olmadığı için yapılır.

## Kare kare ilerlemek duraklatmayı neden yener

Oynatıcıyı duraklatıp ekran görüntüsü almak iki kez kaybettirir. Duraklama, oynatıcının durabildiği yere düşer — en yakın nokta, kastettiğiniz kare değil — ve ekran görüntüsü oynatıcının fotoğrafıdır: onun çözünürlüğü, onun arayüzü, onun renk işleyişi; dosyanınki değil.

Yakalayıcı ise dosyanın kendi kare listesinde, iki yönde de birer kare ilerler ve size çözülmüş karenin kendisini, videonun tam çözünürlüğünde teslim eder. Anın iki yanında çeyrek saniyelik bir arama, küçük resmin genellikle oturduğu yerdir: bariz iki karenin *arasındaki*, hareketin okunduğu ve hiçbir şeyin bulanmadığı kare.

Nihai küçük resim JPEG ya da WebP olacaksa bile yakaladığınızı PNG olarak kaydedin. PNG karenin birebir kopyasıdır; kayıplı her karar böylece iki kez üst üste binmek yerine, en sonda, bir bayt bütçesinin içinde, bir kez verilir.

![Zaman kodu görünen bir videodan donuk bir kare; yanında adım ve sürgü kumandaları ile alındığı tam an.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Duraklatıp ekran görüntüsü almak yerine kareye adım adım gitmek. Farkın gerçekte ne olduğunu yukarıdaki bölüm söylüyor.

## Platform aritmetiği

Sıkıştırmadan önce kırpın; [fotoğraf rehberinin](https://abox.tools/tr/rehberler/fotograflari-web-icin-hazirlama/) verdiği gerekçe aynıdır: bütçe piksellerdir. 4K bir kareden alınan 16:9 kırpım ⁦1280×720⁩'ye indirildiğinde, sıkıştırıcı 2 MB'ını kimsenin gözünü kısmasına gerek kalmayacak kaliteye harcar. Boyutlandırıcının kırpma çerçevesi 16:9'a kilitlenir, yani biçim bir sürüklemedir, hesap değil; yazı ve yüzler ortadaki üçte ikide kalmalıdır, çünkü akışlar köşeleri yuvarlar ve süreyi sağ alta bindirir.

![Boyutlandırıcıda 1280 genişlik ve 720 yükseklik yazılı, altında donuk karenin nasıl çıkacağının özeti.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

Ardından aritmetik: platform ne isterse, iki sayı olarak yazılmış.

## An bulunamıyorsa: kontak baskı

Doğru an on dakikalık görüntünün içinde bir yerdeyse, yakalayıcının diğer kipi her N saniyede bir kare kaydeder ve topunu ZIP olarak verir. Kareleri bir kontak baskı gibi gözden geçirin, en yakınının zamanını not edin ve oradan kare kare ilerleyin. Çubuğu ovalamaktan hızlıdır ve platform başka bir biçim istediği gün için elinizde bir aday klasörü kalır.

## Bunu her hafta yapıyorsanız

Adımların burada üç sayfada yaşaması bilinçli bir tercihtir: her sayfa tek bir iş yapar ve her biri hiçbir şeyin makinenizden ayrılmadığını tek başına kanıtlayabilir. Ama her adım açık kaynaktır: MIT lisansı, araç başına bir klasör, çözücüyü, yeniden örneklemeyi ve bayt hedefi aramasını anlatan README'lere sahip bağımlılıksız ES modülleri.

Küçük resim haftalık bir teslimatsa, bir kod aracısını [depoya](https://github.com/A-Box-of-Tools/website) yönlendirin ve tek sayfalık sürümü isteyin: kare kare ilerle, sizin platform şablonunuza kırp, onun tavanına sıkıştır, tek düğme. Modüller okunmak için yazıldı ve onları alıp götürmek, lisansın tam da var olma nedenidir.
