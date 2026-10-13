# Cara memperkecil ukuran PDF, dan kenapa sebagian tidak mau menyusut

PDF yang tidak muat di batas email hampir selalu PDF yang penuh gambar. Ini menjelaskan cara mengetahui apakah punya Anda begitu, berapa harga mengompresnya, dan kenapa alat mana pun yang menjanjikan persentase tetap belum melihat file Anda.

[Buka Kompresor PDF](https://abox.tools/id/kompres-pdf/): Perkecil sebuah dokumen tanpa mengirimnya ke mana pun.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Kompresor PDF](https://abox.tools/id/kompres-pdf/), jatuhkan dokumennya, lalu lihat apa yang dikatakannya kepada Anda sebelum Anda mengubah apa pun. Ia membaca file-nya lalu menunjukkan di mana sebenarnya ukurannya berada — gambar, fon, teks dan gambar vektor, serta apa pun yang tidak lagi dirujuk apa pun di dokumennya. Satu layar itu biasanya sudah menjawab pertanyaannya.

Kalau sebagian besar ukurannya adalah gambar, Anda bisa mengharapkan penghematan besar. Kalau ia fon dan teks, tidak bisa, dan tidak ada alat yang bisa. Anda punya yang mana dari keduanya itulah seluruh ceritanya, dan ia layak sepuluh detik untuk dilihat.

## Di mana sebenarnya ukuran sebuah PDF berada

Sebuah PDF adalah wadah untuk beberapa jenis benda yang berbeda, dan mereka tidak terkompres dengan cara yang sama.

- **Gambar.** Foto dan pindaian. Hampir selalu bagian terbesar dari sebuah PDF yang besar, dan satu-satunya bagian yang punya ruang sungguhan di dalamnya.
- **Fon yang tersemat.** Sebuah fon utuh bisa ratusan kilobita; sebuah subset karakter yang benar-benar dipakai jauh lebih kecil. Bagaimanapun juga, mereka sudah dikompres oleh apa pun yang menghasilkan file-nya.
- **Teks dan gambar vektor.** Instruksi alih-alih piksel: gambar garis ini, taruh kata ini di sini. Sudah ringkas, dan sudah terkompres.
- **Objek yang tidak lagi ditunjuk apa pun.** PDF menumpuk ini. Menyunting sebuah dokumen sering menambahkan perubahannya alih-alih menulis ulang file-nya, jadi versi lama sebuah halaman bisa duduk di sana tanpa batas waktu. Mengemas ulang file-nya membuang mereka.

Jadi dua dokumen yang dibawa orang ke sebuah kompresor PDF punya prospek yang sama sekali berbeda. Dokumen hasil pindaian pada dasarnya setumpuk foto, dan biasanya keluar ⁦60–90⁩% lebih kecil. Sebuah kontrak, sebuah tesis, atau sebuah laporan hasil ekspor adalah teks, gambar vektor, dan fon — semuanya sudah dikompres oleh perangkat lunak yang menulisnya — dan penghematan di sana biasanya beberapa persen, dari pengemasan ulang dan pembuangan yang tidak dirujuk.

Alat mana pun yang menjanjikan “sampai 90% lebih kecil” tanpa melihat file Anda sedang mengutip kasus terbaik dari jenis yang pertama untuk jenis yang kedua.

![Kartu inventaris: putusan yang menyebut sebagian besar berkas berupa gambar, batang yang memecah ukurannya, dan daftar bobot tiap bagian.](https://abox.tools/screens/make-a-pdf-smaller/inventory.webp)

Di mana ukurannya sebenarnya berada, sebelum apa pun diubah. Hampir semua PDF besar menjadi besar karena alasan yang ditunjukkan batang ini.

## Apa hubungan DPI dengan ini

Sebuah PDF tidak sekadar menyimpan sebuah gambar; ia mencatat seberapa besar gambar itu digambar di halamannya. Itu memberi Anda sesuatu yang lebih berguna daripada jumlah piksel: resolusi efektifnya.

Pindaian selebar 4000 piksel yang ditaruh melintasi delapan inci kertas membawa 500 piksel per inci. Sebuah layar menampilkan sekitar 100. Pencetak kantor yang bagus bekerja pada 300 dan tidak bisa memakai lebih banyak. Semua di atas itu adalah detail yang tidak akan pernah ditampilkan apa pun di masa depan dokumennya — dan biasanya itulah sebagian besar file-nya.

Itulah sebabnya kompresor PDF yang masuk akal meminta sebuah DPI alih-alih persentase kualitas. Ia membuang piksel di atas angka Anda lebih dulu, karena piksel itu tidak mengorbankan apa pun yang bisa dilihat siapa pun, dan baru sesudah itu mulai membelanjakan kualitas yang sebenarnya.

Panduan kasarnya: **150 DPI** untuk dokumen yang akan dibaca di layar, **⁦200–300⁩** untuk sesuatu yang akan dicetak, **⁦72–100⁩** untuk draf yang tidak akan disimpan siapa pun. Mengukur terhadap seberapa besar gambarnya digambar juga itulah sebabnya sebuah logo yang ditaruh kecil tidak diperlakukan sama dengan pindaian sehalaman penuh — logonya sudah mendekati resolusi efektifnya dan tidak ada yang bisa diambil.

![Kartu pengaturan: prasetel, resolusi dalam DPI, penggeser kualitas, dan sakelar untuk membuang metadata, dengan perkiraan bobot hasilnya.](https://abox.tools/screens/make-a-pdf-smaller/settings.webp)

Dua kenop yang penting adalah resolusi dan kualitas. Apa yang masing-masing lakukan pada halaman teks dan pada halaman foto adalah pokok bagian ini.

## Apa yang boleh dan tidak boleh disentuh pengompresan

Gambarnya dikodekan ulang, jadi yang itu kehilangan sedikit. Tidak ada yang lain yang boleh disentuh sama sekali, dan layak memeriksa bahwa alat apa pun yang Anda pakai berpegang pada itu:

- **Teks tetap teks.** Bisa dipilih, bisa dicari, bisa disalin. Kompresor yang meratakan halamannya menjadi gambar akan menghasilkan file yang sangat kecil dan menghancurkan dokumennya — Anda tidak bisa mencarinya, pembaca layar tidak bisa membacanya, dan itu tidak akan pernah bisa diurungkan.
- **Fon tetap utuh.** Mengganti fon mengubah rupa dokumennya di mesin orang lain, dan itu satu hal yang justru menjadi alasan keberadaan PDF.
- **Gambar vektor disalin persis.** Ia sudah kecil, dan mengubahnya menjadi piksel akan membuatnya sekaligus lebih besar dan lebih buruk.
- **Formulir, tautan, markah, struktur aksesibilitas, dan lampiran ikut terbawa.** Semua itu gampang hilang dalam sebuah penulisan ulang dan jarang disadari sampai ada yang membutuhkan salah satunya.

Sebuah aturan terkait yang harus diikuti sebuah kompresor dan yang tidak diikuti banyak kompresor: kalau mengodekan ulang sebuah gambar ternyata tidak keluar lebih kecil daripada aslinya, kembalikan byte aslinya. Membuat sebuah gambar lebih buruk tanpa penghematan adalah kasus rugi murni, dan itu terjadi lebih sering daripada dugaan Anda pada gambar yang memang sudah terkompres dengan baik.

## Gambar yang tidak bisa dikompres

Sebagian gambar di dalam sebuah PDF dilewati, dan alat yang baik menyebutkannya alih-alih diam-diam meninggalkannya dari hitungannya:

- **Gambar JPEG 2000, JBIG2, dan berkode faks (CCITT).** Tidak ada peramban yang mengirimkan dekoder untuk satu pun dari mereka, jadi mereka dilewatkan tanpa disentuh. Dua yang terakhir bertingkat dua — hitam dan putih saja — dan biasanya sudah mendekati ukuran terkecilnya.
- **Gambar CMYK.** Dibiarkan dengan sengaja. Mengodekannya ulang berisiko menggeser warna yang akan dihasilkan sebuah pencetak, dan itu hal yang mengejutkan untuk dilakukan pada dokumen yang akan dicetak seseorang.

## Hal yang perlu dicoba sebelum mengompres

Kadang file-nya besar karena alasan yang jawabannya bukan pengompresan.

**Apakah ia dipindai padahal tidak perlu?** Dokumen yang dicetak lalu dipindai adalah setumpuk foto teks. Kalau aslinya masih ada di suatu tempat sebagai sebuah dokumen, mengekspornya ke PDF akan menghasilkan file sepersekian ukurannya yang juga bisa dicari.

**Apakah ia diekspor pada setelan cetak?** Pengolah kata dan perangkat lunak desain sering memakai ekspor kualitas cetak sebagai bawaannya. Mengekspor ulang untuk layar dari file sumbernya biasanya mengalahkan mengompres hasil ekspornya.

**Apakah ia harus satu file?** Batas email berlaku per pesan. Memisah dokumen 200 halaman menjadi bab-bab kadang solusi yang jujur.

## File terenkripsi, dan kenapa sebuah kompresor harus menolaknya

PDF yang dilindungi kata sandi ditolak alat di sini, dan itu disengaja alih-alih fitur yang hilang — termasuk ketika kata sandinya kosong, dan begitulah banyak pemindai dan mesin fotokopi menyimpan.

Melepas perlindungan sebuah dokumen adalah pekerjaan yang berbeda dari mengompresnya. Alat yang melakukannya diam-diam akan melakukan sesuatu yang tidak Anda minta, pada file yang sengaja dikunci seseorang, dan menyerahkan kembali kepada Anda salinan yang tidak lagi punya sifat yang mereka niatkan. Lepas perlindungannya sendiri lebih dulu, dengan sengaja, kalau memang itu yang Anda mau.

## Memeriksa hasilnya

Buka. Lihat gambarnya pada perbesaran penuh, periksa bahwa teksnya masih bisa dipilih, dan pastikan jumlah halamannya.

Alat di sini mengerjakan yang terakhir itu untuk Anda sebelum ia menawarkan file-nya: ia membuka lagi dokumen yang baru saja ditulisnya lalu menghitung halamannya, di mesin Anda sendiri. Ia juga menulis PDF 1.5, yang dipahami setiap pembaca yang dirilis sejak 2003, jadi “ia terbuka di mesin saya” adalah perkiraan yang masuk akal untuk “ia terbuka di mesin mereka”.

## Kenapa ini tidak butuh server

Mengompres sebuah PDF terdengar seperti pekerjaan server, dan sepanjang hampir seluruh usia web memang begitu. Yang sebenarnya dilibatkannya adalah membaca struktur file-nya, menemukan aliran gambarnya, mendekodekan dan mengodekan ulang yang itu dengan kodek yang sudah dibawa sebuah peramban, lalu menuliskan dokumennya kembali. Semua itu berjalan di sebuah peramban sekarang.

Dan itu lebih penting untuk jenis file ini daripada kebanyakan yang lain, karena apa yang dikompres orang: kontrak, surat medis, rekening koran, dokumen identitas, surat pemberitahuan pajak. Alat di sini sama sekali tidak punya fitur jaringan, dan `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Muat, cabut koneksi, lalu kompres sesuatu.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain seperti itu.
