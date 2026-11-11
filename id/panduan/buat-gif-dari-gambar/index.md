# Cara membuat GIF animasi dari gambar

Membuat GIF-nya adalah bagian yang mudah. Mendapatkan satu yang cukup kecil untuk benar-benar diunggah adalah bagian yang layak dibaca, karena sebuah GIF tidak punya penggeser kualitas dan hanya tiga hal yang sama sekali menggerakkan ukurannya.

[Buka Pembuat GIF](https://abox.tools/id/buat-gif/): Ubah sekumpulan gambar menjadi satu animasi.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pembuat GIF](https://abox.tools/id/buat-gif/), jatuhkan gambarnya, susun dalam urutan seharusnya mereka diputar, setel berapa lama setiap bingkai ditahan, lalu buat GIF-nya. Ia diputar di halamannya sebelum Anda menyimpannya.

Semua di bawah ini adalah tentang dua hal yang keliru sesudahnya: file-nya jauh lebih besar daripada dugaan, atau animasinya diputar lebih lambat daripada yang dikatakan angkanya. Keduanya punya sebab tertentu dan tidak satu pun kesalahan alatnya.

## Kenapa sebuah GIF jauh lebih besar daripada dugaan Anda

GIF 20 bingkai pada 640 piksel rutin berukuran 8 sampai 15 MB. Animasi yang sama sebagai MP4 adalah beberapa ratus kilobita. Itu bukan GIF yang dibuat dengan buruk; memang begitulah formatnya.

Setiap format gambar bergerak lain yang pernah Anda pakai menyimpan *selisih*. Kodek video menulis satu bingkai penuh lalu, untuk bingkai sesudahnya, hanya apa yang bergerak dan ke mana ia bergerak — dan itulah sebabnya video orang yang berbicara di depan latar diam nyaris tidak berbiaya per bingkainya. Sebuah GIF tidak bisa melakukan itu. Setiap bingkai disimpan sebagai piksel utuh, dilewatkan melalui kompresor tanpa kehilangan, dan itulah seluruh perkakasnya.

Juga tidak ada setelan kualitas, karena tidak ada langkah merugikan yang bisa dikecilkan. JPEG pada kualitas 60% adalah pilihan sungguhan dengan penggeser sungguhan di belakangnya; GIF tidak punya padanannya. Jadi ukurannya kira-kira **luas × jumlah bingkai**, dan satu-satunya cara menggerakkannya adalah menggerakkan salah satu dari kedua angka itu.

## Tiga hal yang benar-benar membuatnya lebih kecil

Dalam urutan seberapa besar bantuannya:

**1. Kecilkan.** Ini bukan salah satu dari beberapa pilihan, ini pilihannya. Ukuran adalah luas, jadi menyetengahkan sisi panjangnya menyeperempatkan file-nya: 640 px turun ke 320 px mengubah 12 MB menjadi sekitar 3 MB. GIF di sebuah halaman web atau di jendela obrolan toh dilihat pada beberapa ratus piksel. 480 px adalah bawaan di alatnya persis karena alasan ini, dan 320 px adalah jawaban yang sangat terhormat.

**2. Pakai lebih sedikit bingkai.** Sepuluh bingkai yang ditahan seperlima detik masing-masing adalah animasi dua detik yang sama dengan dua puluh bingkai pada sepersepuluh, dan separuh file-nya. Kehalusan berbiaya byte secara sebanding, jadi belanjakan ia hanya di tempat gerakannya membutuhkannya.

**3. Matikan dithering, dan turunkan jumlah warnanya.** Yang ini berlawanan dengan naluri. Dithering menaburkan pola halus berisi piksel berselang-seling untuk memalsukan warna yang tidak dimiliki paletnya, dan pola itu adalah *derau* — dan justru itulah yang tidak bisa dikompres sebuah kompresor tanpa kehilangan. Pada karya seni datar, tangkapan layar, dan gambar garis, mematikannya bisa memangkas sepertiga file-nya dan tampak lebih baik pula. Pada foto, ia menukar pita warna yang terlihat dengan penghematannya, jadi coba keduanya lalu lihat.

Menurunkan dari 256 ke 64 warna juga membantu, meski kurang dari harapan orang: ia memendekkan kata kodenya alih-alih membuang piksel mana pun.

Kalau tidak satu pun dari itu membuatnya cukup kecil, jawaban yang jujur adalah bahwa yang Anda buat itu sebuah video. [Mengubah gambar yang sama menjadi sebuah MP4](https://abox.tools/id/panduan/gambar-ke-video/) mungkin sepersepuluh ukurannya, dan setiap tempat yang menerima sebuah GIF untuk apa pun selain sebuah tag `<img>` — termasuk setiap jejaring sosial — toh mengubahnya menjadi video saat diunggah.

## Seberapa cepat sebuah GIF sebenarnya bisa diputar

Formatnya menyimpan jeda setiap bingkai dalam perseratus detik, yang seolah-olah berarti Anda bisa meminta 0,01d lalu mendapat seratus bingkai sedetik. Anda tidak bisa.

Setiap peramban menjepit jeda di bawah dua perseratus detik naik ke sepersepuluh detik. Aturannya berasal dari 1990-an, ketika halaman penuh animasi yang disetel berputar secepat mungkin dan mesin masa itu tidak sanggup bertahan, dan ia hidup lebih lama daripada setiap alasan pengenalannya. Ia tidak pernah dicabut, dan ia berlaku untuk GIF Anda hari ini.

Jadi rentang praktisnya adalah:

- **0,02d** (50 bingkai sedetik) — secepat yang boleh dicapai sebuah GIF, dan lebih cepat daripada yang biasanya dibutuhkannya.
- **0,05d** (20 bingkai sedetik) — animasi yang halus, dan tempat memulai kalau Anda menganimasikan gerakan.
- **0,1d** (10 bingkai sedetik) — rupa GIF yang klasik. Separuh bingkainya, separuh file-nya, dan ia terbaca sebagai disengaja.
- **0,5d ke atas** — sebuah tayangan slide. Setiap gambar sedang dipandangi alih-alih dianimasikan.

Apa pun di bawah 0,02d tidak ditawarkan, karena itu angka yang akan diam-diam menjadi 0,1d di setiap peramban yang ada.

## Paletnya, dan apa yang sebenarnya dipilihnya

Sebuah bingkai GIF menyimpan paling banyak 256 warna. Sebuah foto punya puluhan ribu. Sesuatu harus memilih 256 di antaranya, dan pilihan itulah rupa keluarannya — lebih daripada setelan mana pun lainnya.

Alatnya menawarkan dua cara membuatnya:

**Warna terbaik untuk setiap bingkai** memberi setiap gambar 256 miliknya sendiri. Ia tampak paling tajam, dan ia benar untuk sekumpulan foto yang tidak berhubungan, tempat masing-masing toh menginginkan sekumpulan warna yang sama sekali berbeda.

**Satu palet untuk seluruh GIF-nya** membangun satu tabel dari setiap bingkainya sekaligus. Pakai itu ketika bingkainya sebuah *runtutan* — adegan yang sama, berselang beberapa momen. Dengan palet per bingkai, perubahan apa pun pada gambarnya mengubah 256 warna mana yang terpilih, dan seluruh latarnya bergeser warna sedikit di setiap bingkai. Kerlipan itulah yang membuat GIF buatan sendiri tampak buatan sendiri. Palet bersama menghilangkannya, dan sekaligus menghasilkan file yang lebih kecil, karena tabelnya ditulis sekali alih-alih di setiap bingkai.

Lebih sedikit warna — 128, 64, 32 — layak dicoba pada apa pun yang datar. Animasi logo dengan delapan warna di dalamnya tidak kehilangan apa pun pada 32, dan Anda bisa langsung melihat bedanya pada sebuah foto.

![Pengaturan warna: palet 128 warna, pilihan antara satu palet bersama dan satu palet per bingkai, dither dimatikan, serta ringkasan bingkai, durasi, dan perkiraan ukuran.](https://abox.tools/screens/make-a-gif-from-images/colours.webp)

Palet adalah pengaturan yang paling besar pengaruhnya pada ukuran, dan yang paling sering disembunyikan alat lain. Ringkasan di bawahnya bergerak sementara Anda mengubahnya.

## Transparansi itu satu bit, dan itulah seluruh ceritanya

Sebuah piksel GIF entah terlukis penuh entah sama sekali tak terlihat. Tidak ada apa pun di antaranya: tidak ada bayangan 50%, tidak ada tepi lembut, tidak ada lesapan.

Jadi kalau gambar sumber Anda punya transparansi, menyalakannya menjaga area transparannya tetap transparan — tapi setiap tepi yang dihaluskan, yang berupa gradien dari bentuknya menuju ketiadaan, dipotong di titik tengahnya menjadi tepi yang keras dan tampak bergerigi. Bentuk bulat dan teks paling menderita.

Kalau Anda tahu di atas warna apa GIF-nya akan duduk, meratakannya ke warna itu akan tampak lebih baik setiap kali. Simpan transparansinya hanya ketika latar tempatnya mendarat memang sungguh tidak diketahui — dan kalau jawabannya "ia butuh tepi lembut di atas latar apa pun", format untuk itu adalah PNG atau WebP animasi, bukan GIF.

## Urutan, pewaktuan, dan membuat lupnya duduk pas

Beberapa hal yang lebih cepat diketahui daripada ditemukan sendiri:

**Urutkan menurut nama dengan hitungan yang benar.** Runtutan render atau ekspor terurut sesuai maksud Anda, jadi `bingkai_2` mendarat sebelum `bingkai_10` alih-alih sesudahnya. Mengurutkan menurut tanggal mengembalikan galeri kamera ke urutan pengambilannya, dan itulah yang Anda mau ketika nama file-nya sudah mulai ulang dari 0001.

**Beri bingkai terakhir waktu lebih lama.** Lup yang setiap bingkainya sama panjang terbaca seperti tanpa jeda. Menahan bingkai terakhirnya sekitar setengah detik memberi mata tempat beristirahat dan membuat keseluruhannya tampak disengaja. Setiap bingkai punya waktu tahan sendiri untuk ini.

**Sebuah lup seharusnya tidak melompat.** Bingkai terakhir langsung disusul yang pertama, jadi kalau keduanya sangat berbeda, lupnya terasa menyentak. Buat keduanya mirip, atau justru manfaatkan potongannya dengan menahan bingkai terakhirnya.

**Putar sekali berarti putar sekali.** Sebagian alat menulis hitungan lup satu, dan dekoder tidak pernah sepenuhnya sepakat soal itu — beberapa memutarnya dua kali. Memilih "Putar sekali" di sini sama sekali tidak menulis informasi lup, dan setiap dekoder yang pernah dibangun memperlakukannya dengan cara yang sama.

![Lima bingkai berurutan, masing-masing dengan kolom jedanya sendiri, di atas satu baris yang menyetel semua jeda sekaligus.](https://abox.tools/screens/make-a-gif-from-images/frames.webp)

Urutan dan waktu, keduanya bisa diubah per bingkai. Menyetel semuanya sekaligus adalah baris di atas, dan itulah yang diinginkan siapa pun yang punya lebih dari tiga bingkai.

## Kenapa ini tidak butuh server

Membuat sebuah GIF adalah dua pekerjaan yang tidak ditawarkan peramban: memilih paletnya, dan mengompres pikselnya dengan LZW. Tidak satu pun besar. Keduanya mungkin empat ratus baris bersama-sama, keduanya tertulis di repositori, dan keduanya berjalan di mesin Anda sendiri seperti semua yang lain di sini — dan itulah sebabnya halamannya terus bekerja dengan jaringan tercabut.

Alasan begitu banyak pembuat GIF mengunggah bukanlah bahwa pekerjaannya sulit. Melainkan bahwa server adalah tempat iklan dan akunnya berada. Tidak ada apa pun tentang mengubah sekumpulan foto menjadi sebuah animasi yang menuntut foto Anda meninggalkan ruangan tempatnya berada.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan empat pemeriksaan yang akan memberi tahu Anda hal yang sama tentang alat mana pun, termasuk yang ini.
