# Bir DICOM dosyasının içinde ne var?

Taramadan fazlası. DICOM dosyası içinde resim olan bir tıbbi kayıttır: adınız, doğum tarihiniz ve hastane numaranız piksellerle aynı dosyada yolculuk eder — ve bu, tam da elinize bir CD tutuşturulup bir görüntüleyici aramaya çıktığınız anda en çok önem kazanır.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Bir DICOM dosyası — hastanenin verdiği CD'deki `.dcm` — JPEG gibi bir resim biçimi değildir. İçinde resim olan bir tıbbi kayıt biçimidir. Pikseller başlamadan önce dosya, yüzlerce etiketten oluşan bir başlık taşır ve bunların arasında, rutin olarak: hastanın tam adı, doğum tarihi, cinsiyeti ve hastane numarası; incelemenin tarihi, saati ve tanımı; sevk eden hekim; kurum ve cihaz, seri numarasına kadar; ve onları üreten arşive geri açılan anahtar işlevindeki bir dizi benzersiz tanımlayıcı.

Resim ekrandayken bunların hiçbiri görünmez; unutulması da tam böyle olur. Tarama, kaydın kendisidir. Dosyaya, içerdiği resim gibi değil, olduğu belge gibi davranın.

## Bu dosya neden bu kadar rahat yükleniyor

Tuzağın pratiği şöyle: bir hastaya inceleme sonrası bir disk ya da indirme verilir, açmayı dener ve makinedeki hiçbir şey açmaz — DICOM sıradan yazılımın konuştuğu bir biçim değildir. Bunun üzerine “dcm dosyası aç online” diye arar ve bulduklarının çoğu bir yükleme kutusudur. Birkaç saniye sonra eksiksiz, kimlikli bir tıbbi kayıt — ad, doğum tarihi, hastane numaraları, tanı kokan inceleme tanımları, hepsi — o gün sıralamada kim yukarıdaysa onun sunucusundadır.

Biçime dikkat edin: bu yine kimlik fotoğrafı meselesi — hassas bir dosya, bir sürtünme ânı, bir arama motoru — ama ikinci dereceden hassas bir dosyayla. Pasaport kim olduğunuzu sızdırır; tarama, kim olduğunuzu *ve neyin araştırıldığını* sızdırır. Yükleme üstüne genel sav [kendi sayfasında](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/); bu, o savın hiçbir baharata ihtiyaç duymadığı dosyadır.

Dosyayı yerelde açmak devanın tamamıdır ve buradaki [DICOM görüntüleyici](https://abox.tools/tr/dicom-goruntuleyici/) bunun içindir: tarama, gerçek bir pencere/seviye kumandası, kendi serisine geri istiflenen bir klasör, milimetre cinsinden ölçümler ve başlığın her etiketi okunur hâlde — hiçbir şey makinenizden çıkmadan. Adım adım anlatım [açma rehberinde](https://abox.tools/tr/rehberler/dicom-dosyasi-acma/).

## “Adı sildim” anonimleştirme değildir

Sonraki hata daha ince ve daha iyi niyetlidir: bariz etiketi silip taramayı paylaşmak — bir ikinci görüş hizmetiyle, bir araştırmacıyla, bir forumla. Bunun ne kadar yetersiz olduğu konusunda standardın kendisi acımasızdır. DICOM'un kendi anonimleştirme profili, bir veri kümesine anonim denebilmesi için ele alınması gereken etiketleri sıralar ve *yüzlerce* kalem tutar; çünkü kimlik, ad alanından çok daha fazla yerde oturur:

- **Adın ötesindeki doğrudan tanımlayıcılar** — doğum tarihi, hasta numarası, dosya numarası, hekimin ve kurumun adları.
- **Anahtarlar** — her dosyaya damgalanan benzersiz tanımlayıcılar: kim olduğunuzu söylemezler ama orijinali görmüş her sisteme, tam olarak *hangi kayıt olduğunuzu* söylerler.
- **Yarı tanımlayıcılar** — incelemenin tarihi ve saati, cihazın modeli ve seri numarası, vücut bölgesi, hastanın yaşı: tek tek belirsiz, bir arada dar.
- **Piksellerin kendisi** — ultrason ve bazı başka yöntemler hastanın adını doğruca görüntünün içine yakar; oraya hiçbir etiket düzenlemesi erişemez. (Dışa aktarılmış bir resim için bu, üstveri aracının değil, [piksel düzeyinde karartmanın](https://abox.tools/tr/resim-karartma/) işidir.)

Buradaki görüntüleyicinin, dosyanızda hastayı neyin ve ne kadar doğrudan tanımladığını sıralayan bir paneli olması bundandır — standardın kendi listesinden kurulmuştur. Görüntüleyicinin yalnızca *okuması* da bundandır: DICOM dosyası yazan hiçbir kod içermez; çünkü “anonimleştirildi”, bir görüntüleyicinin atladığından çok daha yüksek bir çıtası olan bir vaattir — ve onu yarım tutan bir araç, hiç vermeyeninden beterdir.

## Taramaya, olduğu kayıt gibi davranmak

Alışkanlıklar yukarıdakilerin hepsinden kendiliğinden dökülür:

- **Yerelde bakın.** Wi-Fi kapalıyken çalışan bir görüntüleyici — buradaki çalışır — işin nerede olduğunu kanıtlamıştır. Diskle gelen görüntüleyici de, sizin makinenizde çalışıyorsa, gayet uygundur.
- **Mesele içerikse tıbbi kanallardan paylaşın.** Bir çalışmayı başka bir hastaneye göndermek, arkasında hesap veren altyapısıyla çözülmüş bir problemdir; içinde `.dcm` dosyalarıyla dolu bir `.zip` olan kişisel bir e-posta ise kaydınızın posta sunucularındaki kopyasıdır, süresiz.
- **Bir dosyayı paylaşmanız gerekiyorsa, önce içinde ne olduğunu bilin.** Başlığı ve kimlik panelini okuyun ki elden verdiğiniz şey sürpriz değil karar olsun — ve “usulünce anonimleştirilmiş” hâli, sizin uydurduğunuz bir onay kutusu değil, görüntüleme merkezinizin istendiğinde size borçlu olduğu bir hizmet sayın.
- **Diskin işten uzun yaşadığını unutmayın.** İndirilenler klasöründeki kopya ile çekmecedeki CD de eksiksiz kayıtlardır; tıpkı kimsenin sildiğini hatırlamadığı kimlik taraması gibi.

Bunların hiçbiri taramayı asla paylaşmayın demiyor — ikinci görüşler, kopyaların var olma sebebidir. Dediği şu: bu dosya sizin hakkınızda bir belgedir; o hâlde bu rehber grubunun tekrar tekrar vardığı iki soru burada da doğru sorulardır — kime teslim ediliyor, ve o teslimatın olması gerçekten gerekiyor muydu.
