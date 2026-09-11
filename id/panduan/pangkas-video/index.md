# Cara memangkas video ke bentuk lain

Memangkas mengubah bentuk gambarnya, dan itu berarti menulis bingkai baru — tidak ada jalan memutarnya, dan alat mana pun yang mengaku sebaliknya sedang melakukan hal lain. Inilah berapa harganya, dan bagaimana membelanjakannya dengan baik.

[Buka Pemangkas Video](https://abox.tools/id/pangkas-video/): Potong klip sampai tersisa bagian yang penting.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pemangkas Video](https://abox.tools/id/pangkas-video/), jatuhkan klipnya, seret kotaknya ke bagian yang ingin Anda simpan — atau kunci ke sebuah bentuk kalau Anda sudah diberi satu — lalu ekspor. Klip yang keluar persis sepanjang yang masuk, dengan pewaktuan dan suaranya utuh.

Tidak seperti pemotongan, yang ini harus menulis bingkai baru. Itu bukan kekurangan alat tertentu; itulah pemangkasan. Sisa halaman ini adalah tentang berapa harganya dan bagaimana menjaganya tetap kecil.

## Kenapa pemangkasan tidak bisa menghindari pengodean ulang

Pemotongan menyimpan bingkai utuh, jadi pemotong yang baik memindahkannya tanpa disentuh dan sama sekali tidak ada yang didekodekan. Pemangkasan menyimpan sebagian dari setiap bingkai — dan sebagian bingkai adalah gambar yang berbeda. Tidak ada cara menyimpan gambar yang berbeda tanpa menuliskan pikselnya dari awal.

Ada satu pengecualian sempit, dan ia layak diketahui supaya Anda bisa mengenali ketika seseorang mengaku memakainya. Video dikodekan dalam blok, dan kalau sebuah pangkasan mendarat persis di batas blok pada keempat sisinya, sebagian datanya pada prinsipnya bisa dipakai ulang. Pada praktiknya dimensi bingkainya sendiri, vektor geraknya, dan prediksinya tetap harus ditulis ulang, jadi tidak ada yang sungguh dibangun dengan cara ini. Anggap saja pemangkasan berarti pengodean ulang.

Yang akan dilakukan pemangkas yang tahu diri adalah tidak menghabiskan *lebih* daripada yang dihabiskan aslinya untuk area yang sama. Mengodekan wilayah yang dipangkas pada bitrate lebih tinggi daripada sumbernya hanya membuat file-nya lebih besar; ia tidak bisa mengembalikan detail yang memang tidak dimiliki aslinya.

![Kartu ekspor: menu format, penggeser kualitas, sakelar untuk mempertahankan suara, dan ringkasan ukuran keluaran, berapa banyak bingkai yang tersisa, serta durasinya.](https://abox.tools/screens/crop-a-video/export.webp)

Kartu ini ada karena gambarnya harus dikodekan ulang. Ringkasannya adalah alat yang menyebut biayanya sebelum mengerjakannya.

## Bentuk yang sebenarnya diminta dari Anda

Kebanyakan pemangkasan dilakukan karena suatu tempat mensyaratkan rasio aspek tertentu. Daftar singkatnya:

- **9:16 — jangkung.** Story, reel, short, TikTok. Layar penuh di ponsel yang dipegang normal. Alasan paling umum orang memangkas sebuah video sama sekali.
- **1:1 — persegi.** Unggahan di lini masa beberapa lapak. Bekerja ke arah mana pun penontonnya memegang ponselnya, dan itulah sebabnya ia bertahan.
- **4:5 — sedikit jangkung.** Bentuk terbesar yang diizinkan sebagian lini masa, jadi ia memakan lebih banyak layar daripada persegi tanpa menjadi video vertikal penuh.
- **16:9 — lebar.** Standar untuk video pada umumnya. Anda biasanya memangkas *menjadi* ini hanya untuk membuang bilah hitam, atau *dari* ini untuk mendapatkan salah satu di atas.

Kunci kotaknya ke rasionya alih-alih menyeret dengan perkiraan mata. Meleset beberapa piksel berarti lapaknya memangkas pangkasan Anda, dan ia tidak akan berunding dengan Anda soal di mana.

![Kartu pemangkasan: satu bingkai video dengan kotak persegi di tengahnya, dan kolom angka untuk kiri, atas, lebar, dan tinggi.](https://abox.tools/screens/crop-a-video/box.webp)

Kotaknya diseret atau diketik, dan angkanya menyebut persis apa yang dipertahankan. Persegi yang diambil dari klip layar lebar adalah permintaan yang paling sering datang.

## Mengubah klip lanskap menjadi tegak

Inilah kasus umum yang paling sulit, dan layak dinyatakan terus terang bahwa pemangkasan adalah kompromi alih-alih solusi.

Video 16:9 yang dipangkas menjadi 9:16 menyimpan sekitar 32% lebar gambarnya. Apa pun yang ada di sisinya hilang — dan pada bidikan lanskap, sisinya biasanya tempat konteksnya berada. Kalau dua orang berbicara di sisi bingkai yang berlawanan, tidak ada satu pangkasan pun yang menyimpan keduanya.

Pilih pangkasannya dengan menonton klipnya sekali lalu bertanya di mana sebenarnya subjeknya berada di sebagian besar durasinya. Kalau jawabannya “ia bergerak”, pangkasan diam adalah alat yang keliru dan yang Anda butuhkan adalah penyunting yang bisa menggeser pangkasannya sepanjang waktu. Kalau jawabannya “di tengah, sebagian besarnya”, pangkasan yang terpusat sudah cukup dan memakan sepuluh detik.

Alternatif yang layak diingat: banyak lapak menerima video lanskap lalu memberinya bilah hitam sendiri. Pemangkasan itu untuk ketika Anda ingin layar penuh, bukan untuk ketika Anda ingin videonya diterima.

## Kenapa lebar dan tingginya bergerak dua-dua

Kalau Anda memperhatikan kotak pangkasnya menolak angka ganjil, itu kodeknya yang rewel, bukan antarmukanya.

H.264 — kodek di dalam sebuah MP4 — menyimpan warna pada setengah resolusi secara mendatar dan menegak, karena mata jauh lebih kurang peka pada detail warna daripada pada kecerahan. Itu berarti gambarnya ditangani dalam satuan dua piksel dan tidak ada cara menggambarkan bingkai dengan jumlah piksel ganjil di salah satu sisinya.

Alat menangani ini dengan membulatkan pangkasan Anda setelah Anda menyetelnya, yang menggeser kotak Anda sepiksel tanpa memberi tahu, atau dengan hanya pernah menawarkan angka genap sejak awal. Yang kedua itulah yang terjadi di sini.

## Apa yang terjadi pada suaranya

Tidak ada, pada jalur MP4. Pemangkasan mengubah gambarnya dan tidak punya alasan menyentuh audionya, jadi audionya disalin sampel demi sampel tanpa pernah didekodekan — byte demi byte sama dengan yang ada di file-nya.

Pada jalur cadangan lewat perekaman, yang dijelaskan di bawah, suaranya ditangkap dari pemutarannya lalu dikodekan lagi, dan itu mengorbankan sedikit kualitas. Bagaimanapun juga ada kotak centang untuk membuangnya sekalian, dan itu layak dipakai ketika klipnya toh akan pergi ke tempat yang memutarnya tanpa suara dan Anda mau file sekecil mungkin.

## Format, dan berapa lama waktunya

**MP4, M4V, dan MOV** dibaca langsung, apa pun isinya — H.264, HEVC, AV1, atau VP9 — selama peramban Anda bisa mendekodekan kodek itu. Tidak seperti pemotongan, pemangkasan memang harus mendekodekan, jadi kodeknya penting di sini dengan cara yang tidak berlaku di sana.

**Apa pun lain yang bisa diputar peramban Anda**, WebM yang paling jelas, dipangkas dengan memutarnya lalu merekam hasilnya, yang bekerja dan memakan waktu selama panjang klipnya.

**AVI, WMV, FLV, dan kebanyakan MKV** tidak bisa dibaca maupun diputar peramban, dan alatnya menolaknya dengan sebuah pesan alih-alih gagal di tengah jalan.

Harapkan sebuah pemangkasan memakan waktu sungguhan pada klip yang panjang, karena setiap bingkai sedang didekodekan dan dikodekan ulang. Tidak ada batas yang dibangun ke dalam alatnya, dan file-nya disusuri beberapa megabita sekali jalan alih-alih dimuat utuh; langit-langit praktisnya adalah video jadinya, yang dirakit di memori sebelum Anda mengunduhnya.

## Pangkas sebelum Anda melakukan hal lain

Kalau sebuah klip butuh pemotongan dan pemangkasan, potong lebih dulu — itu gratis, dan setiap detik yang Anda buang adalah satu detik yang tidak perlu dikodekan ulang siapa pun. Lalu pangkas klip yang lebih pendek itu sekali.

Melakukannya terbalik berarti memangkas rekaman yang sebentar lagi Anda buang, dan itu mengorbankan waktu dan kualitas untuk apa-apa. [Pemotong Video](https://abox.tools/id/potong-video/) ada di sebelah, dan [panduannya](https://abox.tools/id/panduan/potong-video/) menjelaskan kenapa langkah itu sama sekali tidak perlu mengorbankan apa pun dari Anda.

Secara lebih umum: setiap langkah yang merugikan itu bertumpuk. Satu pangkasan atas sebuah asli adalah satu generasi. Pangkasan atas potongan atas ekspor atas unduhan adalah empat, dan hasilnya kelihatan.

## Kenapa ini tidak butuh unggahan

Mendekodekan dan mengodekan ulang video di sebuah peramban itu baru dan ia nyata: WebCodecs membuka pengode perangkat keras yang sama yang dipakai ponsel Anda untuk merekam video, dan ia cepat karena alasan yang sama. Pekerjaannya terjadi di mesin yang sudah memegang file-nya, dan untuk video berukuran beberapa gigabita itu juga satu-satunya pengaturan yang masuk akal — mengunggah lalu mengunduh hasilnya memakan lebih banyak waktu daripada pengodeannya sendiri.

Alat di sini tidak punya fitur jaringan dalam bentuk apa pun, dan `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Cabut koneksi internet lalu pangkas sebuah klip kalau Anda lebih suka memeriksa daripada diberi tahu.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain yang bisa Anda jalankan pada alat mana pun.
