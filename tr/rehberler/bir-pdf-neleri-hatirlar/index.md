# Bir PDF neleri hatırlar

Sayfalarından fazlasını. Bir PDF çoğu kez yazarının adını, onu üreten yazılımı, PDF olmadan önce olduğu dosyayı taşır — ve çok yaygın belli bir yöntemle düzenlendiyse, kendisinin her eski sürümünü, silinenler dahil. Bunların hiçbiri ekranda görünmez.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Bir PDF, sayfalarının resmi değildir. Bir konteynerdir ve sayfalar, yükün yalnızca gösterilen kısmıdır. Çevrelerinde biçimin şunlara yeri vardır: bir belge bilgisi bloğu, aynısının ikinci bir XML kopyası, yorumlar, form verileri, iliştirilmiş dosyalar — ve düzenlemeleri kaydetmenin çok yaygın bir yolu üzerinden, belgenin eksiksiz eski sürümleri, güncel olanın altında istiflenmiş halde.

Bunların hiçbiri kusur değil. Her parça makul bir iş için tasarlandı ve tek bir kurumun içinde çoğu zararsız, hatta işe yarardır. Sorun sınır geçişidir: bir PDF evden çıktığı anda — karşı tarafa, bir dağıtım listesine, kamuya açık bir dosyaya — hatırladığı her şey onunla gider ve hatırladıklarını hiçbir sayfa göstermez. İnsanlar belgenin ne dediğini denetler, dosyanın ne içerdiğini gönderir; bunlar iki ayrı şeydir.

## Yaka kartı: /Info ve XMP paketi

Her PDF bir belge bilgisi sözlüğü taşıyabilir: yazar, başlık, oluşturma ve değiştirme tarihleri, onu oluşturan ve üreten programların adları. Çoğu, aynı gerçeklerin daha zengin ikinci bir kopyasını gömülü XML olarak taşır; adı XMP. İkisi de sayfalarla birlikte gösterilmez; ikisi de bir özellikler paneli uzaklıktadır.

Değerler kendiliğinden dolar; onları sızdıran da budur. *Yazar* çoğu kez işletim sisteminin kurulduğu hesabın adıdır: gerçek, tam bir ad; hem de sahiplerinin anonim sandığı belgelerde: başvurular, değerlendirmeler, şikayetler, teklifler. *Başlık* genellikle PDF'in dışa aktarıldığı belgenin dosya adıdır; böylece `Taslak-v7-hukuki-cekinceler.docx`, yerine geçmesi gereken cilalı PDF'in içinde yaşamaya devam eder. Üretici satırı yazılımı tarihler; tarihler resmi anlatıları yalanlar. Kurumsal PDF'lerin bu blokta neler itiraf ettiği üzerine koca incelemeler yazıldı.

## İstenmeyen geri getirme: artımlı kayıtlar

Konteynerdeki en keskin parça, biçimin en çok övündüğüdür. PDF, *artımlı güncellemeleri* destekler: dosyayı yeniden yazmak yerine bir düzenleyici, değişikliklerini sona ekleyebilir ve öncesindeki her şeyi el değmemiş bırakabilir. Görüntüleyici dosyayı sondan okur ve en yeni sürümü gösterir; eskiler hâlâ oradadır, bayt bayt, aynı dosyanın içinde.

Ekleyerek kaydetmek hızlıdır ve çökmeye dayanıklıdır — ve bu, böyle düzenlenmiş bir belgenin kendi tarihçesini içerdiği anlamına gelir. “Silinen” metin gitmemiştir: yerini yenisine bırakmıştır ve onu geri almak, dosyayı son eklemeden önceki hâliyle okumaktan ibarettir. Artımlı kaydeden bir düzenleyicide bir adın üstüne çekilen siyah dikdörtgen, o adı *iki kez* içeren bir dosya üretir — bir kez dikdörtgenin altında, bir kez tarihçede — ki bu da [karartma rehberindeki](https://abox.tools/tr/rehberler/karartilmis-metin-geri-getirilebilir-mi/) başarısızlığı ikiye katlar.

Deva, baştan sona yeniden yazmaktır: dosyayı aç, güncel sürümün gerçekten kullandığını tut, geçmişi olmayan yeni bir dosya yaz. Buradaki [PDF sıkıştırıcı](https://abox.tools/tr/pdf-sikistirma/) bunu yapısı gereği yapar: yeniden yazmak, tarihçeyi bırakmadan edemez ve araç, geride bıraktığı geçersiz malzemeyi boyut dökümünde sayar — bu da dosyanızın bir tarihçesi olduğunu keşfetmenin en kolay yoludur.

## Ambar: yorumlar, alanlar, ekler, katmanlar

Hafızanın kalanı daha sıradandır ve yine sızar:

- **Yorumlar ve açıklamalar**: inceleme sohbeti, incelenen belgeyle birlikte yolculuk eder; bakmayı akıl eden herkese görünür.
- **Form alanları**, düzleştirilmiş bir sayfa artık göstermese bile doldurulan değerleri veri olarak saklar.
- **Ekler**: bir PDF, her türden dosyayı bütün hâlde gömebilir ve görüntüleyiciler bunları çoğu insanın hiç açmadığı bir yan panelde gösterir. Grafiğin arkasındaki hesap tablosu bazen grafiğe iliştirilmiş gider.
- **İsteğe bağlı içerik katmanları**, kaldırılmak yerine kapatılmış sayfa içeriği taşıyabilir: bütünüyle mevcut, asla gösterilmiyor.

Bunların her biri, sayfalarına göre yargılanan bir dosyada, sayfaların göstermediği veridir.

## Bir PDF'i hafızası olmadan göndermek

Hepsinin ortak deseni şu: neyin sağ kalacağına dosyanın nasıl yazıldığı karar verir; öyleyse çare, onu unutkan yazan bir şeyden geçirmektir, kendi makinenizde — bir belgenin tarihçesi, bir yabancının sunucusuna yüklenmeyecek şeyin ta kendisidir; bu noktayı [yükleme rehberi](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) baştan sona işler. Bu sitenin üç aracı PDF yazar ve üçü de hafızayı dışarıda bırakmak üzere kuruldu:

- [PDF birleştirme ve bölme aracı](https://abox.tools/tr/pdf-birlestirme/), çıktısını **hiçbir bilgi sözlüğü olmadan** yazar: yazar yok, tarih yok, yazılımı adlandıran satır yok. Orijinallerinizden kopyaladığı, sayfalarının kullandığıdır; bagajları değil. [Rehberi var](https://abox.tools/tr/rehberler/pdf-birlestirme-ve-bolme/).
- [PDF sıkıştırıcı](https://abox.tools/tr/pdf-sikistirma/) dosyayı bütünüyle yeniden yazar — geçersiz tarihçe bırakılır, XMP paketi ve özel uygulama verileri tutulmaz — ve neyi çıkardığını kalem kalem döker. O da [rehberli](https://abox.tools/tr/rehberler/pdf-boyutunu-kucultme/).
- [PDF karartma aracı](https://abox.tools/tr/pdf-karartma/), hafızanın bizzat mesele olduğu durumlar için: her çalışmada, karartmanın kendisinin yanında bilgi bloğunu, XMP paketini, yer imlerini, yorumları, alan değerlerini ve ekleri de temizler — [rehberi](https://abox.tools/tr/rehberler/pdf-karartma/) hepsini adım adım gezer.

Kabul testi de sızıntıyı aynalar: sayfaları değil, dosyayı yargılayın. Özellikler panelini açıp geriye ne kaldığını okuyun; ham dosyada çıkardığınız bir kelimeyi arayın; belgenizin neler taşıdığına dair sıkıştırıcının dökümüne bakın. Hafızası olmayan bir PDF'in, okuyanı kim olursa olsun, itiraf edecek hiçbir şeyi yoktur.
