# Cara memformat JSON tanpa menyerahkannya kepada siapa pun

Memformat JSON seharusnya mengubah spasinya dan tidak lebih. Kebanyakan alat yang menawarkan melakukannya mengubah lebih dari itu, dan tidak satu pun menyebutkannya. Inilah apa yang harus diwaspadai, cara membaca galatnya ketika file-nya tidak mau terbaca, dan kenapa kotak tempat Anda menempelkan sebuah file konfigurasi layak dipikirkan.

[Buka Pemformat JSON](https://abox.tools/id/format-json/): JSON, XML, HTML, CSS, dan YAML, diformat atau diubah. Tidak ada yang ditempelkan ke server orang lain.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Teks & Kode](https://abox.tools/id/format-json/), tempelkan JSON-nya ke kotaknya, lalu baca. Penataannya terjadi sambil Anda mengetik, bahasanya diperhitungkan dari teksnya, dan indentasinya dua spasi kecuali Anda mengatakan lain. Tidak ada yang diunggah, karena tidak ada tujuan ke mana pun baginya: pembacanya beberapa ratus baris JavaScript yang berjalan di tab yang sudah Anda buka.

Semua di bawah ini adalah bagian yang layak diketahui sebelum Anda menempelkan sebuah file konfigurasi ke alternatif mana pun: apa yang boleh diubah sebuah pemformat, apa yang tetap diubah kebanyakan dari mereka, dan cara membaca galatnya ketika file-nya sama sekali tidak mau terbaca.

![Dua panel: satu baris JSON di kiri, dokumen yang sama diformat dengan indentasi dua spasi di kanan.](https://abox.tools/screens/format-json-without-uploading-it/panes.webp)

Satu baris masuk, sesuatu yang terbaca keluar. Untuk itu tidak ada apa pun yang dikirim ke mana pun.

## Apa itu memformat, dan apa yang bukan

JSON nyaris tidak punya sintaks. Sebuah objek, sebuah larik, sebuah teks, sebuah angka, dan ketiga kata `true`, `false`, serta `null`. Di antara potongan-potongan itu, spasi tidak berarti apa-apa: file

```
{"name":"thing","tags":["local","offline"]}
```

dan file

```
{
  "name": "thing",
  "tags": [
    "local",
    "offline"
  ]
}
```

adalah dokumen yang sama. Memformat adalah urusan berpindah dari yang pertama ke yang kedua, dan *itulah seluruh pekerjaannya*. Apa pun lain yang dilakukan sebuah pemformat pada file Anda — menyusun ulang, membulatkan, membuang — adalah perubahan pada apa yang dikatakan dokumennya, dibuat tanpa diminta.

Tiga dari perubahan itu cukup umum sehingga layak disebutkan, karena mereka diam-diam dan karena itulah yang dilakukan secara bawaan oleh sebuah pemformat yang ditulis dalam satu sore.

## Tiga hal yang tidak boleh diubah sebuah pemformat

### Urutan kunci Anda

Inilah yang menjebak orang. Cara gamblang menulis pemformat JSON dalam JavaScript adalah memanggil `JSON.parse` lalu `JSON.stringify` dengan sebuah indentasi, dan pasangan itu tidak menjaga urutan kunci yang tampak seperti bilangan bulat:

```
Object.keys(JSON.parse('{"10":"a","2":"b","x":"c"}'))
// ['2', '10', 'x']
```

Itu bukan bug di kode siapa pun. Objek JavaScript memang dispesifikasikan untuk menaruh kunci yang mirip bilangan bulat lebih dulu, dalam urutan numerik menaik, dan setiap nilai yang melewati `JSON.parse` menjadi sebuah objek JavaScript. Pemformat yang dibangun begitu akan menyusun ulang file yang berkunci id, nomor porta, tahun, atau kode status HTTP, dan akan melakukannya tanpa sepatah kata pun.

Apakah itu penting tergantung file-nya. Objek JSON pada prinsipnya tidak berurutan, jadi secara teknis tidak ada yang rusak — tapi diff-nya terhadap versi di repositori Anda akan luar biasa besar, tinjauannya tidak akan terbaca, dan kalau ada apa pun di hilir yang membaca file-nya secara berurutan, perilakunya berubah.

### Digit angka Anda

JSON tidak mengatakan seberapa besar sebuah angka boleh, dan JavaScript mengatakannya: setiap angka adalah sebuah double. Jadi pemformat yang membaca menjadi sebuah double lalu mencetaknya kembali kehilangan apa pun yang tidak bisa ditampung sebuah double.

```
JSON.stringify(JSON.parse('{"id":123456789012345678901}'))
// {"id":123456789012345680000}

JSON.stringify(JSON.parse('{"size":1e999}'))
// {"size":null}
```

Sebuah id dua puluh satu digit — id Twitter, id Snowflake, sebuah nomor rujukan bank — kembali sebagai angka yang berbeda, dan nilai yang terlalu besar untuk sebuah double kembali sebagai `null`. Kedua file-nya tetap terbaca, dan tidak satu pun adalah file yang Anda mulai.

Jalan keluarnya adalah sama sekali tidak membaca angkanya. Pemformat hanya perlu tahu di mana sebuah angka mulai dan berakhir untuk menata dokumennya; ia tidak pernah butuh nilainya, jadi hal yang aman adalah menyalin digitnya persis seperti mereka ditulis. Itulah yang dilakukan alat di sini.

### Kunci ganda Anda

`{"a": 1, "a": 2}` adalah JSON yang sah, dan standarnya menolak mengatakan mana dari keduanya yang menang. Pembaca berbeda-beda pada praktiknya: kebanyakan menyimpan yang terakhir, sebagian menyimpan yang pertama, beberapa menolak dokumennya. Pemformat yang diam-diam mengeluarkan salah satunya sudah membuat keputusan itu untuk Anda, dan sudah menyembunyikan fakta yang jauh lebih berguna bahwa tadinya ada dua — dan itu hampir selalu sebuah kekeliruan di file-nya, dan kekeliruan yang ingin Anda lihat.

## Ketika file-nya tidak mau terbaca

Kebanyakan JSON yang gagal tidak aneh-aneh. Ia salah satu dari sekitar enam hal, dan galatnya memberi tahu Anda yang mana kalau ia mengatakan di mana letaknya dalam istilah yang bisa Anda temukan. Sebuah offset seperti `position 4193` bukan itu; sebuah baris dan kolom baru itu.

- **Koma di ujung.** `{"a": 1,}` sah di JavaScript dan tidak di JSON. Penyebab tunggal yang paling umum, biasanya ditinggalkan setelah menghapus entri terakhir sebuah daftar.
- **Tanda kutip tunggal.** `{'a': 1}` adalah literal objek JavaScript, bukan JSON. Teks dan kuncinya sama-sama berkutip ganda, dan kuncinya selalu berkutip.
- **Kunci tanpa kutip.** `{a: 1}`, kekeliruan yang sama dari arah sebaliknya — biasanya dari menempelkan sesuatu dari kode alih-alih dari sebuah file.
- **Komentar.** `// seperti ini` juga bukan JSON. Itu JSONC, yang dipakai setelan VS Code dan `tsconfig.json`, dan ia tidak akan terbaca di tempat lain mana pun. Kalau sebuah komentar harus selamat, kelazimannya adalah sebuah kunci: `"_comment": "..."`.
- **Baris baru atau tab sungguhan di dalam sebuah teks.** Mereka harus ditulis sebagai `\n` dan `\t`. Inilah yang biasanya keliru ketika sebuah perintah shell atau sebuah sertifikat ditempelkan ke sebuah nilai dengan tangan.
- **Angka yang tidak diizinkan JSON.** Nol di depan (`01`), titik desimal telanjang (`.5`), `NaN`, `Infinity`, dan `+1` semuanya hal yang ditulis orang dan tidak satu pun adalah JSON.

Satu yang bukan galat tapi tampak seperti galat: file yang mulai dengan sebuah byte-order mark. Ia tak terlihat di kebanyakan penyunting, ia bukan spasi, dan ia membuat karakter pertama dokumennya menjadi tak terduga. Kalau galatnya di baris 1, kolom 1 pada file yang tampak sempurna, itulah yang terjadi.

![Alat yang sama dengan dokumen rusak: pesan galat yang menyebut baris dan kolom sebuah koma berlebih, dan panel masukan yang menampilkan baris tersangkanya.](https://abox.tools/screens/format-json-without-uploading-it/error.webp)

Kalau tidak terbaca, pesannya menyebut di mana. Koma berlebih adalah penyebab paling umum dan yang paling sulit dilihat dengan mata.

## Memampatkan, dan betapa sedikit biasanya yang didapat

Memeras spasinya keluar adalah operasi yang sama secara terbalik, dan layak bersikap realistis tentang apa yang didapat darinya. Spasi sangat berulang, dan setiap server dan peramban di antara Anda dan seorang pembaca sudah mengompres tanggapannya dengan gzip atau Brotli, yang sangat pandai justru pada pengulangan semacam itu.

Jadi JSON yang dimampatkan sering tiga puluh persen lebih kecil sebagai sebuah file dan hanya beberapa persen lebih kecil di sepanjang kabel. Tempat ia memang mendapatkan nafkahnya adalah tempat yang tidak ada kompresi di depannya: sebuah nilai di kolom basis data, sebuah kolom di baris log, sebuah muatan di dalam kode QR, atau sebuah dokumen yang hendak Anda Base64-kan ke dalam sebuah header.

Yang dikorbankannya adalah keterbacaan, dan kalau file-nya disimpan di sebuah repositori ia juga mengorbankan diff Anda — file satu baris berubah seluruhnya kapan pun apa pun di dalamnya berubah. Mampatkan di jalan keluar dari penyunting Anda, bukan di jalan masuknya.

## Mengurutkan kuncinya, dan kapan jangan

Mengurutkan kunci setiap objek ditawarkan di sini sebagai pilihan alih-alih diterapkan secara bawaan, karena ia perubahan yang nyata pada file-nya dan nilainya sepenuhnya tergantung pada apa yang hendak Anda lakukan.

Ia membantu ketika Anda membandingkan dua dokumen yang seharusnya mengatakan hal yang sama — konfigurasi dua lingkungan, sebuah tanggapan API sebelum dan sesudah sebuah perubahan — dan salah satunya mendaftar kuncinya dalam urutan yang berbeda. Mengurutkan keduanya lebih dulu mengubah diff atas segalanya menjadi diff atas dua baris yang memang berbeda.

Ia merugikan ketika urutannya sedang melakukan sesuatu. Sebuah `package.json` punya kelaziman soal apa yang datang lebih dulu; konfigurasi yang ditulis tangan sering mengelompokkan setelan yang berhubungan; dan file yang kuncinya diurutkan sebuah alat lalu disimpan menghasilkan satu commit yang sangat besar dan tanpa makna. Urutkan sebuah salinan, bukan aslinya.

Satu detail yang layak diketahui: pengurutan di sini menurut cara kuncinya terbaca alih-alih menurut titik kodenya, jadi `item2` datang sebelum `item10` alih-alih sesudahnya. Mengurutkan menurut titik kode itulah yang menaruh `item10` di tengah-tengah angka satuan, dan itu secara teknis benar dan tidak berguna bagi seorang pembaca.

## Membandingkan dua file JSON

Cara yang bisa diandalkan adalah memformat keduanya dengan cara yang sama lebih dulu. Dua dokumen yang mengatakan hal yang sama bisa berbeda di setiap barisnya kalau yang satu dimampatkan dan yang lain tidak, dan tidak ada diff yang bisa melihat menembus itu.

Jadi: format yang pertama, format yang kedua, lalu bandingkan kedua hasilnya. Ketiga langkahnya ada di halaman yang sama di sini — tab *Bandingkan* berbagi kotaknya dengan *Format* persis karena alasan ini. Kalau keduanya juga mendaftar kuncinya dalam urutan yang berbeda, urutkan keduanya sambil Anda memformatnya dan perbandingannya mengerucut ke perbedaan yang Anda cari.

## Bagian yang tidak ditaruh siapa pun di halamannya

Cari sebuah pemformat JSON dan Anda akan menemukan puluhan situs dengan sebuah kotak di atasnya. Menempelkan ke kotak itu adalah sebuah unggahan. Apa pun yang ada di papan klip Anda — sebuah tanggapan API yang ada alamat seorang pelanggan di dalamnya, sebuah file konfigurasi dengan sebuah connection string, sebuah token yang sedang Anda awakutu — sudah dikirim ke sebuah mesin yang tidak Anda kendalikan, dan ia kini file log mereka, laporan galat mereka, dan cadangan mereka.

Ini bukan andai-andai tentang niat jahat. Situs yang sangat berniat baik pun tetap menyimpan log akses, tetap menjalankan analitik, dan tetap punya penyedia hosting. Data yang paling aman adalah data yang tidak pernah pergi, dan untuk pekerjaan yang seluruhnya berupa manipulasi teks sama sekali tidak ada alasan baginya untuk pergi.

Dua pemeriksaan, dan keduanya bekerja pada situs mana pun yang membuat klaim ini, bukan hanya yang ini:

1. **Buka DevTools, perhatikan tab Network, lalu format sesuatu.** Kalau teks Anda sedang dikirim, ada sebuah permintaan yang membawanya. Tidak ada hal lain yang bisa benar pada saat yang sama.
2. **Putuskan koneksi internet lalu coba lagi.** Alat yang mengerjakan pekerjaannya di peramban Anda tidak terpengaruh. Alat yang mengirim teks Anda ke suatu tempat berhenti bekerja, seketika dan sepenuhnya.

Ada versi yang lebih panjang dari keduanya, dengan dua pemeriksaan lagi, di [amankah mengunggah file](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/).

## Bagaimana dengan YAML, XML, dan sisanya

Halaman yang sama membaca XML, HTML, CSS, dan YAML, serta mengubah antara JSON dan yang pertama serta yang terakhir dari mereka. Dua hal layak dibawa dari atas, karena mereka argumen yang sama dalam jas yang berbeda:

- **Mengubah YAML menjadi JSON kehilangan komentarnya**, karena JSON tidak punya tempat menaruh satu pun. Anchor dan alias — cara YAML mengatakan “simpul yang sama dua kali” — juga tidak bisa diungkapkan, dan ditolak di sini alih-alih ditebak-tebak.
- **`no` adalah sebuah teks.** Di YAML 1.1, `yes`, `no`, `on`, dan `off` adalah boolean, dan itulah sebabnya daftar kode negara yang memuat Norwegia dulu kembali dengan `false` di dalamnya. YAML 1.2 membuang itu dan begitu juga yang ini — tapi kata-kata itu tetap ditulis kembali dalam tanda kutip, karena apa pun yang membuka file-nya berikutnya bisa jadi pembaca 1.1.
