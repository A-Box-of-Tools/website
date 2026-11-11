# SVG ke Gambar — ubah vektor menjadi PNG, JPEG, atau WebP pada ukuran berapa pun

Sebutkan ukurannya. Sebuah vektor tidak punya ukuran sendiri untuk hilang.

> Ubah SVG menjadi PNG, JPEG, atau WebP pada ukuran berapa pun, di peramban Anda. Sebutkan lebarnya, sebuah kelipatan, atau sebuah kotak; dapatkan salinan @2x dan @3x juga. Transparansi terjaga, tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/svg-ke-png/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## file SVG Anda **tidak pernah diunggah**. Tidak ada server.

Gambarnya diubah menjadi piksel oleh mesin yang sama yang baru saja menampilkannya di layar Anda. File Anda dibaca dari disk Anda, tag akarnya ditulis ulang ke ukuran yang Anda minta oleh seratus baris di `src/svg.js` yang bisa Anda baca, dan ia digambar ke sebuah kanvas yang memang sudah dibawa peramban Anda. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah logo.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara mengubah SVG menjadi PNG tanpa mengunggahnya

1. **Pilih SVG-nya.** Jatuhkan satu ke pemilih file, atau pilih satu folder berisi SVG dan ubah semuanya sekali jalan. File dibaca peramban langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya. Setiap baris mengatakan file itu menganggap dirinya berukuran berapa — dan mengatakannya secara berbeda kalau ukuran itu datang dari `viewBox`-nya, atau diandaikan karena file-nya tidak menyatakan apa pun.
2. **Sebutkan seberapa besar.** Kelipatan dari ukuran milik file itu sendiri adalah jawaban tercepat dan yang tepat untuk satu kumpulan: setiap gambar diskalakan dari titik awalnya sendiri, jadi sekumpulan ikon tetap sebanding. Selain itu, sebutkan sebuah lebar, sebuah tinggi, sisi terpanjang, atau sebuah kotak dengan kedua sisinya diberikan. Tidak ada hukuman untuk angka besar di sini seperti pada sebuah foto — gambarnya digambar ulang pada ukuran itu, bukan diregangkan ke sana.
3. **Tambahkan salinan berkepadatan tinggi kalau Anda butuh.** Ponsel dan laptop Retina menggambar dua atau tiga piksel perangkat untuk setiap piksel CSS, jadi logo 200 piksel butuh file 400 atau 600 piksel di belakangnya. Mintalah `@2x` dan `@3x` dan mereka keluar dengan nama yang diharapkan Xcode, perkakas Android, dan `image-set()` di CSS, dan masing-masing persis dua atau tiga kali yang pertama alih-alih dibulatkan sendiri-sendiri.
4. **Pilih formatnya dan putuskan soal transparansinya.** PNG kecuali Anda punya alasan: ia tanpa kehilangan, ia menjaga transparansi, dan warna datar terkompres dengan baik di dalamnya. JPEG sama sekali tidak punya transparansi, jadi sebuah warna latar dicat masuk entah Anda memilihnya atau tidak — tanpanya setiap piksel transparan keluar hitam. WebP melakukan keduanya dan membuat file lebih kecil, dengan biaya perangkat lunak yang cukup tua sehingga tidak bisa membacanya.
5. **Lihat pratinjaunya sebelum Anda mengunduh.** Ia digambar oleh kode yang sama yang menulis file-nya, dari file Anda, di mesin Anda. Dua hal berubah ketika sebuah gambar menjadi piksel dan keduanya muncul di sini: garis setipis rambut yang tadinya selebar setengah piksel menjadi abu-abu, dan teks apa pun digambar dengan font yang dimiliki komputer ini alih-alih yang diambil dari web.
6. **Ambil file-nya.** Satu unduhan per file, atau seluruh kumpulan sebagai satu zip. Namanya mengikuti SVG asalnya, dengan `@2x` dan `@3x` pada salinannya, dan dua file yang akan bernama sama diberi nomor alih-alih yang satu diam-diam menimpa yang lain.

## Versi lebih lengkap

[Cara mengubah SVG menjadi PNG pada ukuran yang tepat](https://abox.tools/id/panduan/svg-ke-png/): Sebuah vektor tidak punya ukuran piksel miliknya sendiri, jadi angkanya Anda yang pilih. Dari mana angka itu datang untuk sebuah layar, sebuah ikon aplikasi, dan sebuah pencetak, dan apa yang berubah ketika sebuah gambar menjadi piksel.

## Juga ada di dalam kotak

- [Gambar ke SVG](https://abox.tools/id/gambar-ke-svg/): Satu bentuk, satu garis luar. Tunjuk saja yang seharusnya tidak ada.
- [Pembanding Tinggi Badan](https://abox.tools/id/bandingkan-tinggi-badan/): Ketik tingginya, bawa gambarnya. Tidak ada yang dikirim untuk menggambarnya.
- [Kompresor Gambar](https://abox.tools/id/kompres-gambar/): Sebutkan ukurannya. Sisanya dia yang hitung.
- [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/): Sebutkan ukurannya. Gambar kotaknya. Pilih formatnya.

## Pertanyaan

### Apakah SVG saya diunggah ke suatu tempat?

Tidak. File dibaca oleh peramban Anda sendiri di perangkat keras Anda sendiri, digambar ke sebuah kanvas oleh mesin yang sama yang menggambar setiap gambar lain yang Anda lihat, dan diserahkan kembali sebagai sebuah unduhan. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

### Pada ukuran berapa sebaiknya saya mengubah SVG menjadi piksel?

Berapa pun yang diminta oleh yang akan membacanya, dikalikan rasio piksel perangkat layar tempat ia akan dilihat. Logo yang menempati 200 piksel CSS butuh 400 untuk laptop Retina dan 600 untuk ponsel masa kini, dan itulah salinan `@2x` dan `@3x` di sini. Untuk ikon aplikasi atau kartu di toko aplikasi, tokonya menyebut angka yang persis dan itulah angkanya. Kalau tidak ada yang memberi tahu Anda, 1024 pada sisi terpanjang adalah bawaan yang berguna: cukup besar untuk hampir semua keperluan dan cukup kecil untuk dikirim lewat email.

### Apakah memperbesarnya menurunkan kualitas?

Tidak, dan inilah satu tempat di mana jawaban itu benar-benar tidak. Sebuah vektor adalah instruksi alih-alih piksel, jadi peramban menggambar kurvanya lagi pada ukuran berapa pun yang diminta. 4000 piksel dari ikon 24 piksel persis setajam 24-nya. Yang tidak bisa Anda lakukan adalah arah sebaliknya: begitu ia menjadi PNG ia adalah piksel seperti yang lain, jadi ubahlah ke piksel pada ukuran yang Anda butuhkan alih-alih mengubah ukuran hasilnya nanti.

### SVG saya tidak punya width atau height. Saya dapat ukuran berapa?

`viewBox`-nya, kalau ada — lebar dan tingginya adalah satuan pengguna alih-alih piksel, tapi itulah satu-satunya angka di dalam file dan peramban memperlakukannya sebagai ukuran alami gambarnya. Kalau viewBox-nya juga tidak ada, halaman ini menulis *diandaikan* di sebelah barisnya dan memakai ⁦300 × 150⁩, yang akan dipakai sebuah `<img>` untuk menggambarnya. Bagaimanapun Anda bisa menyebut ukuran yang Anda mau dan file-nya digambar pada ukuran itu.

### Kenapa teksnya tampak berbeda di PNG-nya?

Karena font-nya tidak ada di dalam SVG. Sebuah SVG yang menggambar teks menyebut nama sebuah font dan menyerahkan pencariannya kepada mesin, dan file yang menarik font dari Google Fonts lewat `@import` tidak mendapat apa-apa di sini: SVG yang digambar lewat sebuah `<img>` tidak diizinkan mengambil apa pun, dan itu aturan yang sama yang menghentikannya menelepon pulang dengan file Anda. Perbaikannya adalah yang sudah diketahui setiap desainer — ubah teksnya menjadi jalur di program gambar sebelum mengekspor. Setelah itu ia adalah geometri, dan ia tampak sama di mana-mana.

### Bisakah ia mengubah beberapa file sekaligus?

Bisa. Setiap SVG di daftar digambar dengan setelan yang sama dan kumpulannya turun sebagai satu zip. Sebuah kelipatan — “4× ukuran yang diminta file-nya” — biasanya setelan yang tepat untuk satu kumpulan, karena setiap gambar diskalakan dari ukurannya sendiri alih-alih semuanya dipaksa ke jumlah piksel yang sama. Klik baris mana pun untuk menaruh yang itu di pratinjaunya.

### Adakah batas ukurannya?

Batas peramban, bukan batas kami. Sebuah kanvas menyerah di suatu titik melewati 16.384 piksel di satu sisi, dan Safari di iPhone atau iPad berhenti pada sekitar 16,7 megapiksel luas — ⁦4096 × 4096⁩. Di atas itu halaman ini memperingatkan Anda alih-alih menyerahkan gambar kosong, yang justru dilakukan peramban ketika ia kehabisan: `toBlob` tidak mengembalikan apa pun, tanpa galat yang menjelaskan dirinya. Melewati 100 megapiksel alat ini menolak, karena itu berarti 400 MB kanvas sebelum satu byte pun dikodekan.

### Apa yang terjadi pada transparansinya?

Ia terjaga, di PNG dan di WebP. JPEG sama sekali tidak punya kanal alfa, jadi sebuah warna dicat di belakang seluruh gambarnya entah Anda memintanya atau tidak — tanpa itu, semua yang transparan akan keluar hitam, yang tampak seperti kerusakan alih-alih seperti JPEG. Memilih warna latar dengan PNG juga hal yang sangat lumrah untuk diinginkan: ia meratakan gambarnya ke warna itu alih-alih meninggalkan lubang.

### Bisakah ia membaca SVG yang memuat skrip atau gambar eksternal?

Ia bisa membacanya, dan ia akan menggambar persis bagian yang mau digambar sebuah peramban. SVG yang dimuat lewat sebuah `<img>` berada dalam *mode statis aman*: skrip tidak berjalan, rujukan eksternal tidak diambil, dan animasi tidak diputar — bingkai pertamanyalah yang Anda dapat. Jadi file dengan `<image>` jarak jauh di dalamnya keluar dengan bagian itu hilang. Itu peramban yang menolak atas nama Anda, dan itulah alasan halaman ini bisa dengan aman membuka file yang belum pernah dilihatnya.

### Apa bedanya ini dengan Pengubah Ukuran Gambar?

Sumbernya. Pengubah Ukuran Gambar mulai dari piksel — sebuah JPEG, sebuah PNG — jadi memperbesarnya harus mengarang detail yang tidak pernah ada. Yang ini mulai dari sebuah gambar, jadi tidak ada yang perlu dikarang dan tidak ada batas atas yang layak dikhawatirkan. Kalau yang Anda punya adalah SVG, inilah yang memberi hasil tajam; kalau yang Anda punya adalah foto, itulah yang lain.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Tidak ada batas jumlah atau ukuran file-nya juga, karena tidak ada server yang membayarnya — pekerjaannya terjadi di mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang file Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim karya Anda ke tempat lain untuk digambar akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Karya Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Seluruh pengubahnya adalah sebuah `<img>` yang memuat blob dari file Anda sendiri, satu `drawImage` ke sebuah kanvas, dan satu `canvas.toBlob`.
- **Sebuah SVG adalah dokumen, dan ini mode di mana ia tidak bisa bertindak.** Sebuah SVG bisa membawa `<script>`, sebuah `<image href="https://…">` jarak jauh, sebuah lembar gaya, dan sebuah font web. Digambar lewat sebuah `<img>`, ia berada dalam apa yang disebut spesifikasi sebagai *mode statis aman*: skripnya tidak berjalan dan tidak satu pun alamat itu diambil. Itu jaminan peramban, bukan janji kami, dan itulah alasan halaman ini bisa membuka file yang belum pernah dilihatnya tanpa file itu bisa menelepon pulang.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi apa pun tentang gambar Anda. Setiap baris yang membaca, menetapkan ukuran, atau menggambar sebuah file disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/svg.js` untuk bagaimana ukuran milik sebuah file dibaca dan bagaimana tag akarnya ditulis ulang, dan `src/render.js` untuk delapan baris yang melakukan pengubahannya menjadi piksel — sebuah <img>, sebuah `drawImage`, dan sebuah `toBlob`, tanpa apa pun di antaranya.
