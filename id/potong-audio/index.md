# Pemotong Audio — potong audio daring

Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu file, dipotong di tempat yang Anda sebutkan.

> Putar sebuah rekaman dan tandai setiap bagian yang layak disimpan sambil berjalan, lalu simpan bagian-bagian itu sebagai satu file. Potongan persis pada sampel, tanpa bunyi klik di sambungannya, tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/potong-audio/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## rekaman Anda **tidak pernah diunggah**. Tidak ada server.

Rekaman Anda dibaca, ditandai, dipotong, dan ditulis oleh peramban Anda sendiri, di perangkat keras Anda sendiri. Tidak ada di sini yang bisa mengambil atau mengirim apa pun — alat ini sama sekali tidak punya fitur jaringan — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah rekaman.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Sebanyak apa pun bagiannya
- ✓ Memotong persis di tempat yang Anda tandai
- ✓ Jalan tanpa internet

## Cara memotong file audio

1. **Pilih sebuah rekaman.** Jatuhkan file MP3, WAV, FLAC, M4A, Ogg, atau Opus ke pemilih file — atau sebuah video, kalau yang Anda mau adalah sepotong suaranya. Peramban membacanya langsung dari disk Anda dan menggambarnya sebagai bentuk gelombang; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Putar, dan tandai bagian yang Anda mau.** Tekan `I` di tempat sebuah bagian harus dimulai dan `O` di tempat ia harus berakhir. Lakukan sebanyak yang Anda mau — setiap pasangan menjadi satu baris di tabel di bawahnya, dan satu pita di bentuk gelombangnya. `U` menarik kembali yang terakhir, `Space` memutar dan menjeda, tombol panah melompat lima detik, dan menahan `Shift` bersamanya menggeser sepuluh milidetik. Perlambat pemutarannya kalau momennya sulit ditangkap.
3. **Rapikan penandanya.** Setiap baris bisa diputar sendiri, diatur ulang waktunya dengan mengetikkan waktu yang persis, dipindahkan naik atau turun urutannya, atau dihapus. Kedua ujung bagian yang terpilih juga bisa diseret di sepanjang bentuk gelombangnya, dan itu cara tercepat menempatkan penanda pada keheningan alih-alih pada tarikan napas sebelumnya. Total di bagian atas adalah durasi rekaman yang sudah jadi nanti.
4. **Simpan bagian itu, atau buang.** Menyimpan adalah cara yang biasa: rekaman yang sudah jadi adalah bagian yang Anda tandai, digabungkan berurutan. Membuangnya adalah pekerjaan lain yang diinginkan orang dan jarang ditemukan — tandai "eee"-nya, telepon yang berdering, atau awal yang gagal, dan sisanya digabungkan tanpa itu semua.
5. **Potong, dan unduh.** Setiap potongan mendarat pada sampel yang Anda tandai; tidak ada pembulatan ke bingkai kunci di sini, karena suara tidak punya bingkai kunci. Satu-satunya yang layak dipilih adalah seberapa banyak peredupan yang dipasang di setiap sambungan — lima milidetik cukup untuk menghentikan bunyi klik dan jauh terlalu pendek untuk terdengar sebagai peredupan. Yang keluar adalah sebuah WAV, diputar dulu di halaman ini, lalu diserahkan langsung ke unduhan peramban Anda.

## Versi lebih lengkap

[Cara memotong audio tanpa kehilangan kualitas](https://abox.tools/id/panduan/potong-file-audio/): Di mana sebenarnya sebuah potongan audio mendarat, kenapa ia bisa tepat padahal potongan video tidak, kenapa sebuah sambungan kadang berdetak, dan apa sebenarnya yang dilakukan lesapan lima milidetik.

## Juga ada di dalam kotak

- [Penyunting Audio](https://abox.tools/id/sunting-audio/): Putar terbalik, ubah kecepatannya, angkat rekaman yang pelan — semuanya di sini, di mesin Anda.
- [Penggabung dan Pemisah PDF](https://abox.tools/id/gabung-pdf/): Halaman dipindah-pindah tanpa perjalanan bolak-balik ke server.
- [Kompresor PDF](https://abox.tools/id/kompres-pdf/): Perkecil sebuah dokumen tanpa mengirimnya ke mana pun.
- [Penyensor PDF](https://abox.tools/id/sensor-pdf/): Hurufnya dihapus dari file-nya, dan file-nya dicari sesudahnya untuk membuktikannya.

## Pertanyaan

### Apakah audio saya diunggah ke suatu tempat?

Tidak. Ia dibaca, ditandai, dipotong, dan ditulis oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi internet dan tetap potong sebuah rekaman kalau Anda lebih suka memeriksa daripada diberi tahu.

### Bisakah saya menyimpan beberapa bagian dari rekaman yang sama?

Justru untuk itulah alat ini. Tekan `I` dan `O` sebanyak yang Anda mau sambil diputar; setiap pasangan menjadi satu baris, dan file yang sudah jadi adalah semua baris digabungkan berurutan dengan segala yang lain hilang. Kebanyakan pemotong daring memberi Anda satu pasang pegangan dan bertanya rentang tunggal mana yang disimpan, yang cukup untuk merapikan awal dan akhir sebuah jingle dan sama sekali tidak berguna untuk mendengarkan wawancara satu jam sekali lalu menyimpan enam jawaban yang layak.

### Apakah potongannya mendarat persis di tempat yang saya tandai?

Ya, pada setiap bagian, di setiap pemutar. Inilah satu tempat di mana audio lebih sederhana daripada video: rekaman yang sudah didekode adalah deretan angka dan masing-masing berdiri sendiri, jadi tidak ada padanan bingkai kunci untuk dibulatkan dan tidak ada alasan sebuah potongan mulai lebih awal. Halaman ini menampilkan nomor sampel tempat hasilnya dimulai, yaitu penanda yang Anda buat dikalikan laju sampel dan dibulatkan ke sampel utuh terdekat.

### Kenapa sebuah sambungan bisa berbunyi klik, dan untuk apa peredupannya?

Karena memotong dari tengah satu kata ke tengah kata lain menempatkan dua bentuk gelombang yang tidak berhubungan berdampingan, dan pengeras suara yang diminta melompat di antara keduanya menghasilkan bunyi klik. Itu bukan kesalahan potongannya — begitulah bunyi sebuah ketidak- sinambungan. Perbaikannya adalah peredupan beberapa milidetik di kedua sisi setiap sambungan: cukup panjang bagi konusnya untuk sampai, jauh terlalu pendek untuk terdengar sebagai peredupan. Lima milidetik adalah bawaannya dan bisa dimatikan. Peredupan hanya dipasang pada tepi yang memang sebuah potongan, jadi tepi di paling awal atau paling akhir rekaman dibiarkan persis seperti adanya.

### Bisakah saya membuang bagian yang jeleknya saja?

Bisa. Tandai bagian itu, lalu pilih "Buang yang ditandai": semua yang *tidak* Anda tandai yang digabungkan, berurutan. Daftar penanda yang sama menjawab kedua pertanyaan, jadi Anda bisa berpindah di antara keduanya dan melihat durasinya berubah tanpa menandai apa pun dua kali.

### Bisakah saya menyimpan penanda saya dan kembali lagi nanti?

Bisa. "Simpan penanda" menulis sebuah file teks biasa — satu baris satu bagian, awal dan akhir dipisahkan koma — dan "Muat penanda" membacanya kembali. Dua format ditawarkan, detik biasa dan `HH:MM:SS.mmm`, dan keduanya adalah tata letak yang ditulis pemotong video di situs ini, jadi file yang dibuat terhadap videonya bisa dijatuhkan ke audionya dan sebaliknya. Menandai adalah pekerjaan yang butuh ketelitian dan tidak ada yang seharusnya melakukannya dua kali.

### Format apa saja yang bisa saya buka?

Apa pun yang bisa didekode peramban Anda, yang dalam praktiknya berarti MP3, WAV, FLAC, M4A dan AAC, Ogg Vorbis dan Opus, serta audio di dalam video MP4, M4V, MOV, dan WebM. Yang tertinggal adalah daftar pendek yang sama seperti di tempat lain: AVI, WMA, dan sebagian besar MKV. File yang tidak mau dibaca peramban ini ditolak dengan pesan, alih-alih gagal di tengah jalan.

### Kenapa ia menyimpan WAV alih-alih MP3?

Karena tidak ada peramban yang menyertakan encoder MP3, dan alat ini menolak mengirim rekaman Anda ke server yang punya. Sebuah WAV sama sekali tidak butuh encoder — ia adalah sampel dengan header pendek di depannya — jadi ia sekaligus pilihan yang jujur dan satu-satunya yang tidak mungkin memakan kualitas saat keluar. Ukurannya lebih besar: sekitar sepuluh megabyte per menit dalam stereo. Setiap pemutar, ponsel, dan penyunting bisa membukanya, dan apa pun yang mau MP3 bisa membuatnya dari situ. Memotong MP3 dengan menyalin bingkainya justru akan menjaga file tetap kecil, tapi juga akan memindahkan setiap potongan ke batas bingkai terdekat, dan pembulatan itulah yang justru tidak ingin dilakukan alat ini.

### Adakah batas durasi rekamannya?

Tidak ada batas yang tertanam di alat ini. Batas praktisnya adalah memori: seluruh rekaman didekode ke halaman ini sekaligus, dan sebuah WAV dirakit di memori sebelum Anda mengunduhnya, jadi satu jam stereo membutuhkan ruang kerja sedikit di bawah satu gigabyte. WAV empat gigabyte ditolak mentah-mentah, karena kolom ukuran milik formatnya sendiri tidak bisa menggambarkannya.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang rekaman Anda.

## Cara memverifikasi klaim privasi ini

- **Rekaman Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Alat ini sama sekali tidak punya fitur jaringan: tidak ada alamat untuk ditempelkan, tidak ada yang diunduh, tidak ada mesin yang diambil saat pertama dipakai. Setiap byte yang menyentuh audio Anda datang dari asal ini ketika halaman dimuat.
- **Dekodernya adalah yang sudah ada di peramban Anda.** File diserahkan ke `decodeAudioData`, kode yang sama yang memutar sebuah lagu di elemen `<audio>`. Tidak ada yang dikirim ke sini untuk membaca format Anda, dan tidak ada yang diminta dari apa pun di luar halaman ini untuk membacanya.
- **Gambar sebuah video tidak pernah didekode sama sekali.** Ketika Anda menjatuhkan sebuah video, hanya jalur audionya yang diminta. Bingkainya tidak dibaca, tidak didekode, tidak digambar, dan tidak dilihat — tidak ada kode di halaman ini yang bisa, dan file yang keluar memuat suara dan tidak lebih.
- **Potongannya adalah penyalinan, di memori, di mesin ini.** Memotong adalah satu `set` per bagian per kanal: sampel yang Anda simpan dipindahkan ke larik baru dalam urutan yang Anda tetapkan. Satu-satunya sampel yang dikalikan sesuatu adalah beberapa ratus di dalam setiap peredupan, dan halaman ini mengatakan berapa banyak sebelum Anda menekan tombolnya.
- **Sampelnya dituliskan, bukan dikodekan lagi.** Sebuah WAV adalah sampel yang dimuat halaman ini dengan header di depannya. Tidak ada encoder dalam perulangannya yang mengambil keputusan tentang rekaman Anda, dan tidak ada yang bisa disebut unggahan untuk membuat hal itu terjadi.
- **File penanda dibuat di dalam halaman.** Menyimpan penanda Anda menulis sebuah file teks dari angka-angka yang sudah ada di layar, langsung ke unduhan Anda. Memuatnya membacanya di sini. Tidak satu pun mendekati jaringan, dan tidak satu pun membawa apa pun selain waktu.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang rekaman Anda: bukan file, bukan sampel, bukan nama, ukuran, durasi, atau di mana Anda memotongnya. Setiap baris yang membaca, memotong, dan menulis disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau rekaman Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap bekerja. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/segments.js` untuk penanda dan file tempat menyimpannya, `src/shared/audio-decode.js` untuk dua puluh baris yang menyerahkan file Anda ke dekoder milik peramban sendiri, `src/trim.js` untuk aritmetika yang mengubah sebuah penanda menjadi deretan sampel beserta perulangan yang menyalinnya, dan `src/shared/wav.js` untuk header yang dipasang di depannya. Tidak satu pun mengimpor sesuatu yang bisa membuat permintaan.
