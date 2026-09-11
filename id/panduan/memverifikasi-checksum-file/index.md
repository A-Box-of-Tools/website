# Cara memeriksa unduhan terhadap checksum-nya

Baris heksadesimal di bawah sebuah tautan unduhan ada di sana supaya Anda bisa membuktikan file-nya tiba utuh. Membandingkannya memakan sekitar satu menit. Mengetahui berapa nilai perbandingan itu — dan satu kebiasaan yang membuatnya tidak bernilai sama sekali — memakan sisa halaman ini.

[Buka Hash dan Checksum](https://abox.tools/id/hitung-checksum/): Periksa sebuah unduhan terhadap angka yang dicetak penerbitnya, tanpa mengirimnya ke siapa pun.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Hash & Checksum](https://abox.tools/id/hitung-checksum/), jatuhkan file yang Anda unduh ke atasnya, lalu tempelkan checksum dari halaman unduhannya ke kotak di bawah. Halamannya memperhitungkan angkanya berasal dari algoritma yang mana dari panjangnya, lalu menjawab dalam satu kalimat.

Kalau ia cocok, byte di disk Anda adalah byte yang diukur penerbitnya. Kalau tidak, unduh lagi file-nya sebelum Anda membukanya. Semua di bawah ini adalah apa yang tidak disebutkan kalimat itu.

## Angka di bawah tautan unduhan itu apa

Ia keluaran sebuah fungsi hash: sebuah perhitungan yang membaca setiap byte sebuah file lalu menghasilkan jawaban pendek berpanjang tetap. File yang sama selalu memberi jawaban yang sama, dan file yang berbeda satu bit saja memberi jawaban yang sama sekali berbeda — bukan yang nyaris identik, melainkan yang tidak berhubungan. Sifat itulah seluruh yang diandalkan.

Karena jawabannya pendek dan file-nya tidak, perhitungannya membuang informasi, dan mau tidak mau ada banyak file yang berbagi jawaban tertentu mana pun. Menemukan salah satunya dengan sengaja itulah bagian yang sulit, dan seberapa sulitnya itulah yang membedakan algoritma di bawah satu sama lain.

Tidak ada yang rahasia tentang sebuah checksum dan tidak ada yang bisa dibalik darinya. Ia sebuah sidik jari, diterbitkan supaya dua orang bisa sepakat bahwa mereka memegang benda yang sama.

## Anda sedang melihat algoritma yang mana

Anda tidak perlu memilih — penerbitnya sudah memilih, dan tugas Anda adalah menghitung yang sama. Anda bisa tahu yang mana hanya dari panjangnya:

- **32 karakter heksadesimal** — MD5.
- **40** — SHA-1.
- **64** — SHA-256, dan inilah yang paling akan Anda lihat.
- **96** — SHA-384.
- **128** — SHA-512.

Tidak ada dua di antaranya yang sama panjang, dan itulah sebabnya alatnya bisa mengenali sebuah nilai yang ditempelkan tanpa diberi tahu. Teks sepanjang 63 karakter bukan checksum apa pun; ia sebuah SHA-256 yang kehilangan satu karakter dalam perjalanan ke papan klip Anda.

![Kartu hasil: ringkasan MD5, SHA-1, SHA-256, dan SHA-512 dari satu berkas, masing-masing dengan tombol salin.](https://abox.tools/screens/verify-a-file-checksum/digests.webp)

Semuanya sekaligus, karena mana yang dipakai diputuskan oleh pihak yang menerbitkan berkasnya, bukan oleh Anda.

## Mengerjakannya di mesin Anda sendiri, tanpa peramban

Setiap sistem operasi membawa sesuatu yang melakukan ini, dan perintahnya layak diketahui bahkan kalau Anda memakai sebuah halaman untuk itu — tidak ada jawaban yang lebih baik untuk "bagaimana saya tahu situs Anda menghitungnya dengan jujur" selain menjalankan file yang sama melalui alat yang datang bersama komputer Anda.

**Windows**, di PowerShell:

```
Get-FileHash .\disk.iso -Algorithm SHA256
```

Mesin yang lebih tua punya `certutil -hashfile disk.iso SHA256` sebagai gantinya, yang mencetak dalam huruf besar dengan spasi di dalamnya. Besar kecilnya huruf tidak pernah jadi soal dalam perbandingan checksum; hurufnya adalah digit, bukan kata.

**macOS**:

```
shasum -a 256 disk.iso
```

**Linux**:

```
sha256sum disk.iso
```

Ketiganya mencetak teks yang sama untuk file yang sama, dan begitu juga situs ini. Mereka spesifikasi yang tepat dengan vektor uji yang diterbitkan; tidak ada ruang bagi sebuah wujud implementasi untuk punya pendapat.

## Membandingkannya tanpa membuat mata juling

Jangan membaca enam puluh empat karakter dari dua layar lalu memutuskan keduanya tampak sama. Orang memeriksa empat karakter pertama dan empat terakhir lalu berhenti, dan persis itulah perbandingan yang akan diatur seorang penyerang supaya lolos, dan itu juga cara sebuah kekeliruan jujur dilambaikan lewat.

Tempelkan keduanya ke sesuatu yang bisa membandingkannya untuk Anda. Di sebuah baris perintah, untuk itulah bendera `-c` ada:

```
sha256sum -c SHA256SUMS
```

Di sebuah peramban, itulah kotak perbandingan di [Hash & Checksum](https://abox.tools/id/hitung-checksum/), yang menerima nilainya dalam bentuk apa pun yang ditulis penerbitnya — heksadesimal telanjang, sebaris keluaran `sha256sum`, sebuah file `SHA256SUMS` utuh, bentuk `SHA256 (disk.iso) = …`, atau sebuah atribut `integrity="sha384-…"` dari sebuah tag skrip — lalu mengatakan ya atau tidak dalam satu kalimat.

![Kartu pembanding: sebuah checksum ditempelkan ke kotaknya, dan putusan yang menyebut ia cocok dengan berkasnya.](https://abox.tools/screens/verify-a-file-checksum/compare.webp)

Tempelkan apa yang tertulis di halaman unduhan dan biarkan alat ini membandingkan. Membaca enam puluh empat karakter di layar adalah langkah yang dihapus oleh ini.

## Apa yang dibuktikan sebuah kecocokan, persisnya

Bahwa byte di disk Anda adalah byte yang ada di hadapan seseorang ketika mereka menuliskan angka itu. Itu hal yang sungguh berguna untuk diketahui dan ia lebih sempit daripada dugaan kebanyakan orang, jadi layak didaftarkan apa yang dicakupnya dan apa yang tidak.

**Sebuah kecocokan menyingkirkan:**

- unduhan yang berhenti lebih awal lalu meninggalkan Anda file yang tampak utuh;
- kerusakan dalam perjalanan, di disk yang mulai gagal, atau di kabel USB yang buruk;
- file yang keliru — hasil bangun ARM alih-alih yang x86, atau rilis bulan lalu;
- mirror yang diam-diam menyajikan sesuatu selain yang diiklankannya.

**Sebuah kecocokan tidak menyingkirkan:**

- **file-nya sendiri jahat.** Sebuah penerbit bisa mengukur perangkat perusak sama persis akuratnya dengan apa pun yang lain. Sebuah checksum berkata "inilah yang mereka kirimkan", tidak pernah "ini aman";
- **penerbitnya sudah dibobol.** Kalau ada yang mengganti file-nya di servernya, mereka mengganti checksum di sebelahnya pada menit yang sama. Yang membawa kita ke bagian berikutnya.

## Kekeliruan yang membuat seluruh latihannya sia-sia

Mengambil checksum-nya dari halaman yang sama, lewat koneksi yang sama, dengan file-nya.

Pikirkan apa yang sedang Anda pertahankan. Kalau kekhawatirannya adalah unduhan yang rusak, checksum-nya bisa datang dari mana saja dan pemeriksaannya bekerja. Kalau kekhawatirannya adalah seseorang mengutak-atik file-nya, maka siapa pun yang bisa mengubah file-nya bisa mengubah baris heksadesimal yang tercetak di bawahnya, karena keduanya datang dari server yang sama lewat koneksi yang sama. Anda akan meminta pemalsunya mengukuhkan tanda tangannya.

Sebuah checksum paling berharga ketika ia mencapai Anda lewat rute yang tidak dilalui file-nya:

- sebuah file `SHA256SUMS` dengan tanda tangan GPG terpisah, diperiksa terhadap kunci yang sudah Anda punya — inilah yang diterbitkan distribusi dan inilah jawaban yang sesungguhnya;
- pengumuman rilisnya di sebuah milis, atau sebuah tag di sebuah repositori sumber, alih-alih halaman unduhannya;
- sebuah mirror kedua di domain yang berbeda, lalu keduanya dibandingkan satu sama lain;
- sebuah pengelola paket, yang mengerjakan ini untuk Anda terhadap kunci yang dikirim bersama sistem operasinya.

Tidak satu pun dari itu membuat memeriksa checksum dari halaman yang sama jadi tak berguna. Ia menangkap unduhan yang rusak, dan itulah kegagalan yang benar-benar menimpa orang. Hanya saja jangan mengatakan pada diri sendiri bahwa ia menangkap hal lain.

## MD5 dan SHA-1 sudah patah. Pakai saja, kadang-kadang

Keduanya sudah dipatahkan dalam makna terkuat yang penting di sini: *tabrakan* bisa dibangun dengan sengaja. Dua file berbeda dengan MD5 yang sama sudah bisa dibangun di perangkat keras biasa sejak 2004, dan pada 2017 sebuah tim menghasilkan dua PDF berbeda dengan SHA-1 yang sama. Pada 2020, versi berawalan pilihan dari serangan itu turun ke beberapa puluh ribu dolar komputasi sewaan.

Apa artinya pada praktiknya: MD5 yang cocok tidak lagi memberi tahu Anda bahwa tidak ada yang mengutak-atik file-nya, karena orang yang mau bisa saja sudah membangun file berbeda dengan angka yang sama. Ia tetap memberi tahu Anda bahwa unduhannya tidak terpotong atau rusak, karena kecelakaan acak tidak akan mendarat pada sebuah tabrakan — itu peluang yang tidak pernah dimiliki kecelakaan mana pun.

Jadi kalau penerbitnya mencetak sebuah MD5 dan tidak lebih, periksa. Ia lebih berharga daripada tidak memeriksa. Dan kalau Anda yang menerbitkan, cetak sebuah SHA-256.

## Ia tidak cocok. Sekarang bagaimana?

1. **Unduh lagi**, dari tempat yang sama. Transfer yang terputus atau dilanjutkan adalah sejauh ini penyebab paling umum dan salinan kedua biasanya menyelesaikannya.
2. **Periksa Anda ada di baris yang benar.** Halaman rilis mendaftar beberapa file; checksum untuk pemasangnya tidak akan pernah cocok dengan arsipnya, dan hasil bangun ARM tidak akan pernah cocok dengan yang x86.
3. **Periksa versinya.** Halaman checksum yang dimarkahi jadi basi pada hari sebuah rilis kecil dikirimkan.
4. **Coba mirror yang lain** lalu bandingkan checksum kedua file-nya satu sama lain. Dua mirror yang sepakat satu sama lain dan tidak sepakat dengan angka yang diterbitkan adalah masalah yang berbeda dari satu mirror yang tidak sepakat dengan keduanya.
5. **Jangan buka sementara itu.** File yang gagal checksum-nya paling baik berarti rusak dan paling buruk berarti bukan file yang Anda minta.

## Kenapa mengerjakan ini di sebuah peramban sama sekali

Karena baris perintah bukan tempat kebanyakan orang berada, dan karena alternatif yang gamblang — sebuah situs web yang meminta Anda mengunggah file-nya — adalah hal yang aneh untuk dilakukan pada sebuah pemasang yang sudah Anda ragukan. Mengirim sebuah file ke suatu tempat untuk mencari tahu apakah ia diutak-atik dalam perjalanan menambahkan satu tempat lagi ia bisa diutak-atik.

[Hash & Checksum](https://abox.tools/id/hitung-checksum/) membaca file-nya dalam potongan empat megabita di mesin Anda sendiri, jadi tidak ada unggahan, tidak ada batas ukuran, dan tidak ada yang perlu dipercayai selain halamannya sendiri — yang bisa Anda baca, dan yang terus bekerja dengan jaringan tercabut. Kalau Anda lebih suka memercayai sistem operasi Anda sendiri, jalankan perintah dari bagian di atas lalu bandingkan kedua jawabannya. Mereka akan sepakat.
