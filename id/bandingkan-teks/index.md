# Pembanding Teks — bandingkan dua teks, berdampingan

Dua teks masuk, setiap perbedaan ditandai, baris demi baris dan kata demi kata. Tidak ada yang ditempelkan ke server orang lain.

> Bandingkan dua teks dan lihat setiap perbedaannya, baris demi baris dan kata demi kata, berdampingan atau dalam satu kolom. Pembandingannya berjalan di peramban Anda dan tidak ada yang diunggah - kode yang belum dirilis tidak pernah meninggalkan mesin Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/bandingkan-teks/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## teks Anda **tidak pernah diunggah**. Tidak ada server.

Sebuah perbandingan adalah aritmetika atas dua string, dikerjakan di sini, di halaman ini. Algoritmanya adalah milik Myers — yang sama dengan yang dipakai `git diff` — ditulis sendiri di dalam `src/diff.js`, tempat Anda bisa membacanya. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan di sini itu penting: yang dibandingkan orang adalah kontrak, file konfigurasi, dan kode yang belum dirilis, selalu berpasangan.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa batas ukuran
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara membandingkan dua teks tanpa mengunggahnya

1. **Tempelkan kedua teksnya, atau jatuhkan kedua file-nya.** Yang asli di kiri, versi yang berubah di kanan. Dua file yang dijatuhkan sekaligus ke pemilihnya mendarat di sisi masing-masing, dalam urutan Anda menjatuhkannya; tukar sisinya kalau terbalik.
2. **Pilih cara membacanya.** Berdampingan, atau satu kolom. Ponsel mulai dengan satu kolom, karena berdampingan butuh dua kolom teks dan ponsel hanya muat kira-kira satu; menunya toh ada persis di situ.
3. **Abaikan yang tidak penting.** Spasi, huruf besar-kecil, baris kosong — masing-masing bisa diabaikan, supaya file yang diformat ulang tidak terbaca seperti seratus perubahan. Bawaannya, bagian tengah yang tak berubah dilipat menjadi sebuah hitungan, dengan tiga baris disimpan di kedua sisi setiap perubahan.
4. **Baca apa yang berubah.** Baris yang dihapus ditandai di kiri, yang ditambahkan di kanan, dan di dalam baris yang berubah kata-kata yang berbeda disorot — jadi perbandingan dua paragraf memperlihatkan kata yang berpindah, bukan dua paragraf utuh.
5. **Ambil tambalannya.** Unduhannya adalah `.patch` berformat terpadu, yang memang diharapkan tinjauan kode, `git apply`, dan setiap penampil diff. Salin menaruh hal yang sama di papan klip Anda.

## Versi lebih lengkap

[Cara membandingkan dua file JSON](https://abox.tools/id/panduan/membandingkan-dua-file-json/): Format kedua file dengan cara yang sama, urutkan kuncinya, lalu bandingkan. Kenapa diff JSON mentah hampir seluruhnya derau, cara membakukan kedua sisi di peramban, dan apa yang bertahan sampai ke tambalan.

## Juga ada di dalam kotak

- [Pengode & Pengurai Base64](https://abox.tools/id/encode-base64/): Base64, pengodean persen, entitas HTML, heksadesimal, dan escape garis miring terbalik, dua arah. Tidak ada yang ditempelkan ke server orang lain.
- [Berbagi teks dan berkas](https://abox.tools/id/berbagi-teks/): Bagikan ini hidup di tab yang terbuka. Pembaca menerimanya terenkripsi, langsung dari browser Anda, dan menutup tab mengakhirinya - tidak ada server yang menyimpan apa pun.
- [Pembuat QR dan Barkode](https://abox.tools/id/buat-kode-qr/): Ketik, dan ia menjadi sebuah kode. Tidak ada yang dikirim untuk membuatnya.
- [Pembaca QR & Barcode](https://abox.tools/id/pindai-kode-qr/): Arahkan ke sebuah kode, atau jatuhkan gambarnya. Ia dibaca di sini, dan tidak di tempat lain.

## Pertanyaan

### Apakah teks saya diunggah ke suatu tempat?

Tidak. Pembandingannya adalah fungsi yang berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Itulah alasan memakainya untuk kontrak, file konfigurasi, atau kode yang belum dirilis: menempelkannya ke pembanding orang lain berarti menyerahkan kedua versinya sekaligus.

### Apa sebenarnya yang dilakukan pembandingannya?

Ia mencari himpunan suntingan terpendek yang mengubah teks di kiri menjadi yang di kanan, memakai algoritma Myers — yang dipakai `git diff`. Terpendeklah yang membuat sebuah perbandingan terbaca: satu baris yang disisipkan di tengah seharusnya tampil sebagai satu penyisipan alih-alih sebagai setiap baris sesudahnya berubah. Di dalam baris yang berubah, kata yang berbeda juga ditandai, jadi perbandingan dua paragraf menunjukkan kata yang berpindah alih-alih dua paragraf utuh.

### Bisakah ia membandingkan dua file alih-alih dua tempelan?

Bisa. Jatuhkan keduanya sekaligus ke pemilihnya dan keduanya mendarat di sisi masing-masing, dalam urutan Anda menjatuhkannya. Keduanya dibaca peramban Anda ke halaman ini, dan hanya ke situlah mereka pergi. Tukar sisinya kalau Anda menjatuhkannya terbalik.

### Apa yang keluar dari sebuah perbandingan, dan bisakah saya menerapkannya?

Unduhannya adalah perbandingan terpadu — format `@@ -3,5 +3,5 @@` yang dibaca `git apply`, `patch`, dan setiap alat tinjauan kode. Salin melakukan hal yang sama ke papan klip Anda. Yang ada di layar adalah tampilannya: sisi demi sisi, atau satu kolom, dengan bagian yang tidak berubah diringkas menjadi sebuah hitungan kecuali Anda meminta semuanya.

### Bisakah ia mengabaikan spasi, huruf besar-kecil, atau baris kosong?

Bisa, masing-masing sendiri-sendiri. Mengabaikan spasi membuat file yang diformat ulang dibandingkan sebagai tak berubah; mengabaikan huruf besar-kecil memperlakukan `Error` dan `error` sebagai kata yang sama; mengabaikan baris kosong melompati baris yang tidak membawa apa-apa. Penghitung di atas hasilnya lalu menyebut keduanya sama begitu perbedaan yang Anda minta abaikan diabaikan — yang bukan pernyataan yang sama dengan identik, dan halaman ini menjaga kedua pernyataan itu tetap terpisah.

### Sebesar apa perbandingan yang bisa ditanganinya?

Tidak ada batas yang ditetapkan di sini, karena tidak ada server yang membayarnya. Dua teks dua puluh ribu baris dengan segelintir perubahan dibandingkan seketika, karena awal dan akhir yang sama dipangkas sebelum pekerjaan sesungguhnya dimulai. Perbandingan dua teks yang sama sekali tidak punya kesamaan berhenti lebih awal dan mengatakannya, alih-alih menghabiskan semenit membuktikan yang sudah jelas, dan perbandingan yang sangat panjang menggambar beberapa ribu baris pertama dan menyisakan sisanya untuk tambalan yang diunduh.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada batas berapa banyak yang Anda tempelkan. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang teks Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim teks Anda ke tempat lain untuk dibandingkan akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Apa yang Anda tempelkan tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat token yang ditempelkan bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Pembandingannya adalah fungsi di halaman ini yang mengambil dua string dan mengembalikan apa yang berubah.
- **Algoritmanya yang baku, terbaca seluruhnya.** Algoritma skrip suntingan terpendek milik Myers, yang sama dengan yang dipakai `git diff`, ditulis sendiri di dalam `src/diff.js` dengan keputusan-keputusannya diberi komentar. Pengujian di `tests/js/text-diff.test.js` membuktikan penghapusannya membangun kembali teks kiri dan penyisipannya membangun kembali teks kanan, dan itulah arti benar bagi sebuah diff.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi satu karakter pun dari teks Anda. Setiap baris yang membaca, mengurai, atau menulisnya disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy dan `src/diff.js` untuk algoritma Myers, lintasan kata demi kata di dalam setiap baris yang berubah, dan tiga pengaman yang mencegah perbandingan patologis membekukan halamannya.
