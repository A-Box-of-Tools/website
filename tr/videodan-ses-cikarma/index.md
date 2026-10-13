# Videodan Ses Çıkarma — sesin kendisi, WAV olarak

Bir video bırakın, sesini alın. Görüntü hiçbir zaman çözülmez ve hiçbir şey yüklenmez.

> Bir MP4, MOV veya WebM dosyasındaki sesi alıp WAV olarak kaydedin. Video cihazınızdan çıkmaz ve görüntüsü hiçbir zaman çözülmez; işin tamamı kendi tarayıcınızda yürür.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/videodan-ses-cikarma/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## videolarınız **asla yüklenmez**. Sunucu yoktur.

Çözücü, tarayıcınızda zaten bulunan çözücüdür — bir dosyayı `<video>` ögesinde oynatan kod yolunun aynısı — ve ondan yalnızca ses izi istenir. WAV yazmak, örneklerin önüne kırk dört baytlık bir başlık koymaktır; `src/shared/wav.js` içinde durur. Döngüde hiçbir kodlayıcı yoktur, yükleme adımı yoktur ve bu sayfanın herhangi bir ağ işlevi hiç bulunmaz.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Boyut sınırı yok
- ✓ Çevrimdışı çalışır
- ✓ Açık kaynak

## Bir videonun sesi yüklemeden nasıl çıkarılır

1. **Videoyu bırakın.** Telefondan, kameradan, ekran kaydedicisinden ya da bir indirmeden gelen bir MP4, MOV, M4V veya WebM. Onu kendi tarayıcınız okur; atlanacak bir yükleme adımı yoktur.
2. **Ne bulduğunu okuyun.** Süre, kanal sayısı ve örnekleme hızı, doğrudan dosyanın içinden. Dosya kendi hızını bildirmediyse sayfa bunu söyler; sessizce yeniden örnekleyip hiçbir şeye dokunulmadığını iddia etmez.
3. **Daha küçük olsun isterseniz mono seçin.** Kanalları olduğu gibi bırakmak kaydı tam olarak eski hâlinde tutar. Monoya indirgemek dosyayı yarıya düşürür ve bir deşifre ya da bir ses kaydının istediği budur; kanallardan birini atmak yerine ortalamasını alır.
4. **Kaydetmeden önce dinleyin.** Oynatıcıdaki, birazdan indirilecek olan dosyadır, video değil; yani kulağa doğru geliyorsa indirme de doğrudur.
5. **Alın ya da devam ettirin.** WAV'ı indirin ya da önce kaydetmeden doğrudan kesiciye veya düzenleyiciye gönderin.

## Kutuda ayrıca

- [Ses Kesici](https://abox.tools/tr/ses-kesme/): Tutmaya değer parçaları oynarken işaretleyin. Onları tek dosya olarak, tam söylediğiniz yerden kesilmiş hâlde geri alın.
- [Ses Düzenleyici](https://abox.tools/tr/ses-duzenleme/): Geriye oynatın, hızını değiştirin, sessiz bir kaydı yükseltin — hepsi burada, kendi makinenizde.
- [PDF Birleştirici ve Bölücü](https://abox.tools/tr/pdf-birlestirme/): Sunucuya gidip gelmeden yerinden oynatılmış sayfalar.
- [PDF Sıkıştırıcı](https://abox.tools/tr/pdf-sikistirma/): Belgeyi hiçbir yere göndermeden küçültün.

## Sorular

### Videom bir yere yükleniyor mu?

Hayır. Çözme de yazma da kendi tarayıcınızda, kendi donanımınızda olur. Bu aracın herhangi bir ağ işlevi hiç yoktur — hiçbir zaman bir şey indirmez ve hiçbir zaman bir şey göndermez — ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi sayar; hiçbiri bize ait değildir. Söylenene güvenmek yerine denetlemeyi yeğliyorsanız internet bağlantısını kesin ve sesi yine de çıkarın.

### Bana MP3 verebilir mi?

Hayır, ve verebiliyormuş gibi de yapmaz. Hiçbir tarayıcı MP3 kodlayıcısı ile gelmez ve bir kodlayıcıya ulaşmanın tek yolu videonuzu böyle bir kodlayıcısı olan bir sunucuya göndermektir — bu site tam da bunu yapmamak için vardır. Elde ettiğiniz şey bir WAV'dır: örneklerin önünde kırk dört baytlık bir başlık; hiçbir kodlayıcı gerektirmez ve hiçbir kalite kaybına yol açamaz. Daha büyüktür, stereoda dakikada yaklaşık on megabayt, ve her oynatıcı, telefon ve düzenleyici açar. MP3 isteyen bir şey bundan saniyesinde bir MP3 üretebilir.

### Görüntüye hiç bakılıyor mu?

Hayır, ve burada ona bakabilecek hiçbir şey yok. Tarayıcının çözücüsüne dosya verilir ve ondan ses izi istenir; video izi hiçbir zaman çözülmez, hiçbir zaman çizilmez ve bu sayfanın koduna hiç ulaşmaz. `src/` içinde çalıştırılacak bir video çözücüsü yoktur. Çıkan dosyanın içinde ses vardır, başka bir şey yoktur.

### Ses okunamadı diyor ama video gayet iyi oynuyor.

O hâlde videonun neredeyse kesinlikle hiç ses izi yoktur. Mikrofon seçilmeden alınmış bir ekran kaydı sessizdir; sesi kapalı bırakılarak bir düzenleyiciden dışa aktarılmış bir klip de öyledir. İkisi de kusursuz oynar, çünkü oynatılacak bir görüntü vardır. İleti bu olasılığı önce anar, çünkü ikisinden daha olası olanı budur; diğeri ise bu tarayıcının okumayacağı bir biçimdir. Dosyayı bir oynatıcıda açın ve hiçbir işe yaramayan bir ses düzeyi denetimi arayın: hangisiyle karşı karşıya olduğunuzu anlamanın en hızlı yolu budur.

### Hangi video biçimlerini açabilirim?

Tarayıcınızın çözdüğü her şeyi; pratikte bu MP4, M4V, MOV ve WebM demektir, ayrıca bütün ses biçimleri. Dışarıda kalanlar bu sitenin her yerindeki aynı kısa listedir: AVI, WMV ve MKV'lerin çoğu. Tarayıcınızın okumayacağı bir dosya, yarı yolda tökezlemek yerine bunu söyleyen bir iletiyle geri çevrilir.

### Kalite kaybı oluyor mu?

Videonun oluşturulurken kendi sesine zaten yaptığının ötesinde hiçbir kayıp olmaz. Çözücünün geri verdiği örnekler olduğu gibi yazılır: ikinci bir kodlama yoktur, dolayısıyla ikinci bir kayıp kuşağı da yoktur. Bilinmesi gereken tek şey örnekleme hızıdır: dosyanın kendi hızı önce başlığından okunur ve çözme o hızda yapılır, böylece kaydınız sessizce yeniden örneklenmez. Bir dosya hız bildirmiyorsa, sayfa hangi hızı varsaydığını söyler.

### WAV neden videodan bu kadar büyük?

Çünkü WAV sıkıştırılmamıştır, videonun ses izi ise sıkıştırılmıştı. CD kalitesindeki ses, içeriği ne olursa olsun stereoda dakikada yaklaşık on megabayt tutar; bir MP4'ün içindeki AAC izi belki bunun onda biri. Monoya indirgemek bunu yarıya düşürür. Bu, yeniden kodlamamanın bedelidir ve bir kez ödenir: dosyayı bundan sonra neyle açarsanız açın, o sıkıştırabilir.

### Ne kadar uzun bir videoyu işleyebilir?

Burada konulmuş bir sınır yoktur, çünkü bunun bedelini ödeyen bir sunucu yoktur. Gerçek tavan kendi cihazınızın belleğidir: dosya okunur ve bütün ses izi örnek olarak bellekte tutulur, dolayısıyla küçük bir cihazda çok uzun bir kaydın yeri dolabilir. Birkaç saatlik video genellikle sorun çıkarmaz ve bir telefon dizüstünden daha azını kaldırır.

### Kısaltabilir ya da sesini yükseltebilir miyim?

Evet, ama burada değil: bu sayfa tek bir iş yapar. Bir sonuç oluştuğunda indirme bağlantısının yanında, onu önce kaydetmeden doğrudan [ses kesiciye](https://abox.tools/tr/ses-kesme/) ya da [ses düzenleyiciye](https://abox.tools/tr/ses-duzenleme/) taşıyan bir bağlantı sırası belirir; ikisi de onu yüklemez.

### Ücretsiz mi, hesap gerekiyor mu?

Ücretsizdir; hesap, oturum açma, deneme süresi ve kaç video açacağınıza dair bir sınır yoktur. Sitede reklam vardır, masrafı karşılayan da odur; reklamlara dosyanızla ilgili hiçbir şey verilmez.

### Çevrimdışı çalışır mı?

Evet. Sayfayı bir kez yükleyin, sonra internet bağlantısını kesin; çalışmayı sürdürür. Bu aynı zamanda hiçbir şeyin yüklenmediğini kanıtlamanın en basit yoludur: videonuzu işlenmek üzere gönderen bir araç, fişi çektiğiniz anda dururdu.

## Gizlilik iddiası nasıl doğrulanabilir

- **Videonuzun gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bize ait değildir. Burada bir dosyanın toplanabileceği hiçbir uç nokta yoktur; olsaydı bile kodda onu oraya gönderecek hiçbir şey yoktur.
- **Görüntü hiçbir biçimde çözülmez.** Yalnızca ses izi istenir. Kareler okunmaz, çözülmez, çizilmez ve bakılmaz — bu sayfada bunu yapabilecek hiçbir kod yoktur — ve çıkan dosyanın içinde ses vardır, başka bir şey yoktur. Bu, kendini tutmaya dair bir söz değildir: `decodeAudioData`'ya baytlar verilir ve o ses döndürür; `src/` içinde çalıştırılacak bir video çözücüsü yoktur.
- **Çözücü, tarayıcınızda zaten bulunan çözücüdür.** Biçiminizi okumak için buraya hiçbir şey gönderilmez, okumak için bu sayfanın dışındaki hiçbir şeyden de yardım istenmez. Hangi dosyaların çalıştığı bu yüzden tam olarak tarayıcınızın zaten oynattığı dosyalardır.
- **Örnekler yeniden kodlanmaz, olduğu gibi yazılır.** Bir WAV, çözücünün geri verdiği örneklerin önüne bir başlık konmuş hâlidir. Döngüde kaydınız hakkında karar veren bir kodlayıcı yoktur ve böyle bir şeyin olabileceği, yükleme diye tarif edilebilecek hiçbir adım yoktur.
- **Google'ın yüklediği ve kendisine verilmeyen şeyler.** Reklam ve ölçüm betikleri Google'dan, bağış düğmesi ise Buy Me a Coffee'den gelir. Hiçbirine videonuzla ilgili bir şey verilmez: ne dosya, ne örnek, ne ad, ne boyut, ne de süre.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, araç hiç değişmez; çünkü içinde zaten hiç ağ adımı olmadı. Bundan daha basit bir kanıt yoktur.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, buradaki tek çözücü ve görüntünün neden hiç istenmediği için `src/shared/audio-decode.js`, kaydınızın sessizce yeniden örneklenmesini engelleyen başlık okuması için ise `src/shared/samplerate.js`.
