# Foto yang disimpan ponsel Anda, dan format yang tidak mau dibuka apa pun

iPhone menyimpan foto sebagai HEIC, yang lebih kecil dan lebih baik daripada JPEG dan yang masih ditolak sangat banyak perangkat lunak. Inilah apa sebenarnya format itu, berapa harga pengubahannya bagi gambarnya, dan kenapa hampir setiap pengubah ingin Anda mengunggahnya lebih dulu.

[Buka HEIC ke JPG](https://abox.tools/id/heic-ke-jpg/): Foto yang dibuat iPhone, dalam format yang bisa dibuka apa saja.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pengubah HEIC ke JPG](https://abox.tools/id/heic-ke-jpg/), jatuhkan fotonya, lalu tekan “Ubah”. Biarkan penggeser kualitasnya di tempatnya dan biarkan “simpan tanggal, kamera, dan setelannya” tercentang kecuali Anda punya alasan lain. Anda mendapat JPEG kembali, satu tombol unduh masing-masing, atau sebuah zip kalau ada beberapa.

Tidak ada yang diunggah saat Anda melakukannya. Itu tidak biasa untuk pekerjaan yang satu ini, dan alasannya adalah separuh yang menarik dari halaman ini.

![Kartu opsi: menu format di JPEG, penggeser kualitas di 85, dan sakelar untuk mempertahankan tanggal, kamera, dan lokasi dari berkas aslinya.](https://abox.tools/screens/convert-heic-to-jpg/options.webp)

Seluruh konversi hanya tiga hal ini. Sakelar metadata yang layak dihentikan sejenak, dan bagian di bawah menyebut alasannya.

## Apa sebenarnya HEIC itu

HEIC sebenarnya bukan format gambar seperti halnya JPEG. Ia sebuah wadah — struktur kotak yang sama yang menyusun sebuah MP4 — dengan sebuah bingkai diam video **HEVC** di dalamnya. HEVC, yang juga disebut H.265, adalah kodek yang menggantikan kodek yang dipakai camcorder lama Anda, dan ia sangat bagus: foto iPhone dalam HEIC kira-kira separuh ukuran foto yang sama sebagai JPEG pada kualitas yang sama.

Apple beralih ke sana di iOS 11, pada 2017, dan menjadikannya bawaan. Artinya, kecuali seseorang sudah masuk ke Settings lalu memilih “Most Compatible”, setiap foto yang diambil ponsel mereka selama hampir satu dekade ada dalam format yang:

- tidak akan dipratinjau Windows tanpa sebuah ekstensi dari Store;
- ditolak mentah-mentah kebanyakan formulir unggahan web;
- tidak pernah didengar sangat banyak perangkat lunak desktop yang lebih tua;
- dan tidak akan ditampilkan peramban web mana pun selain Safari.

Fotonya baik-baik saja. Ia file yang lebih baik daripada JPEG-nya nanti. Ia sekadar ditulis dalam bahasa yang tidak pernah dipelajari sebagian besar dunia.

## Kenapa hanya Safari yang membukanya

Inilah bagian yang menjelaskan setiap pengubah yang pernah Anda pakai, jadi ia layak satu paragraf.

Mendekodekan HEVC butuh sebuah dekoder HEVC, dan HEVC itu dipatenkan. Perizinannya dikelola lebih dari satu kumpulan paten, dan mengirimkan sebuah dekoder berarti membayar seseorang. Peramban menangani ini dengan bersandar pada sistem operasinya — Chrome akan memutar *video* HEVC di mesin yang perangkat kerasnya sudah punya dekoder berlisensi — tapi jalur itu dipasang untuk pemutaran video dan bukan untuk gambar diam. Jadi HEIC yang diserahkan ke `<img>` ditolak, di Chrome, Firefox, dan Edge sama saja, di setiap sistem operasi.

Safari di perangkat keras Apple adalah pengecualiannya, karena macOS dan iOS punya dekodernya dan Safari boleh memintanya. Di semua tempat lain, gambarnya sekadar tidak bisa didekodekan peramban.

Yang meninggalkan sebuah pengubah tepat dua pilihan, dan pilihan di antara keduanya adalah seluruh cerita alat semacam ini.

## Kenapa hampir setiap pengubah HEIC menginginkan unggahan

Pilihan satu: taruh dekodernya di sebuah server. Fotonya diunggah, didekodekan di mesin yang belum pernah Anda lihat, dikodekan ulang sebagai JPEG, lalu dikirim kembali. Inilah yang dilakukan hampir setiap “pengubah HEIC daring gratis”, dan itulah sebabnya mereka semua butuh file Anda. Itu bukan kemalasan — perambannya memang sungguh tidak bisa melakukannya tanpa bantuan.

Berapa harganya layak dinyatakan dengan blak-blakan. Foto dari sebuah ponsel adalah file paling pribadi yang dimiliki kebanyakan orang, dan HEIC yang langsung dari iPhone biasanya membawa koordinat tempat ia diambil, akurat sampai beberapa meter, berikut tanggalnya sampai ke detik dan sebuah pengenal kamera. Mengunggah satu folder penuh ke layanan gratis berarti menyerahkan gambarnya sekaligus itu. Apa yang terjadi berikutnya diatur oleh kebijakan privasi yang tidak Anda baca, di sebuah server yang tidak bisa Anda periksa, di sebuah yurisdiksi yang tidak Anda pilih.

Pilihan dua: taruh dekodernya di halamannya. Itulah yang dilakukan [yang ini](https://abox.tools/id/heic-ke-jpg/). Ia membawa `libheif`, yang dikompilasi menjadi WebAssembly, sebagai file yang disajikan dari situs ini — sekitar 1,4 MB, diunduh sekali lalu disinggahkan. Peramban Anda menjalankannya di mesin Anda sendiri, di perangkat keras Anda sendiri, dan fotonya tidak pergi ke mana pun. Muat halamannya sekali dan Anda bisa mencabut koneksi internet sama sekali dan ia terus bekerja, dan itu hal yang tidak bisa dilakukan pengubah yang mengunggah dan bukti paling sederhana yang ada.

1,4 MB itu seluruh harganya. Kalau Anda memakai koneksi berkuota, itu ongkos yang nyata dan layak diketahui; itulah sebabnya halamannya mengatakannya dengan lantang alih-alih mengunduhnya diam-diam.

## Berapa harga pengubahannya bagi gambarnya

HEIC dan JPEG adalah kodek yang berbeda, jadi tidak ada jalan menyeberang yang tidak melibatkan pendekodean gambarnya lalu pengodeannya lagi. Pengodean kedua itu merugikan. Pada praktiknya ini jauh kurang penting daripada kedengarannya:

- **Pada kualitas 92** — tempat pengubahnya mulai — sebuah foto sangat sulit dibedakan dari aslinya pada ukuran pandang normal mana pun. Anda akan mencari perbedaan di gradien yang mulus, seperti langit yang cerah, dan Anda umumnya tidak akan menemukannya.
- **JPEG-nya akan lebih besar.** Biasanya di suatu tempat antara sepertiga lebih besar dan dua kali lipat ukurannya, karena JPEG adalah kodek dari 1992 dan HEVC bukan. Itulah pertukarannya: file yang lebih besar yang bisa dibuka segala hal.
- **Mengubah dua kali itulah yang harus dihindari.** Setiap pengodean yang merugikan berbiaya sedikit. Ubah dari HEIC aslinya, bukan dari JPEG yang sudah dibuatkan seseorang untuk Anda, dan kerjakan sekali.

Kalau Anda sama sekali tidak ingin kehilangan apa pun, PNG ada di menu formatnya. Siapkan diri untuk file-nya: sebuah foto sebagai PNG biasanya lima sampai sepuluh kali ukuran JPEG-nya, karena kompresi PNG dirancang untuk warna datar dan gambar garis alih-alih untuk rumput dan kulit.

## Tanggal, kamera, dan koordinatnya

Keluhan yang biasa tentang pengubah HEIC adalah fotonya kembali sudah kehilangan hari pengambilannya, sehingga foto seliburan penuh terurut ke dasar galeri di bawah tanggal hari ini. Itu terjadi karena mengubah lewat sebuah kanvas memberi Anda piksel dan tidak lebih — sebuah kanvas tidak menyimpan tag — jadi kecuali sebuah pengubah pergi mengambil metadatanya secara terpisah, ia sekadar hilang.

Alat di sini menyalin blok EXIF-nya dari HEIC-nya lalu menuliskannya ke JPEG-nya, jadi tanggalnya selamat. Ada sebuah kotak centang, dan ia tercentang secara bawaan. Lepas centangnya dan JPEG-nya keluar dengan gambarnya dan tidak lebih.

Sebelum Anda memutuskan, lihat daftarnya: baris setiap foto mengatakan apakah file-nya membawa koordinat GPS, dan ia mengatakannya sebelum apa pun diubah. Kalau fotonya akan pergi ke suatu tempat yang publik, itulah baris yang harus dibaca. Kalau mereka akan masuk ke galeri Anda sendiri, menyimpan metadatanya hampir pasti yang Anda mau.

Satu tag diubah apa pun yang Anda pilih, dan layak diketahui kenapa. Sebuah HEIC merekam rotasinya di dua tempat: di wadahnya, dan di blok EXIF-nya. Dekodernya menerapkan rotasi wadahnya sambil mendekodekan, jadi piksel yang diserahkan sudah tegak. Kalau EXIF-nya lalu masih berkata “putar ini 90 derajat”, sebuah penampil akan melakukannya sekali lagi dan setiap foto potret akan keluar miring. Jadi tag orientasinya disetel ke tegak dan semua yang lain disalin persis seperti yang ditulis ponselnya.

Kalau yang Anda mau adalah menelusuri tagnya dengan rinci, atau membersihkannya dari foto yang sudah berupa JPEG, itu pekerjaan yang berbeda dan ada [panduannya sendiri](https://abox.tools/id/panduan/hapus-data-exif-dan-gps/).

## Hal-hal yang menjebak orang

- **HEIC bernama “.jpg”.** Sangat umum: sesuatu di sepanjang jalan menamainya ulang tanpa mengubahnya, dan itulah sebabnya ia tetap tidak mau terbuka. Setiap file yang dijatuhkan ke pengubahnya dikenali dari byte pertamanya alih-alih dari namanya, jadi salah satu dari ini bekerja dengan baik. Itu juga sebabnya file yang memang sungguh JPEG diberi tahu begitu alih-alih diubah menjadi salinan dirinya sendiri.
- **Satu file, beberapa gambar.** Sebuah burst atau Live Photo bisa menyimpan lebih dari satu gambar diam. Semuanya diubah, dan yang tambahan dinomori mengikuti nama aslinya. Bagian video sebuah Live Photo adalah file terpisah yang disimpan ponselnya di sebelah HEIC-nya, jadi ia tidak ada di sana untuk diubah.
- **AVIF bukan HEIC.** Keduanya mirip — wadah yang sama, kodek yang berbeda di dalamnya — tapi setiap peramban masa kini membuka sebuah AVIF secara bawaan, jadi tidak ada yang perlu diubah dan alatnya mengatakannya alih-alih berpura-pura bekerja.
- **Menghentikan masalahnya di sumbernya.** Di ponselnya: Settings → Camera → Formats → Most Compatible. Foto baru menjadi JPEG sejak saat itu. Ia memakai lebih banyak penyimpanan dan ia tidak menyentuh foto yang sudah Anda punya, tapi ia berarti tidak pernah melakukan ini lagi.
- **Berbagi kadang sudah mengubah.** Meng-AirDrop atau mengirim surel sebuah foto ke perangkat non-Apple sering menyerahkan sebuah JPEG, karena iOS mengubahnya di jalan keluar. Kalau sebuah foto toh tiba sebagai HEIC, ia menyeberang lewat rute yang tidak begitu.

## Bagaimana tahu apakah sebuah pengubah mengunggah

Ini berlaku untuk alat mana pun, bukan hanya yang ini, dan ia memakan sekitar lima belas detik.

1. Buka halamannya, lalu buka alat pengembang peramban Anda dan pergi ke tab Network.
2. Ubah sebuah foto, dan perhatikan. Alat yang mendekodekan di mesin Anda sama sekali tidak membuat permintaan pada saat itu. Alat yang mengunggah membuat satu seukuran foto Anda, dan Anda bisa melihat ukurannya.
3. Atau, lebih sederhana: muat halamannya, putuskan koneksi internet, lalu coba ubah sesuatu. Alat yang mengirim foto Anda pergi untuk didekodekan berhenti bekerja. Alat yang membawa dekodernya tidak.

Pengubah di sini dibangun untuk lolos kedua pemeriksaan itu, dan ada versi yang lebih panjang dari argumen ini di [amankah mengunggah file](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/).
