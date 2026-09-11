# Cara membuat kode QR dan membuktikannya terbaca

Kesalahan QR yang mahal bukan membuat kodenya: melainkan mendapati di lokasi bahwa poster-poster itu terbaca menuju salah ketik. Membuat dan memeriksa adalah dua perkakas di sini, dan menjalankan yang kedua sebelum naik cetak hanya makan satu menit serta menangkap hampir semua yang akan dikirimkan oleh cetakan itu.

[Buka Pembaca QR & Barcode](https://abox.tools/id/pindai-kode-qr/): Arahkan ke sebuah kode, atau jatuhkan gambarnya. Ia dibaca di sini, dan tidak di tempat lain.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

1. **Buat.** Buka [Pembuat QR dan kode batang](https://abox.tools/id/buat-kode-qr/), pilih tugasnya — tautan, jaringan Wi-Fi, kartu kontak — dan periksa untai persis yang akan dimuat kode itu, yang ditampilkan halaman alih-alih disembunyikan. Ekspor SVG untuk cetak, PNG untuk layar.
2. **Cetak satu.** Pada ukuran sebenarnya, di kertas sebenarnya, sebelum cetakan dua ratus lembar.
3. **Buktikan.** Foto cetakan percobaan itu dengan ponsel — dari sudut miring, dalam cahaya tempatnya — dan jatuhkan fotonya ke [Pembaca QR dan kode batang](https://abox.tools/id/pindai-kode-qr/). Ia menampilkan isi hasil dekode dan, untuk tautan, host yang benar-benar ditujunya. Bila itu cocok dengan maksud Anda, cetakan aman.

Kedua perkakas berjalan di peramban Anda dan tidak mengirim apa pun ke mana pun — yang untuk kode Wi-Fi berarti kata sandi di dalamnya tidak pernah diketikkan ke situs orang lain.

![Pembuat QR dengan sebuah alamat diisikan, menampilkan kode jadi beserta faktanya: versinya, tingkat koreksi galatnya, dan berapa ruang yang tersisa.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

Kodenya, jadi.

## Yang sungguh ditangkap pemeriksaan

- **Salah ketik.** Kegagalan paling umum bukan kodenya: melainkan URL di dalamnya. Membaca kembali adalah satu-satunya pemeriksaan yang menguji apa yang benar-benar terkode, bukan apa yang Anda kira telah Anda tempel.
- **Ukuran dan jarak.** Kode yang dipindai dari seberang aula butuh modul lebih besar daripada yang di kartu nama. Memotret cetakan percobaan dari tempat orang akan berdiri adalah ujian yang jujur; tingkat koreksi galat pada pembuat menyebutkan terang-terangan berapa harga masing-masing dalam kepadatan.
- **Warna.** Kode yang dicetak gelap di atas terang terbaca; palet merek berkontras rendah sering kali tidak. Pembaca ini lebih tahan daripada kebanyakan ponsel: bila *ia* saja kesulitan dengan fotonya, ponsel tertua di lobi tak punya peluang sama sekali.
- **Lipatan dan kilau.** Koreksi Reed-Solomon membuat kode yang separuh tertutup masih terbaca — sampai tingkat yang Anda pilih. Poster yang akan menghadapi cuaca pantas mendapat tingkat tertinggi beserta kode yang sedikit lebih rapat sebagai harganya.

![Pembacanya, setelah diberi gambar yang sama: ia melaporkan alamat yang dikandung kode itu, simbologinya, dan di bagian mana gambar itu ia menemukannya.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

Dan gambar yang sama dibaca balik oleh alat yang lain, satu-satunya uji yang menangkap kode yang keluar salah. Pembacanya menampilkan apa yang ditemukan, dan tidak membukanya.

## Pembaca yang sama, untuk kode yang bukan milik Anda

Memeriksa juga merupakan cara aman membuka QR cetakan orang lain. Pembaca menampilkan alamat lengkap dan host yang benar-benar ditujunya *sebelum apa pun terbuka*, dan menyebutkan nama-nama muslihat yang menyamarkan tautan: nama pengguna di depan tanda @, abjad kembaran, pengalihan. Stiker di meteran parkir pantas mendapat pemeriksaan itu; tanda pengenal konferensi juga. Tidak ada yang dibuka atas nama Anda, dan tidak ada hasil pindaian yang dikirim ke mana pun.

## Bila Anda melakukannya setiap minggu

Membuat dan memeriksa tinggal di dua halaman memang disengaja: masing-masing mengerjakan satu tugas, dan masing-masing bisa membuktikan sendiri bahwa tidak ada yang meninggalkan komputer Anda. Namun keduanya open source: lisensi MIT, modul ES tanpa dependensi — pengode milik pembuat dan dekoder Reed-Solomon milik pembaca, masing-masing dengan README yang menjelaskannya.

Bila kode-kode berangkat dari meja Anda setiap minggu, arahkan agen kode ke [repositori](https://github.com/A-Box-of-Tools/website) dan minta satu halaman yang membuat lalu langsung melewatkan kembali kode yang digambar itu melalui dekoder: uji-mandiri pada setiap ekspor. Modul-modul itu ditulis untuk dibaca, dan membawanya pergi adalah persis alasan lisensinya ada.
