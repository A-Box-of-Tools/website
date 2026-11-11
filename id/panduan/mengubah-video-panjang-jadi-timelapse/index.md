# Cara mengubah video panjang menjadi timelapse

Satu jam matahari terbenam, sehari penuh proyek bangunan, perjalanan harian dari balik kaca depan: rekaman yang layak disimpan, pada kecepatan yang tidak akan ditonton siapa pun. Pekerjaannya hanyalah satu keputusan tentang waktu dan satu tentang tujuan, dan semuanya berjalan di peramban Anda, pada berkas yang tidak pernah meninggalkan komputer Anda.

[Buka Pembuat Time-Lapse](https://abox.tools/id/buat-video-time-lapse/): Rekaman satu jam, dalam dua puluh detik.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pembuat timelapse](https://abox.tools/id/buat-video-time-lapse/), jatuhkan rekamannya, lalu tetapkan kecepatan — berapa pun dari 1,1× sampai 1000× — atau, tanpa berhitung, berapa lama hasilnya harus berjalan. Enam puluh detik adalah titik awal yang baik untuk apa pun yang masuk ke lini masa. Pilih bingkai per detik, kecilkan ukuran bila aslinya 4K, lalu ekspor.

Bila tujuannya hanya menganimasikan GIF, lewatkan klip hasil ekspor itu ke pengubah [Video ke GIF](https://abox.tools/id/video-ke-gif/); tetapi baca dulu bagian terakhir, karena timelapse adalah muatan paling mahal yang bisa Anda minta dipikul sebuah GIF.

Perjalanan itu sudah tersedia: setelah ekspor, sebuah baris di bawah tombol unduh menawarkan membawa hasilnya langsung ke pengubah, dan klip tiba di sana sudah termuat.

## Sebutkan durasinya, bukan kecepatannya

"Seberapa cepat" adalah pertanyaan yang keliru, karena jawaban jujurnya adalah pembagian yang semestinya tidak perlu Anda kerjakan: sembilan puluh menit rekaman dalam satu menit hasil berarti 90×; sehari proyek bangunan dalam tiga puluh detik lebih dekat ke 3000× daripada angka mana pun yang disarankan sebuah penggeser. Perkakas ini menerima durasi akhir secara langsung dan menghitung faktornya sendiri, sehingga jawabannya tetap berlaku pada hari Anda memasukkan rekaman yang lebih panjang.

Faktor kecepatan masih berguna untuk angka-angka kecil. Antara 1,1× dan 2× sebuah video tetap *enak ditonton sebagai video* — kuliah, demonstrasi — dan di atas kira-kira 8× ia berhenti menjadi pemutaran cepat dan menjadi timelapse: setiap bingkai keluaran adalah cuplikan yang dipetik dari aliran waktu, dan segala yang berada di antara cuplikan itu memang sudah tiada.

Pencuplikan itu pula yang membuat pekerjaannya cepat. Perkakas ini hanya membaca saat-saat yang dibutuhkan keluaran — pada 100×, kira-kira seperseratus berkas — alih-alih mendekode satu jam untuk menyimpan satu menit.

![Kartu kecepatan: kecepatan dua puluh kali, durasi yang dihasilkannya, jarak antarbingkai yang dipertahankan, dan laju bingkai.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

Sebutkan durasi yang Anda inginkan dan kecepatannya mengikuti, atau sebaliknya. Jaraknya adalah angka yang menyebut berapa banyak bagian aslinya yang dilewati.

## Bingkai dan ukuran, singkatnya

- **Bingkai per detik.** 30 terbaca sebagai gerakan mulus untuk hampir semuanya; 60 baru pantas dengan bobot dua kali lipatnya bila gerakan itu sendiri pokok bahasannya, dan 24 memberi awan dan kerumunan detak film yang menyenangkan.
- **Ukuran.** Timelapse hampir selalu ditonton kecil. Menurunkan 4K ke 1080p memangkas piksel yang harus dijelaskan pengode menjadi seperempatnya, dan di layar ponsel tidak akan ada yang tahu.

![Ringkasan kartu ekspor: jumlah bingkai, jaraknya, durasi jadinya, perkiraan ukurannya, dan seberapa banyak berkas yang harus dibaca.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

Baris terakhir itulah yang layak diperhatikan: sebuah selang waktu hanya membaca sebagian kecil berkasnya, dan karena itu ini cepat pada klip yang pengodean ulangnya akan makan waktu sejam.

## Kapan timelapse ingin menjadi GIF

Hampir tidak pernah. Timelapse adalah perubahan terus-menerus di seluruh bingkai — persis hal yang paling buruk bagi kompresi GIF — sehingga yang pendek pun jatuh ke puluhan megabita sementara MP4-nya hanya sepersepuluhnya, lebih tajam. Unggah videonya ke mana pun video bisa diputar.

Bila tujuannya sungguh hanya menganimasikan GIF, pangkas urutannya menjadi beberapa detik yang berputar di [lini masa pengubah](https://abox.tools/id/video-ke-gif/), jaga lebarnya tetap sederhana, dan biarkan bingkainya turun ke ⁦10–12⁩. [Panduan GIF sebagian](https://abox.tools/id/panduan/gif-dari-potongan-video/) adalah versi panjang dari anggaran itu.

## Bila Anda melakukannya setiap minggu

Kedua langkah itu tinggal di dua halaman memang disengaja: setiap halaman mengerjakan satu tugas, dan masing-masing bisa membuktikan sendiri bahwa tidak ada yang meninggalkan komputer Anda. Namun semua yang dijalankan kedua halaman itu open source: lisensi MIT, satu folder per perkakas, modul ES tanpa dependensi dengan README yang menyebut mereka satu per satu.

Bila kamera di tripod adalah bagian dari rutinitas Anda, arahkan agen kode ke [repositori](https://github.com/A-Box-of-Tools/website) dan minta ia merangkai pencuplik dan pengode GIF menjadi satu halaman dengan kecepatan serta ukuran Anda yang sudah terpasang. Modul-modul itu ditulis untuk dibaca, dan membawanya pergi adalah persis alasan lisensinya ada.
