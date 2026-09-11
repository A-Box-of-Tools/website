# Cara menyimpan bingkai dari video sebagai gambar

Menjeda pemutarnya lalu menekan tombol tangkapan layar memberi Anda gambar sebuah jendela. Kadang itu sudah cukup. Inilah apa bedanya, dan bagaimana mendapatkan bingkainya sendiri ketika itu penting.

[Buka Pengambil Bingkai Video](https://abox.tools/id/ambil-bingkai-video/): Gambar diam berkualitas penuh dari titik mana pun.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pengambil Bingkai Video](https://abox.tools/id/ambil-bingkai-video/), jatuhkan klipnya, temukan momennya, lalu tekan *Ambil bingkai ini*. Yang mendarat di unduhan Anda adalah bingkainya pada resolusi videonya sendiri — ⁦3840 × 2160⁩ dari sebuah klip 4K, seberapa pun ukuran pratinjau di halamannya.

Biarkan formatnya di PNG kecuali ukuran file-nya jadi masalah. Sisa halaman ini adalah tentang kenapa dua kalimat itu bukan hal yang sama dengan sebuah tangkapan layar, dan kapan perbedaannya layak dipedulikan.

## Kenapa tangkapan layar dari pemutar yang dijeda adalah gambar yang berbeda

Semua orang sudah punya cara melakukan ini: jeda, tekan tombol tangkapan layar, pangkas kendalinya. Ia bekerja, dan untuk berbagi cepat itu takaran usaha yang tepat. Tapi empat hal sudah terjadi pada gambarnya saat itu, dan tidak satu pun bisa diurungkan:

- **Ia seukuran jendelanya, bukan seukuran videonya.** Klip 4K di pemutar setengah layar memberi Anda gambar sebuah pemutar setengah layar. Setiap piksel yang ada di file-nya dan tidak di layar hilang.
- **Ia sudah diskalakan.** Apa pun yang dilakukan pemutarnya untuk memaskan bingkainya ke jendela itu — pelembutan, penajaman, atau sekadar pengambilan sampel ulang — sudah terpanggang di dalamnya.
- **Ia sudah melewati saluran tampilan.** Manajemen warna, dan pada klip HDR sebuah tahap pemetaan nada yang dipilih untuk monitor Anda alih-alih untuk file-nya.
- **Ia biasanya memuat perabot.** Kendali, bilah kemajuan, trek subtitel, kursor.

Pengambil bingkai melewati keempatnya: ia mendekodekan bingkai yang sebenarnya disimpan file-nya lalu menuliskan piksel itu. Gambarnya seukuran videonya, dan tidak ada yang menggambar di atasnya.

## Mendarat di bingkai yang Anda maksud

Inilah bagian yang diam-diam dikacaukan kebanyakan alat, dan layak diketahui apa yang harus dicari di alat mana pun.

Video bukan seuntai gambar dalam urutan Anda menontonnya. Kebanyakan bingkai disimpan sebagai keterangan tentang bedanya mereka dengan bingkai lain, dan di file mana pun yang ada bingkai-B-nya, urutan penyimpanannya bukan urutan penampilannya. Alat yang menggeser sebuah pemutar ke sebuah cap waktu lalu mengambil apa pun yang muncul bergantung pada belas kasihan cara pemutar itu membulatkan, dan alat yang melangkah "maju satu bingkai" dengan menambahkan sepertiga puluh detik keliru pada setiap klip yang bukan tepat 30 fps — dan itu termasuk hampir setiap video ponsel, karena mereka mengubah-ubah frame rate-nya saat cahayanya berubah.

Solusinya adalah membaca daftar bingkai milik file-nya sendiri lalu mengalamati mereka menurut tempatnya di daftar itu. Pada sebuah MP4, alat di sini melakukan itu: penggesernya bergerak satu bingkai sekali langkah, tombol panah bergerak satu bingkai, dan ia bisa memberi tahu Anda bahwa Anda ada di bingkai 812 dari 3.540 karena ia menghitungnya. Pada format yang tidak bisa dibacanya langsung, ia mengatakannya, dan melangkah kira-kira sebingkai alih-alih berpura-pura.

Cara cepat menguji pengambil bingkai mana pun: langkahkan maju melewati beberapa bingkai dari sesuatu yang bergerak cepat. Kalau gambarnya kadang tidak berubah, atau melompat dua, alatnya sedang menebak-nebak cap waktu.

![Pencari bingkai: satu gambar diam dengan kode waktu tercetak di atasnya, penggeser, tombol langkah, dan kolom berisi waktu persis serta nomor bingkainya.](https://abox.tools/screens/grab-a-frame-from-a-video/find.webp)

Melangkah satu bingkai demi satu bingkai adalah cara mendarat di bingkai yang Anda maksud. Waktu dan nomor bingkai menyebut hal yang sama, dan keduanya bisa diketik.

## Format apa yang dipakai menyimpannya

Sebenarnya hanya ada tiga jawaban, dan pilihannya soal apa yang terjadi pada gambarnya setelah itu.

- **PNG** — bawaannya, dan satu-satunya yang menyimpan bingkainya persis. Pilih itu kalau gambar diamnya akan disunting, dicetak, dibandingkan dengan bingkai lain, atau disimpan. Ia juga yang terbesar: harapkan beberapa megabita dari 1080p dan sekitar delapan dari 4K, karena gambar yang bersifat foto bukan keahlian kompresi PNG.
- **JPEG** — sepersepuluh ukurannya, dan diterima di mana-mana. Pilih itu untuk gambar mini, pratinjau, atau apa pun yang langsung masuk ke sebuah dokumen atau obrolan. Ia putaran kedua kompresi yang merugikan di atas kompresi videonya sendiri, jadi ia titik awal yang keliru untuk penyuntingan lanjutan.
- **WebP** — lebih kecil lagi pada kualitas tampak yang sama, dan sekarang didukung di semua tempat yang penting. Satu catatannya adalah perangkat lunak lama: sebagian aplikasi desktop masih tidak mau membukanya.

Satu hal yang layak dinyatakan terus terang: bingkai dari sebuah video sudah berupa gambar terkompres. Menyimpannya sebagai PNG tidak mengurungkan itu, dan tidak bisa memulihkan detail yang dibuang kodeknya saat klipnya dibuat. Yang Anda dapat dari PNG adalah tidak ada yang dibuang *dua kali*. Kalau Anda akan mengoreksi warna atau memangkas gambar diamnya sesudahnya, itu penting; kalau Anda mengirimkannya kepada seseorang, tidak.

## Mengambil banyak sekaligus

Satu gambar diam setiap beberapa detik adalah pekerjaan yang berbeda dari satu gambar diam pada satu momen, dan ia muncul lebih sering daripada kedengarannya: lembar kontak sebuah rekaman panjang, gambar mini untuk memilih gambar sampul, sampel rekaman yang merata untuk memeriksa fokus atau pencahayaan di sepanjang pengambilan.

Setel sebuah selang, tekan tombol serinya, dan alatnya menyusuri klipnya sekali lalu mengambil satu gambar diam di setiap tanda. Dua catatan praktis. Buat selangnya longgar pada klip yang panjang — satu gambar diam sedetik dari rekaman satu jam adalah 3.600 gambar, dan itulah sebabnya alatnya membatasi satu jalan pada 500. Dan pilih JPEG untuk ini kecuali Anda punya alasan lain: seratus PNG 4K adalah hampir satu gigabita yang ditahan di halamannya sebelum Anda mengunduh satu pun.

Mereka kembali sebagai satu ZIP, dinamai menurut kode waktunya, sehingga mereka terurut sesuai urutan kejadiannya dan masing-masing bisa ditemukan lagi di videonya.

![Tiga gambar diam dari klip yang sama, sebagai gambar kecil beserta waktunya, dan satu tombol untuk menyimpan semuanya sekaligus.](https://abox.tools/screens/grab-a-frame-from-a-video/shots.webp)

Ambil beberapa, pilih belakangan. Semuanya tinggal di halaman sampai Anda menyimpannya, dan menyimpannya cukup satu tombol.

## Video potret, dan gambar diam miring yang klasik

Kalau Anda pernah menarik bingkai dari video ponsel lalu mendapatkannya miring, inilah sebabnya. Sebuah ponsel merekam dalam lanskap lalu menulis seperempat putaran ke dalam file-nya alih-alih memutar pikselnya. Pemutar membaca putaran itu lalu menerapkannya; alat yang hanya membaca pikselnya tidak, dan hasilnya gambar yang sangat baik dari momen yang benar, terputar 90 derajat.

Tidak ada yang salah dengan file-nya, dan memutar ulang gambar diamnya sesudahnya tidak mengorbankan apa pun selain kejengkelan. Alat di sini membaca rotasinya dari treknya lalu menerapkannya sebelum menggambar, jadi klip potret memberi gambar potret.

## Apa yang tidak bisa Anda dapatkan kembali

Gambar diam hanya bisa sebaik bingkai asalnya, dan dua hal membatasi itu alat mana pun yang Anda pakai.

**Buram gerak ada di dalam bingkainya.** Kalau subjeknya bergerak selama pencahayaannya, setiap bingkai gerakan itu buram, dan tidak ada bingkai tajam di sana untuk ditemukan. Merekam pada kecepatan rana yang lebih tinggi adalah satu-satunya solusi, dan itu harus terjadi sebelum perekamannya.

**Kompresi juga ada di dalam bingkainya.** Video dikompres jauh lebih keras daripada sebuah foto, dan jauh lebih keras pada bingkai di antara keyframe-nya. Kalau sebuah gambar diam tampak kotak-kotak, coba melangkah satu dua bingkai ke salah satu arah: keyframe disimpan utuh dan sering tampak jelas lebih bersih daripada tetangganya.

Dan kalau gambar diamnya perlu berbeda ukuran atau bentuk sesudahnya, kerjakan itu sebagai langkah terpisah: [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/) mengubah ukuran, memangkas, dan mengubah format, dan [panduannya](https://abox.tools/id/panduan/ubah-ukuran-gambar/) membahas berapa harga masing-masingnya.

## Kenapa ini tidak butuh unggahan

Mendekodekan video di sebuah peramban itu baru dan ia nyata: WebCodecs membuka dekoder perangkat keras yang sama yang dipakai ponsel Anda untuk memutar video. Pekerjaannya terjadi di mesin yang sudah memegang file-nya, dan untuk klip berukuran beberapa gigabita itu juga satu-satunya pengaturan yang masuk akal — mengunggah satu jam 4K untuk mendapat kembali satu gambar 8 MB adalah pertukaran yang buruk ke segala arah.

Alat di sini tidak punya fitur jaringan dalam bentuk apa pun, dan `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Cabut koneksi internet lalu ambil sebuah bingkai kalau Anda lebih suka memeriksa daripada diberi tahu.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain yang bisa Anda jalankan pada alat mana pun.
