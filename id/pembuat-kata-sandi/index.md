# Kata sandi dan frasa sandi — acak dan kuat, dibuat di peramban Anda

Dibuat di sini, oleh peramban Anda sendiri, dan tidak pernah dikirim ke mana pun. Tidak ada yang disimpan dan tidak ada riwayat.

> Buat kata sandi acak yang kuat, atau frasa sandi diceware dari daftar 7.776 kata yang disertakan. Ditarik oleh generator kriptografis milik peramban Anda sendiri, tidak pernah dikirim ke mana pun, tidak pernah disimpan. Gratis, tanpa pendaftaran.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/pembuat-kata-sandi/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## kata sandi dan frasa sandi Anda **tidak pernah diunggah**. Tidak ada server.

Setiap karakter datang dari `crypto.getRandomValues`, generator kriptografis milik peramban sendiri, dan setiap kata dari daftar yang ikut di folder ini sebagai `src/wordlist.js`. Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`, jadi tidak ada jalur kode yang bisa membuat kata sandi yang dibuat di sini sampai kepada kami atau siapa pun — dan tidak ada yang ditulis ke penyimpanan juga, jadi memuat ulang halaman ini menghancurkan setiap kata sandi yang pernah ditampilkannya kepada Anda.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tidak ada yang disimpan
- ✓ Jalan tanpa internet
- ✓ Sumber terbuka

## Cara membuat kata sandi yang kuat tanpa dilihat sebuah situs web

1. **Pilih kata sandi atau frasa sandi.** Kata sandi adalah deretan karakter acak: pendek untuk disimpan, merepotkan untuk diketik, dan justru tepat untuk ratusan akun yang diisikan pengelola kata sandi Anda. Frasa sandi adalah kata-kata yang ditarik acak dari sebuah daftar: lebih panjang, tapi bisa diingat dan diucapkan, dan itulah yang Anda butuhkan untuk segelintir rahasia yang harus Anda ketik dari ingatan — kata sandi utama pengelola kata sandi itu sendiri, laptop Anda, kode pemulihan ponsel Anda.
2. **Tetapkan panjangnya, atau jumlah katanya.** Inilah setelan yang penting dan yang lain sebagian besar tidak. Dua puluh karakter, atau enam kata, adalah dasar yang masuk akal untuk apa pun yang layak dilindungi; naikkan dari situ untuk akun yang bisa dipakai orang untuk menyetel ulang semua akun lain. Bacaan di bawahnya bergerak saat Anda menyeret, jadi Anda bisa melihat apa yang dibeli setiap karakter tambahan.
3. **Nyalakan aturan yang akan dipaksakan formulirnya.** “Setidaknya satu dari masing-masing”, satu angka di akhir, satu simbol dari daftar pendek yang diterima setiap situs. Tidak satu pun dari ini membuat apa pun lebih kuat — yang pertama justru membuatnya sedikit lebih lemah, dan halaman ini sudah menguranginya — tapi itulah cara Anda lolos dari formulir pendaftaran tanpa membuat enam kali berturut-turut.
4. **Baca angkanya, bukan warnanya.** Bit-nya dihitung dari setelan yang menghasilkan string itu: besarnya alfabet, jumlah tarikan, dan tidak lebih. Itu pengukuran sungguhan, tidak seperti meteran di halaman pendaftaran, yang hanya bisa menilai karakter di depannya dan tidak punya cara mengetahui apakah Anda yang memilihnya atau sebuah generator.
5. **Salin, dan taruh di suatu tempat, sebelum Anda pergi.** Tidak ada riwayat di sini dan tidak ada cara memintanya kembali; memuat ulang halaman menghancurkannya. Tempelkan ke pengelola kata sandi lebih dulu dan ke formulir pendaftaran kemudian, supaya yang harus mengingatnya sudah memilikinya sebelum ada yang bisa salah.
6. **Ambil sekumpulan kalau Anda butuh.** Penggeser di bagian bawah membuat sampai seratus sekaligus dan akan menyimpannya sebagai file teks biasa, ditulis oleh halaman ini dari yang sudah ada di layar Anda. Berguna untuk menyiapkan akun atau membagikan kredensial awal, dan layak dihapus begitu semuanya ada di tempat yang lebih baik: file penuh kata sandi di disk Anda tetaplah file penuh kata sandi.

## Juga ada di dalam kotak

- [Pemformat JSON](https://abox.tools/id/format-json/): JSON, XML, HTML, CSS, dan YAML, diformat atau diubah. Tidak ada yang ditempelkan ke server orang lain.
- [Pengubah YAML ke JSON](https://abox.tools/id/konversi-yaml-ke-json/): Dua arah, dan ia menyebutkan biaya masing-masing. Tidak ada satu pun yang ditempel ke server orang lain.
- [Pemformat XML](https://abox.tools/id/format-xml/): XML dirapikan agar terbaca atau dimampatkan agar siap kirim, dan diubah ke JSON dua arah. Tidak ada satu pun yang ditempel ke server orang lain.
- [Pembanding Teks](https://abox.tools/id/bandingkan-teks/): Dua teks masuk, setiap perbedaan ditandai, baris demi baris dan kata demi kata. Tidak ada yang ditempelkan ke server orang lain.

## Pertanyaan

### Apakah kata sandinya dikirim ke suatu tempat, atau disimpan?

Tidak keduanya. Semuanya dibuat di peramban Anda, di perangkat keras Anda sendiri, dan alat ini tidak punya fitur jaringan dalam bentuk apa pun — ia tidak pernah mengambil apa pun dan tidak pernah mengirim apa pun. Tidak ada juga yang ditulis ke penyimpanan: tidak ada localStorage, tidak ada cookie, tidak ada riwayat. Muat ulang halamannya dan setiap kata sandi yang pernah ditampilkannya hilang, dari layar dan dari memorinya sendiri. `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya dan tidak satu pun milik kami, jadi tidak ada tempat sebuah kata sandi bisa dikumpulkan bahkan kalau ada yang mencoba.

### Dari mana keacakannya datang?

`crypto.getRandomValues`, generator yang disediakan peramban untuk keperluan kriptografis, ditaburi dan ditaburi ulang oleh kolam entropi milik sistem operasi Anda. Itu sumber yang sama yang dipakai peramban untuk bahan kunci TLS. `Math.random` tidak dipakai di mana pun di alat ini, dan pembedaan itu bukan sikap cerewet: `Math.random` adalah generator aritmetis cepat yang seluruh keadaan internalnya bisa direkonstruksi dari beberapa keluaran berurutan, jadi pembuat kata sandi yang dibangun di atasnya menghasilkan kata sandi yang tampak acak dan bisa dicacah oleh siapa pun yang pernah melihat salah satunya.

### Apakah kata sandi yang dibuat di peramban sebaik yang dari program desktop?

Untuk keacakannya, ya — sumbernya sama-sama sistem operasi, hanya dicapai lewat pintu yang berbeda. Yang berbeda adalah apa lagi yang ada di ruangan itu. Sebuah tab peramban berjalan berdampingan dengan ekstensi Anda, dan ekstensi yang punya izin membaca halaman bisa membaca halaman ini. Itu berlaku untuk setiap pembuat kata sandi berbasis web termasuk yang ini, dan itulah alasan jujur untuk memakai generator bawaan pengelola kata sandi Anda kalau Anda punya: aritmetikanya sama, dalam proses yang lebih sedikit tetangganya. Halaman ini untuk saat Anda tidak punya yang siap pakai.

### Kata sandi atau frasa sandi — saya sebenarnya harus pakai yang mana?

Kata sandi untuk segala yang diketikkan pengelola kata sandi untuk Anda, karena Anda tidak akan pernah melihatnya dan panjang itu gratis. Frasa sandi untuk segelintir hal yang harus Anda ketik dari ingatan atau bacakan: kata sandi utama pengelola kata sandi, kunci enkripsi disk, perangkat yang Anda siapkan dari jarak jauh. Enam kata dari daftar panjang adalah 77 bit, yang lebih kuat daripada kata sandi acak dua belas karakter dan jauh lebih mudah dibuat benar pada pukul empat pagi.

### Seberapa panjang sebaiknya sebuah kata sandi?

Dua puluh karakter dari alfabet penuh kira-kira 130 bit dan sudah melewati titik di mana panjang berhenti menjadi hal yang perlu dikhawatirkan. Enam belas cukup. Dua belas adalah dasar untuk apa pun yang sayang kalau hilang, dan itu dasar, bukan sasaran. Di bawah itu Anda bergantung pada situsnya menyimpannya dengan benar, dan itu taruhan yang dua puluh tahun pemberitahuan kebocoran menyarankan agar tidak Anda ambil. Panjang mengalahkan setiap setelan lain di halaman ini; menambah satu karakter lebih bernilai daripada aturan apa pun tentang karakter mana yang harus muncul.

### Berapa kata sebaiknya sebuah frasa sandi?

Enam dari daftar panjang, dan tujuh kalau ia menjaga kata sandi lain. Gambar empat kata yang terkenal itu dibuat pada 2011, bernilai 51 bit, dan hari ini sudah dalam jangkauan serangan luring yang serius. Lima adalah 64. Enam adalah 77, yang melewati apa pun yang akan dibelanjakan penyerang untuk satu akun biasa. Setiap kata tambahan dari daftar panjang menambah 12,9 bit, dan hanya kata-katanya yang menambah apa pun — tanda hubung dan huruf besarnya tidak.

### Apa itu “bit”, dan kenapa halaman ini menghitungnya?

Satu bit adalah satu penggandaan. Enam puluh bit berarti ada 2^60 hasil yang sama-sama mungkin dihasilkan halaman ini, jadi penyerang yang tahu persis cara kerjanya tetap punya sebanyak itu untuk dicoba. Itu sifat *prosesnya*, bukan sifat string-nya: halaman ini bisa menyebutkannya dengan tepat karena ia yang melakukan pemilihan dan tahu berapa banyak pilihan yang dibuatnya. Itulah bedanya dengan batang berwarna di formulir pendaftaran, yang membaca karakternya lalu menebak. Di batang itu, `correct horse battery staple` bernilai buruk padahal bernilai 44 bit, dan `P@ssw0rd!` bernilai bagus padahal nyaris tidak bernilai apa pun.

### Kenapa “harus mengandung simbol” justru membuat kata sandi lebih lemah?

Karena sebuah aturan hanya bisa membuang kemungkinan. Mensyaratkan setidaknya satu karakter dari setiap himpunan menyingkirkan setiap kata sandi yang kebetulan tidak punya satu pun, dan himpunan kata sandi yang lebih kecil berarti jumlah yang lebih kecil untuk dicari. Efeknya kecil — sekitar setengah bit pada panjang yang lazim — dan nyata, dan halaman ini menguranginya alih-alih menyebutkan angka yang lebih menyanjung. Itu dihitung dengan tepat, dengan mencacah kata sandi yang benar-benar diizinkan aturan itu, bukan yang tidak.

### Daftar kata yang mana ini, dan apakah masalah kalau penyerang bisa mengunduhnya?

Ini daftar diceware milik Electronic Frontier Foundation, disertakan tanpa diubah: 7.776 kata untuk yang panjang dan 1.296 untuk yang pendek. Daftar itu dibangun justru untuk ini — tidak ada yang menyinggung, tidak ada homofon, tidak ada pasangan yang menyatu menjadi kata ketiga, dan di daftar pendek tidak ada kata yang merupakan awalan kata lain. Dan tidak, tidak masalah bahwa daftarnya publik: kekuatan yang disebutkan di sini mengandaikan penyerang memilikinya, sedang melihat sumber halaman ini, dan tahu setiap setelan yang Anda pakai. Satu-satunya yang tidak mereka tahu adalah kata mana dari 7.776 itu yang muncul setiap kali. Andaian itulah yang membuat angkanya bisa dipercaya.

### Bukankah frasa sandi hanya serangan kamus yang menunggu terjadi?

Tidak kalau katanya dipilih dengan cara ini. Serangan kamus mempan terhadap frasa yang dipilih *orang*, karena orang memilih kata yang cocok satu sama lain, dalam urutan yang masuk akal, dari beberapa ribu kata yang mereka pakai sehari-hari. Halaman ini memilih setiap kata secara mandiri, seragam, dari daftar tetap, tanpa peduli apakah hasilnya enak dibaca — dan itulah sebabnya biasanya tidak. Penyerang yang tahu daftarnya dan panjangnya tetap menghadapi 7.776 pangkat jumlah katanya.

### Bisakah saya mendapatkan kembali sebuah kata sandi setelah meninggalkan halaman ini?

Tidak, dan itu disengaja. Tidak ada yang dicatat di mana pun, jadi tidak ada yang bisa dipulihkan: tidak ada panel riwayat, tidak ada daftar “baru saja dibuat”, tidak ada singgahan. Generator yang bisa menunjukkan kata sandi Selasa lalu berarti generator yang menyimpannya, dan disimpan di tempat yang bisa Anda capai berarti disimpan di tempat yang bisa dicapai sesuatu yang lain. Salin ke pengelola kata sandi sebelum Anda beranjak.

### Apakah menyalinnya ke papan klip aman?

Itu risiko biasa, dan layak diketahui alih-alih dicemaskan. Papan klip dipakai bersama oleh semua yang berjalan sebagai Anda, biasanya bertahan sampai penyalinan berikutnya, dan di sebagian penyiapan ia disinkronkan antar perangkat. Itu alasan bagus untuk segera menempelkannya di tempat yang seharusnya lalu menyalin sesuatu yang lain sesudahnya, dan bukan alasan untuk mengetik kata sandi yang lebih lemah dengan tangan. Halaman ini tidak bisa membaca papan klip Anda; ia hanya bisa menulis ke sana, dan hanya ketika Anda menekan tombolnya.

### Bolehkah saya memakai yang sama di lebih dari satu tempat?

Tidak, dan itu satu-satunya nasihat di halaman ini yang mengalahkan semua yang lain di sini. Hampir setiap akun yang diambil alih diambil alih dengan kata sandi yang lebih dulu benar di tempat lain: sebuah situs bocor, daftarnya diterbitkan, dan alamat serta kata sandi yang sama dicoba di mana-mana. Kata sandi unik per situs mengubah sebuah kebocoran menjadi satu akun alih-alih semuanya, dan itulah alasan memelihara pengelola kata sandi — bukan kekuatan satu pun kata sandi yang disimpannya.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada batas berapa banyak yang Anda buat. Situs ini memasang iklan, dan itulah yang membiayainya; iklan sama sekali tidak diberi apa pun tentang yang dibuat halaman ini, termasuk berapa panjangnya atau seberapa kuat.

### Apakah jalan tanpa internet?

Ya. Muat halamannya sekali, lalu putuskan koneksi internet, dan ia tetap membuat kata sandi. Keacakannya datang dari mesin Anda sendiri dan daftar katanya sudah ada di halaman. Itu juga cara paling sederhana untuk membuktikan tidak ada yang diambil atau dikirim: generator yang meminta angkanya dari sebuah server akan berhenti begitu Anda mencabut koneksi.

## Cara memverifikasi klaim privasi ini

- **Kata sandinya dibuat di tempat Anda membaca ini.** Ia ditarik di halaman ini, oleh halaman ini, dari keacakan yang diserahkan sistem operasi Anda sendiri ke peramban. Tidak ada yang diminta untuk menghasilkannya dan tidak ada yang dilaporkan setelah ia ada. `Content-Security-Policy` menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini: tidak ada titik akhir di sini tempat kata sandi yang dibuat bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Tidak ada `fetch`, tidak ada `XMLHttpRequest`, dan tidak ada `sendBeacon` di mana pun di dalam `src/`. Daftar katanya tidak diunduh; ia adalah `src/wordlist.js`, disajikan dari asal ini bersama sisa halamannya, dan Anda bisa membacanya.
- **Keacakannya milik peramban, dan jenisnya yang tepat.** `crypto.getRandomValues` adalah generator yang disediakan peramban untuk kunci dan token, ditaburi dan ditaburi ulang oleh sistem operasi. `Math.random` tidak muncul di mana pun di folder ini, dan akan menjadi cacat sungguhan kalau muncul: keadaan internalnya bisa dipulihkan dari segelintir keluaran, yang membuat setiap kata sandi yang akan pernah dihasilkannya bisa dihitung oleh siapa pun yang pernah melihat salah satunya.
- **Tidak ada yang disimpan, jadi tidak ada riwayat untuk dibersihkan.** Tidak ada localStorage, tidak ada sessionStorage, tidak ada cookie, tidak ada parameter URL, dan tidak ada `<input>` yang akan ditawarkan peramban untuk diingat. Apa yang ada di layar berada di satu larik di memori halaman ini, dan menutup tab adalah seluruh pembersihannya. Satu-satunya salinan dari apa pun yang dibuat di sini adalah yang Anda bawa pergi.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google, dan tombol donasi dari Buy Me a Coffee. Tidak satu pun diberi satu karakter pun dari yang dibuat halaman ini, atau panjangnya, atau kekuatannya, atau setelan mana yang menghasilkannya. Setiap baris yang menarik sebuah karakter atau sebuah kata disajikan dari asal ini dan terdaftar di repositori.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan alat ini tidak berubah, karena sejak awal memang tidak ada langkah jaringan di dalamnya. Itulah bukti yang paling sederhana: generator yang meminta keacakannya dari sebuah server akan berhenti begitu Anda mencabut koneksi.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/random.js` untuk empat puluh baris yang berdiri antara halaman ini dan setiap kata sandi yang dibuatnya — ia punya tepat satu masukan, dan masukan itu adalah generator milik peramban sendiri — `src/generate.js` untuk bagaimana setelan berubah menjadi sebuah string, dan `src/strength.js` untuk aritmetika di balik angkanya, yang menghitung alih-alih menebak.
