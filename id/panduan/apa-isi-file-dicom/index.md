# Apa isi sebuah file DICOM?

Lebih dari hasil pindainya. File DICOM adalah rekam medis dengan gambar di dalamnya: nama Anda, tanggal lahir Anda, dan nomor rumah sakit Anda berjalan dalam berkas yang sama dengan pikselnya — dan itu paling penting justru pada saat Anda disodori CD lalu pergi mencari penampil.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

File DICOM — `.dcm` di CD yang diserahkan rumah sakit — bukan format gambar seperti JPEG. Ia format rekam medis dengan gambar di dalamnya. Sebelum pikselnya mulai, berkas ini membawa kepala berisi ratusan penanda, dan di antaranya, secara rutin: nama lengkap pasien, tanggal lahir, jenis kelamin, dan nomor rumah sakitnya; tanggal, jam, dan uraian pemeriksaan; dokter perujuk; institusi dan mesinnya, sampai ke nomor seri; serta seperangkat pengenal unik yang bekerja sebagai kunci kembali ke arsip yang menghasilkannya.

Tidak satu pun terlihat saat gambarnya ada di layar, dan justru begitulah ia terlupakan. Hasil pindai itu adalah rekamnya. Perlakukan berkasnya sebagai dokumen yang memang ia adalah, bukan sebagai gambar yang ia kandung.

## Mengapa berkas ini diunggah begitu enteng

Jebakannya dalam praktik: seorang pasien disodori cakram atau unduhan usai pemeriksaan, mencoba membukanya, dan tidak ada apa pun di komputernya yang mau — DICOM bukan format yang dipahami perangkat lunak biasa. Maka ia mencari “buka file dcm online”, dan hampir semua yang ditemukannya adalah kotak unggah. Sesaat kemudian, sebuah rekam medis lengkap dan teridentifikasi — nama, tanggal lahir, nomor rumah sakit, uraian pemeriksaan yang berbau diagnosis, semuanya — berada di server milik siapa pun yang kebetulan naik peringkat hari itu.

Perhatikan bentuknya: ini masalah foto KTP terulang lagi — berkas sensitif, momen gesekan, mesin pencari — tetapi dengan berkas yang sensitif tingkat dua. Paspor membocorkan siapa Anda; hasil pindai membocorkan siapa Anda *dan apa yang sedang diperiksa*. Argumen umum soal unggahan punya [halamannya sendiri](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/); inilah berkas yang membuat argumen itu tak butuh bumbu apa pun.

Membuka berkasnya secara lokal adalah seluruh obatnya, dan untuk itulah [penampil DICOM](https://abox.tools/id/penampil-dicom/) di sini: hasil pindainya, kendali jendela sungguhan, satu folder disusun kembali menjadi serinya, pengukuran dalam milimeter, dan setiap penanda kepala berkas terbaca — tanpa ada yang meninggalkan mesin Anda. Langkah demi langkahnya ada di [panduan membukanya](https://abox.tools/id/panduan/membuka-file-dicom/).

## “Namanya sudah kuhapus” bukan de-identifikasi

Kekeliruan berikutnya lebih halus dan niatnya lebih baik: membagikan hasil pindai — ke layanan opini kedua, peneliti, forum — setelah menghapus penanda yang paling kentara. Standarnya sendiri blak-blakan soal betapa kurangnya itu. Profil de-identifikasi milik DICOM menyenaraikan penanda yang harus dibereskan sebelum sebuah kumpulan data boleh disebut ter-de-identifikasi, dan senarainya sampai *ratusan* butir, karena identitas bersembunyi di lebih banyak tempat daripada kolom nama:

- **Pengenal langsung di luar nama** — tanggal lahir, ID pasien, nomor kunjungan, nama dokter dan institusi.
- **Kunci** — pengenal unik yang dicap di setiap berkas: mereka tidak mengatakan siapa Anda, tetapi mengatakan persis *rekam yang mana Anda*, bagi sistem mana pun yang pernah melihat aslinya.
- **Pengenal semu** — tanggal dan jam pemeriksaan, model dan nomor seri mesin, bagian tubuh, usia pasien: samar satu-satu, sempit bila digabung.
- **Pikselnya sendiri** — USG dan beberapa modalitas lain membakar nama pasien langsung ke dalam gambar, di tempat yang tak terjangkau penyuntingan penanda mana pun. (Untuk gambar hasil ekspor, itu pekerjaan [penyensoran di tingkat piksel](https://abox.tools/id/sensor-gambar/), bukan alat metadata.)

Karena itulah penampil di sini punya panel yang menyenaraikan persis apa saja di berkas Anda yang mengidentifikasi pasien, dan seberapa langsung — dibangun dari senarai milik standarnya sendiri. Dan karena itu pula penampil ini hanya *membaca*: ia tidak memuat kode yang menulis berkas DICOM, sebab “teranonimkan” adalah janji dengan palang jauh lebih tinggi daripada yang dilompati sebuah penampil — dan alat yang menepatinya setengah-setengah lebih buruk daripada yang tidak pernah menjanjikannya.

## Memperlakukan hasil pindai sebagai rekam yang memang ia adalah

Kebiasaannya jatuh sendiri dari semua di atas:

- **Lihat secara lokal.** Penampil yang bekerja dengan Wi-Fi mati — yang ini begitu — sudah membuktikan di mana pekerjaannya terjadi. Penampil bawaan di cakramnya, kalau berjalan di mesin Anda, juga tidak apa-apa.
- **Bagikan lewat saluran medis bila isinya yang jadi soal.** Mengirim satu studi ke rumah sakit lain adalah masalah yang sudah terpecahkan, dengan infrastruktur yang bisa dimintai tanggung jawab di belakangnya; email pribadi berisi `.zip` penuh berkas `.dcm` adalah salinan rekam Anda di server-server surat, tanpa batas waktu.
- **Kalau memang harus membagikan berkas, ketahui dulu isinya.** Baca kepala berkas dan panel identitasnya, supaya yang Anda teruskan adalah keputusan, bukan kejutan — dan perlakukan “de-identifikasi yang benar” sebagai layanan yang wajib diberikan penyedia pencitraan Anda bila diminta, bukan kotak centang yang Anda improvisasi.
- **Ingat, cakramnya hidup lebih lama daripada urusannya.** Salinan di folder unduhan dan CD di laci juga rekam yang lengkap, sama seperti pindaian KTP yang tak seorang pun ingat pernah menghapusnya.

Tidak satu pun dari ini berkata jangan pernah membagikan hasil pindai — opini kedua memang gunanya salinan. Yang dikatakannya: berkas ini dokumen tentang Anda, maka dua pertanyaan yang terus didatangi seluruh kelompok panduan ini berlaku juga di sini — kepada siapa ia diserahkan, dan apakah penyerahan itu memang perlu terjadi.
