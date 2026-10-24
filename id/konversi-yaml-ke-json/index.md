# YAML ke JSON — dan JSON kembali ke YAML

Dua arah, dan ia menyebutkan biaya masing-masing. Tidak ada satu pun yang ditempel ke server orang lain.

> Ubah YAML ke JSON dan JSON ke YAML di peramban Anda. Ia membaca YAML 1.2, jadi yes dan no tetap berupa teks, dan ia menyebutkan persis apa yang hilang di tiap arah. Tidak ada yang diunggah: sebuah berkas konfigurasi tidak pernah meninggalkan perangkat Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/konversi-yaml-ke-json/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## file YAML dan JSON Anda **tidak pernah diunggah**. Tidak ada server.

Mengubah adalah hitungan atas sebuah untai teks, dikerjakan di sini, di halaman ini. Kedua pengurainya ditulis tangan dan ada di `src/` — `shared/parse-yaml.js` dan `shared/parse-json.js` — dan tidak ada yang lain. Alat ini tidak punya fungsi jaringan apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan di sini itu lebih berarti daripada hampir di mana pun di situs ini: sebuah berkas YAML biasanya adalah konfigurasi penggelaran, dan konfigurasi penggelaran biasanya penuh nama host, nama bucket, dan rahasia.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa batas ukuran
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara mengubah YAML ke JSON tanpa mengunggahnya

1. **Pilih arahnya.** *YAML ke JSON* atau *JSON ke YAML*. Catatan di bawah menunya menyebutkan apa yang hilang di arah itu sebelum Anda menempel apa pun, bukan sesudahnya.
2. **Tempel, atau jatuhkan berkasnya.** Apa pun yang bisa Anda sorot dan salin akan jalan. Berkas yang dijatuhkan ke pemilih dibaca oleh peramban Anda sendiri lalu dimasukkan ke kotaknya — tidak ada langkah unggah yang perlu dilewati — dan akhiran `.json` atau `.yaml` sekalian menetapkan arahnya untuk Anda.
3. **Pilih indentasinya.** Dua spasi, empat, atau satu tab. Tab hanya ditawarkan untuk JSON: YAML didefinisikan dengan spasi, dan tab bukan indentasi yang sah di dalamnya.
4. **Baca galatnya di tempat galatnya berada.** Pengurai yang gagal di sini menyebut apa yang ditemuinya dan di baris serta kolom berapa, alih-alih “token tak terduga di posisi 4193”. Biasanya itu sudah cukup untuk membetulkan sebuah berkas konfigurasi tanpa membuka apa pun lagi.
5. **Ambil hasilnya.** Salin, atau unduh sebagai berkas, dinamai menurut format tempat ia keluar.

## Juga ada di dalam kotak

- [Pemformat XML](https://abox.tools/id/format-xml/): XML dirapikan agar terbaca atau dimampatkan agar siap kirim, dan diubah ke JSON dua arah. Tidak ada satu pun yang ditempel ke server orang lain.
- [Pembanding Teks](https://abox.tools/id/bandingkan-teks/): Dua teks masuk, setiap perbedaan ditandai, baris demi baris dan kata demi kata. Tidak ada yang ditempelkan ke server orang lain.
- [Pengode & Pengurai Base64](https://abox.tools/id/encode-base64/): Base64, pengodean persen, entitas HTML, heksadesimal, dan escape garis miring terbalik, dua arah. Tidak ada yang ditempelkan ke server orang lain.
- [Berbagi teks dan berkas](https://abox.tools/id/berbagi-teks/): Bagikan ini hidup di tab yang terbuka. Pembaca menerimanya terenkripsi, langsung dari browser Anda, dan menutup tab mengakhirinya - tidak ada server yang menyimpan apa pun.

## Pertanyaan

### Apakah YAML saya diunggah ke suatu tempat?

Tidak. Kedua pengurai dan kedua pencetak di halaman ini adalah fungsi yang berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri. Alat ini tidak punya fungsi jaringan apa pun — tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebutkan setiap alamat yang boleh dihubunginya, tidak satu pun milik kami. Justru itulah alasannya memakai ini untuk konfigurasi penggelaran: berkas semacam itu penuh nama host, nama bucket, dan sesekali sebuah rahasia yang hendak dipindahkan seseorang, dan menempelkannya ke pengubah milik orang lain sama saja memberikannya.

### Apa yang hilang saat mengubah YAML ke JSON?

Komentarnya, karena JSON tidak punya tempat untuk menaruhnya. Jangkar, alias, dan tag ditolak langsung alih-alih ditebak — masing-masing mengatakan sesuatu yang tidak bisa dikatakan JSON, dan pengubah yang diam-diam memilih satu tafsiran akan menyerahkan dokumen yang bukan isi berkasnya. Arah sebaliknya tidak kehilangan apa pun: setiap dokumen JSON sudah merupakan dokumen YAML.

### YAML saya menulis no dan JSON-nya keluar sebagai teks. Kenapa?

Karena itu memang teks, dan ini membaca YAML 1.2, bukan 1.1. Di YAML 1.1, `yes`, `no`, `on`, dan `off` adalah boolean, dan itulah kutu terkenal yang mengubah kode negara Norwegia menjadi `false`. YAML 1.2 meninggalkannya, dan ini juga: hanya `true`, `false`, `null`, dan `~` yang dibaca sebagai sesuatu selain teks. Ke arah sebaliknya, kata-kata itu ditulis kembali *dalam tanda kutip*, meski di sini tanpa tanda kutip pun akan terbaca sebagai teks — sebab apa pun yang membukanya nanti mungkin tidak begitu. PyYAML masih memakai 1.1 sebagai bawaan. Membaca dengan ketat dan menulis dengan hati-hati adalah satu-satunya paduan yang benar di kedua arah.

### Apakah urutan kunci saya dipertahankan?

Ya, di kedua arah, dan itu lebih sulit daripada kedengarannya. Pengubah yang dibangun di atas `JSON.parse` diam-diam memindahkan kunci yang menyerupai bilangan bulat ke depan, sehingga `{"10":a,"2":b}` kembali sebagai `{"2":b,"10":a}`. Angka mempertahankan digit yang Anda ketik, jadi id rekening dua puluh digit tidak kehilangan tiga digit terakhirnya gara-gara sebuah double. Kalau Anda memang *ingin* urut, ada kotak centangnya, dan ia mengurutkan menurut cara kuncinya terbaca, bukan menurut titik kodenya.

### Bisakah ia mengubah beberapa dokumen YAML sekaligus?

Tidak, dan ia mengatakannya alih-alih memilih salah satu. Berkas dengan pemisah `---` memuat lebih dari satu dokumen, dan JSON tidak punya bentuk yang berarti “beberapa dokumen” — sebuah array akan menjadi klaim yang tidak pernah dibuat berkas itu. Ubahlah satu per satu.

### Kenapa tidak ada pemformat YAML di sini?

Karena YAML tidak punya bentuk mampat yang layak ditulis — yang pendek adalah gaya flow, yang tak terbaca, dan tak terbaca justru kebalikan dari alasan menyimpan sebuah berkas dalam YAML. Merapikan JSON, XML, HTML, dan CSS adalah tugas [pemformat JSON](https://abox.tools/id/format-json/), dan ia merapikan YAML juga.

### Sebesar apa berkas yang bisa ditangani?

Tidak ada batas yang dipasang di sini, sebab tidak ada server yang membayarinya. Batas sesungguhnya adalah perangkat Anda sendiri: beberapa megabita YAML aman, dan untuk dokumen yang sangat panjang halaman ini menunggu jeda ketikan Anda sebelum mengubah, alih-alih berebut papan ketik dengan Anda.

### Apakah gratis, dan perlukah akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa coba, dan tidak ada batas berapa banyak yang Anda tempel. Situs ini memasang iklan, dan itulah yang membiayainya; iklan-iklan itu tidak diberi apa pun tentang teks Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan sambungan internet dan halaman ini tetap bekerja. Itu sekaligus cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim konfigurasi Anda pergi untuk diubah akan berhenti begitu sambungannya dicabut.

## Cara memverifikasi klaim privasi ini

- **Yang Anda tempel tidak punya tempat untuk pergi.** Di dalam Content-Security-Policy tertulis setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik kami. Tidak ada titik akhir di sini tempat sebuah konfigurasi yang ditempel bisa dikumpulkan, dan tidak ada pula di dalam kode yang akan mengirimkannya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun dalam `src/`. Kedua pengurai dan kedua pencetaknya adalah fungsi di halaman ini yang menerima untai teks dan mengembalikan untai teks.
- **Ia membaca YAML 1.2, jadi Norwegia tetap Norwegia.** Di YAML 1.1, `no` adalah boolean, dan itulah kutu terkenal yang mengubah kode negara Norwegia menjadi `false`. Ini membaca 1.2, tempat ia menjadi teks sebagaimana tampaknya. Ke arah sebaliknya kata-kata itu ditulis kembali *dalam tanda kutip*, sebab apa pun yang membuka berkasnya nanti bisa jadi masih pembaca 1.1. `tests/js/text-convert.test.js` memeriksa kedua bagiannya.
- **Konversi yang tidak bisa jujur memilih berhenti.** Sebuah jangkar, alias, atau tag di dalam YAML mengakhiri konversi dengan pesan yang menyebut ia ada di baris mana, alih-alih menghasilkan dokumen JSON yang diam-diam berarti hal lain. JSON tidak punya cara mengatakan “simpul yang sama dua kali”, dan memilih satu tafsiran berarti memilihkannya untuk Anda.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran datang dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi satu karakter dari teks Anda. Setiap baris yang membaca, mengurai, atau menulisnya disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan jaringan dan alat ini tidak berubah, sebab memang tidak pernah ada langkah jaringan di dalamnya. Itu bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/shared/parse-yaml.js` untuk pembaca yang menolak sebuah jangkar alih-alih menebak maksudnya, dan `src/convert.js` untuk alasan sebuah konversi adalah satu pengurai dan satu pencetak, tanpa apa pun di antaranya yang mengenal kedua format sekaligus.
