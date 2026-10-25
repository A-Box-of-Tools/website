# Cara menyensor PDF supaya teksnya sungguh hilang

Persegi hitam di atas sebuah nama dan sebuah nama yang sudah dihapus tampak identik di layar. Salah satunya selamat ketika dipilih dan disalin. Inilah bedanya, tempat-tempat sebuah kata bersembunyi yang sama sekali bukan di halamannya, dan pemeriksaan tiga puluh detik yang memberi tahu Anda punya yang mana dari keduanya.

[Buka Penyensor PDF](https://abox.tools/id/sensor-pdf/): Hurufnya dihapus dari file-nya, dan file-nya dicari sesudahnya untuk membuktikannya.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Penyensor PDF](https://abox.tools/id/sensor-pdf/), jatuhkan dokumennya, ketik kata-kata yang harus hilang, centang yang Anda maksud, lalu tekan “Keluarkan”. Hurufnya dihapus dari instruksi menggambar halamannya sendiri, kata yang sama dikeluarkan dari markah, komentar, kolom formulir, dan properti dokumennya, dan file jadinya dibuka lagi lalu dicari di hadapan Anda sebelum ia ditawarkan kepada Anda.

Semua di bawah ini adalah kenapa anak kalimat terakhir itu yang penting, dan bagaimana mengetahui apakah alat yang sudah Anda pakai bisa mengatakan hal yang sama.

## Kegagalan yang menjadi pokok bahasan ini

Gambar sebuah persegi hitam di atas sebuah nama di sebuah pembaca PDF. Yang Anda lihat adalah sebuah nama dengan persegi hitam di atasnya. Yang *disimpan* kebanyakan pembaca adalah sebuah dokumen yang memuat namanya dan, secara terpisah, sebuah persegi dengan sebuah posisi, sebuah ukuran, dan sebuah warna.

Persegi yang digambar begitu adalah sebuah **anotasi**: sebuah objek yang duduk di sebelah halamannya alih-alih di dalamnya. Teks di bawahnya persis seperti sebelumnya. Pilih areanya lalu tekan salin, atau jalankan pengekstrak teks apa pun di atas file-nya, atau buka di sebuah program yang menggambar anotasi secara berbeda, dan namanya kembali. Tidak ada apa pun di layar yang membedakan itu dari penyensoran sungguhan, dan persis itulah sebabnya hal ini terus menimpa organisasi yang memperkerjakan pengacara.

Ia sudah menerbitkan berkas pengadilan, penilaian intelijen, kontrak, dan — pada Desember 2025 — nama-nama yang dihitamkan di sebuah rilis besar dokumen Departemen Kehakiman Amerika Serikat, yang terbaca dalam hitungan jam setelah penerbitannya. Polanya selalu sama. Perseginya adalah anotasinya, dan anotasinya tidak pernah teksnya.

## Apa yang dilakukan penyensoran sungguhan sebagai gantinya

Sebuah halaman di dalam PDF adalah sebuah daftar instruksi: setel fon ini, pindahkan penanya ke sini, gambar glif ini. Kata-kata di halamannya ada di tepat satu tempat, sebagai operan instruksi menggambar itu:

```
BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET
```

Menyensor namanya berarti **menghapus huruf itu dari instruksi itu** lalu menuliskan halamannya kembali. Setelah itu tidak ada yang bisa dipulihkan, bukan karena file-nya menyembunyikannya dengan baik melainkan karena hurufnya tidak ada di file-nya. Tidak ada persegi dengan sesuatu di bawahnya, karena tidak ada apa pun di bawahnya.

Satu hal harus ditaruh kembali, atau hasilnya kelihatan keliru. Teks digambar dengan memajukan sebuah pena melintasi halamannya, jadi menghapus lima huruf menarik sisa barisnya lima huruf ke kiri: kolomnya berhenti sejajar dan totalnya menggeser ke bawah judul yang salah. Alat yang melakukan ini dengan benar mengukur seberapa jauh huruf yang dibuang itu akan memajukan penanya lalu menaruh jarak itu kembali sebagai instruksi jarak, yang memindahkan penanya tanpa menggambar apa pun.

Kotak hitamnya, kalau ada, digambar *sesudahnya*, di atas sebuah celah yang sudah kosong. Ia sebuah kesopanan bagi siapa pun yang membaca dokumennya — sebuah tanda bahwa ada yang dikeluarkan — dan bukan penyensorannya. Itulah seluruh perbedaannya dalam satu kalimat: pada penyensoran sungguhan, kotaknya hiasan; pada yang palsu, kotaknya *adalah* penyensorannya.

![Kartu pencarian: dua istilah diketikkan, dengan jumlah kecocokan dan daftar setiap tempat kemunculannya di dokumen.](https://abox.tools/screens/redact-a-pdf/find.webp)

Anda menyebut apa yang harus hilang dan alat ini menemukan setiap kemunculannya, termasuk yang di halaman tiga yang tak seorang pun ingat.

## Empat tempat sebuah kata bersembunyi yang bukan halamannya

Inilah bagian yang menjebak orang yang sudah mengerjakan bagian pertamanya dengan benar. Sebuah PDF membawa teks di beberapa tempat sekaligus, dan sebuah pembaca akan menampilkan, mencari, atau menyalin semuanya. Membuang sebuah nama dari halamannya lalu meninggalkannya di salah satu tempat ini berarti belum membuangnya.

- **Properti dokumennya.** Judul, penulis, dan nama file asal ekspornya. Dokumen yang halamannya sudah dikeluarkan sebuah nama tapi propertinya masih berbunyi `Smith settlement draft 3.docx` belum disensor. Biasanya ada salinan kedua informasi yang sama di sebuah paket XMP, yang juga harus hilang.
- **Markah.** Kerangka di sisi sebuah pembaca adalah sebuah daftar judul dengan nomor halaman terlampir — dan sebuah judul adalah sebaris teks yang tidak dikendalikan apa pun di halamannya.
- **Kolom formulir dan komentar.** Apa yang diketik seseorang ke dalam sebuah formulir disimpan dua kali: sekali sebagai nilai kolomnya dan sekali sebagai tampilan yang digambar pembacanya. Keduanya harus hilang. Catatan tempel membawa teksnya dan nama siapa pun yang menulisnya.
- **Teks penggantinya.** Sebuah PDF boleh menyatakan bahwa serangkaian glif “mengeja” sesuatu yang lain, sehingga sebuah ligatur atau baris bertanda hubung tersalin sebagai kata yang diwakilinya. Artinya sebuah dokumen bisa menampilkan satu hal lalu menyerahkan hal lain kepada pembacanya pada Ctrl+C, dan penyensoran yang hanya membuang yang tergambar akan meninggalkan kalimatnya utuh bagi siapa pun yang memilih paragrafnya.

Lampiran adalah yang kelima. Sebuah PDF bisa membawa file utuh lain di dalamnya, dan tidak ada yang Anda lakukan pada halamannya yang menyentuhnya.

![Kartu halaman: teks satu halaman, diambil dan bisa diseleksi, dengan istilah yang ditemukan disorot.](https://abox.tools/screens/redact-a-pdf/page.webp)

Inilah bagian yang mengejutkan orang. PDF bukan gambar: kata-katanya bisa diseleksi, dicari, dan disalin oleh siapa pun yang menerimanya.

## Bagaimana memeriksa sebuah file, dalam tiga puluh detik

Lakukan ini pada apa pun yang hendak Anda kirim, alat apa pun yang menghasilkannya. Inilah pemeriksaan yang akan menangkap setiap satu dari kegagalan yang sudah terbit itu.

1. **Buka file jadinya lalu tekan Ctrl+F** (Cmd+F di sebuah Mac). Cari kata yang Anda buang. Penyensoran sungguhan tidak mengembalikan apa pun. Kalau pembacanya melompat ke sebuah persegi hitam, katanya masih ada di sana dan perseginya sedang duduk di atasnya.
2. **Pilih area yang dihitamkan lalu salin.** Seret melintasi perseginya, tekan Ctrl+C, lalu tempelkan ke sebuah kotak teks. Kalau ada yang tiba, Anda menemukan kegagalan yang sama dari arah sebaliknya.
3. **Pilih seluruh dokumennya lalu salin itu.** Ctrl+A lalu Ctrl+C, tempelkan ke penyunting teks mana pun, lalu baca apa yang keluar. Inilah yang paling berguna dari ketiganya, karena ia menunjukkan dokumennya kepada Anda sebagaimana dilihat sebuah pengekstrak teks — termasuk teks yang tidak pernah Anda tahu ada di sana, dan pada halaman hasil pindaian itu umum.
4. **Lihat propertinya** — File → Properties di kebanyakan pembaca — dan panel markahnya. Keduanya tempat sebuah nama selamat dari penyensoran yang sempurna di halamannya.

[Penyensor PDF](https://abox.tools/id/sensor-pdf/) menjalankan yang pertama dan yang ketiga untuk Anda lalu menampilkan hitungannya, karena alat yang menegaskan bahwa ia sudah membuang sesuatu bukanlah bukti dan sebuah pencarian atas file jadinya adalah bukti.

## Dokumen hasil pindaian adalah masalah yang berbeda

Pindaian adalah foto sebuah halaman. Kata-kata di atasnya adalah piksel, bukan teks, dan menyunting lapisan teksnya sebanyak apa pun tidak menyentuhnya — karena tidak ada lapisan teks, atau karena yang ada di sana menggambarkan gambarnya alih-alih menjadi gambarnya.

Kebanyakan pemindai dan alat PDF masa kini menambahkan lapisan teks tak kasatmata di atas gambarnya, ditulis pengenalan karakter optis, supaya halamannya bisa dicari. Lapisan itu teks yang sungguhan dan bisa dibuang. Membuangnya layak dilakukan: itulah yang akan ditemukan sebuah pencarian, sebuah salinan, dan setiap sistem otomatis yang membaca dokumen. Ia tidak mengubah apa pun tentang gambarnya, yang di dalamnya kata-katanya tetap terbaca sempurna oleh siapa pun yang memandangi halamannya.

Jadi untuk sebuah pindaian, urutan yang jujur adalah: keluarkan kata-katanya dari lapisan teksnya, lalu tangani gambarnya secara terpisah — dan itu berarti menimpa piksel. Itulah yang dilakukan [penyensor gambar](https://abox.tools/id/panduan/sensor-gambar/), dan panduan di sebelahnya menjelaskan kenapa sebuah pemburaman atau mosaik tidak cukup baik untuk teks.

## Kenapa tidak dicetak saja lalu dipindai ulang

Karena ia berhasil, dan ia mengorbankan semua yang lain dari Anda. Mencetak halaman yang sudah disensor lalu memindainya kembali memang menghasilkan dokumen tanpa lapisan teks yang bisa bocor — dan sebuah dokumen yang tidak bisa dicari siapa pun, tidak bisa dibaca pembaca layar mana pun, yang lima sampai lima puluh kali ukurannya, dan yang kualitasnya terserah suasana hati pemindai kantornya. Ia juga bertumpu pada halamannya tercetak sebagaimana ia tampak: sebuah anotasi bisa ditandai supaya tampil di layar dan tidak di kertas, dan ketika itulah kotak hitam Anda, lembar yang keluar dari pencetaknya ada namanya.

Argumen yang sama berlaku untuk “ratakan menjadi gambar”, yang ditawarkan sebagian alat sebagai penyensoran. Ia mengubah setiap halaman menjadi foto dirinya sendiri. Kalau kata-katanya ditutupi alih-alih dihapus, penutupannya kini permanen — tapi semua yang lain tentang dokumennya ikut hilang, dan file yang Anda kirim adalah file yang tidak bisa dikerjakan siapa pun.

## Kenapa ini pekerjaan yang paling tidak layak diunggah

Sebuah layanan penyensoran harus diberi file yang belum disensor. Itulah seluruh transaksinya: versi pribadinya tiba lebih dulu, utuh, dan menjadi versi yang ada di disk orang lain. Apa pun yang dikatakan kebijakan privasinya, urutannya tidak bisa dibantah — dokumen yang Anda hati-hatikan adalah dokumen yang Anda serahkan.

Apa yang disensor orang membuat ini lebih buruk daripada kedengarannya. Keterangan saksi, surat medis, rekening koran yang dikirim ke pemilik kontrakan, kontrak yang memuat nama satu klien tapi hendak dikirim ke klien lain, sebuah berkas yang ada alamat rumah di atasnya. Itulah dokumennya, dan persis itulah sebabnya alat untuk mereka tidak boleh punya server di ujung lainnya.

Semua di [penyensor situs ini](https://abox.tools/id/sensor-pdf/) terjadi di peramban Anda sendiri: file-nya dibaca, disunting, ditulis, dan diperiksa di mesin Anda, dan kata yang Anda cari juga tidak pernah meninggalkan tabnya. Cabut koneksi internet dan ia terus bekerja, dan itu bukti paling sederhana yang ada bahwa tidak ada yang dikirim ke mana pun. Lihat [amankah mengunggah file](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) untuk apa yang sebenarnya dilibatkan sebuah unggahan.
