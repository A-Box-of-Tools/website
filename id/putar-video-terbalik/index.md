# Pembalik Video — putar video terbalik

Bingkai terakhir lebih dulu, lengkap dengan suaranya.

> Putar MP4, MOV, atau WebM secara terbalik, dengan suaranya ikut dibalik. Berjalan di peramban Anda: tidak ada yang diunggah, tidak ada tanda air, dan jalan tanpa internet.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/putar-video-terbalik/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## video Anda **tidak pernah diunggah**. Tidak ada server.

Setiap bingkai didekode, dibalik, dan dikodekan lagi oleh peramban Anda sendiri, di perangkat keras Anda sendiri. Tidak ada di sini yang bisa mengambil atau mengirim apa pun — alat ini sama sekali tidak punya fitur jaringan — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah video.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Membalik suaranya juga
- ✓ Jalan tanpa internet

## Cara memutar video terbalik

1. **Pilih sebuah video.** Jatuhkan MP4, MOV, M4V, atau WebM ke pemilih file, atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Putuskan soal suaranya.** “Balik suaranya juga” membalik jalurnya sampel demi sampel, dan itulah yang membuat ucapan keluar sebagai ucapan yang diputar terbalik, bukan sebagai keheningan. Matikan untuk klip tanpa suara, yang lebih cepat.
3. **Pilih berapa banyak kualitas yang dibelanjakan.** Gambarnya harus dikodekan lagi, karena bingkainya keluar dalam urutan yang tidak pernah dikodekan oleh apa pun di dalam file itu. “Seimbang” tetap dekat dengan apa yang dibelanjakan aslinya; “Kualitas terbaik” membelanjakan lebih.
4. **Balik dan unduh.** Pekerjaannya terjadi di perangkat keras Anda sendiri, jadi lamanya tergantung mesin Anda, bukan pada antrean. Video yang sudah jadi diserahkan langsung ke unduhan peramban Anda.

## Versi lebih lengkap

[Cara memutar video terbalik](https://abox.tools/id/panduan/memutar-video-terbalik/): Putar sebuah klip mundur: apa yang dilakukan pembalikan pada gambar dan suaranya, kenapa ia tidak bisa dilakukan tanpa pengodean ulang, kenapa ia lebih lambat daripada pemotongan, dan apa yang perlu dikerjakan lebih dulu.

## Juga ada di dalam kotak

- [Pembuat Time-Lapse](https://abox.tools/id/buat-video-time-lapse/): Rekaman satu jam, dalam dua puluh detik.
- [Pengambil Bingkai Video](https://abox.tools/id/ambil-bingkai-video/): Gambar diam berkualitas penuh dari titik mana pun.
- [Video ke GIF](https://abox.tools/id/video-ke-gif/): Pilih bagiannya, ukurannya, dan laju bingkainya.
- [Pembuat GIF](https://abox.tools/id/buat-gif/): Ubah sekumpulan gambar menjadi satu animasi.

## Pertanyaan

### Apakah video saya diunggah ke suatu tempat?

Tidak. Ia dibaca, didekode, dibalik, dan dikodekan oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi internet dan tetap balik sebuah klip kalau Anda lebih suka memeriksa daripada diberi tahu.

### Format video apa saja yang bisa saya balik?

MP4, M4V, dan MOV dibaca langsung, apa pun isinya: H.264, HEVC, AV1, atau VP9, selama peramban Anda bisa mendekode kodek itu. Apa pun lain yang bisa diputar peramban Anda — yang paling jelas WebM — dibalik dengan cara melangkahkan pemutar peramban sendiri mundur melewatinya, yang berhasil tapi lebih lambat. File yang tidak bisa dibaca maupun diputar peramban, yang dalam praktiknya berarti AVI, WMV, FLV, dan sebagian besar MKV, ditolak dengan pesan alih-alih gagal di tengah jalan. Yang keluar selalu berupa MP4.

### Apakah suaranya ikut dibalik?

Ya, kecuali Anda mematikannya. Seluruh jalur didekode, sampelnya diletakkan dalam urutan terbalik, dan dikodekan lagi sebagai AAC. Tidak ada cara menghindari pengodean kedua itu: sebuah paket audio adalah suara selama beberapa puluh milidetik yang dikodekan terhadap paket sebelumnya, jadi menulis paketnya dari belakang ke depan akan memutar potongan-potongan pendek ke arah maju dalam urutan yang salah — yang terdengar seperti kerusakan, bukan seperti pembalikan.

### Apakah membalik menurunkan kualitas?

Gambarnya dikodekan untuk kedua kalinya, dan itu memakan sedikit. Di sini hal itu tidak bisa dihindari seperti saat memotong: klip yang dibalik menampilkan bingkainya dalam urutan yang tidak pernah dikodekan oleh apa pun di file aslinya, jadi setiap bingkai harus ditulis dari awal. Yang tidak akan dilakukan alat ini adalah membelanjakan lebih banyak daripada aslinya, karena mengodekan di atas itu hanya membuat file lebih besar tanpa membuatnya tampak lebih baik.

### Adakah batas ukuran atau durasi videonya?

Tidak ada batas yang tertanam di alat ini, dan file tidak dibaca ke memori sekaligus — ia ditelusuri satu kelompok bingkai demi kelompok bingkai, secara mundur. Batas praktisnya adalah video yang sudah jadi, yang dirakit di memori sebelum Anda mengunduhnya, dan suaranya, yang harus ditahan utuh karena membalik butuh sampel terakhir sebelum bisa menulis yang pertama.

### Kenapa pada sebagian file lebih lambat daripada yang lain?

Karena ada dua jalan masuk. MP4 atau MOV dibaca alat ini secara langsung dan didekode satu kelompok bingkai sekali jalan, secepat mesin Anda bisa. Selain itu, pembalikan dilakukan dengan meminta pemutar peramban sendiri satu momen klip demi satu momen, dan setiap pencarian itu membuat peramban mendekode dari bingkai kunci di depannya. Halaman ini mengatakan yang mana dari keduanya yang dipakai, dan alasannya, sebelum Anda mulai.

### Bisakah saya membalik hanya sebagian klip?

Tidak di sini. Alat ini membalik keseluruhannya: klip yang keluar sama persis panjangnya dengan yang masuk, dengan bingkai terakhir lebih dulu. Potong dulu bagian yang Anda mau dengan [Pemotong Video](https://abox.tools/id/potong-video/) — yang melakukannya tanpa mengodekan ulang satu bingkai pun — lalu balik hasilnya.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang video Anda.

## Cara memverifikasi klaim privasi ini

- **Video Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Alat ini sama sekali tidak punya fitur jaringan: tidak ada alamat untuk ditempelkan, tidak ada yang diunduh, tidak ada mesin yang diambil saat pertama dipakai. Setiap byte yang menyentuh video Anda datang dari asal ini ketika halaman dimuat.
- **Pendekodean dan pengodean berjalan lokal.** Bingkainya melewati WebCodecs di peramban Anda sendiri, atau melewati mesin pemutar yang sama yang toh akan menampilkan klip itu kepada Anda. File yang sudah jadi dibangun di memori mesin ini dan diserahkan langsung ke unduhan.
- **Suaranya juga dibalik di sini.** Membalik sebuah jalur berarti mendekodenya, dan pendekodean itu milik peramban sendiri, berjalan di mesin ini. Tidak ada yang mendengarkannya, tidak ada yang menyimpannya, dan tidak ada yang bisa meneruskannya ke mana pun: tidak ada jalur kode di sini yang mengirim satu byte pun.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang video Anda: bukan file, bukan bingkai, bukan nama, ukuran, atau durasi. Setiap baris yang membaca, mendekode, membalik, atau mengodekan disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau video Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap bekerja. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/timeline.js` untuk aritmetika yang memutuskan bingkai mana keluar kapan, dan `src/reverse.js` untuk perulangan yang menelusuri file secara mundur satu kelompok bingkai sekali jalan. Tidak satu pun mengimpor sesuatu yang bisa membuat permintaan.
