# Cara memotong video tanpa mengodekannya ulang

Memotong tidak mengubah rupa satu bingkai pun, jadi pemotong yang baik tidak menyentuhnya — ia memindahkannya ke file baru persis seperti sebelumnya. Ini menjelaskan apa yang Anda dapat dari situ, dan satu tempat yang memperlihatkannya.

[Buka Pemotong Video](https://abox.tools/id/potong-video/): Tandai bagian yang layak disimpan sambil diputar. Dapatkan kembali sebagai satu video.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pemotong Video](https://abox.tools/id/potong-video/), jatuhkan klipnya, tekan `I` dan `O` untuk menandai setiap bagian yang Anda mau — sebanyak yang Anda suka — lalu ekspor. Pada sebuah MP4, MOV, atau M4V, bingkai yang Anda simpan dipindahkan ke file barunya persis seperti sebelumnya — byte yang sama, setelan pengode yang sama, semuanya sama — dan suaranya disalin sampel demi sampel tanpa didekodekan.

Artinya sebuah pemotongan tidak mengorbankan kualitas apa pun dari Anda, dan ia cepat: memotong satu menit dari rekaman empat gigabita memakan kira-kira sebanyak biaya menulis satu menit itu ke disk, karena bingkainya ditunjuk alih-alih dimuat. Satu tempat yang memperlihatkan ini adalah di mana potongan Anda sebenarnya mendarat, dan itulah sisa halaman ini.

## Kenapa sebuah pemotongan sama sekali tidak perlu kehilangan kualitas

Memotong tidak mengubah rupa satu bingkai pun. Setiap bingkai yang Anda simpan seharusnya keluar identik dengan saat ia masuk, jadi tidak ada alasan mendekodekannya lalu mengodekannya lagi — dan ada segala alasan untuk tidak, karena pengodean ulang itu merugikan dan akan membuat seluruh klipnya sedikit lebih buruk demi memendekkannya.

Jadi pemotong yang baik tidak mengodekan ulang. Ia membaca indeks file-nya, memperhitungkan bingkai terkodekan mana yang jatuh di rentang Anda, lalu menulis byte itu ke sebuah wadah baru dengan indeks baru di depannya. Sama sekali tidak ada yang didekodekan di jalur itu.

Banyak alat tetap mengodekan ulang, karena mendekodekan dan mengodekan ulang jauh lebih sederhana diwujudkan daripada membaca format wadahnya. Anda biasanya bisa tahu Anda sedang memakai yang mana dari berapa lama waktunya: penyalinan dibatasi seberapa cepat disk Anda menulis, dan pengodean ulang dibatasi seberapa cepat mesin Anda mengodekan video, yang seratus kali lebih lambat.

## Keyframe, dan kenapa potongan Anda bisa mendarat lebih awal

Inilah kekangan yang menjadi asal segala hal tentang pemotongan.

Video tidak disimpan sebagai runtutan gambar utuh. Itu akan sangat besar. Kebanyakan bingkai disimpan sebagai keterangan tentang bedanya mereka dengan tetangganya, dan itu berarti mereka tidak bisa didekodekan sendirian — Anda butuh bingkai di sekitarnya. Hanya sebuah **keyframe** yang berdiri sendiri sebagai gambar utuh, dan keyframe biasanya berjarak satu sampai sepuluh detik.

Jadi kalau Anda menandai sebuah potongan dua detik setelah keyframe terakhir, pemotong yang menyalin bingkai tidak bisa mulai di sana. Bingkai di tanda Anda tidak terbaca tanpa rangkaian yang menuju ke sana. Ia harus membawa seluruh bentangan dari keyframe di depan tanda Anda.

Yang dilakukannya soal itulah bagian yang menarik. Format file-nya punya cara baku untuk berkata *mulai putar di titik ini* — bingkai tambahannya ada di file-nya tapi wadahnya menyuruh pemutarnya melewatinya. Setiap pemutar arus utama mematuhinya, dan klipnya mulai persis di tempat yang Anda sebutkan. Pemutar yang mengabaikannya akan mulai lebih awal, sejauh-jauhnya sepanjang jarak antar keyframe.

Alat di sini memberi tahu Anda Anda berada di kasus yang mana dan seberapa jauh sebelum Anda mengekspor, jadi ia sebuah keputusan alih-alih sebuah kejutan.

## Kapan sebaiknya menerima pengodean ulang

Ada potongan yang tepat, dan ia bekerja dengan mengodekan ulang bentangan pembukanya — mendekodekan dari keyframe-nya, lalu menuliskan rangkaian bingkai baru yang sungguh mulai di tempat yang Anda tandai. Ia lebih lambat, dan ia mengorbankan sedikit kualitas hanya pada bentangan pembuka itu.

Pilih itu ketika klipnya akan pergi ke tempat yang tidak akan mematuhi instruksi wadahnya, atau ke tempat yang pemutarnya tidak bisa Anda kendalikan: sebagian penyunting video, sebagian sistem siaran dan konferensi, sebagian pemutar perangkat keras yang lebih tua. Pilih penyalinannya untuk semua yang lain, dan itu hampir semuanya — sebuah peramban, sebuah ponsel, sebuah lapak media sosial, sebuah pemutar media.

Pilihan ketiga yang tidak berbiaya: geser tanda Anda. Kalau alatnya menunjukkan di mana keyframe-nya berada, menggeser potongannya ke yang terdekat memberi Anda potongan yang tepat sama sekali tanpa pengodean ulang. Jarang sekali selisih satu detik sepadan dengan melepaskan sebuah penyalinan.

![Kartu ekspor: metodenya, penggeser kualitas, sakelar suara, dan ringkasan yang menghitung potongannya, durasinya, dan ukurannya.](https://abox.tools/screens/trim-a-video/summary.webp)

Di ringkasan itulah keputusan bagian ini diambil: berapa biaya penyalinan, dan berapa biaya pengodean ulang sebagai gantinya.

## Mengeluarkan sepotong dari tengah

Memotong keluar sebuah bagian adalah operasi yang berbeda dari menyimpan satu bagian, dan layak diketahui bahwa ia didukung, karena banyak pemotong hanya melakukan yang kedua. Tandai bagian yang tidak Anda mau, pilih untuk memotongnya keluar, dan yang tersisa di kedua sisinya disambung menjadi satu klip dengan suaranya dibawa seiring.

Sambungannya punya kekangan keyframe yang sama di titik tempat separuh keduanya melanjut, karena alasan yang sama. Ia bekerja di kedua jalur MP4 di sini. Ia satu hal yang tidak bisa dilakukan jalur cadangan lewat perekaman di bawah, karena sebuah rekaman dibuat dalam satu jalan dari satu kepala pemutar.

![Garis waktu dengan dua bagian ditandai, dan di bawahnya tabel berisi awal, akhir, dan durasi masing-masing serta total yang dipertahankan.](https://abox.tools/screens/trim-a-video/marks.webp)

Dua potong dipertahankan dari satu klip. Tabelnya bisa disunting, jadi tanda yang jatuh seperlima detik terlambat cukup diketik alih-alih ditandai ulang.

## Format, dan jalur cadangannya

**MP4, M4V, dan MOV** dibaca langsung, apa pun kodek di dalamnya — H.264, HEVC, AV1, VP9. Menyalin bingkai tidak melibatkan pendekodeannya, jadi jalur ini bekerja bahkan untuk kodek yang sama sekali tidak punya dekoder di peramban Anda, dan itu akibat yang menyenangkan dari tidak melihat gambarnya.

**Apa pun lain yang bisa diputar peramban Anda**, WebM yang paling jelas, dipotong dengan memutarnya lalu merekam hasilnya. Itu bekerja, dan ia punya dua ongkos: ia memakan waktu selama panjang bagiannya, dan gambar serta suaranya dikodekan lagi.

**AVI, WMV, FLV, dan kebanyakan MKV** tidak bisa dibaca maupun diputar peramban, dan alatnya mengatakannya alih-alih gagal di tengah jalan. Ubah dulu yang itu menjadi MP4 dengan sesuatu yang menanganinya.

## Dua hal yang diam-diam keliru di tempat lain

**Rotasi.** Sebuah ponsel merekam dalam lanskap lalu menulis instruksi rotasi ke dalam file-nya alih-alih memutar pikselnya. Pemotong yang menyalin bingkai harus membawa instruksi itu ikut, atau klip potret Anda keluar miring — dan itulah cara klasik sebuah video yang dipotong menjadi rusak. Jalur yang tepat di sini memutar bingkainya sambil mengodekannya ulang lalu menulis file yang sama sekali tidak butuh rotasi.

**Sinkron audio.** Audio dan video disimpan sebagai aliran terpisah dengan pewaktuannya sendiri, dan keduanya tidak dipotong di titik yang sama. Kalau keduanya tidak disejajarkan dengan sengaja di potongannya, suaranya melenceng. Pada jalur penyalinan di sini, audionya disalin sampel demi sampel tanpa didekodekan, jadi ia byte demi byte sama dengan yang ada di file-nya, dan sebuah tanda sunting menjaganya seiring gambarnya sampai seperseribu detik.

## Memotong bukan memangkas

Dua kata yang saling dipakai untuk yang lain. Memotong mengubah panjang klipnya; memangkas mengubah bentuk gambarnya. Kalau yang Anda mau adalah versi persegi dari video lanskap, atau bilah hitam hilang dari sisinya, itulah [Pemangkas Video](https://abox.tools/id/pangkas-video/) — dan tidak seperti pemotongan, ia memang harus mengodekan ulang, karena alasan yang dijelaskan [panduannya](https://abox.tools/id/panduan/pangkas-video/).

## Kenapa ini tidak butuh unggahan — terutama yang ini

Video adalah jenis file yang paling dikira orang harus diunggah, karena file-nya besar dan pekerjaannya terdengar berat. Pemotongan adalah kasus yang paling tidak begitu: pada jalur penyalinan, file-nya nyaris tidak dibaca sama sekali. Alatnya menyusuri indeksnya, memperhitungkan rentang byte mana yang disimpan, lalu menuliskannya. Mengunggah file empat gigabita ke sebuah server supaya ia bisa melakukan itu akan menjadi cara paling lambat yang mungkin untuk mengaturnya.

Ia juga jenis file yang mengunggahnya paling mahal kalau Anda lebih suka tidak: video membawa wajah, suara, rumah, dan lokasi dengan cara yang tidak dilakukan sebuah dokumen. Alat di sini tidak punya fitur jaringan dalam bentuk apa pun, dan `Content-Security-Policy` halamannya menyebut satu per satu setiap alamat yang boleh dihubunginya, dan tidak satu pun milik situs ini.

Cabut koneksi internet lalu potong sebuah klip kalau Anda lebih suka memeriksa daripada diberi tahu. [Amankah mengunggah file ke pengubah daring?](https://abox.tools/id/panduan/apakah-aman-mengunggah-file/) memaparkan tiga pemeriksaan lain seperti itu.
