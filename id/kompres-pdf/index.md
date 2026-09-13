# Kompres PDF — perkecil ukuran PDF

Perkecil sebuah dokumen tanpa mengirimnya ke mana pun.

> Perkecil ukuran PDF tanpa mengunggahnya. File dibaca, dikompres ulang, dan ditulis kembali oleh peramban Anda sendiri, dan alat ini menunjukkan di mana ukurannya sebenarnya berada sebelum menyentuh apa pun.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/kompres-pdf/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## dokumen Anda **tidak pernah diunggah**. Tidak ada server.

Dokumen dibuka, dibongkar, dan ditulis kembali di memori mesin ini, oleh kode yang disajikan dari alamat ini. Tidak ada di sini yang bisa melakukan unggahan, dan tidak ada server di ujung lain halaman ini untuk menerimanya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ File tetap di perangkat Anda

## Cara memperkecil ukuran PDF

1. **Pilih sebuah PDF.** Jatuhkan ke pemilih file atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Lihat di mana ukurannya berada.** Rincian inilah inti dari langkah kedua. Kalau batangnya sebagian besar gambar, alat ini punya sesuatu untuk dikerjakan. Kalau sebagian besar berupa font dan isi halaman, ia akan mengatakannya, dan penghematan yang jujur hanya beberapa persen — lebih baik tahu itu sebelum Anda menghabiskan satu menit.
3. **Sebutkan seberapa keras memerasnya.** Pilihan yang diberi nama itu adalah resolusi, bukan nilai yang samar: 96 DPI untuk dibaca di layar, 130 untuk dikirim lewat email, 220 untuk sesuatu yang masih harus dicetak. Masing-masing diukur terhadap seberapa besar gambar itu sebenarnya digambar di halaman, sehingga foto yang ditempatkan sebagai gambar mini tidak diperlakukan seperti pindaian satu halaman penuh.
4. **Kompres, lalu periksa baris yang mengatakan bahwa hasilnya sudah diperiksa.** Setelah penulisan ulang selesai, file yang sudah jadi dibuka lagi oleh pembaca yang sama di halaman ini dan halamannya dihitung. Kalau itu tidak cocok dengan aslinya, prosesnya dilaporkan gagal dan tidak ada unduhan yang ditawarkan.

## Versi lebih lengkap

[Cara memperkecil ukuran PDF, dan kenapa sebagian tidak mau menyusut](https://abox.tools/id/panduan/perkecil-ukuran-pdf/): Di mana sebenarnya ukuran sebuah PDF berada, kenapa sebuah pindaian menyusut 80% sementara sebuah kontrak nyaris tidak bergerak, apa arti DPI di sini, dan apa yang tidak boleh dilakukan sebuah kompresor pada dokumen Anda.

## Juga ada di dalam kotak

- [Penyensor PDF](https://abox.tools/id/sensor-pdf/): Hurufnya dihapus dari file-nya, dan file-nya dicari sesudahnya untuk membuktikannya.
- [Gambar ke PDF](https://abox.tools/id/gambar-ke-pdf/): Masukkan gambar Anda ke dalam satu dokumen.
- [Pemindai Dokumen](https://abox.tools/id/pemindai-dokumen/): Foto halamannya. Dapatkan sesuatu yang tampak seperti hasil pindaian.
- [Ekstrak Audio dari Video](https://abox.tools/id/ekstrak-audio-dari-video/): Jatuhkan sebuah video dan ambil suaranya. Gambarnya tidak pernah didekode, dan tidak ada yang diunggah.

## Pertanyaan

### Apakah PDF saya diunggah ke suatu tempat?

Tidak. File dibaca, dikompres ulang, dan ditulis oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Alat ini sama sekali tidak punya fitur jaringan opsional.

### Seberapa kecil PDF saya nanti?

Sepenuhnya tergantung isinya, dan itulah sebabnya alat ini mengukur dan menunjukkannya kepada Anda sebelum mengompres apa pun. Dokumen hasil pindaian hampir seluruhnya berupa foto dan biasanya menjadi ⁦60–90⁩% lebih kecil. Sebuah kontrak atau skripsi berisi teks, gambar vektor, dan font tertanam, yang semuanya sudah dikompres oleh apa pun yang membuatnya; di situ penghematannya biasanya beberapa persen saja, dari mengemas ulang file dan membuang yang tidak lagi dirujuk. Alat mana pun yang menjanjikan persentase tetap tanpa melihat file Anda sedang menebak.

### Apakah mengompres PDF menurunkan kualitas?

Gambar di dalamnya dikodekan ulang, jadi ya, untuk bagian itu. Tidak ada yang lain disentuh: teks tetap teks, bisa dipilih dan dicari, font tetap utuh, dan gambar vektor disalin persis. Alat ini juga menolak membuat sebuah gambar lebih buruk tanpa hasil — kalau pengodean ulang ternyata tidak lebih kecil dari aslinya, byte aslinya dikembalikan ke dokumen tanpa disentuh.

### Apa itu DPI di sini, dan kenapa ditanyakan?

Sebuah PDF mencatat seberapa besar setiap gambar digambar di halaman, sehingga alat ini bisa menghitung resolusi efektifnya: pindaian 4000 piksel yang ditempatkan selebar delapan inci kertas membawa 500 piksel per inci. Tidak ada layar dan sangat sedikit kertas yang bisa memakainya, jadi piksel di atas setelan yang Anda pilih dibuang lebih dulu — piksel itu memakan kualitas yang tidak bisa dilihat siapa pun. Pengukuran itulah sebabnya logo yang ditempatkan kecil tidak diperlakukan sama dengan pindaian satu halaman penuh.

### Bisakah ia membuka PDF yang dilindungi kata sandi?

Tidak, dan itu disengaja. Dokumen terenkripsi ditolak dengan pesan yang mengatakannya, bahkan ketika kata sandinya kosong — dan begitulah banyak pemindai serta mesin fotokopi menyimpan. Melepas proteksi sebuah file adalah pekerjaan yang berbeda dari mengompresnya, dan alat yang melakukannya diam-diam berarti melakukan sesuatu yang tidak Anda minta.

### Adakah PDF yang tidak bisa dikompresnya?

Sebagian gambar di dalamnya, ya. Gambar JPEG 2000, JBIG2, dan berkode faks (CCITT) tidak punya dekoder di peramban mana pun, jadi mereka dilewatkan tanpa disentuh dan dilaporkan sebagaimana adanya — dua yang terakhir adalah kodek dua tingkat dan biasanya memang sudah mendekati ukuran terkecilnya. Gambar CMYK juga dibiarkan, karena mengodekannya ulang berisiko menggeser warna yang akan dihasilkan pencetak. Semua yang dilewati alat ini disebutkan namanya di hasil, beserta alasannya.

### Apakah file hasil kompresi masih bisa dibuka di mana-mana?

Ya. Keluarannya ditulis sebagai PDF 1.5, yang dipahami setiap pembaca yang dirilis sejak 2003, dan alat ini membuktikannya di perangkat Anda sendiri: ia membuka lagi file yang sudah jadi dan menghitung halamannya sebelum menawarkannya kepada Anda. Formulir, tautan, markah, struktur aksesibilitas, dan lampiran tertanam ikut terbawa; yang ditinggalkan adalah materi yang tidak lagi dirujuk apa pun di dalam dokumen.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada batas ukuran file selain yang diizinkan memori perangkat Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang dokumen Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim dokumen Anda ke tempat lain untuk dikompres akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Dokumen Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Alat ini tidak menambahkan apa pun ke daftar itu: ia tidak punya fitur jaringan sendiri, bahkan yang opsional sekalipun. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Seluruh formatnya ada di repositori ini.** Sebuah PDF adalah daftar objek dan tabel yang mencatat di mana setiap objek dimulai. `src/objects.js` membaca sintaksisnya, `src/reader.js` mengikuti tabelnya, `src/writer.js` menulis yang baru, dan tidak satu pun dari ketiganya mengimpor sesuatu yang bisa membuat permintaan. Tidak ada pustaka yang diambil dan tidak ada yang digambar di server.
- **File terenkripsi ditolak, bukan dibuka.** PDF dengan kata sandi ditolak, termasuk jenis yang dihasilkan pemindai dengan kata sandi kosong dan yang secara teknis akan terbuka. Melepas proteksi sebuah dokumen adalah pekerjaan yang berbeda dari memperkecilnya, dan melakukannya diam-diam akan menjadi hal yang mengejutkan bagi sebuah alat yang bertindak atas nama Anda.
- **Ia mengeluarkan hal-hal, bukan memasukkan.** File yang sudah jadi tidak membawa tanggal pembuatan, tidak ada baris produser, dan tidak ada nama alat yang membuatnya. Dengan kotaknya dicentang, ia juga kehilangan paket XMP dan blok-blok privat yang ditinggalkan aplikasi tata letak — argumen yang sama dengan alat EXIF, diterapkan pada wadah yang berbeda.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang dokumen Anda: bukan file, bukan halaman, bukan nama, ukuran, atau jumlah halaman. Setiap baris yang membaca, mendekode, atau menulis PDF disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau dokumen Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju adalah situs milik orang lain.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap berfungsi. Itulah bukti yang paling sederhana: alat yang mengirim dokumen Anda ke tempat lain untuk dikompres akan berhenti.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, dan `src/reader.js` serta `src/writer.js` untuk seluruh proses pembacaan dan penulisan ulang, yang keduanya tidak bisa menjangkau jaringan.
