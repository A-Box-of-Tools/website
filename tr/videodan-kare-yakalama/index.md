# Video Kare Yakalayıcı — videodan kare kaydedin

Herhangi bir andan tam kaliteli bir kare.

> Bir MP4, MOV veya WebM'in herhangi bir karesini tam boyutlu PNG ya da JPEG olarak kaydedin. Kare kare ilerleyin ya da birkaç saniyede bir alın. Tarayıcınızda çalışır: hiçbir şey yüklenmez.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/videodan-kare-yakalama/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## videolarınız **asla yüklenmez**. Sunucu yoktur.

Kareler kendi tarayıcınız tarafından, kendi donanımınızda bulunur, çözülür ve çizilir. Buradaki hiçbir şey bir şey getiremez ya da gönderemez — bu araçta hiçbir türde ağ özelliği yok — ve olsaydı bile bu sayfanın öbür ucunda bir videonun gönderilebileceği bir sunucu yok.

- ✗ Yükleme yok
- ✗ Hesap yok
- ✗ Filigran yok
- ✓ Tam çözünürlük
- ✓ Çevrimdışı çalışır

## Bir videodan kare nasıl yakalanır

1. **Bir video seçin.** Seçiciye bir MP4, MOV, M4V ya da WebM bırakın veya elle seçin. Tarayıcı onu doğrudan diskinizden okur; siz bunu yaparken hiçbir yere hiçbir şey gönderilmez.
2. **Anı bulun.** Oynatıp istediğiniz yerde durdurun ya da kaydırıcıyı sürükleyin — bir MP4'te kaydırıcı adım başına bir kare ilerler, yani gördüğünüzle kaydettiğiniz arasında yuvarlama olmaz. Ok tuşları birer kare atlar, `Shift` basılıyken onar.
3. **Bir biçim seçin.** PNG, kareyi çözüldüğü hâliyle tam olarak saklar; burada "tam kalite" bu demektir. JPEG ve WebP daha küçüktür ve videonun kendi sıkıştırmasının üzerine ikinci bir sıkıştırmadır; bu bir ön izleme için sorun değildir, sonradan düzenlenecek bir şey için değildir.
4. **Bir kare ya da bir dizi yakalayın.** Tek kare doğrudan indirmelerinize gider. "Her N saniyede bir" klibi bir kez gezer ve her işarette bir kare alır — kontak baskısı ve küçük resimler için kullanışlıdır — ve bunlar yüz tane kaydetme sorusu yerine tek bir ZIP olarak çıkar.

## Uzun sürüm

[Bir videodan kare nasıl resim olarak kaydedilir](https://abox.tools/tr/rehberler/videodan-kare-yakalama/): Bir klipten gerçek çözünürlüğünde kare alın: duraklatılmış bir oynatıcının ekran görüntüsü neden aynı resim değildir, hangi biçimde kaydetmelisiniz ve tam olarak istediğiniz kareye nasıl konarsınız.

## Kutuda ayrıca

- [Videodan GIF'e](https://abox.tools/tr/videoyu-gife-donusturme/): Bölümü, boyutu ve kare hızını siz seçin.
- [GIF Yapıcı](https://abox.tools/tr/gif-olusturma/): Bir dizi resmi tek bir animasyona çevirin.
- [GIF Ayırıcı](https://abox.tools/tr/gifi-karelere-ayirma/): Her kare kendi PNG'si olarak dışarı.
- [GIF Çözümleyici](https://abox.tools/tr/gif-analiz-etme/): Kareler, gecikmeler, paletler ve her baytın nereye gittiği.

## Sorular

### Videom herhangi bir yere yükleniyor mu?

Hayır. Kendi donanımınızda, kendi tarayıcınız tarafından okunur ve çözülür. Bu aracın sunucu tarafı yoktur ve sayfanın `Content-Security-Policy`'si iletişim kurabileceği her adresi tek tek sayar — bunların hiçbiri bu siteye ait değildir. Size söylenene güvenmek yerine denetlemeyi tercih ediyorsanız internet bağlantısını kesin ve yine de bir kare yakalayın.

### "Tam kalite" tam olarak ne demek?

İki şey. Kare, sayfadaki ön izlemenin boyutunda değil videonun kendi çözünürlüğünde kaydedilir — 4K bir klip ⁦3840 x 2160⁩ bir görsel verir. Ve PNG seçiliyken kare, çözücüden çıktığı hâliyle tam olarak saklanır; yani dosya, videonun taşıdığı görüntüyü, üzerine ikinci bir sıkıştırma turu binmeden taşır. Bir oynatıcı penceresinin ekran görüntüsü bunların ikisini de vermez: o, pencerenin boyutundadır ve oynatıcı görüntüyü ölçekleyip renk yönetiminden geçirdikten sonra alınmıştır.

### Hangi video biçimlerinden kare alabilirim?

MP4, M4V ve MOV içlerinde ne olursa olsun doğrudan okunur: H.264, HEVC, AV1 ya da VP9 — yeter ki tarayıcınız o kodlayıcıyı çözebilsin. Aracın tek tek karelere eriştiği tam yol budur. Tarayıcınızın oynatabildiği başka her şey — en bilineni WebM — oynatıcı aranıp gösterdiği çizilerek ele alınır; bu da yine tam boyutlu bir görsel kaydeder ama sizin istediğiniz kareye değil oynatıcının seçtiği kareye denk gelir. Tarayıcının ne okuyabildiği ne de oynatabildiği bir dosya, ki pratikte AVI, WMV, FLV ve çoğu MKV demektir, bunu söyleyen bir mesajla geri çevrilir.

### Kare kare ilerleyebilir miyim?

Bir MP4'te evet, tam olarak: araç dosyanın kendi kare listesini okur, yani ok tuşları gerçekten içinde bulunan görüntüler arasında hareket eder — kare hızı gezinen bir klipte bile, ki orada saniyenin otuzda biri gibi sabit bir adım kayardı. Oynatma yolunda böyle bir liste yoktur; bu yüzden bir adım yaklaşık bir kare kadar bir dürtmedir ve sayfa bunu söyler.

### Dikey çekilmiş telefon videom neden burada doğru duruyor?

Çünkü dönüş bilinçli olarak uygulandı. Bir telefon yatay çeker ve pikselleri döndürmek yerine dosyaya çeyrek dönüş yazar; dolayısıyla bir çözücünün verdiği kare yan yatmıştır ve her oynatıcı onu ekranınıza giderken döndürür. Bu adımı atlayan bir araç, doğru anın makul görünen ama yan yatmış bir görüntüsünü kaydeder. Bu araç dönüşü parçadan okur ve hiçbir şey çizilmeden önce uygular.

### Videonun boyutunda veya uzunluğunda bir sınır var mı?

Araçta yerleşik bir sınır yok ve dosya belleğe bir seferde tümüyle okunmuyor — her seferinde birkaç megabaytlık parçalar hâlinde geziliyor; uzun bir klibin kısa bir klip kadar hızlı açılmasının sebebi de bu. Aldığınız kareler indirene kadar sayfada tutulur; yani pratik tavan videonun kendisi değil, birkaç yüz tane 4K PNG'dir.

### Kareyi sonradan yeniden boyutlandırabilir veya kırpabilir miyim?

Burada değil, yan kapıda. Bu araç kareyi olduğu gibi kaydeder; boyutunu ya da şeklini değiştirmek kendi kararlarını içeren ayrı bir iştir ve [Görsel Boyutlandırıcı](https://abox.tools/tr/resim-boyutlandirma/) ikisini de yapar, o da hiçbir şey yüklemeden. Görüntüyü değiştirmeden dosyayı küçültmek ise [Görsel Sıkıştırıcı](https://abox.tools/tr/resim-sikistirma/)'nın işi.

### Ücretsiz mi, hesap açmam gerekiyor mu?

Ücretsiz; hesap yok, giriş yok, deneme süresi yok, filigran yok. Sitede reklam var, masrafı karşılayan da o; reklamlara videonuz hakkında hiçbir şey verilmiyor.

## Gizlilik iddiası nasıl doğrulanabilir

- **Videolarınızın gidecek bir yeri yok.** Content-Security-Policy, bu sayfanın iletişim kurabileceği her adresi tek tek sayar ve bunların hiçbiri bu siteye ait değildir. Dosyalarınızın toplanabileceği bir uç nokta burada yok, olsaydı bile onu oraya gönderecek bir kod yok.
- **Burada hiçbir şey bir şey getirmiyor.** Bu araçta hiçbir türde ağ özelliği yok: yapıştırılacak bir adres, indirilecek bir şey, ilk kullanımda getirilen bir motor yok. Videonuza dokunan her bayt, sayfa yüklenirken bu kaynaktan geldi.
- **Çözme işi yerelde.** Kareler kendi tarayıcınızdaki WebCodecs'ten geçer ya da klibi zaten size gösterecek olan aynı oynatma motorundan. Görüntü bu makinede bir tuvale çizilir ve doğrudan bir indirmeye verilir.
- **Dosya birkaç megabaytlık parçalar hâlinde okunuyor.** Video, buradaki dosya türleri içinde belleğe güvenilir biçimde sığmayacak olanıdır; bu yüzden asla bütün olarak yüklenmez. Okuyucu, istediğiniz karenin çevresinden bir pencere alır — iki gigabaytlık bir klibin küçük bir tanesi kadar hızlı açılmasının sebebi de budur.
- **Google neyi yüklüyor, neyi almıyor.** Reklam ve ölçüm betikleri Google'dan geliyor. Hiçbirine videonuz hakkında bir şey verilmiyor: ne bir dosya, ne bir kare, ne bir ad, bir boyut, bir uzunluk ya da durduğunuz an. Okuyan, çözen ya da çizen her satır bu kaynaktan sunuluyor ve depoda listeleniyor.
- **Bağış düğmesi neyi yüklüyor, neyi almıyor.** Başlıktaki "Buy me a coffee" düğmesini cdnjs.buymeacoffee.com'dan gelen bir betik çiziyor ve harflerini Google Fonts'tan alıyor. O bir bağlantıdan ibarettir: hiçbir ziyareti bildirmez ve ona ne sizin ne de videonuz hakkında bir şey verilir.
- **Çevrimdışı çalışır.** Ağ bağlantısını kesin, bu sayfadaki her şey çalışmaya devam eder. Hepsinin içindeki en basit kanıt bu.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, bir MP4 içindeki kareleri bulan okuyucu için `src/shared/mp4-reader.js` ve istediğiniz kareyi çözen bölüm için `src/frames.js`. İkisi de istek yapabilecek bir şeyi içeri almaz.
