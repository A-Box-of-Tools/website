# Ekstrak Audio dari Video — suaranya saja, sebagai WAV

Jatuhkan sebuah video dan ambil suaranya. Gambarnya tidak pernah didekode, dan tidak ada yang diunggah.

> Ambil suara dari MP4, MOV, atau WebM dan simpan sebagai WAV. Video tidak pernah meninggalkan perangkat Anda dan gambarnya tidak pernah didekode, karena seluruh pekerjaan berjalan di peramban Anda sendiri.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/ekstrak-audio-dari-video/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## video Anda **tidak pernah diunggah**. Tidak ada server.

Dekodernya adalah yang sudah ada di peramban Anda, jalur kode yang sama yang memutar berkas di elemen `<video>`, dan yang diminta darinya hanyalah jalur audio. Menulis WAV berarti menaruh header empat puluh empat bita di depan sampel, ada di `src/shared/wav.js`. Tidak ada enkoder di dalamnya, tidak ada langkah unggah, dan halaman ini tidak punya fungsi jaringan apa pun.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa batas ukuran
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara mengekstrak audio dari video tanpa mengunggahnya

1. **Jatuhkan videonya.** MP4, MOV, M4V, atau WebM, dari ponsel, kamera, perekam layar, atau hasil unduhan. Yang membacanya adalah peramban Anda sendiri; tidak ada langkah unggah yang perlu dilewati.
2. **Baca apa yang ditemukannya.** Durasi, jumlah kanal, dan laju sampel, langsung dari berkasnya. Kalau berkasnya tidak menyatakan lajunya, halaman ini mengatakannya, alih-alih diam-diam mengambil ulang sampel lalu mengaku tidak menyentuh apa pun.
3. **Pilih mono kalau ingin lebih kecil.** Membiarkan kanalnya apa adanya menjaga rekaman persis seperti semula. Mencampur ke mono memangkas berkas jadi separuh dan itulah yang dibutuhkan transkripsi atau rekaman suara; kanalnya dirata-ratakan, bukan dibuang salah satu.
4. **Dengarkan sebelum menyimpannya.** Pemutarnya memutar berkas yang sebentar lagi diunduh, bukan videonya, jadi kalau terdengar benar, unduhannya benar.
5. **Bawa, atau teruskan.** Unduh WAV-nya, atau kirim langsung ke pemotong atau penyunting tanpa menyimpannya lebih dulu.

## Juga ada di dalam kotak

- [Pemotong Audio](https://abox.tools/id/potong-audio/): Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu file, dipotong di tempat yang Anda sebutkan.
- [Penyunting Audio](https://abox.tools/id/sunting-audio/): Putar terbalik, ubah kecepatannya, angkat rekaman yang pelan — semuanya di sini, di mesin Anda.
- [Penggabung dan Pemisah PDF](https://abox.tools/id/gabung-pdf/): Halaman dipindah-pindah tanpa perjalanan bolak-balik ke server.
- [Kompresor PDF](https://abox.tools/id/kompres-pdf/): Perkecil sebuah dokumen tanpa mengirimnya ke mana pun.

## Pertanyaan

### Apakah video saya diunggah ke suatu tempat?

Tidak. Pendekodean dan penulisannya sama-sama terjadi di peramban Anda sendiri, di perangkat keras Anda sendiri. Alat ini tidak punya fungsi jaringan apa pun — tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebutkan setiap alamat yang boleh dihubungi, tidak satu pun milik kami. Kalau Anda lebih suka memeriksa daripada diberi tahu, cabut sambungan internet dan ambil suaranya tetap.

### Bisakah menghasilkan MP3?

Tidak, dan tidak akan berpura-pura bisa. Tidak ada peramban yang menyertakan enkoder MP3, dan satu-satunya jalan menuju enkoder adalah mengirim video Anda ke server yang punya — dan justru itulah satu hal yang situs ini ada untuk tidak melakukannya. Yang Anda dapat adalah WAV: sampel dengan header empat puluh empat bita di depannya, yang tidak butuh enkoder sama sekali dan tidak mungkin mengurangi kualitas. Ukurannya memang lebih besar, sekitar sepuluh megabita per menit dalam stereo, dan setiap pemutar, ponsel, dan penyunting bisa membukanya. Apa pun yang butuh MP3 bisa membuatnya dari sini dalam sedetik.

### Apakah gambarnya pernah dilihat?

Tidak, dan di sini tidak ada apa pun yang sanggup melihatnya. Dekoder peramban diberi berkasnya lalu dimintai jalur audionya; jalur videonya tidak pernah didekode, tidak pernah digambar, dan bahkan tidak sampai ke kode halaman ini. Di `src/` tidak ada dekoder video yang bisa dijalankan. Berkas yang keluar berisi suara dan tidak ada yang lain.

### Katanya tidak ada suara yang bisa dibaca, padahal videonya jalan normal.

Kalau begitu videonya hampir pasti memang tidak punya jalur audio. Rekaman layar yang dibuat tanpa memilih mikrofon itu bisu, begitu pula klip yang diekspor penyunting dengan suaranya dibisukan: keduanya jalan sempurna, karena ada gambar untuk ditampilkan. Pesannya menyebut kemungkinan ini lebih dulu karena inilah yang lebih sering terjadi; yang satu lagi adalah format yang tidak akan dibaca peramban ini. Buka berkasnya di sebuah pemutar dan cari pengatur volume yang tidak berpengaruh: itu cara tercepat mengetahui yang mana yang Anda hadapi.

### Format video apa saja yang bisa saya buka?

Apa pun yang bisa didekode peramban Anda, yang dalam praktiknya berarti MP4, M4V, MOV, dan WebM, ditambah semua format audio. Yang tertinggal di luar adalah daftar pendek yang sama seperti di seluruh situs ini: AVI, WMV, dan sebagian besar MKV. Berkas yang tidak akan dibaca peramban Anda ditolak dengan pesan yang menyatakannya, alih-alih gagal di tengah jalan.

### Apakah kualitasnya berkurang?

Tidak lebih dari yang sudah dilakukan video itu sendiri terhadap audionya waktu dibuat. Sampel yang dikembalikan dekoder dituliskan apa adanya: tidak ada pengodean kedua, jadi tidak ada generasi kehilangan kedua. Satu hal yang perlu diketahui adalah laju sampelnya: laju milik berkas itu dibaca lebih dulu dari headernya dan pendekodean dilakukan pada laju itu, sehingga rekaman Anda tidak diambil ulang sampelnya diam-diam. Kalau sebuah berkas tidak menyatakannya, halaman ini mengatakan laju mana yang diasumsikan.

### Kenapa WAV-nya jauh lebih besar daripada videonya?

Karena WAV tidak dimampatkan sedangkan jalur audio video itu dimampatkan. Suara berkualitas CD memakan sekitar sepuluh megabita per menit dalam stereo, apa pun isinya; jalur AAC di dalam MP4 mungkin sepersepuluhnya. Mencampur ke mono memangkasnya jadi separuh. Inilah harga dari tidak mengodekan ulang, dan dibayar sekali saja: apa pun yang Anda pakai untuk membukanya nanti bisa memampatkannya.

### Sepanjang apa video yang bisa ditangani?

Tidak ada batas yang dipasang di sini, sebab tidak ada server yang membayarinya. Batas sesungguhnya adalah memori perangkat Anda sendiri: berkasnya dibaca masuk dan seluruh jalur audionya disimpan sebagai sampel, jadi rekaman yang sangat panjang di perangkat kecil bisa kehabisan ruang. Beberapa jam video biasanya aman, dan ponsel akan sanggup lebih sedikit daripada laptop.

### Bisakah saya memotongnya atau mengeraskan suaranya?

Bisa, tapi bukan di sini: halaman ini mengerjakan satu tugas saja. Begitu ada hasil, muncul sederet tautan di samping unduhan yang membawanya langsung ke [pemotong audio](https://abox.tools/id/potong-audio/) atau [penyunting audio](https://abox.tools/id/sunting-audio/) tanpa menyimpannya lebih dulu, dan tanpa keduanya mengunggahnya juga.

### Apakah gratis, dan perlukah akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa coba, dan tidak ada batas berapa banyak video yang Anda buka. Situs ini memasang iklan, dan itulah yang membiayainya; iklan-iklan itu tidak diberi apa pun tentang berkas Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan sambungan internet dan halaman ini tetap bekerja. Itu sekaligus cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim video Anda pergi untuk diproses akan berhenti begitu sambungannya dicabut.

## Cara memverifikasi klaim privasi ini

- **Video Anda tidak punya tempat untuk pergi.** Di dalam Content-Security-Policy tertulis setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik kami. Tidak ada titik akhir di sini tempat sebuah berkas bisa dikumpulkan, dan tidak ada pula di dalam kode yang akan mengirimkannya seandainya ada.
- **Gambarnya sama sekali tidak didekode.** Yang diminta hanya jalur audio. Bingkai-bingkainya tidak dibaca, tidak didekode, tidak digambar, dan tidak dilihat, sebab di halaman ini tidak ada kode yang sanggup melakukannya, dan berkas yang keluar berisi suara dan tidak ada yang lain. Ini bukan janji soal menahan diri: `decodeAudioData` diberi bitanya lalu mengembalikan suara, dan di `src/` tidak ada dekoder video yang bisa dijalankan.
- **Dekodernya adalah yang sudah ada di peramban Anda.** Tidak ada yang dikirimkan ke sini untuk membaca format Anda, dan tidak ada pula yang dimintai bantuan dari luar halaman ini untuk membacanya. Berkas mana yang bisa dibuka, karena itu, persis apa yang sudah bisa diputar peramban Anda.
- **Sampelnya dituliskan apa adanya, bukan dikodekan ulang.** Sebuah WAV adalah sampel yang dikembalikan dekoder dengan header di depannya. Tidak ada enkoder yang mengambil keputusan atas rekaman Anda, dan tidak ada yang bisa disebut unggahan sebagai tempat hal itu terjadi.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran datang dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi apa pun tentang video Anda: bukan berkasnya, bukan sampelnya, bukan nama, ukuran, atau durasinya.
- **Jalan tanpa internet.** Putuskan jaringan dan alat ini tidak berubah, sebab memang tidak pernah ada langkah jaringan di dalamnya. Itu bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/shared/audio-decode.js` untuk satu-satunya dekoder yang ada dan alasan gambar tidak pernah diminta, dan `src/shared/samplerate.js` untuk pembacaan header yang mencegah rekaman Anda diambil ulang sampelnya diam-diam.
