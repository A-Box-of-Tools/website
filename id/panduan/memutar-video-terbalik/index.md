# Cara memutar video terbalik

Memutar sebuah klip mundur terdengar seperti suntingan paling sederhana yang ada, dan justru itulah yang paling tidak disiapkan oleh sebuah file video. Inilah apa yang sebenarnya harus terjadi, berapa harganya, dan satu langkah yang layak dikerjakan sebelumnya.

[Buka Pembalik Video](https://abox.tools/id/putar-video-terbalik/): Bingkai terakhir lebih dulu, lengkap dengan suaranya.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pemutar Balik Video](https://abox.tools/id/putar-video-terbalik/), jatuhkan klipnya, putuskan apakah Anda mau suaranya ikut dibalik, lalu ekspor. Yang keluar adalah klip yang sama dengan bingkai terakhirnya di depan, persis sepanjang yang masuk.

Tidak seperti pemotongan, yang ini harus menulis setiap bingkainya lagi — suaranya sekalian, bukan hanya gambarnya. Itu bukan kekurangan sebuah alat tertentu; itulah pembalikan. Sisa halaman ini adalah alasannya, dan apa artinya bagi berapa lama Anda akan menunggu.

## Kenapa sebuah video tidak bisa begitu saja diputar mundur

File video bukan setumpuk gambar. Kira-kira satu bingkai dari setiap lima puluh adalah gambar utuh — sebuah *keyframe* — dan semua di antaranya adalah keterangan tentang apa yang berubah sejak bingkai di sekitarnya. Itulah sebabnya video satu jam muat di sebuah ponsel.

Itu juga berarti sebuah dekoder hanya bisa maju. Untuk menampilkan bingkai terakhir sebuah klip, ia harus menemukan keyframe di depannya lalu mendekodekan semua yang ada di antaranya. Minta bingkai kedua dari belakang dan ia mengerjakan pekerjaan yang sama sekali lagi.

Jadi pembalikan dikerjakan segrup demi segrup: dekodekan satu grup maju, tahan bingkainya, serahkan ke pengode dalam urutan sebaliknya, pindah ke grup sebelumnya. Alternatif yang gamblang — dekodekan seluruh klipnya menjadi sebuah daftar lalu susuri daftar itu mundur — butuh sekitar 3 MB memori per bingkai 1080p, atau 5 GB per menit, dan itulah sebabnya alat yang melakukannya begitu tumbang pada apa pun yang lebih panjang dari beberapa detik.

![Kartu sumber: nama klipnya, ukurannya, ukuran bingkainya, durasinya, dan kodeknya.](https://abox.tools/screens/reverse-a-video/source.webp)

Apa yang ditemukan alat ini tentang berkasnya. Membalik adalah satu-satunya operasi yang tidak bisa dijalankan sambil lalu, jadi angka-angka inilah yang menentukan apakah ia muat di memori.

## Apa yang terjadi pada suaranya

Di sinilah alat pembalik paling berbeda satu sama lain, dan di sinilah layak diperiksa apa yang sebenarnya Anda dapatkan.

Suara dikompres dalam paket berdurasi beberapa puluh milidetik, masing-masing dikodekan terhadap paket sebelumnya. Menuliskan paket itu dari belakang ke depan *tidak* memutar sebuah trek mundur — ia memutar potongan-potongan pendek maju dalam urutan yang salah, dan itu terdengar seperti tersendat atau rusak alih-alih seperti pembalikan. Satu-satunya cara membalik suara dengan benar adalah mendekodekan seluruh treknya, menaruh sampelnya dalam urutan sebaliknya, lalu mengodekannya lagi.

Itulah yang terjadi di sini, dan itulah sebabnya suaranya dikodekan ulang padahal [Pemotong Video](https://abox.tools/id/potong-video/) dan [Pemangkas Video](https://abox.tools/id/pangkas-video/) tidak pernah menyentuhnya: pekerjaan itu tidak mengubah *kapan* sesuatu terjadi, dan yang ini tidak mengubah apa pun selain itu.

Kalau Anda mau gambarnya mundur dan tanpa suara sama sekali — dan itulah pilihan yang biasa untuk apa pun yang akan masuk ke lini masa yang memutar tanpa suara — matikan kotak centangnya. Ia lebih cepat, dan file-nya lebih kecil.

![Kartu ekspor: penggeser kualitas, sakelar untuk mempertahankan suara, dan ringkasan ukuran keluaran, durasi, serta jumlah bingkai.](https://abox.tools/screens/reverse-a-video/export.webp)

Sakelar suara ada di sini karena ucapan yang dibalik hampir tidak pernah menjadi yang diinginkan siapa pun, dan memutuskannya sebelum ekspor lebih mudah daripada sesudahnya.

## Apa yang dikorbankan dari gambarnya

Satu kali pengodean ulang. Bingkainya keluar dalam urutan yang tidak dikodekan oleh apa pun di file aslinya, jadi masing-masing harus ditulis dari awal.

Yang tidak akan dilakukan alat yang tahu diri adalah menghabiskan *lebih* daripada yang dihabiskan aslinya. Klip yang dibalik menyimpan persis gambar yang sama dengan klip yang datang, jadi bitrate yang lebih tinggi tidak punya apa-apa yang baru untuk digambarkan: ia membuat file-nya lebih besar tanpa membuatnya tampak lebih baik. Setelan kualitas di sini bergerak di dalam langit-langit itu alih-alih di atasnya.

Seperti biasa, langkah yang merugikan itu bertumpuk. Membalik sebuah asli adalah satu generasi. Membalik hasil ekspor dari sebuah unduhan dari sebuah rekaman layar adalah empat, dan hasilnya kelihatan.

## Potong dulu, baru balik

Kalau klipnya butuh keduanya, potong lebih dulu. Pemotongan itu gratis — pemotong yang baik memindahkan bingkai utuh tanpa mendekodekannya — dan setiap detik yang Anda buang adalah satu detik yang tidak perlu didekodekan dan dikodekan lagi oleh siapa pun.

Melakukannya terbalik berarti membalik rekaman yang sebentar lagi Anda buang. Pada klip yang panjang, itu bedanya pekerjaan yang memakan beberapa detik dengan yang memakan beberapa menit. [Panduan pemotongan](https://abox.tools/id/panduan/potong-video/) membahas kenapa langkah pertama itu sama sekali tidak perlu mengorbankan kualitas Anda.

Urutan yang sama berlaku untuk pemangkasan: potong, pangkas, balik, dan Anda hanya membayar satu pengodean ulang dari klip sependek mungkin.

## Untuk apa orang sebenarnya memakainya

- **Gurauan putar balik.** Sesuatu jatuh, pecah, atau tercebur, dan pembalikan mengembalikannya. Ia terbaca sebagai lelucon karena rekaman sungguhan yang diputar mundur tidak mungkin salah dikenali — asap berkumpul, air memanjat.
- **Boomerang buatan sendiri.** Balik sebuah klip pendek lalu sambungkan ke aslinya dengan [Pemotong Video](https://abox.tools/id/potong-video/); Anda mendapat lup maju-lalu-mundur tanpa aplikasi yang biasanya membuatnya, dan sepanjang yang Anda mau alih-alih sepanjang yang dimaunya.
- **Pengungkapan.** Rekam keadaan akhir yang sudah rapi lalu balik, sehingga sepiring hidangan jadi kembali menjadi bahan-bahannya atau sesuatu yang sudah terpasang terurai. Lebih mudah direkam daripada versi majunya, dan itulah intinya.
- **Ucapan terbalik.** Yang hanya menarik kalau suaranya sungguh dibalik — lihat di atas.

## Format, dan berapa lama waktunya

**MP4, M4V, dan MOV** dibaca langsung, apa pun isinya — H.264, HEVC, AV1, atau VP9 — selama peramban Anda bisa mendekodekan kodek itu. Inilah jalur cepatnya: file-nya disusuri mundur segrup bingkai demi segrup, secepat yang bisa dicapai mesin Anda.

**Apa pun lain yang bisa diputar peramban Anda**, WebM yang paling jelas, dibalik dengan melangkahkan pemutar milik peramban itu sendiri mundur melalui klipnya, satu momen sekali langkah. Ia bekerja, dan ia lebih lambat, karena setiap langkah itu membuat perambannya mendekodekan dari keyframe di depannya. Halamannya mengatakan jalur mana dari keduanya yang dipakainya sebelum Anda mulai, dan kenapa.

**AVI, WMV, FLV, dan kebanyakan MKV** tidak bisa dibaca maupun diputar peramban, dan alatnya menolaknya dengan sebuah pesan alih-alih gagal di tengah jalan.

Bagaimanapun juga ini salah satu pekerjaan yang lebih lambat di situs ini, karena setiap bingkai didekodekan dan dikodekan dan sebagian bingkai didekodekan lebih dari sekali. Klip pendek hitungan detik; klip 4K yang panjang layak dimulai lalu ditinggalkan.

## Kenapa ini tidak butuh unggahan

Mendekodekan dan mengodekan ulang video di sebuah peramban itu baru dan ia nyata: WebCodecs membuka pengode perangkat keras yang sama yang dipakai ponsel Anda untuk merekam video, dan ia cepat karena alasan yang sama. Pekerjaannya terjadi di mesin yang sudah memegang file-nya, dan untuk video besar itu juga satu-satunya pengaturan yang masuk akal — mengunggah lalu mengunduh hasilnya memakan lebih banyak waktu daripada pengodeannya sendiri.

Alat di sini tidak punya fitur jaringan dalam bentuk apa pun, dan `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Cabut koneksi internet lalu balik sebuah klip kalau Anda lebih suka memeriksa daripada diberi tahu.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain yang bisa Anda jalankan pada alat mana pun.
