# Apakah aman memakai generator kata sandi online?

Kecurigaan Anda benar, dan layak dipertahankan: halaman yang membuat kata sandi adalah tepat halaman yang tidak boleh mengingatnya. Kabar baiknya, ini bisa diperiksa — keacakan dibuat di mesin Anda, pengiriman terlihat, dan generator yang menyimpan buatannya bisa tertangkap basah.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Kecurigaan di balik pertanyaan ini justru tepat, maka pertahankan. Halaman yang membuat kata sandi adalah satu-satunya halaman di web yang tidak menerima apa pun yang sensitif namun bisa *menyimpan* semua yang sensitif: keluarannya adalah rahasianya, dan generator yang mengirimkan buatannya bukanlah alat yang lemah melainkan koleksi kata sandi. Pertanyaannya tidak pernah apakah sebuah halaman generator tampak terpercaya. Pertanyaannya adalah apakah ia *bisa* menyimpan kata sandi itu kalau mau — dan itu, anehnya, bisa diperiksa.

Tiga hal yang memutuskan: dari mana keacakannya berasal, apakah hasilnya bisa meninggalkan halaman, dan apakah ada bagian hasil yang bisa ditebak. Ketiganya punya jawaban jujur yang bisa diperiksa pengunjung — lebih dari yang bisa dikatakan tentang aplikasi unduhan yang membuat kata sandi di jendela yang tak bisa diintip siapa pun.

## Dari mana keacakan peramban berasal

Setiap generator serius di peramban menimba dari sumur yang sama: `crypto.getRandomValues`, pembangkit acak kriptografis peramban, yang dibenihi dan terus dibenihi ulang oleh sistem operasi dari derau perangkat keras. Ia sumber yang sama tempat peramban menimba kunci TLS — enkripsi yang menjadi tumpuan koneksi bank Anda. Tidak ada arti yang berguna di mana program desktop punya akses ke keacakan yang lebih baik daripada halaman web; keduanya berakhir di sumur sistem yang sama.

Yang *tidak* boleh dipakai halaman adalah `Math.random()`, fungsi serba guna untuk melempar dadu. Peramban mengimplementasikannya dengan pembangkit cepat yang keadaan dalamnya bisa direka ulang dari segelintir keluaran beruntun — kata sandi yang dibangun di atasnya tampak acak dan bisa dihitung oleh siapa pun yang pernah melihat salah satunya. Ini bukan teori; sudah dibuktikan terhadap generator yang beredar, lebih dari sekali. Dan dari luar tak terlihat, itulah argumen terkuat untuk generator yang kodenya bisa dibaca: beda kedua fungsi itu satu kata di kode sumber.

Ada tingkat ketelitian yang lebih halus lagi. Mengubah kata acak 32 bit menjadi “angka di bawah 26” dengan sisa bagi sederhana sedikit sekali condong ke huruf-huruf awal; generator yang teliti mengundi ulang alih-alih mengambil sisa. [Generator di sini](https://abox.tools/id/pembuat-kata-sandi/) melakukannya — condong yang dihindarinya sekitar satu banding 165 juta, tak terlihat dalam pemakaian, dan persis jenis detail yang memisahkan alat yang dibangun untuk tugasnya dari potongan kode salinan forum.

## Apa yang bisa salah pada halaman generator

Sebut saja kegagalannya terang-terangan, karena masing-masing bisa diperiksa:

- **Mengirim kata sandi keluar.** Halaman membuatnya secara lokal, lalu mengeposkan buatannya — saat klik, lewat analitik, atau dirapel belakangan. Ini kegagalan yang menggugurkan, dan ia terlihat: harus berupa permintaan jaringan, dan permintaan bisa diawasi.
- **Membuat di server.** Kata sandi datang lewat jaringan alih-alih pergi lewat jaringan — artinya pengelola melihatnya lebih dulu, dan tentang cara pembuatannya Anda tidak belajar apa-apa. Pemeriksaan yang sama, arah sebaliknya.
- **Membuat dengan lemah.** `Math.random`, benih dari stempel waktu, daftar beberapa ratus kata yang dijual sebagai kuat. Yang ini tak tertangkap tab Jaringan mana pun; hanya kode sumber yang terbaca yang menangkapnya, atau penunjuk kekuatan yang jujur, dihitung dari pengaturan sebenarnya.
- **Menyimpan riwayat.** Dengan sok membantu mengingat dua puluh kata sandi terakhir Anda — di penyimpanan yang hidup lebih lama dari tabnya, di mesin yang mungkin dipakai bersama.

[Pembuat kata sandi dan frasa sandi](https://abox.tools/id/pembuat-kata-sandi/) situs ini dibangun kebal terhadap keempatnya sejak rancangan: `crypto.getRandomValues` dan tidak ada yang lain, pembuatan di halaman, tanpa penyimpanan jenis apa pun, tanpa riwayat, dan sebaris penunjuk kekuatan yang melaporkan persis berapa banyak hasil yang mungkin dengan pengaturan Anda. Daftar kata untuk frasa sandi adalah daftar Diceware EFF, disertakan tanpa perubahan di folder alatnya sendiri.

## Cara memeriksa generator mana pun, termasuk yang ini

Metode lengkapnya tertulis di [panduan tentang mengunggah](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/), dan inilah halaman yang pantas diperiksa lebih dulu dari halaman mana pun:

- **Cabut dulu colokannya.** Muat halamannya, putuskan koneksi, *baru* buat kata sandi. Kata sandi yang lahir tanpa koneksi tidak mungkin diambilkan dari luar dan tidak mungkin terkirim pada saat kelahirannya. Halaman ini tetap bekerja offline; itulah gunanya.
- **Awasi tab Jaringan sambil membuat.** Tekan tombolnya dan baca daftarnya: tidak boleh ada yang berangkat. Lalu salin kata sandinya, dan awasi lagi — saat penyalinan adalah momen yang akan dipilih halaman yang tidak jujur.
- **Cari apa yang dibutuhkan sebuah koleksi.** Akun, fitur sinkronisasi, daftar “baru saja dibuat”. Generator yang punya ingatan punya salinan.

Satu catatan jujur pantas menutup. Pemeriksaan memberi tahu apa yang dilakukan halaman selagi Anda menonton; kode yang diterbitkan dan disajikan terbaca — seperti semua di situs ini — memberi tahu apa yang dilakukannya secara umum. Tersisa mesinnya sendiri: tidak ada halaman web yang bisa melindungi kata sandi dari peramban yang sudah dibobol atau perangkat pengintai, dan generator bukan pengecualian. Yang dibelikan pemeriksaan itu untuk Anda lebih kecil dan nyata — kata sandi yang tak pernah dilihat server mana pun, dibuat oleh aritmetika yang boleh Anda baca.
