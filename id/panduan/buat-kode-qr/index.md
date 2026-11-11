# Cara membuat kode QR yang tetap terpindai di ponsel orang lain

Membuat kode QR memakan sedetik. Membuat satu yang bekerja di menu yang basah, halte bus, atau ponsel yang dipegang sepanjang lengan di bawah cahaya yang buruk memakan empat keputusan, dan keempatnya dibuat sebelum Anda mencetak apa pun. Inilah apa yang dilakukan masing-masing.

[Buka Pembuat QR dan Barkode](https://abox.tools/id/buat-kode-qr/): Ketik, dan ia menjadi sebuah kode. Tidak ada yang dikirim untuk membuatnya.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

Buka [Pembuat QR & Barcode](https://abox.tools/id/buat-kode-qr/), tempelkan tautan Anda, biarkan tingkatnya di **M** dan marginnya di **4**, lalu unduh SVG-nya. Cetak setidaknya selebar dua sentimeter, di atas sesuatu yang matte, gelap di atas terang. Lalu pindai yang tercetak dengan ponsel yang bukan punya Anda sebelum Anda memesan seribu di antaranya.

Itu mencakup hampir setiap kasus. Sisa halaman ini adalah apa yang dilakukan ketika ia bukan salah satunya: kode yang harus selamat dari penanganan, kode dengan logo di atasnya, kode yang akan ditaruh di sesuatu yang kecil, dan satu keputusan yang gampang dikelirukan dengan cara yang baru Anda ketahui setahun kemudian.

## Apa sebenarnya yang ada di dalam sebuah kode QR

Sebuah teks. Itulah seluruhnya. Memindai sebuah kode QR menyerahkan sepotong teks kepada ponselnya, dan semua yang lain — membuka sebuah halaman, bergabung ke sebuah jaringan, menawarkan menyimpan sebuah kontak — adalah ponselnya yang mengenali bentuk teks itu lalu menawarkan menindaklanjutinya.

Jadi tidak ada yang namanya "kode QR Wi-Fi" sebagai sejenis kode. Yang ada adalah kode QR yang menyimpan `WIFI:T:WPA;S:Jaringan Saya;P:kata sandinya;;`, yang bisa dibaca setiap ponsel buatan satu dekade terakhir. Pembuatnya menampilkan teks jadinya kepada Anda persis karena alasan ini: ketika sebuah kode tidak melakukan yang Anda harapkan, teksnya adalah satu-satunya hal yang layak dilihat.

Ia juga berarti sebuah kode QR tidak bisa diubah setelah dicetak, tidak bisa menelepon pulang, dan tidak bisa kedaluwarsa — kecuali ada yang menaruh sebuah tautan ke server mereka sendiri di dalamnya, dan itulah pokok bagian terakhir di sini.

![Kode QR jadi dengan faktanya di bawah: simbologinya, versinya, tingkat koreksi galatnya, dan jumlah karakter yang dimuatnya.](https://abox.tools/screens/make-a-qr-code/result.webp)

Apa yang ada di dalam kode, disebut dengan istilah yang dipakai sisa panduan ini. Versinya tumbuh bersama isinya, dan karena itu dua pengaturan di bawah penting.

## Keputusan satu: tingkat koreksi galatnya

Sebuah kode QR membawa sekumpulan codeword periksa di samping datanya, dihitung supaya sebuah pembaca bisa membangun ulang apa yang tidak bisa dilihatnya. Itulah sebabnya kode yang sudutnya robek tetap terpindai. Berapa banyak codeword itu adalah tingkatnya, dan ada empat:

- **L** — sekitar 7% kodenya boleh hilang.
- **M** — sekitar 15%.
- **Q** — sekitar 25%.
- **H** — sekitar 30%.

Koreksi yang lebih banyak tidak gratis: data periksanya masuk ke persegi yang sama, jadi teks yang sama pada H butuh kode yang lebih besar dan lebih rapat daripada pada L. Kira-kira, berpindah dari L ke H menggandakan jumlah modulnya untuk teks yang sama, dan modul yang lebih rapat lebih sulit dipisahkan sebuah kamera. Ada pertukaran yang nyata di sini dan jawabannya tergantung ke mana kodenya akan pergi.

**L** untuk sebuah layar: kode di sebuah slide, sebuah surel, sebuah halaman web. Tidak ada yang akan merusaknya dan setiap modul tambahan membuatnya lebih sulit dibaca dari jauh.

**M** adalah bawaannya dan jawaban yang benar untuk kebanyakan pencetakan. Kertas yang akan sedikit ditangani, selebaran, kartu nama.

**Q dan H** untuk kode yang akan diperlakukan kasar: menu yang dilap setiap hari, stiker di sebuah mesin di bengkel, label di sebuah peti, kode di jendela yang terkena matahari langsung. H juga yang memungkinkan sebuah logo di tengahnya — lihat di bawah.

![Opsi QR: menu tingkat koreksi galat disetel ke sedang, dan zona sunyi selebar empat modul.](https://abox.tools/screens/make-a-qr-code/options.webp)

Keduanya soal kode yang bertahan di dunia nyata, sebuah lipatan, sebuah logo, cetakan yang buruk, dan keduanya disetel sebelum kodenya digambar.

## Keputusan dua: marginnya, yang merupakan bagian dari kodenya

Ruang putih di sekeliling sebuah kode QR bukan isian, dan bukan pilihan desain. Sebuah pembaca memakainya untuk menemukan di mana simbolnya berakhir. Spesifikasinya meminta empat modul ruang tenang di setiap sisinya, dan kode yang dipangkas sampai ke tepinya adalah alasan tunggal yang paling umum sebuah kode tercetak gagal.

Ini layak dinyatakan blak-blakan karena memangkas adalah hal yang begitu wajar untuk dilakukan. Kodenya tampak punya terlalu banyak putih di sekelilingnya, jadi ia dipangkas di tata letaknya, atau dijatuhkan ke sebuah panel berwarna yang merapat sampai ke kotak-kotaknya, atau ditaruh di atas sebuah foto. Masing-masing itu membuang batas yang akan dipakai pembacanya.

Kalau kodenya tampak terlalu besar dengan marginnya, kecilkan kodenya. Jangan buang marginnya.

## Keputusan tiga: seberapa besar mencetaknya

Patokan kasar yang selamat dari benturan dengan kenyataan adalah **satu banding sepuluh**: sebuah kode perlu selebar kira-kira sepersepuluh jarak dari mana ia akan dipindai.

- Kartu nama atau menu, dibaca dari 30 cm: sekitar 2 cm lebarnya.
- Poster yang dibaca dari dua meter: sekitar 20 cm.
- Halte bus atau etalase toko yang dibaca dari lima meter: sekitar 50 cm.

Dua sentimeter itu lantai, bukan sasaran. Di bawah sekitar 1,5 cm sebuah ponsel biasa mulai kepayahan tanpa peduli sebagus apa cetakannya, karena masing-masing modulnya mendekati ukuran sebuah piksel di kameranya.

Teks yang lebih sedikit berarti modul yang lebih sedikit berarti kode yang terbaca dari jauh pada ukuran cetak tertentu — dan itu alasan yang bagus untuk mengarahkan sebuah kode ke `contoh.com/x` alih-alih ke sebuah URL dengan seratus karakter parameter pelacakan di ujungnya.

Dan cetak dari **SVG**-nya. Sebuah kode QR terbuat dari tepi, dan sebuah PNG punya jumlah piksel yang tetap untuk membuatnya; besarkan satu dan setiap tepinya melembek, dan justru itulah yang menyulitkan sebuah pemindai. SVG adalah kotaknya sebagai instruksi, jadi ia keluar tajam di sebuah kartu nama maupun sebuah baliho.

## Warna, kontras, dan dua kekeliruannya

Sebuah pembaca mengukur selisih antara modul gelap dan modul terangnya, jadi kontras adalah seluruhnya. Dua hal rutin keliru:

**Kode terang di atas latar gelap.** Ia tampak mencolok, dan cukup banyak pembaca menolaknya mentah-mentah: mereka mencari gelap di atas terang dan tidak mencoba kebalikannya. Sebagian mencoba. Anda tidak akan tahu pelanggan Anda punya yang mana.

**Selisihnya tidak cukup.** Abu-abu sedang di atas putih, atau dua warna merek yang bobotnya mirip, bisa terukur baik-baik saja di layar lalu gagal di kertas begitu penyebaran tinta dan pencahayaan otomatis sebuah ponsel terlibat. Kalau Anda mewarnai sebuah kode, jaga bagian gelapnya benar-benar gelap.

Matte mengalahkan glossy untuk apa pun yang akan dipindai di bawah cahaya, dan keduanya mengalahkan mencetak ke atas sebuah foto. Latar transparan berguna untuk menaruh sebuah kode ke panel berwarna — tapi periksa apa yang sebenarnya berakhir di belakangnya, karena kode transparan di atas panel gelap adalah kekeliruan pertama di atas dengan langkah tambahan.

## Logo di tengahnya

Ini bekerja, dan ia bekerja karena koreksi galatnya alih-alih meski ada koreksi galatnya. Pada tingkat H kira-kira 30% modulnya boleh dihancurkan dan kodenya tetap terbaca, jadi logo yang menutupi lebih sedikit daripada itu — di tengah, tempat tidak ada pola pencari duduk — adalah kerusakan yang diperbaiki pembacanya.

Tiga hal yang harus dipegang. Pakai tingkat H. Jaga logonya di bawah seperlima luasnya, jauh di bawah batas teoretisnya, karena cetakan bukan satu-satunya hal yang menggerogoti kelonggaran Anda. Dan jangan pernah menutupi tiga persegi besar di sudutnya atau yang lebih kecil di dekatnya: itulah cara sebuah pembaca menemukan dan mengarahkan simbolnya sejak awal, dan tidak ada koreksi galat sebanyak apa pun yang membangunnya kembali.

Lalu uji di ponsel sungguhan. Sebuah logo membawa sebuah kode dari "selalu bekerja" menjadi "bekerja dengan kelonggaran sekian", dan satu-satunya cara mengetahui berapa kelonggaran yang tersisa adalah mencobanya.

## Keputusan yang disesali orang: statis atau "dinamis"

Cari sebuah pembuat QR dan kebanyakan hasilnya ingin Anda membuat sebuah akun, karena mereka menjual kode *dinamis*. Kode dinamis tidak memuat tautan Anda. Ia memuat sebuah tautan pendek ke server pembuatnya sendiri, yang mengalihkan ke tautan Anda.

Yang Anda dapat dari situ nyata: Anda bisa mengubah ke mana kodenya menunjuk setelah ia dicetak, dan Anda mendapat hitungan setiap pemindaian. Untuk sebuah kampanye dengan cetakan enam digit, itu sepadan dibayar.

Berapa harganya juga nyata, dan layak diketahui sebelumnya alih-alih sesudahnya:

- **Kodenya berhenti bekerja ketika mereka berhenti bekerja.** Kalau layanannya tutup, domainnya kedaluwarsa, atau paket gratisnya habis, setiap kode yang Anda cetak mati — dan saat itu mereka sudah ada di sepuluh ribu menu.
- **Setiap pemindaian adalah data orang lain.** Pengalihannya melihat alamat IP, waktu, dan perangkat setiap orang yang memindai kode Anda.
- **Tautannya milik mereka, bukan milik Anda.** Siapa pun yang memindainya melihat sebuah domain asing berkelebat, dan justru itulah yang sedang diberitahukan kepada orang-orang untuk dicurigai.

Jalan tengahnya tidak berbiaya: taruh kode QR statis di sekeliling sebuah URL pendek *di domain Anda sendiri*, lalu alihkan itu sendiri. Anda menyimpan kemampuan mengubah tujuannya, Anda menyimpan analitiknya, dan tidak ada apa pun tentang kodenya yang bergantung pada perusahaan yang belum pernah Anda temui masih ada tahun depan.

[Pembuat di sini](https://abox.tools/id/buat-kode-qr/) hanya membuat kode statis, dan ia tidak punya akun untuk dibuat. Yang Anda ketik itulah yang disimpan kodenya.

## Sebelum Anda mencetak seribu di antaranya

Pindai kodenya. Bukan yang di layar Anda — cetakan contohnya, di tempat ia akan ditaruh, dengan ponsel yang bukan ponsel tempat Anda membuatnya. Itu memakan satu menit dan menangkap seluruh kategori masalah yang menjadi pokok halaman ini: margin yang dimakan tata letaknya, tautan yang kehilangan `https://`-nya, warna yang terukur berbeda di kertas, kode yang dicetak pada ukuran yang bekerja di meja dan tidak di dinding.

Dan periksa apa yang terjadi setelah pemindaiannya. Kode yang membuka halaman yang tidak terbaca di sebuah ponsel adalah kode yang gagal, meskipun ia terpindai.

## Tidak satu pun dari ini menuntut mengunggah apa pun

Kode QR adalah hitungan atas sebuah teks. Tidak ada file untuk dikirim dan tidak ada yang bisa dilakukan sebuah server yang tidak bisa dilakukan sebuah peramban, dan itulah sebabnya [alat di sini](https://abox.tools/id/buat-kode-qr/) melakukan semuanya di mesin Anda sendiri dan bekerja dengan jaringan tercabut.

Itu lebih penting daripada kedengarannya, karena apa yang ditaruh orang di kode QR. Pemakaian paling umum untuk format Wi-Fi adalah kata sandi sesungguhnya sebuah jaringan, diketik ke sebuah halaman web. Layak diketahui apakah halaman itu punya tempat untuk mengirimnya.
