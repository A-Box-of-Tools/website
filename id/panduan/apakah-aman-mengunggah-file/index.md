# Amankah mengunggah file ke pengubah daring?

Biasanya jawaban yang jujur adalah “mungkin aman, tapi Anda tidak bisa memeriksanya.” Ini menjelaskan apa yang sebenarnya dilakukan pengunggahan terhadap file Anda, kenapa kebanyakan alat masih melakukannya, dan empat uji yang memberi tahu Anda apakah alat di hadapan Anda memang harus.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Untuk kebanyakan file, sebagian besar waktu, mengunggah tidak masalah. Pengubah yang terpandang menghapus apa yang Anda kirim dalam beberapa jam dan tidak berminat pada foto liburan Anda.

Masalahnya bukan bahwa mereka berbohong. Melainkan bahwa **Anda tidak punya cara mengetahui apakah mereka berbohong**. Begitu sebuah file meninggalkan mesin Anda, setiap janji tentang apa yang terjadi berikutnya adalah janji yang Anda terima atas dasar kepercayaan: berapa lama ia disimpan, siapa yang bisa menjangkaunya, apakah ia disalin ke sebuah cadangan yang hidup lebih lama daripada pewaktu penghapusannya, apa yang terjadi padanya kalau perusahaannya dijual atau dibobol. Tidak satu pun dari itu terlihat dari luar.

Jadi pertanyaan yang berguna bukan “apakah saya memercayai situs ini?” Melainkan **“apakah pekerjaan ini butuh file saya pergi sama sekali?”** Untuk sejumlah besar pekerjaan yang terus bertambah, jawabannya tidak, dan ketika jawabannya tidak, pertanyaan kepercayaannya berhenti menjadi pertanyaan yang harus Anda jawab.

## Apa sebenarnya yang dilakukan “unggah”

Ketika sebuah pengubah meminta Anda memilih sebuah file lalu menampilkan sebuah bilah kemajuan, peramban Anda sedang menyalin seluruh file-nya, byte demi byte, melintasi internet ke sebuah komputer milik orang lain. Komputer itu menulisnya ke sebuah disk, menjalankan pengubahannya, menulis hasilnya ke disk yang sama, lalu menyerahkan sebuah tautan kepada Anda.

Pada saat itu file Anda ada di setidaknya tiga tempat yang tidak Anda pilih: disk servernya, log apa pun yang merekam permintaannya, dan sering sebuah jaringan pengiriman konten yang menyinggahkan hasilnya supaya unduhannya cepat. Sebuah kebijakan penghapusan harus menjangkau ketiganya. Kebanyakan berkata mereka begitu. Anda tidak bisa memeriksa satu pun.

Layak diketahui juga: file-nya bukan satu-satunya yang tiba. Nama file-nya ikut serta, dan begitu juga semua di dalam file-nya yang tidak bisa Anda lihat. Foto yang langsung dari sebuah ponsel biasanya membawa koordinat GPS persis tempat ia diambil, waktunya, nomor seri kameranya, dan kadang sebuah gambar mini tersemat dari gambar aslinya sebelum Anda memangkasnya. Orang yang berhati-hati soal gambarnya sering tidak berhati-hati soal itu, karena tidak ada apa pun di layar yang menunjukkannya kepada mereka.

## Kenapa kebanyakan alat tetap mengunggah

Bukan karena mereka menginginkan file Anda. Melainkan karena sepanjang hampir seluruh usia web tidak ada alternatifnya. Sebuah peramban tidak bisa mendekodekan video, mengodekan ulang sebuah gambar pada kualitas pilihan, atau membaca sebuah format file; sebuah server dengan FFmpeg dan ImageMagick bisa. Mengunggah bukan model bisnis, ia satu-satunya tempat pekerjaannya bisa terjadi.

Itu berhenti benar belum lama ini dan secara diam-diam. Peramban kini mengirimkan WebAssembly, yang menjalankan kodek terkompilasi yang sama pada kecepatan mendekati asli, WebCodecs, yang membuka pengode video perangkat keras yang sudah ada di mesin Anda, dan sebuah Canvas API yang bisa mendekodekan dan mengodekan ulang gambar secara langsung. Pekerjaan yang dulu membutuhkan sebuah server kini berjalan di perangkat yang sudah memegang file-nya.

Banyak alat masih mengunggah, dan ada alasan yang jujur: sebuah alur kerja yang sudah ada yang tidak ingin ditulis ulang siapa pun, sebuah format yang tidak punya dekoder di sisi peramban, sebuah pekerjaan yang memang sungguh terlalu berat untuk sebuah ponsel. Ada juga alasan yang kurang jujur, yaitu bahwa sebuah server adalah tempat akun, kuota, dan paket berbayar tinggal. Alat yang berjalan sepenuhnya di peramban Anda sulit ditakar.

## Empat pemeriksaan yang bisa Anda jalankan sendiri

Semua ini bekerja pada alat mana pun, termasuk yang ini. Tidak satu pun menuntut menerima kata siapa pun tentang apa pun, dan yang pertama memakan sekitar sepuluh detik.

### 1. Cabut koneksinya

Muat halamannya, lalu matikan wifi Anda atau cabut kabelnya, dan coba pakai. Alat yang mengerjakan pekerjaannya di peramban Anda berjalan terus persis seperti sebelumnya. Alat yang mengunggah berhenti seketika, karena benda yang mengerjakan pekerjaannya tidak lagi terjangkau.

Inilah uji terkuat yang ada, dan yang paling sulit dipalsukan, karena ia tidak bisa dijawab dengan pilihan kata. Entah pengubahannya rampung tanpa jaringan entah tidak.

### 2. Perhatikan tab Network

Buka alat pengembang peramban Anda, pilih Network, lalu pakai alatnya. Setiap permintaan yang dibuat halamannya didaftar lengkap dengan ukurannya. Kalau foto 4 MB Anda diunggah, ada permintaan 4 MB di daftar itu. Kalau hal terbesar yang meninggalkan halamannya adalah beberapa kilobita iklan, ia tidak diunggah.

Urutkan menurut ukurannya lalu lihat bagian atasnya. Anda tidak perlu memahami permintaannya; Anda perlu menyadari apakah salah satunya seukuran file Anda.

### 3. Baca Content-Security-Policy-nya

Lihat sumber halamannya lalu cari `Content-Security-Policy`, dekat bagian atasnya. Ia sebuah daftar alamat yang boleh dihubungi halaman itu, dan ia ditegakkan peramban Anda alih-alih oleh niat baik situsnya — permintaan ke apa pun yang tidak ada di daftarnya ditolak, apa pun yang dicoba kodenya.

Arahan yang penting adalah `connect-src`, yang mengatur ke mana halamannya boleh mengirim data. Kalau ia menyebutkan sebuah alamat milik situs tempat Anda berada, halamannya bisa mengirim file Anda ke sana. Kalau ia tidak menyebutkan apa pun, atau hanya pihak ketiga seperti sebuah jaringan iklan, ia tidak bisa.

Halaman yang sama sekali tidak punya Content-Security-Policy bukan bukti hal yang buruk. Ia sekadar berarti pemeriksaan yang satu ini tidak punya apa-apa untuk diberitahukan kepada Anda.

### 4. Baca kodenya

Paling tidak praktis, paling meyakinkan. Kalau sebuah alat menerbitkan sumbernya lalu menyajikannya tanpa langkah bangun, file yang diambil peramban Anda adalah file yang bisa Anda baca. Cari di dalamnya `fetch`, `XMLHttpRequest`, dan `sendBeacon` — ketiga cara sebuah halaman bisa mengirim apa pun — lalu lihat apa yang diberikan kepada mereka.

Kebanyakan orang tidak akan melakukan ini. Tetap penting bahwa itu mungkin, karena klaim yang tidak bisa diperiksa siapa pun sebenarnya bukan klaim.

## Apa yang tidak berarti “berjalan di peramban Anda”

Layak dinyatakan dengan tepat, karena frasanya dipakai secara longgar dan situs ini harus memegang dirinya pada standar yang sama dengan yang diusulkannya.

- **Ia tidak berarti sama sekali tidak ada permintaan.** Halamannya sendiri tiba lewat jaringan, dan kebanyakan alat gratis membawa iklan atau analitik yang berbicara dengan seseorang. Klaimnya tentang *file* Anda, bukan tentang lalu lintas pada umumnya.
- **Ia tidak menyembunyikan alamat IP Anda.** Setiap situs yang Anda kunjungi melihatnya, yang ini termasuk. Pemrosesan setempat adalah tentang isi file Anda, bukan tentang keanoniman.
- **Ia tidak selamat dari sebuah fitur yang mengambil sesuatu.** Alat yang membiarkan Anda menempelkan sebuah alamat web harus menghubungi alamat itu, dan server itu mengetahui IP Anda dan apa yang Anda minta. Itu melekat pada fiturnya, bukan cacat di dalamnya — tapi ia sebuah pengecualian yang nyata dan sebuah alat sebaiknya mengatakannya terus terang alih-alih membulatkannya.
- **Ia tidak sama dengan “kami menghapus file Anda.”** Kalimat kedua tentang apa yang dipilih sebuah perusahaan untuk dilakukan. Yang pertama tentang apa yang secara teknis mungkin. Hanya satu di antaranya yang bisa diperiksa.

## Kapan mengunggah memang tidak masalah

Ini bukan argumen bahwa setiap unggahan adalah kekeliruan. Kirim file-nya ketika isinya tidak sensitif dan pekerjaannya lebih mudah begitu; ketika pekerjaannya memang sungguh terlalu berat untuk perangkat Anda; ketika formatnya tidak punya dekoder di sisi peramban; atau ketika Anda memakai sebuah layanan yang sudah punya hubungan dengan Anda dan yang ketentuannya memang sudah Anda baca.

Lebih berhati-hatilah ketika file-nya memuat sesuatu yang tidak akan Anda unggah ke publik: dokumen identitas, pindaian medis, kontrak, apa pun yang ada alamat atau wajah yang tidak Anda niatkan untuk dibagikan, atau sebuah foto yang data lokasinya belum Anda lihat. Untuk yang seperti itu, alat yang bisa Anda periksa layak lebih dipilih daripada alat yang harus Anda percayai — bukan karena yang dipercayai itu mungkin mengkhianati Anda, melainkan karena dengan yang bisa diperiksa, pertanyaannya tidak timbul.

## Bagaimana situs ini menjawab keempat pemeriksaan itu

Akan aneh sebuah panduan yang menyuruh Anda memeriksa lalu meminta dikecualikan. Jadi, berurutan:

- **Cabut koneksinya.** Buka alat mana pun di sini, putuskan koneksinya, dan ia terus bekerja. Setiap halaman alat punya penanda langsung yang memberi tahu Anda apakah Anda sedang daring, jadi Anda bisa memperhatikannya berubah.
- **Tab Network.** Ubah sesuatu lalu baca daftarnya. Tidak ada yang membawa file Anda, gambar mininya, namanya, ukurannya, atau apa pun yang dibaca darinya. Tidak ada peristiwa analitik khusus di situs ini yang punya satu pun dari itu untuk dikirim.
- **Content-Security-Policy.** Ia ada di bagian atas sumber setiap halaman. `connect-src` menyebutkan titik akhir iklan dan pengukuran milik Google serta tombol donasinya, dan tidak lebih. **Tidak ada alamat di daftar itu yang milik situs ini**, karena situs ini tidak punya server — ia file statis. Tidak ada tujuan bagi sebuah file untuk dikirim bahkan seandainya ada yang mencoba.
- **Kode.** Setiap barisnya [publik](https://github.com/A-Box-of-Tools/website). Proses bangunnya membuang komentar dan spasi dan tidak lebih, dan Anda bisa menjalankannya sendiri lalu membandingkan hasilnya dengan yang sedang disajikan.

Pengecualiannya, dinyatakan alih-alih dikubur: situs ini memasang iklan Google dan sebuah pencacah kunjungan, keduanya berbicara dengan Google dan tidak satu pun diberi apa pun tentang file Anda; dan alat [Gambar ke Video](https://abox.tools/id/gambar-ke-video/) bisa mengambil sebuah gambar dari alamat yang Anda tempelkan, yang berarti server itu melihat IP Anda. [Halaman privasinya](https://abox.tools/id/privasi/) memaparkan keduanya selengkapnya.

Setiap alat di sini bekerja seperti ini: sebuah [kompresor gambar](https://abox.tools/id/kompres-gambar/) yang memenuhi ukuran yang Anda sebutkan, sebuah [pemangkas video](https://abox.tools/id/pangkas-video/), sebuah [penampil dan penghapus EXIF](https://abox.tools/id/hapus-data-exif/) untuk data tersembunyi yang dijelaskan lebih jauh di halaman ini, [gambar ke video](https://abox.tools/id/gambar-ke-video/), dan [gambar ke PDF](https://abox.tools/id/gambar-ke-pdf/). Semuanya gratis, tanpa akun, dan tidak satu pun punya tujuan untuk mengirim file Anda.

![Panel pada halaman alat: satu baris yang menyebut berkas tidak pernah meninggalkan peramban, fakta-fakta yang menopangnya, dan pemeriksaan langsung yang melaporkan bahwa halaman ini tidak membuat permintaan jaringan apa pun.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

Pemeriksaan terakhir dari empat itu, dijawab di halaman dan bukan di sebuah paragraf: hitungannya dibuat oleh halaman tentang dirinya sendiri, dan hitungan yang sama bisa Anda buat di peramban Anda.
