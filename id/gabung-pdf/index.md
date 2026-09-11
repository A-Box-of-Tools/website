# Gabungkan PDF — pisah dan urutkan halaman juga

Halaman dipindah-pindah tanpa perjalanan bolak-balik ke server.

> Gabungkan PDF, pisahkan satu menjadi beberapa, dan seret halaman ke urutan yang Anda mau — semuanya di dalam peramban Anda sendiri. Tidak ada yang diunggah, tidak ada akun, dan file yang sudah jadi dibuka lagi dan dihitung sebelum ditawarkan kepada Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/gabung-pdf/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## dokumen Anda **tidak pernah diunggah**. Tidak ada server.

Setiap dokumen yang Anda pilih dibuka, dibongkar, dan ditulis kembali di memori mesin ini, oleh kode yang disajikan dari alamat ini. Tidak ada di sini yang bisa melakukan unggahan, dan tidak ada server di ujung lain halaman ini untuk menerimanya.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ File tetap di perangkat Anda

## Cara menggabungkan, memisahkan, atau mengurutkan PDF

1. **Pilih PDF Anda.** Jatuhkan ke pemilih file atau pilih sendiri, dan tambahkan lagi nanti — halaman setiap file masuk ke ujung urutan yang sedang berjalan, dan itulah yang membuat penggabungan dua folder terpisah menjadi mungkin. Peramban membacanya langsung dari disk Anda.
2. **Urutkan halamannya sesuai keinginan Anda.** Seret sebuah halaman lewat pegangannya, atau geser dengan panahnya. Putar halaman yang terpindai miring, keluarkan satu, atau ketik `1-3, 8, 12-` di kotaknya untuk menyimpan, membuang, atau memutar sederet halaman sekaligus. Nomornya berubah seiring Anda bekerja, jadi yang Anda lihat selalu sama dengan file yang sudah jadi nanti.
3. **Sebutkan apakah hasilnya satu dokumen atau beberapa.** Satu adalah jawaban yang biasa. Sisanya adalah cara-cara memotong: setiap sekian halaman, pada nomor halaman yang Anda sebutkan, satu file per halaman, atau kembali ke file asal halamannya. Lebih dari satu file diserahkan sebagai satu ZIP, jadi cukup sekali simpan alih-alih lima puluh kali.
4. **Bangun, lalu baca baris yang mengatakan bahwa hasilnya sudah diperiksa.** Setelah dokumennya ditulis, masing-masing dibuka lagi oleh pembaca yang sama di halaman ini dan halamannya dihitung. Kalau itu tidak cocok dengan yang Anda minta, prosesnya dilaporkan gagal dan tidak ada unduhan yang ditawarkan.

## Versi lebih lengkap

[Cara menggabung, memisah, dan menyusun ulang halaman PDF](https://abox.tools/id/panduan/gabung-dan-pisah-file-pdf/): Gabungkan PDF, potong satu menjadi beberapa, dan pindahkan halamannya: apa yang selamat dari penyusunan ulang, apa yang tidak bisa dibawa alat mana pun, dan kenapa tidak satu pun dari itu perlu mengunggah dokumen Anda ke mana pun.

## Juga ada di dalam kotak

- [Kompresor PDF](https://abox.tools/id/kompres-pdf/): Perkecil sebuah dokumen tanpa mengirimnya ke mana pun.
- [Penyensor PDF](https://abox.tools/id/sensor-pdf/): Hurufnya dihapus dari file-nya, dan file-nya dicari sesudahnya untuk membuktikannya.
- [Gambar ke PDF](https://abox.tools/id/gambar-ke-pdf/): Masukkan gambar Anda ke dalam satu dokumen.
- [Pemindai Dokumen](https://abox.tools/id/pemindai-dokumen/): Foto halamannya. Dapatkan sesuatu yang tampak seperti hasil pindaian.

## Pertanyaan

### Apakah PDF saya diunggah ke suatu tempat?

Tidak. Semuanya dibaca, disalin, dan ditulis oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Alat ini sama sekali tidak punya fitur jaringan opsional.

### Berapa banyak file yang bisa saya gabungkan, dan seberapa besar ukurannya?

Tidak ada batas yang tertulis di alat ini. Batasnya adalah mesin Anda sendiri: dokumennya ditahan di memori selama dikerjakan, jadi sebuah laptop akan menggabungkan beberapa ratus megabyte tanpa mengeluh dan akan kepayahan di suatu titik di atas itu. Tidak ada yang ditagih, dicekik, diberi tanda air, atau diantrekan, karena tidak ada siapa pun di ujung sana untuk melakukan satu pun dari itu.

### Apakah menggabungkan atau memisahkan menurunkan kualitas?

Tidak. Tidak ada apa pun di sebuah halaman yang dikodekan ulang, digambar ulang, atau dikompres ulang. Aliran isi setiap halaman dan setiap font, gambar, serta gambar vektor yang dirujuknya disalin byte demi byte, jadi teks tetap bisa dipilih dan dicari dan sebuah foto tetap foto yang sama. Yang berubah hanyalah urutan halaman dan struktur di sekitarnya.

### Apa yang terjadi pada markah dan tautan?

Keduanya dibangun ulang, bukan dibuang. Markah yang halamannya masih ada di keluaran menunjuk ke tempat halaman itu berpindah; markah yang halamannya Anda buang ikut dikeluarkan, kecuali kalau ada entri yang selamat di bawahnya, dan dalam hal itu ia tetap ada sebagai judul. Menggabungkan beberapa file menempatkan markah setiap file di bawah judul bernama file itu. Tautan antarhalaman diikuti dengan cara yang sama, termasuk tujuan bernama yang ditulis Word dan LaTeX, dan tautan yang sasarannya tidak ikut serta dibiarkan tanpa apa pun di belakangnya alih-alih mengirim pembacanya ke tempat yang salah. Tautan ke alamat web dijaga apa adanya.

### Apa yang tidak ikut terbawa?

Empat hal, dan alat ini mengatakannya di hasil, bukan di catatan kecil. Pohon urutan baca bertanda yang dipakai pembaca layar, label halaman (penomoran "iii, iv, 1, 2"), lampiran file tertanam, dan tindakan apa pun yang bukan "pergi ke sebuah halaman" maupun "buka sebuah alamat web" — termasuk JavaScript dokumen. Dua yang pertama menggambarkan urutan yang sudah tidak ada begitu halaman dipindahkan; yang terakhir bukan sesuatu yang Anda minta untuk dibawa ke file baru. Kalau penandaan sebuah dokumen penting bagi Anda, simpan juga aslinya.

### Apakah formulir yang sudah diisi tetap selamat?

Ya. Kolom formulir dan apa yang sudah diketik ke dalamnya ikut bersama halamannya, dan dokumen baru itu didaftarkan sebagai formulir sehingga pembaca memperlakukannya begitu. Satu hal yang perlu diketahui saat menggabungkan: dua kolom dengan nama yang sama adalah satu kolom bagi pembaca mana pun, jadi kalau Anda menggabungkan dua salinan formulir yang sama, mengisi sebuah kotak di satu halaman akan mengisinya juga di halaman lain. Alat ini menyadari kasus itu dan mengatakannya.

### Bisakah ia membuka PDF yang dilindungi kata sandi?

Tidak, dan itu disengaja. Dokumen terenkripsi ditolak dengan pesan yang mengatakannya, bahkan ketika kata sandinya kosong — dan begitulah banyak pemindai serta mesin fotokopi menyimpan. Melepas proteksi sebuah file adalah pekerjaan yang berbeda dari memindahkan halamannya, dan alat yang melakukannya diam-diam berarti melakukan sesuatu yang tidak Anda minta.

### Kenapa tidak ada pratinjau halaman?

Karena menggambar sebuah halaman berarti perender PDF yang lengkap — font, gradasi, grup transparansi, mode pencampuran — yang berarti satu megabyte atau lebih mesin yang harus diambil dan dijalankan demi sekumpulan gambar mini. Yang ditampilkan kotaknya adalah hal-hal yang benar-benar dipakai saat mengurutkan ulang: nomor halaman, bentuk dan ukuran kertasnya, rotasi yang akan ditulis untuknya, dan dari file mana ia berasal. Pindaian melintang di tumpukan halaman tegak tetap terlihat sekilas.

### Apakah file yang sudah jadi bisa dibuka di mana-mana?

Ya. Keluarannya ditulis sebagai PDF 1.5 atau versi tertinggi yang dibutuhkan salah satu file yang Anda berikan, dan 1.5 dipahami setiap pembaca yang dirilis sejak 2003. Alat ini juga membuktikannya di perangkat Anda sendiri: ia membuka lagi setiap file yang sudah jadi dan menghitung halamannya dengan menelusuri pohon halaman sebelum menawarkannya kepada Anda.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada batas ukuran file selain yang diizinkan memori mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang dokumen Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim dokumen Anda ke tempat lain untuk digabungkan akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Dokumen Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Alat ini tidak menambahkan apa pun ke daftar itu: ia tidak punya fitur jaringan sendiri, bahkan yang opsional sekalipun. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Menggabungkan adalah pekerjaan yang paling layak untuk tidak diunggah.** Dokumen yang disatukan orang adalah dokumen yang datang dari suatu tempat: sebuah kontrak dan halaman tandatangannya, pindaian paspor dan rekening koran, surat dokter dan formulir klaim. Penggabung daring memiliki semuanya, di satu tempat, sudah tersusun rapi. Yang ini hanya punya sebuah halaman di peramban Anda dan tidak punya belahan yang lain.
- **Seluruh formatnya ada di repositori ini.** Sebuah PDF adalah daftar objek dan tabel yang mencatat di mana setiap objek dimulai. `src/objects.js` membaca sintaksisnya, `src/reader.js` mengikuti tabelnya, `src/assemble.js` menyalin halaman antar dokumen, dan `src/writer.js` menulis hasilnya. Tidak satu pun dari keempatnya mengimpor sesuatu yang bisa membuat permintaan. Tidak ada pustaka yang diambil dan tidak ada yang digambar di server.
- **File terenkripsi ditolak, bukan dibuka.** PDF dengan kata sandi ditolak, termasuk jenis yang dihasilkan pemindai dengan kata sandi kosong dan yang secara teknis akan terbuka. Melepas proteksi sebuah dokumen adalah pekerjaan yang berbeda dari memindah-mindah halamannya, dan melakukannya diam-diam akan menjadi hal yang mengejutkan bagi sebuah alat yang bertindak atas nama Anda.
- **File yang sudah jadi tidak mengatakan apa pun tentang tempat pembuatannya.** Tidak ada baris produser, tidak ada tanggal pembuatan, tidak ada nama alat. Ia juga tidak membawa paket XMP atau blok-blok privat yang ditinggalkan aplikasi tata letak — semua itu milik dokumen yang dulu ada, bukan dokumen yang baru saja Anda bangun. Apa pun di dalam halamannya sendiri disalin persis: alat ini memindahkan halaman, ia tidak menulis ulang apa yang ada di atasnya.
- **Tindakan yang bukan "pergi ke sebuah halaman" tidak disalin.** Sebuah PDF bisa membawa instruksi yang berjalan saat ia dibuka: putar ini, kirim formulir ini ke alamat itu, jalankan JavaScript ini. Halaman yang melewati alat ini menyimpan tautannya ke halaman lain dan ke alamat web, dan kehilangan sisanya. Mengurutkan ulang halaman milik orang lain bukan alasan untuk membawa skrip dokumennya ke file baru Anda.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang dokumen Anda: bukan file, bukan halaman, bukan nama, ukuran, atau jumlah halaman. Setiap baris yang membaca, menyalin, atau menulis PDF disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau dokumen Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju adalah situs milik orang lain.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap berfungsi. Itulah bukti yang paling sederhana: alat yang mengirim dokumen Anda ke tempat lain untuk digabungkan akan berhenti.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, dan `src/assemble.js` untuk seluruh proses penyalinannya — bagaimana sebuah halaman diangkat dari satu dokumen dan diletakkan di dokumen lain, dan apa yang sengaja ditinggalkan. Ia tidak bisa menjangkau jaringan, begitu pula pembaca dan penulis di sebelahnya.
