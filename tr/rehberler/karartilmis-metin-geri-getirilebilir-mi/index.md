# Karartılmış metin geri getirilebilir mi?

Rahatsız edecek kadar sık: evet — laboratuvarla değil, metin seçme aracıyla. Siyah dikdörtgenlerin çoğu kelimelerin *üstüne* çizilir ve yanlarına kaydedilir; kelimeler de altta yolculuğa devam eder. Bu sayfa bunun gerçekleşme yollarının ve silmenin aslında ne demek olması gerektiğinin kataloğudur.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Rahatsız edecek kadar sık: evet. Adli bilişimle değil — karartılmış alanı seçip kopyalaya basmakla. İnsanların bir şeyi gizlemek gerektiğinde uzandığı araçların çoğu, içeriğin *üstüne* bir dikdörtgen çizer ve onu içeriğin *yanına* kaydeder; alttaki her şey de dosyanın içinde, sabırla, biri bakana kadar yolculuğunu sürdürür.

Bu, özensiz insanların düştüğü ender bir hata değildir. Mahkeme dosyalarından adlar, resmi raporlardan karartılmamış rakamlar yayımladı — ve Aralık 2025'te bir dava belgelerinin toplu yayımında, karartılmış adlar saatler içinde okunur haldeydi. O hataların arkasındaki insanların avukatları ve prosedürleri vardı. Olmayan şey, bu sayfanın konusu olan ayrımdı: örtmekle silmek arasındaki fark.

## Nesne olan dikdörtgen

Bir PDF okuyucuda, kelime işlemcide, sunum programında ya da katmanlı bir resim düzenleyicide çizilen siyah kutu boya değildir. Bir *nesnedir*: konumu, boyutu ve rengi olan, dosyada kendi başına saklanan bir şekil — ve arkasındaki metin bütünüyle yerli yerindedir. Belge “bu kelime gitti” demez; “bu kelime burada, önünde de bir dikdörtgen var” der.

Gerisi bundan çıkar. Alanı seçip kopyalayın; pano metni alır, çünkü kopyalamak metin katmanını okur ve önündeki süsü görmez. Dosyayı bir düzenleyicide açın; dikdörtgen kenara itiliverir. Başka bir biçime aktarın; katmanlar başka bir sırayla düzleştirilebilir. Ekranda kutu, gerçek bir karartmayla tıpatıp aynı görünür ve hatanın her incelemeden sağ çıkmasının sebebi tam da budur: göz sayfayı denetler ve sayfa doğru görünür.

PDF daha sessiz bir çeşit de ekler. Bir PDF, bir dizi glifin çizilenden başka bir şey “hecelediğini” bildirebilir — `/ActualText` adlı bir erişilebilirlik özelliği — ve kopyalamak mürekkebi değil o bildirimi okur. Yani bir belge, sayfada görünmeyen bir kelimeyi bile sızdırabilir.

## Aritmetik olan bulanıklık

Mozaiklemek olduğundan güvenli hissettirir. Mozaik bir ortalamalar ızgarasıdır ve ortalama, altta yatanın bir *ölçümüdür*: küçük ve kayıplı, ama yine de ölçüm. Bilinen bir yazı tipindeki, kestirilebilir boyuttaki metin için bu, geri okumaya yetti: akla yatkın her diziyi al, çiz, aynı şekilde mozaikle ve mozaiği tutan adayı sakla. Bunların hiçbiri laboratuvar istemez; bir döngü ve bir karşılaştırmadır.

Bulanıklaştırma ilkece daha kötüdür. Bulanıklık bir evrişimdir — her çıkış pikseli komşularının ağırlıklı ortalaması — ve evrişimler yeterince iyi, yeterince sık geri çalıştırılabilir; ters evrişim fotoğrafçılığın olağan aracıdır, egzotik bir saldırı değil. İki etkinin matematiğe hiç bağlı olmayan ortak bir kusuru da var: bir şeyin gizlendiğini ve aşağı yukarı ne kadar uzun olduğunu ilan ederler — altı karakterlik bir parola için bu bile bir ipucudur.

Düz dolgunun bu özelliklerin hiçbiri yoktur. Tek renk, kenardan kenara, hiçbir şeyin ölçümünü taşımaz. Buradaki [resim karartma aracının](https://abox.tools/tr/resim-karartma/) varsayılanı bu yüzden odur; mozaik ve bulanıklaştırma seçeneklerinin, vaat etmediklerini kendi etiketlerinde söylemesi de, kuvvet ayarının sıfatla değil sayıyla konuşması da bu yüzden.

## Dosyanın kendi geçmişinden sakladığı kopyalar

Üçüncü hata ailesinin örtmeyle hiç ilgisi yok. Dosyalar, ekranda hiçbir şeyin göstermediği yollarla hatırlar:

- **Bir fotoğrafın üstverisi çoğu zaman bir küçük resim içerir** — görüntünün düzenlenmeden önceki hali. Adresinizi fotoğraftan kırpın; EXIF bloğu kırpılmamış orijinalin minyatürünü hâlâ tutuyor olabilir. [EXIF görüntüleyici ve silici](https://abox.tools/tr/exif-verisi-silme/) o bloğu gösterir ve çıkarır; [rehberi de var](https://abox.tools/tr/rehberler/exif-ve-gps-verisini-silme/).
- **Bazı düzenleyiciler yerinde kaydeder, dosyayı kısaltmaz.** 2023'ün ünlü hata çifti — bir telefonun ekran görüntüsü karalama aracı ile bir masaüstünün ekran alıntısı aracı — kırpmadan sonra orijinal görüntünün baytlarını dosyada bırakıyordu; “kırpılıp atılan” kısım artıklardan yeniden kurulabiliyordu.
- **PDF'ler kendi tarihçelerini taşıyabilir.** Artımlı kayıtlarla düzenlenmiş bir PDF, değişiklikleri dosyanın sonuna ekler ve önceki sürümü, silinenler dahil, içinde el değmemiş bırakır.

Ortak iplik şu: bir görüntüleyicinin gösterdiği ile bir dosyanın içerdiği ayrı sorulardır ve yalnızca bakılarak denetlenmiş bir karartma, yalnızca ilkini cevaplamıştır.

## Silmek gerçekte ne ister

Gerçek karartma görünümü değil veriyi değiştirir ve başarısız olabileceği yoldan sınanır: ekrana değil, dosyaya sorarak.

Bir resim için bu, kutunun altındaki piksellerin herhangi bir dosya yazılmadan önce var olmayı bırakması demektir. [Resim karartma aracı](https://abox.tools/tr/resim-karartma/) tam olarak bunu yapar: örtülen değerler bellekte üzerine yazılır ve ancak ondan sonra kodlayıcıya verilir; çıktı, içeriğin olduğu yerde siyah pikseller içerir, önünde siyah mürekkep değil. Adım adım anlatım [resim karartma rehberinde](https://abox.tools/tr/rehberler/resim-karartma/).

Bir PDF için bu, gliflerin sayfayı çizen talimatlardan silinmesi demektir — gizli taşıyıcılarla birlikte: `/ActualText` bildirimleri, yer imleri, yorumlar, form alanları. [PDF karartma aracı](https://abox.tools/tr/pdf-karartma/) bunu yapar; sonra da en önemli şeyi yapar: kendi çıktısını yeniden açar ve silinen kelimeleri orada arar; **bir şey sağ kaldıysa, indirme yoktur**. Tam tur [PDF karartma rehberinde](https://abox.tools/tr/rehberler/pdf-karartma/).

Ve hangi aracı, nerede kullanırsanız kullanın, kabul testi sizindir: karartılmış alanın üstünden seçip kopyalayın; dosyada silinen kelimeyi arayın; başka bir görüntüleyicide açın. İçerik silindiyse, hiçbir şey onu bulamaz — ve bir aracın bunu tarayıcınızda, dosyanız makineden çıkmadan yaptığı da inanılacak değil, denetlenecek bir iddiadır: [yükleme rehberi](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) nasılını gösterir. Karartma, dosyanın tanım gereği hassas olduğu tek iştir — bu da onu bir yabancının sunucusundan geçmesi gereken son iş yapar.
