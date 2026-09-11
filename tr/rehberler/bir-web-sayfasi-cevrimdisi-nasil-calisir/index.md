# Bir web sayfası Wi-Fi olmadan nasıl çalışabilir?

Çünkü tarayıcı eksiksiz bir kopya sakladı ve sayfayla birlikte gelen küçük bir program, ağ yapamadığında o kopyayı sunuyor. Makine standarttır ve anlamaya değer; çünkü bağlantısız çalışan bir araç, size hiçbir gizlilik politikasının gösteremeyeceği bir şeyi gösteriyordur.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

Bir web sayfası normalde bağlantısıyla yaşar ve ölür; çünkü her ziyaret onu yeniden getirir. Ama bir sayfa yanında küçük bir program taşıyabilir: *service worker*. Tarayıcı onu sayfanın yanına kurar ve sayfanın ağ trafiğinin başına geçirir. İlk ziyarette bu worker, sayfayı oluşturan her şeyin — işaretleme, stiller, betikler — eksiksiz bir kopyasını makinenizdeki bir önbelleğe koyar. O andan sonra istekler o kopyadan cevaplanır. Wi-Fi öldüğünde hiçbir şey değişmez; çünkü zaten bir şey getirilmiyordu.

Bunların hiçbirinde sihir de özel izin de yok: yaklaşık on yıldır her büyük tarayıcıda gelen standart tarayıcı makinesidir. Alışılmadık olan, bir sitenin ona bu site kadar yaslanması — çünkü bütün vaadi dosyalarınızın asla gitmemesi olan bir site için çevrimdışı bir konfor değildir. Kanıttır.

## Fişi çekince sağ kalmak neyi gösterir

Yükleme rehberinin en güçlü denetimi [fişi çekmektir](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/): aracı yükle, bağlantıyı kes, kullan. Bunun neden işe yaradığını tam söylemekte yarar var. Dosyanızı bir sunucuda dönüştüren araç, işini yaptığı anda ağa muhtaçtır — teli kesin, iş durur. Devam eden araçsa işin sizin makinenizde olduğunu iddia etmemiş, göstermiştir; ve ağa erişemeyen bir sayfa, kodu ne isterse istesin, dosyanızı hiçbir yere gönderemez.

Bunu hiçbir gizlilik politikası sunamaz. Politika niyetleri anlatır ve değişebilir; uçak modunda işini gören sayfa fiziktir. Bu yüzden bu sitedeki her araç çevrimdışı çalışır ve o anda çevrimdışı olup olmadığınızı söyleyen canlı bir gösterge taşır — bağlantıyı kapatırken değişmesini izleyebilesiniz ve var olan en güçlü denetimi on saniyede koşturabilesiniz diye.

## Kopya nasıl dürüst kalır

Sonsuza-dek-saklandının hediye mi tuzak mı olduğunu iki soru belirler ve makine ikisini de cevaplar:

- **Kopya eskir mi?** Worker, bağlantı varken daha yeni bir sürüme bakar ve onu bütün hâlinde takas eder. Sürümler bütün gider; çünkü kopya her an tutarlı olmak zorundadır — yarısı eski yarısı yeni, asla sunulmaması gereken tek durumdur.
- **Tam olarak ne kopyalandı?** Sayfanın ihtiyacı olan her şey ve başka hiçbir şey — ve buradaki her araç kendi kopyasını kendi gözünde tutar. Bir aracın önbelleği o aracı içerir; birini kurmak sessizce onunu kurmaz. Kopya ayrıca incelenebilir: tarayıcınızın geliştirici araçları önbellekteki her dosyayı listeler ve o liste, sayfanın gözler önünde getirdiği listenin aynısıdır.

Sonuç, ziyaret etmekle kurulmuş bir uygulama gibi davranan bir sayfadır — ki bu düpedüz tekliftedir de: tarayıcının adres çubuğu buradaki herhangi bir aracı uygulama olarak kurar; aracın kendi simgesiyle, doğrudan araca açılarak, sayfada düğme olmadan ve isteyen bir betik olmadan. Aynı makine, kısayol kılığında.

## Çevrimdışının kanıtlamadıkları

Denetim güçlüdür, sihirli değil; sınırları da gücü kadar açık söylenmeyi hak eder:

- **Anı kanıtlar, geleceği değil.** Çevrimdışı yapılan iş makinenizde kaldı, nokta. Bir sayfa ilkece veriyi tutup bağlantı dönünce gönderebilir — en keskin dosyalar için, yeniden bağlanmadan önce sekmeyi kapatın ya da öbür yönü de denetleyin: bağlantı geri gelirken Ağ sekmesini izleyin.
- **Bu sayfayı kanıtlar, siteyi değil.** Her sayfa kendi adına cevap verir. Buradaki ağı kullanan tek sayfa bunu kendi sayfasında söyler: bütün işi bir şeyi iki cihaz arasında taşımak olan [metin paylaşma aracı](https://abox.tools/tr/metin-paylasma/); tek bağlantısının neyi taşıdığını da tam olarak anlatır.
- **Sizi gizlemez.** Sayfayı yüklemek, web'deki her sayfa yüklemesi gibi, adresinizi siteye çoktan söyledi. Çevrimdışı dosyalarınızın nereye gittiğiyle ilgilidir, anonimlikle değil.

Bu sınırlar, yükleme rehberinin tek değil dört denetim öğretmesinin sebebidir — Ağ sekmesi, sayfa kaynağındaki güvenlik politikası ve okunabilir kod, fişi çekmenin kapatamadığını kapatır. Ama ilk süzgeç olarak hiçbiri daha hızlı değildir: bir araç ağ yokken işini yapamıyorsa, işin nerede olduğunu öğrendiniz demektir ve daha fazla okumaya gerek kalmaz.
