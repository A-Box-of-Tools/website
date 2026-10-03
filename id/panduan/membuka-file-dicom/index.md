# Cara membuka file DICOM, dan apa isinya

Cakram rumah sakit adalah sebuah folder berisi file tanpa ekstensi dan sebuah penampil yang ditulis untuk Windows XP. File-nya DICOM, dan tidak ada yang aneh tentangnya: sebuah pindaian adalah sebuah header penuh kolom dan sebuah blok piksel. Inilah cara melihatnya, apa arti kendalinya, dan apa lagi yang dibawa file-nya selain gambarnya.

[Buka Penampil DICOM](https://abox.tools/id/penampil-dicom/): CT, MR, rontgen, dan USG, lengkap dengan jendela, headernya, dan pengukurannya.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Penampil DICOM](https://abox.tools/id/penampil-dicom/) lalu seret seluruh folder file-nya ke atasnya. Mereka dibaca di mesin Anda sendiri, dikembalikan ke seri asalnya, lalu disusun dalam urutan pengambilan pemindainya. Tidak ada yang diunggah, dan tidak ada yang ditulis kembali ke file Anda.

Kalau Anda diberi sebuah cakram dan bertanya-tanya file yang mana yang harus dibuka: semuanya, sekaligus. Sebuah CT atau MR bukan satu file. Ia satu file per irisan, dan sebuah studi dada adalah tiga ratus di antaranya.

## Apa isi sebuah cakram rumah sakit

Biasanya empat hal, dan hanya satu di antaranya yang penting.

- **Sebuah folder pindaian**, sering bernama `DICOM`, `IMAGES`, atau `ST0001`, berisi file bernama `IM000001`, `I0000001`, atau sebuah angka panjang bertitik. Sering kali sama sekali tanpa ekstensi. Inilah pindaiannya.
- **Sebuah file bernama `DICOMDIR`**. Sebuah indeks atas sisanya, ditulis supaya sebuah penampil bisa mendaftar studi di cakramnya tanpa membuka setiap file. Anda tidak membutuhkannya.
- **Sebuah penampil**, sebagai sebuah eksekutabel Windows, sebuah entri autorun, atau sesekali sebuah applet Java. Ia dikompilasi untuk apa pun yang berlaku ketika cakramnya dibakar, dan itulah sebabnya begitu banyak di antaranya tidak lagi berjalan.
- **Sebuah halaman HTML atau PDF** berlogo rumah sakitnya, yang menjelaskan cara menjalankan penampilnya.

Pindaiannya tidak membutuhkan penampilnya. Formatnya adalah standar yang diterbitkan dan file-nya terbaca sendiri; eksekutabel di cakramnya adalah satu program yang bisa membacanya, bukan satu-satunya.

## Kenapa file-nya tidak punya ekstensi

Karena DICOM tidak membutuhkannya. Setiap file membawa penandanya sendiri: 128 byte ketiadaan, lalu keempat huruf `DICM`, lalu sebuah blok kecil kolom yang menggambarkan bagaimana sisa file-nya ditulis. Sebuah pembaca memeriksa keempat huruf itu alih-alih nama yang berakhiran `.dcm`.

Dan itu juga sebabnya menamai ulang sebuah file menjadi `.dcm` tidak mengubah apa pun, dan sebabnya penampil yang bersikeras meminta ekstensinya bersikap ketat tanpa perlu. File yang ditulis langsung dari jaringan rumah sakit bahkan tidak punya 128 byte dan penandanya — mereka data telanjang tanpa apa pun di depannya, dan sebuah pembaca harus memperhitungkan bagaimana mereka dikodekan dari kolom pertamanya. Itu file yang normal, bukan yang rusak.

## Jendela dan level, kendali yang penting

Inilah satu hal yang membuat sebuah gambar medis berbeda dari sebuah foto, dan alasan sebuah penyunting gambar tidak berguna untuk melihatnya.

Sebuah irisan CT menyimpan sekitar empat ribu nilai berbeda. Layar Anda menampilkan dua ratus lima puluh enam abu-abu. Sesuatu harus memutuskan empat ribu yang mana memetakan ke dua ratus lima puluh enam yang mana, dan keputusan itulah **jendelanya**: semua di bawahnya hitam, semua di atasnya putih, dan rentang di antaranya disebar ke seluruh abu-abunya.

Geser jendelanya dan file yang sama tampak seperti pindaian yang berbeda. Itu bukan artefak penggambaran, itu intinya. Paru dan tulang sama-sama ada di irisannya dan tidak bisa dilihat pada saat yang sama: jendela yang menampilkan tekstur paru yang mengembang membuat setiap tulang putih murni, dan jendela yang menampilkan detail trabekula di sebuah iga membuat seluruh parunya hitam murni.

Pada sebuah CT, angkanya adalah **satuan Hounsfield**, dan mereka didefinisikan secara mutlak alih-alih per pemindai: air adalah 0 dan udara adalah −1000, menurut definisinya, di setiap pemindai CT di dunia. Itulah sebabnya sebuah penampil bisa menawarkan jendela bernama — paru, tulang, otak, jaringan lunak — dan membuatnya berarti hal yang sama pada file Anda seperti pada stasiun kerja tempat pindaiannya dibaca. Yang biasa:

- **Jaringan lunak** — pusat 40, lebar 400.
- **Paru** — pusat −600, lebar 1500.
- **Tulang** — pusat 300, lebar 1500.
- **Otak** — pusat 40, lebar 80. Yang sempit, karena materi kelabu dan materi putih hanya berbeda beberapa satuan.

Pada sebuah MR tidak ada skala seperti itu. Nilainya tergantung sekuensnya, koilnya, dan pemindainya, jadi tidak ada yang bisa dijadikan nama sebuah prasetel dan jendela awalnya adalah jendela yang diminta file-nya sendiri. Setiap pindaian membawa sebuah saran.

![Penampil: irisan pindaian dalam skala abu-abu dengan kendali jendela dan aras di sebelahnya, prasetel untuk rentang jaringan yang lazim, dan keterangan studi di sudut-sudutnya.](https://abox.tools/screens/open-a-dicom-file/viewer.webp)

Jendela dan aras adalah dua kendali yang penting. Sebuah pindaian memuat lebih banyak nuansa daripada yang bisa ditampilkan layar, dan keduanya menentukan yang mana yang sedang Anda lihat.

## Kenapa irisannya kadang tergulir ke arah yang salah

Sebuah penampil harus memutuskan urutan apa yang dipakai menaruh file-nya, dan ada dua hal di file-nya yang bisa dipakainya.

**Instance Number** adalah sebuah pencacah. Ia pilihan yang gamblang dan ia ditetapkan apa pun yang menulis file-nya, yang tidak harus menomorinya ke arah tubuh pasiennya membujur. Studi yang direkonstruksi dari kaki ke atas lalu dinomori dari kepala ke bawah tergulir mundur, dan seri yang dirakit dari dua rekonstruksi bisa mengulangi nomornya terang-terangan.

**Image Position (Patient)** adalah di mana irisannya secara fisik berada, dalam milimeter, dalam sebuah sistem koordinat yang terpaku pada pasiennya alih-alih pada pemindainya. Mengurutkan menurut itu benar apa pun yang dilakukan penomorannya, dan ia punya efek samping yang berguna: begitu irisannya berada dalam urutan fisik, jarak di antaranya bisa diukur, jadi sebuah penampil bisa memberi tahu Anda bahwa irisannya berjarak 5 mm — dan menyadari ketika salah satunya hilang, dan itu tidak pernah dikatakan file-nya.

## Mengukur sesuatu

Pindaian adalah data terukur, jadi sebuah panjang di atasnya adalah panjang yang sungguhan — kalau file-nya mengatakan seberapa jauh jarak antar pikselnya. Itu satu kolom, Pixel Spacing, dalam milimeter, dan ia ada di pada dasarnya setiap CT dan MR.

Ia sering hilang pada gambar USG, pada dokumen hasil pindaian, dan pada tangkapan layar yang disimpan sebagai DICOM. Ketika ia hilang, tidak ada jawaban yang jujur dalam milimeter, dan penampil yang tetap memberi satu sudah mengarang sebuah skala. Hitungan piksel adalah jawaban yang benar untuk pertanyaan yang tidak bisa dijawab file-nya.

Waspadai juga piksel yang tidak persegi, dan itu normal di luar CT. Mengukur dalam piksel lalu mengalikan dengan satu angka jarak benar hanya ketika keduanya sepakat; setiap sumbu harus diukur dengan jaraknya sendiri.

## Apa yang dibawa sebuah pindaian selain gambarnya

Inilah bagian yang salah dipahami orang, dan alasan untuk berhati-hati dengan file seperti ini.

File DICOM bukan sebuah gambar dengan sedikit metadata terlampir. Ia sebuah rekam medis dengan sebuah gambar di dalamnya. Headernya adalah sebuah daftar kolom, dan pada pindaian klinis yang lazim ia menyimpan:

- nama pasiennya, nomor rumah sakitnya, tanggal lahirnya, dan jenis kelaminnya;
- nomor aksesinya, yang merupakan kunci ke permintaan di dalam sistem rumah sakitnya;
- dokter yang merujuk, radiografer yang mengerjakan, radiolog yang membacakan;
- institusinya, alamatnya, dan departemennya;
- pabrikan pemindainya, modelnya, dan nomor serinya;
- tanggal dan waktu pindaiannya sampai ke detik;
- dan sekumpulan pengenal unik — studi, seri, instans — yang merupakan kunci sempurna kembali ke arsip asalnya.

File mana pun yang diberikan kepada Anda membawa semua itu, dan ia bepergian bersama file-nya ke mana pun file-nya pergi. Menghapus namanya tidak cukup: sebuah tanggal lahir, sebuah institusi sebesar satu kode pos, dan sebuah waktu pindaian mengenali satu orang kira-kira sebaik sebuah nama, dan UID studinya mengenali mereka dengan persis bagi siapa pun yang punya akses ke arsipnya.

Sebagian pemindai juga menyimpan salinan kedua nama pasiennya di sebuah kolom privat, yaitu kolom yang maknanya tidak diterbitkan di mana pun dan yang dibiarkan kebanyakan penganonim karena mereka tidak bisa tahu apa isinya.

![Kartu yang mendaftar apa saja di berkas itu yang menunjuk pasiennya: namanya, nomor pengenalnya, tanggal lahirnya, dan keterangan studinya.](https://abox.tools/screens/open-a-dicom-file/identity.webp)

Apa yang dibawa sebuah pindaian selain gambarnya. Inilah kartu yang menjelaskan mengapa berkas seperti ini tidak layak dikirim lewat surel.

## Jangan mengunggah pindaiannya untuk melihatnya

Cara yang biasa masalah ini diselesaikan adalah pencarian “dicom viewer online” dan sebuah kotak unggahan. Yang baru saja terjadi adalah seorang asing punya salinan sebuah rekam medis: pikselnya, namanya, tanggal lahirnya, nomor rumah sakitnya, dan kunci kembali ke arsipnya.

Tidak ada alasan untuk itu. Membaca file DICOM adalah membaca sebuah header dan membongkar beberapa bilangan bulat, dan sebuah peramban melakukan itu dengan sangat baik, dan itulah sebabnya [penampil di sini](https://abox.tools/id/penampil-dicom/) sama sekali tidak punya fitur jaringan: tidak ada `fetch`, tidak ada `XMLHttpRequest`, tidak ada apa pun yang bisa mengirim sebuah file bahkan seandainya ada yang mencoba. Muat halamannya sekali, putuskan koneksi internet, dan ia terus membuka pindaian.

[Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan cara memeriksa klaim itu di situs ini atau di mana pun lain. Inilah jenis file yang paling layak diperiksa.

## Apa yang tidak bisa dilakukan sebuah peramban

Dua hal, dan keduanya layak dinyatakan terus terang.

**Ia bukan penampil diagnostik.** Layar Anda tidak terkalibrasi, perambannya bukan rantai penggambaran yang tervalidasi, dan tidak ada halaman web yang sudah melewati penilaian regulasi. Membaca sebuah pindaian untuk membuat keputusan klinis adalah pekerjaan bagi stasiun kerja tempat ia dibacakan. Melihat apa yang ada di cakramnya, menarik sebuah irisan untuk bahan ajar, membaca sebuah header, atau mencari tahu kenapa program lain menolak file-nya semuanya alasan yang sangat baik untuk membuka satu di sebuah peramban.

**Sebagian pindaian terkompres tidak akan terdekodekan.** DICOM mengizinkan beberapa skema kompresi dan peramban mewujudkan salah satunya. File polos, yang berkode run-length, baseline JPEG, dan JPEG Lossless — yang dipakai kebanyakan ekspor rumah sakit — semuanya terbuka. JPEG 2000, JPEG-LS, dan format videonya butuh kodek yang berupa pustaka terkompilasi berukuran megabita. Ketika gambarnya tidak bisa didekodekan, headernya tetap sepenuhnya terbaca, dan itu biasanya separuh yang toh Anda cari.
