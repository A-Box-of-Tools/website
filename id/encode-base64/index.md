# Pengode & Pengurai Base64 — dan URL, entitas HTML, heksadesimal, dan escape

Base64, pengodean persen, entitas HTML, heksadesimal, dan escape garis miring terbalik, dua arah. Tidak ada yang ditempelkan ke server orang lain.

> Kodekan dan uraikan Base64 dalam kedua alfabetnya, kodekan URL dengan persen, escape entitas HTML, dan baca heksadesimal serta escape garis miring terbalik. Semuanya berjalan di peramban Anda dan tidak ada yang diunggah - sebuah token tidak pernah meninggalkan mesin Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/encode-base64/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## teks Anda **tidak pernah diunggah**. Tidak ada server.

Setiap pengodean di sini adalah aritmetika atas sebuah string, dikerjakan di sini, di halaman ini. Kodeknya ditulis sendiri dan ada di dalam `src/encode.js` — dan tidak ada yang lain. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan itu lebih penting di sini daripada hampir di mana pun: yang ditempelkan orang ke pengurai Base64 daring adalah sebuah token, dan menempelkan sebuah token ke situs orang lain berarti menyerahkannya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa batas ukuran
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara mengodekan atau menguraikan Base64 tanpa mengunggahnya

1. **Pilih pengodeannya.** Base64 dalam kedua alfabet, pengodean persen untuk satu nilai atau seluruh URL, lima entitas HTML, byte heksadesimal, dan escape garis miring terbalik sebuah literal string. Catatan di bawah menunya menjelaskan kegunaan masing-masing.
2. **Pilih arahnya.** *Encode* mengambil teks polos dan menghasilkan bentuk terkodenya; *Decode* mengembalikan bentuk terkode ke teks polos. Hasilnya mengikuti ketikan Anda: berganti arah cukup satu klik, tanpa mengetik ulang.
3. **Tempelkan, atau jatuhkan file-nya.** Apa pun yang bisa Anda pilih dan salin bisa dipakai. File yang dijatuhkan ke pemilihnya dibaca peramban Anda sendiri dan ditaruh di kotaknya — tidak ada langkah unggah untuk ditinggalkan.
4. **Baca galatnya, kalau ada.** Pengurai yang gagal di sini mengatakan apa yang ditemuinya — karakter yang tidak dipakai Base64, isian di tempat yang salah, byte yang bukan teks — alih-alih mengembalikan sesuatu yang tampak masuk akal tetapi salah.
5. **Ambil hasilnya.** Salin, atau unduh sebagai file teks. Penghitung di bawah kotaknya menyebut berapa byte yang masuk dan berapa yang keluar.

## Juga ada di dalam kotak

- [Berbagi teks dan berkas](https://abox.tools/id/berbagi-teks/): Bagikan ini hidup di tab yang terbuka. Pembaca menerimanya terenkripsi, langsung dari browser Anda, dan menutup tab mengakhirinya - tidak ada server yang menyimpan apa pun.
- [Pembuat QR dan Barkode](https://abox.tools/id/buat-kode-qr/): Ketik, dan ia menjadi sebuah kode. Tidak ada yang dikirim untuk membuatnya.
- [Pembaca QR & Barcode](https://abox.tools/id/pindai-kode-qr/): Arahkan ke sebuah kode, atau jatuhkan gambarnya. Ia dibaca di sini, dan tidak di tempat lain.
- [Hash dan Checksum](https://abox.tools/id/hitung-checksum/): Periksa sebuah unduhan terhadap angka yang dicetak penerbitnya, tanpa mengirimnya ke siapa pun.

## Pertanyaan

### Apakah teks saya diunggah ke suatu tempat?

Tidak. Setiap pengode dan setiap pengurai di halaman ini adalah fungsi yang berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Itulah alasan memakainya untuk sebuah token akses atau cookie sesi: menempelkan salah satunya ke pengurai orang lain berarti memberikannya kepada mereka.

### Apakah Base64 di sini sama dengan Base64 di mana-mana?

Ya — ia diperiksa terhadap vektor uji di RFC 4648 alih-alih terhadap dirinya sendiri. Kedua alfabetnya bisa didekode, jadi JWT yang ditulis dengan `-` dan `_` terbaca semudah yang ditulis dengan `+` dan `/`, dan masukan yang dipatahkan pada 64 karakter dirapikan untuk Anda. Pengodeannya lewat byte UTF-8, jadi huruf beraksen atau sebuah emoji selamat dalam perjalanan bolak-balik.

### Apakah Base64 itu enkripsi?

Bukan, dan menganggapnya enkripsi adalah kekeliruan klasik. Base64 adalah cara menulis: byte yang sama, ditulis dengan alfabet yang selamat di dalam URL, surel, atau string JSON. Siapa pun bisa membacanya kembali — halaman ini melakukannya dalam semilidetik — jadi ia tidak menyembunyikan apa-apa dan tidak melindungi apa-apa. Kalau yang Anda punya adalah rahasia, ia butuh enkripsi sungguhan sebelum dikodekan, bukan sebagai gantinya.

### Kenapa penguraiannya gagal?

Karena yang ditempelkan bukan persis yang dikira kodeknya, dan galatnya menyebut di mana bedanya: karakter di luar alfabet Base64, isian di tempat yang salah, tanda persen tanpa dua digit heksadesimal di belakangnya, atau byte yang memang bisa diuraikan dari Base64 tetapi bukan teks UTF-8 — yang biasanya berarti aslinya adalah sebuah file, bukan string. `atob` bawaan peramban akan mengembalikan sesuatu yang tampak masuk akal; diberi tahu adalah seluruh gunanya menempelkan sesuatu ke sebuah pengurai.

### Apa beda kedua pengodean alamat web itu?

Satu nilai, atau seluruh alamat. Mengodekan *satu nilai* meng-escape semua yang diberi arti oleh URL — garis miring, tanda tanya, tanda dan — dan itulah yang Anda mau untuk satu parameter kueri. Mengodekan *seluruh URL* membiarkan alamatnya tetap bekerja: garis miring dan `?` tetap ada, dan hanya karakter yang memang tidak bisa dibawa URL yang di-escape. Memakai yang pertama pada seluruh alamat merusak alamatnya; memakai yang kedua pada sebuah nilai menghilangkan batas akhir nilainya.

### Sebesar apa file yang bisa ditanganinya?

Tidak ada batas yang ditetapkan di sini, karena tidak ada server yang membayarnya. Batas praktisnya adalah mesin Anda sendiri: beberapa megabyte teks tidak masalah, dan pada dokumen yang sangat panjang halaman ini menunggu jeda dalam ketikan Anda sebelum mengodekan ulang, alih-alih berebut papan ketik dengan Anda.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada batas berapa banyak yang Anda tempelkan. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang teks Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim teks Anda ke tempat lain untuk diuraikan akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Apa yang Anda tempelkan tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat token yang ditempelkan bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Setiap pengode dan setiap pengurai adalah fungsi di halaman ini yang mengambil sebuah string dan mengembalikan sebuah string.
- **Pengurai memberi tahu Anda kalau ada yang salah.** `atob` bawaan peramban menerima masukan yang seharusnya ditolaknya dan mengembalikan sesuatu yang tampak masuk akal. Base64 di sini ditulis sendiri dan diperiksa terhadap vektor uji RFC 4648, dan ketika yang Anda tempelkan bukan Base64 ia mengatakannya, dan mengatakan sebabnya. Pengujian di `tests/js/text-encode.test.js` memeriksa persis hal itu.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi satu karakter pun dari teks Anda. Setiap baris yang membaca, mengurai, atau menulisnya disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy dan `src/encode.js` untuk Base64 yang diperiksa terhadap vektor uji RFC 4648, bukan terhadap dirinya sendiri, dan yang menolak masukan buruk alih-alih mengembalikan sesuatu yang tampak masuk akal seperti `atob`.
