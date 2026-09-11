# Pengambil Bingkai Video — simpan bingkai dari video

Gambar diam berkualitas penuh dari titik mana pun.

> Simpan bingkai mana pun dari MP4, MOV, atau WebM sebagai PNG atau JPEG ukuran penuh. Melangkah bingkai demi bingkai, atau ambil satu setiap beberapa detik. Berjalan di peramban Anda: tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/ambil-bingkai-video/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## video Anda **tidak pernah diunggah**. Tidak ada server.

Bingkainya dicari, didekode, dan digambar oleh peramban Anda sendiri, di perangkat keras Anda sendiri. Tidak ada di sini yang bisa mengambil atau mengirim apa pun — alat ini sama sekali tidak punya fitur jaringan — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah video.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Resolusi penuh
- ✓ Jalan tanpa internet

## Cara mengambil bingkai dari video

1. **Pilih sebuah video.** Jatuhkan MP4, MOV, M4V, atau WebM ke pemilih file, atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Temukan momennya.** Putar dan berhentilah di tempat yang Anda mau, atau seret penggeser — pada MP4 penggeser bergerak satu bingkai sekali langkah, jadi tidak ada pembulatan antara yang Anda lihat dan yang Anda simpan. Tombol panah melangkah satu bingkai sekali tekan, dan tahan `Shift` untuk sepuluh.
3. **Pilih formatnya.** PNG menyimpan bingkainya persis seperti hasil dekode, dan itulah arti "kualitas penuh" di sini. JPEG dan WebP lebih kecil dan merupakan kompresi kedua di atas kompresi videonya sendiri, yang tidak masalah untuk pratinjau dan tidak untuk apa pun yang disunting sesudahnya.
4. **Ambil satu, atau ambil serangkaian.** Satu bingkai langsung masuk ke unduhan Anda. "Setiap N detik" menelusuri klip sekali dan mengambil gambar diam di setiap tanda — berguna untuk lembar kontak dan gambar mini — dan hasilnya keluar sebagai satu ZIP, bukan seratus permintaan simpan.

## Versi lebih lengkap

[Cara menyimpan bingkai dari video sebagai gambar](https://abox.tools/id/panduan/ambil-bingkai-dari-video/): Dapatkan gambar diam dari sebuah klip pada resolusi aslinya: kenapa tangkapan layar dari pemutar yang dijeda bukan gambar yang sama, format apa yang dipakai menyimpannya, dan bagaimana mendarat tepat di bingkai yang Anda maksud.

## Juga ada di dalam kotak

- [Video ke GIF](https://abox.tools/id/video-ke-gif/): Pilih bagiannya, ukurannya, dan laju bingkainya.
- [Pembuat GIF](https://abox.tools/id/buat-gif/): Ubah sekumpulan gambar menjadi satu animasi.
- [Pemisah GIF](https://abox.tools/id/pisah-gif-ke-bingkai/): Setiap bingkai keluar sebagai PNG-nya sendiri.
- [Penganalisis GIF](https://abox.tools/id/analisis-gif/): Bingkai, jeda, palet, dan ke mana setiap byte pergi.

## Pertanyaan

### Apakah video saya diunggah ke suatu tempat?

Tidak. Ia dibaca dan didekode oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi internet dan tetap ambil sebuah bingkai kalau Anda lebih suka memeriksa daripada diberi tahu.

### Apa sebenarnya arti "kualitas penuh"?

Dua hal. Gambar diamnya disimpan pada resolusi asli videonya, bukan pada ukuran pratinjau di halaman — klip 4K memberi gambar ⁦3840 x 2160⁩. Dan dengan PNG dipilih, bingkainya disimpan persis seperti keluar dari dekoder, jadi file itu memuat gambar yang dimuat videonya, tanpa putaran kompresi kedua di atasnya. Tangkapan layar jendela pemutar tidak memberi keduanya: ia seukuran jendela, diambil setelah pemutar menskalakan dan mengelola warnanya.

### Dari format video apa saja saya bisa mengambil bingkai?

MP4, M4V, dan MOV dibaca langsung, apa pun isinya: H.264, HEVC, AV1, atau VP9, selama peramban Anda bisa mendekode kodek itu. Itulah jalur yang persis, tempat alat ini mengalamati bingkai satu per satu. Apa pun lain yang bisa diputar peramban Anda — yang paling jelas WebM — ditangani dengan mencari posisi di pemutar dan menggambar apa yang ditampilkannya, yang tetap menyimpan gambar ukuran penuh tapi mendarat pada bingkai yang dipilih pemutar, bukan yang Anda minta. File yang tidak bisa dibaca maupun diputar peramban, yang dalam praktiknya berarti AVI, WMV, FLV, dan sebagian besar MKV, ditolak dengan pesan.

### Bisakah saya melangkah satu bingkai sekali waktu?

Pada MP4, bisa, persis: alat ini membaca daftar bingkai milik file itu sendiri, jadi tombol panah bergerak di antara gambar-gambar yang memang ada di dalamnya — termasuk pada klip yang laju bingkainya berubah-ubah, di mana langkah tetap seperseratus tiga puluh detik akan melenceng. Di jalur pemutaran tidak ada daftar seperti itu, jadi satu langkah adalah geseran kira-kira satu bingkai dan halaman ini mengatakannya.

### Kenapa video ponsel saya yang tegak sudah menghadap benar di sini?

Karena rotasinya diterapkan dengan sengaja. Ponsel merekam melintang dan menulis seperempat putaran ke dalam file alih-alih memutar pikselnya, jadi bingkai yang diserahkan dekoder terbaring miring dan setiap pemutar memutarnya dalam perjalanan ke layar Anda. Alat yang melewati langkah itu menyimpan gambar yang masuk akal dari momen yang benar, dalam keadaan miring. Alat ini membaca putaran itu dari jalurnya dan menerapkannya sebelum apa pun digambar.

### Adakah batas ukuran atau durasi videonya?

Tidak ada batas yang tertanam di alat ini, dan file tidak dibaca ke memori sekaligus — ia ditelusuri beberapa megabyte sekali jalan, dan itulah sebabnya klip panjang terbuka secepat klip pendek. Gambar diam yang Anda ambil ditahan di halaman sampai Anda mengunduhnya, jadi batas praktisnya adalah beberapa ratus PNG 4K, bukan videonya sendiri.

### Bisakah saya mengubah ukuran atau memangkas gambarnya sesudahnya?

Tidak di sini, tapi di sebelah. Alat ini menyimpan bingkainya apa adanya; mengubah ukuran atau bentuknya adalah pekerjaan terpisah dengan keputusannya sendiri, dan [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/) melakukan keduanya, juga tanpa mengunggah apa pun. Memperkecil filenya tanpa mengubah gambarnya adalah [Kompresor Gambar](https://abox.tools/id/kompres-gambar/).

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang video Anda.

## Cara memverifikasi klaim privasi ini

- **Video Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Alat ini sama sekali tidak punya fitur jaringan: tidak ada alamat untuk ditempelkan, tidak ada yang diunduh, tidak ada mesin yang diambil saat pertama dipakai. Setiap byte yang menyentuh video Anda datang dari asal ini ketika halaman dimuat.
- **Pendekodean berjalan lokal.** Bingkainya melewati WebCodecs di peramban Anda sendiri, atau melewati mesin pemutar yang sama yang toh akan menampilkan klip itu kepada Anda. Gambarnya digambar ke sebuah kanvas di mesin ini dan diserahkan langsung ke unduhan.
- **File dibaca beberapa megabyte sekali jalan.** Video adalah satu-satunya jenis file di sini yang tidak bisa dipastikan muat di memori, jadi ia tidak pernah dimuat utuh. Pembaca mengambil sebuah jendela di sekitar bingkai apa pun yang Anda minta — itu juga sebabnya klip dua gigabyte terbuka secepat klip kecil.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang video Anda: bukan file, bukan bingkai, bukan nama, ukuran, durasi, atau momen tempat Anda berhenti. Setiap baris yang membaca, mendekode, atau menggambar disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau video Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap bekerja. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/shared/mp4-reader.js` untuk pembaca yang mencari bingkai di dalam MP4, dan `src/frames.js` untuk bagian yang mendekode bingkai yang Anda minta. Tidak satu pun mengimpor sesuatu yang bisa membuat permintaan.
