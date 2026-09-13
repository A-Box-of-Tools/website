# Berbagi teks & berkas — langsung dari browser Anda ke browser mereka, tanpa unggah

Bagikan ini hidup di tab yang terbuka. Pembaca menerimanya terenkripsi, langsung dari browser Anda, dan menutup tab mengakhirinya - tidak ada server yang menyimpan apa pun.

> Kirim teks atau berkas dari satu browser ke browser lain lewat koneksi langsung yang terenkripsi. Nama tautan yang bisa diucapkan, pembaruan langsung saat mengetik, persetujuan per pembaca - dan tidak pernah ada apa pun di server mana pun. Gratis, tanpa daftar.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/berbagi-teks/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## teks dan berkas yang dibagikan Anda **tidak pernah diunggah**. Tidak ada server.

Apa yang Anda bagikan di sini berjalan dari browser Anda ke browser setiap pembaca lewat kanal WebRTC yang terenkripsi ujung ke ujung, dan tidak ke mana-mana lagi. Satu-satunya server yang terlibat — disebut di `Content-Security-Policy` halaman ini, kodenya di repositori — memperkenalkan kedua browser lalu menyingkir: ia tidak menyimpan apa pun, dan isi tidak pernah melewatinya. Tidak ada riwayat, tidak ada akun. Tutup tab ini dan berbaginya berakhir di mana-mana sekaligus, termasuk di halaman pembaca yang masih terbuka.

- ✗ Tidak ada yang disimpan
- ✗ Tanpa akun
- ✓ Terenkripsi ujung ke ujung
- ✓ Berakhir bersama tab Anda
- ✓ Sumber terbuka

## Cara berbagi teks dan berkas tanpa mengunggahnya ke mana pun

1. **Tulis teksnya, atau lampirkan berkasnya.** Editor adalah berbaginya: apa pun isinya saat seorang pembaca terhubung, itulah yang ia terima, dan perubahan setelahnya sampai ke pembaca yang terhubung secara langsung, sambil Anda mengetik. Berkas berjalan lewat kanal yang sama, hingga 200 MB per berkas; pembaca melihat daftarnya dan hanya mengunduh yang mereka minta, jadi tak ada bandwidth terbuang untuk berkas yang tak diinginkan.
2. **Nyalakan Markdown bila teksnya layak diformat.** Satu sakelar saja. Judul, cetak tebal, daftar, kode, dan tautan dirender langsung di samping editor sambil Anda mengetik, dan pembaca menerima tampilan terformat secara bawaan, dengan pengalih untuk kembali ke sumber. Perendernya ikut dengan halaman ini dan meng-escape semuanya: teks yang dibagikan tidak bisa menjadi skrip di mesin pembaca, siapa pun penulisnya.
3. **Beri nama tautannya, atau pakai sarannya.** Nama adalah alamatnya: `brave-otter-42` bisa diteriakkan melintasi ruangan, dibacakan lewat telepon, atau disalin dari papan tulis. Ia juga satu-satunya rahasia: untuk sesuatu yang privat, pilih nama yang tak seorang pun akan menebaknya, atau andalkan sakelar privat. Nama yang sedang dipakai orang lain untuk berbagi akan ditolak, dan nama Anda bebas lagi begitu Anda berhenti.
4. **Tentukan siapa yang boleh masuk.** Privat adalah bawaannya: setiap pembaca diminta memperkenalkan diri — nama, petunjuk, apa pun yang Anda kenali — dan Anda melihat pesannya dengan tombol untuk mengizinkannya membaca atau menolaknya. Perkenalan berjalan lewat kanal langsung, jadi perantara pun tidak tahu siapa yang mengetuk. Hapus centangnya untuk berbagi terbuka yang bisa dibaca siapa pun yang tahu namanya.
5. **Mulai berbagi, dan biarkan tabnya terbuka.** Tab adalah servernya: berbagi bisa dijangkau selama tab terbuka dan terjaga, dan tidak sedetik pun lebih lama. Laptop yang ditutup juga mengakhirinya. Salin tautannya, atau sebutkan saja namanya — pembaca bisa mengetikkannya sebagai `#nama` di ujung alamat halaman ini.
6. **Di sisi lain: setujui dulu, lalu ketuk.** Yang membuka tautan diberi tahu bahwa ada yang berbagi, diperingatkan bahwa koneksi langsung memperlihatkan alamat jaringan masing-masing pihak, dan hanya terhubung bila memutuskan sendiri. Pada berbagi privat ia memperkenalkan diri dan menunggu Anda. Yang ia terima diperbarui langsung sambil Anda menyunting, dan lenyap saat Anda menutup tab.

## Versi lebih lengkap

[Cara berbagi teks dan berkas antar perangkat tanpa mengunggahnya](https://abox.tools/id/panduan/berbagi-teks-antar-perangkat/): Memindahkan teks atau berkas dari satu browser ke browser lain lewat koneksi langsung yang terenkripsi - tanpa mengirim email ke diri sendiri, tanpa riwayat chat, tanpa akun, dan tanpa server yang menyimpan salinan.

## Juga ada di dalam kotak

- [Pembuat QR dan Barkode](https://abox.tools/id/buat-kode-qr/): Ketik, dan ia menjadi sebuah kode. Tidak ada yang dikirim untuk membuatnya.
- [Pembaca QR & Barcode](https://abox.tools/id/pindai-kode-qr/): Arahkan ke sebuah kode, atau jatuhkan gambarnya. Ia dibaca di sini, dan tidak di tempat lain.
- [Hash dan Checksum](https://abox.tools/id/hitung-checksum/): Periksa sebuah unduhan terhadap angka yang dicetak penerbitnya, tanpa mengirimnya ke siapa pun.
- [Pembuat Kata Sandi dan Frasa Sandi](https://abox.tools/id/pembuat-kata-sandi/): Dibuat di sini, oleh peramban Anda sendiri, dan tidak pernah dikirim ke mana pun. Tidak ada yang disimpan dan tidak ada riwayat.

## Pertanyaan

### Adakah yang diunggah, ke mana pun?

Tidak. Teks dan berkas pergi dari browser Anda ke browser setiap pembaca lewat kanal WebRTC terenkripsi, langsung. Satu-satunya server yang terlibat membawa perkenalan — beberapa kilobyte negosiasi koneksi — dan tidak pernah isinya. Di sana tidak ada yang bisa bocor, disita, atau hilang: ia tidak memegang satu byte pun milik Anda, dan sebuah ruang berhenti ada begitu Anda terputus.

### Lalu mengapa alat ini bicara dengan server, justru di situs ini?

Karena dua browser tidak bisa saling menemukan sendiri: sesuatu harus mempertemukan orang yang mengetik `brave-otter-42` dengan orang yang berbagi di bawah nama itu, dan membawa tawaran koneksi di antara keduanya. Sesuatu itu adalah perantara, satu-satunya ketergantungan jaringan halaman ini, disebut di `Content-Security-Policy`-nya dan diterbitkan di repositori yang sama dengan halamannya. Ia server terkecil yang sanggup melakukan tugas itu: tidak menyimpan apa pun, tidak membaca apa pun, dan menyingkir begitu kedua browser memegang kanal langsung.

### Apa persisnya yang bisa dilihat server itu?

Bahwa sebuah nama tautan sedang dipakai, kapan pembagi dan pembaca terhubung dan pergi, alamat IP mereka, dan penyiapan koneksi terenkripsi yang mereka pertukarkan. Bukan teksnya, bukan berkasnya, bukan nama atau ukurannya, bukan siapa yang diterima di berbagi privat, dan bukan apa yang ditulis seseorang saat memperkenalkan diri — semuanya berjalan lewat kanal langsung yang terenkripsi ujung ke ujung dan tidak melewati server. Cloudflare, yang menjalankan server itu, menyimpan log setiap koneksi selama tujuh hari: nama tautan, alamat, dan waktunya. Tidak ada yang lain yang bertahan setelah berbagi berakhir.

### Apa yang terjadi saat saya menutup tab?

Berbagi berakhir di mana-mana sekaligus. Tautan berhenti bekerja dalam satu-dua detik, dan pembaca yang halamannya masih terbuka melihat salinannya lenyap, dengan catatan bahwa berbaginya sudah berakhir. Ini bukan permintaan penghapusan ke sebuah server: tidak ada salinan server yang harus dihapus. Tab itu satu-satunya tempat berbagi itu ada, dan menutupnya adalah seluruh bersih-bersihnya.

### Bisakah pembaca menyimpan yang saya bagikan?

Selama berbaginya terbuka, bisa: berbagi memang begitu. Pembaca bisa menyalin teks atau mengunduh berkas, dan yang ia ambil adalah miliknya, persis seolah Anda menyerahkannya lewat cara lain mana pun. Yang dijamin oleh mengakhiri adalah masa depan: tak ada orang baru yang bisa mendapatkannya, dan halaman yang terbuka berhenti menampilkannya. Tidak ada alat yang bisa menarik kembali yang sudah sampai, dan halaman ini tidak berpura-pura sebaliknya.

### Apa itu mode privat?

Bawaannya. Setiap pembaca yang datang diberi tahu bahwa berbaginya privat dan diminta memperkenalkan diri; Anda melihat pesannya — “ini aku, Alice yang di rapat” — dengan tombol untuk mengizinkannya membaca atau menolaknya, dan tidak ada yang dikirim sampai Anda memutuskan. Perkenalan berjalan lewat kanal langsung yang sudah terenkripsi, jadi server tidak pernah tahu siapa yang mengetuk atau apa keputusan Anda. Dihapus centangnya sebelum berbagi, jadilah berbagi terbuka.

### Mengapa pembaca akan melihat alamat IP saya?

Karena koneksinya benar-benar langsung, dan koneksi langsung berjalan antara dua alamat: tiap ujung mau tak mau mengetahui alamat ujung lainnya, seperti pada panggilan telepon. Pembaca diperingatkan sebelum koneksi apa pun ada dan hanya terhubung bila memutuskan sendiri; sampai saat itu Anda bahkan tidak tahu ia membuka tautannya. Bila pertukaran itu tidak cocok untuk suatu berbagi, alternatifnya adalah layanan yang meneruskan lewat server — dengan pertukaran sebaliknya.

### Seberapa besar berkasnya boleh, dan seberapa cepat?

Hingga 200 MB per berkas, jenis apa pun, dan secepat koneksi yang lebih lambat dari keduanya: tidak ada server di tengah yang memperlambat atau menjatah. Dua mesin di Wi-Fi yang sama mentransfer pada kecepatan jaringan lokal, dan byte-nya tidak keluar gedung. Pembaca mengunduh tiap berkas sesuai permintaan, jadi melampirkan sesuatu yang besar tidak berbiaya apa-apa sampai seseorang benar-benar memintanya.

### Apakah bekerja offline?

Jujur saja: separuhnya. Editornya iya — halaman termuat, draf Anda ada, Markdown dirender, dan menulis serta menyimpan berjalan tanpa jaringan sama sekali. Berbaginya tidak, dan memang tidak mungkin: menjangkau browser orang lain adalah perbuatan jaringan, dan perkenalannya membutuhkan perantara. Inilah satu-satunya alat di situs ini yang tugasnya mustahil offline, dan menyiratkan sebaliknya tidaklah jujur.

### Bagaimana kalau kami tidak bisa terhubung?

Sebagian besar pasangan browser saling menjangkau langsung begitu diperkenalkan; sebagian kecil tidak, biasanya saat salah satu sisi berada di jaringan alamat-bersama operator seluler atau di balik jaringan kantor yang ketat. Halaman ini tidak pernah diam-diam beralih ke penerus — itu akan mengubah apa alat ini tanpa mengatakannya —: setelah dua puluh detik ia berkata terus terang bahwa koneksi langsung tidak terjadi, lalu menawarkan satu kepada pembaca: penerus yang dijalankan Cloudflare, yang meneruskan byte terenkripsi di antara kedua browser dan tidak bisa membacanya, karena kuncinya tidak pernah meninggalkan kedua ujung. Pembaca memilihnya secara sadar, di halamannya sendiri, setelah diberi tahu apa yang dilihat penerus — kedua alamat, seperti koneksi langsung —, dan di sana pun tidak ada yang disimpan. Sisi Anda tidak berubah: browser Anda tetap mengirim ke satu pembaca itu, seperti yang akan dilakukannya bila pembaca ada di balik VPN.

### Amankah merender Markdown, bila siapa pun bisa membagikan apa pun?

Pertanyaan itu adalah alasan perendernya delapan puluh baris di kode halaman ini dan bukan sebuah pustaka. Setiap karakter di-escape sebelum tag apa pun dikeluarkan, hanya sekumpulan tetap tag yang tak berbahaya yang bisa terbentuk, dan tautan hanya menerima `http`, `https`, dan `mailto`: tautan `javascript:` tinggal sebagai teks mati. Teks yang dibagikan tidak bisa menjadi skrip di mesin Anda, siapa pun penulisnya, dan delapan puluh baris itu bisa Anda baca.

### Bisakah dua orang berbagi dengan nama yang sama?

Tidak bersamaan. Satu berbagi hidup per nama, ditegakkan di perantara: yang datang kedua ditolak dan diminta memilih nama lain. Begitu sebuah berbagi berakhir, namanya bebas lagi — yang juga berarti tautan yang disimpan hanya sesegar berbagi di baliknya: nama yang sama, minggu depan, bisa jadi milik orang lain. Perlakukan tautan sebagai milik sebuah momen, bukan milik seseorang.

### Gratiskah, dan perlukah akun?

Gratis, tanpa akun, tanpa pendaftaran, dan tanpa batas yang layak disebut: enam belas pembaca serentak per berbagi. Situs ini memuat iklan, itulah yang membiayainya; iklan tidak menerima apa pun tentang yang dibagikan halaman ini, dan perantara muat dengan lapang di paket gratis justru karena tidak menyimpan apa-apa dan nyaris tidak berbuat apa-apa.

## Cara memverifikasi klaim privasi ini

- **Isi pergi ke pembaca Anda, dan tidak ke mana-mana lagi.** Teks dan berkas berjalan lewat kanal data WebRTC: koneksi langsung, terenkripsi DTLS, antara browser Anda dan browser setiap pembaca. Di jalur itu tidak ada server. Di jaringan yang sama, byte-nya bahkan tidak keluar gedung: dua laptop di Wi-Fi yang sama menukarnya secara lokal. Satu-satunya pengecualian adalah pembaca yang jaringannya tidak bisa dijangkau langsung dan yang kemudian memilih, di halamannya sendiri, penerus terenkripsi: penerus itu meneruskan teks tersandi yang sama dan tidak bisa membacanya.
- **Apa itu perantara, dan semua yang dilihatnya.** Koneksi langsung butuh perkenalan, maka halaman ini — satu-satunya di situs ini — membuka satu WebSocket ke server milik kami. Server itu mempertemukan orang yang mengetik sebuah nama tautan dengan orang yang berbagi di bawah nama itu, meneruskan beberapa kilobyte negosiasi, dan tidak menahan apa pun: tidak pernah menulis penyimpanan, dan sebuah ruang berhenti ada begitu si pembagi terputus. Yang bisa dilihatnya: bahwa sebuah nama sedang dipakai, kapan tiap orang datang dan pergi, dan alamat IP mereka. Yang tidak bisa dilihatnya: teksnya, berkasnya, siapa yang diizinkan masuk, atau apa yang ditulis siapa pun — bahkan ketukan pada berbagi privat berjalan lewat kanal langsung yang terenkripsi. Kode lengkapnya ada di repositori, di samping kode alat ini. Yang bertahan setelah sebuah berbagi hanya satu hal: Cloudflare, yang menjalankan server itu, menyimpan log setiap koneksi selama tujuh hari — nama tautan, alamat, dan waktunya, tidak pernah isinya.
- **Tidak ada yang disimpan: menutup tab adalah penghapusannya.** Berbagi hanya ada selama tab Anda terbuka. Tutup, maka pembaca baru tidak menemukan apa-apa, dan yang sedang membaca melihat salinannya lenyap — meski yang sudah disalin atau diunduh seseorang adalah miliknya, seperti apa pun yang Anda serahkan langsung. Draf yang Anda ketik tinggal di penyimpanan browser Anda sendiri agar masih ada lain kali, dan hanya di sana; ditandai sekali pakai, ia tidak tinggal di mana pun.
- **Nama tautan adalah satu-satunya rahasia, dan mode privat gemboknya.** Siapa pun yang tahu atau menebak sebuah nama bisa membuka berbagi di baliknya. Itulah mengapa sarannya tiga kata acak, mengapa apa pun yang sensitif layak diberi nama yang tak tertebak — atau sakelar privat, yang menyala secara bawaan: setiap pembaca yang datang harus memperkenalkan diri, lewat kanal langsung, dan tidak ada yang dikirim sampai Anda mengizinkannya masuk.
- **Koneksi langsung memperlihatkan alamat masing-masing pihak.** Itulah arti peer-to-peer, dan pembaca mengetahuinya sebelum terjadi: membuka tautan berbagi hanya bertanya kepada perantara apakah ada yang berbagi; lalu halaman berkata terang-terangan bahwa terhubung akan memperlihatkan alamat IP masing-masing pihak, dan menunggu satu klik. Sampai klik itu, si pembagi bahkan belum tahu pembaca itu ada.
- **Apa yang dimuat Google, dan apa yang tidak diterimanya.** Skrip iklan dan pengukuran datang dari Google, tombol donasi dari Buy Me a Coffee. Tidak satu pun menerima teksnya, berkasnya, nama atau ukurannya, atau siapa yang terhubung. Pengecualiannya adalah alamat halaman ini sendiri: tautan pembaca memuat nama tautan, dan skrip iklan membaca alamat itu. Berbagi yang layak dirahasiakan memerlukan sakelar privat. Setiap baris yang menyentuh isi disajikan dari origin ini dan ada di repositori.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/main.js` untuk kedua belah pertukaran — tab pembagi dan tab pembaca adalah berkas yang sama — dan `src/markdown.js` untuk perender yang bekerja pada teks dari ujung kabel yang lain, dan karena itu meng-escape semuanya sebelum mengeluarkan apa pun. Kode lengkap servernya adalah `workers/rendezvous/worker.js`, di repositori yang sama: satu ruang per nama tautan, tidak memegang apa pun selain koneksi yang terbuka.
