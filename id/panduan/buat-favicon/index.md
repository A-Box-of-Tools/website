# Cara membuat favicon yang tetap terbaca pada enam belas piksel

Favicon bukan gambar kecil dari logo Anda. Ia sekumpulan gambar pada ukuran tetap, di dalam sebuah wadah yang tidak pernah dibuka kebanyakan orang, dan yang terkecil di antaranya adalah yang sebenarnya dilihat semua orang. Inilah ukuran mana yang Anda butuhkan, file apa yang mendampinginya, dan apa yang dilakukan ketika logo Anda tidak selamat dalam perjalanannya ke bawah.

[Buka Gambar ke ICO](https://abox.tools/id/buat-favicon/): Satu gambar masuk. Setiap ukuran yang diminta peramban, Windows, atau sebuah Mac, keluar.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Gambar ke ICO](https://abox.tools/id/buat-favicon/), jatuhkan sebuah gambar persegi berukuran setidaknya 256 piksel, biarkan prasetelnya di *Favicon situs web*, lalu unduh `favicon.ico`. Taruh di akar situs Anda, sehingga ia menjawab di `https://situsanda.com/favicon.ico`. Alamat itu diminta setiap peramban entah HTML Anda menyebutnya atau tidak, jadi tidak ada lagi yang benar-benar harus Anda lakukan.

Semua di bawah ini adalah bagian yang membuat bedanya ikon yang secara teknis ada dengan ikon yang terbaca: ukuran mana yang masuk, apa yang diminta iPhone dan Android sebagai gantinya, dan apa yang dilakukan ketika logo Anda tidak selamat menjadi selebar enam belas piksel.

## Kenapa ia sekumpulan ukuran alih-alih satu gambar

File `.ico` adalah sebuah wadah. Di dalamnya ada beberapa gambar utuh dari benda yang sama pada ukuran yang berbeda, dan apa pun yang membaca file-nya memilih yang paling dekat dengan ukuran yang dibutuhkannya.

Itu terdengar seperti pemborosan padahal bukan. Peramban yang menggambar ikon Anda pada enam belas piksel punya dua pilihan: membaca versi enam belas piksel yang Anda gambar, atau mengecilkan yang lebih besar di tempat. Yang kedua lebih buruk, dan kelihatan — pengecilan otomatis sebuah logo yang rinci menghasilkan bubur, sedangkan versi enam belas piksel yang sudah Anda lihat adalah sesuatu yang sempat Anda sederhanakan. Seluruh alasan formatnya menyimpan beberapa ukuran adalah untuk memberi Anda kesempatan itu.

Tiga ukuran adalah kelaziman untuk sebuah situs web, dan masing-masing punya alasan:

- **⁦16×16⁩** — tab peramban, bilah alamat, menu markah. Inilah yang dilihat orang. Kalau Anda hanya bisa membenarkan satu, benarkan yang ini.
- **⁦32×32⁩** — bilah markah, pintasan desktop Windows ke situs Anda, dan kebanyakan peramban di layar berkepadatan tinggi, yang menggambar ikon tabnya dari 32 lalu menskalakannya turun.
- **⁦48×48⁩** — ukuran ketika Google membaca ikon sebuah situs untuk hasil pencarian, dan tampilan ikon sedang Windows.

Apa pun yang lebih besar pantasnya di sebuah PNG di sebelah `.ico`-nya, bukan di dalamnya, karena alasan yang muncul di bagian file ponsel di bawah.

![Daftar prasetel dengan ukuran yang tercakup di masing-masing: enam belas, tiga puluh dua, dan empat puluh delapan piksel untuk ikon situs, serta ringkasan isi berkasnya.](https://abox.tools/screens/make-a-favicon/preset.webp)

Sebuah .ico adalah wadah, dan inilah daftar isinya. Prasetelnya adalah jalan pintas menuju kumpulan yang benar-benar diminta peramban.

## Masalah enam belas piksel

Inilah bagian yang tidak diperingatkan siapa pun kepada Anda. Enam belas piksel kira-kira empat milimeter di layar biasa: sebuah kisi berisi 256 titik seluruhnya, lebih sedikit daripada huruf di kalimat ini. Hampir tidak ada yang dirancang untuk berhasil di sebuah papan nama, kartu nama, atau header situs web yang selamat ketika dikecilkan ke sana.

Yang lenyap, berurutan:

- **Teks.** Logo kata yang dikecilkan ke dalam sebuah persegi tingginya sekitar tiga piksel. Ia tidak menjadi teks kecil, ia menjadi sebatang abu-abu. Inilah sebabnya hampir setiap perusahaan yang punya lambang sekaligus nama memakai lambangnya saja sebagai faviconnya, dan sebabnya yang tidak punya lambang memakai satu huruf.
- **Garis tipis.** Tepi selebar satu piksel di logo 512 piksel adalah sepertiga puluh dua piksel pada enam belas. Ia tergambar sebagai kabut abu-abu samar di sepanjang tepinya, atau lenyap.
- **Gradien dan bayangan.** Tidak ada ruang untuk sebuah peralihan. Bayangan jatuh yang lembut menjadi rumbai kotor.
- **Detail di dalam detail.** Ikon sebuah dokumen bertulisan menjadi sebuah persegi panjang bercoreng.

Solusinya bukan sebuah setelan, melainkan gambar yang berbeda: sebuah lambang yang disederhanakan dengan satu atau dua bentuk, kontras tinggi, dan tanpa teks di luar satu karakter. Gambar versi itu pada 32 atau 48 piksel dengan sengaja, lalu pakai sebagai sumbernya.

Yang bisa dilakukan sebuah alat adalah menunjukkan masalahnya kepada Anda sebelum Anda menerbitkannya. Pratinjau di [Gambar ke ICO](https://abox.tools/id/buat-favicon/) menggambar setiap ukuran pada ukuran sebenarnya di layar, dan itulah satu-satunya cara menilai ini — ikon enam belas piksel yang ditampilkan pada enam puluh empat tampak baik-baik saja dan tidak memberi tahu Anda apa-apa.

![Deretan pratinjau yang menampilkan tanda yang sama digambar pada enam belas, tiga puluh dua, empat puluh delapan, enam puluh empat, dan seratus dua puluh delapan piksel.](https://abox.tools/screens/make-a-favicon/sizes.webp)

Versi enam belas pikselnya, di sebelah yang Anda rancang. Gambar inilah yang memutuskan apakah tandanya perlu disederhanakan.

## Logo Anda tidak persegi. Isi sisanya atau pangkas?

Ikon selalu persegi, dan kebanyakan logo tidak, jadi sesuatu harus terjadi. Ada tiga jawaban dan ketiganya tidak sama baiknya.

**Mengisi sisanya** menjaga seluruh gambarnya lalu menaruh ruang di atas dan di bawahnya. Ia bawaan yang aman dan pilihan yang keliru untuk logo kata yang lebar: memaskan sesuatu yang tiga kali lebih lebar daripada tinggi ke dalam sebuah persegi membuatnya menempati sepertiga tingginya, dan pada enam belas piksel itu lima piksel logo dan sebelas piksel ketiadaan.

**Memangkas ke bagian tengah** mengambil persegi terbesar dari tengahnya. Untuk sebuah gabungan — lambang dengan nama perusahaan di sebelahnya — ini sering memotong keduanya sekaligus. Lebih baik pangkas sumbernya sendiri lebih dulu, sampai tinggal lambangnya saja, lalu ubah yang itu.

**Meregangkan** menjepit gambarnya supaya muat. Hampir tidak ada keadaan yang membuat ini benar, dan ia ditawarkan terutama supaya alatnya tidak diam-diam melakukannya.

Jawaban umum untuk logo yang lebar: jangan ubah logonya. Ubah bagian darinya yang berhasil berdiri sendiri.

## Transparan atau latar padat?

Transparan biasanya benar untuk sebuah situs web. Tab peramban berwarna abu-abu, putih, atau nyaris hitam tergantung perambannya dan temanya, dan ikon transparan duduk di atas semuanya. Ikon yang latar putihnya sudah terlukis adalah persegi panjang putih di bilah tab yang gelap.

Dua pengecualian yang layak diketahui:

- **Logo yang gelap dan tidak lebih** lenyap dalam mode gelap. Kalau lambang Anda pada dasarnya hitam di atas putih, beri ia latar berwarna alih-alih yang transparan, atau sebuah siluet terang.
- **Ikon sentuh Apple harus buram.** iOS menggambarnya di ubinnya sendiri yang bersudut bulat lalu menggambarkan transparansinya sebagai hitam. Alat mana pun yang menghasilkan file itu seharusnya meratakannya untuk Anda; yang di sini melakukannya, ke putih secara bawaan.

## File yang dibutuhkan sebuah situs web yang bukan .ico-nya

`favicon.ico` mencakup peramban dan Windows. Ia tidak mencakup ponsel, dan di sinilah kebanyakan set ikon buatan sendiri berhenti terlalu awal. Tiga lapak lain meminta file mereka sendiri, dengan nama mereka sendiri, dan tidak satu pun akan melihat ke dalam sebuah `.ico`:

- **iOS** membaca `apple-touch-icon.png` pada ⁦180×180⁩ ketika seseorang menambahkan situs Anda ke layar utamanya. Tanpa itu, iOS memakai tangkapan layar halamannya, dan itu tampak seperti kekeliruan.
- **Android dan setiap ajakan pemasangan** membaca sebuah manifes aplikasi web — `site.webmanifest` — yang menunjuk ke PNG 192 dan 512 piksel. Yang 512 juga yang ditampilkan sebuah aplikasi web di layar pembukanya.
- **Ubin menu mulai Windows** membaca `browserconfig.xml`, yang menunjuk ke sebuah PNG ⁦150×150⁩. Yang paling kecil kepentingannya dari ketiganya, dan empat baris XML.

Ada satu lagi yang gampang keliru: peluncur Android memangkas ikon adaptif ke bentuk apa pun yang disukai ponselnya — lingkaran, persegi membulat, persegi bersudut bulat — dan hanya bagian tengah 80% gambarnya yang dijamin selamat. Ikon yang digambar dari tepi ke tepi kehilangan sudutnya. Itulah yang dimaksud ikon *maskable*: gambar yang sama digambar dengan sengaja kecil di dalam perseginya, dinyatakan terpisah di dalam manifesnya.

Mencentang set situs web di [Gambar ke ICO](https://abox.tools/id/buat-favicon/) menghasilkan semua itu, manifesnya, dan blok HTML yang menunjuk ke mereka. Satu hal yang sengaja ditinggalkan blok itu adalah sebuah `<link>` untuk `favicon.ico`: peramban meminta alamat itu dengan sendirinya, dan menyebutnya juga membuat file yang sama diambil dua kali.

## Ikon aplikasi Windows adalah set yang berbeda

Kalau ikonnya untuk sebuah program alih-alih sebuah situs, ukurannya berubah. Yang dimuat `app.ico` bawaan milik Visual Studio sendiri adalah 16, 32, 48, dan 256 — ketiga ukuran shell-nya ditambah yang besar yang menjadi sumber gambar menu mulai dan tampilan sangat besar Explorer.

Di layar berkepadatan tinggi, Windows juga meminta 20, 24, 40, 64, dan 96, lalu mengambil sampel ulang dari ukuran terdekat yang dimilikinya ketika mereka tidak ada. Apakah itu penting tergantung ikon Anda: bentuk yang datar selamat dari pengambilan sampel ulangnya, yang rinci tidak. Menambahkannya kira-kira menggandakan file-nya, dan untuk sebuah aplikasi itu sama sekali bukan apa-apa — hitungannya sama sekali berbeda dari sebuah favicon, yang diambil setiap pengunjung.

Satu hal lagi soal ukuran: entri 256-nya adalah tempat byte-nya berada. Disimpan tanpa kompresi ia 264 KB sendirian; disimpan sebagai PNG di dalam ikonnya ia biasanya di bawah 30. Entri PNG sudah bisa dibaca sejak Windows Vista, jadi satu-satunya alasan menghindarinya adalah perangkat lunak yang memang sungguh lebih tua daripada itu, atau sebuah pemasang atau alat tersemat yang membaca ikonnya sendiri.

## Sebuah Mac membaca file yang sama sekali berbeda

Kalau ikonnya untuk aplikasi Mac alih-alih aplikasi Windows, tidak satu pun di atas berlaku: macOS sama sekali tidak membaca `.ico`. Ia membaca `.icns`, yang gagasannya sama dalam bungkus yang berbeda — beberapa ukuran dalam satu wadah — dengan tiga perbedaan yang layak diketahui.

- **Ukurannya tetap.** Apple menerbitkan sepuluh slot dan tidak ada yang perlu dipilih: 16, 32, 64, 128, 256, 512, dan 1024 piksel, dengan 32, 256, dan 512 muncul dua kali karena masing-masing sekaligus ukuran tersendiri dan versi Retina dari ukuran di bawahnya.
- **Ia naik sampai 1024.** Sebuah `.ico` berhenti di 256, dan itulah sebabnya file ikon Mac berukuran beberapa ratus kilobita dan sebuah favicon lima belas. Untuk aplikasi yang dikirimkan sekali itu bukan apa-apa; hanya faviconlah yang diambil setiap pengunjung.
- **1024 piksel adalah yang harus dilalui karya seni Anda.** Kedua masalahnya adalah dua ujung berlawanan dari gambar yang sama: sebuah favicon harus berhasil ketika ia mungil, dan ikon Mac harus bertahan ketika ia raksasa. Logo yang diekspor pada 512 lalu ditiup menjadi 1024 tampak lembek di layar Retina, dan App Store tidak akan menerimanya.

Untuk memakainya: sebuah paket aplikasi menyimpannya di `YourApp.app/Contents/Resources/` lalu menamainya di `Info.plist`. Untuk sebuah folder atau image disk, pilih `.icns`-nya di Finder, tekan Command-C, lalu buka Get Info pada benda yang ingin Anda ubah, klik ikon kecil di kiri atas, dan tekan Command-V.

Mencentang *ikon macOS* di [Gambar ke ICO](https://abox.tools/id/buat-favicon/) menulis satu, dengan atau tanpa file Windows di sebelahnya. Apa pun yang dirilis di kedua lapak menginginkan keduanya, dan keduanya digambar dari gambar yang sama dalam satu jalan.

## Memeriksa bahwa ia berhasil

Peramban menyinggahkan favicon lebih keras daripada hampir apa pun lain, jadi “saya sudah mengunggahnya dan tidak ada yang berubah” biasanya sebuah singgahan alih-alih sebuah kekeliruan. Dua hal untuk dicoba sebelum Anda mulai menyunting file lagi:

- Buka `https://situsanda.com/favicon.ico` langsung. Kalau file-nya terunduh, ia ada di sana dan Anda sedang melihat sebuah singgahan. Kalau Anda mendapat 404, ia tidak di akarnya.
- Muat situsnya di jendela pribadi, yang biasanya punya singgahan ikonnya sendiri.

Di Windows, sebuah `.ico` bisa diperiksa dengan menaruhnya di sebuah folder lalu mengganti-ganti ukuran tampilan Explorer: kecil, sedang, besar, dan sangat besar menggambar entri yang berbeda dari file yang sama, jadi Anda bisa melihat masing-masing sebagaimana sistemnya akan melihatnya.

Di sebuah Mac, sebuah `.icns` terbuka di Preview, yang mendaftar setiap slotnya di sisinya — dan trik yang sama bekerja di Finder: jatuhkan di sebuah folder lalu seret penggeser ukuran di opsi tampilannya untuk memperhatikannya bertukar-tukar di antara gambar di dalamnya.

## Tidak satu pun dari ini butuh unggahan

Menskalakan sebuah gambar adalah sesuatu yang sudah dilakukan setiap peramban bertahun-tahun, dan sebuah `.ico` adalah header enam byte, enam belas byte per gambar, lalu gambarnya. Tidak ada langkah dalam membuatnya yang menuntut sebuah server, dan alat di sini tidak memakai satu: `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

Itu layak dipedulikan di sini lebih daripada biasanya. Logo yang diserahkan ke pembuat favicon gratis cukup sering adalah merek yang belum dirilis — ikonnya salah satu hal pertama yang dibuat dan salah satu hal terakhir yang diumumkan. Muat halamannya, cabut koneksi internet, lalu buat satu kalau Anda lebih suka memeriksa daripada diberi tahu. [Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain yang bisa Anda jalankan pada alat mana pun.
