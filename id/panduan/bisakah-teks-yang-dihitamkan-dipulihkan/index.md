# Bisakah teks yang dihitamkan dipulihkan?

Sering sampai bikin tidak nyaman: bisa — dengan alat seleksi teks, bukan dengan laboratorium. Kebanyakan persegi hitam digambar *di atas* kata-kata dan disimpan di sampingnya, dan kata-kata itu ikut menumpang di bawahnya. Halaman ini adalah katalog cara hal itu terjadi, dan apa yang seharusnya dimaksud dengan menghapus.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Sering sampai bikin tidak nyaman: bisa. Bukan dengan forensik — dengan menyeleksi area yang dihitamkan lalu menekan salin. Kebanyakan alat yang dipakai orang saat sesuatu harus disembunyikan menggambar persegi *di atas* isi dan menyimpannya *di samping* isi itu, dan segala yang di bawahnya ikut menumpang di dalam berkas, dengan sabar, sampai ada yang melihat.

Ini bukan kekeliruan langka orang yang ceroboh. Ia sudah mempublikasikan nama-nama dari berkas pengadilan, angka-angka tanpa sensor dari laporan pemerintah — dan, dalam satu pelepasan massal dokumen perkara pada Desember 2025, nama-nama yang dihitamkan namun terbaca dalam hitungan jam. Orang-orang di balik kekeliruan itu punya pengacara dan prosedur. Yang tidak mereka punya adalah pembedaan yang menjadi pokok halaman ini: beda antara menutupi dan menghapus.

## Persegi yang ternyata objek

Di pembaca PDF, pengolah kata, aplikasi presentasi, atau penyunting gambar berlapis, kotak hitam yang digambar bukanlah cat. Ia adalah *objek*: bentuk dengan posisi, ukuran, dan warna, disimpan di dalam berkas sebagai barang tersendiri, di depan teks yang masih utuh seluruhnya. Dokumen itu tidak berkata “kata ini sudah hilang”; ia berkata “kata ini di sini, dan ada persegi di depannya”.

Semuanya mengikuti dari situ. Seleksi areanya lalu salin, dan papan klip menerima teksnya, karena menyalin membaca lapisan teks dan mengabaikan hiasan di depannya. Buka berkasnya di penyunting dan persegi itu tinggal digeser. Ekspor ke format lain dan lapisan-lapisan bisa diratakan dalam urutan berbeda. Di layar, kotak itu identik dengan sensor sungguhan, dan justru karena itulah kekeliruan ini lolos dari pemeriksaan: mata memeriksa halaman, dan halamannya tampak beres.

PDF menambahkan varian yang lebih senyap. Sebuah PDF boleh menyatakan bahwa serangkaian glif “mengeja” sesuatu yang berbeda dari yang tergambar — fitur aksesibilitas bernama `/ActualText` — dan menyalin membaca pernyataan itu, bukan tintanya. Maka sebuah dokumen bisa membocorkan kata yang bahkan tidak terlihat di halamannya.

## Buram yang ternyata aritmetika

Pikselasi terasa lebih aman daripada kenyataannya. Mosaik adalah kisi rata-rata, dan rata-rata adalah *pengukuran* atas apa yang ada di bawahnya: kecil dan tidak sempurna, tetapi tetap pengukuran. Untuk teks dengan fonta yang dikenal pada ukuran yang bisa ditebak, itu sudah cukup untuk membacanya balik: ambil setiap untaian yang masuk akal, gambar, pikselasi dengan cara yang sama, lalu simpan kandidat yang mosaiknya cocok. Tidak ada yang butuh laboratorium; ini perulangan dan pembandingan.

Buram lebih buruk secara prinsip. Buram adalah konvolusi — setiap piksel keluaran adalah rata-rata berbobot para tetangganya — dan konvolusi cukup sering bisa dijalankan mundur dengan cukup baik sehingga dekonvolusi menjadi perkakas biasa dalam fotografi, bukan serangan eksotis. Kedua efek itu juga berbagi satu cacat yang tidak ada hubungannya dengan matematika: keduanya mengumumkan bahwa ada yang disembunyikan, dan kira-kira berapa panjangnya — yang untuk kata sandi enam karakter sudah merupakan petunjuk.

Isian polos tidak punya satu pun sifat itu. Satu warna, dari tepi ke tepi, tidak membawa pengukuran apa-apa. Itulah sebabnya ia jadi bawaan di alat [penyensor gambar](https://abox.tools/id/sensor-gambar/) di sini, sebabnya opsi pikselasi dan buramnya menuliskan di label mereka sendiri apa yang tidak mereka janjikan, dan sebabnya kontrol kekuatannya melaporkan angka, bukan kata sifat.

## Salinan yang disimpan berkas tentang masa lalunya

Keluarga kegagalan yang ketiga tidak ada urusannya dengan penutupan. Berkas mengingat, dengan cara-cara yang tidak ditampilkan layar:

- **Metadata foto sering menyertakan gambar mini** dari citra sebelum disunting. Potong alamat rumah keluar dari sebuah foto, dan blok EXIF bisa saja masih menyimpan versi kecil aslinya yang belum terpotong. [Penampil dan penghapus EXIF](https://abox.tools/id/hapus-data-exif/) memperlihatkan blok itu dan mengeluarkannya; ada [panduannya](https://abox.tools/id/panduan/hapus-data-exif-dan-gps/).
- **Beberapa penyunting menyimpan di tempat tanpa memangkas.** Sepasang cacat terkenal tahun 2023 — di alat corat-coret tangkapan layar sebuah ponsel dan alat gunting layar sebuah desktop — meninggalkan byte gambar asli di dalam berkas setelah pemotongan, sehingga bagian yang “terpotong” bisa direka ulang dari sisa-sisanya.
- **PDF bisa membawa sejarahnya sendiri.** PDF yang disunting dengan penyimpanan inkremental menambahkan perubahan di ujung berkas dan membiarkan versi sebelumnya utuh di dalamnya, termasuk yang dihapus.

Benang merahnya: apa yang ditampilkan penampil dan apa yang terkandung dalam berkas adalah dua pertanyaan berbeda, dan penyensoran yang hanya diperiksa dengan melihat baru menjawab yang pertama.

## Apa yang sungguh diperlukan untuk menghapus

Penyensoran sejati mengubah datanya, bukan tampilannya, dan ia bisa diperiksa lewat jalan yang sama dengan jalan kegagalannya: dengan bertanya kepada berkas, bukan kepada layar.

Untuk gambar, itu berarti piksel di bawah kotak berhenti ada sebelum berkas apa pun ditulis. Persis itulah yang dilakukan [penyensor gambar](https://abox.tools/id/sensor-gambar/): nilai-nilai yang tertutup ditimpa di memori dan baru kemudian diserahkan ke pengode, sehingga keluarannya berisi piksel hitam di tempat isi tadi berada, bukan tinta hitam di depannya. Versi langkah demi langkahnya ada di [panduan menyensor gambar](https://abox.tools/id/panduan/sensor-gambar/).

Untuk PDF, itu berarti glif-glifnya dihapus dari instruksi yang menggambar halaman, bersama para pembawa tersembunyi: pernyataan `/ActualText`, penanda buku, komentar, isian formulir. Itulah yang dilakukan [penyensor PDF](https://abox.tools/id/sensor-pdf/), lalu ia melakukan hal yang paling penting: membuka kembali keluarannya sendiri dan mencari kata-kata yang dihapus di dalamnya, dan **kalau ada yang selamat, tidak ada unduhan**. Jalan lengkapnya ada di [panduan menyensor PDF](https://abox.tools/id/panduan/sensor-pdf/).

Dan alat apa pun yang Anda pakai, di mana pun, uji terimanya milik Anda: seleksi di atas area yang disensor lalu salin; cari kata yang dihapus di dalam berkas; buka di penampil lain. Kalau isinya memang dihapus, tidak ada yang bisa menemukannya — dan apakah sebuah alat melakukan ini di peramban Anda, tanpa berkas meninggalkan mesin, itu juga klaim yang bisa Anda periksa alih-alih percaya: [panduan tentang mengunggah](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) menunjukkan caranya. Menyensor adalah satu-satunya pekerjaan yang berkasnya sensitif menurut definisi — jadi pekerjaan terakhir yang pantas mampir ke server orang tak dikenal.
