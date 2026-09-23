# Cara membuat thumbnail video dari bingkai yang tepat

Beda antara thumbnail dan tangkapan layar kira-kira seperempat detik: bingkai ketika mata terbuka dan bola masih di udara. Sampai ke bingkai itu, pada ukuran platform, di bawah batas bitenya, adalah rangkaian tiga langkah yang berjalan seluruhnya di peramban Anda.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

1. **Ambil bingkainya.** Buka [Pengambil bingkai](https://abox.tools/id/ambil-bingkai-video/), jatuhkan videonya, dan melangkahlah menyusuri daftar bingkai milik berkas itu sendiri sampai ke saat yang persis. Simpan sebagai PNG: salinan tanpa kehilangan mutu, sehingga belum ada yang diputuskan.
2. **Bingkai gambarnya.** Bawa PNG itu ke [Pengubah ukuran gambar](https://abox.tools/id/ubah-ukuran-gambar/): pangkas ke bentuk platform — 16:9 untuk YouTube — dan tetapkan sisi panjangnya; 1280 piksel adalah angka yang sungguh diminta YouTube.
3. **Tepatkan ke pagunya.** Akhiri di [Pemampat gambar](https://abox.tools/id/kompres-gambar/) dengan batas platform sebagai sasaran — 2 MB untuk thumbnail YouTube — dan biarkan ia memilih JPEG atau WebP.

Tidak ada mata rantai yang mengunggah apa pun — dan itu penting ketika videonya belum terbit, karena thumbnail justru dibuat karena videonya belum menjadi milik umum.

## Mengapa melangkah mengalahkan menjeda

Menjeda pemutar lalu menangkap layar kalah dua kali. Jedanya jatuh di tempat pemutar sanggup berhenti — titik terdekat, bukan bingkai yang Anda maksud — dan tangkapan layar adalah foto si pemutar: resolusinya, antarmukanya, penanganan warnanya, bukan milik berkasnya.

Pengambil bingkai justru menyusuri daftar bingkai milik berkas itu sendiri, satu bingkai sekali jalan ke dua arah, dan menyerahkan bingkai hasil dekode itu sendiri, pada resolusi penuh videonya. Seperempat detik pencarian di kedua sisi momen biasanya adalah tempat thumbnail bermukim: bingkai *di antara* dua yang gamblang, tempat gerakan terbaca dan tidak ada yang kabur.

Simpan hasil tangkapan sebagai PNG meski thumbnail akhirnya akan menjadi JPEG atau WebP. PNG adalah salinan persis bingkainya; setiap keputusan yang mengorbankan mutu lalu terjadi sekali saja, di ujung, dalam anggaran bite, alih-alih dua kali dan saling menumpuk.

![Gambar diam dari sebuah video dengan kode waktu terlihat, di samping kendali langkah dan penggeser serta waktu persis asalnya.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Melangkah sampai ke bingkainya, bukan menjeda lalu memotret layar. Bagian di atas menyebut apa bedanya sebenarnya.

## Hitung-hitungan platform

Pangkas sebelum memampatkan, dengan alasan yang sama seperti di [panduan foto](https://abox.tools/id/panduan/menyiapkan-foto-untuk-web/): piksel adalah anggarannya. Pangkasan 16:9 dari bingkai 4K yang diturunkan ke ⁦1280×720⁩ membiarkan pemampat membelanjakan 2 MB-nya untuk mutu yang tidak perlu dipicingkan siapa pun. Kotak pangkas pengubah ukuran mengunci ke 16:9, jadi bentuknya cukup satu seretan, bukan hitungan; teks dan wajah sebaiknya tinggal di dua pertiga bagian tengah, karena lini masa membulatkan sudut dan menindihkan durasi di kanan bawah.

![Pengubah ukuran dengan lebar 1280 dan tinggi 720 diisikan, serta ringkasan bagaimana gambar diamnya akan keluar.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

Lalu hitung-hitungannya: apa pun yang diminta platformnya, diketik sebagai dua angka.

## Lembar kontak, bila momennya tak kunjung ketemu

Bila saat yang tepat tersembunyi di suatu tempat dalam sepuluh menit rekaman, mode lain si pengambil menyimpan satu gambar diam setiap N detik dan menyerahkan semuanya dalam satu ZIP. Telusuri gambar-gambar itu seperti lembar kontak, catat waktu yang paling dekat, lalu melangkahlah dari sana. Lebih cepat daripada menggosok-gosok bilah, dan Anda mendapat satu folder kandidat untuk hari ketika platform meminta bentuk yang lain.

## Bila Anda melakukannya setiap minggu

Langkah-langkah itu tinggal di tiga halaman memang disengaja: setiap halaman mengerjakan satu tugas, dan masing-masing bisa membuktikan sendiri bahwa tidak ada yang meninggalkan komputer Anda. Namun setiap langkah itu open source: lisensi MIT, satu folder per perkakas, modul ES tanpa dependensi dengan README yang menjelaskan dekoder, pencuplikan ulang, dan pencarian sasaran bite.

Bila thumbnail adalah setoran mingguan, arahkan agen kode ke [repositori](https://github.com/A-Box-of-Tools/website) dan minta versi satu halamannya: melangkah, memangkas ke pratata platform Anda, memampatkan ke pagunya, satu tombol. Modul-modul itu ditulis untuk dibaca, dan membawanya pergi adalah persis alasan lisensinya ada.
