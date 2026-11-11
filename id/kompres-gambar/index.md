# Kompresor Gambar — kompres ke ukuran persis

Sebutkan ukurannya. Sisanya dia yang hitung.

> Kompres JPEG, PNG, atau WebP ke ukuran persis: 100 KB, 2 MB, berapa pun. Berjalan di peramban Anda, tidak ada yang diunggah, dan tetap jalan tanpa internet.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/kompres-gambar/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## gambar Anda **tidak pernah diunggah**. Tidak ada server.

Kompresi berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri, memakai encoder yang memang sudah dibawa peramban itu. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah gambar.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa batas ukuran
- ✓ Berfungsi luring
- ✓ Sumber terbuka

## Cara mengompres gambar ke ukuran tertentu

1. **Pilih gambar Anda.** Seret ke area pemilih atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Ketik ukuran yang diminta dari Anda.** 100 KB untuk formulir unggah yang terus menolak foto Anda, 500 KB untuk portal pendaftaran, 2 MB untuk halaman yang harus cepat dimuat. Empat angka yang paling sering dipakai tersedia sebagai tombol.
3. **Tekan "Kompres ke target".** Setiap gambar dikodekan beberapa kali sementara alat ini menyempitkan pilihan ke kualitas tertinggi yang masih muat. Apa pun yang sudah di bawah target dibiarkan apa adanya.
4. **Periksa apa biayanya, lalu unduh.** Setiap hasil menyebutkan ditulis sebagai apa, pada kualitas berapa, apakah dimensinya berubah, dan seberapa mirip dengan aslinya saat diukur. "Bandingkan" menaruh kedua gambar berdampingan.

## Versi lebih lengkap

[Cara mengompres gambar ke ukuran file yang tepat](https://abox.tools/id/panduan/kompres-gambar-ke-ukuran-tertentu/): Sebuah formulir unggahan meminta 500 KB dan foto Anda 4 MB. Berapa sebenarnya harga sebuah batas ukuran, setelan mana yang digerakkan lebih dulu, dan kenapa sebuah PNG tidak akan menyusut seperti JPEG.

## Juga ada di dalam kotak

- [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/): Sebutkan ukurannya. Gambar kotaknya. Pilih formatnya.
- [HEIC ke JPG](https://abox.tools/id/heic-ke-jpg/): Foto yang dibuat iPhone, dalam format yang bisa dibuka apa saja.
- [Pembuat Pas Foto](https://abox.tools/id/pas-foto-biometrik/): Pilih negaranya. Ia menerapkan aturan negara itu, persis.
- [Penumpuk Gambar](https://abox.tools/id/tumpuk-gambar/): Dua puluh bingkai menjadi satu, tanpa dua puluh unggahan dan tanpa pengubah RAW.

## Pertanyaan

### Apakah gambar saya diunggah ke suatu tempat?

Tidak. File itu didekode, dikompres, dan diukur oleh peramban Anda sendiri di perangkat keras Anda sendiri, memakai encoder JPEG, PNG, dan WebP yang memang sudah dibawa peramban. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebutkan setiap alamat yang boleh dihubunginya, yang tidak satu pun milik situs ini.

### Bagaimana caranya mencapai ukuran yang persis?

Dengan mencoba. Tidak ada rumus yang mengubah setelan kualitas menjadi jumlah byte — itu sepenuhnya bergantung pada gambarnya — jadi alat ini mengodekan gambar beberapa kali dan mencari jawabannya. Ia mulai dari puncak rentang kualitas lalu menyempit dengan membagi dua, yang menemukan kualitas tertinggi yang muat dalam sekitar delapan kali pengodean. Setiap ukuran yang Anda lihat di halaman ini adalah file yang benar-benar sudah dikodekan, bukan perkiraan.

### Apa arti "kehilangan minimal" di sini?

Tiga hal yang spesifik. Pertama, gambar yang sudah di bawah target Anda diteruskan byte demi byte, bukan dikodekan ulang. Kedua, kualitas dikorbankan lebih dulu sebelum resolusi, dan hanya sampai batas bawah tempat artefak kompresi mulai terlihat — setelah titik itu alat ini memperkecil gambarnya dan menaikkan kembali kualitasnya, karena piksel bagus yang lebih sedikit terlihat lebih baik daripada piksel rusak yang lebih banyak. Ketiga, begitu hasil yang muat ditemukan, pencarian mendorong kembali ke atas sampai anggarannya terpakai, jadi Anda tidak mendapat file 300 KB ketika meminta 500 KB.

### Angka SSIM dan PSNR pada setiap hasil itu apa?

Keduanya adalah pengukuran atas apa yang dikorbankan oleh kompresi, diambil dengan mendekode hasilnya lalu membandingkannya dengan gambar asli. SSIM membandingkan kecerahan, kontras, dan struktur lokal, yang jauh lebih dekat dengan apa yang mengganggu mata dibanding sekadar menghitung piksel yang berubah; di atas sekitar 0,98 keduanya sulit dibedakan saat disandingkan. PSNR adalah angka desibel yang konvensional. Keduanya dihitung di perangkat Anda, dan keduanya ditampilkan supaya klaim kehilangan yang kecil bisa diperiksa, bukan sekadar dinyatakan.

### Format apa saja yang bisa dibaca dan ditulisnya?

Ia membaca apa pun yang bisa didekode peramban Anda, yang dalam praktiknya berarti JPEG, PNG, WebP, GIF, BMP, dan — pada kebanyakan peramban saat ini — AVIF. Ia menulis JPEG, PNG, dan WebP, karena itulah encoder yang dibawa peramban. Pada "otomatis" ia mempertahankan format asal file Anda, dan beralih ke WebP hanya ketika mempertahankannya akan berarti pengubahan ukuran atau penurunan kualitas yang kelihatan.

### Kenapa PNG tidak bisa dikompres terlalu jauh?

Karena PNG bersifat lossless: tidak ada tombol kualitas untuk diputar. Satu-satunya cara memperkecil PNG adalah memberinya lebih sedikit piksel atau lebih sedikit warna, jadi dengan PNG terpilih alat ini mencapai target semata-mata dengan mengubah ukuran. Kalau gambarnya adalah foto, JPEG atau WebP akan jauh lebih mendekati target Anda pada ukuran yang jelas terlihat baik-baik saja — dan kalau itu logo atau tangkapan layar dengan transparansi, WebP mempertahankan transparansi yang akan diisi putih oleh JPEG.

### Apakah mengompres gambar menghapus data EXIF dan GPS-nya?

Ya, sebagai efek samping. Mengompres berarti mendekode gambar menjadi piksel lalu mengodekan piksel itu lagi, dan kanvas yang penuh piksel tidak membawa tag apa pun, sehingga lokasi, model kamera, cap waktu, dan segala yang lain sama sekali tidak ditulis ke file baru. Kalau Anda ingin metadatanya hilang tetapi gambarnya tidak tersentuh, pakai [Penampil & Penghapus EXIF](https://abox.tools/id/hapus-data-exif/) saja — alat itu menulis ulang wadahnya tanpa mengompres ulang apa pun.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada proses masuk, tidak ada masa coba, tidak ada tanda air. Tidak ada batasan jumlah maupun ukuran file juga, karena tidak ada server yang membayarinya — pekerjaannya terjadi di perangkat Anda sendiri. Situs ini memuat iklan, dan itulah yang membiayainya; iklan-iklan itu tidak diberi apa pun tentang gambar Anda.

### Apakah berfungsi tanpa koneksi internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim gambar Anda pergi untuk dikompres akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Gambar Anda tidak punya tempat untuk pergi.** Content-Security-Policy menyebutkan setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada endpoint di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya endpoint itu ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun dalam `src/`. Kompresinya adalah `canvas.toBlob` — encoder yang memang sudah terpasang di peramban Anda.
- **Angkanya diukur, bukan dilaporkan.** Ukuran, angka kualitas, dan perbandingan SSIM semuanya dihitung di halaman ini lalu ditampilkan kepada Anda. Tidak ada event analitik khusus di repositori ini yang membawa nama file, ukuran, jumlah, atau hasil.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi apa pun tentang gambar Anda. Setiap baris yang membaca, mengompres, atau mengukur sebuah file disajikan dari origin ini dan terdaftar di repositori.
- **Berfungsi tanpa koneksi internet.** Putuskan koneksi jaringan dan alat ini tidak berubah sedikit pun, karena memang tidak pernah ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/compress.js` untuk pencarian yang memutuskan berapa banyak kualitas yang dikorbankan, dan `src/measure.js` untuk perbandingan di balik angka "kemiripan visual".
