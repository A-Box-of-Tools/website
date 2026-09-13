# Gambar ke Video — buat slide MP4

Ubah satu folder gambar menjadi sebuah video.

> Ubah gambar JPG, PNG, atau WebP menjadi video slide MP4, gratis dan sepenuhnya di peramban Anda. Tidak ada yang diunggah, tanpa pendaftaran, dan jalan tanpa internet.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/gambar-ke-video/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## gambar Anda **tidak pernah diunggah**. Tidak ada server.

Setiap bingkai dikodekan oleh peramban Anda sendiri dan videonya dibangun di memori mesin ini. Encoder-nya tidak pernah menyentuh jaringan, dan tidak ada server di ujung lain halaman ini untuk menerima sebuah gambar bahkan seandainya ia menyentuhnya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ File tetap di perangkat Anda

## Cara mengubah gambar menjadi video

1. **Pilih gambar Anda.** Jatuhkan sebuah folder ke pemilih file, atau pilih file-nya sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Urutkan dan atur berapa lama masing-masing ditahan.** Seret untuk mengurutkan ulang. Waktu tahan bisa diberikan dalam bingkai atau dalam detik, untuk semua gambar sekaligus atau satu gambar sekali jalan.
3. **Pilih resolusi dan laju bingkai.** "Ikuti resolusi tertinggi" mengikuti gambar terbesar Anda; pilihan siap pakainya mencakup 4K, 1080p, 720p, persegi, dan tegak, dan ada ukuran sesuai keinginan kalau tidak ada yang cocok.
4. **Buat videonya dan unduh.** Pengodean berjalan di perangkat keras Anda sendiri, jadi lamanya tergantung mesin Anda, bukan pada antrean. MP4 yang sudah jadi diserahkan langsung ke unduhan peramban Anda.

## Versi lebih lengkap

[Cara mengubah satu folder gambar menjadi video](https://abox.tools/id/panduan/gambar-ke-video/): Buat tayangan slide MP4 dari foto: apa yang sebenarnya dikendalikan frame rate dan durasi, bagaimana menangani gambar yang bentuknya tidak pas, dan kenapa hasilnya tidak bersuara.

## Juga ada di dalam kotak

- [Pemotong Video](https://abox.tools/id/potong-video/): Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu video.
- [Pemangkas Video](https://abox.tools/id/pangkas-video/): Potong klip sampai tersisa bagian yang penting.
- [Pembalik Video](https://abox.tools/id/putar-video-terbalik/): Bingkai terakhir lebih dulu, lengkap dengan suaranya.
- [Pembuat Time-Lapse](https://abox.tools/id/buat-video-time-lapse/): Rekaman satu jam, dalam dua puluh detik.

## Pertanyaan

### Apakah gambar saya diunggah ke suatu tempat?

Tidak. Gambar Anda dibaca, disusun, dan dikodekan oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Satu-satunya pengecualian adalah fitur opsional "tambah dari alamat web", yang mengambil gambar yang Anda tempelkan, dan server itu melihat alamat IP Anda.

### Format gambar apa saja yang bisa saya pakai?

Format gambar diam apa pun yang bisa didekode peramban Anda, yang dalam praktiknya berarti JPG, PNG, WebP, GIF, AVIF, dan di perangkat Apple, HEIC. Tidak ada daftar terpisah yang harus dijaga tetap mutakhir di sini, karena pendekodean adalah tugas peramban, bukan tugas kami.

### Format video apa yang dihasilkannya?

MP4 dengan video H.264, yang bisa diputar di hampir apa pun. Di peramban tanpa WebCodecs, alat ini kembali ke perekaman WebM — rekaman yang sama dalam wadah yang diterima lebih sedikit penyunting.

### Bisakah saya memakai ini untuk urutan render Blender atau After Effects?

Bisa — urutan render bernomor justru itulah gunanya alat ini. Tambahkan bingkai yang ditulis perender Anda, biarkan waktu tahannya satu bingkai masing-masing, dan atur laju bingkainya agar cocok dengan render-nya. "Urutkan berdasarkan nama" menghitung seperti yang Anda harapkan, jadi `frame_2` mendarat sebelum `frame_10`, bukan sesudahnya. \
\
Satu hal yang perlu diketahui sebelum mulai: H.264 tidak punya kanal alfa, jadi transparansi diratakan ke warna latar alih-alih dibawa serta. Kalau Anda perlu menjaga alfanya, susun bingkainya di penyunting Anda saja.

### Bisakah saya membuat time-lapse dari foto?

Bisa, dan itu pekerjaan yang sama dengan urutan render: tahan setiap foto selama satu bingkai dan pilih laju bingkainya. Pada 30 fps setiap tiga puluh foto menjadi satu detik video; pada 12 fps foto yang sama itu berjalan dua setengah detik. \
\
"Urutkan berdasarkan tanggal" mengembalikan isi kamera ke urutan pengambilannya, yang penting kalau nama file-nya sudah mulai lagi dari 0001. Foto dengan ukuran berbeda tidak masalah — "Ikuti resolusi tertinggi" menetapkan ukuran video sehingga tidak ada satu pun yang diperkecil.

### Adakah batas berapa banyak gambar, atau berapa panjang videonya?

Tidak ada batas yang tertanam di alat ini. Batas praktisnya adalah memori mesin Anda sendiri, karena video yang sudah jadi dirakit di sana sebelum Anda mengunduhnya. Slide 4K yang sangat besar adalah yang pertama merasakannya.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, dan tidak ada masa uji coba. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang gambar Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim gambar Anda ke tempat lain untuk diproses akan berhenti begitu Anda mencabut koneksi.

### Bisakah saya menambahkan musik atau lagu latar?

Belum. Alat ini hanya menghasilkan video: MP4 yang ditulisnya punya satu jalur video dan tidak punya jalur audio. Tambahkan lagu latar sesudahnya di penyunting video kalau Anda membutuhkannya.

## Cara memverifikasi klaim privasi ini

- **Gambar Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada. Dulu ini tertulis `connect-src 'none'`, yang mutlak; memasang iklan memakan itu, dan mengatakannya adalah bagian dari kesepakatan.
- **Pengodean berjalan lokal.** WebCodecs berjalan di peramban Anda dan file yang sudah jadi diserahkan langsung ke unduhan. Aplikasi ini tidak punya sisi server.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang gambar Anda: bukan file, bukan gambar mini, bukan nama, ukuran, atau jumlah. Setiap baris yang membaca, mendekode, menyusun, atau mengodekan sebuah gambar disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau gambar Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju adalah situs milik orang lain.
- **Satu pengecualian yang disengaja.** Kalau Anda memakai "Tambah dari alamat web", server itu dihubungi untuk mengambil gambarnya dan akan melihat alamat IP Anda. Hanya gambar yang Anda tempelkan yang pernah diambil, dan hanya masuk: `img-src` dibuka, `connect-src` tidak. Penghitung di bawah mencantumkan setiap asal luar yang dihubungi.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semuanya kecuali pemuatan lewat alamat web tetap berfungsi. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, dan `src/encoder.js` untuk perulangan pengodean yang tidak pernah menyentuh jaringan.
