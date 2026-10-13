# Kapan menaruh gambar di dalam CSS Anda, dan kapan tidak

Gambar yang ditulis ke dalam sebuah lembar gaya tiba bersamanya: tidak ada permintaan kedua, tidak ada penantian. Ia juga berhenti menjadi sebuah file — jadi ia tidak bisa disinggahkan sendiri, dan ia diunduh lagi setiap kali apa pun di sekitarnya berubah. Inilah tempat pertukaran itu layak dilakukan, dan tempat diam-diam ia tidak layak.

[Buka Gambar ke Data URI](https://abox.tools/id/gambar-ke-base64/): Seluruh gambar sebagai satu baris teks. Tempelkan langsung ke CSS atau HTML.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Gambar ke Data URI](https://abox.tools/id/gambar-ke-base64/), jatuhkan gambarnya, pilih *Sebuah properti khusus CSS*, lalu tempelkan barisnya ke bagian atas lembar gaya Anda. Lalu pakai sebagai `background-image: var(--logo)` di mana pun Anda membutuhkannya.

Lakukan itu ketika gambarnya kecil — sebuah ikon, sebuah bulatan butir, sebuah tanda panah, sebuah pola — dan ia dibutuhkan di setiap halaman. Jangan lakukan dengan sebuah foto. Semua di bawah ini adalah kenapa dua kalimat itu berbeda, dan bagaimana tahu Anda sedang melihat yang mana.

## Apa sebenarnya sebuah data URI

Sebuah alamat yang memuat bendanya alih-alih menunjuk padanya. Kalau sebuah lembar gaya biasanya berkata

```
background-image: url("logo.png");
```

dan perambannya pergi mengambil `logo.png`, sebuah data URI berkata

```
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...");
```

dan tidak ada yang perlu diambil: gambarnya sudah ada di sana, tertulis dalam karakter. Ada tiga bagian. `data:` adalah skemanya. `image/png` adalah jenis medianya, dan perambannya memercayainya sepenuhnya — lebih lanjut soal itu di bawah. Semua setelah komanya adalah file-nya.

Itulah seluruh gagasannya. Ia bukan trik atau akal-akalan; ia sudah ada di standarnya sejak 1998 dan bekerja di setiap peramban yang dirilis sejak itu.

## Apa yang Anda dapat: satu perjalanan bolak-balik lebih sedikit

Penghematannya bukan lebar pita. Melainkan permintaannya.

Sebuah peramban tidak bisa meminta `logo.png` sampai ia membaca lembar gaya yang menyebutnya, dan ia tidak bisa membaca lembar gayanya sampai ia mengambilnya. Jadi gambar latar biasa berada setidaknya dua perjalanan bolak-balik dalamnya di pemuatan halamannya, dan di sebuah ponsel di jaringan yang lambat, satu perjalanan bolak-balik bisa beberapa ratus milidetik tanpa peduli sekecil apa file-nya. Tanda panah 600 byte nyaris tidak berbiaya untuk ditransfer dan tetap bisa berbiaya seperempat detik untuk tiba.

Kalau disisipkan, ia tiba bersama lembar gayanya. Itulah seluruh manfaatnya, dan untuk ikon kecil yang muncul di bagian atas layar itu manfaat yang nyata.

## Berapa harganya: sepertiga, lalu penyinggahannya

**Base64 menambah sekitar sepertiga.** Tiga byte file menjadi empat karakter, karena itulah yang dibutuhkan untuk menuliskan byte sembarang hanya dengan karakter yang diizinkan sebuah URL. Tidak ada pengode cerdik yang menghindarinya. PNG 9 KB adalah 12 KB lembar gaya.

**Kompresi tidak mengembalikannya.** Inilah bagian yang diandaikan orang begitu saja. Gzip dan Brotli bekerja dengan menemukan pengulangan, dan sebuah PNG, JPEG, dan WebP sudah dikompres — sangat sedikit pengulangan yang tersisa di dalamnya, dan base64 tidak menambahkan apa pun. Pada praktiknya Anda mendapat kembali sekitar sepersepuluh dari sepertiganya, bukan seluruhnya. (SVG adalah kasus sebaliknya, dan bagian berikutnya tentang itu.)

**Ia berhenti menjadi sebuah file.** Inilah ongkos yang tidak muncul di pengukuran mana pun yang mungkin Anda ambil, dan inilah yang penting pada skala besar:

- **Ia tidak bisa disinggahkan sendiri.** Gambar biasa diambil sekali lalu dipakai ulang selama setahun. Yang disisipkan adalah bagian dari lembar gayanya, jadi ia hidup dan mati mengikuti entri singgahan lembar gayanya.
- **Mengubah apa pun mengunduh ulang semuanya.** Perbaiki sebuah margin, kirimkan lembar gaya baru, dan setiap pengunjung mengunduh gambar yang disisipkan itu lagi bersamanya — sebuah gambar yang belum berubah selama dua tahun.
- **Ia berada di jalur kritis.** Lembar gaya menahan penggambaran. Gambar tidak. Menyisipkan sebuah gambar memindahkannya dari kategori kedua ke kategori pertama: halamannya tidak bisa terlukis sampai seluruhnya, gambarnya termasuk, sudah tiba.
- **Ia tidak bisa diambil secara paralel.** Peramban mengunduh banyak hal sekaligus. Gambar yang disisipkan bukan hal yang terpisah, jadi ia tidak mendapat satu pun dari itu.

Ambang kasarnya, yang merupakan tempat nasihatnya berubah alih-alih tempat sebuah peramban melakukan sesuatu yang berbeda: di bawah sekitar 2 KB ia kemenangan yang jelas; sampai sekitar 10 KB ia biasanya masih sepadan untuk sesuatu yang ada di setiap halaman; lewat 50 KB ia sebuah kekeliruan tanpa pesan galat. [Alatnya](https://abox.tools/id/gambar-ke-base64/) memberi tahu Anda setiap hasilnya mendarat di pita yang mana, dengan jumlah karakternya di sebelahnya.

![Kartu keluaran: aturan CSS berisi URI data base64, dengan ukuran berkas asli dan ukuran hasil pengodean di sebelahnya.](https://abox.tools/screens/embed-an-image-in-css/output.webp)

Salinan yang dikodekan kira-kira sepertiga lebih besar daripada berkas asalnya. Itulah biaya yang dibahas bagian ini, dan ia tertulis alih-alih dibiarkan untuk ditemukan sendiri.

## Jangan pernah mem-base64-kan sebuah SVG

Inilah kekeliruan tunggal yang paling umum pada gambar yang disisipkan, dan ia dibuat pengekspor dan pengaya bangun sesering dibuat orang.

SVG adalah teks. Sebuah URL sudah membawa teks. Hanya segelintir karakter yang harus dilepaskan — `%`, `#`, `<`, `>`, dan tanda kutip yang Anda pakai membungkusnya — dan semua yang lain bisa dibiarkan persis apa adanya. Mengodekannya dengan cara itu memberi Anda URI yang biasanya sekitar seperlima lebih pendek daripada base64 file yang sama, dan yang sesudahnya terkompres seperti teks alih-alih seperti derau.

Ia juga masih terbaca:

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E...");
```

Anda bisa melihat `viewBox`-nya. Anda bisa mengubah warna isiannya di penyunting Anda tanpa mendekodekan apa pun. Base64-kan file yang sama dan ia menjadi tembok huruf yang tidak akan pernah disentuh siapa pun lagi. [Gambar ke Data URI](https://abox.tools/id/gambar-ke-base64/) melakukan ini secara otomatis untuk apa pun yang ternyata sebuah SVG, dan punya sebuah kotak centang untuk rantai perkakas langka yang bersikeras meminta `;base64`.

## Kekeliruan tanda kutip yang hanya merusak SVG

CSS mengizinkan Anda menulis `url()` tanpa tanda kutip, dan untuk nama file biasa itu tidak masalah:

```
background-image: url(logo.png);
```

Lakukan hal yang sama dengan SVG berkode persen dan ia rusak. Token `url()` tanpa tanda kutip berakhir di spasi, kurung, tanda kutip, atau karakter kendali yang pertama — dan sebuah SVG penuh spasi, di antara setiap atribut dan setiap angka di sebuah jalur. Deklarasinya lalu menjadi tidak sah, CSS membuang deklarasi yang tidak sah secara diam-diam, dan Anda tidak mendapat latar dan tidak mendapat galat.

Solusinya adalah tanda kutip, setiap kali:

```
background-image: url("data:image/svg+xml,%3Csvg ... %3E");
```

Itu juga sebabnya sebuah pengode tidak perlu melepaskan spasinya — mereka sepenuhnya sah di dalam URL yang berkutip, dan melepaskan masing-masing sebagai `%20` akan berbiaya tiga karakter untuk setiap spasi di file-nya. Kedua keputusannya berjalan bersama: beri tanda kutip pada URI-nya, dan Anda bisa membiarkan spasinya. Setiap bentuk yang dihasilkan alatnya diberi tanda kutip persis karena alasan ini.

## Jenis medianya harus benar

Sebuah data URI menyatakan jenisnya sendiri, dan perambannya menerimanya apa adanya. Tidak ada pengendusan cadangan seperti yang ada untuk file yang diambil: katakan `image/png` tentang sesuatu yang sebenarnya JPEG dan gambarnya tidak tergambar, tanpa pesan di mana pun yang berguna.

Dan itu penting karena ekstensi file berbohong. Foto yang diekspor sebagai JPEG lalu dinamai ulang `logo.png` adalah hal biasa yang ditemukan di sebuah disk. Beberapa byte pertama sebuah file gambar, di sisi lain, mengatakan ia apa tanpa ambiguitas — setiap format punya sebuah tanda tangan — jadi sebuah alat sebaiknya membaca file-nya alih-alih namanya. Yang di sini melakukannya, dan memberi tahu Anda ketika keduanya tidak sepakat.

Dua format layak diketahui karena mereka gagal dengan cara yang membingungkan. **HEIC**, yang menjadi format pemotretan iPhone, dan **TIFF**, yang dihasilkan pemindai, keduanya membuat data URI yang sepenuhnya sah yang tidak akan digambar peramban mana pun selain Safari. URI-nya tidak rusak; formatnya sekadar bukan format yang didukung web. Ubah dulu.

## Metadata yang tidak Anda maksudkan untuk diterbitkan

Data URI adalah salinan file-nya, byte demi byte. Tidak ada yang didekodekan dan dikodekan ulang, dan biasanya itulah intinya — tidak ada kualitas yang hilang — tapi ia juga berarti semua yang lain di file-nya ikut serta.

Foto yang langsung dari sebuah ponsel membawa EXIF: koordinat GPS tempat ia diambil, cap waktunya, model kameranya, dan sering nomor serinya. Itu bisa 30 KB dari file-nya. Kalau disisipkan, ia menjadi 40 KB base64 di lembar gaya Anda, di jalur kritis setiap halaman — dan sebuah alamat rumah yang tersimpan di sebuah repositori, dalam bentuk yang tidak akan pernah terpikir siapa pun untuk dilihat.

Bersihkan lebih dulu dengan [Penampil & Penghapus EXIF](https://abox.tools/id/hapus-data-exif/), yang menulis ulang wadahnya tanpa menyentuh gambarnya; ada [panduannya](https://abox.tools/id/panduan/hapus-data-exif-dan-gps/) juga. Gambar ke Data URI membaca berapa banyak metadata yang ada di sebuah JPEG, PNG, atau WebP lalu mengatakannya sebelum Anda menyalin apa pun.

## Di mana menaruhnya, setelah Anda punya

Kalau gambarnya muncul di satu aturan, taruh URI-nya di aturan itu. Kalau ia muncul di lebih dari satu — dan ikon biasanya begitu, begitu Anda menghitung keadaan tunjuk dan tema gelapnya — nyatakan sekali sebagai sebuah properti khusus:

```
:root {
  --icon-search: url("data:image/svg+xml,%3Csvg ... %3E");
}

.search-field { background-image: var(--icon-search); }
.search-button::before { content: var(--icon-search); }
```

URI 3 KB yang ditempelkan ke empat aturan adalah 12 KB lembar gaya dan empat tempat untuk disunting ketika ikonnya berubah. Properti khususnya adalah satu dari masing-masing. Ia juga bentuk yang membuat penemaan bekerja: definisikan ulang `--icon-search` di dalam sebuah kueri media dan setiap pemakaiannya mengikuti.

Untuk sebuah tag `<img>` alih-alih CSS, sertakan `width` dan `height`. Gambar yang disisipkan dimuat seketika, jadi ukuran yang hilang adalah pergeseran tata letak yang terjadi terlalu cepat untuk dilihat dan tetap dihitung merugikan Anda. Pengecualiannya adalah SVG: yang hanya membawa sebuah `viewBox` tidak punya ukuran piksel miliknya sendiri, dan menuliskan bawaan ⁦300×150⁩ peramban ke tagnya memaku sebuah gambar yang bisa diskalakan pada ukuran yang tidak dipilih siapa pun.

Biarkan `alt`-nya kosong kecuali Anda punya sesuatu yang benar untuk ditaruh di dalamnya. Hanya Anda yang tahu apakah gambarnya membawa makna atau sekadar hiasan, dan keterangan yang ditebak dari sebuah nama file lebih buruk bagi orang yang memakai pembaca layar daripada tidak ada keterangan sama sekali.

![Kartu bentuk: tombol yang memilih keluarannya, aturan latar CSS, elemen img, atau URI polos, dan sakelar antara base64 dan SVG apa adanya.](https://abox.tools/screens/embed-an-image-in-css/shape.webp)

Ke mana ia akan pergi menentukan apa yang keluar, jadi itu ditanyakan lebih dulu alih-alih ditinggalkan sebagai latihan salin tempel.

## Ketika jawabannya “jangan”

Kalau gambarnya lebih dari sekitar 50 KB setelah dikodekan, penyisipan adalah alat yang keliru dan kecermatan sebanyak apa pun pada pengodeannya tidak membereskannya. Alternatifnya, dalam urutan yang layak dicoba:

- **Kecilkan.** Kebanyakan gambar yang terlalu besar untuk disisipkan memang terlalu besar secara umum. [Kompresor Gambar](https://abox.tools/id/kompres-gambar/) akan membawa sebuah foto ke ukuran yang Anda sebutkan, dan [Pengubah Ukuran Gambar](https://abox.tools/id/ubah-ukuran-gambar/) akan memotong dimensi pikselnya turun ke yang sebenarnya dipakai tata letaknya — dan itu sangat sering masalah yang sesungguhnya.
- **Gambar ulang sebagai SVG.** Ikon yang diekspor sebagai PNG 40 KB sering kali adalah SVG 900 byte. Itu bukan perbedaan kompresi, itu perbedaan format, dan ia juga menyelesaikan masalah retinanya.
- **Biarkan sebagai sebuah file lalu pramuat.** `<link rel="preload" as="image">` memulai pengambilannya segera tanpa memindahkan byte-nya ke jalur kritis. Ia mendapat sebagian besar manfaat penyisipan dan tidak satu pun ongkos penyinggahannya.

## Tidak satu pun dari ini butuh unggahan

Mengodekan sebuah file sebagai base64 adalah hitungan. Ia dua fungsi yang sudah dipunyai peramban sejak awal — `btoa` dan `encodeURIComponent` — dan sama sekali tidak ada alasan teknis bagi sebuah gambar untuk bepergian ke sebuah server dan kembali supaya ia ditulis dengan cara yang berbeda. Pengubah mana pun yang mengunggah file Anda untuk melakukan ini sedang mengunggahnya demi alasannya sendiri, bukan demi alasan Anda.

[Alat di sini](https://abox.tools/id/gambar-ke-base64/) tidak mengirimnya ke mana pun: `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Muat halamannya, cabut koneksi internet, lalu kodekan sesuatu kalau Anda lebih suka memeriksa daripada diberi tahu. [Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain yang bisa Anda jalankan pada alat mana pun.
