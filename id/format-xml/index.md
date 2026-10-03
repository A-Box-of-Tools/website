# Pemformat XML — rapikan, mampatkan, atau ubah jadi JSON

XML dirapikan agar terbaca atau dimampatkan agar siap kirim, dan diubah ke JSON dua arah. Tidak ada satu pun yang ditempel ke server orang lain.

> Format, beri indentasi, dan mampatkan XML, lalu ubah XML ke JSON atau JSON ke XML. Pengurainya berjalan di peramban Anda dan tidak ada yang diunggah, jadi sebuah feed, faktur, atau berkas konfigurasi tidak pernah meninggalkan perangkat Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/format-xml/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## file XML dan JSON Anda **tidak pernah diunggah**. Tidak ada server.

Memformat dan mengubah adalah hitungan atas sebuah untai teks, dikerjakan di sini, di halaman ini. Pengurainya ditulis tangan dan ada di `src/shared/parse-xml.js`, dan tidak ada yang lain. Alat ini tidak punya fungsi jaringan apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan di sini itu lebih berarti daripada yang disiratkan kata “XML”: yang datang dalam format ini biasanya sebuah faktur, rekening koran, rekam medis, atau permintaan SOAP dengan kredensial seseorang di headernya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa batas ukuran
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara memformat XML tanpa mengunggahnya

1. **Pilih pekerjaannya.** Dua tab, satu kotak: *Format* merapikan XML atau memampatkannya; *Ubah* menjadikannya JSON, atau JSON kembali jadi XML. XML yang baru saja Anda rapikan adalah XML yang Anda ubah, tanpa menempelnya dua kali.
2. **Tempel, atau jatuhkan berkasnya.** Apa pun yang bisa Anda sorot dan salin akan jalan, dan berkas `.xml`, `.svg`, `.rss`, atau `.xsd` yang dijatuhkan ke pemilih dibaca oleh peramban Anda sendiri lalu dimasukkan ke kotaknya — tidak ada langkah unggah yang perlu dilewati.
3. **Pilih indentasinya, atau mampatkan.** Dua spasi, empat, atau satu tab. Memampatkan berarti dokumen yang sama tanpa setiap spasi yang ada hanya supaya enak dibaca, dan hasilnya menyebutkan berapa bita yang dihemat.
4. **Baca galatnya di tempat galatnya berada.** Pengurai yang gagal di sini menyebut *tag mana* yang tidak pernah ditutup dan di baris serta kolom berapa, alih-alih “galat di baris 1”, yang adalah ucapan sebuah peramban tentang dokumen yang dibacanya sekaligus.
5. **Ambil hasilnya.** Salin, atau unduh sebagai berkas, dinamai menurut format tempat ia keluar.

## Juga ada di dalam kotak

- [Pembanding Teks](https://abox.tools/id/bandingkan-teks/): Dua teks masuk, setiap perbedaan ditandai, baris demi baris dan kata demi kata. Tidak ada yang ditempelkan ke server orang lain.
- [Pengode & Pengurai Base64](https://abox.tools/id/encode-base64/): Base64, pengodean persen, entitas HTML, heksadesimal, dan escape garis miring terbalik, dua arah. Tidak ada yang ditempelkan ke server orang lain.
- [Berbagi teks dan berkas](https://abox.tools/id/berbagi-teks/): Bagikan ini hidup di tab yang terbuka. Pembaca menerimanya terenkripsi, langsung dari browser Anda, dan menutup tab mengakhirinya - tidak ada server yang menyimpan apa pun.
- [Pembuat QR dan Barkode](https://abox.tools/id/buat-kode-qr/): Ketik, dan ia menjadi sebuah kode. Tidak ada yang dikirim untuk membuatnya.

## Pertanyaan

### Apakah XML saya diunggah ke suatu tempat?

Tidak. Pengurai dan pencetak di halaman ini adalah fungsi yang berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri. Alat ini tidak punya fungsi jaringan apa pun — tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebutkan setiap alamat yang boleh dihubunginya, tidak satu pun milik kami. Untuk XML itu lebih berarti daripada yang disiratkan reputasi formatnya: yang datang di dalamnya biasanya sebuah faktur, rekening koran, rekam medis, atau permintaan SOAP dengan kredensial di headernya.

### Apakah ia menyelesaikan entitas eksternal?

Tidak, dan tidak ada yang perlu dimatikan. Penyelesaian entitas eksternal adalah cara sebuah pengurai XML dibujuk membaca berkas dari mesin yang menjalankannya — serangan yang biasa ditulis XXE — dan `src/shared/parse-xml.js` adalah pembaca tulisan tangan tanpa penyelesaian entitas sama sekali. Teks Anda juga tidak pernah diserahkan kepada `DOMParser` milik peramban. Sebuah `DOCTYPE` dibawa lewat begitu saja tanpa pernah dijalankan.

### Apa yang hilang saat mengubah XML ke JSON?

Urutan isi campuran, komentar, dan perbedaan antara atribut dan elemen anak — yang terakhir dilunakkan alih-alih dihapus, karena sebuah atribut menjadi anggota yang namanya diawali `@`. Teks milik sebuah elemen menjadi `#text` bila ia harus berdampingan dengan yang lain, dan anak yang berulang menjadi sebuah array. Setiap nilai tetap untai teks: XML tidak punya tipe, dan memutuskan bahwa `8080` adalah angka berarti mengarang informasi.

### Apa yang hilang saat mengubah JSON ke XML?

Perbedaan antara objek kosong, array kosong, dan untai kosong, yang ketiganya menjadi elemen kosong, serta tipe setiap nilai, karena XML tidak punya tipe. Sebuah array menjadi elemen berulang, satu-satunya bentuk yang terbaca kembali, dan kunci yang tidak sanggup ditampung sebuah nama elemen diganti karakter canggungnya alih-alih dikeluarkan sebagai dokumen yang tidak akan dibaca pengurai mana pun.

### Bisakah ia memformat SVG, feed RSS, atau berkas POM?

Bisa. Ketiganya adalah XML, dan ini membaca XML alih-alih satu dialek tertentu. SVG yang dirapikan begini lebih mudah disunting tangan; feed RSS atau Atom biasanya dikirim dalam keadaan mampat dan tak terbaca sampai ada yang membukanya. Tata letaknya tidak mengubah apa pun dari arti dokumen itu.

### Apakah mengubah indentasi XML mengubah artinya?

Untuk dokumen yang elemennya berisi elemen lain, tidak. Yang bisa berpengaruh adalah teks: spasi di dalam elemen yang berisi kata adalah bagian dari teks itu, jadi elemen yang isinya hanya teks dibiarkan dalam satu baris alih-alih dibuka. Bagian `CDATA` disalin persis seperti semula.

### Kenapa tidak memakai pengurai XML milik peramban saja?

Karena apa yang dikatakannya waktu dokumennya rusak. `DOMParser` mengembalikan dokumen galat yang kata-katanya berbeda di setiap peramban dan sering kali hanya berbunyi “galat di baris 1”. Pembaca tulisan tangan bisa menyebut tag mana yang tidak pernah ditutup, dan di mana ia dibuka, dan itulah yang sebenarnya perlu Anda ketahui. Tidak menyelesaikan entitas eksternal adalah alasan yang satu lagi.

### Sebesar apa berkas yang bisa ditangani?

Tidak ada batas yang dipasang di sini, sebab tidak ada server yang membayarinya. Batas sesungguhnya adalah perangkat Anda sendiri: beberapa megabita XML aman, dan untuk dokumen yang sangat panjang halaman ini menunggu jeda ketikan Anda sebelum memformat ulang, alih-alih berebut papan ketik dengan Anda.

### Apakah gratis, dan perlukah akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa coba, dan tidak ada batas berapa banyak yang Anda tempel. Situs ini memasang iklan, dan itulah yang membiayainya; iklan-iklan itu tidak diberi apa pun tentang teks Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan sambungan internet dan halaman ini tetap bekerja. Itu sekaligus cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim XML Anda pergi untuk diformat akan berhenti begitu sambungannya dicabut.

## Cara memverifikasi klaim privasi ini

- **Yang Anda tempel tidak punya tempat untuk pergi.** Di dalam Content-Security-Policy tertulis setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik kami. Tidak ada titik akhir di sini tempat sebuah faktur yang ditempel bisa dikumpulkan, dan tidak ada pula di dalam kode yang akan mengirimkannya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun dalam `src/`. Pengurai dan pencetaknya adalah fungsi di halaman ini yang menerima untai teks dan mengembalikan untai teks.
- **Entitas eksternal tidak pernah diselesaikan, sama sekali.** Sebuah `DOCTYPE` berisi entitas eksternal adalah cara sebuah pengurai XML dibujuk membaca berkas dari mesin yang sedang mengurai, dan itu lubang tertua di format ini. `src/shared/parse-xml.js` adalah pembaca tulisan tangan yang sama sekali tidak punya penyelesaian entitas — bukan dimatikan, melainkan tidak ada — dan halaman ini tidak pernah menyerahkan teks Anda kepada `DOMParser` milik peramban.
- **Setiap nilai yang keluar dari XML adalah untai teks.** `<port>8080</port>` tidak mengatakan apakah itu sebuah angka, jadi JSON-nya menulis `"8080"`. Memutuskannya untuk Anda berarti mengarang informasi yang lalu ikut berjalan seolah-olah ada di dalam berkasnya.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran datang dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi satu karakter dari teks Anda. Setiap baris yang membaca, mengurai, atau menulisnya disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan jaringan dan alat ini tidak berubah, sebab memang tidak pernah ada langkah jaringan di dalamnya. Itu bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/shared/parse-xml.js` untuk pengurai yang menyebutkan tag mana yang tidak pernah ditutup, dan `src/convert.js` untuk alasan setiap nilai keluar dari XML sebagai untai teks alih-alih ditebak.
