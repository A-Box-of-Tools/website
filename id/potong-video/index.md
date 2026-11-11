# Pemotong Video — potong video daring

Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu video.

> Tonton sebuah video dan tandai setiap bagian yang layak disimpan sambil diputar, lalu simpan bagian-bagian itu sebagai satu file. Berjalan di peramban Anda: tidak ada yang diunggah, tidak ada yang dikodekan ulang, jalan tanpa internet.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/potong-video/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## video Anda **tidak pernah diunggah**. Tidak ada server.

Video Anda dibaca, ditandai, dipotong, dan ditulis oleh peramban Anda sendiri, di perangkat keras Anda sendiri. Tidak ada di sini yang bisa mengambil atau mengirim apa pun — alat ini sama sekali tidak punya fitur jaringan — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah video.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Sebanyak apa pun bagiannya
- ✓ Tanpa kehilangan kualitas
- ✓ Jalan tanpa internet

## Cara memotong video

1. **Pilih sebuah video.** Jatuhkan MP4, MOV, M4V, atau WebM ke pemilih file. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya. Jatuhkan beberapa dan mereka digabungkan, dalam urutan yang Anda masukkan.
2. **Putar, dan tandai bagian yang Anda mau.** Tekan `I` di tempat sebuah bagian harus dimulai dan `O` di tempat ia harus berakhir. Lakukan sebanyak yang Anda mau — setiap pasangan menjadi satu baris di tabel di bawahnya, dan satu pita di lini masa. `U` menarik kembali yang terakhir, `Space` memutar dan menjeda, dan tombol panah melompat lima detik sekali tekan. Perlambat pemutarannya kalau momennya sulit ditangkap.
3. **Rapikan penandanya.** Setiap baris bisa diputar sendiri, diatur ulang waktunya dengan mengetikkan waktu yang persis, dipindahkan naik atau turun urutannya, atau dihapus. Kedua ujung bagian yang terpilih juga bisa diseret di sepanjang lini masa. Total di bagian atas adalah durasi video yang sudah jadi nanti.
4. **Simpan bagian itu, atau buang.** Menyimpan adalah cara yang biasa: video yang sudah jadi adalah bagian yang Anda tandai, digabungkan berurutan. Membuangnya adalah pekerjaan lain yang diinginkan orang dan jarang ditemukan — tandai iklannya, keheningannya, atau awal yang gagal, dan sisanya digabungkan tanpa itu semua.
5. **Potong, dan unduh.** "Simpan setiap byte" memindahkan bingkai tanpa disentuh: cepat, dan tidak mungkin memakan kualitas, tapi setiap bagian dimulai pada bingkai kunci sebelum penanda Anda. "Potong tepat di sini" mendekode dan menulis gambarnya lagi sehingga setiap bagian mulai pada bingkai yang Anda pilih. Halaman ini mengatakan mana yang akan Anda dapat, dan apa biayanya, sebelum Anda menekan tombolnya.

## Versi lebih lengkap

[Cara memotong video tanpa mengodekannya ulang](https://abox.tools/id/panduan/potong-video/): Memotong sebuah klip tidak perlu kehilangan satu byte pun kualitas. Kenapa sebuah potongan kadang mendarat lebih awal daripada tanda Anda, apa hubungan keyframe dengan itu, dan kapan sebaiknya menerima pengodean ulang.

## Juga ada di dalam kotak

- [Pemangkas Video](https://abox.tools/id/pangkas-video/): Potong klip sampai tersisa bagian yang penting.
- [Pembalik Video](https://abox.tools/id/putar-video-terbalik/): Bingkai terakhir lebih dulu, lengkap dengan suaranya.
- [Pembuat Time-Lapse](https://abox.tools/id/buat-video-time-lapse/): Rekaman satu jam, dalam dua puluh detik.
- [Pengambil Bingkai Video](https://abox.tools/id/ambil-bingkai-video/): Gambar diam berkualitas penuh dari titik mana pun.

## Pertanyaan

### Apakah video saya diunggah ke suatu tempat?

Tidak. Ia dibaca, ditandai, dipotong, dan ditulis oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi internet dan tetap potong sebuah video kalau Anda lebih suka memeriksa daripada diberi tahu.

### Bisakah saya menyimpan beberapa bagian dari video yang sama?

Justru untuk itulah alat ini. Tekan `I` dan `O` sebanyak yang Anda mau sambil diputar; setiap pasangan menjadi satu baris, dan video yang sudah jadi adalah semua baris digabungkan berurutan dengan segala yang lain hilang. Kebanyakan pemotong daring memberi Anda satu pasang pegangan dan bertanya rentang tunggal mana yang disimpan, yang cukup untuk merapikan awal dan akhir sebuah klip dan sama sekali tidak berguna untuk menonton rekaman satu jam sekali lalu menyimpan enam momen yang layak.

### Apakah memotong menurunkan kualitas?

Tidak di jalur biasa, dan tidak dengan cara yang penting. Memotong tidak mengubah tampilan bingkai mana pun, jadi bingkainya dipindahkan ke file baru persis seperti adanya: byte yang sama, setelan encoder yang sama, semuanya sama. Satu-satunya jalur di sini yang mengodekan ulang sesuatu adalah pemotongan yang persis, dan itu tertulis di tombolnya.

### Kenapa sebuah bagian mulai lebih awal daripada yang saya tandai?

Karena cara video disimpan, dan hanya pada pemutar yang mengabaikan bagian standar dari formatnya. Kebanyakan bingkai disimpan sebagai deskripsi perbedaannya dari tetangganya, jadi tidak bisa didekode tanpanya; hanya bingkai kunci yang berdiri sendiri, dan bingkai kunci biasanya berjarak satu sampai sepuluh detik. Karena itu pemotongan yang menyalin bingkai harus membawa deretan dari bingkai kunci di depan penanda Anda — dan file itu berkata *mulai putar pada penanda Anda*, yang dipatuhi setiap pemutar arus utama. Kalau Anda butuh persis di semua pemutar, pilih "Potong tepat di sini", yang mengodekan ulang. Halaman ini memberi tahu Anda ada di kasus yang mana, dan selisihnya berapa, sebelum Anda mengekspor.

### Bisakah saya memotong iklannya saja?

Bisa. Tandai iklannya, lalu pilih "Buang yang ditandai": semua yang *tidak* Anda tandai yang digabungkan, berurutan. Daftar penanda yang sama menjawab kedua pertanyaan, jadi Anda bisa berpindah di antara keduanya dan melihat durasinya berubah tanpa menandai apa pun dua kali.

### Bisakah saya menyimpan penanda saya dan kembali lagi nanti?

Bisa. "Simpan penanda" menulis sebuah file teks biasa — satu baris satu bagian, awal dan akhir dipisahkan koma — dan "Muat penanda" membacanya kembali. Dua format ditawarkan, detik biasa dan `HH:MM:SS.mmm`, dan keduanya mengikuti tata letak yang sudah dipakai alat lain yang bekerja begini, jadi file yang ditulis di sini bisa diserahkan ke salah satunya dan file yang ditulis di sana bisa dijatuhkan ke halaman ini. Menandai adalah pekerjaan yang butuh ketelitian dan tidak ada yang seharusnya melakukannya dua kali.

### Format video apa saja yang bisa saya potong?

MP4, M4V, dan MOV dibaca langsung, apa pun isinya: H.264, HEVC, AV1, atau VP9. Menyalin bingkai tidak melibatkan pendekodean, jadi jalur ini berhasil bahkan untuk kodek yang sama sekali tidak punya dekoder di peramban Anda. Apa pun lain yang bisa diputar peramban Anda — yang paling jelas WebM — dipotong dengan memutarnya dan merekam hasilnya, yang berhasil, memakan waktu selama hasilnya, dan hanya bisa menyimpan satu bagian. File yang tidak bisa dibaca maupun diputar peramban, yang dalam praktiknya berarti AVI, WMV, FLV, dan sebagian besar MKV, ditolak dengan pesan alih-alih gagal di tengah jalan.

### Adakah batas ukuran atau durasi videonya?

Tidak ada batas yang tertanam di alat ini, dan di jalur penyalinan file nyaris tidak dibaca sama sekali: bingkai yang Anda simpan ditunjuk, bukan dimuat, jadi menyimpan empat menit dari rekaman empat gigabyte kira-kira sama biayanya dengan menulis empat menit itu ke disk. Pemotongan yang persis menelusuri file beberapa megabyte sekali jalan. Bagaimanapun, batas praktisnya adalah file yang sudah jadi, yang dirakit di memori sebelum Anda mengunduhnya.

### Apakah suaranya selamat?

Di kedua jalur MP4 ia disalin sampel demi sampel tanpa pernah didekode, jadi ia sama persis byte demi byte dengan yang ada di file, dan sebuah penanda suntingan menjaga setiap bagian sejajar dengan gambarnya dalam seperseribu detik. Satu pengecualian adalah menggabungkan video terpisah yang suaranya dijelaskan berbeda — laju sampel yang berbeda, misalnya — di mana tidak ada cara memasukkan keduanya ke satu jalur tanpa mendekodenya, dan halaman ini mengatakannya sebelum melakukannya. Di jalur perekaman, ia ditangkap dari pemutaran dan dikodekan ulang. Bagaimanapun ada kotak centang untuk meninggalkannya sama sekali.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang video Anda.

## Cara memverifikasi klaim privasi ini

- **Video Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Alat ini sama sekali tidak punya fitur jaringan: tidak ada alamat untuk ditempelkan, tidak ada yang diunduh, tidak ada mesin yang diambil saat pertama dipakai. Setiap byte yang menyentuh video Anda datang dari asal ini ketika halaman dimuat.
- **Di jalur biasa, tidak ada yang bahkan didekode.** Memotong tidak mengubah tampilan bingkai mana pun, jadi bingkai terkode dari bagian yang Anda tandai dipindahkan ke file baru persis seperti ditemukan. Masing-masing disimpan sebagai potongan file di disk Anda — catatan tentang byte yang mana, bukan byte-nya sendiri — dan peramban Anda membacanya untuk pertama kali saat menulis unduhan. Tidak ada di sini yang pernah mengubah video Anda kembali menjadi gambar.
- **File penanda dibuat di dalam halaman.** Menyimpan penanda Anda menulis sebuah file teks dari angka-angka yang sudah ada di layar, langsung ke unduhan Anda. Memuatnya membacanya di sini. Tidak satu pun mendekati jaringan, dan tidak satu pun membawa apa pun selain waktu.
- **Suaranya disalin, bukan didengarkan.** Di kedua jalur MP4, sampel audio dipindahkan menyeberang tanpa didekode sama sekali — tidak ada di sini yang pernah mengubahnya kembali menjadi suara, dan tidak ada yang bisa meneruskannya ke mana pun seandainya ada.
- **Kalaupun bingkai didekode, itu terjadi di sini.** Pemotongan yang persis, dan pratinjau untuk file yang tidak mau diputar peramban ini, melewati WebCodecs di mesin Anda sendiri. Itu dekoder yang sama yang toh akan menampilkan video itu kepada Anda, berjalan di tempat yang sama.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang video Anda: bukan file, bukan bingkai, bukan nama, ukuran, durasi, atau di mana Anda memotongnya. Setiap baris yang membaca, memotong, dan menulis disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau video Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap bekerja. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/segments.js` untuk penanda dan file tempat menyimpannya, `src/shared/mp4-reader.js` untuk pembaca yang mencari bingkai di dalam MP4, `src/ranges.js` untuk aritmetika yang mengubah sebuah penanda menjadi deretan sampel, dan `src/copy.js` untuk perulangan yang memindahkan sampel itu ke file baru. Tidak satu pun mengimpor sesuatu yang bisa membuat permintaan.
