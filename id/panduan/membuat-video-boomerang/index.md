# Cara membuat video boomerang

Boomerang adalah klip yang berjalan maju, lalu mundur, lalu berulang. Tidak ada alat di sini yang punya tombol boomerang; ia lahir dari tiga alat yang masing-masing mengerjakan satu hal — potong, balik, gabung — dan seluruh rantainya berjalan di mesin Anda sendiri.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

1. **Potong momennya.** Buka [Pemotong Video](https://abox.tools/id/potong-video/), tandai satu-dua detik yang mesti berayun bolak-balik, dan ekspor sebagai klip sendiri.
2. **Balik satu salinan.** Jatuhkan klip itu ke [Pembalik Video](https://abox.tools/id/putar-video-terbalik/), biarkan suaranya di luar, dan ekspor. Kini momen yang sama ada dua, satu untuk tiap arah.
3. **Gabungkan keduanya.** Kembali di Pemotong Video, jatuhkan kedua file, tandai masing-masing seutuhnya, taruh versi maju di depan, dan ekspor satu file.

Tak ada lompatan yang butuh unduhan di antaranya: setelah setiap ekspor, sebuah baris di bawah tombol unduh menawarkan membawa hasilnya langsung ke perkakas berikutnya — ke pembalik setelah potongan pertama, kembali ke pemotong setelah pembalikan — dan berkas tiba sudah termuat.

File itulah boomerangnya. Unggah apa adanya ke mana pun video bisu berulang, atau lewatkan ke pengubah [Video ke GIF](https://abox.tools/id/video-ke-gif/) kalau tujuannya hanya menganimasikan GIF. Tiap langkah terjadi di peramban Anda; tidak ada apa pun dari rantai ini yang diunggah, di titik mana pun, kepada siapa pun.

## Kenapa memotong lebih dulu

Membalik harus mengurai dan mengodekan ulang tiap bingkai yang disentuhnya; [panduan pembalikan](https://abox.tools/id/panduan/memutar-video-terbalik/) menjelaskan kenapa tidak ada jalan yang lebih murah. Memotong, sebaliknya, hampir gratis: pemotong meneruskan bingkai utuh tanpa mengodekan ulang.

Jadi urutan itulah seluruh triknya. Balik klip dua detik dan langkah mahalnya bekerja pada dua detik; balik aslinya dan ia bekerja pada semuanya, padahal sebagian besar akan Anda buang. Pada rekaman ponsel sepanjang apa pun, memotong dulu adalah beda antara boomerang dalam waktu kurang dari semenit dan bilah kemajuan yang Anda tunggui.

Potong rapat. Boomerang paling enak dibaca ketika berayun pada satu gerakan saja — lompatan, cipratan, putaran — dan tiap bingkai yang disimpan dibayar dua kali, sekali per arah.

![Pemotong video dengan satu bagian ditandai antara detik tiga dan lima koma enam, dan tabel berisi awal, akhir, dan durasinya.](https://abox.tools/screens/make-a-boomerang-video/section.webp)

Satu dua detik, itu saja bumerang. Memotong lebih dulu membuat pembalikannya murah, dan durasinya diputuskan di tabel itu.

## Suaranya diapakan

Tinggalkan, dan lakukan di langkah pembalikan: pembaliknya punya kotak centang persis untuk itu. Audio boomerang akan berbunyi maju lalu mundur; suara terbalik terdengar aneh tak tersamarkan, dan hampir semua tempat boomerang berakhir toh memutarnya bisu. Tanpa suara, membalik juga lebih cepat dan kedua file lebih kecil.

Kalau tetap disimpan, pemotong tetap akan menggabungkan kedua klip; tapi sambungan yang dimaafkan mata tidak dimaafkan telinga.

## Penggabungan, dan apa kata pemotong nanti

Dua file yang digabung itu kerabat dekat — yang satu dibuat dari yang lain — tetapi keduanya melewati encoder berbeda dan tidak harus sepakat byte demi byte soal format. Pemotong memeriksanya. Di bagian yang keduanya sepakat, bingkai disalin langsung; di bagian yang tidak, ia mengodekan ulang sekali dan mengatakannya di panel ekspor, alih-alih membiarkan Anda menebak.

Urutkan bagian-bagiannya sebelum ekspor: maju dulu, terbalik kemudian. Boomerang yang mulai dari ayunan balik terbaca seperti kekeliruan.

Satu penghalusan yang sepadan sepuluh detiknya: pangkas satu bingkai dari awal klip terbalik sebelum menggabung. Bingkai terakhir klip maju dan bingkai pertama klip balik adalah gambar yang sama, dan menampilkannya dua kali membuat belokannya tersangkut sekejap.

![Alat pembalik: ringkasan ukuran keluaran, durasi, dan jumlah bingkai, dengan sakelar untuk mempertahankan suara.](https://abox.tools/screens/make-a-boomerang-video/reverse.webp)

Bagian keduanya. Sakelar suara di sini lebih penting daripada di mana pun, karena alasan yang disebut bagian di atas.

## Video atau GIF di ujungnya

Simpan MP4-nya kalau tujuannya memutar video: jauh lebih kecil, jauh lebih tajam, dan berulang sama baiknya. Ubah ke GIF hanya kalau tempatnya menuntut GIF, dan kalau begitu awasi meterannya: GIF membayar tiap bingkai, dan boomerang adalah klipnya dua kali. [Panduan GIF parsial](https://abox.tools/id/panduan/gif-dari-potongan-video/) membahas tuas lebar dan laju bingkai yang menahannya di bawah batas ukuran.

## Kalau Anda melakukannya tiap minggu

Tiga halaman untuk satu efek memang disengaja: tiap alat mengerjakan satu hal, dan tiap halaman bisa membuktikan sendiri bahwa rekaman Anda tidak pernah meninggalkan mesin. Tetapi ketiganya open source: berlisensi MIT, satu folder per alat, modul ES bebas dependensi di `src/` dengan README yang menjelaskannya.

Kalau boomerang bagian tetap dari pekerjaan Anda, arahkan agen kode ke [repositorinya](https://github.com/A-Box-of-Tools/website) dan minta ia melipat jalan bingkai si pembalik dan penggabungan si pemotong menjadi satu halaman bertombol satu. Modul-modulnya ditulis untuk dibaca, dan mengangkatnya keluar memang gunanya lisensi itu.
