# Cara memindai banyak halaman jadi satu PDF kecil

Urusannya jarang cuma satu halaman. Ia kontrak dengan lembar tanda tangannya, atau setahun kuitansi, dan di ujungnya kotak surat yang menolak apa pun di atas beberapa megabyte. Tiga alat menempuh seluruh jalannya, dan berkasnya tinggal di mesin Anda sendiri sepanjang itu.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Foto tiap halaman, lalu jatuhkan semua fotonya sekaligus ke [Pemindai Dokumen](https://abox.tools/id/pemindai-dokumen/). Ia menemukan sudut tiap halaman, meluruskan tiap foto, dan menulis *satu PDF dengan satu halaman per foto*: tidak ada langkah penggabungan terpisah, dan halaman-halamannya duduk dalam urutan Anda menambahkannya.

Dua alat melanjutkan dari tempat pemindai berhenti. Kalau sebagian dokumen memang sudah *berupa* PDF — kontrak yang mereka kirim lewat surel, mengelilingi lembar tanda tangan hasil pindaian Anda — jalinkan keduanya dengan [Penggabung PDF](https://abox.tools/id/gabung-pdf/). Dan kalau file jadinya masih lebih besar daripada yang diizinkan kotak surat, [Pemampat PDF](https://abox.tools/id/kompres-pdf/) menekannya di bawah batas.

Kedua estafet itu hanya satu klik: begitu pemindai menulis PDF-nya, sebuah baris di bawah tombol unduh menawarkan membawa hasilnya langsung ke penggabung atau pemampat, sudah termuat — dan penggabung menyerahkan hasilnya sendiri ke pemampat dengan cara yang sama.

Tidak ada apa pun dalam rantai ini yang mengunggah apa pun. Itu lebih penting di sini daripada hampir di mana pun: yang dipindai adalah kontrak, kartu identitas, dan berkas medis, sementara aplikasi yang biasa dipakai untuk ini melewatkan tiap halaman lewat server mereka.

## Memotret dengan benar

Pemindai menyelamatkan banyak sekali — jepretan miring, cahaya lampu tak rata, bayangan melintang di halaman — tetapi ia tidak bisa menyelamatkan yang tidak pernah ditangkap kamera. Tiga kebiasaan menutup sebagian besarnya:

- **Penuhi bingkainya**, dengan pinggiran meja terlihat di sekeliling tiap tepi. Sudut dicari dengan membandingkan halaman terhadap latar; halaman yang keluar dari foto tidak punya sudut untuk ditemukan.
- **Jepret dari atas**, kira-kira tegak lurus. Perspektif bisa dikoreksi, tetapi tepi jauh dari jepretan landai punya lebih sedikit piksel, dan koreksi tidak bisa mengarangnya.
- **Satu halaman per foto**, dalam urutan baca. Menyusun ulang belakangan juga bisa, tetapi urutan Anda memotret adalah urutan yang Anda dapat, dan memotret berurutan itu gratis.

[Panduan pemindaian](https://abox.tools/id/panduan/memindai-dokumen-dengan-ponsel/) membahas sisanya: bagaimana sudut ditemukan, kapan menyeretnya sendiri, dan apa yang dilakukan mode hitam-putih terhadap ukuran file.

![Pemindai dengan tiga halaman terfoto dalam satu deret, yang pertama terbuka dan sudut-sudutnya ditandai.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/pages.webp)

Tiga halaman, difoto dan diluruskan bersama-sama. Masing-masing menyimpan sudutnya sendiri, jadi satu foto yang gagal tidak merusak seluruh kumpulan.

## Kapan penggabung berhak atas tempatnya

Pemindai menggabungkan *foto*. Penggabung menggabungkan *PDF*, dan tengah-tengah urusan sungguhan sering kali keduanya: lembar bertanda tangan yang baru saja difoto, di dalam dokumen yang datang sebagai file. Pindai dulu halaman Anda, lalu jatuhkan pindaian dan PDF aslinya bersama-sama ke penggabung, seret halaman ke tempatnya, dan ekspor satu dokumen. Penanda buku dan tautan internal dokumen asli dibangun ulang terhadap halaman yang bertahan, dan isian formulir ikut serta.

Hal yang sama berlaku untuk pindaian dari hari yang berbeda: PDF tiap sesi jatuh sebagai satu blok halaman, dan penggabunglah tempat blok-blok itu menjadi satu file.

![Pembuat PDF dengan tiga halaman bersih di daftarnya, di atas pengaturan ukuran halaman, orientasi, dan margin.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/document.webp)

Lalu tiga halaman yang sama sebagai satu dokumen, langkah yang membuat penggabungnya pantas ada.

## Turun di bawah batas ukuran

Coba dulu tuas yang murah, dan letaknya di dalam pemindai: untuk halaman yang berupa tinta di atas kertas — teks, formulir, kuitansi — mode hitam-putih menyimpan tiap halaman satu bit per piksel, dan PDF-nya biasanya jatuh jauh di bawah satu megabyte per halaman tanpa memampatkan apa pun. Warna baru sepadan biayanya kalau warnanya memang berarti.

Kalau file-nya masih tak mau terkirim — halaman berwarna, atau penggabungan yang membawa masuk pindaian orang lain — pemampat mulai dengan menunjukkan di mana ukuran itu sebenarnya tinggal, lalu mengodekan ulang gambar halaman terhadap resolusi tempat mereka ditampilkan. Ia juga memeriksa hasilnya terbuka sebelum menawarkannya, dan itu berharga ketika file-nya kontrak dengan tenggat.

## Kalau Anda melakukannya tiap minggu

Langkah-langkahnya sengaja tinggal di tiga halaman: tiap halaman mengerjakan satu hal, dan masing-masing membuktikan sendiri bahwa berkasnya tidak pernah meninggalkan mesin Anda. Tetapi semuanya open source: berlisensi MIT, satu folder per alat, modul ES bebas dependensi dengan README yang menjelaskan pencari sudut, penyalinan halaman si penggabung, dan anggaran si pemampat.

Kalau urusan yang sama mendarat di meja Anda tiap minggu, arahkan agen kode ke [repositorinya](https://github.com/A-Box-of-Tools/website) dan minta ia merangkai modul-modul itu jadi satu halaman khusus: memindai langsung menjadi dokumen tergabung dan termampat, dengan halaman pengantar Anda sudah di tempatnya. Modul-modulnya ditulis untuk dibaca, dan mengangkatnya keluar memang gunanya lisensi itu.
