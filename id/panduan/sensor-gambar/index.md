# Cara menyensor gambar supaya bagian yang disembunyikan sungguh hilang

Menutupi sesuatu dan membuangnya tampak identik di layar dan sama sekali bukan hal yang sama. Inilah bedanya, dua gaya yang meninggalkan lebih banyak daripada dugaan orang, dan pemeriksaan yang memberi tahu Anda Anda baru saja melakukan yang mana dari keduanya.

[Buka Penyensor Gambar](https://abox.tools/id/sensor-gambar/): Apa yang Anda tutup dihapus dari file-nya, bukan ditutupi di dalamnya.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Penyensor Gambar](https://abox.tools/id/sensor-gambar/), jatuhkan gambarnya, seret sebuah kotak di atas setiap hal yang tidak boleh terlihat, lalu tekan “Sensor dan simpan”. Pakai isian hitam untuk apa pun yang terbaca sebagai teks. File yang Anda dapatkan kembali punya nilai piksel yang berbeda di tempat kotaknya berada: tidak ada persegi di dalamnya untuk digeser, karena sama sekali tidak ada persegi di dalamnya.

Semua di bawah ini adalah kenapa kalimat terakhir itu adalah seluruh intinya, dan bagaimana mengetahui apakah alat yang sudah Anda pakai bisa mengatakan hal yang sama.

## Menutupi dan membuang tampak identik di layar

Gambar sebuah persegi hitam di atas sebuah nama di pembaca PDF, dek slide, pengolah kata, atau penyunting gambar berlapis, dan yang Anda lihat adalah sebuah nama dengan persegi hitam di atasnya. Yang Anda *simpan*, di kebanyakan program itu, adalah sebuah dokumen yang memuat namanya dan, secara terpisah, sebuah persegi dengan sebuah posisi, sebuah ukuran, dan sebuah warna.

Siapa pun yang membuka file itu bisa memindahkan perseginya, menghapusnya, atau membuka dokumennya di program yang menggambar lapisannya dalam urutan berbeda. Namanya masih ada di sana. Tidak ada apa pun di layar yang memberi tahu Anda mana dari kedua hal itu yang baru saja terjadi, dan persis itulah sebabnya hal ini terus menimpa organisasi yang punya pengacara.

Ia sudah menerbitkan berkas pengadilan, laporan pemerintah, kontrak, dan dokumen hasil pindaian lebih dari satu surat kabar. Polanya selalu sama: perseginya adalah anotasinya, dan anotasinya bukan gambarnya.

## Apa itu penyensoran sungguhan

Sebuah gambar adalah kisi angka, satu per piksel. Menyensornya berarti **menulis angka yang berbeda ke dalam kisinya** lalu menyimpan kisinya. Setelah itu tidak ada yang bisa dipulihkan, bukan karena file-nya menyembunyikannya dengan baik melainkan karena nilainya tidak ada di file-nya. Itulah satu-satunya versi dari ini yang selamat ketika dibuka orang yang penasaran.

Tiga akibat yang layak diketahui, karena itulah rupa yang seharusnya dipunyai file yang disensor:

- **Hasilnya satu gambar yang rata.** Tidak ada lapisan, tidak ada objek, tidak ada daftar anotasi, tidak ada yang bisa dinyalakan dimatikan. Kalau alat Anda menyerahkan kembali file yang ada lapisannya, ia menutupi alih-alih membuang.
- **Ia file baru, bukan file lama yang disunting.** Pikselnya melewati sebuah dekoder dan sebuah pengode, jadi yang keluar ditulis dari kisi yang sudah disensor.
- **Metadatanya ikut hilang**, sebagai efek samping. Kisi piksel tidak membawa model kamera, posisi GPS, atau cap waktu. Lihat [apa yang dikatakan sebuah foto tentang Anda](https://abox.tools/id/panduan/hapus-data-exif-dan-gps/) untuk apa yang tadinya akan ada di sana.

Yang terakhir itu layak diuraikan, karena ia menyembunyikan jebakannya sendiri. Banyak foto membawa **gambar mini yang tersemat**: salinan kedua yang kecil dari gambarnya, ditulis ketika file-nya dibuat dan tidak selalu dihasilkan ulang ketika gambarnya disunting. Foto yang disensor oleh alat yang menyunting file-nya di tempat, alih-alih mengodekannya ulang, bisa bepergian dengan gambar mini berisi aslinya yang belum disensor. Ia gambar yang kecil, dan ia dengan mudah cukup besar untuk membaca sebuah nama darinya.

![Kartu penyimpanan: menu format, penggeser kualitas, dan catatan yang menyebut bahwa piksel yang tertutup dibuang dari berkas yang ditulis.](https://abox.tools/screens/redact-an-image/save.webp)

Menyimpan adalah langkah yang membuatnya nyata. Yang keluar adalah berkas baru tanpa piksel itu, bukan berkas asli dengan persegi panjang di atasnya.

## Hitam, pikselasi, atau buram — dan kenapa ketiganya tidak setara

Ketiganya menimpa pikselnya. Hanya satu di antaranya yang tidak meninggalkan apa pun.

### Isian hitam

Setiap piksel di dalam kotaknya menjadi warna yang sama. Tidak ada apa pun tentang yang tadinya ada di sana yang selamat: bukan sebuah siluet, bukan sebuah kecerahan rata-rata, bukan jumlah karakternya, bukan panjang katanya. Ia satu-satunya dari ketiganya yang pertanyaan “bisakah ini diurungkan?”-nya berjawab tidak secara datar, dan itulah yang dipakai untuk sebuah nama, alamat, nomor rekening, pelat nomor, tanda tangan, atau barcode.

### Pikselasi

Kotaknya dipotong menjadi blok dan setiap blok menjadi warna rata-rata blok itu. Piksel aslinya memang sungguh hilang — tapi kisi berisi rata-rata tetaplah sebuah pengukuran atas apa yang ada di bawahnya, dan untuk teks pengukuran itu bisa cukup.

Serangannya tidak halus. Teks digambar dari sekumpulan kecil kemungkinan: sebuah fon, sebuah ukuran, sebuah posisi, dan sebuah teks. Orang yang menduga jenis hal apa yang tadinya ada di sana bisa menggambar setiap kandidat teks dengan cara yang sama, memikselasi masing-masing dengan kisi blok yang sama, lalu membandingkan rata-ratanya dengan punya Anda. Kecocokannya biasanya tunggal. Ini sudah diperagakan pada tangkapan layar terpikselasi yang sungguhan, dan ada perangkat lunak terbit yang melakukannya.

Yang menentukan adalah **berapa banyak blok yang menyusun mosaiknya**. Dua blok melintasi sebuah kata adalah dua angka, dan dua angka tidak bisa mengenali sebuah teks. Empat puluh blok melintasi kata yang sama adalah empat puluh angka, dan empat puluh sudah lebih dari cukup. Itulah sebabnya Penyensor Gambar memberi tahu Anda jumlah blok untuk mosaik terhalus di gambarnya alih-alih menyebut sebuah setelan “kuat” — angkanya adalah faktanya, dan kata sifatnya adalah pendapat tentangnya.

### Buram

Setiap piksel menjadi rata-rata terbobot dari tetangganya. Itu sebuah konvolusi, dan konvolusi pada prinsipnya bisa dibalik: memulihkan aslinya dari salinan yang diburamkan adalah masalah baku dengan perangkat lunak baku, dan ia paling berhasil justru pada kasus yang penting di sini, yaitu teks tajam yang diburamkan dengan radius kecil.

Tidak satu pun dari ini membuat pikselasi dan pemburaman tak berguna. Wajah di latar belakang foto jalanan, nomor rumah di seberang jalan, layar rekan kerja di belakang Anda pada sebuah panggilan video — semua itu baik-baik saja, dan mereka menjaga gambarnya tetap tampak seperti gambar. Aturannya sederhana saja: **kalau ia terbaca sebagai teks, hitamkan.**

![Editornya: sebuah foto dengan kotak pekat menutupi sebagiannya, pilihan antara hitam, piksel, dan buram, penggeser kekuatan, serta ringkasan area yang ditandai.](https://abox.tools/screens/redact-an-image/cover.webp)

Tiga cara menutupi sesuatu, dan ketiganya tidak setara. Bagian ini soal mana di antaranya yang bertahan terhadap orang yang mencoba membatalkannya.

## Empat pemeriksaan sebelum Anda mengirimnya

Semuanya bersama-sama memakan satu menit dan mereka bekerja pada keluaran alat mana pun, termasuk yang ini. Klaim yang bisa Anda periksa lebih berharga daripada klaim yang Anda diminta menerimanya.

1. **Coba pilih teksnya.** Buka file-nya lalu seret melintasi area yang tertutup. Kalau ada yang tersorot, teksnya masih ada di dokumennya dan Anda sedang melihat sebuah bentuk yang digambar di atasnya.
2. **Buka di sebuah penyunting lalu cari lapisan.** Satu lapisan, bernama sesuatu seperti “Background”, itulah rupa gambar yang disensor. Objek persegi yang terpisah berarti aslinya ada di bawahnya.
3. **Lihat gambar mininya.** Sebagian pengelola file dan penampil foto menampilkan gambar mini yang tersemat alih-alih membaca ulang gambarnya. Kalau versi kecilnya masih menampilkan yang Anda tutupi, file-nya disunting alih-alih dibangun ulang.
4. **Perbesar sampai maksimal di tepi kotaknya.** Penyensoran yang diterapkan pada pikselnya punya tepi keras tepat di batasnya. Tepi yang lembut atau setengah tembus pandang berarti sesuatu digambar di atas gambarnya dengan sebuah kelegapan, dan kelegapan di bawah 100% adalah salinan aslinya dengan semburat di atasnya.

## Pangkas alih-alih tutupi, kalau bisa

Kalau hal yang Anda sembunyikan ada di tepi gambarnya — sebuah header berisi nama akun, sebuah tab peramban, sebuah bilah tugas berisi nama pengguna Anda — memangkasnya lebih kuat daripada menutupinya dan menghasilkan file yang tampak lebih bersih. Tidak ada kotak yang perlu dicurigai karena sama sekali tidak ada apa pun di sana.

[Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/) memangkas, dan [panduannya](https://abox.tools/id/panduan/ubah-ukuran-gambar/) membahas apa lagi yang dilakukannya. Pakai penyensornya untuk yang ada di tengah.

## Tangkapan layar sering jadi pelanggar terburuk

Gambarnya biasanya bukan satu-satunya hal di sebuah tangkapan layar yang mengenali Anda. Sebelum mengirim satu, lihat apa yang mengelilingi bagian yang Anda maksud untuk dibagikan: judul jendelanya, bilah alamat peramban dan daftar pelengkapan otomatisnya, tab yang terbuka, sebuah notifikasi, jam dan tanggalnya, bilah tugasnya, avatar akun yang masuk di sudutnya, nama jaringan wifinya. Satu saja di antaranya bisa menempatkan Anda, dan tidak satu pun dari mereka yang sedang Anda lihat ketika Anda mengambil bidikannya.

## Tidak satu pun dari ini butuh unggahan

Membaca sebuah gambar, menulis di atas sebagian pikselnya, lalu mengodekannya lagi adalah hal-hal yang sudah bisa dilakukan setiap peramban bertahun-tahun. Tidak ada alasan teknis bagi foto paspor Anda, slip gaji Anda, atau rekening koran Anda untuk bepergian ke server orang asing dan kembali hanya untuk diberi kotak hitam — dan justru gambar seperti itulah yang diserahkan orang ke sebuah alat penyensor.

Alat di sini tidak mengirimnya ke mana pun: `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Muat halamannya, cabut koneksi internet, lalu sensor sesuatu kalau Anda lebih suka memeriksa daripada diberi tahu. [Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain yang bisa Anda jalankan pada alat mana pun.
