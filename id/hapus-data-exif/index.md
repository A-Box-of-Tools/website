# Penampil & Penghapus EXIF — hapus metadata foto

Lihat apa yang dikatakan sebuah foto tentang Anda. Lalu keluarkan.

> Lihat data EXIF dan GPS yang tersembunyi di dalam sebuah foto, sunting, atau bersihkan semuanya dalam satu klik. Di peramban Anda: tidak ada yang diunggah, dan fotonya tidak pernah dikodekan ulang.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/hapus-data-exif/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## foto Anda **tidak pernah diunggah**. Tidak ada server.

File dibuka, diurai, dan ditulis ulang oleh peramban Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah foto.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ Tidak pernah mengodekan ulang gambarnya

## Cara menghapus data EXIF dari sebuah foto

1. **Pilih foto Anda.** Jatuhkan ke pemilih file atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Baca isinya, kalau Anda mau.** Daftar temuannya menyebut hal-hal yang layak diketahui — posisi GPS, stempel waktu, nomor seri — sebelum tabel lengkap berisi setiap tag.
3. **Tekan "Hapus semua metadata".** Itulah seluruh pekerjaan bagi kebanyakan orang. Setiap tag, blok XMP dan IPTC, komentar, dan gambar mini tertanamnya semua hilang, pada setiap foto di daftar sekaligus.
4. **Atau sunting alih-alih menghapus.** Ubah sebuah tanggal, betulkan baris hak cipta, buang lokasinya dan simpan setelan kameranya — lalu simpan foto itu sendiri.

## Versi lebih lengkap

[Apa yang dikatakan sebuah foto tentang Anda, dan bagaimana mengeluarkannya](https://abox.tools/id/panduan/hapus-data-exif-dan-gps/): Foto dari sebuah ponsel biasanya membawa titik persis tempat ia diambil, waktunya sampai ke detik, dan nomor seri kameranya. Apa saja yang ada di dalamnya, siapa yang bisa membacanya, dan bagaimana mengeluarkannya tanpa menyentuh gambarnya.

## Juga ada di dalam kotak

- [Penampil DICOM](https://abox.tools/id/penampil-dicom/): CT, MR, rontgen, dan USG, lengkap dengan jendela, headernya, dan pengukurannya.
- [Gambar ke ICO](https://abox.tools/id/buat-favicon/): Satu gambar masuk. Setiap ukuran yang diminta peramban, Windows, atau sebuah Mac, keluar.
- [Gambar ke Data URI](https://abox.tools/id/gambar-ke-base64/): Seluruh gambar sebagai satu baris teks. Tempelkan langsung ke CSS atau HTML.
- [SVG ke Gambar](https://abox.tools/id/svg-ke-png/): Sebutkan ukurannya. Sebuah vektor tidak punya ukuran sendiri untuk hilang.

## Pertanyaan

### Apakah foto saya diunggah ke suatu tempat?

Tidak. File dibaca, diurai, dan ditulis ulang oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

### Apa itu EXIF, dan apa lagi yang bersembunyi di dalam sebuah foto?

EXIF adalah blok tag yang ditulis kamera di samping gambarnya: merek dan modelnya, setelan pencahayaannya, tanggal dan waktu sampai ke detik, sering kali posisi GPS, dan kadang sebuah nomor seri. Foto sering membawa lebih dari itu — paket XMP berisi XML dari sebuah penyunting, blok IPTC berisi kolom keterangan dan penulis, sebuah profil warna, salinan kecil kedua dari gambarnya sebagai gambar mini, dan catatan pembuat berisi data produsen yang tidak terdokumentasi. Alat ini mendaftarkan semuanya.

### Apakah menghapus metadata menurunkan kualitas gambar?

Tidak, dan inilah alasan utama memakai alat seperti ini alih-alih menyimpan ulang fotonya. Metadata duduk di wadah yang mengelilingi gambar terkompresi, bukan di dalamnya. Menghapusnya berarti menghapus butir dari sebuah daftar dan menulis daftarnya kembali; data gambar terkompresinya disalin byte demi byte, jadi hasilnya terdekode menjadi piksel yang sama persis. Tidak ada yang didekode dan tidak ada yang dikompres ulang.

### Format file apa saja yang ditanganinya?

JPEG, PNG, dan WebP. HEIC dan AVIF dikenali tapi tidak ditulis ulang: keduanya adalah format kotak yang dibangun dari atom bersarang dan butuh pengurai yang berbeda, jadi alat ini mengatakannya alih-alih menghasilkan file yang rusak. TIFF telanjang juga tidak ditangani, karena di dalam TIFF metadata dan pikselnya dialamati oleh ofset yang sama.

### Apakah foto saya akan tampak terputar setelah metadatanya dihapus?

Bisa, dan ada setelan untuk itu. Ponsel biasanya merekam gambarnya sebagaimana dilihat sensor dan menambahkan tag Orientasi yang mengatakan cara memutarnya. Hapus tag itu dan sebagian penampil menampilkan foto Anda miring. Pilihan "jaga tag orientasi", yang menyala secara bawaan, menulis kembali blok EXIF mungil yang tidak memuat apa pun selain tag itu — dan hanya ketika fotonya memang membutuhkannya. Matikan kalau Anda lebih suka file-nya sama sekali tidak membawa EXIF.

### Apakah ia menghapus lokasi GPS?

Ya. Menghapus semuanya menghapus seluruh direktori GPS-nya, dan Anda juga bisa menghapus lokasinya saja dan menyimpan sisanya. Posisinya ditampilkan dalam derajat desimal lebih dulu, karena "51 derajat, 30 menit, 26 detik" tidak membuatnya terang bahwa sebuah foto menyebut bangunan tempat ia diambil.

### Bisakah saya mengubah sebuah tag alih-alih menghapusnya?

Bisa. Tag teks, tanggal, ISO, orientasi, dan resolusi semuanya bisa disunting, dan beberapa tag umum bisa ditambahkan ke foto yang tidak punya. Satu catatan: menulis file-nya membangun ulang blok EXIF, dan catatan pembuat memuat ofset ke dalam blok aslinya, jadi catatan pembuat yang dibangun ulang mungkin tidak bisa dibaca lagi oleh perangkat lunak milik produsennya. Hapus catatan itu atau biarkan file-nya tanpa suntingan kalau hal itu penting bagi Anda.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, dan tidak ada masa uji coba. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang foto Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim foto Anda ke tempat lain untuk diproses akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Foto Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Berbeda dari alat lain di kotak ini, yang satu ini tidak punya fitur "muat dari alamat web" dan sama sekali tidak punya langkah jaringan opsional. Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`.
- **Metadata yang kami baca tidak pernah dibacakan keluar.** Posisi GPS Anda ditampilkan di halaman ini dan tidak pergi ke mana pun. Tidak ada peristiwa pengukuran khusus di repositori ini yang membawa sebuah tag, nama file, ukuran, atau jumlah.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang foto Anda. Setiap baris yang membaca, mengurai, atau menulis ulang sebuah file disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau file Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju adalah situs milik orang lain.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/tiff.js` untuk pengurai EXIF-nya, dan `src/jpeg.js` untuk bukti bahwa gambarnya sendiri hanya pernah disalin.
