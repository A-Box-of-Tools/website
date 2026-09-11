# Pemformat JSON — rapikan, padatkan, atau ubah formatnya

JSON, XML, HTML, CSS, dan YAML, diformat atau diubah. Tidak ada yang ditempelkan ke server orang lain.

> Format dan padatkan JSON, XML, HTML, CSS, dan YAML, dan ubah JSON menjadi YAML atau XML dan sebaliknya. Penguraiannya berjalan di peramban Anda dan tidak ada yang diunggah - sebuah token atau file konfigurasi tidak pernah meninggalkan mesin Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/format-json/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## teks dan kode Anda **tidak pernah diunggah**. Tidak ada server.

Memformat dan mengubah format adalah aritmetika atas sebuah string, dikerjakan di sini, di halaman ini. Penguraiannya ditulis sendiri dan ada di dalam `src/` — `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js` — dan tidak ada yang lain. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan itu lebih penting di sini daripada hampir di mana pun lain di situs ini: yang ditempelkan orang ke sebuah pemformat adalah token akses, cookie sesi, catatan pelanggan, dan kode yang belum dirilis.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa batas ukuran
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara memformat atau mengubah JSON tanpa mengunggahnya

1. **Pilih pekerjaannya.** Dua tab, satu kotak: *Format* merapikan atau memadatkan JSON, XML, HTML, CSS, dan YAML; *Ubah* menjadikan JSON sebagai YAML atau XML dan sebaliknya. Teks yang baru saja Anda format adalah teks yang Anda ubah, tanpa menempelkannya dua kali.
2. **Tempelkan, atau jatuhkan file-nya.** Apa pun yang bisa Anda pilih dan salin bisa dipakai. File yang dijatuhkan ke pemilihnya dibaca peramban Anda sendiri dan ditaruh di kotaknya — tidak ada langkah unggah untuk ditinggalkan.
3. **Biarkan ia menentukan bahasanya, atau beri tahu.** Menunya mengatakan ia membaca teksnya sebagai apa, dan membetulkannya cukup satu klik. Sebuah tebakan hanyalah titik awal, dan itulah sebabnya ia ditampilkan alih-alih diterapkan diam-diam.
4. **Pilih indentasinya, atau mampatkan sampai rata.** Dua spasi, empat, atau sebuah tab. Memampatkannya sampai rata adalah dokumen yang sama dengan setiap spasi yang hanya ada demi keterbacaan dikeluarkan, dan hasilnya mengatakan itu menghemat berapa byte.
5. **Baca galatnya di tempat galatnya berada.** Pengurai yang gagal di sini mengatakan apa yang ditemukannya dan pada baris serta kolom mana, alih-alih "token tak terduga di posisi 4193". Itu biasanya cukup untuk membetulkan sebuah file konfigurasi tanpa membuka apa pun yang lain.
6. **Ambil hasilnya.** Salin, atau unduh sebagai file, dinamai menurut bahasa yang menjadi hasilnya.

## Versi lebih lengkap

[Cara memformat JSON tanpa menyerahkannya kepada siapa pun](https://abox.tools/id/panduan/format-json-tanpa-mengunggah/): Cara menata, memeriksa, dan memampatkan JSON di peramban Anda sendiri - apa yang tidak boleh diubah sebuah pemformat pada file Anda, cara membaca pesan galatnya, dan kenapa situs tempat Anda menempelkannya itu penting.

## Juga ada di dalam kotak

- [Pengubah YAML ke JSON](https://abox.tools/id/konversi-yaml-ke-json/): Dua arah, dan ia menyebutkan biaya masing-masing. Tidak ada satu pun yang ditempel ke server orang lain.
- [Pemformat XML](https://abox.tools/id/format-xml/): XML dirapikan agar terbaca atau dimampatkan agar siap kirim, dan diubah ke JSON dua arah. Tidak ada satu pun yang ditempel ke server orang lain.
- [Pembanding Teks](https://abox.tools/id/bandingkan-teks/): Dua teks masuk, setiap perbedaan ditandai, baris demi baris dan kata demi kata. Tidak ada yang ditempelkan ke server orang lain.
- [Pengode & Pengurai Base64](https://abox.tools/id/encode-base64/): Base64, pengodean persen, entitas HTML, heksadesimal, dan escape garis miring terbalik, dua arah. Tidak ada yang ditempelkan ke server orang lain.

## Pertanyaan

### Apakah teks saya diunggah ke suatu tempat?

Tidak. Setiap pengurai dan setiap penulis di halaman ini adalah fungsi yang berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Itulah alasan memakainya untuk sebuah token akses, cookie sesi, atau catatan pelanggan: menempelkan salah satunya ke pemformat orang lain berarti memberikannya kepada mereka.

### Apakah memformat JSON mengubah selain tata letaknya?

Tidak, dan itu lebih sulit daripada kedengarannya. Kunci menjaga urutan yang Anda tulis — pemformat yang dibangun di atas `JSON.parse` diam-diam memindahkan kunci mirip bilangan bulat ke depan, jadi `{"10":a,"2":b}` kembali sebagai `{"2":b,"10":a}`. Angka menjaga digit yang Anda ketik, jadi id dua puluh digit tidak kehilangan tiga digit terakhirnya ke sebuah bilangan ganda dan `1e999` tidak menjadi `null`. Kunci rangkap keduanya disimpan, karena standarnya tidak mengatakan mana yang menang dan membuang salah satunya berarti memilihkannya untuk Anda.

### Bahasa apa saja yang bisa diformatnya?

JSON, XML, HTML, CSS, dan YAML. JSON, XML, HTML, dan CSS juga bisa dimampatkan sampai rata; YAML tidak, karena bentuk pendeknya adalah gaya alir, yang tidak terbaca, dan tidak terbaca adalah kebalikan dari alasan menyimpan sebuah file dalam YAML. JavaScript sengaja tidak ada di daftar — lihat pertanyaan tentangnya di bawah.

### Kenapa ia tidak memformat JavaScript, Python, atau SQL?

Karena merapikan sebuah bahasa pemrograman berarti menguraikannya dengan benar, dan pemformat yang nyaris benar lebih buruk daripada tidak ada sama sekali: ia menghasilkan kode yang tampak baik-baik saja dan melakukan sesuatu yang lain. JSON, XML, CSS, dan YAML punya tata bahasa yang cukup kecil untuk dibaca sendiri dan diperiksa dengan uji yang bisa Anda jalankan. Pemformat JavaScript adalah Prettier, yang berukuran satu megabyte pengurai, dan tempatnya di penyunting Anda, bukan di sebuah halaman web.

### YAML saya berkata no dan JSON-nya keluar sebagai string. Kenapa?

Karena memang itu sebuah string, dan alat ini membaca YAML 1.2 alih-alih 1.1. Di YAML 1.1, `yes`, `no`, `on`, dan `off` adalah nilai boolean, dan itulah bug terkenal yang mengubah kode negara Norwegia menjadi `false`. YAML 1.2 membuangnya dan alat ini juga: hanya `true`, `false`, `null`, dan `~` yang dibaca sebagai selain teks. Ke arah sebaliknya, kata-kata itu ditulis kembali *di dalam tanda kutip*, meski alat ini akan membacanya sebagai teks tanpa tanda kutip — karena apa pun yang membuka file itu berikutnya mungkin tidak. PyYAML masih memakai 1.1 secara bawaan. Membaca dengan ketat dan menulis dengan hati-hati adalah satu-satunya kombinasi yang benar di kedua keadaan.

### Apa yang hilang saat mengubah YAML menjadi JSON?

Komentar, karena JSON tidak punya tempat untuk menaruhnya. Jangkar, alias, dan tag ditolak mentah-mentah alih-alih ditebak — masing-masing mengatakan sesuatu yang tidak bisa dikatakan JSON, dan pengubah yang diam-diam memilih sebuah tafsir akan menyerahkan dokumen yang bukan isi file itu kepada Anda. Arah sebaliknya tidak kehilangan apa pun: setiap dokumen JSON sudah merupakan dokumen YAML.

### Apa yang hilang saat mengubah JSON menjadi XML?

Perbedaan antara objek kosong, larik kosong, dan string kosong — semuanya menjadi elemen kosong — dan tipe setiap nilai, karena XML tidak punya tipe. Itulah sebabnya pengubahan sebaliknya membiarkan semuanya sebagai string alih-alih memutuskan bahwa `8080` adalah sebuah angka. Sebuah larik menjadi elemen berulang, satu-satunya bentuk yang bisa dibaca kembali, dan kunci yang tidak bisa ditampung sebuah nama elemen karakternya yang menyulitkan diganti alih-alih dikeluarkan sebagai dokumen yang tidak akan dibaca pengurai mana pun.

### Apakah mengindentasi ulang HTML mengubah tampilan halamannya?

Bisa, dan alat ini jujur soal itu. Spasi di antara dua elemen sebaris adalah spasi di antara dua kata, jadi memindahkannya tidak gratis. Dua hal menahannya: `<pre>` dan `<textarea>` disalin persis seperti adanya, dan elemen yang tidak memuat apa pun selain teks tetap di satu baris. Selebihnya dirapikan.

### Sebesar apa file yang bisa ditanganinya?

Tidak ada batas yang ditetapkan di sini, karena tidak ada server yang membayarnya. Batas praktisnya adalah mesin Anda sendiri: beberapa megabyte JSON tidak masalah, dan pada dokumen yang sangat panjang halaman ini menunggu jeda dalam ketikan Anda sebelum memformat ulang, alih-alih berebut papan ketik dengan Anda.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada batas berapa banyak yang Anda tempelkan. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang teks Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia tetap bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim teks Anda ke tempat lain untuk diformat akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Apa yang Anda tempelkan tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat token yang ditempelkan bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Setiap pengurai dan setiap penulis adalah fungsi di halaman ini yang mengambil sebuah string dan mengembalikan sebuah string.
- **Pemformatnya menjaga apa yang diberikan kepadanya.** Sebuah objek JSON kembali dengan kuncinya dalam urutan yang Anda tulis dan angkanya dieja sebagaimana Anda mengejanya, karena `src/shared/parse-json.js` adalah sebuah pengurai alih-alih panggilan ke `JSON.parse`, yang mengurutkan ulang kunci mirip bilangan bulat dan mengubah id dua puluh digit menjadi bilangan ganda terdekat. Uji di `tests/js/text-format.test.js` memeriksa persis itu.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi satu karakter pun dari teks Anda. Setiap baris yang membaca, mengurai, atau menulisnya disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/shared/parse-json.js` untuk pengurai yang menjaga kunci Anda dalam urutan yang Anda tulis, dan `src/convert.js` untuk alasan sebuah pengubahan adalah satu pengurai dan satu penulis, tanpa apa pun di antaranya yang tahu kedua format sekaligus.
