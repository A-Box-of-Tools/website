# Pembuat Time‑Lapse — percepat video panjang

Rekaman satu jam, dalam dua puluh detik.

> Ubah video panjang menjadi time-lapse: 10x, 60x, atau kecepatan berapa pun yang Anda ketik. Berjalan di peramban Anda, jadi tidak ada yang diunggah, tidak ada tanda air, dan jalan tanpa internet.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/buat-video-time-lapse/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## video Anda **tidak pernah diunggah**. Tidak ada server.

Setiap bingkai dipilih, didekode, dan dikodekan lagi oleh peramban Anda sendiri, di perangkat keras Anda sendiri. Tidak ada di sini yang bisa mengambil atau mengirim apa pun — alat ini sama sekali tidak punya fitur jaringan — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah video.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Kecepatan berapa pun yang Anda ketik
- ✓ Jalan tanpa internet

## Cara membuat time-lapse dari video

1. **Pilih sebuah video.** Jatuhkan MP4, MOV, M4V, atau WebM ke pemilih file, atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Sebutkan berapa kali lebih cepat.** Tekan salah satu kecepatannya, atau ketik sendiri. Kalau Anda lebih suka menyebutkan berapa lama hasilnya nanti — “buat ini muat dalam dua puluh detik” — ketik itu saja dan kecepatannya mengikuti.
3. **Periksa selangnya.** Baris di bawah kecepatan mengatakan apa yang sebenarnya akan dilakukan alat ini: satu bingkai setiap sekian detik dari aslinya. Itulah angka yang akan diatur seorang fotografer di kameranya, dan itulah yang layak diperiksa nalarnya sebelum Anda mulai.
4. **Buat dan unduh.** Pekerjaannya terjadi di perangkat keras Anda sendiri, jadi lamanya tergantung mesin Anda, bukan pada antrean. Video yang sudah jadi diserahkan langsung ke unduhan peramban Anda.

## Versi lebih lengkap

[Cara mengubah video panjang menjadi timelapse](https://abox.tools/id/panduan/mengubah-video-panjang-jadi-timelapse/): Satu jam rekaman menjadi satu menit yang enak ditonton: cara memilih kecepatan, mengapa menyebutkan durasi akhir lebih baik daripada berhitung, dan kapan hasilnya perlu menjadi GIF.

## Juga ada di dalam kotak

- [Pengambil Bingkai Video](https://abox.tools/id/ambil-bingkai-video/): Gambar diam berkualitas penuh dari titik mana pun.
- [Video ke GIF](https://abox.tools/id/video-ke-gif/): Pilih bagiannya, ukurannya, dan laju bingkainya.
- [Pembuat GIF](https://abox.tools/id/buat-gif/): Ubah sekumpulan gambar menjadi satu animasi.
- [Pemisah GIF](https://abox.tools/id/pisah-gif-ke-bingkai/): Setiap bingkai keluar sebagai PNG-nya sendiri.

## Pertanyaan

### Apakah video saya diunggah ke suatu tempat?

Tidak. Ia dibaca, didekode, diambil sampelnya, dan dikodekan oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi internet dan tetap buat sebuah time-lapse kalau Anda lebih suka memeriksa daripada diberi tahu.

### Apa sebenarnya arti kecepatannya?

Rasio antara yang masuk dan yang keluar. Pada 60×, rekaman satu jam menjadi satu menit, pada laju bingkai berapa pun Anda memutarnya. Di baliknya, alat ini mengambil satu bingkai setiap *kecepatan ÷ laju bingkai* detik — 60× pada 30 bingkai per detik berarti satu bingkai setiap dua detik — dan halaman ini menampilkan selang itu sebelum Anda mulai, karena itulah angka yang mengatakan apa yang sebenarnya terjadi.

### Format video apa saja yang bisa saya percepat?

MP4, M4V, dan MOV dibaca langsung, apa pun isinya: H.264, HEVC, AV1, atau VP9, selama peramban Anda bisa mendekode kodek itu. Apa pun lain yang bisa diputar peramban Anda — yang paling jelas WebM — dibaca dengan mencari posisi pemutar peramban sendiri ke setiap saat, yang berhasil pada setiap format yang bisa diputarnya. File yang tidak bisa dibaca maupun diputar peramban, yang dalam praktiknya berarti AVI, WMV, FLV, dan sebagian besar MKV, ditolak dengan pesan alih-alih gagal di tengah jalan. Yang keluar selalu berupa MP4.

### Kenapa time-lapse-nya tidak bersuara?

Karena tidak ada yang layak disimpan. Suara yang diputar tiga puluh kali terlalu cepat bukan ucapan atau musik, melainkan cicitan; dan alternatifnya — menjaga suara pada kecepatan aslinya di bawah gambar yang sudah melesat jauh mendahuluinya — akan menjadi klip yang berbeda dari yang Anda minta. Jadi jalurnya dibuang, yang juga merupakan sebagian besar alasan video satu jam keluar sebagai beberapa megabyte. Kalau Anda mau audionya sendiri, [Penyunting Audio](https://abox.tools/id/sunting-audio/) akan menyimpannya.

### Apakah lebih cepat daripada mengubah seluruh videonya?

Jauh lebih cepat, dan itulah gunanya membaca file secara langsung. Sebuah bingkai hanya bisa didekode dengan mulai dari bingkai kunci di depannya, tapi tidak ada yang mengharuskan bingkai di antaranya disimpan — jadi time-lapse 60× dari satu jam mendekode beberapa ribu bingkai dari seratus ribu, bukan semuanya. Ringkasannya mengatakan persis berapa banyak yang akan dibacanya sebelum Anda menekan tombolnya.

### Apakah kualitasnya turun?

Bingkai yang disimpannya dikodekan untuk kedua kalinya, dan itu memakan sedikit; hal itu tidak bisa dihindari, karena klip yang sudah jadi menampilkannya pada waktu yang tidak pernah dikodekan oleh apa pun di file aslinya. Yang justru dibelanjakan alat ini lebih banyak daripada alat video lain di sini adalah bit rate-nya, dengan sengaja. Dua bingkai berjarak dua detik jauh lebih sedikit kesamaannya daripada dua bingkai berjarak sepertiga puluh detik, jadi kodek punya lebih sedikit yang bisa dipakai ulang, dan angka yang disetel untuk rekaman biasa akan keluar kotak-kotak.

### Adakah batas ukuran atau durasi videonya?

Tidak ada batas yang tertanam di alat ini, dan file tidak dibaca ke memori sekaligus — ia dibaca dalam deretan pendek di sekitar setiap saat, dan hanya itu. Batas praktisnya adalah time-lapse yang sudah jadi, yang dirakit di memori sebelum Anda mengunduhnya, dan sebuah time-lapse menurut definisinya pendek: ringkasannya menunjukkan kira-kira seberapa besar ia nanti sebelum Anda mulai.

### Bisakah saya mempercepat hanya sebagian klip?

Tidak di sini. Alat ini mengambil keseluruhannya dari bingkai pertama sampai terakhir. Potong dulu bagian yang Anda mau dengan [Pemotong Video](https://abox.tools/id/potong-video/) — yang melakukannya tanpa mengodekan ulang satu bingkai pun — lalu percepat hasilnya.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang video Anda.

## Cara memverifikasi klaim privasi ini

- **Video Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Alat ini sama sekali tidak punya fitur jaringan: tidak ada alamat untuk ditempelkan, tidak ada yang diunduh, tidak ada mesin yang diambil saat pertama dipakai. Setiap byte yang menyentuh video Anda datang dari asal ini ketika halaman dimuat.
- **Pendekodean dan pengodean berjalan lokal.** Bingkainya melewati WebCodecs di peramban Anda sendiri, atau melewati mesin pemutar yang sama yang toh akan menampilkan klip itu kepada Anda. File yang sudah jadi dibangun di memori mesin ini dan diserahkan langsung ke unduhan.
- **Sebagian besar file bahkan tidak pernah dibaca.** Sebuah time-lapse butuh satu bingkai setiap beberapa detik, jadi alat ini membaca deretan pendek file di sekitar masing-masingnya dan melewati sisanya. Itu keputusan soal kecepatan, bukan soal privasi, dan tetap layak diketahui: bahkan secara lokal, sebagian besar video Anda tidak pernah dibuka.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang video Anda: bukan file, bukan bingkai, bukan nama, ukuran, atau durasi. Setiap baris yang membaca, mendekode, mengambil sampel, atau mengodekan disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau video Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap bekerja. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/plan.js` untuk aritmetika yang memutuskan setiap bingkai berasal dari saat yang mana, dan `src/decode.js` untuk perulangan yang hanya membaca bagian file yang dibutuhkan saat-saat itu. Tidak satu pun mengimpor sesuatu yang bisa membuat permintaan.
