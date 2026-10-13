# HEIC ke JPG — ubah foto iPhone

Foto yang dibuat iPhone, dalam format yang bisa dibuka apa saja.

> Ubah foto HEIC dari iPhone menjadi JPG di peramban Anda. Dekodernya berjalan di mesin Anda sendiri: tidak ada yang diunggah, tanpa akun, jalan tanpa internet, dan tanggal serta detail kameranya bisa ikut serta.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/heic-ke-jpg/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## foto Anda **tidak pernah diunggah**. Tidak ada server.

Pendekodeannya berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri. HEIC adalah satu-satunya format gambar yang tidak akan dibuka peramban dengan sendirinya, jadi halaman ini membawa dekodernya serta — sekitar 1,4 MB, disajikan dari situs ini, disimpan di singgahan setelah kunjungan pertama. Itulah alasan utuh mengapa setiap pengubah HEIC lain meminta Anda mengunggah: mereka menaruh kodeknya di sebuah server dan foto Anda harus pergi ke sana. Yang ini menaruh kodeknya di sini saja. Tidak ada fitur jaringan di halaman ini sama sekali, dan tidak ada server di ujung lainnya untuk menerima sebuah foto.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa batas ukuran
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara mengubah foto HEIC menjadi JPG

1. **Pilih foto HEIC Anda.** Jatuhkan ke pemilihnya atau pilih sendiri, langsung dari cadangan sebuah ponsel atau sebuah folder di desktop. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya. Daftarnya mengatakan masing-masing itu apa dan apa isinya.
2. **Periksa apa yang dibawa fotonya.** Setiap baris menyebutkan tanggal pengambilannya, kameranya, dan — dengan warna hijau, karena inilah bagian yang layak diperhatikan — apakah file-nya menyimpan koordinat GPS. Itu dibaca dari wadahnya tanpa mendekodekan gambarnya, jadi tidak ada biayanya dan langsung muncul.
3. **Pilih format, dan putuskan soal detailnya.** JPEG kecuali Anda punya alasan: itulah format yang terbuka di mana saja, dan itulah seluruh maksud pengubahan ini. Penggeser kualitasnya ada di 92, yaitu setelan ketika sebuah foto sulit dibedakan dari aslinya. Kotak centangnya menentukan apakah tanggal, kamera, dan lokasinya ikut serta.
4. **Tekan "Ubah", lalu unduh.** Dekodernya datang pada pengubahan pertama — sekitar 1,4 MB, sekali saja — dan setiap foto sesudah itu didekodekan dan ditulis di mesin Anda sendiri. Satu file memberi Anda sebuah tombol unduh; beberapa file memberi Anda sebuah zip juga.

## Versi lebih lengkap

[Foto yang disimpan ponsel Anda, dan format yang tidak mau dibuka apa pun](https://abox.tools/id/panduan/heic-ke-jpg/): iPhone menyimpan foto sebagai HEIC, dan separuh internet tidak bisa membukanya. Format itu apa, kenapa hanya Safari yang mendekodekannya, berapa harga pengubahannya bagi gambarnya, dan bagaimana melakukannya tanpa mengunggah fotonya kepada siapa pun.

## Juga ada di dalam kotak

- [Pembuat Pas Foto](https://abox.tools/id/pas-foto-biometrik/): Pilih negaranya. Ia menerapkan aturan negara itu, persis.
- [Penumpuk Gambar](https://abox.tools/id/tumpuk-gambar/): Dua puluh bingkai menjadi satu, tanpa dua puluh unggahan dan tanpa pengubah RAW.
- [Penyensor Gambar](https://abox.tools/id/sensor-gambar/): Apa yang Anda tutup dihapus dari file-nya, bukan ditutupi di dalamnya.
- [Penampil dan Penghapus EXIF](https://abox.tools/id/hapus-data-exif/): Lihat apa yang dikatakan sebuah foto tentang Anda. Lalu keluarkan.

## Pertanyaan

### Apakah foto saya diunggah ke suatu tempat?

Tidak. File-nya dibaca, didekodekan, dan ditulis oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Satu-satunya yang memang dimuat adalah dekodernya sendiri, dan itu datang dari situs ini, sekali, sebelum foto Anda terlibat sama sekali.

### Kenapa halaman ini mengunduh 1,4 MB pada kali pertama?

Karena HEIC adalah satu-satunya format gambar yang tidak akan dibuka sebuah peramban. Ia adalah sebuah bingkai HEVC di dalam sebuah wadah, dan hanya Safari, di perangkat keras Apple, yang punya dekoder untuknya; Chrome, Firefox, dan Edge langsung menolak file-nya. Jadi sebuah pengubah HEIC butuh dekoder dari suatu tempat, dan ada dua tempat asalnya: sebuah server, atau halamannya. Setiap pengubah lain memilih server, dan itu persis alasan mereka semua butuh foto Anda diunggah. Yang ini membawa `libheif` yang dikompilasi menjadi WebAssembly sebagai gantinya. Ia disajikan dari situs ini, disinggahkan setelah kunjungan pertama, dan itulah seluruh harga dari foto Anda yang tidak pergi ke mana pun.

### Apakah JPEG-nya menyimpan tanggal, kamera, dan lokasinya?

Kalau Anda mau, dan itu sebuah kotak centang di halaman ini. Kalau dibiarkan menyala, blok EXIF-nya disalin dari HEIC-nya dan ditulis ke JPEG-nya persis seperti yang ditulis ponselnya, sehingga foto hasilnya tetap terurut menurut hari pengambilannya alih-alih hari pengubahannya — dan itulah keluhan yang biasa muncul soal pengubah HEIC. Satu tag diubah dan hanya satu: orientasinya, yang disetel ke "tegak", karena rotasinya sudah diterapkan pada pikselnya dan penampil yang menerapkannya sekali lagi akan memiringkan setiap foto potret. Matikan kotak centangnya dan JPEG-nya keluar dengan gambarnya saja dan tidak ada yang lain.

### Apakah ia membuang koordinat GPS?

Ia memberi tahu Anda bahwa koordinatnya ada, lalu melakukan apa pun yang Anda minta. Baris untuk setiap foto mengatakan apakah file-nya membawa koordinat sebelum Anda mengubah apa pun, dan itu lebih dari yang dilakukan ponselnya. Melepas centang "simpan tanggal, kamera, dan setelannya" meninggalkannya di luar JPEG bersama semua yang lain; membiarkannya tercentang membawanya ikut. Kalau yang Anda inginkan adalah menelusuri tagnya dengan rinci, atau membuangnya dari foto yang sudah berupa JPEG, [Penampil & Penghapus EXIF](https://abox.tools/id/hapus-data-exif/) adalah alatnya, dan ia melakukannya tanpa mengompres ulang gambarnya.

### Apakah gambarnya dikompres ulang?

Ya, dan memang harus: HEIC dan JPEG adalah kodek yang berbeda, jadi tidak ada cara berpindah dari satu ke yang lain tanpa mendekodekan gambarnya dan mengodekannya lagi. Yang bisa Anda kendalikan adalah seberapa mahal biayanya. Penggeser kualitasnya secara bawaan di 92, yaitu ketika sebuah foto sangat sulit dibedakan dari aslinya, dan PNG ada di menunya untuk kasus ketika Anda tidak ingin kehilangan apa pun dan tidak keberatan file-nya menjadi lima sampai sepuluh kali lipat ukurannya.

### Bagaimana kalau file-nya bernama .jpg tapi sebenarnya HEIC?

Tetap bekerja. Setiap file yang dijatuhkan di sini dikenali dari byte pertamanya alih-alih dari namanya, karena namanya adalah apa pun yang diputuskan aplikasi terakhir yang menyentuhnya — dan sebuah HEIC yang datang bernama ".jpg" adalah salah satu cara paling umum orang berakhir mencari alat seperti ini. File yang memang sungguh JPEG atau PNG ditolak dengan pesan yang mengatakannya, alih-alih diubah menjadi salinan dirinya sendiri.

### Bisakah ia mengubah sebuah Live Photo, atau sebuah burst?

Gambar diamnya, bisa. Sebuah HEIC bisa menyimpan lebih dari satu gambar, dan setiap yang disimpannya diubah dan dinamai sesuai aslinya dengan sebuah angka di ujungnya. Bagian video dari sebuah Live Photo adalah file terpisah yang disimpan ponselnya di sebelah HEIC-nya, jadi ia tidak ada di sini untuk diubah. Peta kedalaman dan gambar mini ada di dalam wadahnya tapi bukan gambar yang diminta siapa pun, dan dibiarkan saja.

### Kenapa ia tidak mau menerima AVIF saya?

Karena tidak ada yang perlu dilakukan padanya. AVIF adalah wadah yang sama dengan HEIC dengan AV1 di dalamnya alih-alih HEVC, dan setiap peramban masa kini mendekodekannya secara bawaan — jadi sebuah pengubah akan mengirimkan satu megabita mesin untuk menyelesaikan masalah yang tidak Anda punya. Kalau Anda butuh sebuah AVIF sebagai JPEG, [Kompresor Gambar](https://abox.tools/id/kompres-gambar/) dan [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/) sama-sama membaca AVIF dan menulis JPEG memakai dekoder yang sudah dimiliki peramban Anda.

### Apakah gratis, dan apakah saya perlu akun?

Gratis; tidak ada akun, tidak ada masuk, tidak ada masa uji coba, tidak ada tanda air. Tidak ada batas jumlah atau ukuran file-nya juga, karena tidak ada server yang membayarnya — pekerjaannya terjadi di mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang foto Anda.

### Apakah jalan tanpa internet?

Ya, dekodernya termasuk. Muat halamannya sekali, lalu putuskan koneksi internet dan ia terus bekerja pada foto Anda persis seperti sebelumnya. Itu juga bukti terkuat yang tersedia bahwa tidak ada yang diunggah: pengubah yang mengirim HEIC Anda pergi untuk didekodekan akan berhenti pada saat Anda mencabut koneksi, dan yang ini tidak.

## Cara memverifikasi klaim privasi ini

- **Foto Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Dekodernya datang dari sini, dan ia tidak pergi ke mana-mana.** HEIC adalah HEVC di dalam sebuah format wadah, dan tidak ada peramban selain Safari yang akan mendekodekannya, jadi halaman ini mengirimkan `libheif` yang dikompilasi menjadi WebAssembly — sekitar 1,4 MB, disimpan di repositori ini, disajikan dari asal ini, dan disinggahkan oleh service worker seperti setiap file lain di sini. Ia tidak diambil dari sebuah CDN, karena itu akan menaruh pihak ketiga di jalur setiap kunjungan dan akan membuat alat ini berhenti bekerja tanpa internet. Binernya berada di dalam skripnya alih-alih di sebelahnya justru supaya tidak ada pengambilan yang dibutuhkan untuk memulainya.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di file mana pun yang ditulis untuk alat ini. Mesin yang disertakan, seperti setiap hasil bangun Emscripten, memuat jalur pemuat yang akan mengambil sebuah `.wasm` dari sebuah URL; jalur itu tidak ditempuh, karena binernya sudah ada di tangan — dan seandainya pun ditempuh, `connect-src` menyebut titik akhir pengukuran milik Google dan tidak lebih, jadi peramban akan menolaknya. Kebijakannya adalah buktinya, bukan janjinya.
- **Metadatanya dibaca di sini dan dilaporkan kepada Anda.** Daftar di halaman ini mengatakan apa yang dibawa setiap foto — tanggalnya, kameranya, dan apakah ada koordinat GPS di dalamnya — karena itu hal yang mungkin ingin Anda ketahui sebelum menyerahkan JPEG-nya kepada orang lain. Itu dibaca dari file-nya oleh `src/boxes.js` di peramban ini, ditampilkan di halaman ini, dan ditulis ke JPEG Anda atau ditinggalkan, sepenuhnya terserah Anda. Tidak ada peristiwa analitik khusus di repositori ini yang membawa nama file, tanggal, koordinat, atau jumlah.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi apa pun tentang foto Anda. Setiap baris yang membaca, mendekodekan, atau menulis sebuah file disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Muat halamannya sekali lalu putuskan koneksi jaringan, dan alat ini tidak berubah — dekodernya ikut disinggahkan. Itulah bukti yang paling sederhana, dan di sini ia lebih kuat daripada di mana pun lagi di situs ini: pengubah yang mengirim foto Anda pergi untuk didekodekan sama sekali tidak akan sanggup melakukannya.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/heif.js` untuk cara dekodernya dimuat dan apa yang boleh dilakukannya, `src/boxes.js` untuk pembacaan wadah yang menemukan metadata fotonya, dan `src/exif.js` untuk apa yang terjadi pada metadata itu dalam perjalanannya ke sebuah JPEG. Mesinnya sendiri adalah `vendor/libheif.js`, tanpa perubahan, dengan lisensinya di sebelahnya.
