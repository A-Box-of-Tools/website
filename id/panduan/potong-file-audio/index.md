# Cara memotong audio tanpa kehilangan kualitas

Potongan audio bisa mendarat pada saat persis yang Anda tandai, di setiap pemutar, selalu — dan itu tidak berlaku untuk video. Ini menjelaskan kenapa, apa satu jebakan yang sesungguhnya, dan apa yang dilakukan tentangnya.

[Buka Pemotong Audio](https://abox.tools/id/potong-audio/): Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu file, dipotong di tempat yang Anda sebutkan.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pemotong Audio](https://abox.tools/id/potong-audio/), jatuhkan rekamannya, tekan `I` dan `O` untuk menandai setiap bagian yang Anda mau — sebanyak yang Anda suka — lalu ekspor. Setiap potongan mendarat pada sampel persis yang Anda tandai, sampel yang disimpan keluar seperti saat ia masuk, dan sambungannya mendapat lesapan lima milidetik supaya tidak bisa berdetak.

Itulah seluruh pekerjaannya. Sisa halaman ini adalah tentang kenapa ketepatannya nyata alih-alih klaim pemasaran, dan tentang satu hal yang memang keliru ketika Anda menyambung dua potong suara.

## Kenapa potongan audio bisa tepat padahal potongan video tidak

Video tidak disimpan sebagai runtutan gambar utuh — itu akan sangat besar. Kebanyakan bingkai disimpan sebagai keterangan tentang bedanya mereka dengan tetangganya, jadi mereka tidak bisa didekodekan sendirian. Hanya sebuah **keyframe** yang berdiri sendiri, dan keyframe biasanya berjarak satu sampai sepuluh detik. Pemotong yang menyalin bingkai karena itu tidak bisa mulai di mana pun Anda suka: ia harus mulai di sebuah keyframe, dan itulah sebabnya video yang dipotong kadang mulai satu dua detik sebelum tanda Anda. [Panduan videonya](https://abox.tools/id/panduan/potong-video/) sebagian besar tentang itu.

Suara tidak punya padanannya. Begitu sebuah rekaman didekodekan, ia sebuah rangkaian angka — satu per kanal, puluhan ribu kali sedetik — dan setiap satunya berdiri sepenuhnya sendiri. Sampel 1.234.567 tidak butuh sampel 1.234.566 untuk menjadi bermakna. Jadi sebuah potongan bisa dibuat di sampel mana pun, dan "tepat di tempat yang Anda tandai" berarti persis begitu: tanda Anda dalam detik, dikali laju sampelnya, dibulatkan ke sampel utuh terdekat. Pada 48 kHz pembulatan itu paling banyak sepuluh mikrodetik.

Juga tidak ada perilaku yang tergantung pemutar untuk dikhawatirkan. Video yang dipotong bergantung pada sebuah tanda sunting yang dipatuhi kebanyakan pemutar dan diabaikan sebagian; WAV yang dipotong sekadar sampelnya, jadi tidak ada lagi yang bisa diperselisihkan sebuah pemutar.

## Jebakannya: sebuah sambungan adalah keterputusan

Inilah hal yang sebenarnya keliru ketika Anda memotong audio, dan alasan pemotong yang baik punya sebuah setelan untuknya.

Suara adalah gelombang. Ketika Anda memotong dari tengah satu kata langsung ke tengah kata lain, sampel di ujung potongan pertama dan sampel di awal potongan kedua sama sekali tidak berhubungan: bentuk gelombangnya bisa melompat dari dekat puncak rentangnya ke dekat dasarnya dalam satu sampel. Kerucut pengeras suara yang disuruh membuat lompatan itu membuat suara paling tajam yang sanggup dibuatnya, dan Anda mendengarnya sebagai sebuah **detak** atau tik di sambungannya.

Ini tidak ada hubungannya dengan kehilangan kualitas atau dengan formatnya. Ia terjadi pada potongan yang sempurna tanpa kehilangan dari rekaman yang sempurna bersih. Ia sekadar bunyi sebuah keterputusan. Pemotong yang memotong pada sampel yang tepat dan tidak melakukan apa pun lagi akan berdetak di sebagian sambungan dan tidak di sebagian lain, sepenuhnya tergantung di mana di dalam bentuk gelombangnya kedua ujungnya kebetulan mendarat.

## Apa sebenarnya yang dilakukan lesapan lima milidetik

Solusinya adalah menurunkan levelnya ke sunyi tepat sebelum potongannya lalu menaikkannya kembali tepat sesudahnya, sehingga tidak ada lagi lompatan yang harus dibuat. Itulah seluruh yang dimaksud dengan “lesapan” di sini: sebuah landaian yang diterapkan pada beberapa ratus sampel di setiap tepinya.

Panjangnya adalah bagian yang menarik. Lima milidetik kira-kira dua ratus empat puluh sampel pada 48 kHz. Itu cukup panjang bagi kerucutnya untuk bergerak — detaknya hilang sama sekali — dan jauh terlalu pendek untuk didengar sebagai sebuah lesapan: lima milidetik kira-kira seperlima waktu yang dibutuhkan untuk mengucapkan satu konsonan. Anda tidak akan merasakan levelnya bergerak. Anda hanya akan merasakan bahwa sambungannya bersih.

Lesapan yang lebih panjang ditawarkan karena sebagian bahan menginginkannya. Dua puluh atau lima puluh milidetik layak dijangkau ketika Anda menyambung musik, tempat hal yang terpotong adalah nada yang bertahan alih-alih sebuah suku kata dan landaian terpendek masih bisa meninggalkan letupan yang terdengar. Ucapan hampir tidak pernah butuh lebih dari lima.

Sebuah lesapan hanya pantas berada di tepi yang *memang* sebuah potongan. Kalau sebuah bagian mulai tepat di awal rekamannya, tidak ada yang dibuang di depannya — file-nya memang mulai di sana sebelum apa pun dipotong — jadi melesapkannya masuk akan menjadi suntingan yang tidak diminta siapa pun. Alat di sini menaruh lesapan hanya di tempat sebuah sambungan ada, dan itulah sebabnya tidak memotong apa pun sama sekali membiarkan setiap sampel tak tersentuh.

![Kartu ekspor: menu kedalaman bit, panjang pudar dalam milidetik, dan ringkasan yang menghitung bagiannya, sambungannya, dan durasinya.](https://abox.tools/screens/trim-an-audio-file/export.webp)

Pudarnya hanya diterapkan pada sambungan, dan itulah detail yang penting: pudar di awal sebuah rekaman akan menjadi perubahan yang tidak diminta siapa pun.

## Memotong sebuah MP3, dan kenapa yang keluar adalah WAV

Anda bisa membuka sebuah MP3, M4A, Ogg, atau file Opus lalu memotongnya. Yang kembali adalah sebuah WAV, dan layak dinyatakan dengan jelas pertukaran apa yang diwakilinya alih-alih menyajikannya sebagai sebuah fitur.

Ada dua cara memotong audio terkompres. Satu adalah memotong data terkompresnya langsung, memindahkan bingkai terkodekan yang utuh ke sebuah file baru tanpa mendekodekannya. Itu menjaga file-nya tetap kecil dan tidak mengorbankan kualitas — tapi sebuah bingkai MP3 panjangnya sekitar dua puluh enam milidetik, jadi setiap potongan dibulatkan ke batas bingkai terdekat, dan itu versi audio dari masalah keyframe. Ia juga pekerjaan yang khas per format: pembaca MP3 tidak memotong file Opus apa pun.

Cara yang lain adalah mendekodekan, memotong pada sampel yang tepat, lalu menuliskan sampelnya. Tidak ada yang dibulatkan, setiap format yang bisa diputar peramban bekerja dengan cara yang sama, dan lesapannya bisa ada sama sekali — Anda tidak bisa melandaikan level yang belum Anda dekodekan. Ongkosnya adalah sampelnya harus dituliskan kembali dalam suatu format, dan tidak ada peramban yang mengirimkan pengode MP3 atau AAC yang bisa dipakai di sini. Sebuah WAV tidak butuh pengode: ia sampelnya dengan sebuah header pendek di depan, jadi langkah itu tidak bisa kehilangan apa pun.

Akibat praktisnya: yang keluar jauh lebih besar daripada yang masuk — kira-kira sepuluh megabita semenit dalam stereo — dan ia tidak *lebih baik* daripada MP3 asalnya, karena kompresi yang sudah terjadi tidak bisa diurungkan. Segala hal bisa membuka sebuah WAV, dan apa pun yang butuh sebuah MP3 bisa membuatnya dari situ dalam satu langkah.

## Menandai beberapa bagian sekaligus

Kebanyakan pemotong daring memberi Anda satu pasang pegangan lalu bertanya bentangan tunggal mana yang disimpan. Itu menjawab pertanyaan yang keliru untuk kebanyakan rekaman nyata. Wawancara satu jam tidak punya satu bagian yang bagus; ia punya enam, tersebar, dan Anda menemukannya dengan mendengarkannya sekali.

Jadi tandai sambil Anda mendengarkan: `I` di tempat sebuah bagian mulai, `O` di tempat ia berakhir, sebanyak yang Anda suka. Setiap pasang menjadi sebuah baris yang bisa Anda ubah waktunya atau susun ulang, dan sebuah pita yang digambar di atas bentuk gelombangnya. File jadinya adalah baris-baris itu yang disambung berurutan.

Daftar tanda yang sama juga menjawab pertanyaan sebaliknya. Kalau yang Anda mau hilang adalah "eee"-nya, dering telepon, dan awalan yang gagal, tandai *itu* lalu beralihlah ke “potong keluar” — semua yang tidak Anda tandai yang disambung sebagai gantinya. Tandanya sama bagaimanapun juga, jadi Anda bisa bolak-balik di antara keduanya lalu memperhatikan panjang jadinya berubah tanpa menandai apa pun dua kali.

Menandai itu pekerjaan yang cermat, dan tab yang tertutup tidak boleh mengorbankannya, jadi tandanya disimpan sebagai file teks biasa lalu bisa dimuat kembali. Tata letaknya adalah tata letak yang ditulis [pemotong video](https://abox.tools/id/potong-video/), dan itu berarti tanda yang dibuat pada sebuah video bisa dijatuhkan ke audio hasil ekstraksinya dan sebaliknya.

## Lihat bentuk gelombangnya

Menandai suara dengan menggeser-geser pemutar itu tebak-tebakan; menandainya dengan mata tidak. Sunyi tampak seperti sunyi, batuk tampak seperti batuk, dan empat detik nada ruangan sebelum seseorang mulai bicara langsung terlihat alih-alih harus dicari.

Ini paling penting untuk tanda yang sedikit dikelirukan orang: awal sebuah kalimat biasanya sebaiknya duduk di keheningan *sebelum* tarikan napasnya, bukan sesudahnya, dan ujungnya biasanya sebaiknya menyisakan satu ketuk nada ruangan alih-alih dipotong pada konsonan terakhirnya. Keduanya gamblang di gambarnya dan hampir mustahil dikenai dengan telinga saja. Seret ujung sebuah bagian yang ditandai di sepanjang bentuk gelombangnya untuk menggesernya.

![Bentuk gelombang dengan dua bagian ditandai, jeda antarkalimat terlihat jelas, dan tabel berisi awal, akhir, dan durasi tiap bagian.](https://abox.tools/screens/trim-an-audio-file/marks.webp)

Jeda-jeda itu adalah tempat seseorang berhenti bicara. Itulah yang membuat bentuk gelombang layak dilihat, tidak seperti sebuah stopwatch.

## Memotong bukan melesapkan, dan bukan menyunting

Tiga kata yang saling dipakai untuk yang lain. Memotong mengubah bagian mana dari rekamannya yang selamat. Sebuah lesapan — yang jenis musikal, selama beberapa detik — adalah efek yang disengaja pada levelnya, dan beberapa milidetik yang dijelaskan di atas bukan itu; mereka penghilangan detak yang kebetulan memakai hitungan yang sama.

Kalau yang Anda mau adalah rekamannya diputar mundur, dipercepat, diperlambat tanpa nadanya bergeser, atau dinaikkan karena ia direkam terlalu pelan, itulah [Penyunting Audio](https://abox.tools/id/sunting-audio/). Ia dekoder yang sama dan penulis WAV yang sama; ia hanya melakukan hitungan yang berbeda di antaranya.

## Kenapa ini tidak butuh unggahan

Memotong adalah hitungan atas sebuah larik. Peramban sudah punya sebuah dekoder — ia dekoder yang sama yang memutar file-nya di sebuah elemen `<audio>` — dan begitu sampelnya didekodekan, menyimpan sebagian dan membuang sisanya adalah sebuah penyalinan. Tidak ada langkah dalam keterangan itu yang bisa dikerjakan sebuah server dengan lebih baik, dan sekali perjalanan bolak-balik ke sana akan menjadi bagian terlambat dari seluruh pekerjaannya.

Ia juga jenis file yang mengunggahnya lebih mahal daripada dugaan orang. Rekaman adalah suara: wawancara, kuliah, panggilan, pesan suara, sesi terapi, seorang anak yang mengucapkan sesuatu yang ingin Anda simpan. Alat di sini tidak punya fitur jaringan dalam bentuk apa pun, dan `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

Cabut koneksi internet lalu potong sebuah rekaman kalau Anda lebih suka memeriksa daripada diberi tahu. [Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain seperti itu.
