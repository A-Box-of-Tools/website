# Pemisah GIF — setiap bingkai jadi PNG sendiri

Setiap bingkai keluar sebagai PNG-nya sendiri.

> Pisahkan GIF bergerak menjadi bingkai-bingkainya dan simpan masing-masing sebagai PNG, gratis dan sepenuhnya di peramban Anda. Menjaga transparansi dan waktunya. Tidak ada yang diunggah, dan jalan tanpa internet.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/pisah-gif-ke-bingkai/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## GIF Anda **tidak pernah diunggah**. Tidak ada server.

GIF-nya dibaca, didekompresi, dan digambar oleh peramban Anda sendiri, dan setiap PNG dikodekan di memori mesin ini. Tidak ada server di ujung lain halaman ini untuk menerima sebuah animasi, bahkan seandainya ada sesuatu di sini yang menginginkannya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ File tetap di perangkat Anda

## Cara memisahkan GIF menjadi bingkai

1. **Pilih GIF-nya.** Jatuhkan ke pemilih file, atau pilih sendiri. Peramban membacanya langsung dari disk Anda, dan halaman ini memberi tahu apa yang ditemukannya: ukurannya, jumlah bingkainya, berapa lama ia diputar, dan berapa kali ia berulang.
2. **Putuskan isi setiap PNG.** **Bingkai seperti tampilannya** adalah yang diinginkan hampir semua orang: gambar utuh pada momen itu dalam animasi. **Hanya piksel yang disimpan bingkai itu** adalah tambalan yang sebenarnya dibawa file, pada ukurannya sendiri dan di tempatnya sendiri, yang merupakan cara GIF tetap kecil dan bukan tampilan animasinya.
3. **Putuskan apa yang terjadi pada transparansinya.** PNG menjaganya, dan itu bawaan yang jujur. Isi dengan sebuah warna kalau bingkainya akan pergi ke tempat yang mengabaikan transparansi dan akan mengubahnya menjadi hitam.
4. **Pilih bingkai yang Anda mau.** Semuanya secara bawaan. "Simpan setiap bingkai kedua" menipiskan rekaman yang panjang, dan kotak centang di kisinya menimpanya — penomorannya tidak pernah berubah, jadi bingkai 42 tetap disebut bingkai 42 sesedikit apa pun tetangganya yang Anda simpan.
5. **Unduh.** Satu bingkai sekali jalan dari kisinya, atau semuanya sebagai satu ZIP sehingga ada satu permintaan simpan alih-alih ratusan. ZIP-nya bisa membawa `frames.txt` yang mencantumkan berapa lama setiap bingkai ditahan, yang merupakan satu hal yang tidak bisa dikatakan sendiri oleh sebuah folder berisi PNG.

## Versi lebih lengkap

[Cara memisah GIF menjadi bingkai](https://abox.tools/id/panduan/pisah-gif-ke-bingkai/): Dapatkan setiap bingkai sebuah GIF animasi sebagai PNG: kenapa sebagian bingkai hanya berupa tambalan kecil dari gambarnya, apa yang terjadi pada transparansinya, dan bagaimana menyimpan pewaktuannya supaya Anda bisa menyusunnya kembali.

## Juga ada di dalam kotak

- [Penganalisis GIF](https://abox.tools/id/analisis-gif/): Bingkai, jeda, palet, dan ke mana setiap byte pergi.
- [Gambar ke Video](https://abox.tools/id/gambar-ke-video/): Ubah satu folder gambar menjadi sebuah video.
- [Pemotong Video](https://abox.tools/id/potong-video/): Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu video.
- [Pemangkas Video](https://abox.tools/id/pangkas-video/): Potong klip sampai tersisa bagian yang penting.

## Pertanyaan

### Apakah GIF saya diunggah ke suatu tempat?

Tidak. File dibaca, didekompresi, dan digambar oleh peramban Anda sendiri di perangkat keras Anda sendiri, dan setiap PNG dikodekan di sini di memori. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi jaringan dan ia tetap memisahkan GIF.

### Kenapa satu bingkai tampak seperti potongan kecil dari gambarnya?

Karena memang itu isi file-nya. Sebuah GIF adalah gambar pertama diikuti tambalan-tambalan: setiap bingkai berikutnya hanya menyimpan persegi panjang yang berubah, dan segala yang lain di layar adalah apa yang ditinggalkan bingkai sebelumnya di sana. Kepala orang yang berbicara di depan dinding diam karena itu menyimpan satu wajah per bingkai, bukan satu gambar per bingkai, dan itulah seluruh alasan format ini tidak raksasa. \
\
Anda melihatnya karena "Hanya piksel yang disimpan bingkai itu" sedang dipilih. Beralihlah ke "Bingkai seperti tampilannya" dan setiap PNG menjadi gambar utuh sebagaimana animasinya tampak pada momen itu.

### Apakah transparansinya terjaga?

Ya. Transparansi GIF hanya satu bit — sebuah piksel entah dicat entah tidak terlihat, tanpa apa pun di antaranya — dan PNG menyimpan persis itu, jadi bingkainya keluar dengan area transparannya utuh. Kalau Anda lebih suka latar padat, atur "Area transparan" untuk diisi dengan sebuah warna; itu ditulis ke dalam PNG dan tidak bisa dibatalkan sesudahnya.

### Kenapa jeda bingkainya bukan angka yang saya harapkan?

Sebuah GIF menyimpan setiap jeda dalam perseratus detik, dan peramban sudah membatasi apa pun di bawah dua perseratus menjadi sepersepuluh detik sejak 1990-an — aturan yang ditulis untuk bola dunia berputar pada zaman itu dan tidak pernah dicabut. Jadi bingkai yang file-nya berkata 0,01 dtk diputar pada 0,10 dtk di mana-mana. Alat ini menampilkan jeda sebagaimana ia benar-benar diputar, dan menyebutkan apa yang disimpan file di sebelahnya kalau keduanya berbeda.

### Bisakah saya menyusun bingkainya kembali?

Bisa, dengan [Pembuat GIF](https://abox.tools/id/buat-gif/) di situs ini atau dengan apa pun lain yang menerima satu folder gambar. Untuk itulah `frames.txt` di dalam ZIP: memisahkan sebuah animasi membuang waktunya, karena sebuah PNG tidak punya tempat untuk mencatat berapa lama ia ditahan, jadi daftar itu membawa keluar jeda dan posisi setiap bingkai.

### Bingkainya bisa disimpan dalam format apa saja?

PNG, dan sengaja hanya PNG. Satu bingkai GIF paling banyak 256 warna dengan satu bit transparansi; PNG menyimpannya persis dan tanpa kehilangan, sedangkan JPEG akan membuang transparansinya, mengarang warna yang tidak pernah dimiliki bingkai itu, dan biasanya menghasilkan file yang *lebih besar* dari gambar datar. Kalau Anda butuh JPEG, ubah PNG-nya sesudahnya dengan [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/).

### Adakah batas berapa banyak bingkai yang akan dibacanya?

Tidak ada batas tetap. Batas praktisnya adalah memori mesin Anda sendiri: sebuah GIF mengembang menjadi kira-kira satu byte per piksel per bingkai saat dibaca, jadi file kecil bisa berarti memori yang sangat besar, dan halaman ini berhenti membaca alih-alih membiarkan tab-nya mati. Kalau itu terjadi ia mengatakannya dan menyerahkan bingkai yang sempat didapatnya.

### Apakah ia akan membuka GIF yang rusak?

Biasanya. Unduhan yang terpotong, penanda akhir yang hilang, dan bingkai terakhir yang berhenti di tengah aliran semuanya lazim, dan pembaca yang menolaknya tidak berguna justru untuk file yang paling ingin dibongkar orang. Bingkai mana pun yang lengkap akan kembali, dengan catatan tentang apa yang salah. Hanya file yang sama sekali bukan GIF yang ditolak mentah-mentah.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, dan tidak ada masa uji coba. Tidak ada tanda air pada bingkainya juga. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang file Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim animasi Anda ke tempat lain untuk diproses akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **GIF Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada. Dulu ini tertulis `connect-src 'none'`, yang mutlak; memasang iklan memakan itu, dan mengatakannya adalah bagian dari kesepakatan.
- **Pembaca GIF-nya adalah dua file di repositori ini.** Peramban akan memutar sebuah GIF tapi tidak akan menyerahkan bagian-bagiannya, jadi formatnya dibaca di sini: `src/gif.js` adalah wadah dan dekompresor LZW-nya, `src/compose.js` adalah aturan pembuangan yang menentukan tampilan setiap bingkai begitu bingkai sebelumnya ada di bawahnya. Tidak ada yang diambil untuk membuka sebuah file, dan tidak ada mesin yang diunduh saat pertama dipakai.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang animasi Anda: bukan file, bukan bingkai, bukan nama, ukuran, atau jumlah. Setiap baris yang membaca, mendekompresi, menggambar, atau mengodekan sebuah gambar disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau file Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju adalah situs milik orang lain.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan setiap bagian halaman ini tetap bekerja. Itulah bukti yang paling sederhana: alat yang mengirim animasi Anda ke tempat lain untuk dibongkar akan berhenti begitu Anda mencabut koneksi.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/gif.js` untuk pembaca yang mendekompresi bingkainya, dan `src/compose.js` untuk aturan yang menumpuknya satu di atas yang lain — keduanya tidak punya satu baris pun yang bisa menjangkau jaringan.
