# On altı pikselde hâlâ okunan bir favicon nasıl yapılır

Bir favicon, logonuzun küçük bir resmi değildir. Sabit boyutlarda, çoğu insanın hiç açmadığı bir kabın içinde duran bir resimler kümesidir ve herkesin gerçekten gördüğü, bunların en küçüğüdür. Bu rehber hangi boyutlara ihtiyacınız olduğunu, yanlarına hangi dosyaların gittiğini ve logonuz bu küçülmeden sağ çıkmadığında ne yapacağınızı anlatıyor.

[Görselden ICO'ya aracını açın](https://abox.tools/tr/favicon-olusturma/): Bir resim girer. Bir tarayıcının, Windows'un ya da bir Mac'in istediği her boyut çıkar.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Görselden ICO'ya](https://abox.tools/tr/favicon-olusturma/)'yı açın, en az 256 piksellik kare bir resim bırakın, hazır ayarı *Web sitesi faviconu*'nda bırakın ve `favicon.ico`'yu indirin. Onu sitenizin köküne koyun; böylece `https://siteniz.com/favicon.ico` adresinde cevap versin. HTML'iniz ondan söz etsin ya da etmesin, o adresi her tarayıcı ister; yani kesin olarak yapmanız gereken başka bir şey yok.

Aşağıdaki her şey, teknik olarak var olan bir simge ile okunabilir bir simge arasındaki farkı yaratan kısımdır: içine hangi boyutlar girer, iPhone'lar ve Android bunun yerine ne ister ve logonuz on altı piksel genişliğinde olmaktan sağ çıkmadığında ne yaparsınız.

## Neden tek bir resim değil de bir boyutlar kümesi

Bir `.ico` dosyası bir kaptır. İçinde aynı şeyin farklı boyutlardaki birkaç eksiksiz resmi vardır ve dosyayı okuyan şey, ihtiyaç duyduğu boyuta en yakın olanı seçer.

Bu kulağa gereksiz tekrar gibi geliyor ama değil. Simgenizi on altı pikselde çizen bir tarayıcının iki seçeneği vardır: sizin çizdiğiniz on altı piksellik sürümü okumak ya da olduğu yerde daha büyük birini küçültmek. İkincisi daha kötüdür ve gözle görülür biçimde öyledir — ayrıntılı bir logonun otomatik küçültülmesi lapa üretir, oysa bakarak hazırladığınız on altı piksellik bir sürüm, sadeleştirme şansı bulduğunuz bir şeydir. Biçimin birkaç boyut tutmasının bütün sebebi size o şansı vermektir.

Bir web sitesi için gelenek üç boyuttur ve her birinin bir sebebi vardır:

- **⁦16×16⁩** — tarayıcı sekmesi, adres çubuğu, yer imi menüsü. İnsanların gördüğü budur. Yalnızca birini doğru yapacaksanız bunu doğru yapın.
- **⁦32×32⁩** — bir yer imi çubuğu, sitenize giden bir Windows masaüstü kısayolu ve yüksek yoğunluklu bir ekrandaki çoğu tarayıcı; onlar sekme simgesini 32'den çizip küçültür.
- **⁦48×48⁩** — Google'ın arama sonuçları için site simgesini okuduğu boyut ve Windows'un orta simge görünümü.

Daha büyük olan her şey, aşağıda mobil dosyalar bölümünde geçen sebeplerle, `.ico`'nun içinde değil yanında bir PNG'de durmalıdır.

![Hazır ayarların listesi ve her birinin içerdiği boyutlar: bir site simgesi için on altı, otuz iki ve kırk sekiz piksel, altında dosyaya ne gireceğinin özeti.](https://abox.tools/screens/make-a-favicon/preset.webp)

Bir .ico bir kaptır ve bu, içine ne gireceğinin listesidir. Hazır ayar, tarayıcının gerçekten istediği kümeye giden kısa yoldur.

## On altı piksel sorunu

Kimsenin sizi uyarmadığı kısım budur. On altı piksel, normal bir ekranda yaklaşık dört milimetredir: toplam 256 noktalık bir ızgara; bu cümledeki harflerden az. Bir tabelada, bir kartvizitte ya da bir web sitesi başlığında çalışsın diye tasarlanmış neredeyse hiçbir şey buna indirgenmekten sağ çıkmaz.

Sırasıyla kaybolanlar:

- **Metin.** Bir kareye küçültülmüş bir kelime logosu yaklaşık üç piksel yüksekliğindedir. Küçük metin olmaz, gri bir çubuk olur. Adının yanı sıra bir sembolü de olan hemen her şirketin faviconu olarak yalnızca sembolü kullanmasının ve sembolü olmayanların tek bir harf kullanmasının sebebi budur.
- **İnce çizgiler.** 512 piksellik bir logodaki bir piksellik çerçeve, on altıda bir pikselin otuz ikide biridir. Kenar boyunca silik gri bir pus olarak görüntülenir ya da yok olur.
- **Renk geçişleri ve gölgeler.** Bir geçişe yer yoktur. Yumuşak bir gölge, kirli bir saçağa dönüşür.
- **Ayrıntının içindeki ayrıntı.** Üzerinde yazı olan bir belge simgesi, üzerinde leke olan bir dikdörtgene dönüşür.

Çözüm bir ayar değil, başka bir çizimdir: bir ya da iki şekilden oluşan, yüksek karşıtlıklı ve tek bir karakterin ötesinde metin içermeyen sadeleştirilmiş bir işaret. O sürümü bilerek 32 ya da 48 pikselde çizin ve kaynak olarak onu kullanın.

Bir aracın yapabileceği şey, siz yayımlamadan önce sorunu size göstermektir. [Görselden ICO'ya](https://abox.tools/tr/favicon-olusturma/)'daki ön izleme her boyutu ekranda gerçek boyutunda çizer; bunu değerlendirmenin tek yolu da budur — altmış dörtte gösterilen on altı piksellik bir simge iyi görünür ve size hiçbir şey söylemez.

![Aynı işaretin on altı, otuz iki, kırk sekiz, altmış dört ve yüz yirmi sekiz pikselde çizildiği bir önizleme şeridi.](https://abox.tools/screens/make-a-favicon/sizes.webp)

On altı piksellik hâli, tasarladığınızın yanında. İşaretin sadeleştirilmesi gerekip gerekmediğine karar veren görüntü budur.

## Logonuz kare değil. Tamamlamak mı, kırpmak mı?

Bir simge her zaman karedir ve çoğu logo değildir; yani bir şeyin olması gerekir. Üç cevap var ve hepsi eşit derecede iyi değil.

**Tamamlamak** resmin tamamını korur ve üstüne altına boşluk koyar. Güvenli varsayılandır ve geniş bir kelime logosu için yanlış seçimdir: yüksekliğinin üç katı genişlikte bir şeyi bir kareye sığdırmak, onu yüksekliğin üçte birini kaplar hâlde bırakır ki bu, on altı pikselde beş piksel logo ve on bir piksel hiçlik demektir.

**Ortaya kırpmak** merkezden en büyük kareyi alır. Bir kilit düzen için — yanında şirket adı olan bir sembol — bu çoğu zaman ikisini birden ortasından keser. Önce kaynağı kendiniz, yalnızca sembol kalacak şekilde kırpıp sonra onu dönüştürmek daha iyidir.

**Esnetmek** resmi sığdırmak için ezer. Bunun doğru olduğu neredeyse hiçbir durum yoktur ve esas olarak araç bunu sessizce yapmasın diye sunulur.

Geniş bir logo için genel cevap: logoyu dönüştürmeyin. Onun tek başına işe yarayan kısmını dönüştürün.

## Saydam mı, düz bir arka plan mı?

Bir web sitesi için genellikle saydam doğrudur. Tarayıcı sekmeleri, tarayıcıya ve temaya göre gri, beyaz ya da siyaha yakındır ve saydam bir simge hepsinin üstünde durur. İçine beyaz arka plan boyanmış bir simge, koyu bir sekme çubuğunda beyaz bir dikdörtgendir.

Bilmeye değer iki istisna:

- **Yalnızca koyu renkten oluşan bir logo** koyu kipte kaybolur. İşaretiniz doğası gereği beyaz üzerine siyahsa, ona saydam yerine renkli bir arka plan ya da açık renkli bir dış hat verin.
- **Apple dokunma simgesi opak olmak zorundadır.** iOS onu kendi yuvarlatılmış kutucuğuna çizer ve saydamlığı siyah olarak görüntüler. O dosyayı üreten her araç onu sizin için düzleştirmelidir; buradaki araç yapıyor, varsayılan olarak beyaza.

## Bir web sitesinin .ico dışında ihtiyaç duyduğu dosyalar

`favicon.ico`, tarayıcıları ve Windows'u kapsar. Telefonları kapsamaz ve ev yapımı simge setlerinin çoğu da burada erken durur. Üç başka platform kendi dosyalarını, kendi adlarıyla ister ve hiçbiri bir `.ico`'nun içine bakmaz:

- **iOS**, biri sitenizi ana ekranına eklediğinde ⁦180×180⁩ boyutunda `apple-touch-icon.png` okur. O olmadan iOS sayfanın bir ekran görüntüsünü kullanır ki bu bir hata gibi görünür.
- **Android ve her kurulum istemi** bir web uygulaması bildirimi okur — `site.webmanifest` — o da 192 ve 512 piksellik PNG'leri gösterir. 512, aynı zamanda bir web uygulamasının açılış ekranında gösterdiğidir.
- **Bir Windows başlat menüsü kutucuğu** `browserconfig.xml` okur, o da ⁦150×150⁩ bir PNG gösterir. Üçünün içinde önemi en az olanı ve dört satırlık bir XML.

Yanlış yapılması kolay bir tane daha var: Android başlatıcıları uyarlanabilir bir simgeyi telefonun hoşuna giden şekle kırpar — daire, yumuşak kare, yuvarlatılmış kare — ve görüntünün yalnızca orta %80'inin hayatta kalacağı garanti edilir. Kenardan kenara çizilmiş bir simge köşelerini kaybeder. *Maskelenebilir* bir simge de budur: aynı resmin, karenin içinde bilerek küçük çizilmiş ve bildirimde ayrıca bildirilmiş hâli.

[Görselden ICO'ya](https://abox.tools/tr/favicon-olusturma/)'da web sitesi setini işaretlemek bunların hepsini, bildirimi ve onları gösteren HTML bloğunu üretir. O bloğun bilerek dışarıda bıraktığı bir şey, `favicon.ico` için bir `<link>`'tir: tarayıcılar o adresi kendiliğinden ister ve onu ayrıca adlandırmak aynı dosyanın iki kez getirilmesine yol açar.

## Bir Windows uygulama simgesi başka bir kümedir

Simge bir site için değil bir program için ise boyutlar değişir. Visual Studio'nun kendi varsayılan `app.ico`'sunun içerdiği şey 16, 32, 48 ve 256'dır — üç kabuk boyutu ile başlat menüsünün ve Explorer'ın çok büyük görünümünün çizdiği büyük olan.

Yüksek yoğunluklu bir ekranda Windows ayrıca 20, 24, 40, 64 ve 96'yı da ister ve yoklarsa elindeki en yakın boyuttan yeniden örnekler. Bunun önemli olup olmadığı simgenize bağlıdır: düz bir şekil yeniden örneklemeden sağ çıkar, ayrıntılı biri çıkmaz. Onları eklemek dosyayı kabaca iki katına çıkarır ki bu, bir uygulama için hiçbir şeydir — hesap, dosyanın her ziyaretçi tarafından getirildiği bir faviconunkinden tamamen farklıdır.

Boyutla ilgili bir şey daha: baytların bulunduğu yer 256 girdisidir. Sıkıştırılmadan saklandığında tek başına 264 KB'dir; simgenin içinde PNG olarak saklandığında genellikle 30'un altındadır. PNG girdileri Windows Vista'dan beri okunabiliyor, yani onlardan kaçınmanın tek sebebi gerçekten bundan eski bir yazılım ya da simgeleri kendi ayrıştıran bir yükleyici veya gömülü bir araçtır.

## Bir Mac tamamen başka bir dosya okur

Simge bir Windows uygulaması için değil bir Mac uygulaması içinse yukarıdakilerin hiçbiri geçerli değildir: macOS `.ico`'yu hiç okumaz. `.icns` okur; o da aynı fikrin başka bir sargıdaki hâlidir — tek kapta birkaç boyut — ve bilmeye değer üç farkı vardır.

- **Boyutlar sabittir.** Apple on yuva yayımlar ve seçilecek bir şey yoktur: 16, 32, 64, 128, 256, 512 ve 1024 piksel; 32, 256 ve 512 iki kez görünür, çünkü her biri hem kendi başına bir boyut hem de bir altındaki boyutun Retina sürümüdür.
- **1024'e kadar çıkar.** Bir `.ico` 256'da durur; bir Mac simge dosyasının birkaç yüz kilobayt, bir faviconun ise on beş kilobayt olmasının sebebi budur. Bir kez gönderilen bir uygulama için bu hiçbir şeydir; yalnızca bir favicon her ziyaretçi tarafından getirilir.
- **Çiziminizin sağ çıkması gereken şey 1024 pikseldir.** İki sorun aynı resmin karşıt uçlarıdır: bir faviconun minicikken çalışması, bir Mac simgesinin ise kocamanken ayakta kalması gerekir. 512'de dışa aktarılıp 1024'e büyütülmüş bir logo, bir Retina ekranda yumuşak görünür ve App Store onu kabul etmez.

Bir tanesini kullanmak için: bir uygulama paketi onu `YourApp.app/Contents/Resources/` içinde tutar ve `Info.plist` içinde adlandırır. Bir klasör ya da bir disk imajı için, `.icns`'i Finder'da seçin, Command-C'ye basın, sonra değiştirmek istediğiniz şeyde Get Info açın, sol üstteki küçük simgeye tıklayın ve Command-V'ye basın.

[Görselden ICO'ya](https://abox.tools/tr/favicon-olusturma/)'da *macOS simgesi*'ni işaretlemek, yanında Windows dosyası olsun ya da olmasın, bir tane yazar. İki platformda da yayımlanan her şey ikisini birden ister ve ikisi de aynı resimden, aynı geçişte çizilir.

## İşe yaradığını denetlemek

Tarayıcılar faviconları neredeyse her şeyden daha sert önbelleğe alır; yani “yükledim ve hiçbir şey değişmedi”, genellikle bir hata değil bir önbellektir. Yeniden dosya düzenlemeye başlamadan önce denenecek iki şey:

- `https://siteniz.com/favicon.ico`'yu doğrudan açın. Dosya iniyorsa oradadır ve siz bir önbelleğe bakıyorsunuzdur. 404 alıyorsanız kökte değildir.
- Siteyi, genellikle kendi simge önbelleği olan bir gizli pencerede yükleyin.

Windows'ta bir `.ico`, bir klasöre konup Explorer'ın görünüm boyutları arasında gezilerek denetlenebilir: küçük, orta, büyük ve çok büyük, aynı dosyadan farklı girdiler çizer; böylece her birini sistemin göreceği gibi görebilirsiniz.

Bir Mac'te bir `.icns`, her yuvayı yanda listeleyen Preview'da açılır — ve aynı numara Finder'da da işler: onu bir klasöre bırakın ve içindeki resimler arasında geçiş yapmasını izlemek için görünüm seçeneklerindeki boyut kaydırağını sürükleyin.

## Bunların hiçbirinin bir yüklemeye ihtiyacı yok

Bir resmi ölçeklemek her tarayıcının yıllardır yaptığı bir şeydir ve bir `.ico`, altı baytlık bir başlık, görsel başına on altı bayt ve ardından görsellerdir. Bir tane yapmanın hiçbir adımı bir sunucu gerektirmez ve buradaki araç bir tane kullanmaz: sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir.

Burada bunu önemsemeye her zamankinden çok değer. Ücretsiz bir favicon üreticisine verilen bir logo, epeyce sık, henüz yayımlanmamış bir markadır — simge, yapılan ilk şeylerden ve duyurulan son şeylerden biridir. Size söylenmesindense denetlemeyi tercih ederseniz sayfayı yükleyin, internet bağlantısını kesin ve yine de bir tane yapın. [Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) herhangi bir araçta çalıştırabileceğiniz üç denetim daha anlatıyor.
