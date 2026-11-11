# Penumpuk Gambar — gabungkan sebuah burst, file RAW termasuk

Dua puluh bingkai menjadi satu, tanpa dua puluh unggahan dan tanpa pengubah RAW.

> Gabungkan sebuah burst foto menjadi satu: rata-ratakan untuk membunuh derau, ambil mediannya untuk membuang orang dari sebuah pemandangan, terangkan untuk jejak bintang, atau tumpuk fokus sebuah bidikan makro. Membaca CR2, NEF, ARW, DNG, RAF, dan CR3 dengan menarik keluar pratinjau milik kameranya sendiri. Berjalan sepenuhnya di peramban Anda.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/tumpuk-gambar/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## foto Anda **tidak pernah diunggah**. Tidak ada server.

Setiap bingkai dibuka, didekodekan, disejajarkan, digabungkan, dan ditulis oleh peramban Anda sendiri, di mesin Anda sendiri. Setumpuk dua puluh file RAW 60 MB adalah sekitar satu gigabita foto, dan tidak satu byte pun darinya berpindah: alatnya tidak punya fitur jaringan dalam bentuk apa pun, dan file-nya dibaca langsung dari disk Anda oleh sebuah worker yang tidak punya tujuan untuk mengirim apa pun.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Membaca RAW
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara menumpuk sekumpulan foto di peramban Anda

1. **Pilih bingkainya.** Sebuah burst, sekumpulan bracket, sebuah runtutan intervalometer, atau satu folder file RAW. Masing-masing dibuka begitu ia tiba dan barisnya memberi tahu Anda apa yang keluar darinya — untuk file RAW, kameranya, ukuran pratinjau yang ditemukan di dalamnya, dan betapa sedikit file-nya yang harus dibaca untuk menemukannya.
2. **Pilih metode yang cocok dengan apa yang ingin Anda hilangkan.** Derau: rata-rata, atau sigma-clip kalau ada yang bergerak. Orang, mobil, atau pesawat yang lewat: median. Langit gelap yang ingin Anda ubah menjadi jejak bintang: terangkan. Bidikan makro yang diambil di sepanjang cincin fokus: penumpukan fokus. Catatan di bawah menunya mengatakan apa yang dilakukan masing-masing pada jumlah bingkai Anda yang tertentu itu.
3. **Putuskan apakah bingkainya perlu disejajarkan.** Dipegang tangan: ya, geser saja. Dipegang tangan dan Anda juga berputar: geser, rotasi, dan skala. Tripod terkunci atau sebuah intervalometer: tidak, dan ia akan lebih cepat. Setiap bingkai diukur terhadap bingkai yang bertanda rujukan, dan itu yang pertama sampai Anda berkata lain: “Pakai sebagai rujukan” memindahkan tandanya dan meninggalkan daftarnya pada urutan yang Anda susun.
4. **Baca keempat angkanya, lalu tekan tombolnya.** Sebelum apa pun berjalan, halamannya mengatakan seberapa besar hasilnya nanti, kira-kira berapa banyak memori yang akan dipakainya, berapa kali bingkainya akan didekodekan, dan berapa banyak file Anda yang dibaca. Kalau kumpulannya tidak akan muat di memori dalam satu potong, ia mengatakannya, dan mengatakan resolusi kerja mana yang akan membereskannya.

## Versi lebih lengkap

[Cara menumpuk foto untuk mengurangi derau, atau membuang orang](https://abox.tools/id/panduan/tumpuk-foto-untuk-mengurangi-derau/): Menumpuk menggabungkan sebuah burst bingkai menjadi satu gambar. Metode mana yang dipakai tergantung apa yang ingin Anda hilangkan: derau, orang yang lewat, atau kedalaman bidang yang tipis pada sebuah bidikan makro. Cara kerja masing-masing, berapa harganya, dan di mana file RAW cocok.

## Juga ada di dalam kotak

- [Penyensor Gambar](https://abox.tools/id/sensor-gambar/): Apa yang Anda tutup dihapus dari file-nya, bukan ditutupi di dalamnya.
- [Penampil dan Penghapus EXIF](https://abox.tools/id/hapus-data-exif/): Lihat apa yang dikatakan sebuah foto tentang Anda. Lalu keluarkan.
- [Penampil DICOM](https://abox.tools/id/penampil-dicom/): CT, MR, rontgen, dan USG, lengkap dengan jendela, headernya, dan pengukurannya.
- [Gambar ke ICO](https://abox.tools/id/buat-favicon/): Satu gambar masuk. Setiap ukuran yang diminta peramban, Windows, atau sebuah Mac, keluar.

## Pertanyaan

### Apakah foto saya diunggah ke suatu tempat?

Tidak. Setiap bingkai dibuka, didekodekan, disejajarkan, ditumpuk, dan ditulis oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun — dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini. Muat halamannya sekali, cabut koneksi internet, dan ia tetap bekerja. Itu lebih penting di sini daripada di kebanyakan alat semata karena volumenya: setumpuk dua puluh bingkai RAW adalah sekitar satu gigabita, dan mengunggah satu gigabita foto untuk diambil rata-ratanya adalah hal yang justru ingin dihindari alat ini.

### Format RAW mana saja yang bisa dibacanya, dan bagaimana?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL, dan beberapa lagi — dan itu sebagian besar dari apa yang ditulis kamera. Yang dibacanya dari mereka adalah pratinjau JPEG berukuran penuh yang digambar kameranya sendiri ketika ia mengambil bidikannya: gambar di punggung kameranya, dan gambar yang digambar sistem operasi Anda sebagai gambar mininya. Ia ditemukan dengan menyusuri struktur direktori file-nya, yang berbiaya beberapa pembacaan beberapa kilobita masing-masing, lalu mengambil satu irisan. **Ia bukan hasil demosaik data sensornya.** Hasilnya membawa keseimbangan putih dan gaya gambar kameranya pada delapan bit per kanal, alih-alih dua belas atau empat belas bit data sensor linear yang akan diberikan sebuah pengubah RAW kepada Anda.

### Kalau begitu kenapa tidak mendekodekan data sensornya dengan benar?

Karena itu berarti menyertakan LibRaw atau dcraw — sebuah mesin kedua berukuran puluhan megabita, untuk satu keluarga format, yang sebagian besarnya adalah skema kompresi per pabrikan. Pertukaran itu diperdebatkan sampai tuntas di `docs/what-can-be-built-here.md` di sumber situs ini, tempat RAW kamera sudah ada di daftar yang dikesampingkan sejak sebelum alat ini ada. Yang berubah bukan jawaban atas pertanyaan itu melainkan penemuan bahwa penumpukan tidak membutuhkannya: pratinjaunya beresolusi penuh, mereka toh yang akan diberikan kameranya kepada Anda sebagai sebuah JPEG, dan membacanya kira-kira seratus kali lebih cepat daripada mendemosaik. Kalau Anda menginginkan data sensornya, kembangkan bingkainya di sebuah pengubah RAW lebih dulu lalu tumpuk TIFF atau JPEG yang dihasilkannya — alat ini menerima itu juga.

### Berapa banyak bingkai yang bisa ditanganinya, dan seberapa besar?

Enam dari ketujuh metodenya mengalir: mereka menahan satu akumulator lalu membaca setiap bingkai tepat sekali, jadi seratus bingkai berbiaya memori yang sama dengan dua dan satu-satunya yang bertambah adalah waktunya. Mediannya adalah pengecualiannya, karena nilai tengah sebuah kumpulan tidak bisa diketahui sampai Anda punya seluruhnya, jadi ia menahan setiap bingkai sekaligus — dua puluh bingkai 24 megapiksel adalah sekitar 1,4 GB, dan tidak ada peramban yang akan memberikannya kepada Anda. Ketika itu terjadi, gambarnya dipotong menjadi pita mendatar lalu ditumpuk sepita demi sepita, dan itu berbiaya membaca ulang bingkainya untuk setiap pitanya. Halamannya memperhitungkan semua ini sebelum Anda menekan tombolnya lalu menunjukkan angkanya kepada Anda, jadi jalan yang lambat tidak pernah menjadi kejutan.

### Apa sebenarnya yang dilakukan penyejajaran bingkainya?

Ia menemukan seberapa jauh setiap bingkai bergerak relatif terhadap bingkai rujukannya lalu memindahkannya kembali, sampai sepersekian piksel. Metodenya adalah korelasi fase: pergeseran antara dua gambar muncul sebagai perbedaan fase antara spektrumnya, jadi satu transformasi Fourier masing-masing menemukan pergeseran dua ratus piksel semurah pergeseran dua piksel. Setelan yang kedua juga memulihkan rotasi dan skalanya, dengan trik yang sama yang diterapkan pada spektrumnya dalam koordinat log-polar. Semuanya bersifat menyeluruh — satu pergeseran, satu sudut, satu skala untuk seluruh bingkainya — jadi ia membetulkan kamera yang bergerak dan tidak bisa membetulkan subjek yang bergerak, atau foto yang diambil dari satu langkah ke kiri. Satu akibat yang kelihatan: bingkai yang dipindahkan dua puluh piksel ke kiri tidak lagi mencapai tepi kanannya, jadi hasilnya dirapikan ke bagian yang dicakup setiap bingkainya. Itulah sebabnya tumpukan yang disejajarkan kembali sedikit lebih kecil daripada bingkai yang masuk ke dalamnya, dan itu satu-satunya alternatif dari sebuah batas gelap yang terbuat dari bingkai yang tidak ada di sana.

### Metode mana yang sebaiknya saya pakai?

**Rata-rata** untuk derau, pada kumpulan yang tidak ada yang bergerak: ia memangkas derau acak kira-kira sebesar akar jumlah bingkainya. **Median** untuk membuang hal-hal yang hanya ada sebagian waktu — pemakaian klasiknya adalah memotret sebuah alun-alun yang ramai selusin kali lalu mendapatkannya kosong. **Sigma clipping** ketika Anda ingin keduanya: ia mempelajari apa biasanya setiap piksel lalu merata-ratakan hanya nilai yang sepakat, jadi ia punya kekebalan median terhadap mobil yang lewat dan pengurangan derau rata-rata. **Terangkan** untuk jejak bintang, kembang api, dan lukisan cahaya. **Gelapkan** untuk membuang apa pun yang terang yang bergerak. **Tambahkan** untuk meniru satu pencahayaan panjang. **Penumpukan fokus** untuk bidikan makro yang diambil di sepanjang cincin fokus.

### Kenapa hasil saya delapan bit padahal file RAW saya empat belas?

Karena yang ditumpuk adalah pratinjau milik kameranya sendiri, yang berupa sebuah JPEG. Layak dikatakan bahwa penumpukan memulihkan sebagian dari yang dikorbankan itu: merata-ratakan enam belas bingkai delapan bit memberi hasil dengan gradasi yang sungguh lebih halus daripada yang dimiliki satu pun di antaranya, karena derau yang membuat pembulatan setiap bingkai berbeda justru itulah yang membuat rata-ratanya mendarat di antara tingkatannya. Hitungannya di sini dikerjakan dalam bilangan titik-mengambang lalu dibulatkan sekali di ujungnya, jadi tidak ada satu pun dari itu yang dibuang di tengah jalan. Ia tetap tidak sama dengan menumpuk data sensor linear, dan alat ini tidak berpura-pura sebaliknya.

### Bisakah saya menumpuk bingkai yang berbeda ukuran, atau dari kamera berbeda?

Bisa, meski itu biasanya sebuah kekeliruan dan layak diperiksa bahwa Anda memang memaksudkannya. Hasilnya seukuran bingkai terbesarnya, dan setiap bingkai lain diskalakan agar muat lalu diletakkan di tengahnya. Mencampur kamera juga mencampur penggambaran warnanya, jadi rata-rata keduanya adalah rata-rata dua tafsir berbeda atas cahaya yang sama. Tempat ia memang membantu adalah sebuah kumpulan yang dibidik pada dua resolusi, atau sebuah file RAW dan sebuah JPEG dari bingkai yang sama.

### Ia bilang jalannya akan berpita. Apa maksudnya?

Bahwa memori kerja yang dibutuhkan metodenya lebih dari yang bersedia dialokasikan alatnya sekaligus, jadi gambarnya akan dipotong menjadi jalur-jalur mendatar lalu ditumpuk sejalur demi sejalur. Ia tetap menghasilkan hasil yang persis sama; ia hanya membaca bingkainya lagi untuk setiap jalurnya, jadi ia memakan waktu lebih lama, dan halamannya memberi tahu Anda berapa banyak pendekodean itu nanti. Menurunkan resolusi kerjanya satu langkah memangkas memorinya menjadi seperempat, dan itu hampir selalu mengubah jalan yang berpita menjadi satu jalan tunggal — catatannya mengatakan setelan mana yang akan melakukannya.

### Kenapa alat ini memakai sebuah Worker padahal tidak satu pun yang lain?

Karena ia satu-satunya yang pekerjaannya diukur dalam menit. Setiap alat lain di sini melakukan sesuatu yang memakan satu dua detik, dan di sana memindahkan pekerjaannya keluar dari utas utamanya akan menjadi upacara. Menumpuk dua puluh bingkai besar adalah hitungan padat atas ratusan megabita, dan di utas utama itu berarti halaman yang membeku: tidak ada bilah kemajuan yang bergerak, sebuah tombol Batalkan yang tidak menjawab, dan akhirnya sebuah peramban yang menawarkan membunuh tabnya. Workernya adalah utas kedua di peramban yang sama ini, menjalankan sebuah file dari folder yang sama ini, di bawah kebijakan yang sama ini. Ia bukan sebuah server dan ia bukan sebuah fitur jaringan.

### Apakah gratis, dan apakah saya perlu akun?

Gratis; tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Tidak ada batas berapa banyak bingkai yang Anda tumpuk atau seberapa besar mereka juga, karena tidak ada server yang membayarnya — pekerjaannya terjadi di mesin Anda sendiri dan satu-satunya langit-langitnya adalah memori Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang foto Anda.

## Cara memverifikasi klaim privasi ini

- **Foto Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada — tidak ada `fetch`, tidak ada `XMLHttpRequest`, tidak ada `sendBeacon`, di `src/` maupun di workernya.
- **File RAW-nya dibaca, bukan diunggah — dan nyaris tidak dibaca.** Sebuah file RAW kamera sudah memuat sebuah JPEG berukuran penuh yang digambar kameranya ketika ia mengambil bidikannya. Alat ini menemukannya dengan menyusuri beberapa entri direktori lalu meminta satu irisan, dan pada file 60 MB itu biasanya di bawah seratus kilobita. Halamannya menunjukkan angka itu kepada Anda dibandingkan dengan ukuran file Anda sambil Anda bekerja. Data sensornya sama sekali tidak pernah dibaca.
- **Pekerjaannya terjadi di sebuah Worker di mesin ini, bukan di sebuah server.** Inilah satu-satunya alat di sini yang memakai satu, karena penumpukan adalah hitungan bermenit-menit alih-alih berdetik-detik dan halaman yang membeku tidak bisa menampilkan kemajuan atau dibatalkan. Sebuah Worker adalah utas kedua di peramban yang sama ini — lihat `src/worker.js`. Ia diserahi file-nya sendiri, dan itu gratis, karena sebuah pegangan file bukanlah byte-nya; dan ia punya Content-Security-Policy yang persis sama dengan halamannya, yang artinya tidak punya tujuan untuk mengirimnya.
- **Tidak ada apa pun tentang kumpulannya yang dilaporkan ke mana pun.** Berapa bingkai yang Anda tumpuk, kamera apa yang menulisnya, seberapa jauh masing-masing sudah bergerak, metode mana yang Anda pilih, dan berapa lama waktunya ditahan di memori halaman ini sampai Anda menutupnya. Tidak ada peristiwa analitik khusus di repositori ini yang membawa satu pun darinya, dan satu pertanyaan yang diajukan situs ini setelah sebuah unduhan mengirim sebuah jempol ke atas atau ke bawah dan nama alatnya, tidak lebih.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Workernya dan setiap modul yang dimuatnya disinggahkan service worker milik halaman ini sendiri, jadi salinan yang terpasang menumpuk file RAW dengan jaringan tercabut.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/raw.js` untuk cara sebuah file RAW dibuka dengan membaca kilobita alih-alih megabita, `src/stack.js` untuk hitungan setiap metodenya, dan `src/plan.js` untuk asal angka memori dan pendekodean yang ditampilkan di halamannya — mereka jawaban file itu, bukan perkiraan.
