# Pembaca QR & Barcode — pindai kode QR dari sebuah gambar atau kamera Anda

Arahkan ke sebuah kode, atau jatuhkan gambarnya. Ia dibaca di sini, dan tidak di tempat lain.

> Baca kode QR dari sebuah foto, tangkapan layar, atau kamera Anda, dan lihat persis ke mana tautannya pergi sebelum Anda membukanya. Barcode EAN, UPC, Code 128, Code 39, dan ITF juga. Tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/pindai-kode-qr/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## gambar dan kode di dalamnya Anda **tidak pernah diunggah**. Tidak ada server.

Membaca sebuah kode adalah hitungan atas piksel, dan pikselnya sudah ada di sini. Menemukan simbolnya, membetulkan sudutnya, membuka maskernya, memperbaiki kerusakannya dengan Reed-Solomon, dan membaca bitnya kembali semuanya terjadi di sekitar dua ribu baris JavaScript di halaman ini yang bisa Anda baca. **Kameranya adalah janji yang sama, bukan pengecualiannya:** sebuah bingkai datang sebagai piksel di tab ini, diperiksa, lalu hilang. Tidak ada yang direkam, tidak ada yang disimpan, dan halaman ini tidak punya fitur jaringan dalam bentuk apa pun untuk mengirimnya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tidak ada yang direkam
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara membaca kode QR tanpa mengunggah gambarnya

1. **Berikan gambarnya.** Jatuhkan sebuah foto atau tangkapan layar ke kotaknya, tempelkan langsung, atau tekan tombol kameranya. Beberapa sekaligus tidak masalah — masing-masing dibaca sendiri dan masing-masing mendapat jawabannya sendiri. Tangkapan layar dari kode yang sudah ada di layar Anda adalah jalan masuk tercepat dan paling bisa diandalkan, karena tidak ada lensa, tidak ada sudut, dan tidak ada cahaya yang terlibat.
2. **Masukkan seluruh simbolnya ke dalam bingkai, marginnya termasuk.** Ruang putih di sekeliling sebuah kode adalah bagian dari kodenya: begitulah cara sebuah pembaca menemukan di mana simbolnya berakhir. Foto yang dipangkas sampai ke tepi kotak-kotaknya adalah alasan tunggal yang paling umum sebuah kode tidak terbaca, dan mengisi sekitar separuh bingkai dengan kodenya kira-kira pas — lebih dekat dari itu dan sudut-sudutnya jatuh di luar gambar.
3. **Baca alamatnya sebelum Anda memutuskan apa pun.** Maksud memindai sebuah kode di poster, mesin parkir, atau surat adalah untuk tahu ke mana ia pergi, dan itulah satu hal yang sebenarnya tidak diizinkan kamera ponsel Anda lakukan. Host-nya dicetak di sini di barisnya sendiri. Kalau itu bukan nama yang Anda harapkan, Anda sudah mendapat apa yang Anda cari dan tidak ada lagi yang perlu dibuka.
4. **Anggap serius peringatannya, terutama yang tenang.** Alamat `http://` polos, nama dalam abjad yang bukan abjad yang tampak, sebuah pemendek tautan, atau apa pun sebelum sebuah `@` di alamatnya — masing-masing disebutkan di tempat ia muncul. Tidak satu pun membuktikan apa-apa sendirian. Semuanya sepadan dengan sepuluh detik sebelum Anda pergi ke sana.
5. **Kalau tidak mau terbaca, ubah cahayanya sebelum mengubah yang lain.** Hampir setiap kegagalan adalah masalah ambang: pantulan melintang di tengah, bayangan di salah satu sudut, atau layar yang difoto dari sudut yang menangkap cahaya latarnya. Bergeserlah supaya silaunya lepas dari kodenya, atau nyalakan lampu kameranya. Kalau tetap gagal, ambil satu foto datar dari depan dan jatuhkan itu — gambar diam mendapat pencarian yang jauh lebih menyeluruh daripada yang bisa didapat sebuah bingkai langsung.
6. **Periksa gambar sampelnya kalau jawabannya tampak ganjil.** Buka “bagaimana yang satu ini dibaca” dan lihat kisi kecilnya. Itulah yang diyakini halaman ini sebagai kodenya, digambar kembali dari modul yang disampelnya. Pembaca yang salah membaca sebuah simbol lalu memperbaikinya menjadi sesuatu yang masuk akal akan memperlihatkannya di sana, dan tidak di tempat lain.

## Versi lebih lengkap

[Cara membuat kode QR dan membuktikannya terbaca](https://abox.tools/id/panduan/membuat-kode-qr-dan-membuktikannya-terbaca/): Buat kodenya, lalu periksa dengan pembaca dari situs yang sama: isi persisnya, tautan sebenarnya, pada ukuran cetak dan dari sebuah foto, sebelum naik cetak. Semuanya di peramban, tidak ada yang diunggah.

## Juga ada di dalam kotak

- [Hash dan Checksum](https://abox.tools/id/hitung-checksum/): Periksa sebuah unduhan terhadap angka yang dicetak penerbitnya, tanpa mengirimnya ke siapa pun.
- [Pembuat Kata Sandi dan Frasa Sandi](https://abox.tools/id/pembuat-kata-sandi/): Dibuat di sini, oleh peramban Anda sendiri, dan tidak pernah dikirim ke mana pun. Tidak ada yang disimpan dan tidak ada riwayat.
- [Pemformat JSON](https://abox.tools/id/format-json/): JSON, XML, HTML, CSS, dan YAML, diformat atau diubah. Tidak ada yang ditempelkan ke server orang lain.
- [Pengubah YAML ke JSON](https://abox.tools/id/konversi-yaml-ke-json/): Dua arah, dan ia menyebutkan biaya masing-masing. Tidak ada satu pun yang ditempel ke server orang lain.

## Pertanyaan

### Apakah gambarnya diunggah ke suatu tempat?

Tidak, dan begitu juga apa pun yang dibaca darinya. Gambarnya didekodekan ke sebuah kanvas di halaman ini dan dibaca di sana, oleh JavaScript yang disajikan dari situs ini. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik kami. Bukti yang paling gamblang adalah memutuskan koneksi internet: ia terus bekerja.

### Apakah kameranya merekam sesuatu?

Tidak. Sebuah bingkai kamera datang sebagai piksel di tab ini, digambar ke sebuah kanvas, diperiksa, lalu ditimpa oleh bingkai berikutnya sekitar sepersepuluh detik kemudian. Tidak ada yang ditulis ke disk dan tidak ada yang disimpan. Alirannya berhenti pada saat Anda menekan berhenti, ketika tabnya masuk ke latar belakang, dan ketika Anda meninggalkan halamannya — dan lampu di kamera Anda adalah penanda yang layak dipercaya, karena tidak ada halaman yang bisa mematikannya.

### Kenapa ia menunjukkan tautannya alih-alih membukanya?

Karena itulah bagian yang berguna. Sebuah kode QR adalah alamat yang tidak bisa Anda baca, dan itulah seluruh alasan sebuah stiker di atas kode pada mesin parkir berhasil: pada saat Anda tahu ke mana ia pergi, Anda sudah di sana. Di sini teksnya dicetak utuh, host-nya disebutkan di barisnya sendiri, dan membukanya adalah tombol terpisah yang Anda tekan setelah membacanya. Itu satu klik tambahan dan itulah klik yang selalu dibutuhkan format ini.

### Apa saja yang bisa dibacanya?

Kode QR di setiap versi dari 1 sampai 40, pada keempat tingkat koreksi galatnya, dalam mode numerik, alfanumerik, byte, dan kanji, dengan set karakter ECI dan simbol structured-append yang dilaporkan alih-alih dibuang diam-diam. Di sisi yang bergaris: EAN-13, EAN-8, UPC-A, UPC-E, ITF-14, Interleaved 2 of 5, Code 128, dan Code 39. Ia tidak membaca Data Matrix, PDF417, Aztec, atau MaxiCode.

### Kode saya tidak mau terbaca. Apa yang salah?

Sembilan dari sepuluh kali penyebabnya salah satu dari tiga hal. Margin putihnya terpangkas, padahal sebuah pembaca memakai margin itu untuk menemukan di mana simbolnya berakhir. Ada pantulan atau bayangan melintang di sebagian kodenya, sehingga tidak ada ambang yang memisahkan kotak gelapnya dari yang terang. Atau kodenya terlalu kecil di bingkainya sehingga modulnya tidak lebih dari satu dua piksel lebarnya. Pindahkan cahayanya, isi sekitar separuh bingkai, dan ambil gambarnya dari depan alih-alih dari sudut.

### Bisakah ia membaca kode yang rusak atau tertutup sebagian?

Sering kali bisa, dan itu formatnya yang bekerja sebagaimana dirancang, bukan kepintaran apa pun di sini. Setiap kode QR membawa data periksa Reed-Solomon, dan simbol yang dibuat pada tingkat H bisa kehilangan sekitar 30% modulnya dan tetap dibangun ulang dengan persis. Halaman ini mengatakan berapa banyak codeword yang harus diperbaikinya di bawah “bagaimana yang satu ini dibaca”, jadi Anda bisa melihat seberapa dekat ia dengan batasnya. Yang tidak akan dilakukannya adalah menebak: simbol yang rusak melampaui yang bisa ditanggung pemeriksaannya dilaporkan tidak terbaca alih-alih dijawab keliru.

### Kenapa ia bilang tidak bisa memberi tahu ke mana tautan bit.ly saya pergi?

Karena mencari tahu berarti bertanya kepada bit.ly, dan itu sebuah permintaan jaringan. Setiap klaim lain di halaman ini bertumpu pada tidak adanya kode di sini yang menghubungi apa pun, dan diam-diam membuat pengecualian untuk yang satu ini akan lebih tidak berharga daripada jawabannya. Jadi pemendeknya disebutkan, dan apa yang disembunyikannya dibiarkan jujur tidak diketahui. Kalau Anda ingin menyelesaikannya, tempelkan ke sesuatu yang memang bersedia mengambil.

### Apakah memindai kode QR itu aman?

Memindainya aman. Menindaklanjutinya itulah risikonya, dan risikonya nyata: kode yang ditempel di atas kode asli pada mesin parkir, di meja restoran, dan di kartu pengiriman paket kini cukup umum sampai punya nama sendiri. Yang membuatnya berhasil adalah tidak ada orang yang bisa membaca sebuah kode dengan memandanginya. Membacanya tanpa membukanya — dan itulah yang dilakukan halaman ini — melenyapkan seluruh keuntungan itu, dan sepuluh detik yang dibutuhkan untuk melihat host-nya adalah seluruh pertahanannya.

### Kisi kecil di bawah setiap hasil itu apa?

Modul yang benar-benar disampel halaman ini dari gambar Anda, digambar kembali dengan satu kotak per modul. Ia ada di sana supaya pembacaannya bisa diperiksa dengan mata alih-alih dipercaya: kalau kisi itu tampak seperti kode yang Anda foto, jawaban di atasnya datang dari piksel yang benar. Hampir tidak ada pembaca yang menunjukkan ini kepada Anda, dan itulah bedanya alat yang bisa Anda periksa dengan alat yang harus Anda percayai.

### Apakah ia membaca beberapa kode dalam satu gambar?

Satu per gambar, untuk saat ini. Jatuhkan beberapa gambar sekaligus dan masing-masing dibaca sendiri, dan kameranya membaca kode demi kode saat Anda menggerakkannya, menyimpan setiap kode baru yang belum dilihatnya. Satu foto berisi selembar penuh kode adalah pekerjaan untuk memangkasnya, atau untuk mengarahkan kameranya satu per satu.

### Kenapa ia bilang barcode saya formatnya berbeda dari yang saya minta?

Karena sebuah barcode tidak membawa namanya sendiri. UPC-A adalah EAN-13 yang digit pertamanya nol, ITF-14 adalah Interleaved 2 of 5 dengan empat belas digit dan digit periksa yang sah, dan Code 128 dalam mode numeriknya tidak mirip apa pun yang lain. Yang dilaporkan halaman ini adalah apa yang dikatakan garis-garisnya ditambah apa yang dikukuhkan digit periksanya, dan itu sebanyak yang diketahui simbolnya sendiri.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia terus bekerja, kamera dan semuanya. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: pembaca yang mengirim gambar Anda pergi untuk didekodekan akan berhenti pada saat Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Gambarnya tidak pernah diunggah, dan kameranya bukan pengecualian.** Foto yang Anda jatuhkan di sini didekodekan ke sebuah kanvas di halaman ini dan dibaca di sana. Sebuah bingkai kamera adalah hal yang sama yang datang tiga puluh kali sedetik: ia digambar ke kanvas itu, diperiksa, lalu ditimpa oleh yang berikutnya. Tidak ada bingkai yang direkam, tidak ada yang disimpan, dan lampu kamera yang padam saat Anda menekan berhenti adalah seluruhnya.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`, dan `Content-Security-Policy` halaman ini tidak menyisakan satu alamat pun yang bisa dikirimi asal ini seandainya pun ada. Itulah sebabnya halaman ini tidak bisa memberi tahu Anda ke mana sebuah tautan pendek berakhir: mencari tahu berarti bertanya, dan ia tidak bertanya.
- **Ia menunjukkan alamatnya kepada Anda. Ia tidak pernah membukanya.** Sebuah kode QR tercetak adalah alamat yang tidak bisa dibaca siapa pun, dan justru itulah yang membuat sebuah stiker di atasnya sepadan dengan repotnya seseorang. Tidak ada yang dibuka di sini. Seluruh teksnya dicetak untuk Anda lihat, host yang sebenarnya akan dituju disebutkan tersendiri, dan trik yang membuat satu alamat tampak seperti yang lain — nama pengguna sebelum sebuah `@`, nama yang ditulis dalam aksara yang hurufnya berbentuk seperti huruf kita, sebuah pengalihan — disebutkan di tempat ia muncul.
- **Ia juga menunjukkan apa yang disampelnya.** Di bawah setiap hasil QR ada gambar modul yang benar-benar dibaca halaman ini dari foto Anda. Kalau ia tampak seperti kode yang Anda pindai, jawaban di atasnya sehat; kalau ia tampak seperti semut di layar, tidak. Tidak ada pembaca yang hanya menyerahkan sebuah teks dan tidak lebih yang bisa diperiksa seperti itu.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi sebuah gambar, sebuah bingkai, atau apa pun yang dibaca darinya. Setiap baris yang mengubah piksel menjadi teks disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, kamera termasuk, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/binarize.js` dan `src/detect.js` untuk menemukan sebuah simbol di dalam sebuah foto — ambangnya, pola pencarinya, dan transformasi perspektifnya — `src/qr-decode.js` untuk membacanya kembali, `src/reed-solomon.js` untuk memperbaiki yang salah terbaca, `src/linear.js` untuk yang bergaris, dan `src/camera.js`, yang berisi setiap baris di halaman ini yang menyentuh sebuah kamera.
