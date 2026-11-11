# Cara menyunting GIF bingkai demi bingkai

Tidak ada penyunting GIF di sini, dan memang tidak perlu: pemisah yang membongkar animasi menjadi bingkai dan pembuat yang merakit animasi dari bingkai adalah sebuah penyunting dengan satu folder di tengahnya — dan folder itulah bagian tempat Anda menyunting, dengan apa pun yang sudah Anda pakai untuk gambar.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

1. **Bongkar.** Buka [Pemisah GIF](https://abox.tools/id/pisah-gif-ke-bingkai/) dan jatuhkan GIF-nya. Setiap bingkai menjadi PNG-nya sendiri — sebagaimana tampil di layar, dengan transparansi terjaga — dan di dalam ZIP ada daftar pewaktuan: jeda per bingkai yang dituliskan untuk perakitan ulang.
2. **Sunting foldernya.** Hapus bingkai yang harus pergi, poles bingkai yang harus berubah di penyunting gambar mana pun, ganti nama untuk menyusun ulang. Folder berisi PNG adalah format yang dipahami segalanya.
3. **Rakit kembali.** Jatuhkan folder itu ke [Pembuat GIF](https://abox.tools/id/buat-gif/), atur lama tayang tiap bingkai — atau bersandar pada daftarnya — pilih palet, lalu ekspor.

Ketiga langkah berjalan di peramban Anda. Tidak ada yang diunggah pada titik mana pun, dan di sini itu lebih penting dari biasanya: GIF yang orang perbaiki begitu sering berupa rekaman layar dengan sesuatu yang peka setengah terlihat di dalamnya.

## Yang bisa diceritakan pemisah sebelum Anda menyunting

Pemisah menampilkan, untuk tiap bingkai, jeda, posisi, ukuran, dan aturan pembuangannya — dan panel itu layak dilirik sebelum menyentuh apa pun, karena ia menjelaskan dua kejutan pada kebanyakan GIF.

Pertama: tidak semua bingkai adalah gambar utuh. Banyak GIF hanya menyimpan piksel yang berubah, ditambalkan di atas bingkai sebelumnya; pemisah menawarkan setiap bingkai *sebagaimana tampil* atau *sebagaimana tersimpan*, dan untuk menyunting Anda hampir selalu ingin *sebagaimana tampil*, agar setiap PNG berdiri sendiri. Kedua: jeda berlaku per bingkai, bukan satu angka. Jeda pada adegan pamungkas adalah jeda sungguhan pada bingkai sungguhan, dan daftar pewaktuanlah yang membawanya selamat melewati perjalanan bolak-balik.

Untuk pemangkasan yang lazim, langkah folder bahkan opsional: menyimpan tiap bingkai kedua atau kelima, atau mencentang yang dipertahankan, sudah ada di dalam pemisah — dan memangkas separuh bingkai adalah diet paling mujarab yang bisa diterima sebuah GIF.

![Pemisah yang menampilkan dua belas bingkai bernomor dari sebuah animasi, masing-masing dengan lama tampilnya.](https://abox.tools/screens/edit-a-gif-frame-by-frame/apart.webp)

Setiap bingkai, bernomor, dengan jedanya sendiri. Inilah bagian yang memberi tahu apa yang sedang Anda sunting sebelum Anda menyuntingnya.

## Harga perakitan ulang, sejujurnya

GIF memuat paling banyak 256 warna, dipilih saat ia dibangun. Perakitan ulang mengkuantisasi bingkai sekali lagi — satu palet bersama, atau warna terbaik per bingkai — dan pada bahan fotografis kuantisasi kedua itu bisa terlihat. Pada rekaman layar dan gambar garis, muatan yang lazim, tidak: mereka memang tidak pernah memakai 256 warna.

Tuas-tuas lain si pembuat sama dengan yang ada di [panduan anggaran GIF](https://abox.tools/id/panduan/gif-dari-potongan-video/): lebih sedikit warna, dithering Floyd-Steinberg untuk gradasi, dan perilaku putaran — selamanya, sekali, atau sejumlah tertentu.

Untuk melihat apakah operasinya berhasil — dan di mana bite sebenarnya bermukim — jatuhkan hasilnya ke [Penganalisis GIF](https://abox.tools/id/analisis-gif/): ia memetakan bingkai terhadap bite, dan bingkai yang berat biasanya adalah pengecatan ulang penuh yang semestinya bisa dipangkas seseorang.

Perjalanan itu ditawarkan si pembuat sendiri: setelah ekspor, sebuah baris di bawah tombol unduhnya membawa GIF yang baru jadi langsung ke penganalisis, sudah termuat.

![Pembuat GIF dengan enam bingkai berurutan, masing-masing dengan kolom jeda, dan satu baris untuk menyetel semua jeda sekaligus.](https://abox.tools/screens/edit-a-gif-frame-by-frame/together.webp)

Dan perjalanan pulangnya. Jedanya harus dipasang kembali dengan tangan, dan itulah bagian dari pulang pergi ini yang sebaiknya diketahui lebih dulu.

## Bila Anda melakukannya setiap minggu

Bongkar, folder, rakit ulang: langkah-langkah itu tinggal di halaman terpisah karena setiap halaman mengerjakan satu tugas, dan masing-masing bisa membuktikan sendiri bahwa tidak ada yang meninggalkan komputer Anda. Namun semuanya open source: lisensi MIT, satu folder per perkakas, modul ES tanpa dependensi yang README-nya menjelaskan dekoder, aturan pembuangan, dan pengkuantisasi.

Bila bedah GIF adalah pekerjaan yang terus kembali, arahkan agen kode ke [repositori](https://github.com/A-Box-of-Tools/website) dan minta ia melipat tabel bingkai si pemisah dan pengode si pembuat menjadi satu halaman tempat menghapus bingkai cukup satu klik. Modul-modul itu ditulis untuk dibaca, dan membawanya pergi adalah persis alasan lisensinya ada.
