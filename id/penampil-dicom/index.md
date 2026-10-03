# Penampil DICOM — buka pindaian .dcm di peramban Anda

CT, MR, rontgen, dan USG, lengkap dengan jendela, headernya, dan pengukurannya.

> Buka pindaian CT, MR, rontgen, dan USG di peramban Anda. Jendela dan levelnya, gulir satu seri utuh, ukur dalam milimeter, baca setiap tag DICOM, dan lihat persis apa di dalam file-nya yang mengenali pasiennya. Tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/penampil-dicom/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## pindaian Anda **tidak pernah diunggah**. Tidak ada server.

Pindaiannya dibuka dan didekodekan oleh peramban Anda sendiri: headernya, pikselnya, jendelanya, pengukurannya. Tidak ada server di ujung lain halaman ini untuk menerima informasi kesehatan yang dilindungi, bahkan seandainya ada di sini yang menginginkannya, dan tidak ada apa pun tentang file-nya - bukan nama pasiennya, bukan studinya, bukan nama file-nya - yang dibacakan kepada siapa pun.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka
- ✓ File tetap di perangkat Anda

## Cara membuka file DICOM

1. **Pilih file-nya.** Satu file `.dcm`, atau seluruh folder dari cakramnya — sebuah CT atau MR adalah satu file per irisan, dan menjatuhkan semuanya sekaligus itulah yang menyusun kembali serinya. File dibaca langsung dari disk Anda oleh peramban; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Pilih serinya.** Sebuah studi biasanya memuat beberapa: pindaian pendahulunya, lalu setiap akuisisinya. Masing-masing disusun dalam urutan pengambilan pemindainya, diperhitungkan dari letak setiap irisan di dalam tubuh pasiennya alih-alih dari penomorannya, yang tidak selalu berjalan ke arah yang sama.
3. **Atur jendelanya.** Inilah kendali yang membuat sebuah pindaian terbaca, dan yang tidak dimiliki sebuah penyunting gambar. Seret melintasi gambarnya untuk melebarkan jendelanya dan ke atas atau ke bawah untuk menggeser pusatnya, atau pilih salah satu jendela bernama — paru, tulang, otak, jaringan lunak — pada sebuah CT, tempat satuannya sama di setiap pemindai di dunia.
4. **Gulir tumpukannya.** Penggeser di bawah gambarnya berpindah melalui irisannya, dan tombol panah melakukan hal yang sama begitu Anda mengeklik gambarnya. File multi-bingkai — sebuah lup USG, sebuah angiogram — diputar dengan tombol di sebelahnya.
5. **Ukur sesuatu.** Beralihlah ke Ukur lalu seret sebuah garis. Kalau file-nya mengatakan seberapa jauh jarak antar pikselnya, jawabannya dalam milimeter dan memperhitungkan piksel yang tidak persegi; kalau file-nya tidak mengatakannya, jawabannya dalam piksel dan ia mengatakan begitu alih-alih mengarang sebuah skala.
6. **Baca headernya.** Setiap elemen di dalam file-nya, lengkap dengan nomornya, sebutannya menurut standarnya, dan isinya, bisa dicari. Di atasnya, daftar apa saja di file yang satu ini yang mengenali pasiennya — dan itu jauh lebih banyak daripada namanya.
7. **Ambil yang Anda butuhkan.** Bingkai di layar sebagai sebuah PNG, dengan jendela yang Anda setel dan tanpa apa pun yang terbakar ke dalamnya, atau seluruh headernya sebagai teks biasa. Keduanya dibangun di halaman ini dari yang sudah ada di atasnya.

## Versi lebih lengkap

[Cara membuka file DICOM, dan apa isinya](https://abox.tools/id/panduan/membuka-file-dicom/): Apa isi sebuah cakram rumah sakit, kenapa file-nya tidak punya ekstensi, bagaimana membuka pindaian .dcm di sebuah peramban, apa sebenarnya yang dilakukan jendela dan level, dan apa yang dibawa sebuah pindaian tentang pasiennya selain gambarnya.

## Juga ada di dalam kotak

- [Gambar ke ICO](https://abox.tools/id/buat-favicon/): Satu gambar masuk. Setiap ukuran yang diminta peramban, Windows, atau sebuah Mac, keluar.
- [Gambar ke Data URI](https://abox.tools/id/gambar-ke-base64/): Seluruh gambar sebagai satu baris teks. Tempelkan langsung ke CSS atau HTML.
- [SVG ke Gambar](https://abox.tools/id/svg-ke-png/): Sebutkan ukurannya. Sebuah vektor tidak punya ukuran sendiri untuk hilang.
- [Gambar ke SVG](https://abox.tools/id/gambar-ke-svg/): Satu bentuk, satu garis luar. Tunjuk saja yang seharusnya tidak ada.

## Pertanyaan

### Apakah pindaian saya diunggah ke suatu tempat?

Tidak. File-nya dibaca, didekodekan, dan digambar oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi jaringan dan ia tetap membuka pindaian. \
\
Di sini itu lebih berarti daripada di halaman mana pun lain di situs ini. File DICOM membawa nama pasiennya, tanggal lahirnya, dan nomor rumah sakitnya di dalam headernya, jadi mengunggah satu ke sebuah penampil berarti menyerahkan sebuah rekam medis kepada orang asing, bukan sebuah gambar.

### File DICOM yang mana saja yang bisa dibukanya?

File tanpa kompresi dalam ketiga sintaks transfer dasarnya — implicit dan explicit little endian, serta big endian yang sudah dipensiunkan — ditambah deflated, RLE Lossless, baseline JPEG, dan JPEG Lossless, yang dipakai untuk mengompres sebagian besar studi CT dan MR di sebuah cakram rumah sakit. \
\
Ia tidak bisa mendekodekan JPEG 2000, JPEG-LS, atau sintaks MPEG dan HEVC yang dipakai untuk video. Semua itu butuh kodek yang berupa pustaka terkompilasi berukuran megabita, dan halaman yang mengunduh satu saat dibutuhkan bukanlah halaman yang jalan tanpa internet. File dalam salah satunya tetap terbuka: seluruh headernya dibaca dan ditampilkan, dan gambarnya diganti dengan sebaris tulisan yang menyebutkan kodeknya, alih-alih dengan ikon gambar rusak yang tidak memberi tahu Anda apa-apa.

### Apa itu “jendela dan level”, dan kenapa saya membutuhkannya?

Sebuah irisan CT menyimpan sekitar empat ribu nilai berbeda dan layar Anda menampilkan dua ratus lima puluh enam abu-abu. Jendelanya adalah pilihan bagian mana dari rentang itu yang mendapat semuanya: semua di bawahnya hitam, semua di atasnya putih, dan yang di antaranya disebar ke seluruh abu-abunya. \
\
Itulah sebabnya file yang sama tampak seperti pindaian yang berbeda di bawah dua setelan, dan sebabnya paru dan tulang tidak bisa dilihat sekaligus. Pada sebuah CT angkanya adalah satuan Hounsfield, yang didefinisikan secara mutlak — air adalah 0 dan udara adalah −1000 — jadi jendela bernama di halaman ini adalah angka yang sama yang dipakai seorang radiolog di stasiun kerjanya. Pada sebuah MR atau USG tidak ada skala semacam itu, dan jendela yang terbuka adalah jendela yang diminta file-nya sendiri.

### Kenapa ia bilang pengukuran saya dalam piksel?

Karena file itu tidak mengatakan seberapa besar sebuah pikselnya. Pixel Spacing (0028,0030) adalah yang membawa itu, dalam milimeter, dan sangat banyak gambar USG, dokumen hasil pindaian, dan secondary capture memang tidak memilikinya. \
\
Kalau ia ada, pengukurannya dalam milimeter dan setiap sumbunya diukur dengan jaraknya sendiri, dan itu penting pada gambar yang pikselnya tidak persegi. Kalau ia tidak ada, jawaban yang jujur adalah hitungan piksel, dan ini mengatakannya alih-alih memilih sebuah skala lalu menyajikan hasilnya sebagai sebuah panjang.

### Ia membuka folder saya sebagai beberapa seri. Kenapa?

Karena memang itu isinya. Sebuah studi terdiri dari seri — pindaian pendahulunya, lalu setiap akuisisi atau rekonstruksinya — dan setiap file mengatakan ia milik yang mana di Series Instance UID (0020,000E). Daftar pilihannya dibangun dari itu alih-alih dari foldernya, yang biasanya memuat semuanya tercampur dalam satu daftar nama. \
\
Di dalam sebuah seri, irisannya diurutkan menurut letak masing-masing di dalam tubuh pasiennya, diperhitungkan dari Image Position dan Image Orientation. Instance Number adalah kunci yang gamblang dan ia menjadi cadangan alih-alih pilihan pertama: ia ditetapkan oleh apa pun yang menulis file-nya dan tidak harus berjalan ke arah yang sama dengan tubuh pasiennya.

### Apa maksud daftar “apa yang mengenali pasiennya”?

Itu setiap kolom di file Anda yang menamai orang di dalam pindaian itu, atau yang mempersempit siapa dia mungkin, dibaca dari file ini di mesin Anda. Daftarnya berasal dari PS3.15 standar DICOM — bagian yang mengatakan apa saja yang harus hilang sebelum sebuah kumpulan data bisa disebut sudah dinirkenalkan. \
\
Ia ada di sana karena yang salah dipahami orang bukanlah bahwa sebuah pindaian memuat sebuah nama. Melainkan berapa banyak lagi yang dimuatnya: tanggal lahirnya, nomor aksesinya, dokter yang merujuk, institusinya, nomor seri pemindainya, dan UID studinya, yang merupakan kunci sempurna kembali ke arsip yang membuat file itu. Pindaian yang namanya sudah dikosongkan dan tidak lebih dari itu tidaklah anonim. \
\
Alat ini hanya menunjukkan kepada Anda. Ia tidak menulis apa pun dan tidak mengubah apa pun, jadi ia tidak bisa mengeluarkan satu pun darinya.

### Bisakah ia menganonimkan sebuah pindaian?

Tidak, dan ia sengaja tidak berpura-pura bisa. Halaman ini membaca; ia tidak punya kode yang menulis sebuah file DICOM. Yang dilakukannya adalah memberi tahu Anda persis apa yang ada di dalam punya Anda, dan itulah bagian yang sulit dicari tahu dan bagian yang salah dipahami orang. \
\
Alat yang mengeluarkan pengenalnya adalah pekerjaan terpisah dengan tuntutan yang jauh lebih tinggi — ia harus menulis ulang file-nya tanpa menyentuh pikselnya, mengganti UID-nya secara konsisten di seluruh satu studi, dan tepat soal elemen privat yang dipakai sebagian pemindai untuk menyembunyikan salinan kedua namanya. Ia ada di peta jalan situs ini alih-alih ditempelkan ke sebuah penampil.

### Bisakah ia membuka file tanpa ekstensi .dcm, atau yang rusak?

Bisa, keduanya. Ekstensinya tidak dilihat: yang diperiksa adalah file-nya sendiri. Kumpulan data yang ditulis tanpa pembuka 128 byte yang biasa — dan begitulah rupa sebuah pindaian yang ditarik langsung dari jaringan — dibaca dengan memperhitungkan pengodeannya dari elemen pertamanya, dan halamannya mengatakan bahwa itulah yang dilakukannya. \
\
File yang berakhir di tengah jalan dibaca sejauh ia sampai. Semua yang sebelum kerusakannya ditampilkan, dengan catatan yang menyebutkan di byte mana ia berhenti. Itulah justru kasus yang paling membutuhkan sebuah penampil, jadi membuang seluruh file-nya gara-gara dua belas byte terakhirnya akan menjadi perilaku yang keliru.

### Apakah ini penampil diagnostik?

Bukan. Ia bukan perangkat medis, ia belum melewati penilaian regulasi apa pun, dan tidak ada di sini yang boleh dipakai untuk membuat keputusan klinis. Layar Anda tidak terkalibrasi, peramban bukan rantai penggambaran yang tervalidasi, dan tidak satu pun dari keduanya bisa dibereskan dari dalam sebuah halaman web. \
\
Ia bagus untuk semua hal lain yang membuat orang membuka sebuah pindaian: memeriksa apa yang ada di sebuah cakram, mengambil sebuah irisan untuk bahan ajar atau sebuah makalah, membaca sebuah header, mencari tahu kenapa program lain menolak file-nya, dan melihat apa yang dibawa sebuah pindaian tentang orang di dalamnya.

### Apakah ia mengubah file saya?

Tidak. Alat ini hanya membaca. Tidak ada file keluaran, tidak ada pengodean ulang, dan tidak ada tombol di sini yang menulis sebuah DICOM — yang bisa Anda unduh adalah sebuah PNG dari bingkai di layar dan salinan teks biasa dari headernya. Berkas asli Anda tetap tak tersentuh di disk Anda.

### Apakah gratis, dan apakah saya perlu akun?

Gratis; tidak ada akun, tidak ada masuk, dan tidak ada masa uji coba. Tidak ada batas ukuran file atau berapa banyak file yang Anda buka selain memori mesin Anda sendiri. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang file Anda.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet dan ia terus bekerja. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diunggah: alat yang mengirim pindaian Anda pergi untuk digambar akan berhenti pada saat Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Pindaian Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada. Dulu di sini tertulis `connect-src 'none'`, yang mutlak; menambahkan iklan mengorbankan itu, dan mengatakannya adalah bagian dari kesepakatannya.
- **Ini lebih penting di sini daripada di halaman lain.** File DICOM bukan sebuah gambar dengan sedikit metadata di atasnya. Ia sebuah rekam medis dengan sebuah gambar di dalamnya: nama pasiennya, tanggal lahirnya, nomor rumah sakitnya, nomor aksesinya, dokter yang merujuk, institusinya, dan nomor seri pemindainya semuanya adalah kolom di dalam headernya, dan semuanya bepergian bersama file-nya ke mana pun ia pergi. Mengunggah satu ke sebuah situs web untuk melihatnya berarti menyerahkan semua itu kepada siapa pun yang menjalankan situs itu. Itulah hal yang justru tidak dilakukan halaman ini.
- **Pembacanya adalah empat belas file di repositori ini.** Tidak ada di sini yang memakai pustaka yang diambil dari mana pun. `src/dicom.js` menyusuri file-nya, `src/dictionary.js` tahu tagnya disebut apa, `src/pixels.js` mengubah byte-nya kembali menjadi pengukuran, `src/rle.js` dan `src/jpeg-lossless.js` membuka dua bentuk terkompres yang bisa didekodekan halaman ini, dan `src/window.js` memetakan yang terukur ke abu-abu di layar Anda.
- **Pengenalnya didaftar untuk Anda, dan untuk tidak seorang pun lainnya.** Halaman ini mencetak setiap kolom di file Anda yang menamai atau mempersempit siapa orang di dalamnya, karena itu pertanyaan yang butuh jawaban bagi orang yang hendak membagikan sebuah irisan dan tidak ada penampil yang menjawabnya. Ia ditaruh di layar di hadapan Anda dan tidak pergi ke tempat lain: tidak ada peristiwa analitik di repositori ini yang membawa satu pun darinya, dan halaman ini tidak akan bisa mengirimnya seandainya ada.
- **Ia membaca. Ia tidak menulis.** Tidak ada tombol di sini yang mengubah file Anda, dan tidak ada kode yang bisa. Yang bisa Anda bawa pulang adalah sebuah PNG dari bingkai di layar dan sebuah salinan teks dari headernya, keduanya dibangun di halaman ini dari yang sudah ada di atasnya. Berkas asli Anda tetap tak tersentuh di disk Anda, dan itu juga jawaban jujur untuk apa yang terjadi kalau Anda menutup tabnya.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang file Anda: bukan pikselnya, bukan gambar mininya, bukan sebuah nama, sebuah tag, seorang pasien, atau sebuah nama file. Setiap baris yang membaca, mendekodekan, atau menggambar sebuah pindaian disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di headernya digambar oleh sebuah skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia sebuah tautan dan tidak lebih: ia tidak melaporkan kunjungan, dan ia tidak diberi apa pun tentang Anda atau file Anda. Tidak ada yang terjadi kecuali Anda mengekliknya, dan yang akan Anda tuju lewat klik itu adalah situs orang lain.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan setiap bagian halaman ini tetap bekerja. Itulah bukti yang paling sederhana: alat yang mengirim pindaian Anda pergi untuk digambar akan berhenti pada saat Anda mencabut koneksi.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/dicom.js` untuk pembaca yang menyusuri file-nya, `src/pixels.js` untuk pendekodean pikselnya, `src/jpeg-lossless.js` untuk kodek yang dipakai kebanyakan ekspor rumah sakit, dan `src/window.js` untuk jendela dan levelnya — tidak satu pun punya baris yang bisa menjangkau jaringan.
