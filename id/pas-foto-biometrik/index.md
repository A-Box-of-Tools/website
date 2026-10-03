# Pembuat Pas Foto — foto paspor dan visa sesuai aturan

Pilih negaranya. Ia menerapkan aturan negara itu, persis.

> Buat foto paspor atau visa sesuai aturan resmi negara Anda: mm dan DPI yang tepat, hamparan tinggi kepala dan garis mata secara langsung, pemeriksaan latar, lembar cetak 4x6, dan file yang dipadatkan ke batas KB milik portalnya. Tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/pas-foto-biometrik/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## foto Anda **tidak pernah diunggah**. Tidak ada server.

Pemangkasan, pengukuran, pembacaan latar, dan pencetakannya semua berjalan di peramban Anda sendiri, di perangkat keras Anda sendiri, memakai pengode JPEG yang memang sudah dibawanya. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — tidak ada yang diambil, tidak ada yang dikirim — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima foto wajah Anda.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara membuat pas foto paspor yang tidak dikembalikan

1. **Pilih fotonya.** Sebuah foto ponsel di depan dinding polos, di bawah cahaya siang, diambil dari jarak sekitar satu setengah meter. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Pilih negara dan dokumennya.** Panelnya lalu menampilkan ukuran cetak, rentang tinggi kepala, garis mata, warna latar, dan batas unggahan aturan itu — berikut lembaga asal setiap angkanya dan tanggal angka itu dibaca. Tidak ada satu pun di daftar itu yang ditebak, dan apa pun yang dikirimkan kepada Anda tapi tidak ada di sana masuk lewat “Di tempat lain”.
3. **Periksa empat titik di wajah Anda.** Puncak kepala, dagu, dan masing-masing pupil — keempat titik itulah seluruh yang diukur aturannya. Mereka ditaruh dengan mengukur gambarnya sendiri, dan baris di bawahnya mengatakan mana dari keempatnya yang berhasil dan mana yang harus diperhitungkan; seret yang mendarat keliru, atau beralihlah ke *Saya yang menaruhnya* dan kerjakan keempatnya sendiri. Lalu tekan *Paskan kotaknya* dan pangkasannya mendarat di tempat yang diinginkan negara itu.
4. **Baca empat pemeriksaannya, dan latarnya.** Tinggi kepala, garis mata, pemusatan, dan kemiringan, masing-masing diukur dari kotaknya apa adanya dan masing-masing mengatakan ke arah mana harus diseret kalau meleset. Latarnya dibaca dari bagian atas dan sisi-sisi pangkasannya lalu dibandingkan dengan warna yang diminta aturannya — ketidakrataan, yang sebenarnya paling sering membuat foto ditolak, diukur terpisah dari warnanya.
5. **Ambil ketiga file-nya.** Cetakannya, pada milimeter yang tepat dengan resolusinya tertulis di dalam file sehingga sebuah kios mencetaknya pada ukuran yang benar. Lembarnya, dengan sebanyak mungkin salinan yang muat di ⁦4 × 6⁩ dan tanda potong di sela-selanya. Dan unggahannya, pada ukuran piksel yang dituntut portalnya dan di dalam rentang KB yang ditegakkannya di kedua ujung.

## Versi lebih lengkap

[Cara mengambil pas foto paspor yang tidak dikembalikan](https://abox.tools/id/panduan/membuat-pas-foto/): Apa yang sebenarnya diukur pada sebuah pas foto paspor - tinggi kepala, garis mata, latar - negara mana meminta angka yang mana, dan bagaimana memenuhi batas piksel dan KB yang ditegakkan sebuah formulir daring.

## Juga ada di dalam kotak

- [Penumpuk Gambar](https://abox.tools/id/tumpuk-gambar/): Dua puluh bingkai menjadi satu, tanpa dua puluh unggahan dan tanpa pengubah RAW.
- [Penyensor Gambar](https://abox.tools/id/sensor-gambar/): Apa yang Anda tutup dihapus dari file-nya, bukan ditutupi di dalamnya.
- [Penampil dan Penghapus EXIF](https://abox.tools/id/hapus-data-exif/): Lihat apa yang dikatakan sebuah foto tentang Anda. Lalu keluarkan.
- [Penampil DICOM](https://abox.tools/id/penampil-dicom/): CT, MR, rontgen, dan USG, lengkap dengan jendela, headernya, dan pengukurannya.

## Pertanyaan

### Apakah foto saya diunggah ke suatu tempat?

Tidak. Gambarnya didekodekan, dipangkas, diukur, dan ditulis oleh peramban Anda sendiri di perangkat keras Anda sendiri, memakai pengode JPEG yang memang sudah dibawa peramban itu. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Di sini itu lebih berarti daripada di kebanyakan alat: file-nya adalah foto wajah Anda.

### Negara mana saja yang tercakup?

Spesifikasi yang sejauh ini sudah disalin adalah standar ICAO itu sendiri, Amerika Serikat (paspor dan pendaftaran Diversity Visa, yang aturan unggahannya berbeda), Britania Raya, visa Schengen, Jerman, Kanada, Australia, India (paspor, cetakan ⁦35 × 45⁩ mm, serta foto dan tanda tangan formulir SSC/UPSC), Tiongkok, dan Jepang. Setiap entri menyebutkan lembaga asalnya dan tanggal ia dibaca. Selain itu masuk lewat “Di tempat lain”, tempat setiap angkanya Anda ketik sendiri — dan karena sebagian besar dunia menerbitkan menurut geometri ICAO, entri itu dimulai dari sana.

### Bagaimana ia menemukan puncak kepala, dagu, dan mata tanpa model wajah?

Dengan memakai sesuatu yang tidak boleh diandaikan sebuah pendeteksi wajah umum tapi boleh diandaikan alat ini: setiap spesifikasi ini menuntut adegan yang sama — satu orang, menghadap kamera, di depan dinding polos yang tercahayai rata. Jadi warna dindingnya dibaca dari tepi gambarnya, semua yang bukan warna itu adalah orangnya, dan bagian teratasnya adalah puncak kepala, rambut termasuk. Pupilnya ditemukan sebagai pasangan bercak terbaik yang lebih gelap daripada sekelilingnya sendiri, sejajar satu sama lain dan berada di kedua sisi tengah kepala — sebuah perbandingan yang bersifat setempat, jadi tidak ada di dalamnya yang bergantung pada warna sebuah wajah. Dagulah yang tidak bisa ditemukan dengan cara ini, karena rahang terhadap leher adalah tepi lunak tanpa perubahan warna di seberangnya; ia diperhitungkan dari pupilnya, yang duduk sedikit di bawah tengah sebuah kepala begitu rambut di atasnya ikut dihitung, lalu dicocokkan dengan siluetnya. Semuanya hitungan di `src/detect.js`: tanpa bobot, tanpa runtime inferensi, tanpa apa pun yang diambil, dan hitungan yang sama untuk setiap wajah yang melewatinya. Bagian terakhir itulah yang penting, karena sebuah pendeteksi yang dikirimkan keliru secara tidak merata — lebih parah pada sebagian wajah daripada yang lain — dan orang-orang yang fotonya sudah paling sering ditolak adalah yang akan dikecewakannya.

### Seberapa jauh saya boleh percaya pada titik yang ditaruhnya?

Cukup untuk dijadikan titik mulai, tidak cukup untuk melewatkan memeriksanya. Masing-masing dari keempatnya punya foto yang membuatnya keliru: dinding bermotif atau rak buku tidak meninggalkan siluet untuk mencari sebuah kepala, kepala yang terpotong di atas sama sekali tidak punya puncak di gambarnya, dan kacamata, poni tebal, atau mata terpejam bisa menaruh pupilnya pada bagian yang salah. Jadi alat ini mengatakan dengan lantang mana dari keempatnya yang diukurnya dan mana yang harus diperhitungkan, menolak mentah-mentah gambar tanpa latar polos alih-alih mengarang jawaban, dan membiarkan setiap titik bisa diseret. Pangkasannya diambil dari tempat titik-titiknya berakhir, tidak pernah dari tempat mereka bermula. Kalau Anda lebih suka menaruh keempatnya sendiri, sakelar di atas gambarnya berbunyi *Saya yang menaruhnya*, dan memindahkan titik mana pun dengan tangan beralih ke sana dengan sendirinya — sejak saat itu mereka milik Anda dan tidak ada lagi yang akan memindahkannya.

### Apa itu aturan tinggi kepala, dan kenapa punya saya terus gagal?

Setiap spesifikasi ini menyatakan berapa banyak bingkai yang harus diisi kepalanya, diukur dari bawah dagu sampai puncak kepala, rambut termasuk — biasanya 70 sampai 80 persen, yang untuk foto 45 mm berarti 31,5 sampai 36 mm. Alasan yang biasa membuatnya gagal adalah swafoto: panjang lengan sekitar 60 cm, yang membuat wajahnya melenceng dan menaruh kepalanya terlalu besar di bingkainya. Alasan kedua yang biasa adalah puncak kepalanya — itu bagian teratas rambutnya, bukan garis rambutnya, dan menandai garis rambut membuat setiap kepala keluar terlalu kecil.

### Kenapa file-nya harus paling sedikit 20 KB, dan bagaimana ia bisa dipadatkan?

Portal ujian India, formulir visa Tiongkok, dan unggahan paspor Britania Raya sama-sama menyatakan ukuran file minimum di samping maksimumnya, karena file di bawahnya biasanya sebuah gambar mini yang diunggah orang karena keliru. Foto ⁦200 × 230⁩ adalah 46.000 piksel, dan pada kualitas terbaik yang bisa ditulis sebuah peramban ia masih bisa mendarat di 15 KB, tanpa cara membuatnya lebih besar dengan mengompres lebih sedikit. Jadi alat ini menambahkan sebuah segmen komentar JPEG yang penuh spasi. Itu bagian dari standar JPEG, setiap dekoder melewatinya, dan gambarnya sama bit demi bit — hanya file-nya yang lebih panjang. Isian itu mengatakan persis begitu, dalam bahasa Inggris, di dalam file-nya.

### Apakah ia memeriksa latarnya, dan bisakah ia menggantinya?

Ia memeriksa dan tidak akan mengganti. Warnanya dibaca dari sebuah pita melintang di bagian atas pangkasannya dan turun di kedua sisinya, di atas bahu, lalu dibandingkan dengan warna aturannya dalam CIE Lab alih-alih dalam RGB — dua abu-abu berjarak empat puluh satuan RGB tidak bisa dibedakan, sedangkan empat puluh satuan biru adalah warna yang berbeda. Ketidakrataannya diukur terpisah, karena bayangan di dinding putihlah yang sebenarnya membuat foto ditolak, dan itu bukan masalah warna. Mengganti sebuah latar berarti menggunting seseorang keluar dari sebuah gambar, dan itu sebuah model segmentasi, yang kalau buruk memakan rambut. Berdiri setengah meter lebih jauh dari dinding membereskan lebih banyak dari ini daripada filter mana pun.

### Lembar ⁦4 x 6⁩ itu untuk apa?

Sebuah studio foto memungut biaya lumayan untuk enam lembar. Sebuah gerai cetak foto mencetak ⁦6 × 4⁩ dengan harga receh dan semuanya bisa melakukannya. Jadi alat ini menata sebanyak mungkin salinan foto Anda yang muat di kertasnya — delapan, untuk ⁦35 × 45⁩ di atas ⁦6 × 4⁩ — dengan tanda potong di sela-selanya dan tidak ada yang tercetak di atas sebuah gambar. Tidak ada yang diskalakan agar muat: setiap salinan tepat seukuran yang diminta aturannya, karena lembar yang mengecilkannya dua persen supaya satu lagi muat akan menjadi delapan foto yang semuanya salah ukuran. Cetak pada 100 persen; “paskan ke halaman”-lah yang membuat sebuah lembar keluar salah.

### Kenapa DPI-nya penting kalau pikselnya sama saja?

Karena sebuah JPEG bisa menyatakan seberapa besar dirinya, dan kalau tidak, apa pun yang mencetaknya akan menebak. Resolusinya tinggal di header JFIF, dan sebuah kanvas peramban menulis header itu dengan kolom satuannya disetel ke “ini rasio aspek, bukan resolusi”. Alat ini menulis ulang beberapa byte itu sehingga file-nya menyatakan 300 dpi, dan itulah yang mengubah ⁦413 × 531⁩ piksel menjadi foto ⁦35 × 45⁩ mm alih-alih sebuah gambar tanpa ukuran tertentu. Tidak ada yang didekodekan untuk melakukannya dan tidak ada kualitas yang dikorbankan.

### Bisakah ia membuat file tanda tangannya juga?

Bisa — formulir SSC dan UPSC meminta satu pada ⁦140 × 60⁩ piksel dan antara 10 sampai 20 KB, dan itu ada di daftarnya sebagai spesifikasinya sendiri. Hamparan wajahnya dimatikan untuk itu, karena sebuah tanda tangan tidak punya garis mata, dan yang diperiksa sebagai gantinya adalah bahwa kertasnya terang, bahwa ada tinta di atasnya, dan bahwa pangkasannya tidak ikut mengambil garis bergaris atau tepi halamannya. Mencapai 10 KB adalah bagian sulit dari aturan itu, bukan bertahan di bawah 20.

### Apakah ini menjamin permohonan saya diterima?

Tidak, dan tidak ada alat yang jujur bisa menjaminnya. Yang dilakukannya adalah menerapkan angka resminya persis dan menunjukkan kepada Anda setiap pengukuran yang dibuatnya, sehingga hal-hal yang diukur sebuah formulir secara otomatis — ukuran piksel, ukuran file, format — sudah benar, dan hal-hal yang diukur seorang pemeriksa manusia — tinggi kepala, garis mata, latar — ada di hadapan Anda lengkap dengan angkanya. Aturannya juga berubah: setiap spesifikasi di sini menyebutkan lembaga asalnya dan kapan ia dibaca, jadi Anda bisa mencocokkannya dengan formulir di depan Anda alih-alih memercayai sebuah tabel.

### Apakah gratis, dan apakah saya perlu akun?

Gratis; tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air tercetak melintang di wajah Anda. Tidak ada batas berapa banyak foto yang Anda buat juga, karena tidak ada server yang membayarnya. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang foto Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia terus bekerja — buku aturannya adalah sebuah file yang disajikan bersama halamannya, bukan sebuah pencarian. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim foto Anda pergi untuk dipangkas akan berhenti pada saat Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Foto wajah Anda tidak pernah meninggalkan mesin ini.** Di sini hal itu lebih penting daripada di kebanyakan alat: file yang ditangani halaman ini adalah gambar wajah Anda, dan yang hendak Anda lakukan dengannya menyebutkan negara yang dokumennya Anda ajukan. `Content-Security-Policy` menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat foto Anda bisa dikumpulkan.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Buku aturannya adalah sebuah tabel di `src/specs.js`, disajikan bersama halamannya dan disinggahkan bersamanya — tidak ada daftar negara yang perlu dicari dan tidak ada apa pun untuk memeriksa foto Anda dari jauh.
- **Wajahnya ditemukan tanpa model wajah.** Tidak ada bobot yang perlu diunduh, tidak ada runtime inferensi, dan tidak ada yang diambil: puncak kepalanya datang dari siluet kepala Anda terhadap dinding di belakangnya, pupilnya dari bercak-bercak wajah yang lebih gelap daripada sekelilingnya. Tidak ada di dalamnya yang membaca warna kulit, dan itulah seluruh alasan ia ditulis begitu — sebuah model yang keliru keliru secara tidak merata, lebih parah pada sebagian wajah daripada yang lain. Ia sebuah posisi awal, bukan sebuah putusan: halaman ini mengatakan titik mana dari keempatnya yang tidak bisa diukurnya, setiap titik tetap bisa diseret, dan beralih ke *Saya yang menaruhnya* mematikannya sama sekali.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi apa pun tentang foto Anda, wajah Anda, atau aturan negara mana yang Anda pilih. Setiap baris yang membaca, memangkas, mengukur, atau menulis sebuah file disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/specs.js` untuk buku aturannya — angka resmi setiap negara, lengkap dengan lembaga penerbitnya dan tanggal masing-masing dibaca — `src/detect.js` untuk cara keempat titiknya ditemukan — sebuah siluet dan dua bercak gelap, tanpa model apa pun di dalamnya — `src/geometry.js` untuk hitungan yang mengubah keempat titik itu menjadi sebuah pangkasan, dan `src/jpeg.js` untuk dua suntingan header yang menaruh resolusi cetaknya ke dalam file dan menaikkan unggahan yang terlalu kecil sampai ukuran yang dituntut sebuah formulir.
