# Gambar ke Data URI — kodekan gambar sebagai base64 untuk CSS atau HTML

Seluruh gambar sebagai satu baris teks. Tempelkan langsung ke CSS atau HTML.

> Ubah PNG, JPEG, SVG, atau WebP menjadi data URI yang bisa Anda tempelkan ke CSS atau HTML. SVG dikodekan dengan persen alih-alih base64, jadi ia tetap terbaca dan lebih pendek. Berjalan di peramban Anda; tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/gambar-ke-base64/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## gambar Anda **tidak pernah diunggah**. Tidak ada server.

Pengodeannya berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri. Ia adalah aritmetika atas byte yang sudah dipegang halaman ini: tanpa encoder, tanpa server, dan tanpa langkah jaringan untuk ditinggalkan. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah gambar.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa pengodean ulang
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara mengubah gambar menjadi data URI

1. **Pilih gambar Anda.** Jatuhkan ke pemilih file atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Sebutkan hasilnya akan ke mana.** URI-nya sendiri, sebuah aturan CSS, sebuah properti khusus, sebuah tag `<img>`, atau Markdown. Semuanya menaruh URI-nya di dalam tanda kutip, dan itulah detail yang menentukan apakah sebuah SVG sebaris berhasil atau diam-diam tidak.
3. **Baca berapa biayanya.** Setiap hasil mengatakan ia menjadi berapa karakter, seberapa besar itu dibanding file-nya, dan apakah menaruh sesuatu seukuran itu sebaris adalah ide yang baik. Base64 menambah sepertiga; apakah sepertiga itu sepadan dengan satu permintaan yang dihemat sepenuhnya tergantung ukurannya, jadi halaman ini mengatakan Anda ada di sisi mana.
4. **Perhatikan peringatannya.** Kalau gambarnya membawa EXIF, sebuah profil warna, atau XMP, ia disebutkan namanya beserta berapa byte dari hasil Anda yang berisi itu. Kalau ekstensinya bertentangan dengan format sesungguhnya, halaman ini memakai formatnya dan memberi tahu Anda. Kalau peramban Anda tidak bisa menggambar hasilnya, ia mengatakan itu juga.
5. **Salin, atau unduh.** Satu tombol per hasil, dan satu untuk semuanya sekaligus — properti khususnya keluar terbungkus dalam sebuah blok `:root`, siap ditempelkan di bagian atas sebuah lembar gaya.

## Versi lebih lengkap

[Kapan menaruh gambar di dalam CSS Anda, dan kapan tidak](https://abox.tools/id/panduan/menyisipkan-gambar-di-css/): Berapa harga sebuah data URI, kenapa base64 menambah sepertiga dan gzip tidak mengembalikannya, kenapa sebuah SVG tidak boleh berupa base64, dan kekeliruan tanda kutip yang diam-diam merusak SVG yang disisipkan.

## Juga ada di dalam kotak

- [SVG ke Gambar](https://abox.tools/id/svg-ke-png/): Sebutkan ukurannya. Sebuah vektor tidak punya ukuran sendiri untuk hilang.
- [Gambar ke SVG](https://abox.tools/id/gambar-ke-svg/): Satu bentuk, satu garis luar. Tunjuk saja yang seharusnya tidak ada.
- [Pembanding Tinggi Badan](https://abox.tools/id/bandingkan-tinggi-badan/): Ketik tingginya, bawa gambarnya. Tidak ada yang dikirim untuk menggambarnya.
- [Kompresor Gambar](https://abox.tools/id/kompres-gambar/): Sebutkan ukurannya. Sisanya dia yang hitung.

## Pertanyaan

### Apakah gambar saya diunggah ke suatu tempat?

Tidak. File dibaca dan dikodekan oleh peramban Anda sendiri di perangkat keras Anda sendiri, dengan dua fungsi yang sudah dimiliki peramban. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

### Apa itu data URI?

Cara menuliskan seluruh isi sebuah file di tempat yang biasanya diisi alamat web. Alih-alih `url("logo.png")`, yang menyuruh peramban pergi mengambil sesuatu, Anda menulis `url("data:image/png;base64,iVBORw0...")`, yang memuat gambarnya sendiri. Peramban mendekodenya di tempat. Efek praktisnya adalah satu permintaan lebih sedikit: gambarnya datang bersama lembar gaya atau halamannya alih-alih sesudahnya.

### Kenapa SVG saya bukan base64?

Karena base64 adalah pengodean yang salah untuknya. Sebuah SVG adalah teks, dan sebuah URL sudah bisa membawa teks — hanya segelintir karakter yang harus dikaburkan. Mengodekan yang segelintir itu dengan persen dan membiarkan sisanya menghasilkan URI yang biasanya seperlima lebih pendek daripada base64 file yang sama, dan yang masih bisa Anda baca di lembar gaya Anda: nama elemennya, warnanya, dan `viewBox`-nya semua masih di sana untuk disunting. Ada sebuah kotak centang untuk memaksa base64 demi rantai perkakas langka yang bersikeras memintanya.

### Seberapa besar base64 membuat gambar saya?

Sekitar sepertiga. Tiga byte file menjadi empat karakter base64, yang berarti 33% sebelum `data:image/png;base64,` di depannya. Itu lantainya, dan itu tidak terhindarkan: itulah biaya menuliskan byte sembarang hanya dengan karakter yang diizinkan sebuah URL. Itu juga sebabnya halaman ini menampilkan jumlah karakternya di sebelah ukuran file, alih-alih membiarkan Anda mengetahuinya ketika lembar gayanya sudah dirilis.

### Kapan menaruh gambar sebaris benar-benar ide yang baik?

Ketika ia kecil dan dibutuhkan segera. Ikon 2 KB di lembar gaya yang dimuat setiap halaman adalah kemenangan yang jelas: satu perjalanan bolak-balik lebih sedikit, dan gambarnya sudah ada begitu CSS-nya ada. Melewati sekitar 10 KB, takarannya berbalik. Gambar yang disebariskan bukan lagi file terpisah, jadi ia tidak bisa disinggahkan sendiri, tidak bisa diambil paralel dengan apa pun, dan diunduh utuh setiap kali file di sekelilingnya berubah — foto 200 KB di sebuah lembar gaya berarti 200 KB yang ditambahkan ke jalur kritis setiap halaman di situs itu. Halaman ini memberi tahu Anda setiap hasil jatuh di sisi mana dari garis itu.

### Apakah gzip membatalkan tambahan dari base64?

Kurang dari yang orang duga. Base64 dari file yang sudah terkompresi — dan PNG, JPEG, serta WebP semuanya begitu — sulit dikompres, karena nyaris tidak ada kemubaziran tersisa untuk ditemukan kompresornya; Anda biasanya mendapat kembali kira-kira sepersepuluh dari sepertiga yang ditambahkan base64, bukan seluruhnya. SVG berkode persen adalah kasus sebaliknya: ia masih teks, jadi ia terkompres kira-kira sebaik sebelumnya, dan itu satu alasan lagi untuk tidak mem-base64-kannya.

### Apakah ini mengubah gambar saya sama sekali?

Tidak, dan itu perbedaan yang disengaja dari kebanyakan alat di sini. Tidak ada yang didekode menjadi piksel lalu dikodekan lagi: byte yang datang dari disk Anda adalah byte yang masuk ke URI-nya. Sebuah JPEG tetap persis JPEG yang sama, pada kualitas yang sama, dengan dimensi yang sama. Itulah sebabnya hasilnya bisa disebut file yang sama alih-alih salinannya.

### Jadi data EXIF dan GPS saya ikut masuk ke lembar gaya juga?

Ya, dan inilah bagian yang layak dipikirkan sebelum Anda menempelkannya. Karena tidak ada yang dikodekan ulang, semua yang ditulis kamera ikut bepergian bersama gambarnya: lokasinya, stempel waktunya, nomor seri kameranya. Pada foto ponsel itu bisa 30 KB dari file, yang menjadi 40 KB base64 di jalur kritis halaman Anda, dan sebuah alamat rumah di dalam sesuatu yang akan diserahkan ke sebuah repositori. Halaman ini membaca berapa banyak metadata di dalam JPEG, PNG, atau WebP dan mengatakannya. Untuk mengeluarkannya lebih dulu, pakai [Penampil dan Penghapus EXIF](https://abox.tools/id/hapus-data-exif/).

### Kenapa ia memakai tipe yang berbeda dari ekstensi file saya?

Karena ekstensinya bisa salah dan byte-nya tidak bisa. File bernama `logo.png` yang sebenarnya diekspor sebagai JPEG cukup lazim sehingga setiap alat gambar harus menghadapinya, dan data URI yang menyatakan tipe yang salah begitu saja tidak tampil — tidak ada cadangan dan tidak ada pesan galat yang layak dibaca. Jadi tipenya dibaca dari beberapa byte pertama file, yang menyatakan apa ia sebenarnya secara tegas di setiap format di sini, dan halaman ini memberi tahu Anda ketika keduanya bertentangan.

### Pratinjaunya kosong. Apa yang salah?

Mungkin bukan soal URI-nya. HEIC dan TIFF sama-sama menghasilkan data URI yang sepenuhnya sah tapi tidak akan digambar peramban mana pun kecuali Safari, jadi gambarnya juga akan hilang di mana pun Anda menempelkannya — ubah dulu ke PNG, JPEG, atau WebP dengan [Kompresor Gambar](https://abox.tools/id/kompres-gambar/) atau [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/). Kalau formatnya format biasa, file-nya sendiri kemungkinan besar rusak: pratinjaunya digambar dari URI yang dibangun halaman ini, jadi pratinjau yang kosong berarti gambarnya tidak terdekode.

### Adakah batas ukuran pada sebuah data URI?

Bukan batas yang akan Anda temui di CSS atau di sebuah tag `<img>`; peramban masa kini tidak menerapkan batas praktis di sana. Yang memang dibatasi peramban adalah mengetikkan data URI ke bilah alamat, yang kini ditolak sebagian besar peramban untuk apa pun yang tidak sepele, dengan alasan keamanan yang sama sekali tidak berhubungan dengan penggunaan ini. Batas yang sebenarnya adalah yang di atas: jauh sebelum ada yang rusak secara teknis, halaman tempatnya berada sudah menjadi lebih lambat daripada kalau memakai file gambar biasa.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Tidak ada batas jumlah atau ukuran file-nya juga, karena tidak ada server yang membayarnya — pekerjaannya terjadi di mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang gambar Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim gambar Anda ke tempat lain untuk dikodekan akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Gambar Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Pengodeannya adalah `btoa` dan `encodeURIComponent` — dua fungsi yang sudah dimiliki peramban sejak awal; keduanya mengambil byte dan mengembalikan teks tanpa pergi ke mana pun.
- **Pratinjaunya adalah buktinya.** Gambar di sebelah setiap hasil digambar dari data URI yang baru saja dibangun halaman ini, bukan dari file Anda. Ia tampil karena URI-nya benar, di mesin Anda, tanpa server yang terlibat — dan kalau ia tidak tampil, halaman ini mengatakannya alih-alih menyerahkan sesuatu yang rusak kepada Anda.
- **Peringatan metadatanya berpihak pada Anda.** Sebuah data URI menyalin file-nya persis, jadi titik GPS sebuah foto ikut masuk ke lembar gaya Anda bersamanya. Halaman ini membaca berapa banyak dari itu yang ada dan memberi tahu Anda, karena alternatifnya adalah Anda mengetahuinya setelah ia diserahkan ke repositori.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi apa pun tentang gambar Anda. Setiap baris yang membaca atau mengodekan sebuah file disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/encode.js` untuk dua pengodeannya beserta alasan di balik masing-masing, `src/sniff.js` untuk bagaimana tipe medianya dibaca dari file-nya sendiri alih-alih dari namanya, dan `src/metadata.js` untuk pemeriksaan yang mengatakan berapa banyak dari yang akan Anda tempelkan itu bukan gambarnya.
