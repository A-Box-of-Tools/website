# Penyunting Audio — balik, percepat, atau kuatkan sebuah trek

Putar terbalik, ubah kecepatannya, angkat rekaman yang pelan — semuanya di sini, di mesin Anda.

> Putar sebuah trek secara terbalik, percepat atau perlambat, dan buat rekaman yang pelan menjadi lebih keras. Bisa juga mengeluarkan suara dari sebuah video. Berjalan di peramban Anda: tidak ada yang diunggah.

Halaman ini adalah alat interaktif yang berjalan sepenuhnya di peramban Anda, di https://abox.tools/id/sunting-audio/ — tidak ada yang Anda berikan padanya yang diunggah. Berikut ini semua yang dikatakan halaman tentang alat ini dalam kata-kata; untuk memakainya, buka alamat tersebut.

## rekaman Anda **tidak pernah diunggah**. Tidak ada server.

File Anda dibaca, disunting, dan ditulis oleh peramban Anda sendiri, di perangkat keras Anda sendiri. Tidak ada di sini yang bisa mengambil atau mengirim apa pun — alat ini sama sekali tidak punya fitur jaringan — dan seandainya pun ada, tidak ada server di ujung lain halaman ini untuk menerima sebuah rekaman.

- ✗ Tanpa unggah
- ✗ Tanpa akun
- ✗ Tanpa tanda air
- ✓ Video masuk, audio keluar
- ✓ Jalan tanpa internet

## Cara menyunting file audio

1. **Pilih sebuah file.** Jatuhkan file MP3, WAV, FLAC, M4A, Ogg, atau Opus ke pemilih file — atau sebuah video, kalau yang Anda mau adalah suaranya. Peramban membacanya langsung dari disk Anda; tidak ada yang dikirim ke mana pun saat Anda melakukannya.
2. **Balik, kalau itu tujuan Anda datang.** Satu kotak centang. Sampelnya ditulis dari yang terakhir lebih dulu, dan itu persis bisa dibalik lagi: lakukan dua kali dan Anda mendapatkan file yang Anda mulai, sampel demi sampel.
3. **Atur kecepatannya.** Seret penggesernya, ketik sebuah kelipatan, atau tekan salah satu pilihan siap pakainya. Lalu pilih apa yang terjadi pada nadanya: tahan di tempatnya, yang Anda inginkan untuk kuliah pada 1,5×, atau biarkan bergerak mengikuti kecepatannya, yang dilakukan pita kaset dan yang membuat suara naik atau turun.
4. **Atur levelnya.** Sebutkan perubahannya dalam desibel, atau minta rekamannya dinaikkan sampai momen terkerasnya duduk tepat di bawah langit- langit. Halaman ini mengatakan di mana momen itu akan mendarat sebelum Anda menekan apa pun, dan memperingatkan Anda kalau setelan yang Anda pilih akan mendorongnya melewati skala penuh.
5. **Simpan.** Pekerjaannya terjadi di perangkat keras Anda sendiri, jadi lamanya tergantung mesin Anda, bukan pada antrean. Yang keluar adalah sebuah WAV — sampelnya sendiri, dengan header di depannya — diputar dulu di halaman ini, lalu diserahkan langsung ke unduhan peramban Anda.

## Versi lebih lengkap

[Cara merapikan memo suara sebelum mengirimnya](https://abox.tools/id/panduan/merapikan-memo-suara/): Potong hening kosong dan awalan yang gagal, lalu naikkan volumenya sampai tepat di bawah penuh. Dua perkakas peramban berurutan, dengan urutan yang menjaga mutu, dan rekaman tidak pernah meninggalkan komputer Anda.

## Juga ada di dalam kotak

- [Penggabung dan Pemisah PDF](https://abox.tools/id/gabung-pdf/): Halaman dipindah-pindah tanpa perjalanan bolak-balik ke server.
- [Kompresor PDF](https://abox.tools/id/kompres-pdf/): Perkecil sebuah dokumen tanpa mengirimnya ke mana pun.
- [Penyensor PDF](https://abox.tools/id/sensor-pdf/): Hurufnya dihapus dari file-nya, dan file-nya dicari sesudahnya untuk membuktikannya.
- [Gambar ke PDF](https://abox.tools/id/gambar-ke-pdf/): Masukkan gambar Anda ke dalam satu dokumen.

## Pertanyaan

### Apakah audio saya diunggah ke suatu tempat?

Tidak. Ia dibaca, disunting, dan ditulis oleh peramban Anda sendiri di perangkat keras Anda sendiri. Alat ini tidak punya sisi server, dan `Content-Security-Policy` halaman ini menyebut satu per satu setiap alamat yang boleh dihubunginya — tidak satu pun milik situs ini. Cabut koneksi internet dan tetap balik sebuah trek kalau Anda lebih suka memeriksa daripada diberi tahu.

### Bisakah saya mengeluarkan audio dari sebuah video?

Bisa, dan di sini itu pekerjaan yang sama dengan membuka sebuah MP3. Jatuhkan MP4, MOV, atau WebM dan hanya jalur audionya yang didekode: gambarnya tidak pernah dibaca, dan yang keluar adalah file suara tanpa video di dalamnya. Kalau hanya itu yang Anda mau — suaranya, tanpa perubahan — maka [Ekstrak Audio dari Video](https://abox.tools/id/ekstrak-audio-dari-video/) mengerjakan hal yang sama di halaman yang tidak berisi apa pun lagi. Kembalilah ke sini saat suaranya juga perlu diubah.

### Apakah mengubah kecepatan mengubah nadanya?

Hanya kalau Anda memintanya. "Jaga nadanya" memotong rekaman menjadi jendela-jendela bertumpang tindih sepanjang kira-kira lima puluh milidetik dan menaruhnya kembali lebih rapat atau lebih renggang, memilih setiap posisi agar gelombangnya sejajar di titik potongnya — sebuah suara tetap suara yang sama pada 1,5×. "Biarkan bergerak" mengambil sampel ulang, yang sama dengan memutar pita kaset lebih cepat: dua kali kecepatan berarti persis satu oktaf naik.

### Kenapa ia menyimpan WAV alih-alih MP3?

Karena tidak ada peramban yang menyertakan encoder MP3, dan alat ini menolak mengirim rekaman Anda ke server yang punya. Sebuah WAV sama sekali tidak butuh encoder — ia adalah sampel dengan header empat puluh empat byte di depannya — jadi ia sekaligus pilihan yang jujur dan satu-satunya yang tidak mungkin memakan kualitas. Ukurannya lebih besar: sekitar sepuluh megabyte per menit dalam stereo. Setiap pemutar, ponsel, dan penyunting bisa membukanya, dan apa pun yang mau MP3 bisa membuatnya dari situ.

### Format apa saja yang bisa saya buka?

Apa pun yang bisa didekode peramban Anda, yang dalam praktiknya berarti MP3, WAV, FLAC, M4A dan AAC, Ogg Vorbis dan Opus, serta audio di dalam video MP4, M4V, MOV, dan WebM. Yang tertinggal adalah daftar pendek yang sama seperti di tempat lain: AVI, WMA, dan sebagian besar MKV. File yang tidak mau dibaca peramban ini ditolak dengan pesan, alih-alih gagal di tengah jalan.

### Apakah membuatnya lebih keras akan membuatnya pecah?

Hanya kalau Anda membawanya melewati skala penuh, dan halaman ini memberi tahu Anda sebelum itu terjadi. Audio digital punya langit-langit yang keras: sebuah sampel tidak bisa lebih keras daripada skala penuh, jadi apa pun di atasnya diratakan ke langit-langit, dan begitulah bunyi suara yang pecah. "Sekeras yang bisa" adalah setelan yang tidak mungkin melakukan itu — ia menghitung berapa ruang yang masih dimiliki rekaman itu dan memakai persis sebanyak itu. Semua di bawah langit-langit hanyalah perkalian dan tidak lebih: naikkan 6 dB lalu turunkan 6 dB dan sampelnya kembali ke tempat semula.

### Apakah membalik atau mengubah waktu menurunkan kualitas?

Membalik tidak: sampel yang sama keluar dalam urutan terbalik, dan itu persis. Mengubah kecepatan menggeser setiap sampel, jadi itu aritmetika, bukan penyalinan — pengambil sampel ulangnya menyaring dengan benar di tengah jalan, jadi mempercepat tidak melipat nada tinggi kembali ke bawah menjadi dering logam, dan jendela perentangnya ditempatkan di tempat gelombangnya sejajar, bukan di mana pun aritmetikanya mendarat. Tidak ada jalur yang mengodekan ulang apa pun, karena tidak ada encoder di sini untuk mengodekan ulang.

### Adakah batas durasi file-nya?

Tidak ada batas yang tertanam di alat ini. Batas praktisnya adalah memori: seluruh rekaman didekode ke halaman ini sekaligus, dan sebuah WAV dirakit di memori sebelum Anda mengunduhnya, jadi satu jam stereo membutuhkan ruang kerja sedikit di bawah satu gigabyte. WAV empat gigabyte ditolak mentah-mentah, karena kolom ukuran milik formatnya sendiri tidak bisa menggambarkannya.

### Apakah gratis, dan apakah saya perlu akun?

Gratis, dan tidak ada akun, tidak ada masuk, tidak ada masa uji coba, dan tidak ada tanda air. Situs ini memasang iklan, dan itulah yang membiayainya; iklan tidak diberi apa pun tentang rekaman Anda.

## Cara memverifikasi klaim privasi ini

- **Rekaman Anda tidak punya tujuan ke mana pun.** Content-Security-Policy menyebut satu per satu setiap alamat yang boleh dihubungi halaman ini, dan tidak satu pun milik situs ini. Tidak ada titik akhir di sini tempat file Anda bisa dikumpulkan, dan tidak ada kode yang akan mengirimnya seandainya ada.
- **Tidak ada di sini yang mengambil apa pun.** Alat ini sama sekali tidak punya fitur jaringan: tidak ada alamat untuk ditempelkan, tidak ada yang diunduh, tidak ada mesin yang diambil saat pertama dipakai. Setiap byte yang menyentuh audio Anda datang dari asal ini ketika halaman dimuat.
- **Dekodernya adalah yang sudah ada di peramban Anda.** File diserahkan ke `decodeAudioData`, kode yang sama yang memutar sebuah lagu di elemen `<audio>`. Tidak ada yang dikirim ke sini untuk membaca format Anda, dan tidak ada yang diminta dari apa pun di luar halaman ini untuk membacanya.
- **Gambar sebuah video tidak pernah didekode sama sekali.** Ketika Anda menjatuhkan sebuah video, hanya jalur audionya yang diminta. Bingkainya tidak dibaca, tidak didekode, tidak digambar, dan tidak dilihat — tidak ada kode di halaman ini yang bisa, dan file yang keluar memuat suara dan tidak lebih.
- **Sampelnya dituliskan, bukan dikodekan lagi.** Sebuah WAV adalah sampel yang dihitung halaman ini dengan header di depannya. Tidak ada encoder dalam perulangannya yang mengambil keputusan tentang rekaman Anda, dan tidak ada yang bisa disebut unggahan untuk membuat hal itu terjadi.
- **Apa yang dimuat Google, dan apa yang tidak diberikan kepadanya.** Skrip iklan dan pengukuran berasal dari Google. Tidak satu pun diberi apa pun tentang rekaman Anda: bukan file, bukan sampel, bukan nama, ukuran, durasi, atau seberapa keras suaranya. Setiap baris yang membaca, menyunting, dan menulis disajikan dari asal ini dan terdaftar di repositori.
- **Apa yang dimuat tombol donasi, dan apa yang tidak diberikan kepadanya.** Tombol "Buy me a coffee" di bagian atas digambar oleh skrip dari cdnjs.buymeacoffee.com dan mengambil hurufnya dari Google Fonts. Ia hanyalah sebuah tautan: ia tidak melaporkan kunjungan, dan tidak diberi apa pun tentang Anda atau file Anda.
- **Jalan tanpa internet.** Putuskan koneksi jaringan dan semua yang ada di halaman ini tetap bekerja. Itulah bukti yang paling sederhana.

**Periksa sendiri.** Anda tidak perlu memercayai semua ini begitu saja. Halaman ini dihasilkan dari templat dan konfigurasi di repositori oleh skrip build yang bisa Anda baca dan jalankan sendiri, dan hasilnya dikirim ke cabang `dist` — jadi Anda bisa membandingkan apa yang disajikan dengan apa yang dihasilkan oleh build dari kode sumbernya: https://github.com/A-Box-of-Tools/website

File yang layak dibaca lebih dulu adalah `config/site.toml` untuk Content-Security-Policy, `src/shared/audio-decode.js` untuk dua puluh baris yang menyerahkan file Anda ke dekoder milik peramban sendiri, `src/stretch.js` untuk perentang waktunya, `src/speed.js` untuk pengambil sampel ulangnya, dan `src/shared/wav.js` untuk header yang dipasang di depan sampelnya. Tidak satu pun mengimpor sesuatu yang bisa membuat permintaan.
