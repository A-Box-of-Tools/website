# Cara menjiplak gambar menjadi SVG

PNG yang diperbesar adalah tangga. SVG adalah perintah menggambar, jadi tajam pada ukuran berapa pun — dan mengubah yang satu menjadi yang lain disebut menjiplak. Ia bekerja indah pada bentuk dan buruk pada foto, dan perbedaannya patut dipahami sebelum mulai.

[Buka Gambar ke SVG](https://abox.tools/id/gambar-ke-svg/): Satu bentuk, satu garis luar. Tunjuk saja yang seharusnya tidak ada.

Terakhir diperbarui 31 Agustus 2026

## Jawaban singkatnya

Buka [Gambar ke SVG](https://abox.tools/id/gambar-ke-svg/), jatuhkan gambarnya ke sana, dan lihat garis merahnya. Garis itu adalah garis luar sebagaimana adanya sekarang, digambar di atas piksel asalnya. Kalau ia mengikuti bentuknya, ambil file-nya. Kalau ada sesuatu di dalamnya yang seharusnya tidak ada — bintik, staples, keterangan, bayangan — klik benda itu dan ia hilang.

Semua yang di bawah ini adalah dua pertanyaan yang memutuskan apakah ini berhasil sama sekali: **apakah gambar Anda sebuah bentuk atau sebuah foto**, dan **cara mana dari dua cara menemukan bentuk yang ia butuhkan**.

![Dua panel: di kiri gambar dengan garis luar merah hasil jiplakan di atasnya, di kanan SVG yang sudah jadi.](https://abox.tools/screens/trace-an-image-into-an-svg/outline.webp)

Garis luar digambar di atas gambarnya, bukan hanya di sebelahnya. Itu satu-satunya tempat pertanyaan ini bisa diputuskan — garis luar itu benar atau salah terhadap piksel-piksel itu dan bukan terhadap hal lain.

## Menjiplak bukan mengonversi, dan foto tidak bisa dijiplak

Mengonversi JPEG menjadi PNG adalah konversi: gambar yang sama, dijelaskan dengan cara lain, dan tidak ada yang diputuskan di tengah jalan. Menjiplak bukan itu. Ia membuang hampir semuanya dan menyimpan satu hal — batas sebuah bentuk — lalu menjelaskan batas itu sebagai kurva. Kalau gambar Anda punya satu bentuk yang jelas, itu persis yang Anda inginkan. Kalau ia foto sebuah ruangan, tidak ada bentuk untuk disimpan, dan yang kembali adalah setiap bercak warna yang mirip berubah menjadi noda tersendiri.

Ini bukan keterbatasan yang menunggu diatasi rekayasa, jadi ada baiknya berterus terang tentang angkanya. Selembar A4 gambar garis terjiplak menjadi tiga bentuk dan enam kilobyte. Selembar tulisan tangan, lima puluh bentuk dan seratus lima puluh. Satu megapiksel foto saja terjiplak menjadi **empat ribu bentuk dan satu setengah megabyte** — lebih besar dari JPEG-nya, lebih lambat dibuka, dan tidak mirip fotonya. Alat ini berhenti menggambar pada titik itu dan mengatakannya, alih-alih membiarkan Anda mengetahuinya setelah mengunduh.

![Peringatan yang ditampilkan saat sebuah foto dijiplak: ribuan bentuk terpisah dan file yang sangat besar.](https://abox.tools/screens/trace-an-image-into-an-svg/photograph.webp)

Ke mana sebuah foto berujung ketika dijiplak sebagai gambar garis. File-nya tetap bisa Anda unduh; halaman ini hanya menolak berpura-pura bahwa itu sebuah gambar.

Yang terjiplak dengan baik:

- logo, merek, dan monogram;
- stensil, stempel, dan file potong;
- tanda tangan dan huruf tulisan tangan;
- gambar garis, arsiran, dan tinta komik;
- siluet, dan apa pun yang sudah hitam di atas putih.

Ada satu pekerjaan fotografi yang memang berhasil, dan itu pekerjaan yang berbeda: memotong satu benda dari latarnya sebagai siluet padat. Untuk itulah pengaturan kedua.

## Dua cara menemukan bentuk

Menjiplak butuh satu bit per piksel — di dalam, atau di luar — dan ada dua cara memutuskannya.

**Terang dan gelap** bertanya apakah setiap piksel lebih gelap dari satu tingkat, dan tingkatnya dihitung untuk Anda. Itu tepat sekali untuk tinta di atas kertas, dan itulah yang Anda inginkan untuk setiap logo, pindaian, dan stensil. Kalau salah, biasanya salahnya terlihat: geser ambangnya sampai garis-garis tipis bertahan tanpa kertasnya ikut menjadi abu-abu.

**Subjeknya** mengajukan pertanyaan lain, karena pada foto, pertanyaan pertama tidak punya jawaban. Patung merah tua yang berdiri di atas batu abu-abu tua adalah gelap di atas gelap: tidak ada kecerahan yang memisahkan keduanya, jadi tidak ada ambang yang bisa. Sebagai gantinya, cara ini belajar apa itu *latar* dari sebuah pita di sepanjang tepi gambar, mengukur setiap piksel terhadapnya, dan menyimpan hal terbesar yang bukan latar. Keterangan di pojok bukan hal terbesar, jadi ia dibuang dan bukannya dijiplak.

Ia punya satu kegagalan yang patut diketahui di muka: foto yang dipangkas begitu rapat sampai subjeknya keluar di dua atau tiga sisi. Tepinya saat itu sebagian besar adalah subjek, jadi modelnya mempelajari warna subjek itu sendiri dan jawabannya keluar terbalik. Tidak ada bagian dari itu yang bisa diperbaiki dengan mengutak-atik penggeser — yang salah adalah asumsinya, bukan hitungannya. Matikan *pelajari latar dari tepi*, centang *klik untuk bilang “ini latar” saja*, dan klik latarnya dua atau tiga kali.

## Memperbaiki yang salah, dengan menunjuknya

Ambang adalah satu angka untuk seluruh gambar, dan selalu salah di suatu tempat: bayangan menjadi tinta, staples bertahan, tengah huruf O terisi. Masing-masing adalah kesalahan lokal dengan perbaikan lokal yang jelas, dan perbaikannya bukan penggeser lain — melainkan menunjuk bendanya.

Klik apa pun yang seharusnya tidak ada di gambar dan ia hilang; klik lagi dan ia kembali. Satu klik mengambil **seluruh bercak warna itu**, jadi satu klik membuang seluruh bintik atau seluruh stempel, bukan satu piksel. Mengeklik bagian latar yang terkurung justru mengisinya, dan begitulah lubang yang seharusnya bukan lubang ditutup. Baris di bawah gambar memberi tahu yang mana dari keduanya dan seberapa besar sebelum Anda mengeklik, jadi klik yang akan mengambil sebagian besar gambar tidak pernah menjadi kejutan.

Koreksi disimpan terpisah dari ambang, jadi menggeser penggesernya setelah itu tidak membuangnya, dan membalik gambar ikut membalik koreksinya — bintik yang Anda hapus tetap terhapus dan tidak muncul kembali sebagai lubang di latar.

## Dua angka kehalusan, dan kapan menyentuhnya

**Detail** adalah seberapa jauh garis boleh menjauh dari piksel saat disederhanakan. Di bawah sekitar satu, ia tidak melakukan apa-apa — satu anak tangga berada satu piksel penuh di luar garis tempatnya seharusnya, jadi toleransi yang lebih kecil menyimpan setiap anak tangga dan tidak ada yang tersisa untuk disederhanakan. Di atas sekitar dua, ia mulai memakan kurva yang sungguhan. Ia dihitung per bentuk kecuali Anda bilang lain, karena satu angka tidak bisa sekaligus melayani sosok utuh dan batang huruf selebar dua piksel.

**Ketajaman sudut** adalah seberapa jauh garis luar harus berbelok agar belokan itu tetap menjadi sudut dan bukannya dibulatkan menjadi kurva. Ini hanya separuh keputusan — sebuah simpul juga tetap menjadi sudut kalau cukup jauh dari tetangganya, yang dengan sendirinya menangkap setiap sudut yang jelas — jadi angka ini hanya pernah memutuskan belokan-belokan yang landai. Di bawah sekitar dua puluh derajat, semuanya menjadi sudut dan lingkaran kembali sebagai poligon.

Kebanyakan gambar tidak perlu menyentuh keduanya. Keduanya patut diketahui untuk dua kasus yang membutuhkannya: pindaian teks yang sangat kecil, yang butuh lebih banyak detail, dan bentuk yang akan Anda potong di mesin, yang biasanya butuh lebih sedikit.

## Yang Anda dapatkan, dan apa yang bisa dilakukan dengannya

Satu file dengan satu `<path>` di dalamnya. Garis luar berputar ke satu arah dan lubang di dalamnya ke arah sebaliknya, dan itulah yang membuat bentuk dengan empat puluh lubang bisa menjadi satu elemen tanpa aturan isian yang perlu diatur — jadi Illustrator, Inkscape, Figma, peramban, dan kebanyakan perangkat lunak potong membacanya sama.

![Langkah terakhir: berapa bentuk dan titik yang dimiliki gambar, ukurannya, dan tombol unduh.](https://abox.tools/screens/trace-an-image-into-an-svg/save.webp)

Angkanya patut dilihat sebelum mengunduh. Sebuah gambar adalah puluhan atau ratusan titik; ribuan berarti gambarnya adalah foto.

Arah sebaliknya — SVG yang sudah Anda punya, dan PNG yang Anda butuhkan — adalah [pekerjaan berbeda dengan panduannya sendiri](https://abox.tools/id/panduan/svg-ke-png/). Tidak ada bagian dari menjiplak yang bisa dibalik: SVG yang keluar dari sini adalah gambar baru dari bentuknya, bukan gambar asal pembuatannya.
