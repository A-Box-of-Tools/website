# Pemangkas Video — pangkas video daring

Potong klip sampai tersisa bagian yang penting.

> Pangkas MP4, MOV, atau WebM ke bentuk apa pun - persegi, 9:16, atau kotak piksel yang persis. Berjalan di peramban Anda: tidak ada yang diunggah, suaranya tetap ada, jalan tanpa internet.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/pangkas-video/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## video Anda **tidak pernah diunggah**. Tidak ada server.

Setiap bingkai didekode, dipangkas, dan dikodekan oleh peramban Anda sendiri, di perangkat keras Anda sendiri. Tidak ada di sini yang bisa mengambil atau mengirim apa pun — alat ini sama sekali tidak punya fitur jaringan — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah video.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Suaranya tetap ada
- ✓ Jalan tanpa internet

## Cara memangkas video

1. **Pilih sebuah video.** Jatuhkan MP4, MOV, M4V, atau WebM ke pemilih file, atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Seret kotaknya ke bagian yang ingin Anda simpan.** Seret di dalamnya untuk memindahkan dan sudut mana pun untuk mengubah ukuran. Kunci dulu ke sebuah bentuk — 1:1 untuk unggahan persegi, 9:16 untuk ponsel, 16:9 untuk bingkai lebar — atau ketikkan kotak piksel yang persis ke empat kolom di bawahnya. Putar klipnya, atau seret penggeser di bawahnya, untuk memilih bingkai yang dijadikan acuan kotaknya.
3. **Pilih berapa banyak kualitas yang dibelanjakan.** Gambarnya harus dikodekan ulang, karena bingkai yang dipangkas adalah gambar yang berbeda. "Seimbang" menjaganya tetap dekat dengan apa yang sudah dibelanjakan file itu untuk area tersebut; "Kualitas terbaik" membelanjakan lebih. Suaranya tetap ada kecuali Anda mematikannya.
4. **Pangkas dan unduh.** Pekerjaannya terjadi di perangkat keras Anda sendiri, jadi lamanya tergantung mesin Anda, bukan pada antrean. Video yang sudah jadi diserahkan langsung ke unduhan peramban Anda.

## Versi lebih lengkap

[Cara memangkas video ke bentuk lain](https://abox.tools/id/panduan/pangkas-video/): Pangkas sebuah klip menjadi persegi, potret 9:16, atau kotak piksel yang tepat. Rasio mana yang diminta tiap lapak, kenapa pemangkasan harus mengodekan ulang padahal pemotongan tidak, dan berapa harganya.

## Juga ada di dalam kotak

- [Pembalik Video](https://abox.tools/id/putar-video-terbalik/): Bingkai terakhir lebih dulu, lengkap dengan suaranya.
- [Pembuat Time-Lapse](https://abox.tools/id/buat-video-time-lapse/): Rekaman satu jam, dalam dua puluh detik.
- [Pengambil Bingkai Video](https://abox.tools/id/ambil-bingkai-video/): Gambar diam berkualitas penuh dari titik mana pun.
- [Video ke GIF](https://abox.tools/id/video-ke-gif/): Pilih bagiannya, ukurannya, dan laju bingkainya.

## Pertanyaan

### Apakah video saya diunggah ke suatu tempat?

Tidak. Ia dibaca, didekode, dipangkas, dan dikodekan oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi internet dan tetap pangkas sebuah klip kalau Anda lebih suka memeriksa daripada diberi tahu.

### Format video apa saja yang bisa saya pangkas?

MP4, M4V, dan MOV dibaca langsung, apa pun isinya: H.264, HEVC, AV1, atau VP9, selama peramban Anda bisa mendekode kodek itu. Apa pun lain yang bisa diputar peramban Anda — yang paling jelas WebM — dipangkas dengan cara memutarnya dan merekam hasilnya, yang berhasil tapi memakan waktu selama klipnya. File yang tidak bisa dibaca maupun diputar peramban, yang dalam praktiknya berarti AVI, WMV, FLV, dan sebagian besar MKV, ditolak dengan pesan alih-alih gagal di tengah jalan.

### Adakah batas ukuran atau durasi videonya?

Tidak ada batas yang tertanam di alat ini, dan file tidak dibaca ke memori sekaligus — ia ditelusuri beberapa megabyte sekali jalan. Batas praktisnya adalah video yang sudah jadi, yang dirakit di memori sebelum Anda mengunduhnya, dan waktu yang dibutuhkan mesin Anda untuk mengodekannya.

### Apakah suaranya selamat?

Di jalur MP4, persis: audio disalin sampel demi sampel tanpa pernah didekode, jadi ia sama persis byte demi byte dengan yang ada di file. Di jalur perekaman, ia ditangkap dari pemutaran dan dikodekan ulang, yang memakan sedikit kualitas. Bagaimanapun ada kotak centang untuk meninggalkannya sama sekali.

### Apakah memangkas menurunkan kualitas?

Gambarnya dikodekan ulang, karena bingkai yang dipangkas adalah gambar yang berbeda dan tidak ada cara menyimpannya tanpa menulis pikselnya dari awal. Yang tidak akan dilakukan alat ini adalah membelanjakan lebih banyak daripada aslinya untuk area yang sama, karena mengodekan di atas itu hanya membuat file lebih besar tanpa membuatnya tampak lebih baik.

### Bisakah saya memotong durasinya juga?

Tidak di sini, tapi di sebelah. Alat ini mengubah bentuk gambar dan tidak lebih: klip yang keluar sama persis panjangnya dengan yang masuk, dengan waktu dan suaranya utuh. Memotong durasi adalah pekerjaan terpisah dan alat terpisah — [Pemotong Video](https://abox.tools/id/potong-video/) menandai bagian klip yang layak disimpan dan menyimpannya sebagai satu file, tanpa mengodekan ulang satu bingkai pun.

### Kenapa lebar dan tingginya bergerak dua-dua?

H.264, kodek di dalam MP4, menyimpan gambar dalam blok dan tidak punya cara menggambarkan bingkai dengan jumlah piksel ganjil di salah satu sisinya. Alih-alih diam-diam membulatkan pangkasan Anda setelah Anda menetapkannya, kotaknya sejak awal hanya menawarkan angka genap.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang video Anda.

## Cara memverifikasi klaim privasi ini

- **Video Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Alat ini sama sekali tidak punya fitur jaringan: tidak ada alamat untuk ditempelkan, tidak ada yang diunduh, tidak ada mesin yang diambil saat pertama dipakai. Setiap byte yang menyentuh video Anda datang dari asal ini ketika halaman dimuat.
- **Pendekodean dan pengodean berjalan lokal.** Bingkainya melewati WebCodecs di peramban Anda sendiri, atau melewati mesin pemutar yang sama yang toh akan menampilkan klip itu kepada Anda. File yang sudah jadi dibangun di memori mesin ini dan diserahkan langsung ke unduhan.
- **Suaranya disalin, bukan didengarkan.** Di jalur MP4, sampel audio dipindahkan menyeberang tanpa didekode sama sekali — tidak ada di sini yang pernah mengubahnya kembali menjadi suara, dan tidak ada yang bisa meneruskannya ke mana pun seandainya ada.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang video Anda: bukan file, bukan bingkai, bukan nama, ukuran, durasi, atau bentuk hasil pangkasan Anda. Setiap baris yang membaca, mendekode, memangkas, atau mengodekan disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau video Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap bekerja. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/shared/mp4-reader.js` untuk pembaca yang mencari bingkai di dalam MP4, dan `src/transcode.js` untuk perulangan yang mendekode, memangkas, dan mengodekannya. Tidak satu pun mengimpor sesuatu yang bisa membuat permintaan.
