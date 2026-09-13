# Pemindai Dokumen — foto sebuah halaman, diluruskan

Foto halamannya. Dapatkan sesuatu yang tampak seperti hasil pindaian.

> Ubah foto ponsel sebuah halaman menjadi PDF yang lurus dan tercahayai rata. Sudutnya dicarikan untuk Anda, perspektifnya diluruskan, bayangannya dibagi keluar. Berjalan sepenuhnya di peramban Anda: tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/pemindai-dokumen/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## dokumen Anda **tidak pernah diunggah**. Tidak ada server.

Fotonya didekodekan, diluruskan, dibersihkan, dan ditulis ke dalam sebuah PDF oleh peramban Anda sendiri, tanpa apa pun selain hitungan dan kodek yang memang sudah dibawanya. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan alasan hal itu penting di sini adalah apa yang biasa difoto orang halamannya: paspor, slip gaji, surat sewa, formulir yang diminta sebuah kantor untuk “dipindai dan dikembalikan”.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara memindai dokumen dengan kamera ponsel Anda

1. **Foto halamannya.** Dari atas, dengan seluruh halamannya di dalam bingkai dan keempat sudutnya terlihat atau hampir terlihat. Ia tidak harus tegak lurus dan tidak harus tercahayai rata: sudut dan bayangan itulah yang menjadi tugas alat ini. Yang penting adalah mengisi bingkainya — halaman yang difoto dari seberang ruangan tidak punya detail di dalamnya untuk dipulihkan.
2. **Periksa keempat sudutnya.** Mereka dicarikan untuk Anda ketika fotonya dibaca, dan halamannya mengatakannya ketika ia tidak yakin — halaman di atas meja yang warnanya sama dengan kertasnya memang sungguh sulit dilihat tepinya. Tekan di mana pun pada fotonya dan sudut terdekat datang ke jari Anda, atau jangkau satu dengan `Tab` lalu pindahkan dengan tombol panah.
3. **Pilih apa yang dilakukan pada cahayanya.** “Warna, diratakan” mengukur kertasnya di seluruh halaman lalu membaginya keluar, sehingga bayangannya hilang dan sebuah stempel atau tanda tangan tetap berwarna. “Hitam putih” melangkah lebih jauh dan itulah yang membuat sebuah pindaian cukup kecil untuk dikirim lewat email. Yang Anda lihat di layar adalah hasil sebenarnya, dihasilkan oleh kode yang sama yang menulis file-nya.
4. **Tambahkan halaman lainnya.** Setiap foto yang Anda tambahkan menjadi halaman lain dari dokumen yang sama, dalam urutan mereka didaftar, dan masing-masing menyimpan sudutnya sendiri. Panah pada sebuah halaman di barisnya memindahkannya lebih awal atau lebih akhir.
5. **Simpan PDF-nya, dan buka sebelum Anda mengirimnya.** Dokumennya ditulis di sini, di dalam memori halaman ini. Tidak ada yang diunggah untuk membuatnya, dan tidak ada apa pun tentangnya yang dilaporkan ke mana pun.

## Versi lebih lengkap

[Cara memindai dokumen dengan ponsel Anda](https://abox.tools/id/panduan/memindai-dokumen-dengan-ponsel/): Apa yang memisahkan foto sebuah halaman dari pindaian sebuah halaman: sudutnya, cahaya yang tidak rata, dan ukuran file-nya. Bagaimana mengambil fotonya, apa yang dibetulkan sesudahnya, dan kenapa tidak satu pun dari itu butuh server.

## Juga ada di dalam kotak

- [Ekstrak Audio dari Video](https://abox.tools/id/ekstrak-audio-dari-video/): Jatuhkan sebuah video dan ambil suaranya. Gambarnya tidak pernah didekode, dan tidak ada yang diunggah.
- [Pemotong Audio](https://abox.tools/id/potong-audio/): Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu file, dipotong di tempat yang Anda sebutkan.
- [Penyunting Audio](https://abox.tools/id/sunting-audio/): Putar terbalik, ubah kecepatannya, angkat rekaman yang pelan — semuanya di sini, di mesin Anda.
- [Penggabung dan Pemisah PDF](https://abox.tools/id/gabung-pdf/): Halaman dipindah-pindah tanpa perjalanan bolak-balik ke server.

## Pertanyaan

### Apakah dokumen saya diunggah ke suatu tempat?

Tidak. Fotonya didekodekan, diluruskan, dibersihkan, dan ditulis ke dalam sebuah PDF oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Muat halamannya sekali, cabut koneksi internet, dan ia tetap bekerja.

### Bagaimana ia menemukan sudut halamannya tanpa model?

Dengan mencari empat tepi lurus panjang yang menyusun sebuah persegi panjang. Fotonya dikecilkan, gradiennya diambil — di mana gambarnya berubah, dan ke arah mana — dan setiap piksel yang duduk di sebuah tepi memberi suara untuk garis lurus tempat ia akan terbaring. Garis yang kuat dipasangkan menjadi calon persegi panjang, dan setiap calon dinilai dengan menyusuri keempat sisinya lalu menanyakan seberapa banyak dari masing-masing sisi yang benar-benar punya tepi di bawahnya, dan apakah keempatnya adalah batas dari satu benda: sebuah halaman lebih terang daripada sekelilingnya, atau lebih gelap, tapi ia sama di keempat sisinya, dan itulah yang mencegah sebaris teks dikira sebagai bagian bawah halamannya. Tidak ada bobot, tidak ada yang diunduh, dan hitungannya adalah hitungan yang sama untuk setiap dokumen yang melewatinya.

### Sudut yang ditemukannya salah. Sekarang bagaimana?

Seret. Sudutnya adalah posisi awal dan tidak pernah sebuah keputusan: pindaiannya diambil dari di mana pun keempatnya berakhir. Tekan di mana pun pada fotonya dan sudut terdekat melompat ke jari Anda, dan itu lebih mudah daripada mengenai sebuah pegangan kecil, dan tombol panah memindahkan sudut yang terfokus satu piksel sekali tekan. Halamannya juga memberi tahu Anda ketika sudutnya sebuah tebakan alih-alih sebuah temuan, dan menandai halaman itu di barisnya — halaman yang terbaring di meja yang kurang lebih sewarna dengannya adalah alasan yang biasa, karena di sana memang hampir tidak ada tepi untuk ditemukan.

### Kenapa halaman yang diluruskan keluar dengan bentuk yang benar, dan tidak gepeng?

Karena bentuknya dipulihkan dari perspektifnya alih-alih diukur dari tepinya. Halaman yang difoto dari sudut mengalami pemendekan pada tepi jauhnya, jadi metode yang gamblang — ambil pasangan tepi berlawanan yang terpanjang lalu sebut itu rasionya — menghasilkan A4 yang kelihatan pendek, dan itulah yang diberikan kebanyakan pemindai web. Foto sebuah persegi panjang sebenarnya membawa cukup informasi untuk memulihkan baik rasio aspek persegi panjangnya maupun panjang fokus kameranya, asalkan kameranya kamera biasa; itu hasil dari Zhang dan He pada tahun 2003, dan itulah yang dilakukan `src/geometry.js`. Kalau fotonya diambil tegak lurus, tidak ada perspektif untuk dijadikan pangkal dan memang tidak dibutuhkan, karena tepinya lalu menjadi tepat — jadi ia kembali ke tepinya, dan halamannya mengatakan yang mana dari keduanya yang menjawab.

### Apa sebenarnya yang dilakukan “dibersihkan” pada gambarnya?

Ia membagi keluar cahayanya. Kecerahan kertasnya sendiri diukur di seluruh halaman — sebuah kisi ubin, dan di setiap ubin sebuah persentil tinggi dari kecerahannya, yang terlalu gelap dan terlalu jarang untuk digerakkan teks — dan setiap piksel dibagi dengan kertas yang diperkirakan di titik itu. Yang tersisa adalah tintanya, tercahayai rata, dengan bayangan dan peredupannya hilang. Itu tidak sama dengan menaikkan kontras: menaikkan kontras sebuah halaman yang difoto membuat bagian terangnya putih, bagian gelapnya hitam, dan tulisan di bagian gelapnya tak terbaca, dan itulah sebabnya “auto levels” membuat gambar semacam ini lebih buruk alih-alih lebih baik.

### Kenapa mode hitam putihnya jauh lebih kecil?

Karena gambar dengan dua warna di dalamnya memang sepersekian data dari gambar dengan enam belas juta warna, dan di sini ia disimpan begitu: satu bit per piksel, dipak delapan per byte dan dikompres dengan tepat, alih-alih sebagai JPEG dari sebuah gambar hitam putih. Pada halaman yang sama ia keluar sekitar delapan belas kali lebih kecil daripada mode warnanya, jadi kontrak dua puluh halaman mendarat di bawah satu megabita alih-alih di sekitar lima belas. Ambangnya adalah ambang Sauvola, yang memutuskan setiap piksel terhadap rata-rata dan sebaran lingkungannya sendiri alih-alih terhadap satu angka untuk seluruh halaman — itulah yang menjaga tulisan di dalam sebuah bayangan. Ia tidak punya nada tengah, jadi halaman yang ada fotonya sebaiknya memakai salah satu mode lain.

### Bisakah saya menaruh beberapa halaman dalam satu PDF?

Bisa. Setiap foto yang Anda tambahkan menjadi halaman lain, dalam urutan mereka didaftar, dan setiap halaman menyimpan sudutnya sendiri — jadi setumpuk halaman yang difoto satu demi satu menjadi satu dokumen. Panah pada setiap halaman di barisnya memindahkannya lebih awal atau lebih akhir. Setelan pembersihannya dipakai bersama oleh semuanya dengan sengaja: halaman dalam satu dokumen yang dibersihkan secara berbeda tampak seperti dua dokumen.

### Apakah ia membaca teksnya, supaya saya bisa mencari di PDF-nya?

Tidak. Tidak ada lapisan teks dan tidak ada pengenalan karakter: yang keluar adalah gambar sebuah halaman di atas sebuah halaman. Melakukannya dengan benar berarti sebuah mesin OCR, yang berarti puluhan megabita model untuk diunduh — dan pemindai dokumen yang mengambil sebuah model sebelum bisa membaca slip gaji Anda akan menjadi pemindai dokumen yang punya alasan untuk menelepon pulang soal slip gaji. Kalau Anda butuh teksnya, mode hitam putihnya menghasilkan persis jenis file yang paling cocok bagi perangkat lunak OCR di mesin Anda sendiri.

### Hasilnya buram. Kenapa?

Hampir selalu karena halamannya kecil di dalam fotonya. Panel di bawah pratinjaunya mengatakan seberapa banyak bingkai yang diisi halamannya dan kira-kira berapa titik per inci artinya di atas selembar seukuran itu — di bawah sekitar 150 DPI sebuah pindaian yang dicetak tampak lembek, dan tidak ada alat yang bisa berbuat apa-apa tentang detail yang memang tidak pernah ada di file-nya. Mendekatlah alih-alih memperbesar, tahan diam, dan biarkan kameranya memfokus pada halamannya sebelum menekan tombolnya. Guncang kamera adalah penyebab yang satunya, dan itu juga tidak bisa dipulihkan.

### Apakah gratis, dan apakah saya perlu akun?

Gratis; tidak ada akun, tidak ada masuk, tidak ada masa uji coba, tidak ada batas halaman, dan tidak ada tanda air. Tidak ada batas ukuran fotonya juga, karena tidak ada server yang membayarnya — pekerjaannya terjadi di mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang dokumen Anda.

## Cara memverifikasi klaim privasi ini

- **Dokumen Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat foto Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada model, jadi tidak ada yang perlu diunduh dan tidak ada yang perlu ditanyakan.** Menemukan keempat sudut sebuah halaman dilakukan dengan hitungan: gradien gambarnya, sebuah pemungutan suara untuk garis lurus di dalamnya, dan sebuah pemeriksaan atas apa yang sebenarnya ada di bawah setiap sisi persegi panjang yang menang. Tanpa bobot, tanpa runtime inferensi, tanpa apa pun yang diambil saat pemakaian pertama, dan tanpa apa pun yang berperilaku berbeda pada dokumen orang lain dibanding pada dokumen Anda — lihat `src/detect.js`.
- **Dokumennya tidak membawa tanggal, penulis, atau nama mesin.** Pindaian adalah sesuatu yang dikirim orang kepada orang lain, biasanya karena sebuah kantor memintanya. Satu-satunya yang ditulis ke dalam PDF-nya selain halamannya sendiri adalah nama alat ini, dan sebuah judul kalau Anda mengetiknya. Tidak ada tanggal pembuatan, tidak ada penulis, tidak ada nomor seri, dan tidak ada apa pun yang diturunkan dari jam Anda, nama file Anda, atau komputer Anda — lihat `src/document.js`.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Pekerjaannya adalah `getImageData`, beberapa perulangan atas byte-nya, dan pengode JPEG milik peramban sendiri — semuanya sudah terpasang di mesin Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana — dan yang layak dijalankan sebelum Anda memindai sebuah paspor.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/detect.js` untuk cara sudutnya ditemukan tanpa model apa pun, `src/warp.js` untuk pelurusannya, dan `src/clean.js` untuk cara cahaya yang tidak rata dibagi keluar.
