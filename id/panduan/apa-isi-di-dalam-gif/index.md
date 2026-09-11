# Apa sebenarnya isi di dalam sebuah GIF

GIF adalah setumpuk persegi panjang, masing-masing dengan sebuah pewaktu dan sebuah tabel warna, dan hampir setiap keluhan orang tentang formatnya berasal dari salah satu dari ketiga hal itu. Inilah apa yang dilakukan setiap bagiannya, dan bagaimana mencari tahu yang mana yang dipakai file Anda untuk membelanjakan ukurannya.

[Buka Penganalisis GIF](https://abox.tools/id/analisis-gif/): Bingkai, jeda, palet, dan ke mana setiap byte pergi.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

GIF adalah sebuah kanvas, sebuah daftar persegi panjang untuk dilukiskan ke atasnya, dan sebuah tabel warna yang mengatakan apa arti angka di dalam persegi panjang itu. Setiap persegi panjang membawa tiga hal: berapa lama membiarkannya terpasang, apa yang dilakukan padanya sesudahnya, dan secara opsional sebuah tabel warna miliknya sendiri.

Hampir semua yang dianggap orang mengejutkan tentang formatnya keluar dari daftar itu. Kalau GIF Anda raksasa, itu karena persegi panjangnya adalah seluruh kanvasnya setiap kali, atau karena ada tiga ratus tabel warna di dalamnya. Kalau ia diputar terlalu lambat, itu karena jedanya di bawah sebuah lantai yang tidak akan dilewati peramban mana pun. Kalau ia mengotor, itu kolom yang disebut *pembuangan*.

Untuk melihat yang mana dari itu untuk file tertentu, buka [Penganalisis GIF](https://abox.tools/id/analisis-gif/) lalu jatuhkan file-nya. Sisa halaman ini adalah apa arti angka-angkanya.

![Kartu ringkasan sebuah GIF: versinya, ukuran kanvasnya, ukuran berkasnya, jumlah bingkainya, berapa kali ia berulang, dan berapa warna yang dipakainya.](https://abox.tools/screens/whats-inside-a-gif/facts.webp)

Semua yang tidak pernah ditampilkan pemutar, dari satu berkas.

## Bingkai adalah persegi panjang, bukan gambar

Inilah bagian yang mengejutkan orang yang hanya pernah melihat GIF diputar. Sebuah bingkai bukan gambar animasinya pada momen itu. Ia sebuah persegi panjang, dengan posisi dan ukurannya sendiri, dilukiskan di atas apa pun yang ditinggalkan bingkai sebelumnya.

Persegi panjang itu bisa berupa seluruh kanvasnya, dan di file yang dibuat dengan buruk ia selalu begitu. Tapi sebuah GIF boleh menyimpan hanya bagian gambarnya yang berubah sejak bingkai terakhir — dan ketika sebagian besar gambarnya diam, itulah bedanya file 12 MB dengan file 900 KB. Itulah sebabnya rekaman layar sebuah jendela yang sebagian besar diam bisa kecil, dan sebabnya rekaman yang sama dari pengubah yang sembrono tidak.

Anda tidak bisa tahu Anda punya yang mana dengan menonton animasinya. Keduanya tampak identik. Satu-satunya cara melihatnya adalah melihat apa yang disimpan setiap bingkainya, dan itu tampilan yang dimiliki penganalisisnya persis karena alasan ini: alihkan ke *hanya yang disimpan setiap bingkai* dan Anda entah melihat sederet bentuk kecil di atas latar transparan, yang berarti pengodenya bekerja, entah melihat seluruh gambarnya lagi dan lagi, yang berarti tidak.

Tidak ada kompensasi gerak di mana pun dalam formatnya. Tidak ada yang pernah disimpan sebagai “sama seperti terakhir tapi digeser empat piksel ke kiri”, seperti yang akan dilakukan sebuah kodek video. Trik persegi-panjang-yang-berubah adalah satu-satunya penghematan yang dimiliki GIF, dan ia sangat berharga.

## Jeda, dan lantai yang ditegakkan setiap peramban

Setiap bingkai menyimpan berapa lama menahannya, dalam perseratus detik. Itulah satu-satunya satuan yang dipunyai formatnya, jadi tercepat yang bisa diminta sebuah file adalah 0,01 detik — seratus bingkai sedetik — dan terlama adalah sekitar 655 detik.

Ia tidak akan mendapat seratus bingkai sedetik. **Setiap peramban membulatkan jeda di bawah 0,02 detik naik ke 0,10.** Aturannya ditulis ke dalam Netscape Navigator pada 1996, untuk bola dunia berputar dan papan sedang-dibangun beranimasi masa itu, dan setiap peramban sesudahnya menyalinnya. Tidak ada yang pernah mencabutnya, dan tidak akan ada.

Jadi GIF yang bingkainya semua berkata 0,01d diputar pada sepuluh bingkai sedetik, bukan seratus. Ia berjalan sepuluh kali lebih lambat daripada niat apa pun yang membuatnya, dan file-nya tidak memberi petunjuk soal ini: jedanya di dalamnya persis seperti yang diminta. Inilah kejutan tunggal yang paling umum di formatnya, dan itulah sebabnya penganalisisnya melaporkan dua durasi — apa yang dikatakan file-nya, dan apa yang sebenarnya akan dilakukan sebuah peramban dengannya.

Solusinya, di mana pun file-nya dibuat, adalah menulis 0,02 alih-alih 0,01. Itu memberi 50 bingkai sedetik, yang merupakan langit-langit yang sesungguhnya, dan lebih cepat daripada yang dibutuhkan apa pun. Pada praktiknya 0,05d — dua puluh bingkai sedetik — kira-kira secepat yang layak diminta.

Satu hal lagi yang diberitahukan jedanya kepada Anda. Kalau semuanya identik, file-nya dibuat dari sekumpulan bingkai pada laju tetap. Kalau mereka berserak — 0,04 di sini, 0,11 di sana — sesuatu mengubah sebuah video lalu membuang bingkai, meregangkan tetangganya untuk menutupi celahnya. Dan kalau yang terakhir jauh lebih panjang daripada sisanya, itu disengaja: begitulah cara Anda membuat sebuah animasi berhenti sejenak sebelum ia berputar lagi.

## Pembuangan: kolom yang menentukan apakah ia mengotor

Setiap bingkai mengatakan apa yang seharusnya tertinggal di layar ketika waktunya habis. Ada empat jawaban yang mungkin dan mereka layak diketahui, karena tiga dari empat cara sebuah animasi bisa tampak keliru adalah kolom ini yang keliru.

- **Biarkan di tempatnya.** Bingkai berikutnya melukis langsung di atas yang ini. Benar ketika bingkainya buram dan saling menutupi sepenuhnya, dan pilihan yang paling murah, karena tidak ada yang harus dibersihkan.
- **Bersihkan kembali ke latarnya.** Persegi panjang bingkainya dihapus sebelum yang berikutnya menggambar. Inilah yang dibutuhkan transparansi: tanpanya, bagian tembus pandang bingkai berikutnya menampilkan bingkai sebelumnya di bawahnya, dan animasi berisi gambar terpisah berubah menjadi tumpukan gambar.
- **Pulihkan apa yang ada di bawahnya.** Apa pun yang ada di kanvasnya sebelum bingkai ini menggambar ditaruh kembali. Begitulah objek kecil yang bergerak di atas latar diam disimpan — setiap bingkai melukis objeknya, lalu latarnya kembali, dan hanya persegi panjang objeknya yang pernah ditulis.
- **Tidak dinyatakan.** File-nya tidak mengatakan. Setiap penampil memperlakukannya sebagai “biarkan di tempatnya”, dan itu biasanya benar dan sesekali menjadi sebab sebuah GIF transparan mengotor.

Satu detail tempat spesifikasinya dan kenyataannya berpisah jalan. “Bersihkan kembali ke latarnya” menyebutkan sebuah warna latar di header file-nya, dan setiap peramban mengabaikannya lalu membersihkan menjadi transparan. Mereka sudah begitu selama dua puluh lima tahun. File yang mengandalkan warna latar itu muncul akan tampak benar bagi siapa pun yang membuatnya di apa pun yang membuatnya, dan keliru di mana-mana lain.

## Tabel warna, dan 768 byte yang dimakannya

Sebuah piksel GIF bukan sebuah warna. Ia sebuah angka, yang menunjuk ke dalam sebuah tabel berisi paling banyak 256 warna, masing-masing disimpan sebagai tiga byte. Tabel penuh karena itu 768 byte, dan sebuah file bisa punya satu yang dipakai bersama semuanya, atau satu per bingkai, atau keduanya.

Kedua pengaturannya sah dan mereka bertukar secara berbeda:

- **Satu tabel bersama** adalah 768 byte untuk seluruh file-nya, dan ia menjaga warnanya tetap stabil antar bingkai. Kerlipan GIF — kilauan tidak enak pada file yang dibuat dari video — sangat sering sekadar paletnya yang terhuyung dari bingkai ke bingkai.
- **Satu tabel per bingkai** membiarkan setiap bingkai memakai warna yang tidak dimiliki tabel bersamanya, dan itu penting ketika adegannya berubah total. Ia berbiaya 768 byte setiap kali. Pada animasi 300 bingkai itu 230 KB tabel warna sebelum satu piksel pun disimpan.

Ada ongkos kedua yang lebih tenang. Panjang sebuah tabel warna harus pangkat dua, jadi bingkai yang memakai sembilan warna tetap mendapat tabel berisi enam belas dan bingkai yang memakai 130 tetap mendapat 256. Sebagian pembulatan ke atas tidak terhindarkan. File yang tabelnya menyatakan lima ribu warna yang tidak pernah dirujuk pikselnya adalah hal lain: palet yang dibangun untuk gambar selain yang akhirnya berada di bingkainya. Penganalisisnya menandai entri yang tidak terpakai supaya bentuk hal itu terlihat sekilas.

## Ke mana byte-nya sebenarnya pergi

Setiap byte sebuah GIF ada di salah satu dari sejumlah kecil tempat, dan layak diketahui tempat apa saja itu sebelum memutuskan sebuah file terlalu besar.

- **Piksel terkompres.** Pada file yang sehat, hampir semuanya. Gambarnya sendiri, dilewatkan melalui LZW — skema kompresi dari 1984 yang dirancang untuk tangkapan layar lembar kerja, dan itulah sebabnya ia bagus pada warna datar dan buruk pada foto.
- **Tabel warna.** 768 byte per tabel penuh, seperti di atas.
- **Header per bingkai.** Delapan byte pewaktuan dan sebelas byte deskriptor untuk setiap bingkai. Bukan apa-apa pada file normal; pada animasi berisi dua ribu bingkai mungil, 38 KB.
- **Pembingkaian blok.** Data terkompresnya dipotong menjadi rangkaian berisi paling banyak 255 byte, masing-masing dengan sebuah byte panjang di depannya. Sekitar satu byte dari setiap 256, tidak terhindarkan, dan layak dilihat karena kalau tidak ia tak terlihat.
- **Metadata.** Komentar, profil warna, dan paket XMP. Inilah yang menghasilkan hasil yang sungguh konyol: sebuah penyunting gambar bisa meninggalkan 40 KB XML yang menggambarkan sebuah suntingan yang dibuat bertahun-tahun lalu, dan pada GIF yang kecil itu sebagian besar file-nya. Tidak ada penampil yang menggambar satu pun darinya.

Alasan melihat ini sebagai sebuah tabel alih-alih menebak adalah jawabannya berbeda untuk file yang berbeda, dan solusinya mengikuti jawabannya. File yang 95% piksel terkompres sekadar berisi banyak gambar, dan hanya lebih sedikit bingkai, ukuran yang lebih kecil, atau lebih sedikit warna yang akan membantu. File yang 30% tabel warna atau 40% XMP punya masalah yang jauh lebih murah.

![Batang yang memecah sebuah GIF menurut ke mana bitanya pergi, dengan satu baris per bingkai berisi ukurannya dan bagiannya dari berkas.](https://abox.tools/screens/whats-inside-a-gif/budget.webp)

Ke mana bitanya benar-benar pergi, bingkai demi bingkai. GIF yang terlalu besar hampir selalu besar karena alasan yang dibuat jelas oleh ini.

## Perputaran bukan bagian dari formatnya

Tidak ada kolom di spesifikasi GIF yang mengatakan sebuah animasi berulang. Perputaran berasal dari sebuah blok yang ditemukan Netscape pada 1995 — sebuah “application extension” dengan teks `NETSCAPE2.0` di dalamnya — yang toh diwujudkan segala hal dan yang kini ada di setiap GIF beranimasi di internet.

Artinya file tanpa blok itu diputar tepat sekali lalu berhenti, di setiap peramban, dan tampak rusak bagi siapa pun yang membuatnya. Kalau sebuah animasi hanya diputar sekali, blok itulah yang hilang; ia salah satu hal pertama yang layak diperiksa dan ia tak terlihat di penampil mana pun.

Bloknya juga bisa menyebutkan sebuah hitungan — putar lima kali lalu berhenti. Nol berarti selamanya, dan itulah yang dikatakan hampir setiap file.

## Hal-hal lain yang bisa dibawa sebuah GIF

Tiga blok yang tidak menyimpan gambar dan yang dilewati setiap penampil:

- **Komentar.** Teks bebas, biasanya nama apa pun yang menulis file-nya, sesekali sesuatu yang tidak akan dipilih penulisnya untuk diterbitkan. Tidak ada yang menampilkannya, dan setiap salinan file-nya membawanya.
- **XMP.** Metadata XML milik Adobe: apa yang menyunting file-nya, kapan, kadang siapa. Ia tiba dengan sebuah ekor ajaib 258 byte di ujungnya, sebuah trik untuk membuat panjang bloknya keluar benar, dan itulah sebabnya membacanya secara naif memberi Anda selayar penuh biner.
- **Plain text.** Sebuah blok dari spesifikasi 1989 yang meminta penampilnya menggambar teks di atas gambarnya dalam sebuah kisi sel. Ia tidak pernah diwujudkan apa pun. Kalau sebuah file punya satu, apa pun yang dikatakannya tidak akan muncul.

Ketiganya layak diketahui sebelum mengirim sebuah file ke suatu tempat: mereka bagian dari sebuah GIF yang bisa mengatakan sesuatu tentang Anda, dan mereka selamat dari setiap penyalinan dan pengunggahan ulang kecuali ada yang sengaja membersihkannya.

## Membaca file yang rusak

GIF bisa terpotong — unduhan yang berhenti, file yang dipulihkan dari disk yang mulai gagal, sesuatu yang ditulis setengah oleh sebuah aplikasi. Karena formatnya sebuah aliran blok alih-alih satu struktur terindeks, GIF yang terpotong biasanya masih terbaca sampai titik ia berhenti: setiap bingkai sebelum putusnya utuh dan lengkap.

Itu layak diketahui karena kebanyakan perangkat lunak akan sekadar menolak file-nya. Penganalisis yang membaca sejauh yang bisa lalu mengatakan di mana ia berhenti setidaknya akan memberi tahu Anda berapa banyak yang selamat, dan apakah bagian yang hilang itu satu bingkai atau dua ratus yang terakhir.

Masalah sebaliknya juga ada: byte yang duduk *setelah* penanda akhir file-nya. Setiap dekoder berhenti di penanda itu, jadi mereka tidak pernah dibaca dan tidak pernah digambar, dan mereka biasanya file kedua yang ditempelkan ke yang pertama oleh sesuatu yang tidak beres. Mereka beban murni dan memotongnya tidak menghilangkan apa pun.

## Tidak satu pun dari ini butuh unggahan

Membaca struktur sebuah GIF bukan pekerjaan yang menuntut — ia sebuah penyusuran melalui daftar blok dan satu dekompresor kecil — dan tidak pernah ada alasan teknis untuk mengirim file-nya ke sebuah server untuk melakukannya. [Penganalisis GIF](https://abox.tools/id/analisis-gif/) di sini melakukan seluruhnya di halamannya: penyusuran bloknya, LZW-nya, bingkai yang digambar di layar, dan perhitungan byte-nya.

Itu lebih penting untuk pekerjaan ini daripada kebanyakan yang lain, karena file yang paling ingin dibongkar orang sering kali file yang paling tidak mereka yakini untuk dibagikan — sesuatu yang dipulihkan, sesuatu yang dikirimkan seseorang kepada mereka, sesuatu yang ada blok komentarnya yang belum mereka baca. [Argumen yang lebih panjang tentang mengunggah file](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) berlaku di sini sekuat di mana pun di situs ini.
