# Cara mengubah satu folder gambar menjadi video

Tayangan slide itu sederhana untuk dibuat dan gampang untuk dirender dua kali, karena dua setelannya tidak berarti seperti kedengarannya. Inilah apa yang dikendalikan masing-masing dan apa yang sebaiknya dipilih.

[Buka Gambar ke Video](https://abox.tools/id/gambar-ke-video/): Ubah satu folder gambar menjadi sebuah video.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Gambar ke Video](https://abox.tools/id/gambar-ke-video/), jatuhkan gambarnya, susun urutannya, tentukan berapa lama masing-masing ditahan, lalu buat videonya. Anda mendapat sebuah MP4 dengan video H.264, yang bisa diputar di hampir apa saja.

Dua setelan yang paling sering butuh putaran kedua adalah durasi dan resolusinya, dan keduanya layak dipahami sebelum render pertama alih-alih sesudahnya.

## Frame rate dan durasi bukan hal yang sama

Inilah kebingungan yang membuat orang harus merender ulang.

**Durasi** adalah berapa lama setiap gambar bertahan di layar. Itulah setelan yang sebenarnya Anda pedulikan. Tiga detik adalah bawaan yang nyaman untuk tayangan slide yang sedang ditonton orang; satu sampai dua detik terasa cepat; lebih dari lima terasa berlarut kecuali ada narasi di atasnya.

**Frame rate** adalah berapa kali sedetik videonya mengulang gambar itu. Ia sama sekali tidak mengubah rupa tayangan slidenya — gambar diam yang ditahan tiga detik tampak identik pada 24 bingkai per detik dan pada 60 — dan ia mengubah ukuran file serta waktu pengodeannya cukup banyak.

Jadi untuk tayangan slide biasa, pilih frame rate yang rendah. 24 atau 30 sudah lebih dari cukup. Alasan untuk naik lebih tinggi adalah kalau ada gerakan di videonya: geseran atau perbesaran melintasi setiap foto, atau lesapan silang di antaranya, tempat frame rate rendah terlihat sebagai langkah-langkah patah.

![Pengaturan resolusi dan laju bingkai, dengan ringkasan yang menghitung gambarnya, durasi totalnya, jumlah bingkainya, dan perkiraan ukurannya.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

Laju bingkai dan durasi bukan hal yang sama, dan di ringkasan itu menjadi jelas: mengubah yang satu menggerakkan jumlah bingkai, bukan durasinya.

## Resolusi, dan gambar yang bentuknya tidak pas

Sebuah video punya satu ukuran bingkai sepanjang durasinya. Foto Anda hampir pasti tidak semuanya berbagi satu ukuran, jadi sesuatu harus terjadi pada yang tidak muat — dan sesuatu itulah pilihan yang layak dibuat dengan sengaja.

Mulailah dengan memilih resolusinya dari ke mana videonya akan pergi:

- **⁦1920×1080⁩** untuk apa pun yang umum. Didukung di mana-mana, bisa diputar di mana saja, dan itulah yang dimaksud kebanyakan orang dengan HD.
- **⁦1080×1920⁩** — angka yang sama dibalik — untuk tujuan yang mengutamakan ponsel: story, reel, short.
- **⁦3840×2160⁩** hanya kalau gambarnya memang punya detail sebanyak itu dan tujuannya akan menampilkannya. Ia empat kali pikselnya, empat kali waktu pengodeannya, dan kira-kira empat kali file-nya.

Lalu putuskan apa yang terjadi pada yang tidak pas. Memaskan setiap gambar di dalam bingkainya menjaga seluruhnya dan meninggalkan bilah di sisinya — aman, dan itulah jawaban yang benar ketika gambarnya lebih penting daripada penyajiannya. Mengisi bingkainya lalu memangkas kelebihannya tampak lebih baik dan akan memotong bagian atas sebagian gambarnya. Mencampur foto potret dan lanskap dalam satu video adalah kasus yang tidak punya jawaban baik; memutuskan lebih dulu ke arah mana Anda lebih rela keliru menghemat satu render ulang.

## Urutan, dan jebakan nama file

Seperti pada pekerjaan kumpulan mana pun, nama file terurut dengan cara yang bukan cara Anda menghitung. `foto2.jpg` datang setelah `foto10.jpg` dalam pengurutan alfabetis, karena perbandingannya karakter demi karakter.

Mengurutkan menurut tanggal pengambilan biasanya benar untuk foto sebuah acara, karena Anda memotretnya dalam urutan kejadiannya. Menyeret ubinnya benar untuk apa pun yang ceritanya tidak kronologis. Periksa sebelum Anda merender: video adalah satu-satunya hasil yang perbaikan urutannya berarti mengulang seluruh pekerjaannya.

![Enam gambar dalam urutan tayangnya, masing-masing dengan kolom durasi, di atas satu baris yang menyetel semua durasi sekaligus.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

Urutannya adalah daftarnya, dan daftarnya bisa diseret. Ia diambil dari urutan saat Anda menambahkannya, yang bukan urutan yang disiratkan nama berkasnya.

## Tidak ada suaranya, dan itu bukan perkara kecil

MP4 yang ditulis alat ini punya satu trek video dan sama sekali tidak punya trek audio. Kalau tayangan slide Anda butuh musik atau narasi, Anda akan butuh sebuah penyunting video untuk langkah itu.

Layak diketahui kenapa, alih-alih sekadar bahwa: menambahkan audio berarti mendekodekan sebuah file musik, mengodekannya ke AAC, dan menyelang-nyeling dengan videonya di dalam wadahnya. Ketiganya pekerjaan sungguhan, dan melakukannya dengan buruk menghasilkan file yang makin lama makin tidak sinkron saat diputar. Ia ada di daftar alih-alih dikerjakan setengah-setengah.

Satu catatan praktis kalau Anda memang menambahkan musik sesudahnya: pilih lagunya lebih dulu lalu setel durasi per gambar supaya tayangan slidenya keluar mendekati panjang lagunya. Memotong musiknya supaya pas dengan videonya selalu terdengar lebih buruk daripada memaskan videonya dengan musiknya.

## Apa yang keluar, dan apa yang dilakukan kalau ia tidak mau diputar

MP4 dengan H.264 adalah sasarannya, dan itulah kombinasi yang paling luas bisa diputar. Di peramban tanpa WebCodecs, alatnya mundur ke merekam WebM sebagai gantinya — rekaman yang sama di dalam wadah yang diterima lebih sedikit penyunting dan lapak media sosial.

Kalau Anda berakhir dengan sebuah WebM dan sesuatu menolaknya, solusinya adalah peramban yang mendukung WebCodecs alih-alih sebuah pengubahan: versi terkini Chrome, Edge, dan Safari semuanya mendukung. Merender ulang lebih baik daripada mengubah, karena mengubah berarti satu generasi lagi pengodean yang merugikan.

Tidak ada batas yang dibangun ke dalam alatnya soal berapa banyak gambar yang bisa Anda pakai. Langit-langitnya adalah memori mesin Anda sendiri, karena video jadinya dirakit di sana sebelum Anda mengunduhnya — tayangan slide 4K yang panjang adalah yang pertama merasakannya.

## Membuat file-nya lebih kecil

Kalau hasilnya terlalu besar untuk ke mana pun ia akan pergi, dalam urutan apa yang benar-benar membantu:

**Turunkan frame rate-nya.** Untuk tayangan slide yang diam, ini tidak mengorbankan apa pun yang terlihat dan merupakan penghematan tunggal terbesar yang tersedia.

**Turunkan resolusinya.** 1080p alih-alih 4K adalah seperempat pikselnya, dan di layar ponsel tidak ada yang akan tahu.

**Perpendek.** Tiga detik per gambar alih-alih lima adalah 40% lebih pendek dan 40% lebih kecil file-nya, dan biasanya tayangan slide yang lebih baik.

Mengecilkan foto sumbernya lebih dulu tidak banyak membantu. Videonya dikodekan pada resolusi yang Anda pilih bagaimanapun juga, jadi foto 4000 piksel dan foto 2000 piksel menghasilkan jumlah byte yang hampir sama di dalam video 1080p. Ia memang membuat pengodeannya lebih cepat, dan ia menggeser langit-langit memori itu.

## Kenapa ini tidak butuh server, dengan satu pengecualian yang dinyatakan

Mengodekan video dulu adalah alasan paling gamblang untuk mengunggah: peramban tidak bisa melakukannya, dan mesin dengan FFmpeg bisa. WebCodecs mengubah itu dengan membuka pengode perangkat keras yang sudah ada di mesin Anda, yang sama dengan yang dipakai ponsel Anda untuk merekam video secara langsung. Menyusun bingkainya adalah sebuah kanvas. Tidak satu pun dari kedua langkah itu butuh apa pun selain perangkat keras Anda sendiri.

Satu pengecualian pada alat yang satu ini, dinyatakan alih-alih dikubur: fitur opsional “tambahkan dari sebuah alamat web” mengambil sebuah gambar dari alamat yang Anda tempelkan, dan server di alamat itu melihat IP Anda dan apa yang Anda minta. Itu melekat pada fiturnya alih-alih menjadi cacat di dalamnya, dan itulah satu-satunya langkah jaringan di mana pun di dalam alatnya. Jangan pakai dan sama sekali tidak ada yang meninggalkan mesin Anda.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan empat pemeriksaan yang akan memberi tahu Anda hal yang sama tentang alat mana pun, termasuk yang ini.
