# Penganalisis GIF — apa sebenarnya isi sebuah GIF

Bingkai, jeda, palet, dan ke mana setiap byte pergi.

> Bongkar sebuah GIF di peramban Anda: setiap bingkai dengan jeda dan cara pembuangannya, tabel warnanya, jumlah pengulangannya, dan rincian byte demi byte tentang ke mana ukuran file-nya pergi. Tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/analisis-gif/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## GIF Anda **tidak pernah diunggah**. Tidak ada server.

File dibuka dan dibongkar oleh peramban Anda sendiri: struktur bloknya, dekompresi LZW-nya, dan setiap bingkai yang digambar di halaman ini semuanya dikerjakan di mesin ini. Tidak ada server di ujung lain halaman ini untuk menerima sebuah file, bahkan seandainya ada sesuatu di sini yang menginginkannya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ File tetap di perangkat Anda

## Cara menganalisis GIF

1. **Pilih sebuah GIF.** Jatuhkan ke pemilih file, atau pilih sendiri. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Baca ringkasannya lebih dulu.** Ukuran kanvas, jumlah bingkai, berapa lama animasi itu mengaku berjalan, dan berapa lama ia sebenarnya diputar. Dua yang terakhir lebih sering berbeda daripada yang orang duga, dan alasannya ada di bagian berikutnya.
3. **Lihat apa yang menonjol.** Setiap baris di situ diukur dari file Anda: jeda yang tidak akan dipatuhi peramban mana pun, blok pengulangan yang hilang, tabel warna yang tidak dirujuk apa pun, metadata yang lebih besar daripada sebagian bingkainya. Tidak ada yang berupa tebakan tentang apa yang Anda maksud untuk dibuat.
4. **Lihat ke mana byte-nya pergi.** Setiap byte file berada tepat di satu baris, dan baris-barisnya berjumlah sama dengan file. Kalau sebagian besarnya tidak ada di "piksel terkompresi", sisa tabelnya mengatakan ia ada di mana.
5. **Telusuri bingkainya.** Masing-masing menampilkan jeda, persegi panjangnya, cara pembuangannya, dan ukurannya. Beralihlah antara "kanvas setelah setiap bingkai" dan "hanya yang disimpan setiap bingkai" — yang kedua adalah cara Anda melihat apakah file-nya dioptimalkan, karena GIF yang dibuat dengan baik menyimpan persegi panjang mungil dan yang dibuat asal-asalan menyimpan gambar utuh setiap kali.
6. **Ambil laporannya kalau Anda butuh.** Seluruh analisis sebagai teks biasa, untuk ditempelkan ke sebuah pesan atau disimpan di samping file-nya. Ia dibangun di halaman ini dari apa yang sudah ada di layar Anda.

## Versi lebih lengkap

[Apa sebenarnya isi di dalam sebuah GIF](https://abox.tools/id/panduan/apa-isi-di-dalam-gif/): Bingkai, jeda, metode pembuangan, dan tabel warna dijelaskan, kenapa peramban menolak jeda tercepatnya, dan bagaimana memperhitungkan ke mana sebenarnya ukuran file sebuah GIF pergi.

## Juga ada di dalam kotak

- [Gambar ke Video](https://abox.tools/id/gambar-ke-video/): Ubah satu folder gambar menjadi sebuah video.
- [Pemotong Video](https://abox.tools/id/potong-video/): Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu video.
- [Pemangkas Video](https://abox.tools/id/pangkas-video/): Potong klip sampai tersisa bagian yang penting.
- [Pembalik Video](https://abox.tools/id/putar-video-terbalik/): Bingkai terakhir lebih dulu, lengkap dengan suaranya.

## Pertanyaan

### Apakah GIF saya diunggah ke suatu tempat?

Tidak. File dibaca, didekompresi, dan digambar oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi jaringan dan ia tetap menganalisis GIF.

### Kenapa GIF saya diputar lebih lambat daripada yang dikatakan jedanya?

Karena setiap peramban menolak mematuhi jeda di bawah dua perseratus detik dan menahan bingkainya sepersepuluh detik. Aturan itu ditulis ke dalam Netscape pada 1996, untuk bola dunia berputar dan tanda "sedang dibangun" pada zaman itu, dan telah disalin ke setiap peramban sejak itu; tidak pernah ada yang mencabutnya. \
\
Jadi GIF yang semua bingkainya berkata 0,01 dtk tidak diputar pada 100 bingkai per detik. Ia diputar pada 10, yang lima sampai sepuluh kali lebih lambat daripada yang dimaksudkan pembuatnya. Halaman ini menampilkan kedua angkanya — apa kata file dan apa yang sebenarnya akan terjadi — dan menandai bingkai yang terkena. Perbaikannya, di alat apa pun yang membuat file itu, adalah menulis 0,02 alih-alih 0,01.

### Apa arti “cara pembuangan”?

Apa yang harus ditinggalkan di layar ketika waktu sebuah bingkai habis, dan itulah bidang yang menentukan sebuah animasi tampak benar atau belepotan. \
\
**Biarkan di tempatnya** berarti bingkai berikutnya mengecat di atas yang ini, yang Anda inginkan ketika bingkainya buram dan saling menutupi. **Bersihkan kembali ke latar** menghapus persegi panjang bingkai itu lebih dulu, yang dibutuhkan transparansi — tanpa itu, bagian tembus pandang bingkai berikutnya menampilkan bingkai sebelumnya di bawahnya. **Kembalikan apa yang ada di bawahnya** mengembalikan apa pun yang ada di sana sebelum bingkai ini menggambar, dan begitulah objek kecil yang bergerak di atas latar diam disimpan. Dan **tidak ditentukan** berarti file-nya tidak mengatakannya, dan setiap penampil memperlakukannya sebagai "biarkan di tempatnya".

### Kenapa GIF saya begitu besar?

Tabel "Ke mana byte-nya pergi" menjawabnya untuk file Anda yang ini, bukan secara umum, dan hanya ada beberapa jawaban yang mungkin. \
\
Kalau hampir seluruhnya adalah **piksel terkompresi**, file-nya memang berisi banyak gambar: GIF menyimpan setiap bingkai sebagai piksel utuh, tanpa kompensasi gerak dan tanpa tombol kualitas, jadi ukurannya kira-kira luas dikalikan jumlah bingkai. Lebih sedikit bingkai, ukuran lebih kecil, atau lebih sedikit warna adalah satu-satunya tuas. \
\
Kalau irisan besarnya adalah **tabel warna**, file itu menulis satu palet per bingkai seharga 768 byte masing-masing. Kalau irisan besarnya adalah **metadata**, sebuah penyunting meninggalkan paket XMP dan itu bisa dibuang tanpa menyentuh gambarnya. Dan kalau bingkainya semua menutupi seluruh kanvas, encoder-nya tidak pernah menghitung bagian mana yang sebenarnya berubah — yang pada apa pun yang difilmkan atau direkam adalah sebagian besar isi file.

### Apa bedanya dua tampilan bingkai itu?

**Kanvas setelah setiap bingkai** adalah apa yang ditampilkan sebuah penampil pada momen itu: bingkai ini digambar di atas apa pun yang ditinggalkan bingkai sebelumnya. **Hanya yang disimpan setiap bingkai** adalah persegi panjang yang benar-benar dimuat file untuk bingkai itu, berdiri sendiri, tanpa apa pun di bawahnya. \
\
Yang kedua adalah yang menarik. Sebuah GIF boleh menyimpan sebuah bingkai hanya sebagai bagian gambar yang berubah, dan itulah sebabnya rekaman layar dari jendela yang sebagian besarnya diam bisa berukuran kecil. Kalau setiap bingkai di file Anda adalah kanvas penuh, tidak ada yang melakukan pekerjaan itu — dan Anda tidak bisa mengetahuinya dengan menonton animasinya, hanya dengan melihat apa yang disimpan.

### Katanya file saya memuat komentar atau XMP. Apa itu?

Teks yang ikut menumpang bersama gambar dan yang tidak digambar penampil mana pun. Blok komentar biasanya berisi nama apa pun yang menulis file itu. Paket XMP adalah XML yang ditulis penyunting gambar untuk mencatat apa yang dilakukannya, dan ia bisa membawa riwayat suntingan, versi perangkat lunak, dan kadang nama penulisnya. \
\
Halaman ini mencetak keduanya secara lengkap, karena pertanyaan menarik soal metadata adalah apa isinya, bukan bahwa ia ada. Itu ditampilkan kepada Anda dan bukan kepada siapa pun lain: tidak ada apa pun di repositori ini yang membacakannya kepada siapa pun.

### Bisakah ia membuka GIF yang rusak?

Ia berusaha, dan ia memberi tahu di mana ia menyerah. File yang berakhir di tengah blok, punya byte di tempat penanda blok seharusnya berada, atau membawa bingkai yang data terkompresinya habis lebih awal, tetap akan menampilkan semua yang terbaca sebelum titik itu, dengan masalahnya disebutkan di bagian atas. Justru untuk kasus itulah sebuah penganalisis paling dibutuhkan, jadi membuang seluruh file gara-gara satu byte buruk akan menjadi perilaku yang salah.

### Apakah ia mengubah file saya?

Tidak. Alat ini hanya membaca. Tidak ada file keluaran, tidak ada pengodean ulang, dan tidak ada tombol di sini yang menulis sebuah GIF — satu-satunya yang bisa Anda unduh adalah salinan teks biasa dari analisisnya. File asli Anda tidak tersentuh di disk Anda, yang juga merupakan jawaban jujur atas apa yang terjadi kalau Anda menutup tab.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, dan tidak ada masa uji coba. Tidak ada batas ukuran file selain memori mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang file Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim GIF Anda ke tempat lain untuk dianalisis akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **GIF Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada. Dulu ini tertulis `connect-src 'none'`, yang mutlak; memasang iklan memakan itu, dan mengatakannya adalah bagian dari kesepakatan.
- **Pembacanya adalah empat file di repositori ini.** Tidak ada di sini yang memakai dekoder GIF milik peramban untuk mengetahui isi file, karena dekoder itu tidak akan mengatakan ke mana sebuah byte pergi. Jadi formatnya dibaca sendiri: `src/gif.js` menelusuri bloknya, `src/lzw.js` mengembangkan pikselnya, `src/frames.js` menumpuknya, dan `src/budget.js` menjumlahkan bagian-bagiannya kembali dan memeriksa apakah totalnya sama dengan ukuran file.
- **Komentar dan metadata ditampilkan kepada Anda, dan bukan kepada siapa pun lain.** Sebuah GIF bisa membawa blok komentar, paket XMP yang menjelaskan sebuah suntingan, atau profil warna, dan halaman ini mencetak semuanya. Semua itu ditaruh di layar di depan Anda dan tidak pergi ke mana pun: tidak ada peristiwa pengukuran di repositori ini yang membawa satu pun darinya, dan halaman ini tidak akan bisa mengirimnya seandainya ada.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang file Anda: bukan file-nya, bukan gambar mini, bukan nama, ukuran, jumlah bingkai, atau komentar. Setiap baris yang membaca, mendekompresi, atau menggambar GIF disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau file Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju adalah situs milik orang lain.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan setiap bagian halaman ini tetap bekerja. Itulah bukti yang paling sederhana: alat yang mengirim GIF Anda ke tempat lain untuk dianalisis akan berhenti begitu Anda mencabut koneksi.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/gif.js` untuk pembaca blok yang menelusuri file, `src/lzw.js` untuk dekompresornya, dan `src/budget.js` untuk penghitungan byte-nya — tidak satu pun punya baris yang bisa menjangkau jaringan.
