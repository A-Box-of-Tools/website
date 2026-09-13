# Gambar ke SVG — jiplak logo, stensil, atau siluet menjadi kurva

Satu bentuk, satu garis luar. Tunjuk saja yang seharusnya tidak ada.

> Jiplak gambar hitam putih menjadi garis luar SVG sungguhan, di peramban Anda. Logo, stensil, tanda tangan, gambar garis, dan siluet menjadi kurva yang bisa Anda perbesar ke ukuran berapa pun. Satu klik membuang yang salah terambil. Tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/gambar-ke-svg/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## gambar Anda **tidak pernah diunggah**. Tidak ada server.

Gambarnya dibaca dari disk oleh peramban Anda sendiri, diringkas menjadi satu bit per piksel oleh `src/mask.js`, ditelusuri tepinya oleh `src/contour.js`, dan dipasangi kurva oleh `src/fit.js` — sekitar enam ratus baris yang bisa Anda baca, tanpa mesin di baliknya dan tanpa apa pun yang diunduh untuk menjalankannya. Alat ini tidak punya fitur jaringan dalam bentuk apa pun: tidak ada yang diambil, tidak ada yang dikirim, dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah gambar.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara menjiplak gambar menjadi SVG tanpa mengunggahnya

1. **Pilih gambarnya.** Logo, stensil, tanda tangan, stempel, gambar hasil pindaian, siluet. Apa pun dengan bentuk yang jelas di dalamnya terjiplak dengan bersih; foto sebuah ruangan tidak, dan di bawah ada peringatan jujur soal itu, bukan kejutan di akhir. File dibaca langsung dari disk Anda dan tidak ada yang dikirim ke mana pun sementara itu.
2. **Katakan apa bentuknya.** Gambar di atas kertas terpisah oleh **terang dan gelap**, dan tingkatnya dihitung untuk Anda. Foto sebuah benda tidak — patung merah tua di atas batu abu-abu tua adalah gelap di atas gelap, dan tidak ada kecerahan yang memisahkan keduanya. Foto seperti itu butuh **subjeknya**, yang belajar apa itu latar dari sebuah pita di sepanjang tepi gambar dan menyimpan semua yang bukan latar.
3. **Lihat garis merahnya, bukan pengaturannya.** Garis luar digambar di atas piksel asalnya, karena itu satu-satunya tempat pertanyaan ini bisa diputuskan: garis luar itu benar atau salah terhadap piksel-piksel itu dan bukan terhadap hal lain. Seret salah satu gambar untuk menggeser keduanya, dan putar roda untuk memperbesar cukup jauh sampai terlihat apa yang sebenarnya dilakukan garis itu.
4. **Klik untuk membuang yang seharusnya tidak ada.** Bintik, staples, stempel, keterangan, bayangan. Satu klik mengambil seluruh bercak warna itu, bukan satu piksel, jadi Anda menunjuk sebuah bentuk; klik lagi untuk mengembalikannya. Mengeklik bagian latar yang terkurung justru mengisinya, dan begitulah lubang yang seharusnya bukan lubang ditutup.
5. **Atur kehalusannya hanya jika perlu.** *Detail* adalah seberapa jauh garis boleh menjauh dari piksel saat disederhanakan, dan dihitung per bentuk kecuali Anda bilang lain. *Ketajaman sudut* memutuskan seberapa jauh garis luar harus berbelok agar belokan itu tetap menjadi sudut dan bukannya dibulatkan. Kebanyakan gambar tidak perlu menyentuh keduanya.
6. **Ambil SVG-nya.** Satu file, satu `<path>`, tanpa aturan isian yang perlu dipusingkan: garis luar berputar ke satu arah dan lubang ke arah sebaliknya, dan itulah yang membuat bentuk dengan empat puluh lubang menjadi satu elemen. Ia terbuka di Illustrator, Inkscape, Figma, peramban, dan mesin potong.

## Versi lebih lengkap

[Cara menjiplak gambar menjadi SVG](https://abox.tools/id/panduan/gambar-ke-svg/): Ubah logo, stensil, tanda tangan, atau siluet menjadi garis luar vektor sungguhan di peramban Anda. Gambar mana yang terjiplak dengan baik, mana yang tidak akan pernah, dan cara memperbaiki bagian yang salah dijiplak.

## Juga ada di dalam kotak

- [Pembanding Tinggi Badan](https://abox.tools/id/bandingkan-tinggi-badan/): Ketik tingginya, bawa gambarnya. Tidak ada yang dikirim untuk menggambarnya.
- [Kompresor Gambar](https://abox.tools/id/kompres-gambar/): Sebutkan ukurannya. Sisanya dia yang hitung.
- [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/): Sebutkan ukurannya. Gambar kotaknya. Pilih formatnya.
- [HEIC ke JPG](https://abox.tools/id/heic-ke-jpg/): Foto yang dibuat iPhone, dalam format yang bisa dibuka apa saja.

## Pertanyaan

### Apakah gambar saya diunggah ke suatu tempat?

Tidak. File dibaca oleh peramban Anda sendiri di perangkat keras Anda sendiri, dijiplak oleh beberapa ratus baris JavaScript yang disajikan dari asal ini, dan dikembalikan sebagai unduhan. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

### Apakah ini akan mengubah foto saya menjadi SVG?

Tidak dengan cara yang berguna, dan halaman ini akan mengatakannya alih-alih membiarkan Anda mengetahuinya setelah mengunduh. Menjiplak mengubah setiap bercak warna yang mirip menjadi bentuk tersendiri, jadi sebuah foto kembali sebagai ribuan noda yang saling tumpang tindih dan file yang berkali-kali lebih besar dari JPEG-nya, lambat dibuka, dan tidak mirip fotonya. Yang terjiplak dengan baik adalah gambar yang punya *bentuk* di dalamnya: logo, stensil, tanda tangan, gambar garis, siluet. Untuk foto satu benda, pengaturan *subjeknya* akan memotongnya sebagai satu siluet padat, yang merupakan hal berbeda dan benar-benar berguna.

### Apa bedanya dua cara menemukan bentuk itu?

Pertanyaan yang diajukannya. **Terang dan gelap** bertanya apakah setiap piksel lebih gelap dari satu tingkat, yang tepat sekali untuk tinta di atas kertas dan tidak berguna ketika subjek dan latar sama gelapnya. **Subjeknya** bertanya apa itu latar — ia mempelajarinya dari sebuah pita di sepanjang tepi gambar, mengukur setiap piksel terhadapnya, dan menyimpan hal terbesar yang bukan latar. Itu berhasil pada foto sebuah benda di depan latar yang kurang lebih rata, dan gagal pada gambar yang dipangkas begitu rapat sampai subjeknya keluar di tiga sisi, karena tepi tempatnya belajar saat itu adalah subjek itu sendiri. Kalau itu terjadi, Anda bisa menunjuk latarnya sendiri.

### Kenapa bentuk hasil jiplakan berlubang, atau kehilangan bagian yang tipis?

Karena gambarnya memang sudah begitu sejak menjadi satu bit per piksel. Nyalakan *yang diterima penjiplak* untuk melihatnya: di bawah sekitar dua belas piksel, lubang dalam sebuah huruf sudah terisi dan batang-batangnya sudah menyatu, dan tidak ada jiplakan yang bisa mengembalikan lubang yang tidak ada. Perbaikannya ada di hulu — geser ambangnya, atau mulai dari pindaian yang lebih besar. Dalam mode *subjeknya*, *tutup celah hingga* menutup lubang-lubang kecil dan *isi penuh* menutup setiap lubang yang tidak bisa dijangkau latar dari tepi gambar.

### Bisakah saya memperbaiki bagian yang salah?

Bisa, dan untuk itulah sebagian besar langkah ketiga. Klik apa pun yang seharusnya tidak ada di gambar dan ia hilang; klik lagi dan ia kembali. Satu klik mengambil seluruh bercak warna itu, jadi satu klik membuang seluruh bintik atau seluruh stempel, bukan satu piksel. Mengeklik bagian latar yang terkurung akan mengisinya. Koreksi disimpan terpisah dari ambang, jadi menggeser penggesernya setelah itu tidak membuangnya.

### Seberapa besar SVG-nya?

Untuk sebuah bentuk, lebih kecil dari gambarnya: siluet hasil jiplakan biasanya satu sampai lima kilobyte, dan logo beberapa kilobyte lebih. Halaman ini memberi tahu angkanya persis, di samping unduhan. Untuk foto, ia akan sangat besar, dan itu tanda paling jelas bahwa ini alat yang salah untuk file itu — dan setelah sekitar seribu bentuk terpisah, halaman berhenti menggambar dan mengatakannya.

### Apakah ia menjiplak dalam warna?

Tidak. Alat ini membuat satu bentuk dalam satu warna, dan itulah kasus yang keluar sebagai gambar, bukan fotokopi yang buruk. Menjiplak dalam warna berarti mengurangi ke beberapa warna dan menjiplak masing-masing sebagai lapisan tersendiri, dan hasilnya mengecewakan kebanyakan orang yang memintanya. Kalau Anda butuh warna, jiplak bentuknya di sini dan isi warnanya di program gambar Anda.

### Apa yang bisa saya lakukan dengan SVG-nya setelah itu?

Memperbesarnya ke ukuran berapa pun tanpa jadi buram, mengubah warnanya dengan satu atribut, menganimasikannya, mencetaknya, atau mengirimnya ke mesin potong atau laser. Ia satu `<path>` tanpa aturan isian yang bisa salah, jadi Illustrator, Inkscape, Figma, peramban, dan kebanyakan perangkat lunak CNC membacanya sama.

### Apakah ada batas ukuran gambar?

Batas mesin Anda, bukan batas kami. Selembar A4 yang dipindai pada 300 dpi — sekitar sembilan megapiksel — terjiplak dalam sepersekian detik. Gambar yang lebih besar juga bisa; hanya lebih lama, dan kerjanya terjadi di prosesor Anda sendiri, bukan di antrean di suatu tempat.

### Apakah ini gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, login, masa percobaan, atau tanda air. Tidak ada pula batas jumlah atau ukuran file, karena tidak ada server yang membayarnya — kerjanya terjadi di mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang file Anda.

### Apakah bisa jalan tanpa internet?

Bisa. Muat halamannya sekali, lalu putuskan internet, dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim gambar Anda ke luar untuk dijiplak akan berhenti begitu kabelnya dicabut.

## Cara memverifikasi klaim privasi ini

- **Gambar Anda tidak punya tempat tujuan.** Content-Security-Policy menyebut setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik di sini tempat file Anda bisa dikumpulkan, dan tidak ada apa pun di kodenya yang akan mengirimnya ke sana seandainya ada.
- **Tidak ada apa pun di sini yang mengambil apa pun.** Tidak ada `fetch`, `XMLHttpRequest`, atau `sendBeacon` di mana pun dalam `src/`. Seluruh alat ini adalah hitung-hitungan atas piksel satu gambar: sebuah ambang, satu putaran mengelilingi tepi dari yang ditemukannya, dan sedikit pemasangan kurva.
- **Tidak ada mesin untuk diunduh.** Menjiplak biasanya program orang lain, dan di web itu berarti beberapa megabyte kode terkompilasi datang sebelum klik pertama. Di sini tidak ada yang seperti itu. Semuanya hanya beberapa ratus baris JavaScript biasa yang disajikan dari asal ini, dan itu pula sebabnya halaman ini bekerja begitu terbuka, bukan setelah menunggu.
- **Yang dimuat Google, dan yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran datang dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun dari mereka diberi apa pun tentang gambar Anda. Setiap baris yang membaca, mengambangkan, atau menjiplaknya disajikan dari asal ini dan tercantum di repositori.
- **Jalan tanpa internet.** Putuskan jaringan dan alat ini tidak berubah, karena tidak pernah ada langkah jaringan di dalamnya. Itu bukti paling sederhana dari semuanya.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/mask.js` untuk bagaimana sebuah gambar menjadi satu bit per piksel, `src/contour.js` untuk perjalanan mengelilingi tepi bentuk, `src/fit.js` untuk bagaimana sebuah tangga menjadi kurva, dan `src/subject.js` untuk bagaimana latar ditebak ketika tidak ada terang dan gelap untuk dipisahkan.
