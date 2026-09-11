# Bir indirme, sağlama toplamına karşı nasıl denetlenir

Bir indirme bağlantısının altındaki onaltılık satır, dosyanın el değmemiş geldiğini kanıtlayabilesiniz diye oradadır. Karşılaştırmak yaklaşık bir dakika sürer. Karşılaştırmanın ne değerde olduğunu — ve onu değersiz kılan tek alışkanlığı — bilmek bu sayfanın geri kalanını alır.

[Özet ve Sağlama Toplamı aracını açın](https://abox.tools/tr/saglama-toplami-hesaplama/): Bir indirmeyi, yayıncının bastığı sayıya karşı, kimseye göndermeden denetleyin.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Özet ve Sağlama Toplamı](https://abox.tools/tr/saglama-toplami-hesaplama/)'nı açın, indirdiğiniz dosyayı üzerine bırakın ve indirme sayfasındaki sağlama toplamını alttaki kutuya yapıştırın. Sayfa, sayının hangi algoritmadan geldiğini uzunluğuna bakarak bulur ve tek bir cümleyle cevap verir.

Eşleşiyorsa diskinizdeki baytlar, yayıncının ölçtüğü baytlardır. Eşleşmiyorsa dosyayı açmadan önce yeniden indirin. Aşağıdaki her şey, o cümlenin dışarıda bıraktığıdır.

## İndirme bağlantısının altındaki sayı nedir

Bir özet işlevinin çıktısıdır: bir dosyanın her baytını okuyan ve kısa, sabit uzunlukta bir cevap üreten bir hesap. Aynı dosya her zaman aynı cevabı verir ve tek bir bit farklı olan bir dosya tamamen başka bir cevap verir — neredeyse aynı olan biri değil, ilgisiz biri. Dayanılan özelliğin tamamı budur.

Cevap kısa, dosya kısa olmadığı için hesap bilgiyi atar ve herhangi bir cevabı paylaşan zorunlu olarak birçok dosya vardır. Bunlardan birini bilerek bulmak zor olan kısımdır ve ne kadar zor olduğu, aşağıdaki algoritmaları birbirinden ayıran şeydir.

Bir sağlama toplamıyla ilgili hiçbir şey gizli değildir ve hiçbir şey tersine çevrilebilir değildir. Bu bir parmak izidir; iki insan aynı şeyi ellerinde tuttukları konusunda anlaşabilsin diye yayımlanır.

## Hangi algoritmaya bakıyorsunuz

Seçmek zorunda değilsiniz — yayıncı zaten seçti ve sizin işiniz aynısını hesaplamak. Hangisi olduğunu yalnızca uzunluğundan anlarsınız:

- **32 onaltılık karakter** — MD5.
- **40** — SHA-1.
- **64** — SHA-256 ve en çok göreceğiniz budur.
- **96** — SHA-384.
- **128** — SHA-512.

İkisi de aynı uzunlukta değildir; aracın, yapıştırılan bir değeri kendisine söylenmeden tanıyabilmesinin sebebi de budur. 63 karakter uzunluğunda bir dizge hiçbir şeyin sağlama toplamı değildir; panonuza giderken bir karakterini kaybetmiş bir SHA-256'dır.

![Sonuç kartı: bir dosyanın MD5, SHA-1, SHA-256 ve SHA-512 özetleri, her birinin yanında kopyalama düğmesi.](https://abox.tools/screens/verify-a-file-checksum/digests.webp)

Hepsi bir arada, çünkü hangisinin kullanılacağına dosyayı yayımlayan karar verir, siz değil.

## Bunu tarayıcısız, kendi makinenizde yapmak

Her işletim sistemi bunu yapan bir şeyle gelir ve bunun için bir sayfa kullansanız bile komutu bilmeye değer — "sitenizin bunu dürüstçe hesapladığını nereden bileyim" sorusuna, aynı dosyayı bilgisayarınızla gelen araçtan geçirmekten daha iyi bir cevap yok.

**Windows**, PowerShell'de:

```
Get-FileHash .\disk.iso -Algorithm SHA256
```

Daha eski makinelerde bunun yerine `certutil -hashfile disk.iso SHA256` vardır; o da büyük harfle ve aralarında boşluklarla yazdırır. Bir sağlama toplamı karşılaştırmasında büyük küçük harf hiçbir zaman önemli değildir; harfler kelime değil, rakamdır.

**macOS**:

```
shasum -a 256 disk.iso
```

**Linux**:

```
sha256sum disk.iso
```

Üçü de aynı dosya için aynı dizgeyi yazdırır ve bu site de öyle. Bunlar yayımlanmış test vektörleri olan kesin belirtimlerdir; bir uygulamanın kendi görüşünü koymasına yer yoktur.

## Gözlerinizi bozmadan karşılaştırmak

Altmış dört karakteri iki ekrandan okuyup aynı göründüklerine karar vermeyin. İnsanlar ilk dördüne ve son dördüne bakıp durur ki bu, bir saldırganın geçmesini ayarlayacağı karşılaştırmanın tam olarak kendisidir ve aynı zamanda dürüst bir hatanın da böyle geçiştirildiği yerdir.

İkisini de sizin için karşılaştırabilecek bir şeye yapıştırın. Bir komut satırında `-c` bayrağının varlık sebebi budur:

```
sha256sum -c SHA256SUMS
```

Bir tarayıcıda ise [Özet ve Sağlama Toplamı](https://abox.tools/tr/saglama-toplami-hesaplama/)'ndaki karşılaştırma kutusudur; değeri yayıncı hangi şekilde yazdıysa o şekilde kabul eder — çıplak onaltılık, bir `sha256sum` çıktısı satırı, bütün bir `SHA256SUMS` dosyası, `SHA256 (disk.iso) = …` biçimi ya da bir betik etiketinden alınmış bir `integrity="sha384-…"` özniteliği — ve tek bir cümleyle evet ya da hayır der.

![Karşılaştırma kartı: bir kutuya yapıştırılmış bir sağlama toplamı ve dosyayla uyuştuğunu söyleyen bir hüküm.](https://abox.tools/screens/verify-a-file-checksum/compare.webp)

İndirme sayfasında yazanı yapıştırın, karşılaştırmayı araç yapsın. Ekrandan altmış dört karakter okumak, bunun ortadan kaldırdığı adımdır.

## Bir eşleşme tam olarak neyi kanıtlar

Diskinizdeki baytların, o sayıyı yazan kişinin önünde duran baytlar olduğunu. Bu gerçekten bilmeye değer bir şeydir ve çoğu insanın sandığından dardır; o yüzden neyi kapsayıp neyi kapsamadığını listelemeye değer.

**Bir eşleşmenin dışladıkları:**

- erken duran ve size eksiksiz görünen bir dosya bırakan bir indirme;
- aktarım sırasında, bozulan bir diskte ya da kötü bir USB kablosunda bozulma;
- yanlış dosya — x86 yerine ARM derlemesi ya da geçen ayın sürümü;
- duyurduğundan başka bir şey sunan bir yansı.

**Bir eşleşmenin dışlamadıkları:**

- **dosyanın kötü niyetli olması.** Bir yayıncı, kötücül yazılımı başka her şey kadar isabetle ölçebilir. Bir sağlama toplamı "gönderdikleri şey budur" der, hiçbir zaman "bu güvenlidir" demez;
- **yayıncının ele geçirilmiş olması.** Biri sunucudaki dosyayı değiştirdiyse yanındaki sağlama toplamını da aynı dakikada değiştirmiştir. Ki bu bizi bir sonraki bölüme getiriyor.

## Bütün işi anlamsız kılan hata

Sağlama toplamını dosyayla aynı sayfadan, aynı bağlantı üzerinden almak.

Neye karşı savunma yaptığınızı düşünün. Endişe bozulmuş bir indirmeyse sağlama toplamı her yerden gelebilir ve denetim işe yarar. Endişe birinin dosyayı kurcalamasıysa, dosyayı değiştirebilen kişi altındaki onaltılık satırı da değiştirebilirdi; çünkü ikisi de aynı sunucudan, aynı bağlantı üzerinden geldi. Sahtecinin imzayı onaylamasını istiyor olurdunuz.

Bir sağlama toplamı, size dosyanın gelmediği bir yoldan ulaştığında en değerlidir:

- zaten sahip olduğunuz bir anahtara karşı denetlenmiş, ayrık bir GPG imzası olan bir `SHA256SUMS` dosyası — dağıtımların yayımladığı budur ve gerçek cevap da budur;
- indirme sayfası yerine bir posta listesindeki sürüm duyurusu ya da bir kaynak deposundaki bir etiket;
- başka bir alan adındaki ikinci bir yansı ve ikisinin birbiriyle karşılaştırılması;
- bunu sizin için, işletim sistemiyle gelen anahtarlara karşı yapan bir paket yöneticisi.

Bunların hiçbiri aynı sayfadaki bir sağlama toplamını denetlemeyi yararsız kılmaz. Bozuk indirmeyi yakalar ki insanların gerçekten başına gelen çuvallama odur. Yalnızca kendinize başka bir şeyi yakaladığını söylemeyin.

## MD5 ve SHA-1 kırıldı. Yine de bazen kullanın

İkisi de burada önemli olan en güçlü anlamda kırıldı: *çakışmalar* bilerek kurulabiliyor. Aynı MD5'e sahip iki farklı dosya 2004'ten beri sıradan donanımda kurulabiliyor ve 2017'de bir ekip aynı SHA-1'e sahip iki farklı PDF üretti. 2020'de bu saldırının seçilmiş önek sürümü, kiralanmış birkaç on bin dolarlık hesaplamaya kadar indi.

Bunun pratikteki anlamı: eşleşen bir MD5 artık size kimsenin dosyayı kurcalamadığını söylemez; çünkü isteyen biri aynı sayıya sahip farklı bir dosya kurabilirdi. Yine de indirmenin kesilmediğini ya da bozulmadığını söyler; çünkü rastgele bir kaza bir çakışmaya denk gelmez — bu, hiçbir kazanın sahip olmadığı bir olasılıktır.

Yani yayıncı bir MD5 ve başka bir şey yazmadıysa onu denetleyin. Hiç denetlememekten değerlidir. Ve yayımlayan sizseniz bir SHA-256 yazın.

## Eşleşmedi. Şimdi ne olacak?

1. **Aynı yerden yeniden indirin.** Kesilmiş ya da sürdürülmüş bir aktarım açık ara en yaygın sebeptir ve ikinci bir kopya genellikle işi halleder.
2. **Doğru satırda olduğunuzu denetleyin.** Sürüm sayfaları birkaç dosya listeler; yükleyicinin sağlama toplamı hiçbir zaman arşivle eşleşmez ve ARM derlemesi hiçbir zaman x86'yla eşleşmez.
3. **Sürümü denetleyin.** Yer imine eklenmiş sağlama toplamı sayfaları, bir ara sürüm çıktığı gün bayatlar.
4. **Başka bir yansı deneyin** ve iki dosyanın sağlama toplamlarını birbiriyle karşılaştırın. Birbiriyle uyuşup yayımlanan sayıyla uyuşmayan iki yansı, ikisiyle de uyuşmayan tek bir yansıdan başka bir sorundur.
5. **Bu arada onu açmayın.** Sağlama toplamını geçemeyen bir dosya en iyi ihtimalle hasarlıdır, en kötü ihtimalle istediğiniz dosya değildir.

## Bunu neden bir tarayıcıda yapmalı

Çünkü çoğu insan komut satırında değil ve çünkü apaçık alternatif — sizden dosyayı yüklemenizi isteyen bir web sitesi — zaten emin olmadığınız bir yükleyiciyle yapılacak tuhaf bir şey. Aktarım sırasında kurcalanıp kurcalanmadığını öğrenmek için bir dosyayı bir yere göndermek, kurcalanabileceği bir yer daha ekler.

[Özet ve Sağlama Toplamı](https://abox.tools/tr/saglama-toplami-hesaplama/), dosyayı kendi makinenizde dört megabaytlık parçalar hâlinde okur; yani yükleme yok, boyut sınırı yok ve sayfanın kendisi dışında güvenilecek bir şey yok — ki onu okuyabilirsiniz ve ağ fişi çekilmişken de çalışmaya devam eder. Kendi işletim sisteminize güvenmeyi tercih ederseniz yukarıdaki bölümdeki komutu çalıştırın ve iki cevabı karşılaştırın. Uyuşacaklar.
