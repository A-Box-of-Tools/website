# Bisakah agen AI memakai alat ini?

Bisa. Semuanya halaman web biasa, tanpa akun, tanpa captcha, dan setiap kontrolnya berlabel, sehingga agen menjalankannya seperti menjalankan yang lain. Pertanyaan yang pantas mendapat satu halaman ada di baliknya: saat Anda menyerahkan urusan file kepada agen, ke mana file itu pergi? Jawabannya sepenuhnya bergantung pada di mana peramban si agen berjalan.

Terakhir diperbarui 6 September 2026

## Jawaban singkatnya

Bisa. Setiap alat di sini adalah halaman web biasa: pemilih file, beberapa kontrol berlabel, tombol unduh. Tidak ada akun untuk masuk, tidak ada captcha untuk dipecahkan, tidak ada langkah yang khusus membutuhkan manusia. Agen AI yang punya peramban menjalankan halaman-halaman ini seperti menjalankan halaman lain mana pun — dan beberapa hal yang memang sudah dikerjakan situs ini untuk manusia ternyata ikut melayani agen secara cuma-cuma; bagian terakhir mendaftarnya.

Tetapi “bisakah ia menekan tombolnya” adalah pertanyaan kecil. Yang pantas mendapat satu halaman: apa yang terjadi pada janji situs ini — *file Anda tidak pernah meninggalkan mesin Anda* — ketika mesin yang menekan tombol itu bukan Anda? Jawabannya: janji itu selamat dari pendelegasian secara utuh, atau tidak selamat sama sekali, bergantung pada satu hal saja — **di mana peramban si agen berjalan.**

## Dua macam agen, satu pembeda

Agen yang memakai alat datang dalam dua rupa, dan perbedaan di antara keduanya lebih berbobot daripada apa pun di halaman ini.

**Agen lokal** berjalan di mesin Anda: asisten yang terpasang di komputer Anda, atau yang mengemudikan peramban yang sedang Anda pandangi. Saat agen semacam itu membuka alat di sini dan menyodorkan file Anda, pekerjaannya terjadi di tempat pekerjaan itu selalu terjadi dengan halaman-halaman ini — di sebuah peramban, di atas perangkat keras Anda. File dibaca dari disk Anda, diolah di memori peramban Anda, lalu ditulis kembali ke disk Anda. Pendelegasian tidak mengubah apa pun dari jalur yang ditempuh byte-byte itu. AI yang memilih pengaturannya; file-nya tetap tidak pernah pergi.

**Agen awan** menjalankan peramban di komputer vendornya. Anda melampirkan file ke sebuah obrolan, agen bekerja di mesin virtual di tempat lain, dan apa pun yang ia lakukan dengan alat-alat ini terjadi di sana. Alat-alatnya tetap berperilaku persis seperti yang dijanjikan — file tidak pergi lebih jauh dari peramban tempatnya berada — tetapi peramban itu bukan milik Anda, dan pengunggahan sudah terjadi pada saat Anda melampirkan file, sebelum alat mana pun dibuka. Tidak ada halaman yang bisa membatalkan pengunggahan yang mendahuluinya.

Jadi pertanyaan yang terus diajukan situs ini — apakah pekerjaan ini membutuhkan file saya pergi? — tidak lenyap saat pekerjaan itu dikerjakan agen. Ia hanya maju satu langkah, ke pemilihan agennya. Agen lokal yang mengemudikan alat yang hidup sepenuhnya di peramban adalah susunan langka tempat mendelegasikan tidak memakan privasi sama sekali: AI yang bekerja, dan file tetap di rumah.

## Cara menyerahkan pekerjaan kepada agen

Agen bekerja paling baik dengan arahan yang sama seperti yang diinginkan rekan kerja: alatnya, filenya, dan seperti apa rupa selesai. Beberapa pola yang berhasil:

- **Sebutkan hasilnya, bukan cuma alatnya.** “Buka abox.tools/kompres-gambar/ dan buat foto ini di bawah 200 KB” memberi agen angka yang akan diminta halaman itu. [Pengompres gambar](https://abox.tools/id/kompres-gambar/) menerima ukuran sasaran secara eksplisit — persis jenis instruksi yang bisa dibawa agen dengan setia.
- **Tunjukkan petanya.** Situs ini menerbitkan [llms.txt](https://abox.tools/llms.txt): setiap alat dan setiap panduan, masing-masing dengan satu baris keterangan, sebagai teks polos dalam satu kali ambil. Agen yang membacanya tahu apa saja yang ada di sini tanpa menjelajahi apa pun. Dan setiap halaman punya kembaran di alamatnya sendiri dengan `index.md` di ujungnya: halaman itu dalam bentuk Markdown, tanpa antarmuka di sekelilingnya, untuk agen yang ingin tahu apa yang dikatakan halaman sebuah alat, bukan seperti apa tampilannya.
- **Biarkan ia membaca halaman tempatnya berada.** Setiap alat membawa tanya-jawabnya di halaman itu sendiri, dan setiap alat punya panduan yang berjarak satu tautan. Agen yang tampak ragu pada sebuah pengaturan bisa disuruh membaca panduannya dulu — nasihat yang sama yang akan diterima manusia.
- **Rangkaian pekerjaan jalan.** Pekerjaan yang digambarkan panduan alur situs ini untuk manusia — memindai lalu menggabungkan menjadi [PDF](https://abox.tools/id/gambar-ke-pdf/); membuang data [EXIF](https://abox.tools/id/hapus-data-exif/) lalu mengubah ukuran — adalah pekerjaan yang paling dikuasai agen, karena keluaran tiap langkah adalah masukan langkah berikutnya dan tidak ada apa pun di antaranya yang menuntut pertimbangan.

## Yang jangan didelegasikan

Agen bisa menjalankan semua alat di sini. Ada dua tempat di mana menjalankan bukanlah seluruh pekerjaan, dan sisanya sebaiknya tetap pada Anda.

**Memutuskan apa yang tidak boleh terlihat.** Alat-alat penyensor menghapus apa yang Anda tutup — tetapi memilih apa yang ditutup, itulah pekerjaannya, dan agen yang terlewat satu baris telah menghasilkan file yang tampak selesai padahal belum. Silakan biarkan agen mengoperasikan penyensornya; hasilnya periksa sendiri sebelum pergi ke mana pun — aturan yang sama yang diberikan panduan alat-alat itu kepada operator manusia.

**Membuka apa yang sudah dibaca.** Pembaca kode QR situs ini menolak membuka apa yang diuraikannya, karena membaca dan mengikuti adalah dua tindakan berbeda. Pemisahan yang sama layak dikenakan pada agen: agen yang membaca kode, tautan, atau alamat di dalam file semestinya melaporkannya, bukan mengunjunginya. Dan agen yang mengemudikan peramban Anda sendiri sedang memegang semua akun yang sedang masuk di peramban itu — alasan untuk menatapnya dengan sorot mata yang sama kritisnya seperti pada alat mana pun, yang menjadi pokok bagian berikutnya.

## Agen pun bisa memeriksa janjinya

Empat pemeriksaan yang diajarkan panduan tentang [mengunggah file](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) — cabut jaringannya, awasi tab Network, baca Content-Security-Policy, baca kodenya — semuanya bisa dijalankan agen, dan bagi agen malah lebih mudah daripada bagi manusia: membaca header CSP atau menggeledah sumber yang disajikan untuk mencari panggilan `fetch` adalah kerja mekanis. Jika Anda memakai agen untuk memeriksa alat sebelum memercayainya, situs ini berharap diperiksa dengan cara yang sama — dan perilaku offline yang menjadi sandaran pemeriksaan itu punya [halamannya sendiri](https://abox.tools/id/panduan/bagaimana-halaman-web-bekerja-offline/).

Apa yang dilakukan situs ini untuk agen, dilakukannya dengan sengaja dan untuk semua orang: setiap kontrol berlabel, karena pembaca layar butuh nama dan agen membaca nama yang sama; halaman-halamannya tak punya akun, tak punya popup, tak punya dinding persetujuan yang harus dihindari; kode sumbernya publik dan disajikan tanpa tahap build, sehingga kode yang diaudit agen adalah kode yang berjalan; dan [llms.txt](https://abox.tools/llms.txt) adalah seisi kotak dalam satu kali ambil. Tidak satu pun dari itu ditambahkan demi mesin. Halaman yang terbaca oleh manusia dengan pembaca layar ternyata terbaca juga oleh segala yang lain.

Satu batas yang jujur: halaman ini tentang agen yang memakai alat-alat ini, bukan tentang agennya sendiri. Apa yang dilihat vendor si agen — instruksi Anda, tangkapan layar Anda, kadang file Anda — adalah pertanyaan tersendiri, dan kebiasaan yang terus-menerus disimpulkan kelompok panduan ini adalah kacamata yang tepat juga untuk itu: tanyakan apa yang sungguh perlu meninggalkan mesin Anda, dan dalam keadaan bagaimana.
