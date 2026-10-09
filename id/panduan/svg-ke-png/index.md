# Cara mengubah SVG menjadi PNG pada ukuran yang tepat

Mengubahnya adalah separuh yang mudah. Pertanyaan yang menentukan apakah hasilnya berguna adalah pertanyaan yang jawabannya tidak diberikan siapa pun kepada Anda: berapa piksel? Inilah dari mana angka itu datang, dan apa yang hilang dari sebuah gambar dalam perjalanannya menjadi piksel.

[Buka SVG ke Gambar](https://abox.tools/id/svg-ke-png/): Sebutkan ukurannya. Sebuah vektor tidak punya ukuran sendiri untuk hilang.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [SVG ke Gambar](https://abox.tools/id/svg-ke-png/), jatuhkan file-nya, lalu sebutkan sebuah ukuran. Kalau tidak ada yang memberi tahu Anda ukuran apa yang dipakai, **1024 piksel di sisi terpanjang** adalah bawaan yang baik: cukup besar untuk hampir apa saja dan cukup kecil untuk dikirim lewat surel. Biarkan formatnya di PNG, biarkan latarnya transparan, lalu ambil file-nya.

Semua di bawah ini adalah apa yang dilakukan ketika bawaan itu tidak cukup baik — ketika sebuah angka sudah ditetapkan untuk Anda, ketika ia akan dicetak, atau ketika ia kembali tampak keliru.

![Kartu pratinjau: gambar yang digambar pada ukuran yang diminta, dengan ukuran pikselnya di bawah.](https://abox.tools/screens/convert-an-svg-to-png/preview.webp)

Alat ini menggambarnya sebelum menyimpannya, dan pada ukuran saat ia akan disimpan. Apa pun yang salah pada ekspor tampak di sini lebih dahulu.

## Kenapa ukurannya keputusan Anda dan bukan keputusan file-nya

Sebuah JPEG adalah kisi piksel terukur; menanyakan seberapa besar dia punya jawaban. Sebuah SVG sama sekali bukan sebuah gambar, ia sekumpulan instruksi — gambar lingkaran di sini, jalur ini dalam warna itu — dan instruksi tidak punya ukuran. Sebuah peramban bisa melaksanakannya pada 16 piksel atau pada 4000 dan hasilnya sama tajamnya bagaimanapun juga, karena ia tidak sedang menskalakan apa pun. Ia sedang menggambar lagi.

Itulah sebabnya pengubahannya tidak bisa memilih sebuah angka untuk Anda, dan sebabnya memilih yang besar tidak mengorbankan apa pun. Inilah satu-satunya pekerjaan gambar yang “buat lebih besar”-nya gratis.

Kebanyakan file SVG memang membawa atribut `width` dan `height`, dan sebuah alat akan menampilkannya — tapi itu sebuah bawaan, bukan sebuah batas. Ikon yang berkata `width="24"` hanya berkata bahwa orang yang menggambarnya punya bilah alat 24 piksel dalam pikirannya.

## Dari mana sebenarnya angkanya datang

**Untuk sebuah situs web.** Ambil ukuran yang ditempati gambarnya di halamannya dalam piksel CSS lalu kalikan dengan kepadatan piksel layar yang Anda pedulikan. Sebuah logo di slot selebar 200 piksel butuh file 400 piksel untuk laptop Retina dan 600 untuk ponsel keluaran baru. Itulah seluruh yang dimaksud `@2x` dan `@3x`, dan itulah sebabnya alat yang menuliskannya menghemat Anda mengerjakan hitungannya tiga kali.

**Untuk ikon aplikasi, iklan toko, atau favicon.** Angkanya diterbitkan dan tidak ada yang perlu diperhitungkan: apa pun yang dikatakan halaman tokonya, persis. Untuk sebuah favicon, jangan diraster sama sekali — [buat sebuah .ico](https://abox.tools/id/panduan/buat-favicon/), yang menyimpan beberapa ukuran dalam satu file, karena tab peramban, sebuah markah, dan pintasan Windows semuanya meminta ukuran yang berbeda.

**Untuk cetak.** Kalikan ukuran fisiknya dalam inci dengan resolusi pencetaknya. Sebuah logo yang akan masuk ke kartu nama selebar dua inci pada 300 DPI adalah 600 piksel; logo yang sama melintasi halaman A4, pada 8,3 inci, adalah sekitar 2500. Percetakan meminta 300 DPI sebagai kelaziman, dan untuk spanduk format besar yang dilihat dari seberang ruangan 150 sudah lebih dari cukup.

**Untuk pratinjau sosial atau gambar OG.** Lapaknya menyebutkan sebuah kotak — ⁦1200 × 630⁩ untuk kebanyakan pratinjau tautan — dan kotaknya berbeda bentuk dari logo Anda. Untuk itulah setelan “isi sisanya” ada: gambarnya diletakkan di tengah pada proporsinya sendiri, dengan sebuah warna latar mengisi sisanya, alih-alih logo yang teregang yang memberi tahu semua orang bahwa Anda tidak memeriksanya.

Ketika dua di antaranya berlaku, pakai yang lebih besar. PNG yang lebih besar daripada yang dibutuhkannya adalah unduhan yang sedikit lebih besar; yang terlalu kecil tidak bisa dibetulkan belakangan, karena alasan di bagian berikutnya.

![Kartu ukuran: menu berisi cara-cara menyebut ukuran, disetel ke lebar, dengan 1024 diisikan dan lebar siap pakai di sebelahnya.](https://abox.tools/screens/convert-an-svg-to-png/size.webp)

Lima cara mengatakan hal yang sama. Mana yang tepat bergantung pada apakah Anda diberi sebuah angka atau sebuah tempat untuk menaruhnya.

## Anda tidak bisa kembali

Perasteran itu satu arah. Begitu gambarnya menjadi sebuah PNG, ia piksel seperti gambar lain mana pun, dan membesarkannya sesudahnya harus mengarang detail yang tidak pernah terukur — hasil lembek dan tercoreng yang sama seperti yang Anda dapat dari membesarkan sebuah foto.

Jadi simpan SVG-nya. Ia salinan induknya, ia hampir selalu file yang lebih kecil, dan setiap ukuran di masa depan keluar darinya dengan sempurna. PNG-nya adalah sebuah ekspor untuk satu pemakaian tertentu, dan ketika Anda butuh ukuran lain, langkah yang benar adalah mengekspor lagi alih-alih mengubah ukuran yang sudah Anda ekspor.

Ada perangkat lunak yang mengaku mengubah sebuah PNG kembali menjadi SVG. Yang dilakukannya adalah menjiplak: menebak kurva mana yang mungkin menjelaskan sebuah kisi piksel. Ia bekerja lumayan pada karya seni datar dua warna dan menghasilkan omong kosong yang mahal pada apa pun yang lain, dan ia tidak pernah memulihkan apa yang dimiliki gambar aslinya.

## Tiga hal berubah begitu ia menjadi piksel

SVG yang dirasterkan yang tampak keliru hampir selalu tampak keliru karena salah satu dari tiga hal ini, dan ketiganya layak diketahui sebelum Anda mengekspor alih-alih sesudahnya.

**Teks digambar dengan fon apa pun yang dimiliki mesinnya.** SVG yang memuat teks tidak memuat fonnya — ia menyebut satu lalu membiarkan perendernya mencarinya. Kalau fonnya tidak terpasang, sebuah pengganti dipakai, dan penggantinya punya bentuk huruf yang berbeda dan lebar yang berbeda, jadi teksnya bisa tertata ulang atau meluber. File yang menarik fonnya dari sebuah alamat web bernasib lebih buruk lagi: SVG yang dirasterkan lewat sebuah `<img>` sama sekali tidak diizinkan mengambil apa pun, jadi tidak ada yang tiba.

Solusinya adalah yang sudah diketahui setiap perancang: **ubah teks menjadi outline** sebelum mengekspor SVG-nya (Illustrator menyebutnya Create Outlines, Figma menyebutnya Flatten, Inkscape menyebutnya Object to Path). Hurufnya menjadi geometri, fonnya berhenti jadi soal, dan gambarnya tampak sama di setiap mesin. Kerjakan pada salinan — teks yang sudah di-outline tidak lagi bisa disunting sebagai teks.

**Garis rambut menjadi abu-abu atau lenyap.** Goresan yang terhitung kurang dari satu piksel pada ukuran pilihan Anda tidak bisa digambar sebagai garis padat, jadi ia digambar sebagai garis samar. Inilah sebabnya logo yang halus yang dirasterkan pada 64 piksel tampak pucat sementara file yang sama pada 512 tampak sempurna. Kalau ukuran kecil memang syaratnya, jawabannya adalah gambar yang disederhanakan dengan goresan yang lebih tebal alih-alih setelan ekspor yang berbeda — dan itu alasan yang sama kenapa sebuah favicon berupa lambang dan bukan logo kata.

**Animasi berhenti.** SVG beranimasi terraster menjadi satu gambar diam: bingkai pertamanya, apa pun itu. Tidak ada setelan ekspor yang mengubah ini. Kalau Anda butuh gerakannya, Anda butuh sebuah GIF atau video, dibuat dengan cara yang berbeda.

## Transparansi, dan format mana yang dipilih

**PNG** kecuali Anda punya alasan. Ia tanpa kehilangan, ia menyimpan transparansi, dan warna datar dengan tepi keras — dan itulah sebagian besar penyusun sebuah gambar vektor — terkompres dengan baik di dalamnya. Logo yang dirasterkan biasanya berupa PNG yang *lebih kecil* daripada kalau ia JPEG, sekaligus lebih bersih.

**JPEG** sama sekali tidak punya transparansi. Setiap piksel transparan harus menjadi suatu warna, dan kalau tidak ada yang memilihkan satu untuk Anda ia menjadi hitam — dan dari situlah hasil logo-di-kotak-hitam yang dikira orang sebuah bug berasal. Ia juga merugikan dengan cara yang paling kelihatan justru pada jenis gambar ini: sebuah lingkaran bintik-bintik di sekeliling setiap tepi keras. Pakai ketika ada yang bersikeras memintanya.

**WebP** melakukan semua yang dilakukan PNG, dalam file yang lebih kecil, dan dibaca setiap peramban masa kini. Alasan untuk tidak memakainya adalah apa yang terjadi setelah perambannya: perangkat lunak yang lebih tua, sebagian percetakan, dan cukup banyak formulir unggahan masih tidak mau membukanya.

Memilih warna latar dengan PNG juga hal yang sangat biasa untuk diinginkan. Transparansi hanya berguna ketika apa pun tempat gambarnya mendarat berwarna yang tidak bisa Anda ramalkan; ketika Anda sudah tahu ia sebuah halaman putih, meratakannya ke putih menghindari satu kategori kejutan yang utuh.

## Ketika ekspornya keluar kosong atau keliru

**Tidak ada apa-apa selain ruang kosong.** Biasanya atribut `xmlns` yang hilang di elemen akarnya. File tanpa itu bukanlah SVG sejauh yang dipahami sebuah tag gambar, dan ia tergambar sebagai ketiadaan. Membuka file-nya di sebuah peramban adalah uji cepatnya: kalau perambannya juga tidak menampilkan apa-apa, file-nyalah masalahnya alih-alih pengubahnya.

**Gambarnya kecil, di sudut kiri atas.** File-nya punya `width` dan `height` tapi tidak punya `viewBox`, jadi tidak ada sistem koordinat untuk diskalakan dan karya seninya mempertahankan satuan aslinya di atas kanvas yang lebih besar. Pengubah yang baik memasukkan sebuah viewBox untuk Anda; kalau punya Anda belum, menambahkan `viewBox="0 0 *lebar* *tinggi*"` ke elemen akarnya dengan tangan membereskannya, dan file-nya teks biasa jadi Anda bisa.

**Sebagian gambarnya hilang.** Sesuatu di dalam file-nya menunjuk ke sebuah alamat alih-alih memuat karya seninya — sebuah foto tersemat yang disimpan sebagai tautan, sebuah lembar gaya, sebuah fon. Peraster yang menolak mengambilnya sedang melakukan hal yang benar, dan itu penolakan yang sama yang mencegah SVG yang Anda unduh dari suatu tempat melapor balik ke siapa pun yang membuatnya. Ekspor ulang dari program gambarnya dengan gambar-gambarnya disematkan.

**Ia menolak ukuran yang sangat besar.** Peramban membatasi seberapa besar sebuah kanvas boleh, dan mereka tidak sepakat soal di mana: lewat sekitar 16.000 piksel di satu sisi tidak ada yang kembali, dan Safari di sebuah iPhone atau iPad menyerah jauh lebih awal, di sekitar ⁦4096 × 4096⁩. Alat yang memperingatkan Anda sedang menyelamatkan Anda dari file yang kosong, karena itulah yang dihasilkan sebuah peramban ketika ia kehabisan alih-alih sebuah pesan galat.

## Tidak satu pun dari ini butuh unggahan

Merasterkan sebuah SVG adalah sesuatu yang dilakukan setiap peramban ribuan kali sehari — ia mesin yang sama yang menggambar sebuah ikon di halaman web. Tidak ada alasan teknis bagi karya seni Anda untuk bepergian ke sebuah server dan kembali supaya ia keluar sebagai PNG, dan alat di sini tidak mengirimnya ke mana pun: `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

Itu lebih penting daripada biasanya dengan SVG, karena sebuah SVG adalah sebuah dokumen alih-alih sebuah gambar. Ia bisa memuat sebuah skrip dan sebuah alamat jauh, dan logo yang dikirimkan sebuah agensi kepada Anda adalah file yang tidak Anda tulis. Digambar lewat sebuah tag gambar, ia berada dalam apa yang disebut spesifikasinya sebagai *secure static mode*: skripnya tidak bisa berjalan dan alamatnya tidak pernah dihubungi. Perambannya yang menegakkan itu, bukan situs webnya.

Muat halamannya, cabut koneksi internet, lalu ubah sesuatu kalau Anda lebih suka memeriksa daripada diberi tahu. [Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain yang bisa Anda jalankan pada alat mana pun.
