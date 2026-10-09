# Privasi & Cookie

Versi singkatnya: file Anda tidak pernah diunggah, karena tidak ada tujuan untuk mengunggahnya. Semua yang lain di halaman ini adalah tentang iklannya, pencacah kunjungannya, dan hostingnya — bagian yang memang melibatkan perusahaan lain.

Terakhir diperbarui 3 September 2026

## File Anda

Setiap alat di situs ini mengerjakan pekerjaannya di dalam peramban Anda sendiri, di perangkat keras Anda sendiri. Ketika Anda memilih sebuah file, ia dibaca oleh halaman yang sudah Anda buka. Ia tidak dikirim kepada kami, karena tidak ada server kami untuk dikirimi — situs ini adalah sekumpulan file statis, tanpa backend, tanpa basis data, dan tanpa penyimpanan.

Artinya kami tidak pernah menerima, melihat, menyimpan, mencatat, atau memproses:

- file Anda, seluruhnya maupun sebagian
- gambar mini atau pratinjaunya
- nama, ukuran, dimensi, atau formatnya
- berapa banyak yang Anda pilih, atau apa yang Anda lakukan dengannya
- apa pun yang dibaca darinya, termasuk data EXIF dan GPS

Ini bukan janji tentang niat kami. Setiap halaman membawa sebuah `Content-Security-Policy` yang menyebut satu per satu setiap alamat yang boleh dihubungi halamannya, dan perambannya menegakkannya. Tidak satu pun alamat itu milik kami. Anda bisa membaca kebijakannya di bagian atas sumber halaman mana pun, atau membuka tab Network peramban Anda lalu memperhatikan: tidak ada permintaan yang membawa file Anda.

File yang Anda hasilkan dengan sebuah alat diserahkan ke mekanisme unduhan milik peramban Anda sendiri lalu disimpan di mana pun Anda menyuruhnya. Kami juga tidak terlibat di langkah itu.

## Satu pengecualiannya, dan di mana ia berlaku

Alat [Gambar ke Video](https://abox.tools/id/gambar-ke-video/) punya fitur “tambahkan dari sebuah alamat web”. Kalau Anda menempelkan sebuah alamat ke dalamnya, peramban Anda mengambil gambar itu dari server mana pun yang Anda sebutkan, dan **server itu melihat alamat IP Anda** serta file mana yang Anda minta. Itu tidak terhindarkan, dan itulah seluruh hakikat fiturnya.

Ia hanya pernah terjadi untuk alamat yang Anda ketik sendiri, ia dibangun supaya gambar bisa masuk tapi data tidak bisa keluar, dan halaman alat itu sendiri menjelaskannya lebih rinci. Tidak ada alat lain di situs ini yang bisa membuat permintaan keluar dengan apa pun milik Anda di dalamnya.

## Apa yang dikumpulkan, dan oleh siapa

Situs ini gratis dan dibiayai iklan. Artinya dua produk Google berjalan di halaman-halaman ini, dan sebuah tombol donasi berjalan di sebagian besarnya. Inilah daftar lengkapnya.

### Google AdSense — iklannya

Google menyajikan iklannya dan memutuskan mana yang Anda lihat. Untuk melakukan itu ia bisa menyetel dan membaca cookie atau pengenal serupa di peramban Anda, dan ia menerima alamat IP Anda, sebuah lokasi perkiraan yang diturunkan darinya, agen pengguna Anda, dan halaman mana yang sedang Anda buka. Tergantung setelan Anda dan di mana Anda berada, iklannya bisa dipersonalisasi memakai sebuah profil yang dipegang Google tentang Anda, yang sebagian besar dibangun dari aktivitas Anda di situs lain.

Kami tidak menerima satu pun dari itu, kami tidak bisa melihatnya, dan kami tidak pernah mengirim apa pun kepada Google tentang file Anda. Keterangan Google sendiri tentang cara ia memakai data dari situs yang menjalankan iklannya ada di [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — pencacah kunjungannya

Kami memakai Google Analytics 4 untuk menghitung kunjungan halaman, supaya kami tahu alat mana yang layak dikerjakan. Ia merekam halaman yang Anda lihat, kira-kira kapan, sebuah pengenal yang dihasilkan secara acak dan disimpan di peramban Anda, sebuah lokasi perkiraan, jenis perangkat dan peramban Anda, serta situs yang merujuk Anda.

Ia disetel untuk tidak melakukan apa pun lagi, dan setelannya adalah sebuah file yang bisa Anda baca: `analytics.js` di sebelah setiap halaman menyiapkan sebuah pencacah tampilan halaman dan sama sekali tidak memuat peristiwa khusus. Tidak ada di situs ini yang menyerahkan kepadanya sebuah file, sebuah nama file, sebuah dimensi, atau sebuah jumlah — tidak ada kode di sini yang bisa.

### Buy Me a Coffee — tombol donasinya

Halaman pusatnya dan halaman alatnya membawa sebuah tombol donasi, yang dimuat dari server Buy Me a Coffee. Memuatnya berarti CDN mereka melihat alamat IP Anda dan bahwa Anda sedang di situs ini, dan huruf tombolnya diambil dari Google Fonts, yang juga melihat alamat IP Anda. Tidak ada yang lain yang dikirim, dan tidak ada yang terjadi lebih lanjut kecuali Anda benar-benar mengekliknya, dan pada saat itu Anda berada di situs mereka di bawah kebijakan mereka. Halaman ini dan [halaman Ketentuan](https://abox.tools/id/ketentuan-penggunaan/) tidak menggambar tombolnya.

### Hosting

Situsnya disajikan GitHub Pages, di belakang Cloudflare. Seperti host web mana pun, mereka memproses permintaan yang dibuat peramban Anda — yang mencakup alamat IP Anda, halaman yang diminta, dan agen pengguna Anda — untuk mengantarkan halamannya dan menjaga layanannya tetap hidup dan aman. Kami tidak punya akses ke log per pengunjung dari keduanya.

### Perantara alat berbagi

Satu alat, [Berbagi teks dan berkas](https://abox.tools/id/berbagi-teks/), memindahkan teks dan berkas langsung dari satu peramban ke peramban lain, dan koneksi langsung butuh perkenalan. Maka halaman itu — satu-satunya di situs ini — membuka satu WebSocket ke server kecil milik kami, yang mempertemukan kedua ujung sebuah nama tautan dan meneruskan penyiapan koneksi di antara keduanya. Server itu tidak pernah melihat teks atau berkasnya; keduanya berjalan lewat koneksi terenkripsi yang diperkenalkannya. Yang dilihatnya adalah nama tautan, kapan tiap sisi terhubung dan pergi, dan alamat IP mereka, dan Cloudflare, yang menjalankannya, menyimpan log setiap koneksi selama tujuh hari. Itulah satu-satunya log per pengunjung di situs ini yang bisa kami baca. Halaman alatnya sendiri menjelaskannya secara lengkap, dan seluruh kodenya ada di repositori.

## Cookie

Kami tidak menyetel cookie apa pun milik kami sendiri. Kami tidak punya masuk akun dan tidak punya sesi, dan hanya ada satu preferensi yang pernah kami ingat.

**Bahasa yang Anda pilih.** Kalau Anda memilih sebuah bahasa dari pengalihnya, pilihan itu ditulis ke penyimpanan lokal peramban Anda, dengan nama `abox-lang`, supaya halaman berikutnya yang Anda buka berbahasa seperti yang Anda minta. Ia bukan sebuah cookie: ia tidak pernah dikirim kepada kami atau kepada siapa pun lain, ia tinggal di perangkat tempat Anda membaca ini, dan membersihkan data situs peramban Anda menghapusnya. Kalau Anda tidak pernah memilih sebuah bahasa, sama sekali tidak ada yang ditulis — halaman yang ditampilkan dalam bahasa peramban Anda sendiri dicocokkan di tempat lalu dilupakan lagi.

Setiap cookie atau pengenal serupa yang mungkin Anda temukan di sini milik Google dan disetel oleh skrip iklan dan analitik yang dijelaskan di atas. Mereka dipakai untuk mengukur kunjungan, serta untuk memilih dan membatasi iklan.

### Cara mematikannya

- Personalisasi iklan bisa dimatikan, untuk semua situs sekaligus, di [My Ad Center](https://myadcenter.google.com/).
- Google Analytics bisa diblokir di mana-mana dengan [pengaya peramban penolakan](https://tools.google.com/dlpage/gaoptout) milik Google.
- Setelan peramban Anda sendiri bisa memblokir atau membersihkan cookie pihak ketiga, dan pemblokir konten mana pun akan menghentikan skrip ini dimuat sejak awal.

Memblokir semuanya tidak masalah bagi kami. **Setiap alat di situs ini bekerja dengan skripnya diblokir, dan bekerja dengan jaringannya terputus sama sekali.** Tidak ada di sini yang ditahan di balik sebuah iklan.

## Hak Anda atas datanya

Kami tidak memegang data pribadi apa pun tentang Anda, jadi tidak ada yang bisa kami tunjukkan, betulkan, ekspor, atau hapus untuk Anda — sebuah permintaan kepada kami akan kembali kosong, sejujurnya.

Data yang dijelaskan di atas dipegang Google, yang bertindak sebagai pengendalinya sendiri atas data itu. Permintaan tentangnya harus pergi kepada mereka, lewat [akun Google Anda](https://myaccount.google.com/) atau kontak privasi mereka.

## Anak-anak

Situs ini tidak ditujukan kepada anak-anak dan tidak menanyakan usia siapa pun, karena ia tidak menanyakan apa pun kepada siapa pun. Kami sengaja tidak mengumpulkan data pribadi dari siapa pun, pada usia berapa pun.

## Perubahan, dan cara menghubungi kami

Kalau halaman ini berubah, tanggal di atasnya berubah bersamanya, dan suntingannya ada di riwayat commit publik bersama semua yang lain.

Pertanyaan tentang semua ini bisa dikirim ke [hi@abox.tools](mailto:hi@abox.tools), atau diajukan sebagai sebuah isu di [repositorinya](https://github.com/A-Box-of-Tools/website), tempat jawabannya terlihat oleh semua orang lain yang bertanya-tanya hal yang sama.
