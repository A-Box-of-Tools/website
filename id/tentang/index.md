# Tentang abox.tools

Satu orang, di Ontario, membangun alat-alat yang terus-menerus ia butuhkan dan terus-menerus tidak ia percayai. Semua di sini berjalan di perangkat Anda sendiri, kodenya terbuka, dan halaman ini berisi alasan di balik keduanya.

Terakhir diperbarui 27 Agustus 2026

## Apa ini

abox.tools adalah kumpulan alat kecil yang masing-masing mengerjakan satu hal: mengubah ukuran foto, memotong video, menggabungkan dua PDF, membaca apa yang sebenarnya ada di dalam sebuah kode QR. Saat ini ada 44, ditambah satu [kumpulan panduan](https://abox.tools/id/panduan/) tentang pekerjaan yang alat-alat itu tangani.

Yang tidak biasa bukan apa yang mereka kerjakan, melainkan di mana mereka mengerjakannya. Semuanya berjalan sepenuhnya di dalam peramban Anda, di perangkat keras Anda sendiri, memakai dekoder dan enkoder yang memang sudah dibawa peramban itu. Tidak ada satu pun berkas yang Anda buka dikirim ke mana-mana. Di balik halaman-halaman ini juga tidak ada server yang bisa menerimanya: seluruh situs ini berupa berkas statis, dan alat-alatnya adalah modul JavaScript biasa yang disajikan di sebelahnya.

Itulah produknya. Sisa halaman ini menjelaskan mengapa membangunnya seperti itu sepadan, dan siapa yang melakukannya.

## Siapa yang membuatnya

Satu orang, bekerja sendirian, di Ontario, Kanada. Ini bukan perusahaan. Tidak ada tim, tidak ada investor, tidak ada induk usaha, dan tidak ada rencana untuk diakuisisi siapa pun. Surat masuk ke [hi@abox.tools](mailto:hi@abox.tools) dan sampai ke orang yang menulis kodenya; [halaman kontak](https://abox.tools/id/kontak/) menjelaskan untuk apa alamat itu cocok dan untuk apa tidak.

Situs ini sengaja diterbitkan tanpa nama penulis pribadi. Ini proyek kecil, bukan merek pribadi, dan yang pantas dipercaya di sini bukanlah sebuah nama di bawah halaman, melainkan [kodenya](https://github.com/A-Box-of-Tools/website), yang bisa dibaca siapa saja, dan perilaku halamannya sendiri, yang bisa diperiksa siapa saja dalam kira-kira tiga puluh detik dengan alat pengembang terbuka. Dua hal itu bisa diverifikasi. Sebuah nama tidak.

## Mengapa dibangun seperti ini

Cara biasa membangun alat semacam ini adalah mengunggah berkasnya, mengerjakan pekerjaannya di server, lalu mengirim hasilnya kembali. Cara itu lebih mudah, jalan di perangkat apa pun, dan itulah yang dilakukan hampir semua “konverter online gratis”.

Cara itu juga berarti menyerahkan berkas Anda kepada orang asing. Untuk sebuah meme, itu tidak penting. Untuk pindaian paspor, citra medis, kontrak yang sudah ditandatangani, atau foto yang membawa alamat rumah Anda di metadatanya, itu sangat penting. Begitu berkas berada di perangkat orang lain, apa yang terjadi padanya bergantung pada kebijakan dan kecermatan mereka, dan Anda tidak punya cara untuk mengaudit keduanya. Kebijakan privasi situs seperti itu adalah janji, bukan batasan teknis.

Peramban kini sudah cukup baik sehingga janji itu tidak lagi diperlukan. Peramban bisa membaca dan menulis JPEG, PNG, dan WebP; bisa membongkar dan mendekode video; bisa menghitung hash sebuah berkas, membaca kode QR, dan menulis PDF. Kalau pekerjaannya bisa terjadi di perangkat Anda sendiri, maka “apakah berkas saya akan mereka simpan?” berhenti menjadi pertanyaan tentang niat siapa pun dan berubah menjadi pertanyaan tentang apa yang secara fisik bisa dilakukan kodenya. Dan yang itu bisa Anda jawab sendiri.

Itulah seluruh argumennya, dan ada panduan yang membahasnya dengan semestinya: [apakah aman mengunggah file ke sebuah situs web?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/)

## Memeriksa, bukan mempercayai

Setiap pernyataan di atas memang dibuat untuk diuji. Empat cara, dari yang paling ringan:

- **Cabut sambungan internet.** Muat halaman alat mana pun, putuskan sambungan, lalu tetap pakai. Alatnya terus berjalan, karena di dalamnya memang tidak pernah ada langkah jaringan. Alat yang mengirim berkas Anda ke luar untuk diproses akan berhenti di situ.
- **Perhatikan jaringannya.** Buka alat pengembang, masuk ke tab Network, lalu proses sebuah berkas. Tidak ada satu pun permintaan yang membawa berkas Anda, gambar kecilnya, namanya, atau satu bita pun isinya. Yang terlihat adalah halamannya, skripnya, iklannya, dan penghitung kunjungan.
- **Baca aturan yang halaman ini terapkan pada dirinya sendiri.** Setiap halaman membawa `Content-Security-Policy` yang menyebut setiap alamat yang boleh ia hubungi, dan tidak satu pun milik situs ini. Bahkan kesalahan di dalam kode pun tidak akan bisa mengirim berkas ke mana-mana, karena peramban akan menolak sambungannya.
- **Baca kodenya.** Kodenya [terbuka seluruhnya](https://github.com/A-Box-of-Tools/website), tanpa langkah build dan tanpa bundler: apa yang ada di repositori adalah bita per bita apa yang dijalankan peramban Anda. Setiap alat punya README yang menjelaskan cara kerjanya, dan setiap halaman alat menyebut berkas mana yang paling layak dibaca lebih dulu.

Ada tepat satu pengecualian yang disengaja dari “tanpa jaringan”, dan pengecualian itu dijelaskan panjang lebar di halamannya sendiri: [Berbagi Teks](https://abox.tools/id/berbagi-teks/) memindahkan teks antara dua perangkat milik Anda sendiri, dan itu memang tidak bisa dilakukan tanpa jaringan. Alat itu membuka satu sambungan ke perantara yang tidak menyimpan apa pun dan yang hanya diberi tahu bahwa ada dua peramban yang ingin dipertemukan.

## Bagaimana alat-alat ini dibuat dan diperiksa

Sebuah alat dirilis ketika ia bekerja pada berkas yang nyata, bukan ketika ia bekerja pada berkas yang dipakai saat menulisnya. Dalam praktiknya itu berarti mencobanya sendiri di peramban dengan masukan yang merepotkan: video tanpa keyframe tepat di tempat Anda ingin memotong, HEIC dari ponsel yang menulis kontainernya sedikit keliru, PDF dengan font yang tertanam sebagian. Itulah yang benar-benar ada di perangkat orang, dan itu pula yang tidak akan ditemukan oleh pengujian yang ditulis orang yang sama dengan penulis kesalahannya.

Di bawahnya ada rangkaian pengujian otomatis yang mencakup dua sisi: pembangkit yang menyusun situsnya, dan modul yang dijalankan peramban. Rangkaian itu berjalan pada setiap perubahan, dan tidak ada yang diterbitkan setelah sebuah kegagalan. Ketika pekerjaan yang sama muncul di lebih dari satu alat, dan beberapa di antaranya membaca berkas MP4, sebuah pengujian memastikan salinan-salinannya masih sepakat, sehingga perbaikan pada satu alat tidak diam-diam meninggalkan yang lain dalam keadaan salah.

Panduan ditulis dengan ukuran yang sama. Tangkapan layarnya diambil dari situs yang sudah dibangun oleh sebuah skrip, bukan digambar atau diperagakan, jadi gambar di sebuah panduan adalah gambar halaman itu sebagaimana adanya hari ini.

## Bagaimana ini dibiayai

Dari iklan, dan dari donasi orang-orang yang merasa alat-alat ini berguna. Itulah seluruh model bisnisnya, dan ada baiknya dijelaskan dengan tepat apa yang tercakup dan apa yang tidak.

**Tidak ada yang perlu dibeli.** Tidak ada akun, tidak ada pendaftaran, tidak ada versi gratis dengan versi berbayar di atasnya, tidak ada tanda air yang harus ditebus, tidak ada batas ukuran berkas, tidak ada batas harian, dan tidak ada fitur yang ditahan. Apa yang ada di situs ini itulah seluruhnya.

**Berkas Anda bukan bagian dari kesepakatan itu.** Iklannya milik Google dan penghitungan kunjungannya memakai Google Analytics, dan tidak satu pun dari keduanya diberi tahu apa yang Anda buka, apa yang Anda hasilkan, apa namanya, atau berapa besarnya, karena tidak satu pun skrip itu pernah menerimanya, dan kebijakan keamanan halaman ini akan menolak pengirimannya seandainya salah satu mencoba. Apa yang sebenarnya keduanya kumpulkan, dan cara mematikannya masing-masing, dijelaskan di [halaman privasi](https://abox.tools/id/privasi/). Setiap alat tetap bekerja meskipun keduanya diblokir.

**Alat-alat ini tidak ditulis demi iklan.** Tidak ada satu alat pun di sini yang ada karena sebuah kata kunci bernilai uang, dan tidak satu pun dibuat lebih lambat, lebih berbelit, atau lebih banyak halaman demi menjual lebih banyak tayangan. Apa yang dibangun berikutnya diperdebatkan secara terbuka, di [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), satu paragraf per gagasan, termasuk alasan beberapa usulan yang tampak jelas justru ditolak.

## Bahasa

Situs ini terbit dalam lima belas bahasa. Masing-masing adalah terjemahan sungguhan, bukan keluaran mesin yang dibiarkan begitu saja: nama alat, penjelasan, panduan, dan alamatnya sendiri semuanya diterjemahkan, dan sebuah halaman baru dicantumkan dalam satu bahasa setelah bahasa itu benar-benar ditulis. Bahasa yang masih dikerjakan tetap bisa dibaca tetapi dijauhkan dari peta situs dan pemilih bahasa, supaya tidak ada yang diundang ke halaman yang separuhnya masih berbahasa Inggris.

Surat dibalas dalam bahasa Inggris, dan itu satu-satunya hal jujur yang bisa dikatakan tentang proyek sekecil ini.

## Yang tidak akan dilakukan situs ini

- Meminta Anda membuat akun, atau meminta alamat surel Anda.
- Mengunggah, menyimpan, memeriksa, atau menahan berkas yang Anda buka di sini.
- Menaruh tanda air pada hasil, atau menahan sebuah fitur untuk versi berbayar.
- Menambahkan langkah jaringan pada alat yang tidak memerlukannya.
- Menyatakan sesuatu di halaman alat yang tidak dilakukan oleh kode di repositori.

Kalau Anda menemukan salah satu dari itu terjadi, itu sekaligus sebuah kesalahan dan sebuah janji yang dilanggar, dan layak dilaporkan. [Halaman kontak](https://abox.tools/id/kontak/) adalah jalan tercepat.
