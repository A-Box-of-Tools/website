# Metin ve dosyaları yüklemeden cihazlar arasında nasıl paylaşırsınız

Bir notu ya da dosyayı başka bir makineye taşımanın alışıldık yolları hep arkada bir kopya bırakır: gönderilenler klasöründe, bir sohbet geçmişinde ya da bir paylaşım sitesinin sunucusunda, güvenmek zorunda olduğunuz bir silme düğmesinin ardında. Hiçbir yerde hiçbir şey bırakmayan bir yol var, çünkü hiçbir şey asla saklanmıyor - ve odanın öbür ucuna söylenebilecek bir adı olan tek yol da bu.

[Metin ve dosya paylaşımı aracını açın](https://abox.tools/tr/metin-paylasma/): Paylaşım bu açık sekmede yaşar. Okuyucular onu şifreli olarak doğrudan tarayıcınızdan alır ve sekmeyi kapattığınızda biter - hiçbir sunucu hiçbir şey saklamaz.

Son güncelleme 27 Ağustos 2026

## Kısa cevap

İçeriğin bulunduğu makinede [Metin ve dosya paylaşımı](https://abox.tools/tr/metin-paylasma/)'nı açın, yazın ya da ekleyin ve *Paylaşmaya başla*'ya basın. Sayfa paylaşıma `brave-otter-42` gibi bir ad verir; öbür cihazda aynı sayfayı açıp adresin sonuna `#brave-otter-42` yazın — ya da kopyalanan bağlantıyı izleyin, yeter. Öbür cihaz bağlanmadan önce sorar, siz içeri alırsınız ve metin ya da dosya şifreli olarak, doğrudan bir tarayıcıdan diğerine geçer. Paylaşan sekmeyi kapatın; her yerde bitmiştir.

Hiçbir anda hiçbir şey yüklenmedi. Bu bir politika değil, aygıtın biçimi. Sayfanın geri kalanı bunun neden önemli olduğunu ve dürüst sınırlarının nerede durduğunu anlatıyor.

![Paylaşma aracının ilk kartı: birkaç satır toplantı notu tutan bir metin kutusu ve üstünde bir Markdown anahtarı ile dosya eklemeye yarayan bir düğme.](https://abox.tools/screens/share-text-between-devices/write.webp)

Devredilen şey. Aynı kutuya bir alışveriş listesi de sığar bir belge de, ve Markdown ayrı bir kip değil, bir anahtardır.

## Alışıldık yolların kopya bıraktığı yerler

Kendinize bir not e-postalayın; artık bir gönderilenler klasöründe ve bir gelen kutusunda yaşıyor, ikisi de eşitlenmiş, ikisi de yedeklenmiş, ikisi de yıllar sonra aranabilir. Bir parolayı mesaj uygulamasına yapıştırın; o sohbetin geçmişinde — ve uygulamanın bulut yedeğinde — sohbet var oldukça duruyor. Bir pastebin ya da dosya bırakma sitesi kullanın; içerik onların sunucusunda, bir son kullanma ayarı ile yalnızca rengini doğrulayabileceğiniz bir silme düğmesinin ardında. Bu yolların her biri, paylaşmayı özellik olarak taşıyan bir depolama hizmetidir.

Bazen istediğiniz tam da budur: karşı taraf hazır olana dek bekleyen bir kopya. Ama hızlı paylaşımların çoğu bunun tersidir: öbür cihaz hemen orada, içerik anlık ve saklanan her kopya düpedüz yük. Misafir için Wi-Fi parolası, telefonda okunan bir adres, ikinci bir çift göz isteyen bir hata mesajı, ait olduğu makineye giden bir yapılandırma parçası. Bunların hiçbiri arşiv istemez.

## “Doğrudan” gerçekte ne demek

Araç, tarayıcıdaki görüntülü aramaların makinesi olan WebRTC'yi kullanır: iki tarayıcı aralarında şifreli bir kanal açar ve veriyi oradan geçirir, yolda sunucu olmadan. Aynı ağda baytlar yalnızca yerel ağda dolaşır — aynı Wi-Fi'daki iki dizüstü dosyayı internetten değil, odadan geçirir.

Aracın sayfasında da yazan dürüst bir yıldız işareti: iki tarayıcı birbirini kendi başına bulamaz. Küçük bir sunucu — aracı — adı yazan kişiyle o adla paylaşanı buluşturur ve aralarında birkaç kilobaytlık bağlantı kurulumu taşır. Hiçbir şey saklamaz ve içerik asla ondan geçmez; tam kaynak kodu aracın kodunun yanında yayımlanmıştır. O tanıştırmadır, konuşma değil — ve bu sitede herhangi bir şeyin konuştuğu tek sunucudur; aracın sayfasının neyi görüp neyi göremeyeceğini tek tek yazmasının nedeni de budur.

Doğrudan aynı zamanda karşılıklı demektir: her tarayıcı ötekinin ağ adresini öğrenir, telefondaki gibi. Okuyan taraf bunu herhangi bir bağlantı var olmadan önce bilir ve yalnızca kendi seçimiyle bağlanır.

## Ad adrestir, ve tek sır

Bir paylaşım bağlantısını diğerlerinden ayıran çok pratik bir şey vardır: söylenmeye dayanır. `brave-otter-42` odanın öbür ucuna seslenilebilir, telefonda okunabilir, tahtadan kopyalanabilir ve öbür uçta kimsenin parmakları yorulmadan yazılabilir. Adların böyle görünmesinin nedeni tam olarak budur.

Ve iki yönde de keser: canlı bir adı bilen ya da tahmin eden herkes arkasındaki paylaşımı açabilir. Hassas bir şey için ya kimsenin tahmin edemeyeceği bir ad verin ya da varsayılana yaslanın: işareti kaldırmadıkça paylaşımlar *özeldir*; yani gelen her okuyucu kendini tanıtmak zorundadır ve kimin gireceğine mesaj mesaj siz karar verirsiniz. Tanıtım şifreli doğrudan kanaldan gider; kapıyı kimin çaldığını aracı bile bilmez.

![İkinci kart: thursday-notes yazan bir bağlantı adı, adın hem adres hem de tek sır olduğunu söyleyen bir not, ve özel ile tek seferlik anahtarları.](https://abox.tools/screens/share-text-between-devices/name.webp)

Ad, adresin tamamıdır. Özel demek, her okuyanın izin istemesi ve sizin içeri almanız demektir; tek seferlik demek, taslağın bu cihazda da kalmaması demektir.

## Sekmeyi kapatmak gerçekte neyi bitirir

Paylaşım, paylaşan sekmede yaşar ve başka hiçbir yerde; o sekmeyi kapatmak silmenin ta kendisidir — silme talebi değil. Bağlantı bir iki saniyede ölür ve hâlâ bakan okuyucular sayfalarının boşaldığını görür. Kendi yaşam döngüsüne sahip bir sunucu kopyası, bir çöp kutusu, otuz günlük saklama yoktur. Yazdığınız taslak bir dahaki sefer için kendi tarayıcınızda kalır ve tek seferlik ayarıyla o bile kapanır.

Bitmeyense sahipliktir. Paylaşım açıkken metni kopyalayan ya da dosyayı indiren okuyucuda o şey vardır: sanki başka herhangi bir yolla elden vermişsiniz gibi. Hiçbir araç gönderilmişi geri alamaz; alabildiğini iddia eden bir araç, size başkasının bilgisayarı hakkında yalan söylüyordur. Bitirmek geleceği yönetir — yeni kimse yok, daha fazlası yok — ve saklanmış kopyalı bir hizmetin size veremeyeceği kısım tam da budur.

## Çevrim içi mülakat ideal durumdur

Elden ele bir araç iki ucun da hazır olmasını ister ve mülakat, hazır bulunmanın garanti olduğu tek randevudur: zaten birbirinize bakıyorsunuz. Aynı zamanda saklanan kopyalı yolların en pahalı olduğu andır. Toplantı sohbetinden geçen her şey platformun dökümüne düşer; kayda ve o kaydın sonradan gönderileceği herkese ilişir. Ekranınız paylaşılırken bir bağlantıyı almak için posta kutusunu ya da bir mesaj uygulamasını açmak da yazışmalarınızı başkasının kaydına koyar. Paylaşım sayfası ise paylaşılan şeyi gösterir, başka hiçbir şeyi değil.

Uygulamada: portföy bağlantısı, depo, ödev PDF'si, sohbet kutusunun süslü tırnaklarından sağ çıkamayacak kod parçası — paylaşımı görüşmeden önce başlatın, anı geldiğinde adı yüksek sesle söyleyin. `brave-otter-42` bir sesli aramayı bozulmadan geçer; adlar tam da bunun için böyle biçimlendirildi ve karşı taraf cümle bitmeden dosyayı almış olur. Özel bırakılırsa paylaşım, mülakatçının girişini açık bırakılmış bir kapı yerine görüşmenin ortasında sizin onayladığınız bir şeye çevirir; arama bittiğinde de sekmeyi kapatmak paylaşımı onunla birlikte bitirir — hiçbir şey bir dökümde sonradan bağlamından koparılıp okunmayı beklemez.

Dürüst bir hazırlık: mülakatçılar çoğu okurdan daha sık katı kurumsal ağlarda oturur ve doğrudan yolu olmayan o ender çift tam orada yaşar. Onların ağını evden sınayamazsınız — ama araç başarısızlığı asılı kalmak yerine yirmi saniye içinde söyler; böylece yedek plan size mülakatı değil, birkaç anı kaybettirir.

## Bunun yanlış araç olduğu zamanlar

İki ucun da hazır olması gerekir: bu elden teslim, posta kutusu değil. Karşı taraf uyuyorsa, saklayan bir şey kullanın — bunu bilerek. Paylaşan sekme açık ve uyanık kalmalıdır; pratikte bu, paylaşanın bir masaüstü ya da dizüstü olması demektir: telefonlar arka plandaki sekmeleri saniyeler içinde uyutur, gerçi bir paylaşımı gayet iyi okurlar. Çevrimdışı çalışamaz — bu sitede tek başına — çünkü başka bir makineye ulaşmak bir ağ eylemidir; düzenleyici yarısı ise hiç bağlantısız da çalışır. Ve küçük bir ağ çifti azınlığı — tipik olarak bir uç bir mobil operatörün paylaşımlı adres ağındayken ya da katı bir kurumsal ağın ardındayken — doğrudan hiç birleşemez; araç bunu yirmi saniye sonra açıkça söyler ve sessizce bir aktarıcıya geçmek yerine okuyucuya baytları okuyamadan ileten şifreli bir aktarıcı önerir.

Geri kalan her şey içinse — not, parola, yapılandırma dosyası, bir Wi-Fi adımı ötedeki 100 MB'lık video — doğrudan sürüm daha hızlı, daha basit ve dünyayı tam bulduğu gibi bırakıyor.
