# Apa yang dikatakan sebuah foto tentang Anda, dan bagaimana mengeluarkannya

Gambar yang langsung dari sebuah ponsel biasanya membawa koordinat tempat ia diambil, waktunya sampai ke detik, dan cukup banyak tentang kameranya untuk mengaitkannya dengan setiap foto lain dari perangkat yang sama. Tidak satu pun terlihat di layar. Inilah apa saja yang ada di dalamnya dan bagaimana membuangnya.

[Buka Penampil dan Penghapus EXIF](https://abox.tools/id/hapus-data-exif/): Lihat apa yang dikatakan sebuah foto tentang Anda. Lalu keluarkan.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Penampil & Penghapus EXIF](https://abox.tools/id/hapus-data-exif/), jatuhkan fotonya, lalu tekan “Hapus semua metadata”. Setiap tag, blok XMP dan IPTC-nya, komentarnya, dan gambar mini yang tersemat hilang, pada setiap foto di daftarnya sekaligus. Gambarnya sendiri tidak tersentuh — tidak dikompres ulang, tidak didekodekan, tidak berubah satu piksel pun.

Sebelum Anda melakukan itu, layak dilihat apa yang tadinya ada di dalamnya. Biasanya lebih banyak daripada dugaan orang, dan daftar itulah alasan untuk melakukan ini sama sekali.

## Apa sebenarnya yang ada di dalam sebuah foto

Sebuah JPEG bukan sekadar gambar terkompres. Ia sebuah wadah, dan di sebelah gambarnya duduk beberapa blok informasi yang ditulis kamera, ponsel, atau penyunting Anda di sana.

- **EXIF.** Yang utama. Merek dan model kamera, lensa, setelan pencahayaan, ISO, tanggal dan waktunya sampai ke detik, orientasi yang seharusnya dipakai menampilkan gambarnya, dan — di ponsel yang layanan lokasinya menyala untuk kameranya — posisi GPS yang akurat sampai beberapa meter. Sering kali juga nomor seri bodi kameranya.
- **GPS.** Secara teknis bagian dari EXIF, dan layak disebutkan tersendiri karena inilah yang paling penting. Ia ditulis dalam derajat, menit, dan detik, dan itu format yang sangat berhasil membuat dirinya tidak tampak seperti sebuah alamat.
- **XMP.** Sebuah paket XML yang ditulis penyunting. Ia bisa membawa nama Anda, perangkat lunak Anda, peringkat, kata kunci, riwayat suntingan, dan salinan sebagian kolom EXIF-nya — dan itulah sebabnya menghapus EXIF saja tidak cukup.
- **IPTC.** Blok yang lebih tua berisi kolom keterangan, nama penulis, kredit, dan hak cipta, dipakai di dunia pers dan fotografi stok.
- **Gambar mini yang tersemat.** Salinan kedua yang kecil dari gambarnya. Ia dihasilkan ketika file-nya ditulis, dan ia tidak selalu dihasilkan ulang ketika gambarnya disunting — dan begitulah foto yang sudah dipangkas bisa bepergian dengan gambar mini berisi apa yang dipangkas keluar.
- **Maker note.** Blok data pabrikan yang tidak didokumentasikan. Tidak ada orang di luar pabrikannya yang tahu semua yang ada di dalamnya.

![Pemeriksa: gambar kecil sebuah foto di samping daftar apa yang ditemukan di dalamnya, termasuk merek dan model kameranya, tanggal pengambilannya, dan koordinat GPS.](https://abox.tools/screens/remove-exif-and-gps-data/inside.webp)

Apa yang sebenarnya dibawa sebuah foto dari ponsel. Kebanyakan orang belum pernah melihatnya, dan karena itulah panduan ini ada.

## Siapa yang sebenarnya melihatnya

Inilah bagian yang layak diuraikan dengan akurat, karena baik versi yang panik maupun versi yang meremehkan sama-sama keliru.

**Kebanyakan jejaring sosial besar membersihkan metadata ketika Anda mengunggah.** Facebook, Instagram, dan X mengodekan ulang gambar yang diunggah lalu membuang tagnya dalam prosesnya. Ini bukan kebaikan hati — mereka menyimpan datanya di pihak mereka — tapi memang artinya foto yang diunggah ke layanan itu tidak menyerahkan koordinatnya kepada setiap penonton.

**Hampir semua yang lain menyimpannya.** Lampiran email. File yang dikirim lewat kebanyakan aplikasi obrolan sebagai “dokumen” alih-alih sebagai foto. Gambar di sebuah forum, di sebuah iklan lapak jual beli, di situs pribadi, di drive bersama, di laporan bug, di tiket dukungan. Di semua itu file-nya tiba utuh, dan siapa pun yang mengunduhnya bisa membaca tagnya dengan alat yang sudah dibawa sistem operasi mereka.

Risiko yang realistis itu biasa saja alih-alih dramatis: iklan lapak jual beli yang difoto di rumah, gambar seorang anak yang diambil di sekolahnya, akun yang tampaknya anonim yang mengunggah foto-foto yang semuanya berbagi satu nomor seri kamera, sebuah “diambil minggu lalu” yang ternyata diambil bulan Maret.

## Kenapa tidak simpan ulang saja?

Menyimpan ulang sebuah foto lewat sebuah penyunting atau kompresor memang membuang metadatanya — gambarnya didekodekan menjadi piksel lalu dikodekan lagi, dan kanvas yang penuh piksel tidak membawa tag. Itu bekerja, dan itu mengorbankan kualitas Anda, karena pengodean ulang itu merugikan.

Membuang metadatanya dengan benar sama sekali tidak berbiaya. Tagnya duduk di dalam wadah *di sekeliling* gambar terkompresnya, bukan di dalamnya, jadi membersihkannya berarti menghapus entri dari sebuah daftar lalu menuliskan daftar itu kembali. Data gambar terkompresnya disalin byte demi byte dan hasilnya terdekodekan menjadi piksel yang persis sama. Itulah seluruh alasan memakai alat metadata alih-alih sebuah pengubah.

Pengecualiannya adalah kalau Anda toh akan mengodekan ulang. Kalau Anda memang sedang mengompres atau mengubah ukuran fotonya, tagnya hilang sebagai efek samping dan Anda tidak butuh langkah kedua.

## Satu hal yang perlu disimpan: orientasi

Ponsel tidak memutar gambarnya ketika Anda memutar ponselnya. Mereka merekamnya sebagaimana sensornya melihatnya lalu menambahkan tag Orientation yang mengatakan bagaimana ia harus diputar untuk ditampilkan. Bersihkan setiap tag dan sebagian penampil akan menampilkan foto Anda miring.

Itulah sebabnya alat di sini punya pilihan “simpan tag orientasinya”, yang menyala secara bawaan. Ia menulis kembali sebuah blok EXIF mungil berisi satu tag itu dan tidak lebih, dan hanya untuk foto yang memang membutuhkannya. GPS-nya, cap waktunya, nomor serinya, dan sisanya tetap hilang.

Matikan kalau Anda lebih suka file-nya sama sekali tidak membawa EXIF — lalu periksa hasilnya sebelum Anda mengirimnya, karena foto yang miring adalah akibat yang biasa.

![Kartu pembersihan: tombol untuk membuang semuanya, dengan sakelar untuk mempertahankan tanda orientasi dan profil warnanya.](https://abox.tools/screens/remove-exif-and-gps-data/strip.webp)

Buang semuanya, kecuali dua hal yang layak dipertahankan. Orientasi adalah yang, begitu hilang, membuat separuh kumpulan foto berbaring miring.

## Menyunting alih-alih membuang

Membuang semuanya adalah jawaban yang benar untuk kebanyakan orang. Kadang tidak: seorang fotografer mungkin ingin baris hak cipta dan setelan kameranya tetap ada dan hanya lokasinya yang hilang; seorang arsiparis mungkin perlu membetulkan tanggal yang keliru karena jam kameranya yang keliru.

Keduanya mungkin. Lokasinya bisa dihapus sendirian, dan tag teks, tanggal, ISO, orientasi, serta resolusinya bisa disunting di tempat.

Satu catatan yang berlaku untuk setiap alat yang melakukan ini, bukan hanya yang ini: menulis file-nya membangun ulang blok EXIF-nya, dan sebuah maker note memuat offset ke dalam blok *aslinya*. Maker note yang dibangun ulang karena itu bisa jadi tidak lagi terbaca oleh perangkat lunak milik pabrikannya sendiri. Kalau itu penting, hapus maker note-nya atau biarkan file-nya tidak disunting.

## Format, dan yang tidak bisa dikerjakan dengan cara ini

JPEG, PNG, dan WebP semuanya bisa ditulis ulang dengan bersih, dan ketiga itulah yang ditangani alat di sini.

HEIC — yang disimpan iPhone secara bawaan — dan AVIF adalah format wadah yang dibangun dari atom bersarang, dan butuh pembaca yang sama sekali berbeda. Alatnya mengenalinya lalu mengatakannya alih-alih menghasilkan file yang rusak. Kalau Anda punya sebuah HEIC, mengubahnya menjadi JPEG akan membuang metadatanya sebagai efek samping pengubahannya.

TIFF telanjang juga tidak ditangani, dan karena alasan yang lebih menarik: di sebuah TIFF, metadata dan data pikselnya dialamati oleh offset yang sama, jadi membuang tagnya berarti menulis ulang pengalamatan gambarnya sendiri. Itu bisa dilakukan dan itu pekerjaan yang berbeda.

## Kebiasaan yang layak dipunyai

Periksa sebelum Anda mengunggah alih-alih sesudahnya. Membaca tagnya memakan beberapa detik dan daftar temuannya menyebutkan hal-hal yang layak diketahui — posisinya, cap waktunya, nomor serinya — sebelum tabel lengkap setiap tagnya, jadi Anda tidak perlu tahu apa yang harus dicari.

Posisinya ditampilkan dalam derajat desimal lebih dulu, dengan sengaja. “51 derajat, 30 menit, 26 detik” tidak membuatnya jelas bahwa sebuah foto menyebutkan bangunan tempat ia diambil. Sepasang bilangan desimal yang bisa Anda tempelkan ke sebuah peta membuatnya jelas.

## Jangan mengunggah fotonya untuk mencari tahu apa isinya

Ada ironi khas pada cara masalah ini biasa diselesaikan: seseorang yang khawatir tentang apa yang diungkapkan fotonya mengunggahnya ke sebuah situs web untuk mencari tahu. Situs itu kini punya fotonya, koordinatnya, cap waktunya, dan nomor serinya, plus salinan gambarnya di sebuah disk milik mereka.

Tidak ada alasan untuk itu. Membaca dan menulis ulang wadah di sekeliling sebuah JPEG adalah beberapa ratus baris pembacaan yang bisa dijalankan sebuah peramban dengan sangat baik, dan itulah sebabnya alat di sini sama sekali tidak punya fitur jaringan: tidak ada `fetch`, tidak ada `XMLHttpRequest`, tidak ada apa pun yang bisa mengirim sebuah file bahkan seandainya ada yang mencoba. Muat sekali, putuskan koneksi, dan ia terus bekerja.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan cara memeriksa klaim itu di situs ini atau di mana pun lain — dan inilah jenis file yang paling layak diperiksa.
