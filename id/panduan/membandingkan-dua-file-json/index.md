# Cara membandingkan dua file JSON

Bandingkan dua file JSON apa adanya dan hampir semua yang menyala bukan apa-apa: indentasi, pemenggalan baris, kunci dalam urutan lain. Obatnya bukan diff yang lebih pintar — melainkan melewatkan kedua file lebih dulu lewat pemformat yang sama, supaya yang tersisa hanya perbedaan sungguhan. Kedua langkah berjalan di peramban Anda, tempat yang memang seharusnya bagi file konfigurasi yang menyimpan rahasia.

[Buka Pembanding Teks](https://abox.tools/id/bandingkan-teks/): Dua teks masuk, setiap perbedaan ditandai, baris demi baris dan kata demi kata. Tidak ada yang ditempelkan ke server orang lain.

Terakhir diperbarui 26 Agustus 2026

## Jawaban singkatnya

1. Buka [Pemformat JSON](https://abox.tools/id/format-json/), tempel file pertama, setel indentasi ke dua spasi, dan centang *Urutkan kunci tiap objek*. Salin hasilnya.
2. Buka [Pembanding Teks](https://abox.tools/id/bandingkan-teks/) dan tempelkan ke kotak kiri.
3. Lakukan hal yang sama pada file kedua, ke kotak kanan.

Yang menyala sekarang sungguhan: nilai yang berubah, kunci yang muncul, entri yang pergi. Perbedaan pemformatan dan kunci yang berpindah urutan, yang akan menenggelamkan diff biasa, sudah tidak ada, karena kedua sisi dieja sama sebelum perbandingannya mulai.

Kedua halaman itu sama sekali tidak punya fitur jaringan, dan itu layak diketahui: JSON yang dibandingkan orang begitu sering adalah file konfigurasi dengan kredensial masih di dalamnya.

## Kenapa diff JSON mentah hampir seluruhnya derau

JSON tidak peduli spasi, dan tidak memberi makna pada urutan kunci. Dokumen yang sama bisa satu baris atau empat ratus, kuncinya dalam urutan diketik atau urutan yang dikeluarkan suatu pustaka — dan alat-alat menulis ulang keduanya sesuka hati. Satu sisi dimampatkan, satu sisi dijabarkan; satu disimpan tangan, satunya oleh serializer yang mengurutkan menurut abjad: diff baris melihat dua file yang tak berkerabat.

Dua kasus terburuknya cukup jadi bukti. File **termampat** adalah satu baris, jadi diff terhadapnya adalah satu baris berubah yang raksasa: benar dan tak berguna. Dan dua file dengan **isi sama dalam urutan berbeda** dibandingkan sebagai semua-berubah, padahal jawaban jujurnya “tidak ada”.

![Opsi pembanding: tampilan berdampingan atau menyatu, sakelar untuk menampilkan hanya baris yang berubah, dan sakelar untuk mengabaikan spasi, besar kecil huruf, serta baris kosong.](https://abox.tools/screens/compare-two-json-files/options.webp)

Inilah yang mencegah sebuah pembandingan melaporkan setiap baris hanya karena satu berkas disimpan dengan akhir baris yang berbeda.

## Apa yang dibereskan bentuk baku si pemformat

Melewatkan kedua file lewat pemformat yang sama dengan setelan yang sama persis yang dibutuhkan diff: satu ejaan per dokumen.

- **Indentasi yang sama** menaruh tiap kunci di barisnya sendiri: diff lalu bekerja baris demi baris, dan penanda katanya bisa menunjuk satu nilai yang berubah di dalam sebuah baris.
- **Kunci terurut** menaruh kedua sisi dalam urutan yang sama, dan urutan berhenti menjadi perbedaan. Pengurutannya menurut cara kunci terbaca, bukan menurut titik kode — `item2` sebelum `item10` — dan diterapkan identik di kedua sisi.
- **Selain itu tidak ada yang bergeser.** Pemformat ini menjaga angka sebagai digit yang Anda tulis dan menjaga kunci ganda alih-alih memutuskannya: pembakuan tidak bisa mengarang perbedaan sendiri. [Panduan pemformat](https://abox.tools/id/panduan/format-json-tanpa-mengunggah/) menjelaskan kenapa itu lebih langka dari seharusnya.

Satu catatan jujur: keluaran terurut adalah dokumen dengan kunci yang berpindah. Kalau alat di hilir peduli urutan kunci — sedikit yang peduli, tapi ada — perlakukan salinan terurut sebagai yang dibandingkan, bukan pengganti aslinya.

## Membaca hasilnya, dan membawanya pergi

Pembanding menandai baris yang hilang di kiri, yang bertambah di kanan, dan menyorot kata yang berbeda di dalam baris yang berubah: pada bentuk baku, biasanya itu satu-satunya nilai yang berpindah dari `false` ke `true`. Bagian tengah yang tak berubah terlipat jadi hitungan, jadi konfigurasi dua ribu baris dengan tiga suntingan terbaca sebagai tiga penggalan pendek.

Unduhannya tambalan terpadu, sebuah `.patch`: format yang dimengerti tinjauan kode. Ia menggambarkan bentuk-bentuk baku, dan biasanya memang itu yang diinginkan tinjauan: perubahannya, tanpa pemformatan ulangnya.

Resep yang sama bekerja untuk semua hal lain yang dipahami kedua halaman. YAML dan XML dibakukan dengan cara yang sama; dan untuk dua file berbentuk sama dari sumber berbeda, sakelar pengabaian si pembanding — spasi, kapital, baris kosong — adalah versi ringan dari gagasan yang sama.

![Dua versi konfigurasi JSON berdampingan, dengan baris yang berubah ditandai: nomor versi, jumlah percobaan ulang, satu opsi yang ditambahkan, dan satu wilayah yang ditambahkan.](https://abox.tools/screens/compare-two-json-files/diff.webp)

Empat perbedaan yang sungguhan, dan tidak ada yang lain dilaporkan. Membacanya bagian yang mudah; kerjanya sudah dilakukan pengaturan di atas.

## Kalau Anda melakukannya tiap minggu

Memformat dua kali, menempel dua kali: langkah-langkahnya tinggal di dua halaman karena tiap halaman mengerjakan satu hal, dan masing-masing bisa membuktikan sendiri bahwa tidak ada tempelan Anda yang pergi ke mana pun. Tetapi keduanya open source: berlisensi MIT, modul ES bebas dependensi — parser si pemformat menjaga urutan kunci dan digit, diff-nya algoritma Myers — masing-masing dengan README yang menjelaskannya.

Kalau ini bagian dari hari Anda, arahkan agen kode ke [repositorinya](https://github.com/A-Box-of-Tools/website) dan minta halaman dua kotak yang membakukan sambil membandingkan: `parseJson`, `printJson`, dan `compareText` tinggal tiga impor jauhnya. Modul-modulnya ditulis untuk dibaca, dan mengangkatnya keluar memang gunanya lisensi itu.
