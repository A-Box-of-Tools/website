# Cara memisah GIF menjadi bingkai

Mengeluarkan bingkainya cukup satu jatuhan dan satu tombol. Yang layak dipahami adalah apa sebenarnya sebuah "bingkai" GIF itu, karena formatnya menyimpan sesuatu yang agak berbeda dari yang Anda lihat — dan perbedaan itulah sebabnya bingkai keempat belas Anda berupa sebuah persegi panjang berisi mulut seseorang.

[Buka Pemisah GIF](https://abox.tools/id/pisah-gif-ke-bingkai/): Setiap bingkai keluar sebagai PNG-nya sendiri.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pemisah GIF](https://abox.tools/id/pisah-gif-ke-bingkai/), jatuhkan GIF-nya, dan setiap bingkai muncul sebagai PNG yang bisa Anda unduh — satu per satu, atau semuanya sebagai satu ZIP. Biarkan setelannya apa adanya dan Anda mendapat persis yang dimaksud kebanyakan orang: setiap bingkai sebagai gambar utuh, seperti rupanya pada momen itu di animasinya.

Sisa halaman ini adalah tentang tiga hal yang mengejutkan orang sesudahnya: bingkai yang hanya berupa tambalan kecil, transparansi yang berubah hitam di tempat lain, dan pewaktuan yang tidak ada lagi begitu bingkainya menjadi file terpisah.

## Apa sebenarnya sebuah bingkai GIF

GIF bukan setumpuk gambar. Ia *satu* gambar, diikuti serangkaian tambalan.

Setiap bingkai setelah yang pertama hanya menyimpan persegi panjang yang berubah, berikut sebuah aturan tentang apa yang dilakukan pada kanvasnya sesudah itu. Semua hal lain di layar sekadar apa yang ditinggalkan bingkai sebelumnya di sana. Orang yang berbicara di depan dinding yang diam memakan biaya sebuah persegi panjang berisi wajah per bingkai alih-alih gambar utuh per bingkai, dan itulah seluruh alasan format tanpa kompensasi gerak dan tanpa langkah yang merugikan ini tidak sama sekali tidak terpakai.

Jadi ada dua jawaban yang berbeda dan sama jujurnya untuk "berikan saya bingkai 14", dan alatnya menawarkan keduanya:

**Bingkainya sebagaimana ia tampak.** Gambar utuh pada momen itu: bingkai 14 digambar di atas semua yang sebelumnya. Inilah bawaannya, dan inilah yang Anda mau untuk sebuah lembar kontak, sebuah gambar mini, sebuah gambar diam untuk diunggah, atau bingkai yang akan masuk ke sebuah penyunting video.

**Hanya piksel yang disimpan bingkai itu.** Tambalannya sendiri, pada ukurannya sendiri, di posisinya sendiri, dengan semua yang tidak dibawanya dibiarkan transparan. Bingkai 14 bisa jadi ⁦60 × 40⁩ piksel berisi mulut. Inilah tampilan yang menjelaskan ke mana byte sebuah GIF pergi, dan inilah yang Anda mau kalau Anda menyunting animasinya alih-alih memanen gambar darinya.

Tidak ada yang salah dengan file Anda ketika sebuah bingkai tersimpan tampak seperti serpihan. Memang begitulah file-nya.

![Dua belas bingkai bernomor dari sebuah animasi, masing-masing sebagai gambar utuh dengan lama tampilnya.](https://abox.tools/screens/split-a-gif-into-frames/frames.webp)

Setiap bingkai sebagai gambar utuh, yang bukan isi berkasnya: bagian ini membahas perbedaan itu.

## Aturan pembuangan, dan kenapa sebagian bingkai meninggalkan lubang

Setiap bingkai juga membawa salah satu dari empat instruksi tentang apa yang terjadi pada persegi panjangnya sebelum bingkai berikutnya digambar. Alatnya menampilkannya di bawah setiap bingkai pada tampilan tersimpan:

**Bertahan di layar.** Yang biasa. Tambalannya tetap di tempat ia mendarat dan bingkai berikutnya menggambar di atasnya.

**Membersihkan areanya sesudahnya.** Persegi panjangnya dihapus sebelum bingkai berikutnya mendarat. Inilah yang dilakukan animasi dengan objek transparan yang bergerak, dan ini juga penyebab klasik GIF yang berkedip-kedip.

**Memulihkan apa yang ada di bawahnya.** Kanvasnya kembali ke rupanya sebelum bingkai ini menggambar — sebuah cap, lalu sebuah pengurungan. Jarang, dan yang paling sering salah dipahami pembaca GIF buatan sendiri.

Satu detail yang layak diketahui kalau Anda membandingkan alat: spesifikasinya mengatakan "membersihkan areanya" seharusnya memulihkan *warna latar*, tapi setiap peramban sejak 1990-an membersihkannya menjadi *transparan*, karena itulah yang diandaikan animasi masa itu. Alat ini mengikuti peramban dengan sengaja, jadi bingkai yang Anda dapat adalah bingkai yang Anda lihat.

![Kartu pengaturan: pilihan antara bingkai sebagaimana ia tampil dan tambalan mentah yang tersimpan di berkas, dengan warna latar untuk bagian yang tembus pandang.](https://abox.tools/screens/split-a-gif-into-frames/settings.webp)

Mode sebagaimana ia tampil memutar ulang aturan pembuangan dan memberi Anda gambar. Mode yang lain memberi Anda apa yang benar-benar ada di berkas, lengkap dengan lubangnya.

## Apa yang terjadi pada transparansinya

Transparansi GIF itu satu bit. Sebuah piksel entah terlukis entah tak terlihat, dan tidak ada apa pun di antaranya — tidak ada tepi lembut, tidak ada bayangan separuh. Itulah sebabnya GIF berlatar transparan punya siluet yang keras dan sedikit bergerigi.

PNG menyimpan persis itu, tanpa kehilangan, jadi bingkainya keluar dengan transparansinya utuh dan tidak ada yang dikarang. Simpan itu kalau bingkainya akan pergi ke tempat yang memahami transparansi.

Isi dengan sebuah warna kalau tidak. Perangkat lunak yang mengabaikan kanal alfa biasanya menggambarnya hitam, jadi bingkai yang tampak baik-baik saja di peramban tiba dengan latar hitam — dan sebuah tambalan tersimpan, yang transparan hampir di seluruhnya, tiba sebagai persegi panjang hitam berisi mulut. Memilih warnanya di muka adalah solusinya. Ia ditulis ke dalam PNG-nya dan tidak bisa diurungkan sesudahnya, dan itulah satu-satunya alasan ia bukan bawaannya.

## Pewaktuannya, yang tidak bisa dibawa bingkainya

Sebuah PNG tidak punya tempat untuk mencatat berapa lama ia ada di layar. Pisah sebuah animasi menjadi PNG dan pewaktuannya hilang, dan itu penting begitu Anda ingin menyusunnya kembali.

Untuk itulah `frames.txt` di dalam ZIP-nya ada. Ia mendaftar jeda, posisi, dan ukuran setiap bingkai, sehingga animasinya bisa dibangun ulang di [Pembuat GIF](https://abox.tools/id/buat-gif/) atau di tempat lain mana pun. Ia memakan beberapa kilobita dan tidak ada cara untuk menyusunnya kembali belakangan.

Dua hal tentang jeda GIF yang menjebak semua orang:

**Satuannya perseratus detik**, jadi langkah terhalus yang dipunyai formatnya adalah 0,01 d. Tidak ada yang namanya GIF 30 fps yang tepat; 0,03 d per bingkai adalah 33,3 fps dan 0,04 d adalah 25.

**Apa pun di bawah 0,02 d diputar pada 0,10 d.** Peramban sudah menjepitnya sejak 1990-an — sebuah aturan yang ditulis untuk bola dunia berputar masa itu dan tidak pernah dicabut. GIF yang file-nya berkata 0,01 d per bingkai mengaku 100 fps dan diputar pada 10. Alatnya menampilkan jedanya sebagaimana ia benar-benar diputar, dan menyebutkan apa yang disimpan file-nya di sebelahnya ketika keduanya berbeda, karena selisih itulah sebabnya GIF yang Anda pisah lalu bangun ulang bisa keluar lebih lambat daripada aslinya.

## Nomor bingkai, dan kenapa ia diberi nol di depan

Bingkainya keluar sebagai `nama-001.png`, `nama-002.png`, dinomori mulai dari satu dan diberi nol di depan sampai selebar nomor terakhirnya. Itu bukan hiasan: `bingkai9.png` terurut *setelah* `bingkai10.png` di setiap pengelola file dan di kebanyakan perangkat lunak yang mengimpor sebuah runtutan, karena mereka mengurutkan teks alih-alih angka. Nama yang diberi nol di depan terurut benar di mana saja, dan setiap penyunting video yang mengimpor runtutan gambar mengharapkannya.

Menjarangkan animasi yang panjang dengan "simpan setiap bingkai kedua" tidak menomori ulang apa pun. Bingkai 42 tetap bernama bingkai 42, jadi file-nya sejajar dengan aslinya dan dengan daftar pewaktuannya.

## Kenapa ini tidak butuh server

Membaca sebuah GIF itu dua pekerjaan: menyusuri blok file-nya, dan membuka kompresi LZW tempat pikselnya terbungkus. Bersama-sama keduanya beberapa ratus baris, keduanya tertulis di repositori, dan keduanya berjalan di mesin Anda sendiri — dan itulah sebabnya halamannya terus bekerja dengan jaringan tercabut.

Peramban Anda sudah bisa memutar sebuah GIF, tapi ia tidak akan menyerahkan bagian-bagiannya: sebuah `<img>` memberi Anda sebuah animasi, menggambar satu ke sebuah kanvas memberi Anda bingkai pertama selamanya, dan satu-satunya API yang berbuat lebih tidak ada di Safari. Jadi formatnya dibaca sendiri di sini, dengan cara yang sama di setiap peramban — dan membacanya sendiri juga itulah yang memungkinkan menampilkan tambalan dan aturan pembuangannya kepada Anda sama sekali.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan empat pemeriksaan yang akan memberi tahu Anda hal yang sama tentang alat mana pun, termasuk yang ini.
