# Uzun bir video hızlandırılmış çekime nasıl çevrilir

Bir saatlik gün batımı, bir günlük şantiye, ön camdan her günkü yol: saklamaya değer ama kimsenin o hızda izlemeyeceği görüntü. İş, biri zaman biri varış yeri hakkında iki karardan ibarettir ve hepsi tarayıcınızda, makinenizden hiç ayrılmayan bir dosya üzerinde çalışır.

[Time-Lapse Yapıcı aracını açın](https://abox.tools/tr/time-lapse-video-olusturma/): Bir saatlik görüntü, yirmi saniyede.

Son güncelleme 26 Ağustos 2026

## Kısa yanıt

[Hızlandırılmış çekim aracını](https://abox.tools/tr/time-lapse-video-olusturma/) açın, kaydı içine bırakın ve ya bir hız belirleyin — 1,1× ile 1000× arasında herhangi bir değer — ya da hiç hesap yapmadan sonucun ne kadar sürmesi gerektiğini söyleyin. Akışa girecek her şey için altmış saniye iyi bir başlangıçtır. Saniyedeki kare sayısını seçin, kaynak 4K ise boyutu küçültün ve dışa aktarın.

Varış yeri yalnızca GIF oynatıyorsa, dışa aktardığınız klibi ardından [Videodan GIF](https://abox.tools/tr/videoyu-gife-donusturme/) dönüştürücüsünden geçirin; ama önce son bölümü okuyun, çünkü hızlandırılmış çekim, bir GIF'ten taşımasını isteyebileceğiniz en pahalı yüktür.

Bu yolculuk baştan kuruludur: dışa aktarmadan sonra, indirme düğmesinin altındaki bir satır sonucu doğrudan dönüştürücüye taşımayı önerir ve klip oraya yüklenmiş olarak varır.

## Hızı değil, süreyi söyleyin

“Ne kadar hızlı” yanlış sorudur, çünkü dürüst yanıt yapmak zorunda olmamanız gereken bir bölme işlemidir: doksan dakikalık görüntüyü bir dakikalık sonuca sığdırmak 90× eder; bir şantiye gününü otuz saniyeye sığdırmak ise herhangi bir kaydırıcının önerdiğinden çok 3000× civarına düşer. Araç hedef süreyi doğrudan alır ve çarpanı kendisi hesaplar; böylece yanıt, içine daha uzun bir kayıt attığınız güne de dayanır.

Hız çarpanının hâlâ işe yaradığı yer küçük sayılardır. 1,1× ile 2× arasında bir video *video olarak izlenebilir* kalır — bir ders, bir gösterim — ve aşağı yukarı 8× üzerinde hızlı oynatma olmaktan çıkıp hızlandırılmış çekime dönüşür: artık her çıkış karesi zaman akışından alınmış bir örnektir ve örneklerin arasındaki her şey düpedüz yok olmuştur.

Bu örnekleme, işin hızlı olmasının da nedenidir. Araç bir saati çözüp bir dakikasını tutmak yerine yalnızca çıkışın ihtiyaç duyduğu anları okur — 100× hızda dosyanın yaklaşık yüzde biri.

![Hız kartı: yirmi kat hız, bundan çıkan süre, tutulan kareler arasındaki aralık ve bir kare hızı.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

İstediğiniz süreyi söyleyin, hız ardından gelsin, ya da tersi. Aralık, özgün klibin ne kadarının atlandığını söyleyen sayıdır.

## Kareler ve boyut, kısaca

- **Saniyedeki kare.** 30, hemen her şey için akıcı hareket olarak okunur; 60, iki katı ağırlığını ancak hareketin kendisi konuysa hak eder; 24 ise bulutlara ve kalabalıklara hoş bir film tıkırtısı verir.
- **Boyut.** Hızlandırılmış çekim neredeyse hep küçük ekranda izlenir. 4K'yı 1080p'ye indirmek kodlayıcının anlatması gereken pikselleri dörtte bire düşürür ve telefon ekranında bunu kimse asla bilemez.

![Dışa aktarma kartının özeti: kare sayısı, aralık, bitmiş süre, tahmini boyut ve dosyanın ne kadarının okunacağı.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

Fark edilmeye değen son satırdır: bir hızlandırılmış çekim dosyanın küçük bir bölümünü okur; yeniden kodlaması bir saat sürecek bir klipte bunun hızlı olmasının nedeni budur.

## Hızlandırılmış çekim ne zaman GIF olmak ister

Neredeyse hiçbir zaman. Hızlandırılmış çekim, tüm karenin sürekli değişmesidir — GIF sıkıştırmasının en kötü olduğu şey tam da budur — bu yüzden kısa bir tanesi bile onlarca megabayta çıkarken MP4 bunun onda biri ağırlığında ve daha nettir. Videonun oynadığı her yerde videoyu paylaşın.

Varış yeri gerçekten yalnızca GIF oynatıyorsa, diziyi [dönüştürücünün zaman çizelgesinde](https://abox.tools/tr/videoyu-gife-donusturme/) döngüye girecek birkaç saniyeye kırpın, genişliği mütevazı tutun ve kare sayısının ⁦10–12⁩'ye inmesine izin verin. [Kısmi GIF rehberi](https://abox.tools/tr/rehberler/videonun-bir-kisminden-gif/) bu bütçenin uzun anlatımıdır.

## Bunu her hafta yapıyorsanız

İki adımın burada iki sayfada yaşaması bilinçli bir tercihtir: her sayfa tek bir iş yapar ve her biri hiçbir şeyin makinenizden ayrılmadığını tek başına kanıtlayabilir. Ama iki sayfanın çalıştırdığı her şey açık kaynaktır: MIT lisansı, araç başına bir klasör, her birini adıyla anan README'lere sahip bağımlılıksız ES modülleri.

Tripoddaki bir kamera rutininizin parçasıysa, bir kod aracısını [depoya](https://github.com/A-Box-of-Tools/website) yönlendirin ve örnekleyiciyle GIF kodlayıcısını, sizin hızınız ve boyutunuz baştan ayarlı tek bir sayfada birleştirmesini isteyin. Modüller okunmak için yazıldı ve onları alıp götürmek, lisansın tam da var olma nedenidir.
