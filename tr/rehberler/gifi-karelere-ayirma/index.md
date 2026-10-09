# Bir GIF karelerine nasıl ayrılır

Kareleri çıkarmak bir bırakma ve bir düğme sürer. Anlamaya değen şey, bir GIF "karesi"nin gerçekte ne olduğudur; çünkü biçim, gördüğünüzden epeyce farklı bir şey saklar — ve on dördüncü karenizin neden birinin ağzından oluşan bir dikdörtgen olduğunun sebebi o farktır.

[GIF Ayırıcı aracını açın](https://abox.tools/tr/gifi-karelere-ayirma/): Her kare kendi PNG'si olarak dışarı.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[GIF Ayırıcı](https://abox.tools/tr/gifi-karelere-ayirma/)'yı açın, GIF'i bırakın; her kare indirebileceğiniz bir PNG olarak görünsün — teker teker ya da hepsi tek bir ZIP olarak. Ayarlara dokunmayın, çoğu insanın kastettiği şeyi tam olarak alın: her kare, canlandırmanın o anında göründüğü hâliyle, resmin tamamı olarak.

Bu sayfanın geri kalanı, sonrasında insanları şaşırtan üç şeyle ilgili: yalnızca küçük bir yamadan ibaret bir kare, başka bir yerde siyaha dönen saydamlık ve kareler ayrı dosyalar hâline geldiğinde artık var olmayan zamanlama.

## Bir GIF karesi gerçekte nedir

Bir GIF bir resim yığını değildir. *Tek* bir resim ve ardından gelen bir yamalar dizisidir.

İlkinden sonraki her kare, yalnızca değişen dikdörtgeni ve ardından tuvale ne yapılacağına dair bir kuralı saklar. Ekrandaki geri kalan her şey, düpedüz daha önceki karelerin orada bıraktığıdır. Durağan bir duvarın önünde konuşan bir insan, kare başına bütün bir resim yerine kare başına bir yüz dikdörtgenine mal olur ve hareket telafisi ile kayıplı adımı olmayan bir biçimin büsbütün kullanılmaz olmamasının bütün sebebi budur.

Yani "bana 14. kareyi ver"in eşit derecede dürüst iki farklı cevabı vardır ve araç ikisini de sunar:

**Göründüğü hâliyle kare.** O andaki resmin tamamı: kendinden öncekilerin üstüne çizilmiş 14. kare. Varsayılan budur ve bir kontak sayfası, bir küçük resim, paylaşılacak bir kare ya da bir video düzenleyicisine girecek kareler için istediğiniz de budur.

**Yalnızca o karenin sakladığı pikseller.** Yamanın kendisi, kendi boyutunda, kendi konumunda ve taşımadığı her şey saydam bırakılmış hâlde. 14. kare, ⁦60 × 40⁩ piksellik bir ağız olabilir. Bir GIF'in baytlarının nereye gittiğini açıklayan görünüm budur ve canlandırmadan resim devşirmek yerine canlandırmayı düzenliyorsanız istediğiniz de budur.

Saklanmış bir kare bir parça gibi göründüğünde dosyanızda yanlış bir şey yoktur. Dosya odur.

![Bir animasyonun numaralanmış on iki karesi, her biri tam bir resim olarak ve ekranda kalma süresiyle.](https://abox.tools/screens/split-a-gif-into-frames/frames.webp)

Her kare tam bir resim olarak, ki dosyanın içindeki bu değildir: bu bölüm o farkı anlatıyor.

## Elden çıkarma kuralı ve bazı karelerin neden delik bıraktığı

Her kare ayrıca, bir sonraki kare çizilmeden önce kendi dikdörtgenine ne olacağına dair dört talimattan birini taşır. Araç bunu, saklanmış görünümde her karenin altında gösterir:

**Ekranda kalır.** Alışılmış olan. Yama düştüğü yerde kalır ve bir sonraki kare üstüne çizer.

**Sonrasında kendi alanını temizler.** Bir sonraki kare düşmeden önce dikdörtgen silinir. Hareketli saydam bir nesnesi olan bir canlandırmanın yaptığı budur ve titreyen GIF'lerin klasik sebebi de budur.

**Altındakini geri getirir.** Tuval, bu kare çizmeden önceki hâline döner — bir damga, sonra bir geri alma. Nadirdir ve ev yapımı GIF okuyucularının en çok yanlış yaptığıdır.

Araçları karşılaştırıyorsanız bilmeye değer bir ayrıntı: belirtim, "alanını temizler"in *arka plan rengini* geri getirmesi gerektiğini söyler, ama 1990'lardan bu yana her tarayıcı bunun yerine *saydama* temizler; çünkü dönemin canlandırmalarının varsaydığı buydu. Bu araç bilerek tarayıcıları izliyor; böylece aldığınız kareler gördüğünüz kareler oluyor.

![Ayarlar kartı: karenin göründüğü hâli ile dosyada saklanan ham yaması arasında bir seçim ve saydam yerler için bir arka plan rengi.](https://abox.tools/screens/split-a-gif-into-frames/settings.webp)

Göründüğü hâl kipi, atma kurallarını yeniden oynatır ve size resim verir. Öbürü, dosyanın içinde gerçekte ne varsa onu verir, delikleriyle birlikte.

## Saydamlığa ne oluyor

GIF saydamlığı tek bittir. Bir piksel ya boyalıdır ya görünmezdir ve arası yoktur — yumuşak kenar yok, kısmi gölge yok. Saydam arka planı olan bir GIF'in sert ve hafif tırtıklı bir dış hattı olmasının sebebi budur.

PNG tam olarak bunu kayıpsız saklar; yani kareler saydamlıkları el değmemiş hâlde çıkar ve hiçbir şey uydurulmaz. Kareler saydamlığı anlayan bir yere gidiyorsa onu koruyun.

Gitmiyorsa bunun yerine bir renkle doldurun. Bir alfa kanalını yok sayan yazılım onu genellikle siyah olarak çizer; yani tarayıcıda gayet iyi görünen bir kare siyah arka planla varır — ve neredeyse her yerinde saydam olan saklanmış bir yama, içinde bir ağız olan siyah bir dikdörtgen olarak varır. Rengi baştan seçmek çözümdür. PNG'nin içine yazılır ve sonradan geri alınamaz; varsayılan olmamasının tek sebebi de budur.

## Karelerin taşıyamadığı şey: zamanlama

Bir PNG'nin, ekranda ne kadar kaldığını kaydedecek bir yeri yoktur. Bir canlandırmayı PNG'lere ayırın, zamanlama gitsin; onu yeniden birleştirmek istediğiniz an bu önemli olur.

ZIP'in içindeki `frames.txt` bunun içindir. Her karenin gecikmesini, konumunu ve boyutunu listeler; böylece canlandırma [GIF Yapıcı](https://abox.tools/tr/gif-olusturma/)'da ya da başka bir yerde yeniden kurulabilir. Birkaç kilobayta mal olur ve sonradan yeniden kurmanın bir yolu yoktur.

GIF gecikmeleri hakkında herkesi yakalayan iki şey:

**Birim, saniyenin yüzde biridir**, yani biçimin sahip olduğu en ince adım 0,01 sn'dir. Tam olarak 30 fps olan bir GIF diye bir şey yoktur; kare başına 0,03 sn, 33,3 fps'dir ve 0,04 sn 25'tir.

**0,02 sn'nin altındaki her şey 0,10 sn'de oynatılır.** Tarayıcılar bunu 1990'lardan beri sınırlıyor — dönemin dönen dünya simgeleri için yazılmış ve hiç kaldırılmamış bir kural. Dosyası kare başına 0,01 sn diyen bir GIF 100 fps iddia eder ve 10'da oynar. Araç gecikmeyi gerçekten oynatıldığı hâliyle gösterir ve ikisi farklıysa dosyanın ne sakladığını da yanında söyler; çünkü ayırıp yeniden kurduğunuz bir GIF'in özgününden yavaş çıkmasının sebebi o farktır.

## Kare numaraları ve neden sıfırla dolduruldukları

Kareler `ad-001.png`, `ad-002.png` olarak, birden başlayıp son sayının genişliğine kadar sıfırla doldurularak numaralanmış hâlde çıkar. Bu bir süs değildir: `frame9.png`, her dosya yöneticisinde ve bir dizi içe aktaran çoğu yazılımda `frame10.png`'den *sonra* sıralanır; çünkü sayı değil metin sıralarlar. Doldurulmuş adlar her yerde doğru sıralanır ve görüntü dizisi içe aktaran her video düzenleyicisi bunları bekler.

Uzun bir canlandırmayı "her ikinci kareyi tut" ile seyreltmek hiçbir şeyi yeniden numaralamaz. 42. kare hâlâ 42. kare diye adlandırılır; böylece dosyalar hem özgününe hem de zamanlama listesine hizalanır.

## Bunun neden bir sunucuya ihtiyacı yok

Bir GIF okumak iki iştir: dosyanın bloklarını gezmek ve piksellerinin sarıldığı LZW sıkıştırmasını geri almak. İkisi birlikte birkaç yüz satırdır, depoda yazılıdır ve kendi makinenizde çalışır — sayfanın ağ fişi çekilmişken çalışmaya devam etmesinin sebebi de budur.

Tarayıcınız bir GIF'i zaten oynatabilir, ama size parçalarını vermez: bir `<img>` size bir canlandırma verir, birini bir tuvale çizmek size sonsuza kadar ilk kareyi verir ve daha fazlasını yapan tek API Safari'de yoktur. O yüzden biçim burada, her tarayıcıda aynı şekilde okunuyor — ve onu kendiniz okumanız, size yamaları ve elden çıkarma kurallarını göstermeyi de mümkün kılan şey.

[Çevrimiçi dönüştürücülere dosya yüklemek güvenli mi?](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) size bu araç dâhil herhangi bir araç hakkında aynı şeyi söyleyecek dört denetim anlatıyor.
