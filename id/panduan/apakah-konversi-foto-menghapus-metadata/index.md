# Apakah mengonversi foto menghapus metadatanya?

Kadang-kadang, dan kedua jawaban itu sudah pernah membakar orang. Mengodekan ulang lewat kanvas melucuti semuanya; pengonversi yang teliti membawa semuanya; gambarnya tampak sama pada kedua kasus. Satu-satunya langkah yang andal adalah berhenti meramal dan melihat berkasnya.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Kadang-kadang. Mengonversi, mengubah ukuran, atau mengompres foto akan menghapus metadatanya bila alatnya membangun ulang gambar dari piksel, dan menyimpannya bila alatnya sengaja memindahkannya — dan tidak ada apa pun di layar yang memberi tahu yang mana yang terjadi. Gambarnya tampak sama pada kedua kasus, karena metadata memang tidak pernah menjadi bagian dari gambar.

Kedua akhirnya sama-sama mengejutkan, ke arah yang berlawanan. Ada yang mengandalkan “cuma mengubah ukuran” untuk menghapus lokasi, dan lokasinya selamat. Ada pula yang mengandalkan tanggal pemotretan bertahan melewati ganti format, dan tanggal itu lenyap. Kedua kekeliruan itu obatnya sama: berhenti meramal apa yang kira-kira dilakukan sebuah alat, dan lihat apa yang sungguh ada di dalam berkas.

## Apa yang ikut menumpang, dan mengapa terpisah

Berkas foto adalah dua hal dalam satu wadah: gambar yang terkodekan, dan satu blok penanda tentangnya — EXIF, sering ditemani XMP dan profil warna. Penandanya biasanya memuat kapan foto diambil, kamera dan lensanya, pencahayaan, koordinat GPS tempat Anda berdiri, dan sering pula sebuah gambar mini tertanam — kadang gambar sebagaimana adanya *sebelum* penyuntingan, itulah sebabnya pemotongan bisa gagal membuang justru yang dipotongnya. Tur lengkap blok itu ada di [panduan EXIF](https://abox.tools/id/panduan/hapus-data-exif-dan-gps/).

Titik yang menentukan segalanya: penanda berada *di samping* piksel, bukan di dalamnya. Alat yang mendekodekan gambar menerima piksel tanpa penanda; apa pun yang ditulisnya keluar hanya memuat yang ia pilih untuk dikembalikan. Alat yang menyunting berkas tanpa mengodekan ulang bisa membiarkan penanda tak tersentuh — atau mencabut tepat penanda itu dan tidak yang lain.

## Mengapa mengodekan ulang melucuti, dan menyalin menyimpan

Hampir semua kerja gambar di peramban lewat kanvas: dekodekan berkas jadi piksel mentah, ubah, kodekan berkas baru. Kanvas tidak membawa penanda, maka berkas barunya tidak punya — bukan karena kebijakan melainkan karena konstruksi. Itulah sebabnya [pengompres gambar](https://abox.tools/id/kompres-gambar/) dan alat [pengubah ukuran gambar](https://abox.tools/id/ubah-ukuran-gambar/) di sini menghasilkan keluaran tanpa EXIF, tanpa GPS, tanpa XMP, dan halaman keduanya mengatakannya: tak terhindarkan — dan layak diketahui bila Anda justru ingin tanggalnya bertahan.

Pengonversi, sebaliknya, bisa bersusah payah untuk mempertahankan. [Pengonversi HEIC ke JPG](https://abox.tools/id/heic-ke-jpg/) situs ini melakukan persis itu: mengangkat blok metadata dari wadah HEIC dan memasangnya di JPEG, tanggal, GPS, dan semuanya — karena konversi semestinya foto yang sama berganti mantel. (Satu penanda sengaja ditulis ulang: orientasi, supaya gambar tidak rebah; dan blok itu hanya muat di keluaran JPEG — menu formatnya bilang begitu.) Dua alat yang jujur, dua perilaku berlawanan, masing-masing benar untuk tugasnya — dan justru karena itulah menebak dari jenis alat tidak jalan.

Di luar peramban, gambarannya sama campur-baurnya, dengan logika yang sama di bawahnya. Tangkapan layar dan hasil ekspor adalah pengodean segar: tanpa metadata kamera. Aplikasi pesan mengompres ulang dengan keras, jadi foto yang dikirim sebagai foto biasanya kehilangan penandanya — tetapi berkas yang sama dikirim “sebagai dokumen” berjalan byte demi byte, penanda termasuk. Lampiran email dan drive awan memindahkan berkas tanpa perubahan. Polanya bertahan: dibangun ulang berarti dilucuti, disalin berarti disimpan.

## Memeriksa alih-alih menganggap

Pemeriksaannya kurang dari semenit: buka berkas keluarannya — bukan aslinya — di [penampil dan penghapus EXIF](https://abox.tools/id/hapus-data-exif/) dan baca apa yang ada. Ia mengurai berkas di mesin Anda sendiri dan menampilkan setiap penanda, gambar mini tertanam termasuk. Tidak ada apa-apa, tidak ada yang bocor. Masih ada, dan Anda melihat persis apa.

Dari semua di atas lahir tiga kebiasaan:

- **Kalau tujuannya privasi, hapus dengan sengaja.** Lucuti penandanya dengan alat EXIF — ia menyunting berkas tanpa mengodekan ulang, jadi gambarnya tidak kehilangan apa-apa — lalu periksa hasilnya. Jangan bergantung pada pengubahan ukuran yang kebetulan ikut melucuti.
- **Kalau tujuannya menjaga catatan, konversikan dengan alat yang menyatakan mempertahankan** — dan periksa juga, karena “mungkin tersimpan” gagal ke arah satunya: arsip foto yang tanggal-tanggalnya menguap juga sebuah kehilangan.
- **Periksa berkas yang benar-benar Anda kirim**, setelah langkah terakhir rantai Anda. Tiap alat memutuskan sendiri-sendiri, dan hanya isi berkas terakhir yang dihitung.

Dan kalau alat pemeriksanya sendiri halaman web, pertanyaan yang biasa berlaku juga padanya — penampil metadata menerima foto Anda, GPS dan semuanya. Yang di sini berjalan sepenuhnya di peramban Anda tanpa mengirim apa pun ke mana pun, dan [panduan tentang mengunggah](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) menunjukkan cara membuktikan klaim itu alih-alih memercayainya.
