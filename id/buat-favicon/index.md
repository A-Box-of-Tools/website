# Gambar ke ICO — pembuat favicon serta ikon Windows dan macOS

Satu gambar masuk. Setiap ukuran yang diminta peramban, Windows, atau sebuah Mac, keluar.

> Ubah PNG, JPEG, atau SVG menjadi .ico multi-ukuran yang sungguhan atau .icns macOS di peramban Anda. Favicon, ikon aplikasi Windows, ikon aplikasi Mac, plus file Apple dan Android yang dibutuhkan sebuah situs. Tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/buat-favicon/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## gambar Anda **tidak pernah diunggah**. Tidak ada server.

Penskalaannya dan file ikonnya sendiri sama-sama dibuat di peramban Anda sendiri. Gambarnya digambar oleh kanvas yang memang sudah dibawa peramban Anda, dan setiap wadah — `.ico` Windows, `.icns` macOS — dirakit dari piksel itu oleh beberapa ratus baris di `src/ico.js` dan `src/icns.js` yang bisa Anda baca. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah logo.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara membuat file .ico tanpa mengunggah apa pun

1. **Pilih gambarnya.** Jatuhkan sebuah PNG, JPEG, WebP, atau SVG ke pemilihnya, atau pilih beberapa dan ubah semuanya sekaligus. Yang persegi paling mudah, dan di atas 256 piksel sudah membawa cukup detail untuk setiap ukuran. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Pilih file yang Anda butuhkan.** Windows dan sebuah peramban membaca `.ico`; sebuah Mac membaca `.icns` dan sama sekali tidak melihat yang satunya. Centang salah satu, atau keduanya kalau yang Anda buat akan dirilis di keduanya. Sebuah situs web juga meminta gambar Apple, Android, dan ubinnya, dan itulah kotak yang ketiga.
3. **Sebutkan ikonnya untuk apa.** Favicon situs web berukuran 16, 32, dan 48 piksel; aplikasi Windows juga meminta 256; aplikasi yang harus tampak rapi di laptop berkepadatan tinggi meminta ukuran antara yang diminta Windows pada penskalaan 125% dan 150%. Pilih yang cocok dengan pekerjaannya, atau centang sendiri ukurannya. Setiap ukuran di daftar mengatakan apa yang memintanya. Pada `.icns` tidak ada pilihan seperti itu: Apple menetapkan tepat sepuluh slot, dan semuanya masuk.
4. **Urus bentuk dan latarnya.** Sebuah ikon berbentuk persegi dan kebanyakan logo tidak. Isi sisanya; seluruh gambarnya terjaga, dengan ruang di atas dan di bawahnya. Pangkas; bagian tengahnya yang diambil. Regangkan; ia terjepit. Transparansi terjaga sebagai transparansi kecuali Anda memilih sebuah warna untuk duduk di belakangnya.
5. **Lihat yang 16 piksel sebelum Anda mengunduh.** Itulah ukuran yang paling sering dilihat orang dari sebuah ikon, dan di situlah garis tipis dan huruf kecil hilang. Setiap kotak di pratinjaunya digambar dari file Anda pada ukuran sebenarnya. Kalau yang terkecil berupa noda, solusinya bukan setelan lain melainkan gambar yang lebih sederhana.
6. **Ambil file-nya.** Satu .ico berisi setiap ukurannya; kalau itu yang Anda mau, dengan nama `favicon.ico`, karena itulah alamat yang dicari peramban. Sebuah .icns di sebelahnya kalau Anda mencentangnya; siap masuk ke sebuah paket aplikasi Mac. Centang juga set situs webnya, dan dapatkan gambar Apple, Android, dan ubin Windows-nya, manifesnya, serta blok HTML untuk ditempelkan ke halaman Anda. Lebih dari satu file turun sebagai satu zip.

## Versi lebih lengkap

[Cara membuat favicon yang tetap terbaca pada enam belas piksel](https://abox.tools/id/panduan/buat-favicon/): Ukuran apa saja yang sebenarnya dibutuhkan sebuah favicon.ico, file tambahan apa yang diminta iPhone, Android, dan sebuah Mac, dan kenapa logo yang berhasil di sebuah poster lenyap pada enam belas piksel.

## Juga ada di dalam kotak

- [Gambar ke Data URI](https://abox.tools/id/gambar-ke-base64/): Seluruh gambar sebagai satu baris teks. Tempelkan langsung ke CSS atau HTML.
- [SVG ke Gambar](https://abox.tools/id/svg-ke-png/): Sebutkan ukurannya. Sebuah vektor tidak punya ukuran sendiri untuk hilang.
- [Gambar ke SVG](https://abox.tools/id/gambar-ke-svg/): Satu bentuk, satu garis luar. Tunjuk saja yang seharusnya tidak ada.
- [Pembanding Tinggi Badan](https://abox.tools/id/bandingkan-tinggi-badan/): Ketik tingginya, bawa gambarnya. Tidak ada yang dikirim untuk menggambarnya.

## Pertanyaan

### Apakah gambar saya diunggah ke suatu tempat?

Tidak. Gambar didekode dan diskalakan di perangkat keras Anda sendiri oleh peramban Anda sendiri; .ico-nya lalu dirakit dari piksel itu oleh kode yang disajikan dari halaman ini. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

### Ukuran apa saja yang seharusnya ada di dalam favicon.ico?

16, 32, dan 48. Itu bukan soal selera: 16 adalah yang digambar peramban di sebuah tab; 32 adalah yang dipakai Windows untuk pintasan desktop dan yang dipakai beberapa peramban untuk markah; dan 48 adalah ukuran ketika Google membaca ikon sebuah situs. Yang lebih besar seharusnya berada di sebuah PNG di sebelah .ico-nya, bukan di dalamnya — dan itulah yang dihasilkan set situs web di sini.

### Ukuran apa saja yang dibutuhkan ikon aplikasi Windows?

16, 32, 48, dan 256; itu pula yang dimuat app.ico bawaan milik Visual Studio sendiri. 16 untuk bilah judul dan tampilan Explorer kecil, 32 untuk desktop dan bilah tugas, 48 untuk ikon sedang di Explorer, dan 256 untuk menu mulai serta tampilan sangat besar. Di layar berkepadatan tinggi, Windows juga meminta 20, 24, 40, 64, dan 96, dan kalau tidak ada ia mengambil sampel ulang dari ukuran terdekat yang dimilikinya — pilihan siap pakai "setiap skala" memasukkannya juga.

### Kenapa file-nya lebih besar daripada gambar yang saya mulai?

Karena sebuah .ico bukan satu gambar melainkan beberapa, dan yang kecil disimpan tanpa dikompres supaya segalanya bisa membacanya. Entri 32x32 selalu tepat 4.264 byte apa pun isinya, dan entri 256x256 tanpa kompresi berukuran 264 KB — itulah sebabnya ukuran di atas 64 disimpan sebagai PNG secara bawaan. Memilih "PNG untuk setiap ukuran" menghasilkan file terkecil yang mungkin; memilih tanpa kompresi untuk setiap ukuran menghasilkan yang paling kompatibel.

### Apa bedanya entri PNG dan entri tanpa kompresi?

Hanya bagaimana pikselnya disimpan di dalam .ico. Entri tanpa kompresi adalah tata letak Windows yang asli — sebuah header bitmap, piksel terbalik, dan masker transparansi satu bit — dan setiap versi Windows yang pernah dirilis bisa membacanya. Entri PNG adalah seluruh file PNG yang dimampatkan ke dalam ikonnya; ia tiga sampai sepuluh kali lebih kecil pada ukuran besar tapi hanya dipahami sejak Windows Vista. Bawaannya memakai masing-masing di tempat ia menang: tanpa kompresi sampai 64 piksel, PNG di atasnya.

### Bisakah ia membuat ikon lebih besar dari 256 piksel?

Tidak, dan tidak ada yang bisa. Formatnya menyimpan setiap sisi dalam satu byte dan 0 punya arti sendiri — ia berarti 256. Itulah langit-langitnya; jadi .ico yang memuat gambar 512 piksel bukan ikon yang lebih besar melainkan ikon yang rusak. Kalau Anda butuh 512, Anda butuh sebuah PNG, dan itulah yang disertakan set situs web untuk Android dan layar pembuka sebuah aplikasi web.

### Apakah ia menjaga transparansi?

Ya, pada kedua jenis entri; ia juga menulis masker satu bit yang lama di sebelah kanal alfanya, sehingga perangkat lunak yang terlalu tua untuk membaca alfa tetap memotong ikonnya alih-alih menggambar kotak hitam. Satu-satunya file yang sengaja dibuat buram adalah ikon sentuh Apple di dalam set situs web: iOS menaruhnya di ubinnya sendiri dan mengubah transparansi menjadi hitam, jadi ia diratakan ke warna latar Anda, yang secara bawaan putih.

### Logo saya lebar, berbentuk kata. Apa yang terjadi padanya?

Sesuatu harus terjadi, karena sebuah ikon berbentuk persegi. Mengisi sisanya menjaga semuanya dan mengecilkannya — logo kata yang diisi ke dalam persegi 16 piksel tingginya sekitar tiga piksel dan tidak terbaca. Memangkas ke tengah biasanya memberi hasil lebih baik: keluarkan simbolnya dari komposisinya dan pakai itu, seperti yang dilakukan hampir setiap merek untuk faviconnya. Pratinjaunya menunjukkan yang mana yang selamat sebelum Anda mengunduh apa pun.

### Apa isi set situs webnya, dan apakah saya butuh semuanya?

Tujuh PNG, sebuah manifes aplikasi web, sebuah browserconfig.xml, dan sebuah blok HTML untuk ditempelkan. Anda memang membutuhkannya, karena sebuah .ico mencakup peramban dan Windows dan tidak lebih: layar utama iPhone membaca PNG 180 piksel dengan namanya sendiri, Android dan setiap ajakan pemasangan membaca sebuah manifes, dan ubin yang disematkan ke menu mulai membaca sebuah XML. Tidak satu pun dari itu melihat ke dalam sebuah .ico. Semuanya dihasilkan di sini, di mesin Anda, dan di dalam zip-nya ada catatan yang menyebutkan setiap file itu untuk apa.

### Bisakah ia membuat ikon macOS juga?

Bisa — centang *ikon macOS*; dapatkan sebuah `.icns` di sebelah `.ico`-nya atau sebagai gantinya. Ia wadah lain untuk gagasan yang sama, dan kedua sistem tidak membaca punya yang lain: Windows mau .ico, paket aplikasi Mac mau .icns. Di sana ukuran bukan sebuah pilihan, karena Apple menerbitkan tepat sepuluh slot — 16, 32, 64, 128, 256, 512, dan 1024 piksel; tiga di antaranya muncul dua kali sebagai versi Retina dari ukuran di bawahnya. Semuanya masuk; mereka diambil dari tujuh gambar, dan itulah sebabnya sebuah .icns adalah file yang lebih besar.

### Bagaimana saya memakai file .icns-nya?

Untuk sebuah aplikasi, ia ditaruh di dalam paketnya di `YourApp.app/Contents/Resources/` dan dinamai di `Info.plist` di bawah `CFBundleIconFile`; setiap alat pengemas Mac punya kolom untuk itu. Untuk hal lain, pilih file-nya di Finder, tekan Command-C, lalu buka Get Info pada folder atau image disk yang ingin Anda ubah, klik ikon kecil di kiri atas, dan tekan Command-V.

### Apakah .icns-nya sama dengan yang dihasilkan iconutil?

Sepuluh slot yang sama dengan empat huruf tipe yang sama dan PNG di masing-masingnya; itu pula yang dihasilkan `iconutil` dari sebuah folder `.iconset`. Satu-satunya perbedaan yang disengaja: alat Apple juga menulis elemen `TOC` , sebuah direktori berisi tipe dan panjang yang menyusul. Itu sebuah pengoptimalan, bukan bagian dari formatnya — tanpanya sebuah pembaca menelusuri elemennya dari awal ke akhir dan sampai pada jawaban yang sama — dan direktori yang salah lebih buruk daripada tidak ada direktori; karena itu ia ditinggalkan.

### Bisakah saya mengubah beberapa gambar sekaligus?

Bisa. Setiap gambar di daftar menjadi .ico-nya sendiri dengan setelan yang sama, dan kumpulannya turun sebagai satu zip berisi satu folder per gambar — kalau tidak, keduanya akan bernama favicon.ico dan yang satu akan menimpa yang lain. Setiap keluaran yang Anda centang dihasilkan untuk setiap gambar. Klik baris mana pun untuk menaruh gambar itu di pratinjaunya.

### Apakah gratis, dan apakah saya perlu akun?

Gratis; tidak ada akun, tidak ada masuk, tidak ada masa uji coba, tidak ada tanda air. Tidak ada batas jumlah atau ukuran file-nya juga, karena tidak ada server yang membayarnya — pekerjaannya terjadi di perangkat Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang gambar Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet, dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim logo Anda ke tempat lain untuk diubah akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Logo Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Penskalaannya adalah sebuah `drawImage` ke sebuah kanvas; setiap ikon adalah sebuah header yang ditulis di depan piksel itu, di halaman ini, oleh `src/ico.js` atau `src/icns.js`.
- **File itu digambarkan dari byte-nya sendiri.** Daftar ukuran yang ditampilkan di sebelah ikon yang sudah jadi bukan daftar ukuran yang Anda minta. Ia dibaca kembali dari file yang baru saja ditulis oleh `readIcoDirectory` atau `readIcnsElements`; artinya kalau sebuah penulis bertentangan dengan setelannya, halaman ini akan mengatakannya, dan Anda tidak perlu mengetahuinya ketika Windows tidak menggambar apa pun dan macOS menggambar kertas kosong.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi apa pun tentang gambar Anda. Setiap baris yang membaca, menskalakan, atau menulis sebuah file disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/ico.js` dan `src/icns.js` untuk dua format ikonnya — direktori, entri, dan maskernya di yang satu, sepuluh slot bernama milik Apple di yang lain — dan `src/sizes.js` untuk asal setiap ukuran di halaman ini.
