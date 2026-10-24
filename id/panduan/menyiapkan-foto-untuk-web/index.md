# Cara menyiapkan foto ponsel untuk web

Foto ponsel formatnya salah, empat kali lebih besar dari perlunya, dan tahu di mana Anda tinggal. Membuatnya layak unggah adalah rantai pendek — ubah, bingkai, mampatkan — dan tiap langkahnya berjalan di mesin Anda sendiri, tempat yang memang seharusnya bagi foto dengan GPS Anda di dalamnya.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

1. **Foto iPhone lebih dulu:** lewatkan file HEIC lewat [pengubah HEIC](https://abox.tools/id/heic-ke-jpg/), dan pilih untuk meninggalkan metadatanya. Ia memberi tahu, sebelum mengubah apa pun, foto mana yang membawa koordinat GPS. Foto yang sudah JPEG melewati langkah ini.
2. **Bingkai dan ukuran:** jatuhkan serombongannya ke [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/). Tetapkan sisi panjang — 1600 piksel cocok untuk kebanyakan halaman, 2000 kalau pembaca akan memperbesar — atau pangkas seluruh rombongan ke satu rasio dengan sekali klik.
3. **Tepati anggarannya:** selesaikan di [Pemampat Gambar](https://abox.tools/id/kompres-gambar/), yang menerima target dalam kilobyte alih-alih penggeser kualitas, dan mengembalikan rombongan sebagai satu zip.

Semuanya berjalan di peramban Anda. Foto aslinya — resolusi penuh, GPS, dan semuanya — tidak pernah meninggalkan mesin Anda, dan itulah gunanya mengerjakan ini secara lokal ketimbang lewat situs konversi.

## Ke mana metadata pergi

Risiko diam-diam sebuah foto ponsel bukan pikselnya; melainkan labelnya. Metadata EXIF mencatat kamera, cap waktu, dan — di hampir tiap ponsel — koordinat GPS tempat foto diambil. Unggah itu dan Anda mungkin sedang menyiarkan alamat rumah dalam bentuk yang bisa dibaca siapa pun yang melihat.

Fakta berguna dari rantai ini: ia mengurus label itu sendiri. Mengubah ukuran dan memampatkan sama-sama menggambar ulang citra dari piksel, dan piksel yang digambar ulang tidak membawa label: apa pun yang keluar dari langkah 2 atau 3 sudah bersih tanpa diminta. Dua kasus yang minta keputusan:

- **Mengubah HEIC:** pengubahnya bisa membawa serta metadata atau meninggalkannya — itu satu kotak centang — dan ia memperingatkan foto mana yang membawa GPS. Untuk apa pun yang publik, tinggalkan.
- **Foto yang tidak Anda ubah ukurannya:** kalau pikselnya harus tetap utuh, byte demi byte, pakai [penyunting EXIF](https://abox.tools/id/hapus-data-exif/), yang membuang label tanpa mengodekan ulang gambarnya. [Panduan metadata](https://abox.tools/id/panduan/hapus-data-exif-dan-gps/) versi panjangnya.

## Kenapa mengubah ukuran sebelum memampatkan

Karena piksel adalah anggarannya. Foto 12 megapiksel yang diperas sampai muat di 300 KB tampak jelas lebih buruk daripada foto 2 megapiksel yang dimampatkan lembut ke slot yang sama: kilobyte yang sama dioleskan ke enam kali luasnya. Memutuskan ukuran tampil lebih dulu membiarkan pemampat membelanjakan anggarannya untuk kualitas, bukan untuk resolusi yang tak akan dilihat siapa pun.

Pemampat akan mengubah ukuran sendiri kalau tidak ada jalan lain mencapai target, tetapi ia menganggapnya jalan terakhir. Melakukan pembingkaian sendiri di pengubah ukuran menjaga keputusannya — apa yang dipangkas, tepi mana yang penting — di tempat yang semestinya.

[Panduan pengubahan ukuran](https://abox.tools/id/panduan/ubah-ukuran-gambar/) dan [panduan pemampatan](https://abox.tools/id/panduan/kompres-gambar-ke-ukuran-tertentu/) masing-masing masuk lebih dalam ke separuhnya, termasuk apa yang sebenarnya diukur angka-angka kualitas.

![Pengubah ukuran disetel ke sisi terpanjang, dengan 1600 diisikan dan sisi panjang siap pakai di sebelahnya.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

Sisi panjang lebih dulu, karena itulah satu-satunya pengaturan yang memperlakukan foto tegak dan foto mendatar dengan cara yang sama.

## Serombongan sekaligus

Tiap alat dalam rantai menerima satu folder penuh dalam sekali jatuhkan: pengubah mengerjakan tiap HEIC termasuk foto beruntun, pengubah ukuran memasang satu bingkai ke seluruh set atau membiarkan Anda memangkas tiap foto berbeda, dan pemampat mengembalikan semuanya dalam satu zip. Dua puluh foto nyaris tidak makan perhatian lebih daripada satu: waktu mesinnya milik mesin Anda, dan lebih singkat daripada unggahan mana pun.

![Tiga baris hasil, masing-masing berisi foto yang turun dari megabita menjadi sekitar 150 kB, dengan kualitas yang dicapainya.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

Lalu kualitasnya, atas seluruh kumpulan sekaligus. Urutannya penting: bagian di atas menyebut alasannya.

## Kalau Anda melakukannya tiap minggu

Rantainya sengaja tinggal di tiga-empat halaman: tiap halaman mengerjakan satu hal, dan masing-masing membuktikan sendiri bahwa tidak ada yang meninggalkan mesin Anda. Tetapi tiap langkahnya open source: berlisensi MIT, satu folder per alat, modul ES bebas dependensi dengan README yang menjelaskan dekoder, pencuplikan ulang, dan pencarian ukuran target.

Kalau foto Anda selalu mengambil bentuk yang sama — sisi panjang sama, anggaran sama, label-dibuang sama — arahkan agen kode ke [repositorinya](https://github.com/A-Box-of-Tools/website) dan minta ia merangkai modul-modul itu jadi satu area jatuh dengan prasetel Anda sudah terpasang. Modul-modulnya ditulis untuk dibaca, dan mengangkatnya keluar memang gunanya lisensi itu.
