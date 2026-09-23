# Pembuat GIF — gambar menjadi GIF bergerak

Ubah sekumpulan gambar menjadi satu animasi.

> Ubah gambar JPG, PNG, atau WebP menjadi GIF bergerak, gratis dan sepenuhnya di peramban Anda. Atur urutan, kecepatan, dan ukurannya. Tidak ada yang diunggah, dan jalan tanpa internet.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/buat-gif/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## gambar Anda **tidak pernah diunggah**. Tidak ada server.

Setiap bingkai digambar, dikuantisasi, dan dikompres oleh peramban Anda sendiri, dan GIF yang sudah jadi dirakit di memori mesin ini. Tidak ada server di ujung lain halaman ini untuk menerima sebuah gambar, bahkan seandainya ada sesuatu di sini yang menginginkannya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ File tetap di perangkat Anda

## Cara membuat GIF dari gambar

1. **Pilih gambar Anda.** Jatuhkan sebuah folder ke pemilih file, atau pilih file-nya sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Urutkan sesuai urutan mainnya.** Seret lewat pegangannya, atau pakai panahnya. "Urutkan berdasarkan nama" menghitung seperti yang Anda harapkan, jadi `frame_2` mendarat sebelum `frame_10`.
3. **Atur berapa lama setiap bingkai ditahan.** Setengah detik per bingkai adalah slide; seperdua puluh detik adalah animasi. Beri semua bingkai waktu tahan yang sama sekaligus, atau bedakan salah satunya supaya berlama-lama.
4. **Pilih ukuran, dan cara warnanya dipilih.** Sebuah GIF tumbuh mengikuti luasnya dan jumlah bingkainya, dan tidak ada penggeser kualitas untuk menurunkannya lagi, jadi ukuran adalah setelan yang paling menentukan. 256 warna per bingkai adalah bawaan yang paling enak dilihat; satu palet bersama lebih kecil dan lebih stabil.
5. **Buat GIF-nya dan unduh.** Ia dibangun di perangkat keras Anda sendiri, jadi lamanya tergantung mesin Anda, bukan pada antrean. Animasi yang sudah jadi diputar di halaman sebelum Anda menyimpannya.

## Versi lebih lengkap

[Cara membuat GIF animasi dari gambar](https://abox.tools/id/panduan/buat-gif-dari-gambar/): Ubah sekumpulan gambar menjadi satu GIF animasi: seberapa cepat sebuah GIF sebenarnya bisa diputar, apa yang diubah setelan paletnya, dan tiga hal yang benar-benar membuat file-nya lebih kecil.

## Juga ada di dalam kotak

- [Pemisah GIF](https://abox.tools/id/pisah-gif-ke-bingkai/): Setiap bingkai keluar sebagai PNG-nya sendiri.
- [Penganalisis GIF](https://abox.tools/id/analisis-gif/): Bingkai, jeda, palet, dan ke mana setiap byte pergi.
- [Gambar ke Video](https://abox.tools/id/gambar-ke-video/): Ubah satu folder gambar menjadi sebuah video.
- [Pemotong Video](https://abox.tools/id/potong-video/): Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu video.

## Pertanyaan

### Apakah gambar saya diunggah ke suatu tempat?

Tidak. Gambar Anda dibaca, digambar, dikuantisasi, dan dikompres oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi jaringan dan ia tetap membuat GIF.

### Format gambar apa saja yang bisa saya pakai?

Format gambar diam apa pun yang bisa didekode peramban Anda, yang dalam praktiknya berarti JPG, PNG, WebP, GIF, AVIF, dan di perangkat Apple, HEIC. Tidak ada daftar terpisah yang harus dijaga tetap mutakhir di sini, karena pendekodean adalah tugas peramban, bukan tugas kami.

### Kenapa GIF saya begitu besar?

Karena sebuah GIF menyimpan setiap bingkai sebagai piksel utuh. Tidak ada kompensasi gerak, tidak ada yang disimpan sebagai "sama seperti tadi tapi digeser", dan tidak ada tombol kualitas: ukurannya kira-kira luas dikalikan jumlah bingkai, dan hanya tiga hal yang menurunkannya. \
\
Perkecil — memangkas ukuran jadi separuh membuat file-nya tinggal seperempat. Pakai lebih sedikit bingkai, atau tahan setiap bingkai lebih lama. Turunkan ke 64 atau 32 warna, dan matikan titik-titik campur, yang biayanya lebih ringan daripada kedengarannya pada gambar datar dan sangat besar pada foto. Kalau tetap tidak muat, jawaban jujurnya adalah bahwa yang Anda buat itu sebenarnya video, dan MP4-nya mungkin hanya sepersepuluh ukurannya.

### Secepat apa sebuah GIF bisa diputar?

Tidak secepat yang disiratkan angkanya. Formatnya menyimpan jeda setiap bingkai dalam perseratus detik, dan peramban sudah membatasi apa pun di bawah dua perseratus menjadi sepersepuluh detik sejak 1990-an — aturan yang ditulis untuk bola dunia berputar pada zaman itu dan tidak pernah dicabut. Jadi jeda 0,01 dtk tidak diputar pada 100 bingkai per detik; ia diputar pada 10. Karena itu alat ini tidak akan menawarkan apa pun di bawah 0,02 dtk, dan 0,05 dtk (20 bingkai per detik) kira-kira secepat yang layak diminta.

### Apa yang diubah setelan palet?

Satu bingkai GIF memuat paling banyak 256 warna, dan sesuatu harus memilihnya. \
\
**Warna terbaik untuk setiap bingkai** memilih 256 untuk setiap gambar secara terpisah, yang tampak paling tajam dan merupakan jawaban yang tepat untuk sekumpulan foto yang tidak berhubungan. **Satu palet untuk seluruh GIF** membangun satu tabel dari semua bingkai sekaligus. Ia membuat file lebih kecil, dan menghentikan kedipan yang muncul ketika palet tersentak-sentak di antara bingkai dari adegan yang sama — jadi itulah yang dipilih ketika bingkainya adalah sebuah rangkaian, bukan sebuah kumpulan.

### Bisakah saya menjaga latar tetap transparan?

Bisa, kalau gambar Anda memang punya: ubah "Transparansi" menjadi "Jaga area transparan". Satu hal yang perlu diketahui sebelum melakukannya. Transparansi GIF hanya satu bit — sebuah piksel entah tidak terlihat entah dicat penuh, tanpa apa pun di antaranya — jadi tepi yang dihaluskan, bayangan lembut, dan apa pun yang memudar akan berubah menjadi tepi keras. Kalau animasi Anda akan diletakkan di atas latar yang warnanya Anda ketahui, meratakannya ke warna itu akan tampak lebih baik.

### Adakah batas berapa banyak gambar yang bisa saya pakai?

Tidak ada batas yang tertanam di alat ini. Batas praktisnya adalah memori mesin Anda sendiri dan kesabaran Anda terhadap file yang keluar: gambarnya dibaca satu per satu, jadi seratus bingkai tidak masalah, tapi seratus bingkai pada 640 px juga berarti GIF yang sangat besar. Lihat "Kenapa GIF saya begitu besar?" di atas.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, dan tidak ada masa uji coba. Tidak ada tanda air pada keluarannya juga. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang gambar Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim gambar Anda ke tempat lain untuk diproses akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Gambar Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada. Dulu ini tertulis `connect-src 'none'`, yang mutlak; memasang iklan memakan itu, dan mengatakannya adalah bagian dari kesepakatan.
- **Encoder-nya adalah empat file di repositori ini.** Sebuah GIF butuh kuantiser warna dan kompresor LZW, dan peramban tidak menyediakan keduanya — jadi keduanya ditulis di sini, di `src/quantize.js` dan `src/lzw.js`, dengan wadahnya di `src/gif.js`. Tidak ada yang diambil untuk membuatnya, dan tidak ada mesin yang diunduh saat pertama dipakai.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang gambar Anda: bukan file, bukan gambar mini, bukan nama, ukuran, atau jumlah. Setiap baris yang membaca, mendekode, menggambar, atau mengompres sebuah gambar disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau gambar Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju adalah situs milik orang lain.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan setiap bagian halaman ini tetap bekerja. Itulah bukti yang paling sederhana: alat yang mengirim gambar Anda ke tempat lain untuk dijadikan GIF akan berhenti begitu Anda mencabut koneksi.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/quantize.js` untuk palet yang dipakai setiap bingkai, dan `src/lzw.js` serta `src/gif.js` untuk kompresornya dan file tempatnya masuk — tidak satu pun punya baris yang bisa menjangkau jaringan.
