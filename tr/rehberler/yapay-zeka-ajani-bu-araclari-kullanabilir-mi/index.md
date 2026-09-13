# Yapay zeka ajanı bu araçları kullanabilir mi?

Evet. Bunlar sıradan web sayfaları: hesap yok, captcha yok ve her denetim etiketli; bir ajan onları başka her şeyi sürdüğü gibi sürer. Bir sayfayı hak eden soru bunun arkasındaki: bir dosya işini ajana devrettiğinizde dosya nereye gider? Cevap, bütünüyle ajanın tarayıcısının nerede çalıştığına bağlıdır.

Son güncelleme 6 Eylül 2026

## Kısa cevap

Evet. Buradaki her araç sıradan bir web sayfasıdır: bir dosya seçici, birkaç etiketli denetim, bir indirme düğmesi. Girilecek hesap, çözülecek captcha, özellikle bir insan gerektiren bir adım yok. Tarayıcısı olan bir yapay zeka ajanı bu sayfaları, başka her sayfayı sürdüğü gibi sürer — ve bu sitenin zaten insanlar için yaptığı birkaç şeyin ajanlara da bedavaya yaradığı çıkar ortaya; son bölüm bunları sayıyor.

Ama “düğmelere basabilir mi” küçük sorudur. Bir sayfayı hak eden soru şu: düğmelere basan makine siz olmadığınızda, bu sitenin sözü — *dosyanız makinenizden asla ayrılmaz* — ne olur? Cevap: söz, devretmeyi ya eksiksiz atlatır ya hiç atlatamaz ve bu, tek bir şeye bağlıdır — **ajanın tarayıcısının nerede çalıştığına.**

## İki tür ajan, tek ayrım

Araç kullanan ajanlar iki biçimde gelir ve aralarındaki fark, bu sayfadaki başka her şeyden ağır basar.

**Yerel ajan** sizin makinenizde çalışır: bilgisayarınıza kurulmuş bir asistan ya da baktığınız tarayıcıyı süren bir ajan. Böyle bir ajan burada bir aracı açıp ona dosyanızı uzattığında, iş bu sayfalarda her zaman olduğu yerde olur — bir tarayıcıda, sizin donanımınızın üstünde. Dosya diskinizden okunur, tarayıcınızın belleğinde işlenir, diskinize geri yazılır. Devretmek, baytların izlediği yolda hiçbir şeyi değiştirmemiştir. Ayarları bir yapay zeka seçmiştir; dosya yine de hiç gitmemiştir.

**Bulut ajanı** tarayıcısını satıcısının bilgisayarında çalıştırır. Siz bir sohbete dosya eklersiniz, ajan başka bir yerdeki sanal makinede çalışır ve bu araçlarla her ne yapıyorsa orada yapar. Araçlar yine sözlerini harfiyen tutar — dosya, içinde bulunduğu tarayıcıdan öteye gitmez — ama o tarayıcı sizin değildir ve yükleme, daha hiçbir araç açılmadan, dosyayı eklediğiniz anda çoktan olmuştur. Hiçbir sayfa, kendisinden önce gelen bir yüklemeyi geri alamaz.

Yani bu sitenin sorup durduğu soru — bu işin, dosyamın gitmesine gerçekten ihtiyacı var mı? — işi bir ajan yaptığında kaybolmaz. Yalnızca bir adım öne, ajan seçimine taşınır. Tamamen tarayıcıda yaşayan bir aracı süren yerel ajan, devretmenin hiç mahremiyete mal olmadığı o ender düzendir: işi yapay zeka yapar, dosya evde kalır.

## Bir ajana iş nasıl verilir

Ajanlar en iyi, bir iş arkadaşının isteyeceği brifingle çalışır: araç, dosya ve bitmişin neye benzediği. İşe yarayan birkaç kalıp:

- **Yalnızca aracı değil, sonucu söyleyin.** “abox.tools/resim-sikistirma/ sayfasını aç ve bu fotoğrafı 200 KB'ın altına indir” demek, ajana sayfanın soracağı sayıyı verir. [Resim sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/) hedef boyutu adıyla alır — bir ajanın sadakatle taşıyabileceği türden bir talimat tam olarak budur.
- **Ona haritayı gösterin.** Bu site [llms.txt](https://abox.tools/llms.txt) yayımlar: her araç ve her rehber, her biri bir satır açıklamayla, düz metin olarak, tek seferde çekilir. Onu okuyan bir ajan, hiçbir yeri taramadan burada ne olduğunu bilir. Ayrıca her sayfanın, sonuna `index.md` eklenmiş kendi adresinde bir ikizi var: arayüzü olmadan, Markdown olarak sayfa; bir araç sayfasının nasıl göründüğünü değil ne söylediğini isteyen bir ajan için.
- **Üstünde durduğu sayfayı okumasına izin verin.** Her araç, soru ve cevaplarını sayfanın kendisinde taşır ve her aracın bir bağlantı ötesinde bir rehberi vardır. Bir ayardan emin görünmeyen ajana önce rehberi okuması söylenebilir — bir insana verilecek öğüdün aynısı.
- **Zincirler işler.** Bu sitenin iş akışı rehberlerinin insanlara anlattığı işler — tarayıp sonra tek [PDF](https://abox.tools/tr/resimleri-pdfe-donusturme/) hâline getirmek; [EXIF](https://abox.tools/tr/exif-verisi-silme/) verisini silip sonra boyutlandırmak — ajanların en iyi olduğu işlerdir, çünkü her adımın çıktısı bir sonrakinin girdisidir ve arada hiçbir şey muhakeme istemez.

## Neyi devretmemeli

Bir ajan buradaki her aracı sürebilir. İki yerde sürmek işin tamamı değildir ve geri kalanı sizde kalmalıdır.

**Neyin görünmemesi gerektiğine karar vermek.** Karartma araçları, örttüğünüzü siler — ama neyi örteceğinizi seçmek işin ta kendisidir ve bir satırı kaçıran ajan, bitmiş görünen ama bitmemiş bir dosya üretmiştir. İsterseniz karartıcıyı bir ajana kullandırın; sonuca, herhangi bir yere gitmeden önce kendiniz bakın — o araçların rehberlerinin insan operatöre verdiği kuralın aynısı.

**Okunanı açmak.** Bu sitenin QR okuyucusu çözdüğünü açmayı reddeder, çünkü okumak ile takip etmek ayrı edimlerdir. Aynı ayrımı bir ajana da dayatmaya değer: bir dosyada kod, bağlantı ya da adres okuyan ajan onu bildirmelidir, ziyaret etmemelidir. Ve kendi tarayıcınızı süren bir ajan, o tarayıcının oturum açık olduğu her şeyi elinde tutuyordur — ona da her araca baktığınız o sınayıcı gözle bakmak için bir sebep; sonraki bölümün konusu bu.

## Sözü bir ajan da sınayabilir

[Dosya yükleme rehberinin](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) öğrettiği dört sınama — fişi çek, Ağ sekmesini izle, Content-Security-Policy'yi oku, kodu oku — bir ajanın yapabileceği işlerdir ve ajana bir insana olduğundan daha kolay gelir: bir CSP başlığını okumak ya da sunulan kaynakta `fetch` çağrıları aramak mekanik iştir. Araçlara güvenmeden önce onları bir ajana denetletiyorsanız, bu site aynı biçimde denetlenmeyi bekler — ve o sınamaların dayandığı çevrimdışı davranışın [kendi sayfası](https://abox.tools/tr/rehberler/bir-web-sayfasi-cevrimdisi-nasil-calisir/) var.

Bu sitenin bir ajan için yaptığını, bilerek ve herkes için yapar: her denetim etiketlidir, çünkü ekran okuyucular ad ister ve ajan da aynı adları okur; sayfalarda hesap, açılır pencere, etrafından dolaşılacak onay duvarı yoktur; kaynak kod açıktır ve derleme adımı olmadan sunulur, dolayısıyla ajanın denetlediği kod, çalışan kodun ta kendisidir; ve [llms.txt](https://abox.tools/llms.txt) bütün kutuyu tek seferde verir. Bunların hiçbiri makineler için eklenmedi. Ekran okuyuculu bir insana okunaklı olan sayfa, başka her şeye de okunaklı çıkıyor.

Dürüst bir sınır: bu sayfa, bu araçları kullanan ajanları anlatıyor, ajanların kendisini değil. Bir ajanın satıcısının gördükleri — talimatlarınız, ekran görüntüleriniz, bazen dosyalarınız — ayrı bir sorudur ve bu rehber grubunun dönüp dolaşıp vardığı alışkanlık, onun için de doğru mercektir: makinenizden gerçekten neyin, hangi hâlde ayrılması gerektiğini sorun.
