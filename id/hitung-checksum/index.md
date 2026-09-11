# Hash dan checksum — MD5, SHA-1, SHA-256, SHA-512

Periksa sebuah unduhan terhadap angka yang dicetak penerbitnya, tanpa mengirimnya ke siapa pun.

> Hitung MD5, SHA-1, SHA-256, SHA-384, atau SHA-512 file apa pun dan bandingkan dengan checksum yang diterbitkan halaman unduhan. File dibaca di peramban Anda dan tidak pernah diunggah, pada ukuran berapa pun.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/hitung-checksum/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## file Anda **tidak pernah diunggah**. Tidak ada server.

Sebuah checksum adalah aritmetika atas byte file Anda, dan itu dikerjakan di sini, di halaman ini, di prosesor Anda sendiri. File dibaca dari disk Anda empat megabyte sekali jalan dan setiap potongan dibuang begitu selesai dihitung, jadi tidak ada yang pernah dirakit di mana pun — tidak di memori, dan pasti tidak di sebuah server. Tidak ada server di ujung lain halaman ini untuk menerima sebuah file, bahkan seandainya ada sesuatu di sini yang menginginkannya.

- ✗ Tanpa unggah
- ✗ Tanpa batas ukuran
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ File tetap di perangkat Anda

## Cara memeriksa unduhan terhadap checksum-nya

1. **Pilih file-nya.** Jatuhkan ke pemilih file, atau pilih sendiri. Ia dibaca langsung dari disk Anda sepotong demi sepotong; tidak ada yang dikirim ke mana pun saat Anda melakukannya, dan tidak ada ukuran di mana halaman ini menyerah.
2. **Biarkan ia membaca.** MD5 dan SHA-256 dihitung secara bawaan, dalam satu kali jalan. Batangnya menunjukkan sudah sejauh mana ia menelusuri file dan secepat apa itu berjalan — image disk yang besar memakan waktu kira-kira selama menyalinnya, karena jumlah bacaannya sama.
3. **Tempelkan seharusnya berapa.** Apa pun yang diberikan halaman unduhan kepada Anda, dalam bentuk apa pun: hex telanjang, satu baris keluaran `sha256sum`, seluruh file `SHA256SUMS`, atau atribut `integrity` dari sebuah tag skrip. Algoritma mana itu mengikuti panjangnya, dan kotak yang tepat mencentang dirinya sendiri.
4. **Baca jawabannya, bukan warnanya.** Halaman ini mengatakan dalam satu kalimat apakah ini file yang digambarkan checksum itu. Cocok berarti byte-nya sama persis dengan yang diukur penerbitnya. Tidak cocok berarti tidak, dan unduhannya harus diambil lagi sebelum dibuka.
5. **Ambil checksum-nya kalau Anda butuh.** Salin satu, salin semuanya, atau simpan sebagai file teks kecil dalam bentuk bertanda yang ditulis alat baris perintah, sehingga nama algoritmanya ikut bersama angkanya.

## Versi lebih lengkap

[Cara memeriksa unduhan terhadap checksum-nya](https://abox.tools/id/panduan/memverifikasi-checksum-file/): Cara memeriksa checksum MD5 atau SHA-256 di Windows, macOS, dan Linux atau di peramban Anda, apa yang sebenarnya dibuktikan sebuah kecocokan, dan kekeliruan yang membuat seluruh latihannya sia-sia.

## Juga ada di dalam kotak

- [Pembuat Kata Sandi dan Frasa Sandi](https://abox.tools/id/pembuat-kata-sandi/): Dibuat di sini, oleh peramban Anda sendiri, dan tidak pernah dikirim ke mana pun. Tidak ada yang disimpan dan tidak ada riwayat.
- [Pemformat JSON](https://abox.tools/id/format-json/): JSON, XML, HTML, CSS, dan YAML, diformat atau diubah. Tidak ada yang ditempelkan ke server orang lain.
- [Pengubah YAML ke JSON](https://abox.tools/id/konversi-yaml-ke-json/): Dua arah, dan ia menyebutkan biaya masing-masing. Tidak ada satu pun yang ditempel ke server orang lain.
- [Pemformat XML](https://abox.tools/id/format-xml/): XML dirapikan agar terbaca atau dimampatkan agar siap kirim, dan diubah ke JSON dua arah. Tidak ada satu pun yang ditempel ke server orang lain.

## Pertanyaan

### Apakah file saya diunggah ke suatu tempat?

Tidak. Ia dibaca dari disk Anda oleh peramban Anda sendiri dan di-hash di prosesor Anda sendiri, empat megabyte sekali jalan. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi jaringan dan ia tetap bekerja.

### Adakah batas ukurannya?

Tidak. File tidak pernah ditahan utuh: ia dibaca sepotong demi sepotong dan setiap potongan dihitung lalu dibuang, jadi image disk empat puluh gigabyte memakai memori beberapa megabyte yang sama dengan sebuah file teks. Yang dimakannya adalah waktu, dan halaman ini memberi tahu Anda berapa sambil berjalan. \
\
Inilah alasan algoritmanya ditulis di sini alih-alih diserahkan ke `crypto.subtle.digest` milik peramban, yang akan lebih cepat. Panggilan itu mengambil seluruh pesan dalam satu penyangga dan tidak ada cara memberinya sebuah file sepotong demi sepotong, jadi memakainya akan menaruh file terbesar yang bisa Anda periksa pada belas kasihan berapa banyak memori yang kebetulan diizinkan untuk tab ini. Di ponsel itu beberapa ratus megabyte, dan file yang paling ingin diperiksa orang adalah image disk.

### Checksum-nya cocok. Apa sebenarnya yang sudah dibuktikan?

Bahwa byte di disk Anda adalah byte yang diukur seseorang ketika ia menuliskan angka itu. Tidak lebih, dan batasnya layak disebut dengan tepat. \
\
Itu membuktikan unduhannya tidak terpotong, tidak rusak oleh disk yang buruk, dan tidak ditukar dengan sesuatu yang lain dalam perjalanan. Itu **tidak** membuktikan file-nya aman, karena penerbit bisa mengukur malware seakurat apa pun yang lain. Dan itu membuktikan sangat sedikit kalau checksum-nya datang dari halaman yang sama, lewat koneksi yang sama, dengan file-nya: siapa pun yang bisa mengubah yang satu bisa mengubah yang lain. Sebuah checksum paling bernilai ketika ia sampai kepada Anda lewat jalur yang berbeda — file `SHA256SUMS` bertanda tangan, pengumuman rilis sebuah distribusi, cermin kedua, atau pengelola paket yang memang sudah mengetahuinya.

### Tidak cocok. Sekarang bagaimana?

Unduh lagi dulu, dari tempat yang sama. Transfer yang terputus atau dilanjutkan adalah penyebab yang jauh paling umum, dan salinan kedua biasanya menyelesaikannya. \
\
Kalau salinan kedua memberi jawaban salah yang sama, periksa apakah Anda membandingkan terhadap baris yang tepat: halaman rilis mencantumkan beberapa file, dan checksum untuk versi ARM tidak akan pernah cocok dengan yang x86. Lalu periksa nomor versinya. Kalau semua itu sudah benar dan tetap tidak cocok, jangan buka file-nya. Ambil dari cermin yang berbeda dan bandingkan kedua checksum-nya satu sama lain.

### Saya harus pakai yang mana?

Yang mana pun yang dicetak penerbitnya. Inti dari latihan ini adalah membandingkan terhadap angka mereka, dan Anda tidak bisa memilihkan angka mereka untuk mereka. \
\
Kalau Anda yang menghasilkan checksum alih-alih memeriksanya, pakai SHA-256. MD5 dan SHA-1 keduanya rusak dalam pengertian yang penting: dua file berbeda dengan digest yang sama bisa dibangun dengan sengaja, dalam hitungan jam untuk MD5 dan dengan biaya sedang untuk SHA-1. Itu tidak membuatnya tidak berguna terhadap kecelakaan — unduhan yang terpotong tidak akan berbenturan dengan aslinya secara kebetulan — tapi itu berarti keduanya tidak bisa memberi tahu Anda bahwa tidak ada yang mengutak-atik. SHA-384 dan SHA-512 baik-baik saja dan dalam praktik tidak lebih baik; keduanya ada di sini karena sebagian proyek menerbitkannya.

### Kenapa MD5 ada di sini kalau ia sudah rusak?

Karena itulah yang masih dicetak. Cermin unduhan, unduhan firmware, halaman perangkat lunak universitas, dan sangat banyak situs vendor menerbitkan MD5 dua puluh tahun lalu dan tidak pernah menengok halaman itu lagi, dan alat yang menolak menghitungnya berarti menolak menjawab pertanyaan yang sebenarnya dibawa pengunjungnya. \
\
Yang bisa dilakukannya sebagai gantinya adalah mengatakan apa nilai jawabannya, dan itulah yang dilakukan catatan di sebelah kotak centangnya. MD5 yang cocok tetap menyingkirkan kemungkinan unduhan yang rusak. Ia tidak menyingkirkan kemungkinan yang disengaja.

### Format apa saja yang bisa saya tempelkan ke kotak pembanding?

Semua yang lazim, dan ia sendiri yang menentukan mana yang mana. \
\
Hex telanjang, dengan atau tanpa spasi di dalamnya. Satu baris keluaran `md5sum` atau `sha256sum`, dengan nama file sesudahnya. Seluruh file `SHA256SUMS` berisi empat puluh baris, dan dalam hal itu baris yang menyebut nama file Anda yang dipakai. Bentuk BSD, `SHA256 (disk.iso) = …`. Label di depannya, seperti `SHA-256: …`. Dan atribut integritas subsumber, `sha384-…`, yang berupa base64 alih-alih hex dan didekode sebelum dibandingkan. \
\
Algoritma mana itu datang dari panjangnya: 32 karakter hex adalah MD5, 40 adalah SHA-1, 64 adalah SHA-256, 96 adalah SHA-384, dan 128 adalah SHA-512. Tidak ada dua yang sama panjangnya, jadi tidak ada yang perlu dipilih dan tidak ada yang bisa salah.

### Apakah ia memberi jawaban yang sama dengan sha256sum atau certutil?

Ya, byte demi byte. Ini adalah spesifikasi yang pasti dengan vektor uji yang diterbitkan, dan setiap algoritma di sini diperiksa terhadap vektor itu dan terhadap implementasi milik sistem operasi pada setiap build. \
\
Satu-satunya perbedaan yang akan Anda lihat adalah penyajiannya. `certutil -hashfile` di Windows mencetak dengan huruf besar dan menyisipkan spasi; halaman ini mencetak huruf kecil, yang dipakai hampir setiap penerbit. Perbandingannya mengabaikan keduanya, jadi checksum yang disalin dari certutil cocok dengan yang huruf kecil ditempelkan di sini.

### Bisakah saya memeriksa dua file satu sama lain?

Bisa, dengan satu langkah tambahan: periksa yang pertama, salin checksum-nya, lalu pilih yang kedua dan tempelkan checksum itu ke kotaknya. Kalau kedua file identik, halaman ini akan mengatakannya. \
\
Itu layak diketahui untuk kasus yang diam-diam paling cocok bagi checksum — memutuskan apakah salinan di drive cadangan benar-benar file yang sama dengan yang di laptop, ketika keduanya mengaku berukuran sama dan bertanggal sama.

### Apakah ia mengubah file saya?

Tidak. Alat ini hanya membaca. Tidak ada file keluaran, tidak ada pengodean ulang, dan tidak ada yang ditulis kembali — satu-satunya yang bisa Anda unduh adalah file teks kecil berisi daftar checksum-nya. File asli Anda tidak tersentuh di disk Anda, yang juga merupakan jawaban jujur atas apa yang terjadi kalau Anda menutup tab.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, dan tidak ada masa uji coba. Tidak ada batas ukuran file dan tidak ada batas berapa banyak file yang Anda periksa. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang file Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim file Anda ke tempat lain untuk di-hash akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **File Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada. Dulu ini tertulis `connect-src 'none'`, yang mutlak; memasang iklan memakan itu, dan mengatakannya adalah bagian dari kesepakatan.
- **File tidak pernah ditahan utuh, pada ukuran berapa pun.** Ia dibaca empat megabyte sekali jalan dan setiap potongan dihitung ke dalam keadaan berjalan lalu dibuang. Jadi memori yang dipakai halaman ini sama saja untuk image disk empat puluh gigabyte dan untuk sebuah file teks, dan tidak ada ukuran di mana ia menyerah. Itu juga sebabnya `crypto.subtle.digest` milik peramban tidak dipakai: ia menuntut seluruh file ada di memori sekaligus, dan justru batas itulah yang tidak ingin dimiliki alat ini.
- **Lima algoritma, lima file di repositori ini.** `src/md5.js`, `src/sha1.js`, `src/sha256.js`, dan `src/sha512.js` adalah spesifikasi yang diterbitkan, ditulis keluar, sekitar enam puluh baris masing-masing, dengan tabel konstantanya dituliskan alih-alih dihitung supaya tidak ada bagian dari jawabannya yang bisa bergantung pada peramban Anda. Masing-masing diperiksa terhadap vektor uji resminya dan terhadap implementasi milik sistem operasi sebelum dikirim.
- **Checksum yang Anda tempelkan juga tidak dikirim ke mana pun.** Ia dibandingkan di sini, di halaman ini, terhadap digest yang dihitung di sini. Tidak ada apa pun tentang perbandingan itu — bukan nilainya, bukan apakah ia cocok, bukan nama file-nya — yang dibacakan kepada siapa pun. Itu lebih penting daripada kedengarannya: sebuah checksum ditambah nama file memberi tahu siapa pun yang mengumpulkannya persis versi mana dari perangkat lunak mana yang baru saja Anda unduh.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang file Anda: bukan file-nya, bukan namanya, ukurannya, atau digest mana pun. Setiap baris yang membaca atau meng-hash satu byte disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau file Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju adalah situs milik orang lain.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan setiap bagian halaman ini tetap bekerja. Itulah bukti yang paling sederhana: alat yang mengirim file Anda ke tempat lain untuk di-hash akan berhenti begitu Anda mencabut koneksi.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/md5.js`, `src/sha1.js`, `src/sha256.js`, dan `src/sha512.js` untuk empat fungsi kompresinya, `src/blocks.js` untuk pengisian yang mereka pakai bersama, dan `src/hash.js` untuk perulangan yang membaca file Anda sepotong demi sepotong — tidak satu pun punya baris yang bisa menjangkau jaringan.
