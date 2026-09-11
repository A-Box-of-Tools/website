# Cara mengubah video menjadi GIF

GIF adalah format dari tahun 1987 yang menyimpan gambar utuh alih-alih gerakan, jadi GIF yang dibuat dari sebuah video selalu besar. Ini tentang setelan mana dari ketiganya yang digerakkan ketika ia terlalu besar, dan seberapa banyak yang Anda dapat dari masing-masing.

[Buka Video ke GIF](https://abox.tools/id/video-ke-gif/): Pilih bagiannya, ukurannya, dan laju bingkainya.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pengubah Video ke GIF](https://abox.tools/id/video-ke-gif/), jatuhkan klipnya, tandai detik yang Anda mau, lalu biarkan lebarnya di 480 dan lajunya di 12 bingkai sedetik. Itulah setelan yang diinginkan kebanyakan GIF. Kalau file-nya keluar terlalu besar, turunkan lebarnya sebelum Anda menyentuh yang lain — itulah setelan yang membayar dua kali.

Sisa halaman ini adalah tentang kenapa, karena “GIF saya 14 MB” adalah masalah yang sebenarnya dipunyai semua orang, dan tombol mana yang harus diputar tidaklah gamblang.

## Kenapa GIF dari sebuah video begitu raksasa

Kodek video menyimpan *gerakan*. Ia menulis satu gambar penuh setiap beberapa detik lalu, untuk setiap bingkai di antaranya, sebuah keterangan tentang bagaimana gambar itu bergerak: blok piksel ini menggeser empat ke kiri, area ini menjadi sedikit lebih gelap. Klip lima detik bisa beberapa ratus kilobita karena sebagian besarnya adalah instruksi tentang gambar yang sudah Anda punya.

GIF tidak punya satu pun dari itu. Ia rampung pada 1989, sebelum satu pun dari itu ada. Setiap bingkai adalah sebuah gambar, dikompres sendirian dengan skema yang dirancang untuk tangkapan layar sebuah lembar kerja. Tidak ada perkiraan gerak di mana pun dalam formatnya dan tidak ada cara menambahkannya.

Jadi angka yang harus diharapkan adalah **sepuluh kali ukuran videonya**, dan tidak ada pengubah yang bisa membujuk Anda keluar dari itu. Yang bisa dilakukan pengubah yang baik adalah tidak memboroskan apa pun di atas itu, dan memberi Anda tiga setelan yang benar-benar menentukannya.

![Kartu bagian: satu bingkai video dengan kode waktu dan batang yang menampilkan potongan empat detik yang ditandai di dalam klip dua puluh detik.](https://abox.tools/screens/turn-a-video-into-a-gif/section.webp)

Bagiannya lebih dulu, karena setiap pengaturan di bawah dikalikan dengan berapa detik yang Anda pertahankan.

## Ketiga setelannya, dan berapa harga masing-masing

Semua tentang ukuran sebuah GIF berujung pada berapa banyak piksel yang dimuatnya, yaitu panjangnya kali lajunya kali luas satu bingkainya.

- **Bagiannya — linear.** Dua kali lebih panjang adalah dua kali lebih banyak bingkai dan kira-kira dua kali file-nya. Inilah yang sudah dipahami kebanyakan orang, dan layak bersikap tega soal ini: GIF yang menyampaikan maksudnya dalam tiga detik adalah GIF yang lebih baik sekaligus lebih kecil.
- **Lebarnya — kuadratik.** Menyetengahkan lebarnya menyetengahkan tingginya sekalian, jadi ia *seperempat* pikselnya. Turun dari 640 ke 320 tidak menghemat sedikit di bawah separuh; ia menghemat sekitar tiga perempat. Inilah setelan yang tidak dijangkau siapa pun lebih dulu dan yang paling menguntungkan.
- **Frame rate-nya — linear.** Sepuluh bingkai sedetik adalah dua pertiga ukuran lima belas. Ia juga setelan yang kerugiannya paling terlihat, karena gerakan yang terlalu lambat terbaca sebagai rusak alih-alih sebagai kecil.

Sebuah contoh terhitung. Enam detik klip ponsel pada ⁦1080×1920⁩ miliknya sendiri dan 30 fps adalah 180 bingkai berisi dua juta piksel: sekitar 350 juta piksel, dan itu bukan GIF, itu penyanderaan. Enam detik yang sama pada lebar 480 dan 12 fps adalah 72 bingkai berisi 400.000 piksel — 30 juta, sekitar seperduabelas — dan ia tampak seperti yang dimaksud orang dengan sebuah GIF.

![Kartu ekspor: lebar 480, laju bingkai, pilihan dither, dan ringkasan yang memperkirakan bingkai dan ukurannya.](https://abox.tools/screens/turn-a-video-into-a-gif/size.webp)

Tiga pengaturan dan satu perkiraan yang bergerak bersamanya. Mana yang dibelanjakan lebih dulu adalah pokok bagian ini.

## Frame rate mana yang dipilih

Dua belas adalah bawaan di sini dan jawaban yang benar secara mengejutkan sering. Itulah laju yang dipakai animasi gambar tangan selama satu abad: cukup cepat sehingga mata membacanya sebagai gerakan yang menerus, cukup lambat sehingga Anda tidak membayar bingkai yang tidak bisa dilihat siapa pun.

- **⁦5–8⁩** — terasa seperti tayangan slide. Cukup untuk geseran lambat atau rekaman layar yang tidak ada yang bergerak cepat.
- **⁦10–15⁩** — normal. Terbaca sebagai gerakan. Hampir setiap GIF yang layak dibuat ada di sini.
- **⁦20–25⁩** — halus, dan kira-kira dua kali ukuran 12 untuk perbedaan yang tidak akan bisa disebutkan kebanyakan penonton. Sepadan untuk gerakan cepat, klip olahraga, apa pun yang ada geseran kilatnya.

Ada langit-langit keras yang sebaiknya Anda tahu: GIF menyimpan berapa lama setiap bingkai bertahan di layar dalam perseratus detik, dan setiap peramban memperlakukan jeda di bawah dua perseratus sebagai sepuluh. Jadi 50 bingkai sedetik adalah maksimum yang sesungguhnya, dan file yang meminta 100 akan diam-diam diputar pada 10. Pengubah yang menawari Anda 60 fps entah mengabaikan itu entah sebentar lagi mengejutkan Anda.

## 256 warna, dan untuk apa dithering

Separuh lain dari usia formatnya: sebuah GIF membawa satu tabel berisi paling banyak 256 warna, dan setiap piksel adalah sebuah angka yang menunjuk ke dalamnya. Sebuah bingkai video punya sampai enam belas juta. Hampir semuanya dibuang, dan bagaimana ia dibuang adalah sebagian besar rupa sebuah GIF.

Pengubah yang baik menghitung warna di klip *Anda* lalu memilih 256 yang cocok dengannya, alih-alih memakai kumpulan yang tetap. Bidikan sebuah hutan mendapat 256 hijau; bidikan matahari terbenam mendapat 256 jingga. Itulah yang dilakukan alat di sini, di seluruh bingkai bagiannya alih-alih hanya yang pertama, jadi warna yang hanya muncul di akhir tetap mendapat tempat.

**Dithering** adalah yang terjadi ketika warna yang Anda butuhkan tetap tidak ada. Alih-alih membulatkan seluruh area ke warna terdekat yang tersedia — yang mengubah langit yang mulus menjadi empat pita datar dengan langkah yang terlihat di antaranya — ia menyelang-nyelingkan dua warna terdekat dalam pola halus, dan dari jarak pandang normal mata Anda mencampur keduanya menjadi warna yang tidak ada itu.

- **Biarkan menyala** untuk apa pun yang bersifat foto: langit, kulit, gradien, bayangan, film.
- **Matikan** untuk warna datar: rekaman layar, gambar garis, logo, kartun, apa pun yang punya area luas berisi satu corak. Tidak ada gradien untuk dilindungi, dan file-nya lebih kecil dan lebih bersih tanpanya.

Satu detail yang layak diketahui kalau Anda membandingkan pengubah. Cara dithering yang gamblang — penyebaran galat, yang dipakai kebanyakan penyunting gambar — membuat hasil setiap piksel bergantung pada piksel di sekitarnya. Pada sebuah animasi, itu berarti latar yang tidak bergerak tetap ter-dither berbeda di setiap bingkai, jadi ia terlihat merayap, dan setiap bingkai harus disimpan utuh karena secara teknis setiap pikselnya berubah. Alternatifnya, dither berurutan, hanya bergantung pada di mana sebuah piksel berada, jadi latar yang diam tetap benar-benar diam. Itulah yang dipakai alat ini, dan itulah sebabnya file-nya lebih kecil sekaligus lebih tenang.

## Kapan sebaiknya tidak membuat GIF sama sekali

Layak ditanyakan, karena jawaban yang jujur sering kali “jangan”. MP4 atau WebM yang bisu dan berputar terus adalah sekitar sepersepuluh ukuran animasi yang sama sebagai GIF, diputar dengan cara yang sama, dan itulah yang toh dijadikan setiap lapak media sosial dari GIF Anda setelah Anda mengunggahnya.

Simpan GIF-nya kalau tujuannya memang sungguh membutuhkannya:

- tempat yang hanya menerima sebuah gambar — banyak perangkat lunak obrolan, forum, wiki, dan email;
- sebuah README atau halaman dokumentasi, tempat sebuah GIF diputar sebaris dan sebuah video butuh pemutar;
- sebuah dek slide atau dokumen yang harus terus bergerak tanpa internet;
- sebuah emoji, stiker, reaksi — cukup kecil sehingga tidak satu pun hitungan ukuran di atas jadi soal.

Kalau suaranya penting, pertanyaannya menjawab dirinya sendiri: GIF tidak pernah punya audio dan tidak akan pernah punya. Potong videonya saja — [Pemotong Video](https://abox.tools/id/potong-video/) mengambil sebuah bagian tanpa mengodekan ulang satu bingkai pun darinya.

## Masuk ke bawah sebuah batas ukuran

Sebagian besar alasan orang menyetel sebuah GIF adalah sebuah batas di ujung sana. Dalam urutan kasar seberapa menggigitnya:

- **Email** — 10 sampai 25 MB untuk seluruh pesannya, dan lampiran yang mendekati itu dibuang atau dipantulkan oleh sesuatu di tengah jalan. Bidik jauh di bawahnya.
- **Obrolan dan forum** — biasanya 8 sampai 10 MB, kadang jauh lebih kecil untuk pratinjau sebaris alih-alih sebuah unduhan.
- **README GitHub** — 10 MB per file, dan apa pun di atas beberapa megabita membuat halamannya terasa rusak di sebuah ponsel.
- **Slot stiker dan emoji** — sering beberapa ratus kilobita, dan itu berarti lebar yang kecil dan bagian yang pendek, bukan frame rate yang lebih rendah.

Urutan yang dicoba ketika Anda kelebihan: perpendek bagiannya, lalu setengahkan lebarnya, lalu turunkan lajunya, lalu matikan dithering-nya. Dua yang pertama lebih berharga daripada dua yang terakhir disatukan.

## Tidak satu pun dari ini butuh unggahan

Mengubah sebuah video menjadi GIF adalah mendekodekan, mengubah ukuran, menghitung warna, dan mengompres — empat hal yang sudah bisa dilakukan sebuah peramban sendiri bertahun-tahun. Alat yang ditautkan di atas melakukan semuanya di mesin Anda: file-nya dibaca dari disk Anda, bingkainya didekodekan oleh peramban Anda, dan GIF-nya dirakit di memori lalu diserahkan ke unduhan Anda.

Itu layak dipedulikan di sini lebih daripada biasanya. Klip yang diubah orang menjadi GIF adalah klip pribadi — sebuah momen dari video keluarga, rekaman layar sesuatu di tempat kerja, beberapa detik sebuah panggilan. Pengubah yang ingin itu diunggah sedang meminta salinannya, dan tidak ada lagi alasan teknis untuk mengiyakan.
