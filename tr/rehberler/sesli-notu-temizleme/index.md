# Sesli not göndermeden önce nasıl temizlenir

Sesli not, otuz saniyelik cep hışırtısı, iki yanlış başlangıç ve telefonun uzaklığının belirlediği bir ses düzeyiyle gelir. Onu gönderilebilir yapmak iki adımdır — kes, sonra yükselt — ve ikisi de tarayıcınızda çalışır; özel şeyler söyleyen kendi sesinizin kaydının durması gereken yer de orasıdır.

[Ses Düzenleyici aracını açın](https://abox.tools/tr/ses-duzenleme/): Geriye oynatın, hızını değiştirin, sessiz bir kaydı yükseltin — hepsi burada, kendi makinenizde.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

1. **Kesin.** [Ses kırpıcıyı](https://abox.tools/tr/ses-kesme/) açın, notu içine bırakın ve çalarken kalacak bölümleri `I` ve `O` ile işaretleyin. Dalga biçimi, sessizlikleri ve yanlış başlangıçları düz çizgiler olarak gösterir; kesimin çoğu bu yüzden gözle yapılır. Tek bir dosya dışa aktarın.
2. **Yükseltin.** O dosyayı [Ses düzenleyiciye](https://abox.tools/tr/ses-duzenleme/) götürün ve normalleştirin: seviye, bir kaydın bozulmadan çıkabileceği en üst noktanın hemen altına yükselir. Dışa aktarın ve onu gönderin.

İkisi arasındaki yolculuk indirme istemez: kırpıcı dışa aktarır aktarmaz, indirme düğmesinin altındaki bir satır sonucu doğrudan düzenleyiciye taşımayı önerir ve not oraya yüklenmiş olarak varır.

İki adım da kendi makinenizde çalışır. Sesli not, bir dosyanın olabileceği en kişisel şeydir ve alışıldık “sesi çevrimiçi iyileştir” siteleri, kaydırıcının bedeli olarak bir kopyasını alır.

![Bir kayıt yüklenmiş ses düzenleyici: süresi, biçimi, örnekleme hızı ve eksi altı desibel civarında bir tepe seviyesi.](https://abox.tools/screens/clean-up-a-voice-memo/source.webp)

Siz hiçbir şeye dokunmadan önce aracın çıkardığı bilgiler. Tepe seviyesi, sesi yükseltmenin güvenli olup olmadığına karar veren sayıdır.

## Neden önce kesip sonra yükseltmeli

Çünkü normalleştirme, en gürültülü anı bulmak için dosyanın tamamını okur ve işlenmemiş bir notta en gürültülü an çoğu zaman tam da silmek üzere olduğunuz şeydir: bırakılan telefonun güm sesi, ikinci denemeden önceki öksürük. Önce normalleştirirseniz o tepe tavanı belirler ve ses girdiği kadar kısık çıkar. Molozu kesin; geriye kalan en gürültülü şey sesin kendisidir ve payın harcanması gereken yer orasıdır.

Kırpıcı tam örnek üzerinde keser ve her eki birkaç milisaniye yumuşatır; böylece oda uğultusunun ortasındaki bir kesik çıt edemez. Yalnızca ekler: aradaki dokunulmamış ses kopyalanır, yeniden kodlanmaz.

## Düzenleyicinin düzelttiği ve düzeltmediği

Normalleştirme *kısıklığı* düzeltir. Gürültülülüğü düzeltmez: klimanın seviyesi sesle birlikte yükselir, çünkü ortada tek bir kayıt vardır ve ikisi içinde beraber durur. Bir notu anlaşılır tutan şey çoğunlukla kesimdir — ölü hava, gürültünün tek başına duyulduğu yerdir — artı dinleyene saygı için hız denetimi: perdeyi koruyarak 1,25×, podcast'lerin numarasıdır ve dağılan bir notta da aynı ölçüde işe yarar.

Düzenleyici WAV yazar — birebir örnekler, arada kodlayıcı yok — bu yüzden dosya sıkıştırılmış orijinalden ağırdır. Dakikayla ölçülen bir not için bu, telefonun yaptığı ilk kayıplı kodlamanın üstüne bir ikincisini asla bindirmemenin adil bedelidir; onu gönderecek mesajlaşma uygulaması nasılsa bir kez daha sıkıştıracaktır ve o, tek seferi olmalıdır.

![Düzenleyici: 1,25 kata ayarlı bir hız kumandası, artı dört desibele ayarlı bir ses kumandası ve bunlardan çıkan süre, hız ve tepe değerinin özeti.](https://abox.tools/screens/clean-up-a-voice-memo/edit.webp)

Hız ve ses, altlarında ne yapacaklarını söyleyen özetle birlikte. Dışa aktarana kadar hiçbiri uygulanmaz, yani ikisi de oynatılıp geri alınabilir.

## Aynı zincir, daha uzun kayıtlar

Bir röportaj, bir ders, bir toplantı: zincir aynıdır, kesim yalnızca daha çok kazandırır. Önemli soruları işaretleyin, gerisini bırakın; işaretlerin kendisi de düz metin dosyası olarak kaydedilir ve geri yüklenir, bu da uzun bir temizliği bırakılıp devam edilebilen bir işe çevirir. Videonun içinde yaşayan ses içinse düzenleyici, görüntüye dokunmadan parçayı bir MP4 ya da MOV'dan da çıkarır: kayıtlı bir görüşmeyi yolda dinlenebilir bir şeye çevirmenin ilk adımı.

## Bunu her hafta yapıyorsanız

Kesmek ve yükseltmek bilerek iki sayfada yaşar: her biri tek bir iş yapar ve her biri kaydın makinenizden hiç ayrılmadığını tek başına kanıtlayabilir. Ama ikisi de açık kaynaktır: MIT lisansı, araç başına bir klasör, README'leri örnek hassasiyetindeki kesimleri ve WAV yazıcısını anlatan bağımlılıksız ES modülleri.

Notlar üstünüze her gün yağıyorsa, bir kod aracısını [depoya](https://github.com/A-Box-of-Tools/website) yönlendirin ve tek sayfalık sürümü isteyin: dalga biçimi, işaretler, dışa aktarırken normalleştirme. Modüller okunmak için yazıldı ve onları alıp götürmek, lisansın tam da var olma nedenidir.
