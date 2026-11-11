# Kontak

Yang membaca ini satu orang, dan ia membaca semuanya. Di bawah dijelaskan masing-masing dari dua jalur itu paling cocok untuk apa, apa yang perlu disertakan supaya sebuah bug benar-benar bisa ditemukan, dan apa yang terjadi setelah Anda mengirimnya.

Terakhir diperbarui 27 Agustus 2026

## Dua jalur

**Surel — [hi@abox.tools](mailto:hi@abox.tools).** Langsung sampai ke orang yang menulis alat-alat ini. Paling cocok untuk apa pun yang Anda lebih suka tidak dikatakan di depan umum: kekhawatiran soal privasi, keberatan soal hak cipta atau merek, masalah keamanan, atau bug yang hanya bisa Anda jelaskan dengan melampirkan berkas yang bukan urusan orang lain.

**Pelacak isu — [github.com/A-Box-of-Tools/website/issues](https://github.com/A-Box-of-Tools/website/issues).** Orang yang sama juga membacanya. Paling cocok untuk apa pun yang juga berguna bagi orang lain: alat yang salah menangani jenis berkas tertentu, terjemahan yang terdengar keliru dalam bahasa Anda, permintaan fitur, atau pertanyaan yang jawabannya sebaiknya berada di tempat yang bisa ditemukan orang berikutnya. Ini memerlukan akun GitHub; surel tidak.

Tidak ada nomor telepon dan tidak ada obrolan langsung. Ini proyek satu orang, dan saluran bantuan yang tidak ada penjaganya lebih buruk daripada mengatakannya terus terang.

## Apa yang terjadi setelah Anda menulis

Seorang manusia membacanya, biasanya dalam beberapa hari. Balasan ditulis dalam bahasa Inggris.

Bug yang bisa direproduksi biasanya diperbaiki dalam satu atau dua minggu, dan perbaikannya muncul di riwayat perubahan publik, dengan laporan Anda tertaut padanya kalau Anda mengirimkannya sebagai isu. Permintaan fitur mendapat jawaban yang jujur, dan kadang jawabannya tidak. [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md) menyimpan satu paragraf untuk setiap gagasan yang ditolak beserta alasannya, jadi kata tidak di sini datang bersama penalarannya.

Yang tidak akan terjadi: Anda tidak akan dimasukkan ke daftar surel mana pun, dan alamat Anda tidak akan diberikan kepada siapa pun. Alamat itu dipakai untuk membalas Anda, dan tidak untuk hal lain.

## Melaporkan bug supaya bisa ditemukan

Alat-alat ini berjalan di perangkat Anda dan bukan di server, yang berarti di sini tidak ada log yang bisa dibaca. Semua yang terjadi, terjadi di tempat yang hanya Anda yang bisa melihatnya. Jadi laporan yang menyebut halaman mana dan apa yang salah bernilai lebih di sini daripada hampir di mana pun. Rincian yang berguna:

- **Alat yang mana**, dengan alamatnya: ada tiga puluh enam, dan beberapa di antaranya mengerjakan pekerjaan yang bertetangga.
- **Peramban dan versinya**, dan apakah itu ponsel. Sebagian besar bug semacam ini yang mengejutkan ternyata soal cara satu peramban tertentu memahami kontainer video atau enkoder gambar, bukan soal alatnya.
- **Berkasnya apa**: formatnya, kira-kira sebesar apa, dan dari mana asalnya, misalnya dari kamera atau ponsel tertentu. Anda tidak perlu mengirim berkasnya. Kalau kebetulan ada contoh kecil yang menunjukkan masalahnya dan bukan berkas pribadi, itu sangat membantu; kalau tidak ada, menjelaskannya biasanya sudah cukup.
- **Apa yang Anda harapkan dan apa yang Anda dapat.** “Tidak jalan” dan “hasil ekspornya tanpa suara” adalah dua bug berbeda dengan penyebab berbeda.
- **Apa pun yang berwarna merah di konsol peramban**, kalau Anda tahu cara membukanya. Salin kesalahan yang pertama, bukan tangkapan layar semuanya.

## Laporan keamanan dan privasi

Laporan semacam ini lewat surel saja, bukan di tempat terbuka: [hi@abox.tools](mailto:hi@abox.tools). Apa pun yang memungkinkan sebuah halaman di sini menjangkau berkas yang bukan urusannya, mengirim berkas ke suatu tempat, atau menjalankan kode yang tidak disajikan kepadanya, ditanggapi serius dan diperiksa dalam minggu yang sama. Begitu pula setiap cara situs ini mengumpulkan sesuatu yang menurut [halaman privasi](https://abox.tools/id/privasi/) tidak dikumpulkan.

Tidak ada program hadiah bug dan tidak ada uang, dan lebih baik itu dikatakan dari awal daripada baru ketahuan setelah pekerjaannya selesai. Penyebutan nama di commit dan di catatan rilis ditawarkan, dan ditolak dengan sama senangnya.

## Hak cipta, merek, dan permintaan penghapusan

Tidak ada yang diunggah pengguna ke situs ini, dan di sini juga tidak ada tempat bagi siapa pun untuk menerbitkan apa pun: alat-alatnya memproses berkas di dalam peramban pengunjung sendiri, dan tidak ada yang ia buka atau hasilkan sampai ke situs ini. Jadi tidak ada materi tersimpan yang bisa dihapus, dan tidak ada akun yang bisa ditangguhkan.

Kalau ada sesuatu yang ditulis atau digambar *oleh situs ini* — sebuah halaman, sebuah ilustrasi, sepotong kode — yang melanggar hak Anda, tulislah ke [hi@abox.tools](mailto:hi@abox.tools) dengan menyertakan alamat halamannya dan apa yang dipersoalkan, dan itu akan ditangani langsung.

## Iklan dan penawaran komersial

Situs ini memuat iklan melalui Google, dan hanya itulah keseluruhan kesepakatannya. Pemasangan iklan langsung, tulisan bersponsor, tautan berbayar, tulisan tamu, dan tukar tautan semuanya ditolak, dan alasannya bukan sikap jaim: halaman yang diam-diam memuat tulisan orang lain adalah halaman yang pernyataannya tidak bisa lagi ditimbang pembaca, sedangkan setiap pernyataan di situs ini justru mengundang pembaca untuk memeriksanya. Hemat saja surelnya.

Memakai alat-alat ini secara komersial tidak memerlukan izin maupun lisensi: semuanya bebas dipakai untuk tujuan apa pun, termasuk di dalam perusahaan. Penggunaan ulang [kodenya](https://github.com/A-Box-of-Tools/website) diatur oleh lisensi di repositori, yang permisif, dan mengambil satu modul dari sana justru itulah gunanya lisensi tersebut.

## Kepada siapa Anda menulis

abox.tools adalah proyek independen yang dibiayai sendiri dan dijalankan satu orang dari Ontario, Kanada. Ini bukan perusahaan, dan di balik alamat di atas tidak ada bagian dukungan pelanggan — itulah sebabnya balasannya lebih lambat daripada balasan perusahaan, dan itu pula sebabnya balasan itu ditulis orang yang sudah membaca kodenya. [Halaman tentang](https://abox.tools/id/tentang/) menjelaskan siapa yang membangun ini, mengapa alat-alatnya bekerja seperti itu, dan bagaimana situs ini membiayai dirinya.
