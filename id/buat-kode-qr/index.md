# QR dan Barkode — buat kode QR atau barkode, tanpa internet

Ketik, dan ia menjadi sebuah kode. Tidak ada yang dikirim untuk membuatnya.

> Buat kode QR untuk sebuah tautan, jaringan Wi-Fi, atau kartu kontak, atau barkode EAN-13, UPC-A, Code 128, atau Code 39. Unduh sebagai SVG atau PNG. Semuanya terjadi di peramban Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/buat-kode-qr/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## kode dan teks di dalamnya Anda **tidak pernah diunggah**. Tidak ada server.

Sebuah kode QR adalah aritmetika atas sebuah string: tidak ada file untuk dikirim dan tidak ada layanan untuk dimintai. Setiap langkah — memilih modenya, memilih versinya, koreksi galat Reed-Solomon, maskernya, batang sebuah barkode dan angka periksa di bawahnya — terjadi dalam kira-kira seribu baris JavaScript di halaman ini yang bisa Anda baca. Alat ini tidak punya fitur jaringan dalam bentuk apa pun, dan itu lebih penting di sini daripada di sebagian besar halaman: yang dikodekan sering kali adalah kata sandi Wi-Fi.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa masa berlaku
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara membuat kode QR tanpa mengunggah apa pun

1. **Pilih jenis kodenya.** Kode QR memuat apa saja dan itulah yang dicari kamera ponsel, jadi itulah jawabannya kecuali ada yang mengatakan lain kepada Anda. Barkode memuat sebuah angka, dan yang mana yang Anda butuhkan ditentukan oleh siapa pun yang akan memindainya — sebuah toko mau EAN-13 atau UPC-A, kardus pengiriman mau ITF-14, dan apa pun yang internal biasanya Code 128.
2. **Sebutkan apa yang masuk ke dalamnya.** Tautan adalah kasus yang lazim, dan kotak-kotak di atasnya membangun format lain yang dikenal ponsel: jaringan Wi-Fi yang menawarkan diri untuk disambungkan, kartu kontak yang menawarkan diri untuk disimpan, sebuah email, sebuah pesan teks, sebuah nomor telepon, sebuah tempat di peta. Apa pun yang Anda pilih, string yang sudah jadi ditampilkan di halaman — hanya itulah yang pernah dimuat sebuah kode QR.
3. **Pilih seberapa banyak kerusakan yang boleh ditanggungnya.** Empat tingkat itu memasukkan lebih banyak atau lebih sedikit koreksi galat, dan lebih banyak koreksi berarti kode yang lebih besar dan lebih padat. L cukup untuk layar, M untuk kertas biasa, dan H untuk sesuatu yang akan dipegang-pegang, dicetak kecil, atau ditempel di jendela yang kena matahari. Kode di menu yang dilap setiap hari layak diberi Q atau H.
4. **Atur ukuran, margin, dan warnanya.** Margin adalah bagian dari kodenya: empat modul ruang sunyi mengelilinginya adalah yang diminta spesifikasinya, dan memangkasnya adalah alasan tunggal yang paling umum kenapa kode tercetak tidak mau terpindai. Gelap di atas terang, dengan kontras sungguhan — pemindai membaca selisih antara keduanya, jadi abu-abu pucat di atas putih tidak akan cukup, dan terang di atas gelap gagal mentah-mentah pada cukup banyak pembaca.
5. **Periksa dengan ponsel yang Anda punya.** Sebelum Anda mencetak seribu, pindai yang ada di layar Anda. Itu memakan sepuluh detik dan menangkap seluruh kategori kesalahan yang tidak bisa ditangkap sebuah pratinjau: kata sandi Wi-Fi dengan karakter yang perlu dikaburkan, tautan yang kehilangan `https://`-nya, nomor barkode yang kurang satu digit.
6. **Ambil SVG-nya.** Ia adalah kodenya sebagai instruksi alih-alih sebagai piksel, jadi ia tercetak pada ukuran apa pun tanpa melembut, dan tepi yang lembut justru yang tidak bisa ditangkap pemindai. Ambil PNG-nya juga kalau apa pun tempat Anda menempelkannya tidak menerima SVG; ia digambar pada jumlah piksel bulat per modul, jadi tepinya juga tidak kabur.

## Versi lebih lengkap

[Cara membuat kode QR yang tetap terpindai di ponsel orang lain](https://abox.tools/id/panduan/buat-kode-qr/): Tingkat koreksi galat mana yang dipilih, kenapa margin putih di sekeliling sebuah kode QR adalah bagian dari kodenya, seberapa besar mencetaknya, dan berapa harga kode 'dinamis' sebuah pembuat gratis bagi Anda belakangan.

## Juga ada di dalam kotak

- [Pembaca QR & Barcode](https://abox.tools/id/pindai-kode-qr/): Arahkan ke sebuah kode, atau jatuhkan gambarnya. Ia dibaca di sini, dan tidak di tempat lain.
- [Hash dan Checksum](https://abox.tools/id/hitung-checksum/): Periksa sebuah unduhan terhadap angka yang dicetak penerbitnya, tanpa mengirimnya ke siapa pun.
- [Pembuat Kata Sandi dan Frasa Sandi](https://abox.tools/id/pembuat-kata-sandi/): Dibuat di sini, oleh peramban Anda sendiri, dan tidak pernah dikirim ke mana pun. Tidak ada yang disimpan dan tidak ada riwayat.
- [Pemformat JSON](https://abox.tools/id/format-json/): JSON, XML, HTML, CSS, dan YAML, diformat atau diubah. Tidak ada yang ditempelkan ke server orang lain.

## Pertanyaan

### Apakah yang saya ketik dikirim ke suatu tempat?

Tidak. Sebuah kode QR adalah aritmetika atas sebuah string, dan aritmetika itu berjalan di peramban Anda sendiri di mesin Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Itu lebih bernilai di sini daripada di sebagian besar halaman, karena yang paling sering dimasukkan orang ke dalam kode QR adalah kata sandi Wi-Fi mereka.

### Apakah kode ini kedaluwarsa, atau berhenti bekerja nanti?

Tidak, dan memang tidak bisa. Apa yang Anda ketik itulah isi kodenya, jadi memindainya mengembalikan persis string itu selamanya. Kode yang kedaluwarsa adalah yang di dalamnya ada alamat orang lain: kode QR "dinamis" memuat tautan ke server pembuatnya, yang mengalihkan ke server Anda, yang berarti mereka bisa menghitung setiap pemindaian, mengubah tujuannya, atau mematikannya ketika masa coba berakhir. Tidak ada di sini yang mengalihkan lewat apa pun.

### Apakah gratis, dan bisakah saya memakainya untuk keperluan komersial?

Gratis, tidak ada akun, tidak ada tanda air, dan tidak ada batas berapa banyak yang Anda buat, dan Anda boleh menaruh hasilnya di sebuah produk, poster, atau etalase. QR Code adalah merek dagang terdaftar milik Denso Wave, yang telah menyatakan tidak akan menegakkannya terhadap orang yang memakai kodenya — spesifikasinya diterbitkan sebagai ISO/IEC 18004 dan bebas diimplementasikan, dan itulah yang dilakukan halaman ini. Situs ini memasang iklan, dan itulah yang membiayainya.

### Tingkat koreksi galat mana yang harus saya pilih?

M kecuali Anda punya alasan. L membuat kode terkecil dan cukup untuk layar; M bertahan terhadap penanganan biasa; Q dan H untuk kode yang akan dicetak kecil, dilaminasi, ditempel di jendela, atau tertutup sebagian oleh logo. Setiap kenaikan memasukkan lebih banyak data periksa, yang butuh simbol lebih besar untuk jumlah teks yang sama — naik dari L ke H kira-kira menggandakan jumlah modul untuk string yang sama.

### Berapa banyak yang bisa dimuat sebuah kode QR?

Pada ukuran terbesar, 177 modul persegi, sampai 7.089 digit, 4.296 huruf kapital dan digit, atau 2.953 byte apa pun lainnya — dan itu pada koreksi galat terlemah; pada yang terkuat kira-kira sepertiganya. Dalam praktik, batasnya bukan formatnya melainkan pemindainya: lewat beberapa ratus karakter, modulnya menjadi begitu kecil sehingga kamera ponsel biasa tidak bisa menangkapnya pada jarak lengan. Kode yang panjang biasanya pertanda bahwa yang seharusnya ada di dalamnya adalah tautan pendek.

### Kenapa kode saya lebih besar kalau tautannya saya tulis dengan huruf kecil?

Karena kode QR punya mode untuk huruf kapital dan digit yang mengemas dua karakter ke dalam sebelas bit, dan tidak punya mode seperti itu untuk huruf kecil, yang memakan delapan bit masing-masing. URL yang ditulis `HTTPS://EXAMPLE.COM/PAGE` bisa sepertiga lebih kecil daripada URL yang sama dengan huruf kecil. Skema dan hos-nya tidak peka huruf besar-kecil, jadi meneriakkannya tidak mengubah apa pun selain ukurannya; jalur setelah hos-nya peka, jadi biarkan bagian itu.

### Bisakah ia membaca kode QR sekaligus membuatnya?

Bukan halaman ini, tapi yang di sebelah bisa: [pembacanya](https://abox.tools/id/pindai-kode-qr/) menerima sebuah foto, tangkapan layar, atau kamera Anda dan mengembalikan string-nya. Itu pekerjaan yang jauh lebih besar daripada menggambar satu — mencari simbolnya di dalam sebuah gambar, mengoreksi sudut pengambilannya, dan memperbaiki kerusakannya adalah tiga masalah yang tidak dimiliki halaman ini — dan itulah sebabnya ia menjadi alat tersendiri alih-alih sebuah tombol di sini. Ia berjalan dengan syarat yang sama seperti segala yang lain: tidak ada yang diunggah, dan tidak ada bingkai kamera yang disimpan.

### Untuk apa marginnya, dan bisakah saya membuatnya lebih kecil?

Ruang putih di sekeliling kode QR adalah bagian dari kodenya. Sebuah pembaca memakainya untuk menemukan di mana simbolnya berakhir, dan spesifikasinya meminta empat modul di setiap sisi; sebuah barkode mau sekitar sepuluh. Anda bisa mengaturnya ke nol di sini dan gambarnya akan tampak lebih rapi, dan cukup banyak pemindai kemudian tidak akan melihatnya sama sekali — terutama di atas latar yang ramai. Kalau ruangnya yang jadi masalah, perkecil kodenya alih-alih memangkas marginnya.

### Barkode mana yang saya butuhkan?

Mana pun yang diminta orang yang akan memindainya. EAN-13 adalah barkode ritel di luar Amerika Utara dan UPC-A yang di Amerika Utara — keduanya butuh nomor yang diterbitkan GS1 untuk Anda, karena nomornya menandai perusahaan Anda, bukan sekadar produknya. EAN-8 adalah versi pendek untuk kemasan kecil. ITF-14 dipasang di kardus pengiriman. Code 128 dan Code 39 memuat teks selain digit dan sama sekali tidak butuh pendaftaran, yang membuatnya jawaban tepat untuk apa pun yang internal: aset, rak, lembar kerja.

### Apa itu angka periksa, dan kenapa alat ini menambahkannya?

Ia adalah digit terakhir sebuah barkode ritel, dihitung dari digit-digit sebelumnya, sehingga sebuah pemindai bisa membedakan salah baca dari berhasil baca. EAN-13 mau dua belas digit dan menghitung yang ketiga belas; UPC-A mau sebelas dan menghitung yang kedua belas. Ketik nomor pendeknya dan halaman ini menambahkannya. Ketik nomor lengkapnya dan ia memeriksa yang Anda berikan — dan menolak, alih-alih diam-diam membetulkannya, karena digit yang salah lalu diperbaiki diam-diam adalah label yang terpindai sebagai produk orang lain.

### Bisakah saya menaruh logo di tengah kode QR?

Tidak di sini, tapi alasan hal itu berhasil di tempat lain layak diketahui: koreksi galatlah yang memungkinkannya. Pada tingkat H, kira-kira 30% modulnya bisa hancur dan kodenya tetap terbaca, jadi logo yang menutupi kurang dari itu di bagian tengah — tempat tidak ada pola pencari — adalah kerusakan yang bisa diperbaiki. Masukkan kodenya ke penyunting gambar Anda pada tingkat H, jaga logonya di bawah sekitar seperlima luasnya, dan ujilah dengan ponsel sungguhan alih-alih mempercayainya begitu saja.

### Kenapa SVG lebih baik daripada PNG?

Karena sebuah kode terdiri dari tepi, dan sebuah PNG punya jumlah piksel tetap untuk membuatnya. Perbesar satu dan setiap tepinya melembut; tepi yang lembut justru yang menyulitkan pemindai, dan pencetak 1200 dpi yang diberi PNG 512 piksel sedang diminta mengarang selisihnya. Sebuah SVG adalah kotak-kotaknya sebagai instruksi, jadi ia tercetak tajam di kartunama maupun di bilbor. PNG di sini digambar pada jumlah piksel bulat per modul, dan itu yang terbaik yang bisa dilakukan sebuah PNG.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim teks Anda ke tempat lain untuk digambarkan kodenya akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Tidak ada tujuan ke mana pun bagi apa yang Anda ketik.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat kata sandi Wi-Fi bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Kodenya dibangun dari string itu dengan aritmetika dan digambar sebagai SVG, di halaman ini, di mesin Anda.
- **Kodenya tidak menunjuk ke kami.** Apa yang Anda ketik itulah isi kodenya. Beberapa pembuat gratis mengembalikan kode yang memuat tautan ke situs mereka sendiri, yang kemudian mengalihkan ke situs Anda — jadi setiap pemindaian dihitung oleh mereka, dan kodenya berhenti bekerja pada hari mereka berhenti membayar nama domainnya atau memutuskan kuota gratisnya habis. Tidak ada di sini yang memendekkan, mengalihkan, atau melacak: string yang ditampilkan di halaman adalah string di dalam gambarnya.
- **PNG-nya dibuat dari SVG yang ada di layar.** Unduhannya bukan penggambaran kedua yang mungkin berbeda dari pratinjaunya. Markah yang sama diserahkan ke peramban dan dicat ke sebuah kanvas, dan itu juga sebabnya hal itu bisa dilakukan tanpa menghubungi apa pun: tidak ada font untuk diambil dan tidak ada gambar untuk dimuat di dalamnya.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi apa pun yang Anda ketik. Setiap baris yang mengubah sebuah string menjadi sebuah kode disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/qr-encode.js` dan `src/qr.js` untuk kode QR-nya sendiri — mode, versi, dan bloknya di yang satu, dan pola, masker, serta bit formatnya di yang lain — `src/gf256.js` untuk koreksi galatnya, dan `src/barcode.js` untuk yang bergaris-garis.
