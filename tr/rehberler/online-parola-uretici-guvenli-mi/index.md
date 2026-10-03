# Online parola üretici kullanmak güvenli mi?

Kuşkunuz yerinde, elden bırakmayın: parola üreten sayfa, parolaları aklında tutmaması gereken sayfanın ta kendisidir. İyi haber şu ki bu denetlenebilir — rastgelelik sizin makinenizde doğar, gönderim görünürdür ve ürettiğini saklayan bir üretici suçüstü yakalanabilir.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Bu sorunun ardındaki kuşku tam olarak yerinde; onu elden bırakmayın. Parola üreten bir sayfa, web'de alacak hassas hiçbir şeyi olmayan ama *saklayacak* her şeyi olan tek sayfadır: çıktısı sırrın kendisidir ve ürettiğini ileten bir üretici zayıf bir araç değil, bir parola koleksiyonu olurdu. Soru hiçbir zaman bir üretici sayfasının güvenilir görünüp görünmediği değildir. Soru, isteseydi parolayı saklayıp saklayamayacağıdır — ve bu, alışılmadık biçimde, denetlenebilir.

Üç şey belirler: rastgelelik nereden geliyor, sonuç sayfadan çıkabiliyor mu ve sonucun herhangi bir yanı öngörülebilir mi. Üçünün de bir ziyaretçinin doğrulayabileceği dürüst cevapları var — kimsenin içine bakamadığı bir pencerede üreten indirme bir uygulama için söylenebileceğinden fazlası.

## Tarayıcı rastgeleliği nereden gelir

Tarayıcıdaki her ciddi üretici aynı kuyudan çeker: `crypto.getRandomValues`, tarayıcının kriptografik rastgele sayı üreteci; işletim sistemi tarafından donanım gürültüsünden tohumlanır ve sürekli yeniden tohumlanır. Tarayıcının TLS anahtarlarını çektiği kaynağın aynısıdır — banka bağlantınızın üzerinde koştuğu şifreleme. Bir masaüstü programın bir web sayfasından daha iyi rastgeleliğe eriştiği söylenebilecek anlamlı hiçbir durum yoktur; ikisi de aynı sistem kuyusunda son bulur.

Bir sayfanın kullanmaması gereken şeyse `Math.random()`, zar atmanın gündelik fonksiyonudur. Tarayıcılar onu, iç durumu art arda birkaç çıktıdan yeniden kurulabilen hızlı bir üreteçle gerçekleştirir — üzerine kurulan parolalar rastgele görünür ve birini görmüş herkes için hesaplanabilirdir. Bu kuramsal değil; piyasadaki üreticilere karşı birden çok kez gösterildi. Üstelik dışarıdan görünmez, ki bu da kodu okunabilen üreticilerin en güçlü savıdır: iki fonksiyon arasındaki fark, kaynakta tek bir kelimedir.

Bunun ötesinde daha ince bir özen basamağı var. Rastgele 32 bitlik kelimelerden basit kalanla “26'nın altında bir sayı” türetmek, düşük harflere doğru çok hafifçe eğiktir; özenli bir üretici kalanı almak yerine yeniden çeker. [Buradaki üretici](https://abox.tools/tr/sifre-olusturucu/) bunu yapar — kaçındığı eğiklik yaklaşık 165 milyonda birdir; kullanımda görünmez ve iş için yapılmış bir aracı forumdan yapıştırılmış bir koddan ayıran türden bir ayrıntıdır.

## Kötü bir üretici sayfası ne yapabilir

Bozulma biçimlerini açıkça adlandıralım, çünkü her biri denetlenebilir:

- **Parolayı dışarı göndermek.** Sayfa yerelde üretir, sonra ürettiğini postalar — tıklamayla, istatistikle ya da sonradan toplu hâlde. Eleyen kusur budur ve görünürdür: bir ağ isteği olmak zorundadır ve istekler izlenebilir.
- **Sunucuda üretmek.** Parola ağ üzerinden çıkmak yerine ağ üzerinden gelir — yani işletmeci onu önce görmüştür ve nasıl yapıldığı hakkında hiçbir şey öğrenemezsiniz. Aynı denetim, ters yön.
- **Zayıf üretmek.** `Math.random`, zaman damgasından tohum, güçlü diye satılan birkaç yüz kelimelik liste. Bunu hiçbir Ağ sekmesi yakalamaz; ancak okunabilir kaynak yakalar ya da gerçek ayarlardan sayılmış dürüst bir güç göstergesi.
- **Geçmiş tutmak.** Son yirmi parolanızı yardımsever bir edayla hatırlamak — sekmeden uzun yaşayan bir depoda, belki ortak kullanılan bir makinede.

Bu sitedeki [parola ve parola cümlesi üretici](https://abox.tools/tr/sifre-olusturucu/) dördüne karşı da yapısı gereği korunaklıdır: `crypto.getRandomValues` ve başka hiçbir şey, üretim sayfanın içinde, hiçbir türde saklama yok, geçmiş yok ve ayarlarınızla tam olarak kaç sonucun mümkün olduğunu bildiren bir güç satırı var. Parola cümleleri için kelime listeleri EFF'in Diceware listeleridir; aracın kendi klasöründe, değiştirilmeden gelir.

## Her üreticiyi denetlemenin yolu, bu dahil

Yöntemin tamamı [yükleme rehberinde](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) yazılı; herkesten önce uygulanacak sayfa da budur:

- **Önce fişi çekin.** Sayfayı yükleyin, çevrimdışı olun, *sonra* üretin. Bağlantı yokken doğan bir parola dışarıdan getirilmiş olamaz ve doğduğu anda gönderilmiş de olamaz. Bu sayfa çevrimdışı da çalışmaya devam eder; zaten anlamı bu.
- **Üretirken Ağ sekmesini izleyin.** Düğmeye basın ve listeye bakın: hiçbir şey ayrılmamalı. Sonra parolayı kopyalayın ve yeniden bakın — kopyalama, dürüst olmayan bir sayfanın seçeceği andır.
- **Bir koleksiyonun neye ihtiyaç duyacağını arayın.** Bir hesap, bir eşitleme özelliği, bir “son üretilenler” listesi. Hafızası olan üreticinin kopyası vardır.

Sona dürüst bir çekince yakışır. Bir denetim, sayfa siz bakarken ne yaptıysa onu söyler; yayımlanmış ve okunur hâlde sunulan kod — bu sitedeki her şey gibi — genelde ne yaptığını söyler. Geriye makinenin kendisi kalır: hiçbir web sayfası bir parolayı ele geçirilmiş bir tarayıcıdan ya da tuş kaydeden zararlıdan koruyamaz; üretici de istisna değildir. Denetimlerin kazandırdığı daha küçük ve gerçektir — hiçbir sunucunun görmediği, okumanıza izin verilen bir aritmetiğin yaptığı bir parola.
