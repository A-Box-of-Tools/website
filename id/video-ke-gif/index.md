# Video ke GIF — ubah video menjadi GIF

Pilih bagiannya, ukurannya, dan laju bingkainya.

> Ubah sebagian MP4, MOV, atau WebM menjadi GIF bergerak. Pilih bagiannya, lebarnya, dan laju bingkainya; bingkainya dibaca dan GIF-nya ditulis di peramban Anda. Tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/video-ke-gif/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## video Anda **tidak pernah diunggah**. Tidak ada server.

Setiap bingkai dibaca, diubah ukurannya, dikuantisasi, dan ditulis oleh peramban Anda sendiri, di perangkat keras Anda sendiri. Tidak ada di sini yang bisa mengambil atau mengirim apa pun — alat ini sama sekali tidak punya fitur jaringan — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah video.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Durasi berapa pun
- ✓ Jalan tanpa internet

## Cara mengubah video menjadi GIF

1. **Pilih sebuah video.** Jatuhkan MP4, MOV, M4V, atau WebM ke pemilih file, atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Tandai bagiannya.** Putar klipnya dan tekan `I` di tempat ia harus dimulai dan `O` di tempat ia harus berakhir, atau seret pegangan di batangnya. Sebuah GIF panjangnya beberapa detik — inilah setelan yang menentukan file-nya kecil atau raksasa, jauh lebih besar pengaruhnya daripada dua setelan lainnya.
3. **Pilih lebar dan laju bingkainya.** Lebar 480 piksel dan 12 bingkai per detik cocok untuk sebagian besar keperluan GIF. Melipatduakan pengurangan lebar membuat pikselnya tinggal seperempat; dua belas bingkai per detik sudah terbaca sebagai gerak tanpa membayar bingkai yang tidak dilihat siapa pun.
4. **Buat, dan unduh.** Bingkainya dibaca, satu palet berisi 256 warna dipilih untuk seluruh animasi, dan setiap bingkai ditulis hanya sebagai bagian gambar yang berubah. Ia diputar di halaman begitu selesai, dan itu file yang sama dengan yang diberikan unduhan kepada Anda.

## Versi lebih lengkap

[Cara mengubah video menjadi GIF](https://abox.tools/id/panduan/video-ke-gif/): Bagian mana, lebar berapa, dan frame rate mana yang dipilih, kenapa GIF dari sebuah video sepuluh kali ukuran videonya, dan kapan sebaiknya memakai GIF sama sekali.

## Juga ada di dalam kotak

- [Pembuat GIF](https://abox.tools/id/buat-gif/): Ubah sekumpulan gambar menjadi satu animasi.
- [Pemisah GIF](https://abox.tools/id/pisah-gif-ke-bingkai/): Setiap bingkai keluar sebagai PNG-nya sendiri.
- [Penganalisis GIF](https://abox.tools/id/analisis-gif/): Bingkai, jeda, palet, dan ke mana setiap byte pergi.
- [Gambar ke Video](https://abox.tools/id/gambar-ke-video/): Ubah satu folder gambar menjadi sebuah video.

## Pertanyaan

### Apakah video saya diunggah ke suatu tempat?

Tidak. Ia dibaca, diambil sampelnya, dan diubah oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi internet dan tetap buat sebuah GIF kalau Anda lebih suka memeriksa daripada diberi tahu.

### Format video apa saja yang bisa saya ubah?

MP4, M4V, dan MOV dibaca langsung, apa pun isinya: H.264, HEVC, AV1, atau VP9, selama peramban Anda bisa mendekode kodek itu. Apa pun lain yang bisa diputar peramban Anda — yang paling jelas WebM — dibaca dengan mencari posisi pemutar ke setiap saat, yang lebih lambat dan sedikit kurang persis soal bingkai mana mendarat di mana. File yang tidak bisa dibaca maupun diputar peramban, yang dalam praktiknya berarti AVI, WMV, FLV, dan sebagian besar MKV, ditolak dengan pesan alih-alih gagal di tengah jalan.

### Kenapa GIF saya begitu besar?

Karena GIF adalah format dari 1987 yang menyimpan gambar utuh, bukan gerak. Tidak ada cara membuat GIF dari klip lima detik yang sekecil MP4 lima detik asalnya — GIF dari sebuah video lazimnya sepuluh kali ukuran videonya. Tiga setelan yang benar-benar menentukannya adalah, berurutan: seberapa panjang bagiannya, seberapa lebar gambarnya, dan berapa bingkai per detik. Melipatduakan pengurangan lebar membuat pikselnya tinggal seperempat, dan piksellah yang memakan biaya.

### Kenapa hanya 256 warna?

Memang begitu formatnya: sebuah GIF membawa satu tabel berisi paling banyak 256 warna dan menyimpan setiap piksel sebagai angka ke dalamnya. Alat ini memilih 256 itu dengan menghitung warna di setiap bingkai bagian yang Anda tandai dan membaginya menjadi 256 kelompok — median cut, metode standarnya — jadi paletnya pas dengan klip Anda, bukan sekumpulan warna tetap. Di tempat sebuah warna tidak ada, titik-titik campur mengaduk dua warna terdekat sehingga gradasi tetap gradasi alih-alih menjadi garis-garis.

### Apa yang dilakukan setelan titik-titik campur?

Ia menukar sedikit derau dengan banyak pita warna. Kalau dinyalakan, langit yang tadinya akan menjadi empat pita datar tetap berupa gradasi, dengan biaya tekstur samar dan file yang lebih besar. Kalau dimatikan, gambarnya lebih rata dan file-nya lebih kecil, yang cocok untuk rekaman layar, seni garis, dan apa pun yang memang sudah terbuat dari warna datar. Titik-titik campur yang dipakai di sini adalah jenis teratur, bukan jenis penyebaran galat, jadi latar yang tidak berubah tetap diam sempurna di antara bingkai alih-alih berkilat-kilat.

### Adakah batas durasi atau ukurannya?

Yang dibatasi adalah bagiannya, dan oleh memori, bukan oleh aturan: setiap bingkainya ditahan sekaligus saat palet dipilih, jadi halaman ini menghitung berapa biaya setelan Anda dan mengatakannya sebelum Anda mulai. Ia menolak alih-alih membiarkan tab kehabisan memori dan lenyap. Bagian yang lebih pendek, lebar yang lebih kecil, atau laju bingkai yang lebih rendah, semuanya menurunkannya.

### Apakah suaranya ikut?

Sebuah GIF tidak bisa membawa suara. Tidak ada versi format ini yang punya audio, dan itulah alasan utama web sebagian besar mengganti GIF dengan video berulang tanpa suara. Kalau suaranya penting, simpan videonya — [Pemotong Video](https://abox.tools/id/potong-video/) akan memotong sebagian darinya tanpa mengodekan ulang satu bingkai pun.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang video Anda.

## Cara memverifikasi klaim privasi ini

- **Video Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Alat ini sama sekali tidak punya fitur jaringan: tidak ada alamat untuk ditempelkan, tidak ada yang diunduh, tidak ada mesin yang diambil saat pertama dipakai. Setiap byte yang menyentuh video Anda datang dari asal ini ketika halaman dimuat.
- **Pendekodean berjalan lokal.** Bingkainya melewati WebCodecs di peramban Anda sendiri, atau melewati mesin pemutar yang sama yang toh akan menampilkan klip itu kepada Anda. Yang mana yang dipakai tertulis di bagian atas halaman, karena itu mengubah cara bingkai dipilih dan Anda seharusnya bisa melihatnya.
- **GIF-nya ditulis di sini, dalam kode yang bisa Anda baca.** Palet, titik-titik campur, dan kompresi LZW-nya kira-kira enam ratus baris di dalam folder alat ini sendiri. Tidak ada layanan encoder, tidak ada pustaka yang diambil saat dijalankan, dan tidak ada tempat di dalamnya yang bisa mengirim sebuah gambar.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang video Anda: bukan file, bukan bingkai, bukan nama, ukuran, durasi, atau bagian yang Anda tandai. Setiap baris yang membaca, mengambil sampel, mengkuantisasi, atau mengodekan disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau video Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap bekerja. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/frames.js` untuk dua cara bingkai dibaca dari sebuah video, `src/quantize.js` untuk paletnya, dan `src/gif.js` untuk file-nya sendiri, LZW dan semuanya. Tidak satu pun mengimpor sesuatu yang bisa membuat permintaan.
