# Penyensor Gambar — hitamkan, pikselkan, atau buramkan

Apa yang Anda tutup dihapus dari file-nya, bukan ditutupi di dalamnya.

> Tutupi sebuah nama, alamat, atau nomor rekening di dalam foto atau tangkapan layar lalu kodekan ulang gambarnya, sehingga piksel yang disembunyikan hilang dari file alih-alih duduk di bawah sebuah persegi panjang. Berjalan sepenuhnya di peramban Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/sensor-gambar/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## gambar Anda **tidak pernah diunggah**. Tidak ada server.

Gambar didekode, dicat di atasnya, dan dikodekan lagi oleh peramban Anda sendiri, memakai kodek yang memang sudah dibawanya. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan itu lebih penting di sini daripada hampir di mana pun di situs ini: gambar yang dibawa orang ke alat sensor adalah gambar yang masih terbaca nama, alamat, atau nomor rekeningnya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara menyensor gambar sehingga bagian yang tersembunyi benar-benar hilang

1. **Pilih gambarnya.** Tangkapan layar, pindaian, atau foto — apa pun yang bisa dibuka peramban Anda. Ia dibaca langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Seret sebuah kotak di atas apa yang tidak boleh terlihat.** Seret lagi untuk yang berikutnya. Sebuah kotak bisa dipindahkan, diubah ukurannya lewat pegangannya, atau dicapai dengan tombol Tab dan digeser dengan panahnya. Yang muncul di bawah kotak itu adalah hasil sungguhan, digambar oleh kode yang sama yang menulis file-nya.
3. **Pilih hitam, pikselkan, atau buramkan — dan pilihlah hitam.** Isian hitam sama sekali tidak meninggalkan apa pun. Memikselkan dan memburamkan mengganti pikselnya dengan rata-rata dari dirinya sendiri, yang cukup untuk wajah di latar belakang dan tidak cukup untuk apa pun yang terbaca sebagai teks.
4. **Tekan "Sensor dan simpan", lalu periksa file-nya.** Gambar yang ditampilkan sesudahnya adalah file yang sudah jadi, didekode lagi. Buka di sebuah penyunting dan cari sebuah lapisan atau coba pilih teks yang tertutup: yang ada satu gambar datar, dan bagian yang Anda tutup sudah ditimpa sebelum ia ditulis keluar.

## Versi lebih lengkap

[Cara menyensor gambar supaya bagian yang disembunyikan sungguh hilang](https://abox.tools/id/panduan/sensor-gambar/): Kotak hitam yang digambar di kebanyakan program duduk di atas gambarnya dan bisa digeser. Apa yang membedakan penyensoran sungguhan dari penutupan, kenapa teks yang dipikselasi bisa dibaca kembali, dan bagaimana memeriksa sebuah file sebelum Anda mengirimnya.

## Juga ada di dalam kotak

- [Penampil dan Penghapus EXIF](https://abox.tools/id/hapus-data-exif/): Lihat apa yang dikatakan sebuah foto tentang Anda. Lalu keluarkan.
- [Penampil DICOM](https://abox.tools/id/penampil-dicom/): CT, MR, rontgen, dan USG, lengkap dengan jendela, headernya, dan pengukurannya.
- [Gambar ke ICO](https://abox.tools/id/buat-favicon/): Satu gambar masuk. Setiap ukuran yang diminta peramban, Windows, atau sebuah Mac, keluar.
- [Gambar ke Data URI](https://abox.tools/id/gambar-ke-base64/): Seluruh gambar sebagai satu baris teks. Tempelkan langsung ke CSS atau HTML.

## Pertanyaan

### Apakah gambar saya diunggah ke suatu tempat?

Tidak. File didekode, disensor, dan dikodekan oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Muat halamannya sekali, cabut koneksi internet, dan ia tetap bekerja.

### Apakah bagian yang tertutup benar-benar hilang dari file?

Ya, dan itulah alasan alat ini ada. Gambar didekode ke sebuah penyangga piksel; kotaknya menimpa piksel di dalamnya; penyangganya lalu dikodekan sebagai file baru. Nilai aslinya sudah hilang dari memori sebelum encoder diberi apa pun, jadi tidak ada lapisan untuk disembunyikan, tidak ada anotasi untuk dibuang, dan tidak ada riwayat untuk dibatalkan. Anda bisa memeriksanya seperti Anda memeriksa klaim orang lain: buka hasilnya di penyunting gambar dan cari lapisan kedua, atau coba pilih teks yang Anda tutup.

### Bisakah area yang dipikselkan atau diburamkan dipulihkan?

Kadang, dan inilah satu hal yang layak dibaca sebelum memilih. Isian hitam mengganti semua yang ada di bawahnya dengan satu warna datar, jadi tidak ada yang selamat — tidak sebuah tepi, tidak sebuah rata-rata, tidak jumlah karakternya. Memikselkan mengganti setiap blok dengan rata-rata blok itu, dan kisi rata-rata tetaplah pengukuran atas apa yang ada di bawahnya: untuk teks dengan huruf biasa pada ukuran yang bisa ditebak, karya yang diterbitkan sudah merekonstruksi aslinya dengan menggambar string kandidat dan membandingkan rata-ratanya. Memburamkan adalah sebuah konvolusi, dan konvolusi pada prinsipnya bisa dikerjakan mundur. Jadi pikselkan atau buramkan wajah di latar belakang kalau Anda mau, dan hitamkan apa pun yang terbaca sebagai teks.

### Kenapa persegi panjang hitam yang digambar di penyunting dokumen bukan hal yang sama?

Karena kebanyakan penyunting menyimpan persegi panjang itu di samping gambarnya, bukan ke dalamnya. Bentuk yang digambar di pembaca PDF, dek salindia, pengolah kata, atau penyunting gambar berlapis adalah objek dengan posisi, duduk di atas halamannya — dan memindahkannya, menghapusnya, atau membuka file-nya di program berbeda mengembalikan persis apa yang ditutupinya. Surat kabar, pengadilan, dan kementerian semuanya pernah menerbitkan dokumen yang disensor dengan cara itu. Di sini persegi panjangnya sama sekali tidak disimpan: ia adalah sekumpulan nilai piksel yang ditulis di atas nilai yang tadinya ada.

### Apakah ia juga menghapus data EXIF dan GPS?

Ya, sebagai efek samping. Menyimpan berarti mengodekan sebuah kanvas penuh piksel, dan sebuah kanvas tidak membawa tag, jadi lokasi, model kamera, stempel waktu, dan gambar mini tertanamnya sama sekali tidak ditulis ke file baru. Gambar mininya penting di sini: ia salinan kecil kedua dari gambarnya, ia tidak selalu diperbarui ketika sebuah foto disunting, dan foto tersensor yang bepergian bersama gambar mini yang belum disensor adalah cara nyata untuk membatalkan seluruh pekerjaan ini. Kalau Anda mau metadatanya hilang tanpa gambarnya dikodekan ulang sama sekali, [Penampil dan Penghapus EXIF](https://abox.tools/id/hapus-data-exif/) menulis ulang wadahnya saja.

### Format apa saja yang bisa dibaca dan ditulisnya?

Ia membaca apa pun yang bisa didekode peramban Anda, yang dalam praktiknya berarti JPEG, PNG, WebP, GIF, BMP, dan — di sebagian besar peramban masa kini — AVIF. Ia menulis JPEG, PNG, dan WebP, karena itulah encoder yang dibawa peramban. Pada "otomatis", JPEG kembali sebagai JPEG dan segala yang lain sebagai PNG, yang menjaga sebuah foto tetap seukuran foto dan menjaga sisa teks di sebuah tangkapan layar tetap tajam. Pilihannya tidak berpengaruh pada penyensorannya: pikselnya sudah hilang sebelum encoder melihatnya.

### Bisakah saya melakukan ini tanpa tetikus?

Bisa. "Tambah kotak di tengah" menaruh satu di atas gambarnya, Tab berpindah antar kotak, tombol panah menggeser yang terfokus dan Alt bersama tombol panah mengubah ukurannya — Shift membuat setiap langkah sepuluh piksel — dan Delete membuangnya. Setiap kotak juga punya barisnya sendiri di bawah gambarnya dengan ukurannya, posisinya, apa yang dilakukannya, dan sebuah tombol untuk membuangnya, jadi seluruh alat ini bisa dipakai dari papan ketik dan bisa dibaca pembaca layar.

### Apakah ia jalan di ponsel?

Ya. Menggambar, memindahkan, dan mengubah ukuran semuanya adalah peristiwa penunjuk alih-alih peristiwa tetikus, jadi jari bekerja dengan cara yang sama, dan pegangannya digambar lebih besar di layar sentuh. Gambar di layar digambar ulang seukuran layar sementara Anda bekerja — file-nya sendiri selalu disensor pada resolusi penuhnya ketika Anda menekan tombolnya.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Tidak ada batas ukuran gambarnya juga, karena tidak ada server yang membayarnya — pekerjaannya terjadi di mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang gambar Anda.

## Cara memverifikasi klaim privasi ini

- **Gambar Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Piksel yang tertutup berhenti ada di sini, bukan di jalan keluar.** Gambar didekode ke sebuah penyangga piksel, kotaknya ditulis di atas penyangga itu, dan penyangganya diserahkan ke encoder. Tidak ada versi gambar di halaman ini yang kotaknya menjadi lapisan terpisah, karena versi seperti itu tidak pernah dibuat — lihat `src/redact.js`.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Pekerjaannya adalah `getImageData`, tiga perulangan atas byte-nya, dan `canvas.toBlob` — semuanya sudah terpasang di peramban Anda.
- **Kotaknya tidak pernah dilaporkan ke mana pun.** Di mana Anda menggambar, berapa banyak, seberapa besar, dan gaya mana yang Anda pilih ditahan di memori halaman ini sampai Anda menutupnya. Tidak ada peristiwa pengukuran khusus di repositori ini yang membawa satu pun darinya, dan satu pertanyaan yang diajukan situs ini setelah sebuah unduhan mengirim jempol ke atas atau ke bawah beserta nama alatnya, tidak lebih.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana — dan yang layak dijalankan sebelum Anda menyensor sebuah paspor.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/redact.js` untuk tiga fungsi yang menimpa pikselnya, dan `src/preview.js` untuk alasan kenapa apa yang Anda lihat di layar digambar oleh tiga fungsi yang sama itu.
