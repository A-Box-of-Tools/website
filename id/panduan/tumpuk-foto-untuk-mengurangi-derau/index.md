# Cara menumpuk foto untuk mengurangi derau, atau membuang orang

Sebuah burst bingkai menyimpan lebih banyak informasi daripada satu pun di antaranya. Merata-ratakannya membatalkan deraunya; mengambil nilai tengah setiap pikselnya menghapus apa pun yang hanya ada sebagian waktu. Anda mau yang mana sepenuhnya tergantung apa yang bergerak.

[Buka Penumpuk Gambar](https://abox.tools/id/tumpuk-gambar/): Dua puluh bingkai menjadi satu, tanpa dua puluh unggahan dan tanpa pengubah RAW.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Penumpuk Gambar](https://abox.tools/id/tumpuk-gambar/), jatuhkan seluruh burst-nya, lalu pilih metodenya menurut apa yang ingin Anda singkirkan:

- **Derau**, dan tidak ada yang bergerak — rata-rata.
- **Derau**, dan ada yang bergerak — sigma clipping.
- **Orang, mobil, sebuah pesawat** — median.
- **Langit gelap yang Anda mau jadi jejak bintang** — terangkan.
- **Bidikan makro yang kedalaman bidangnya nyaris tidak ada** — penumpukan fokus.

Biarkan penyejajarannya menyala kalau kameranya ada di tangan Anda dan matikan kalau ia ada di atas tripod. File RAW bisa masuk langsung; tidak perlu mengembangkannya lebih dulu.

Semua di bawah ini adalah kenapa kelima baris itu seperti itu.

## Kenapa sebuah burst menyimpan lebih banyak daripada satu bingkai

Foto yang diambil di bawah cahaya yang buruk adalah gambarnya ditambah derau, dan deraunya berbeda setiap kali. Bagian terakhir itulah yang membuat penumpukan berhasil. Ambil bidikan yang sama enam belas kali dan gambarnya identik di keenam belasnya sementara deraunya tidak, jadi merata-ratakannya menyisakan gambarnya dan membatalkan sebagian besar deraunya.

Peningkatannya sebesar akar jumlah bingkainya. Empat bingkai menyetengahkan deraunya. Enam belas menyeperempatkannya. Seratus memangkasnya sepersepuluh. Itu kurva yang kejam untuk dijalani — naik dari enam belas bingkai ke enam puluh empat memberi Anda peningkatan yang sama lagi, untuk empat kali pemotretannya — dan itulah sebabnya hampir setiap tumpukan yang praktis berada di antara delapan dan tiga puluh bingkai.

Ada keuntungan kedua yang lebih tenang. Merata-ratakan enam belas bingkai delapan bit memberi hasil dengan gradasi yang lebih halus daripada yang dimiliki satu pun di antaranya, karena derau yang membuat setiap bingkai membulat berbeda justru itulah yang membuat rata-ratanya mendarat di antara tingkatannya. Menumpuk kumpulan yang berderau tidak hanya membuang derau; ia memulihkan nada yang dikuantisasi hilang oleh satu bingkai.

## Pertanyaan yang memilih metodenya

Bukan “apa yang ingin saya simpan” melainkan **apa yang berbeda antar bingkainya**. Semua yang lain mengikuti.

### Tidak ada yang bergerak: rata-rata

Rata-rata biasa. Ia pengurangan derau paling ampuh yang tersedia pada kumpulan yang satu-satunya beda antar bingkainya adalah deraunya, dan ia yang paling mudah dirusak: satu bingkai yang ada burungnya menaruh sebuah burung samar melintasi seluruh tumpukannya, karena sebuah rata-rata tidak punya pendapat tentang nilai yang tidak sepakat dengan yang lain. Ia sekadar memasukkannya.

### Ada yang melintasi bingkainya: median

Sejajarkan selusin foto sebuah alun-alun yang ramai lalu lihat satu piksel. Di sebagian besarnya ia trotoar; di satu dua di antaranya ia mantel seseorang. Urutkan kedua belas nilai itu lalu ambil yang tengah dan Anda mendapat trotoar, karena mantelnya tidak pernah menjadi mayoritas.

Lakukan itu untuk setiap piksel dan alun-alunnya keluar kosong. Inilah trik di balik setiap artikel “buang turis dari foto liburan Anda”, dan ia tidak butuh apa pun yang lebih pintar daripada sebuah burst dan kesabaran. Satu hal yang dituntutnya adalah bahwa **tidak ada bagian pemandangannya yang ditempati lebih dari separuh waktunya**. Orang yang berdiri diam di delapan dari dua belas bingkai Anda adalah mayoritas di piksel itu, dan mediannya akan menyimpannya.

### Keduanya: sigma clipping

Mediannya membuang sebagian besar informasinya demi mendapatkan ketegarannya — sebelas dari dua belas nilai Anda dibuang di setiap pikselnya, jadi ia mengurangi derau jauh lebih sedikit daripada yang akan dilakukan sebuah rata-rata atas kumpulan yang sama.

Sigma clipping adalah kompromi itu, dan ia biasanya bawaan yang benar untuk kumpulan dunia nyata mana pun. Ia melihat setiap piksel di seluruh bingkainya, memperhitungkan apa biasanya piksel itu dan seberapa banyak ia berubah-ubah, lalu merata-ratakan hanya nilai yang sepakat dengan itu. Sebuah mobil yang melintas di satu bingkai dikeluarkan dari piksel itu; setiap bingkai lain tetap dihitung di mana-mana. Anda mendapat kekebalan mediannya terhadap hal-hal yang bergerak dan sebagian besar pengurangan derau rata-ratanya.

Ambangnya dalam simpangan baku, dan dua adalah titik mulai yang biasa. Lebih rendah menolak lebih banyak, dan mulai menolak detail yang sungguhan bersama mobilnya.

### Hanya yang terang yang penting: terangkan

Simpan nilai paling terang yang pernah dimiliki setiap piksel. Foto langit malam sebagai dua ratus pencahayaan sepertiga puluh detik lalu terangkan mereka bersama-sama, dan setiap bintang menggambar busurnya sendiri melintasi hasilnya — sebuah jejak bintang, dirakit dari pencahayaan pendek yang masing-masing tidak pernah kelebihan cahaya. Metode yang sama merakit sebuah kembang api dari bingkai ledakannya sendiri, dan sebuah lukisan cahaya dari berjalan berkeliling ruangan gelap dengan sebuah senter.

Lawannya, gelapkan, adalah yang pendiam dari pasangan itu: sebuah piksel hanya tetap terang kalau ia terang di *setiap* bingkainya, jadi pantulan di sebuah jendela, lampu depan yang lewat, dan tetes hujan yang tercahayai lampu kilat semuanya lenyap.

### Subjeknya lebih dalam daripada fokusnya: penumpukan fokus

Bidikan makro pada f/8 punya mungkin satu milimeter yang terfokus, dan itu tidak cukup untuk seekor serangga. Jawabannya adalah mengambil dua puluh bingkai di sepanjang cincin fokus lalu menyimpan, dari masing-masing, hanya bagian yang tajam di dalamnya. Alatnya mengukur seberapa banyak setiap piksel berbeda dari tetangganya — besar di sebuah tepi, nyaris nol di sebuah keburaman — lalu mengambil pemenangnya.

Yang ini menginginkan tripod lebih daripada yang lain mana pun, karena memutar cincin fokusnya dengan tangan menggerakkan kameranya, dan bingkai yang diambil dari sedikit lebih jauh bukanlah gambar yang sama pada fokus yang berbeda.

![Daftar mode, rerata, median, paling terang, paling gelap, dengan rencana di bawahnya yang menyebut ukuran keluaran, memori yang dibutuhkan, dan seberapa banyak tiap berkas harus dibaca.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

Mode adalah pertanyaan bagian ini. Rencana di bawahnya adalah alat yang menyebut biaya prosesnya sebelum ia dimulai.

## Menyejajarkan bingkainya

Penumpukan adalah hitungan per piksel, jadi ia mengandaikan bahwa piksel tertentu adalah bagian pemandangan yang sama di setiap bingkainya. Kalau dipegang tangan, ia tidak: sebuah burst bergeser sejauh puluhan piksel, dan merata-ratakan itu menghasilkan keburaman alih-alih gambar yang bersih. Itulah alasan tunggal yang paling umum percobaan pertama menumpuk mengecewakan.

Jadi bingkainya diukur terhadap salah satu dari mereka lalu dipindahkan kembali ke tempatnya lebih dulu, sampai sepersekian piksel. Tiga setelan:

- **Geser saja** benar untuk hampir semua yang dipegang tangan. Ia membetulkan pergeserannya dan goyangannya.
- **Geser, rotasi, dan skala** untuk kumpulan yang Anda juga sedikit berputar, atau yang zoomnya merayap. Ia berbiaya satu pengukuran lagi per bingkai dan sama sekali tidak berbiaya apa pun ketika bingkainya ternyata lurus.
- **Tidak sama sekali** untuk tripod terkunci atau runtutan intervalometer, tempat bingkainya sudah sejajar dan mengukurnya adalah waktu yang terbuang.

Yang tidak bisa dibetulkan penyejajaran apa pun adalah subjek yang bergerak alih-alih kamera yang bergerak, dan ia juga tidak bisa membetulkan foto yang diambil dari satu langkah ke kiri. Bergeser ke samping mengubah seberapa banyak benda dekatnya bergeser relatif terhadap benda jauhnya, dan tidak ada satu koreksi pun yang menggambarkan keduanya sekaligus. Berputar di tempat tidak masalah; berjalan masalah.

![Hasilnya: gambar yang sudah ditumpuk, dengan catatan seberapa jauh tiap bingkai harus digeser agar sejajar dengan yang pertama.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Angka penyejajarannya layak dibaca. Rentetan foto tanpa tripod bergeser beberapa piksel per bingkai, dan itulah yang diam-diam dibatalkan penyejajarnya.

## Di mana file RAW cocok

Anda bisa menjatuhkan CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF, dan sisanya langsung, dan layak dinyatakan dengan tepat apa yang terjadi pada mereka, karena ia bukan yang dilakukan sebuah pengubah RAW.

Setiap file RAW sudah memuat sebuah **JPEG berukuran penuh yang digambar kameranya ketika ia mengambil bidikannya**. Ia yang ditampilkan punggung kameranya kepada Anda dan yang digambar sistem operasi Anda sebagai gambar mininya. Penumpuknya menemukan gambar itu lalu memakainya. Ia tidak mendekodekan data sensornya.

Dua akibatnya, satu baik dan satu layak diketahui:

- **Ia cepat.** Menemukan pratinjaunya berarti membaca beberapa kilobita direktori lalu satu irisan, jadi bingkai 60 MB terbuka kira-kira secepat sebuah JPEG. Dua puluh di antaranya terbuka dalam waktu yang akan dihabiskan sebuah pengubah RAW untuk satu. Halamannya menunjukkan kepada Anda betapa sedikit file Anda yang sebenarnya dibacanya.
- **Ia penggambaran kameranya, bukan penggambaran Anda.** Delapan bit per kanal, dengan keseimbangan putih dan gaya gambar yang disetel di kameranya — bukan dua belas atau empat belas bit data sensor linear yang akan Anda dapat dari sebuah pengubah.

Untuk pengurangan derau, jejak bintang, membuang orang yang lewat, dan penumpukan fokus, pertukaran itu hampir selalu layak diambil: pratinjaunya beresolusi penuh dan mereka toh yang akan Anda dapat sebagai sebuah JPEG. Kalau Anda mendorong bayangannya keras-keras, atau menumpuk untuk astrofotografi yang bit terakhir rentang dinamisnya adalah seluruh intinya, kembangkan bingkainya di sebuah pengubah RAW lebih dulu lalu tumpuk TIFF atau JPEG yang diberikannya. Itu masuk dengan cara yang sama.

## Berapa harganya untuk dijalankan

Layak diketahui karena itulah bedanya tumpukan yang memakan delapan detik dengan yang memakan dua menit.

Enam dari ketujuh metodenya hanya pernah perlu mengingat satu hal. Sebuah maksimum berjalan tidak peduli pada bingkai yang sudah dilihatnya, dan begitu juga sebuah total berjalan, jadi metode itu membaca setiap bingkai tepat sekali lalu memakai memori yang sama untuk seratus bingkai seperti untuk dua.

Mediannya tidak bisa bekerja begitu, karena Anda tidak bisa tahu nilai tengah sebuah kumpulan sampai Anda punya seluruhnya. Dua puluh bingkai 24 megapiksel adalah sekitar 1,4 GB piksel yang ditahan sekaligus, dan tidak ada peramban yang akan memberikannya kepada Anda, jadi gambarnya dipotong menjadi pita mendatar lalu ditumpuk sepita demi sepita — benar, dan lebih lambat, karena bingkainya dibaca lagi untuk setiap pitanya.

Alatnya memperhitungkan semua ini sebelum Anda menekan tombolnya lalu memberi tahu Anda: seberapa besar hasilnya nanti, kira-kira berapa banyak memori yang dibutuhkannya, dan berapa kali bingkai Anda akan didekodekan. Kalau ia bilang jalannya akan berpita, menurunkan resolusi kerjanya satu langkah memangkas memorinya menjadi seperempat dan hampir selalu mengubahnya kembali menjadi satu jalan tunggal — dan kalau Anda menumpuk untuk membuang derau, resolusi setengah toh sudah akan tampak lebih bersih daripada resolusi penuh.

## Memotret untuk itu

Sebagian besar kualitas sebuah tumpukan ditentukan sebelum perangkat lunak mana pun melihatnya.

- **Potret lebih banyak bingkai daripada dugaan Anda.** Kurva akarnya tidak kenal ampun di ujung bawahnya dan murah hati di ujung atasnya: naik dari empat ke sembilan bingkai adalah perubahan yang lebih besar dan terlihat daripada naik dari dua puluh ke empat puluh.
- **Jangan mengubah pencahayaannya antar bingkai.** Penumpukan mengandaikan bingkainya adalah pemandangan yang sama pada kecerahan yang sama. Kunci pencahayaannya, atau alatnya akan merata-ratakan dua gambar yang berbeda.
- **Untuk membuang orang, tunggu di antara bingkainya.** Sebuah burst yang diambil dalam dua detik menangkap orang yang sama di tempat yang sama di setiap bingkainya, dan mediannya menyimpannya. Sepuluh bingkai berselang beberapa detik bekerja jauh lebih baik daripada lima puluh dalam sebuah burst.
- **Untuk jejak bintang, jaga selanya tetap pendek.** Terangkan menggambar persis yang direkam bingkainya, jadi jeda antar pencahayaan menjadi sebuah garis putus yang terlihat di setiap jejaknya.

## Tidak satu pun dari ini meninggalkan mesin Anda

Setumpuk dua puluh bingkai RAW adalah sekitar satu gigabita foto, dan itu banyak untuk diserahkan kepada sebuah situs web demi diambil rata-ratanya. [Penumpuk Gambar](https://abox.tools/id/tumpuk-gambar/) membaca file-nya dari disk Anda sendiri lalu mengerjakan hitungannya di peramban Anda sendiri. Tidak ada langkah unggah, tidak ada akun, dan tidak ada antrean, dan Anda bisa memeriksa klaim itu seperti Anda akan memeriksa klaim siapa pun: buka panel jaringan peramban Anda selagi ia berjalan, atau sekadar cabut koneksi internet lalu tetap tumpuk mereka.

Pertanyaan terkaitnya — bagaimana tahu, untuk alat mana pun, apakah menyerahkan sebuah file kepadanya memang perlu — adalah [panduannya sendiri](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/).
