# JSON kimseye vermeden nasıl biçimlendirilir

JSON biçimlendirmek boşlukları değiştirmeli, başka hiçbir şeyi değil. Bunu yapmayı öneren araçların çoğu bundan fazlasını değiştiriyor ve hiçbiri bundan söz etmiyor. Bu rehber nelere dikkat edeceğinizi, dosya ayrıştırılmadığında hatanın nasıl okunacağını ve bir yapılandırma dosyasını yapıştırdığınız kutunun neden üzerinde düşünmeye değdiğini anlatıyor.

[JSON Biçimlendirici aracını açın](https://abox.tools/tr/json-bicimlendirme/): JSON, XML, HTML, CSS ve YAML; biçimlendirilmiş ya da dönüştürülmüş. Hiçbir şey bir başkasının sunucusuna yapıştırılmıyor.

Son güncelleme 26 Ağustos 2026

## Kısa cevap

[Metin ve Kod](https://abox.tools/tr/json-bicimlendirme/)'u açın, JSON'u kutuya yapıştırın ve okuyun. Düzen siz yazdıkça oluşur, dil metinden bulunur ve aksini söylemedikçe girinti iki boşluktur. Hiçbir şey yüklenmez, çünkü gidecek bir yer yoktur: ayrıştırıcı, zaten açık olan sekmede çalışan birkaç yüz satırlık JavaScript'tir.

Aşağıdaki her şey, bir yapılandırma dosyasını alternatiflerden herhangi birine yapıştırmadan önce bilmeye değen kısımdır: bir biçimlendiricinin neyi değiştirmesine izin var, çoğu yine de neyi değiştiriyor ve dosya hiç ayrıştırılmadığında hata nasıl okunur.

![İki bölme: solda tek satır JSON, sağda aynı belge iki boşluk girintiyle biçimlendirilmiş.](https://abox.tools/screens/format-json-without-uploading-it/panes.webp)

Bir satır girer, okunabilir bir şey çıkar. Bunun için hiçbir yere hiçbir şey gönderilmedi.

## Biçimlendirmek nedir, ne değildir

JSON'un neredeyse hiç söz dizimi yoktur. Bir nesne, bir dizi, bir dizge, bir sayı ve üç kelime: `true`, `false` ve `null`. Bu parçaların arasında boşluğun bir anlamı yoktur: şu dosya

```
{"name":"thing","tags":["local","offline"]}
```

ile şu dosya

```
{
  "name": "thing",
  "tags": [
    "local",
    "offline"
  ]
}
```

aynı belgedir. Biçimlendirmek, birinciden ikinciye geçme işidir ve *işin tamamı budur*. Bir biçimlendiricinin dosyanıza yaptığı başka her şey — yeniden sıralama, yuvarlama, düşürme — belgenin söylediğinde, istenmeden yapılmış bir değişikliktir.

Bu değişikliklerin üçü, adını anmaya değecek kadar yaygındır; çünkü sessizce olurlar ve bir öğleden sonrada yazılmış bir biçimlendiricinin varsayılan olarak yaptığı şeydirler.

## Bir biçimlendiricinin değiştirmemesi gereken üç şey

### Anahtarlarınızın sırası

İnsanları yakalayan budur. JavaScript'te bir JSON biçimlendiricisi yazmanın apaçık yolu `JSON.parse` ve ardından girintili bir `JSON.stringify` çağırmaktır; bu ikili ise tamsayıya benzeyen anahtarların sırasını korumaz:

```
Object.keys(JSON.parse('{"10":"a","2":"b","x":"c"}'))
// ['2', '10', 'x']
```

Bu, kimsenin kodundaki bir hata değildir. JavaScript nesnelerinin, tamsayıya benzeyen anahtarları önce ve artan sayısal sırada koyacağı belirtilmiştir ve `JSON.parse`'tan geçen her değer bir JavaScript nesnesine dönüşür. Böyle kurulmuş bir biçimlendirici, kimliğe, kapı numarasına, yıla ya da HTTP durum koduna göre anahtarlanmış bir dosyayı yeniden dizer ve bunu tek kelime etmeden yapar.

Bunun önemli olup olmadığı dosyaya bağlıdır. JSON nesneleri ilkesel olarak sırasızdır, yani teknik olarak bozulan bir şey yoktur — ama deponuzdaki sürüme karşı fark devasa olacak, inceleme okunmaz olacak ve akışın devamında bir şey dosyayı sırasıyla okuyorsa davranış değişecektir.

### Sayılarınızın haneleri

JSON bir sayının ne kadar büyük olabileceğini söylemez, JavaScript söyler: her sayı bir çift duyarlıklı sayıdır. Yani çift duyarlıklıya ayrıştırıp geri yazan bir biçimlendirici, çift duyarlıklının tutamadığı her şeyi kaybeder.

```
JSON.stringify(JSON.parse('{"id":123456789012345678901}'))
// {"id":123456789012345680000}

JSON.stringify(JSON.parse('{"size":1e999}'))
// {"size":null}
```

Yirmi bir haneli bir kimlik — bir Twitter kimliği, bir Snowflake kimliği, bir banka referansı — başka bir sayı olarak geri gelir ve bir çift duyarlıklı için fazla büyük bir değer `null` olarak geri gelir. İki dosya da hâlâ ayrıştırılır ve hiçbiri başladığınız dosya değildir.

Çıkış yolu, sayıları hiç ayrıştırmamaktır. Bir biçimlendiricinin belgeyi düzenli yazmak için yalnızca bir sayının nerede başlayıp nerede bittiğini bilmesi gerekir; değerine hiçbir zaman ihtiyacı olmaz, yani güvenli olan şey haneleri yazıldıkları gibi kopyalamaktır. Buradaki aracın yaptığı da budur.

### Yinelenen anahtarlarınız

`{"a": 1, "a": 2}` geçerli JSON'dur ve standart, ikisinden hangisinin kazandığını söylemekten kaçınır. Ayrıştırıcılar pratikte anlaşamaz: çoğu sonuncuyu tutar, bazıları ilkini tutar, birkaçı belgeyi reddeder. Birini sessizce çıktıya veren bir biçimlendirici bu kararı sizin yerinize vermiş ve çok daha yararlı olan gerçeği — iki tane olduğunu — gizlemiştir; ki bu neredeyse her zaman dosyadaki bir hatadır ve görmek isteyeceğiniz bir hatadır.

## Dosya ayrıştırılmadığında

Çuvallayan JSON'un çoğu egzotik değildir. Yaklaşık altı şeyden biridir ve hata, nerede olduğunu bulabileceğiniz terimlerle söylüyorsa hangisi olduğunu da söyler. `4193. konum` gibi bir ofset bunu yapmaz; bir satır ve bir sütun yapar.

- **Sondaki virgül.** `{"a": 1,}` JavaScript'te yasaldır, JSON'da değildir. En yaygın tek sebep; genellikle bir listenin son girdisini silmekten geriye kalır.
- **Tek tırnak.** `{'a': 1}` bir JavaScript nesne sabitidir, JSON değildir. Dizgeler de anahtarlar da çift tırnaklıdır ve anahtarlar her zaman tırnaklıdır.
- **Tırnaksız anahtar.** `{a: 1}`, aynı hatanın öbür yönden hâli — genellikle bir dosyadan değil koddan bir şey yapıştırmaktan gelir.
- **Yorumlar.** `// böyle bir şey` de JSON değildir. O, VS Code ayarlarının ve `tsconfig.json`'ın kullandığı JSONC'dir ve başka hiçbir yerde ayrıştırılmaz. Bir yorumun hayatta kalması gerekiyorsa alışılmış yol bir anahtardır: `"_comment": "..."`.
- **Bir dizgenin içinde gerçek bir satır sonu ya da sekme.** Bunların `\n` ve `\t` olarak yazılması gerekir. Bir kabuk komutu ya da bir sertifika elle bir değere yapıştırıldığında genellikle ters giden şey budur.
- **JSON'un izin vermediği bir sayı.** Baştaki sıfırlar (`01`), yalın bir ondalık nokta (`.5`), `NaN`, `Infinity` ve `+1`; hepsi insanların yazdığı şeylerdir ve hiçbiri JSON değildir.

Hata olmadığı hâlde hataya benzeyen bir şey: bayt sırası imiyle başlayan bir dosya. Çoğu düzenleyicide görünmezdir, boşluk değildir ve belgenin ilk karakterini beklenmedik kılar. Kusursuz görünen bir dosyada hata 1. satır 1. sütundaysa, olan budur.

![Aynı araç bozuk bir belgeyle: fazladan bir virgülün satırını ve sütununu söyleyen bir hata ve suçlu satırı gösteren giriş bölmesi.](https://abox.tools/screens/format-json-without-uploading-it/error.webp)

Okunmuyorsa, ileti nerede olduğunu söyler. Fazladan virgül en sık görülen nedendir ve gözle en zor görülenidir.

## Küçültmek ve genellikle ne kadar az kazandırdığı

Boşlukları sıkıp çıkarmak aynı işlemin tersidir ve neye yaradığı konusunda gerçekçi olmaya değer. Boşluk son derece tekrarlıdır ve sizinle bir okuyucu arasındaki her sunucu ve tarayıcı yanıtı zaten gzip ya da Brotli ile sıkıştırır; onlar da tam olarak bu tür bir tekrarda çok iyidir.

Yani küçültülmüş JSON çoğu zaman dosya olarak yüzde otuz küçüktür ve tel üzerinde yalnızca yüzde birkaç küçüktür. Ekmeğini gerçekten kazandığı yerler, önünde sıkıştırma olmayanlardır: bir veritabanı sütunundaki bir değer, bir günlük satırındaki bir alan, bir QR kodunun içindeki bir yük ya da birazdan bir başlığa Base64'leyeceğiniz bir belge.

Bedeli okunurluktur ve dosya bir depoya işleniyorsa size farkları da kaybettirir — tek satırlık bir dosya, içindeki herhangi bir şey değiştiğinde baştan sona değişir. Düzenleyicinize girerken değil, çıkarken küçültün.

## Anahtarları sıralamak ve ne zaman sıralamamak

Her nesnenin anahtarlarını sıralamak burada varsayılan olarak uygulanmak yerine bir seçenek olarak sunuluyor; çünkü bu, dosyada gerçek bir değişikliktir ve değeri tamamen birazdan ne yapacağınıza bağlıdır.

Aynı şeyi söylemesi gereken iki belgeyi karşılaştırırken işe yarar — iki ortamın yapılandırması, bir değişiklikten önceki ve sonraki bir API yanıtı — ve biri anahtarlarını başka sırayla listeliyordur. Önce ikisini de sıralamak, her şeyin farkını gerçekten farklı olan iki satırın farkına çevirir.

Sıra bir işe yarıyorsa zarar verir. Bir `package.json`'ın neyin önce geleceğine dair gelenekleri vardır; elle yazılmış bir yapılandırma çoğu zaman ilgili ayarları gruplar; anahtarları bir araçla sıralanıp sonra işlenmiş bir dosya ise devasa ve anlamsız tek bir işleme üretir. Özgün dosyayı değil bir kopyayı sıralayın.

Bilmeye değer bir ayrıntı: buradaki sıralama kod noktalarına göre değil anahtarların okunuşuna göredir; yani `item2`, `item10`'dan sonra değil önce gelir. Kod noktasına göre sıralamak, `item10`'u birlerin ortasına koyan şeydir; teknik olarak doğru ve bir okuyucu için yararsızdır.

## İki JSON dosyasını karşılaştırmak

Güvenilir yol, önce ikisini de aynı şekilde biçimlendirmektir. Aynı şeyi söyleyen iki belge, biri küçültülmüş diğeri küçültülmemişse her satırda farklı olabilir ve hiçbir karşılaştırma bunun ötesini göremez.

Yani: birincisini biçimlendirin, ikincisini biçimlendirin, sonra iki sonucu karşılaştırın. Üç adım da burada aynı sayfadadır — *Karşılaştır* sekmesinin kutuyu *Biçimlendir*'le paylaşmasının sebebi tam olarak budur. İkisi anahtarlarını farklı sıralarda da listeliyorsa, biçimlendirirken ikisini de sıralayın ve karşılaştırma aradığınız farka çöksün.

## Kimsenin sayfaya koymadığı kısım

Bir JSON biçimlendirici arayın, üzerinde bir kutu olan onlarca site bulacaksınız. O kutuya yapıştırmak bir yüklemedir. Panonuzda ne varsa — içinde bir müşterinin adresi olan bir API yanıtı, bir bağlantı dizgesi içeren bir yapılandırma dosyası, hata ayıkladığınız bir belirteç — denetlemediğiniz bir makineye gönderilmiştir ve artık onların günlük dosyası, onların hata raporu ve onların yedeğidir.

Bu, kötü niyet üzerine bir varsayım değildir. Gayet iyi niyetli bir site de erişim günlükleri tutar, ölçüm çalıştırır ve bir barındırma sağlayıcısı vardır. En güvenli veri hiç ayrılmamış veridir ve tamamen dizge işlemeden ibaret bir iş için ayrılmasının hiçbir sebebi yoktur.

İki denetim; yalnızca burada değil, bu iddiada bulunan her sitede çalışır:

1. **Geliştirici araçlarını açın, Ağ sekmesini izleyin ve bir şey biçimlendirin.** Metniniz gönderiliyorsa onu taşıyan bir istek vardır. Aynı anda başka hiçbir şey doğru olamaz.
2. **İnternet bağlantısını kesin ve yeniden deneyin.** İşi sizin tarayıcınızda yapan bir araç bundan etkilenmez. Metninizi bir yere gönderen bir araç anında ve tamamen çalışmayı bırakır.

İkisinin de daha uzun bir sürümü, iki denetim daha eklenmiş hâliyle, [dosya yüklemek güvenli mi](https://abox.tools/tr/rehberler/dosya-yuklemek-guvenli-mi/) sayfasında.

## Peki ya YAML, XML ve gerisi

Aynı sayfa XML, HTML, CSS ve YAML okur ve JSON ile bunların ilki ve sonuncusu arasında dönüştürme yapar. Yukarıdan taşımaya değer iki şey var; çünkü aynı savın başka bir kılıktaki hâli:

- **YAML'ı JSON'a çevirmek yorumları kaybettirir**; çünkü JSON'un bir yorumu koyacak yeri yoktur. YAML'ın “aynı düğüm iki kez” deme yolu olan bağlantı noktaları ve takma adlar da ifade edilemez ve burada tahmin edilmek yerine reddedilir.
- **`no` bir dizgedir.** YAML 1.1'de `yes`, `no`, `on` ve `off` mantıksal değerlerdi; Norveç'i içeren bir ülke kodu listesinin eskiden içinde `false` ile geri gelmesinin sebebi buydu. YAML 1.2 bundan vazgeçti, bu araç da öyle — ama o kelimeler yine de tırnak içinde geri yazılır; çünkü dosyayı sonra açan şey bir 1.1 okuyucusu olabilir.
