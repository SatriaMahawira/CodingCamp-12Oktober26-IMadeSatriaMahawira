# Requirements Document

## Introduction

**Todo Life Dashboard** adalah sebuah halaman web dashboard sederhana yang membantu pengguna mengorganisir aktivitas harian mereka. Dashboard ini menampilkan waktu dan tanggal real-time, focus timer berbasis Pomodoro, daftar tugas (to-do list) yang persisten, serta quick links ke profil media sosial pengguna. Seluruh data disimpan di sisi klien menggunakan Local Storage browser tanpa memerlukan backend server. Antarmuka dibangun menggunakan HTML, CSS, dan Vanilla JavaScript murni.

---

## Glossary

- **Dashboard**: Halaman utama yang menampilkan semua komponen widget dalam satu tampilan.
- **Greeting_Widget**: Komponen yang menampilkan waktu, tanggal, sapaan, dan nama pengguna.
- **Focus_Timer**: Komponen timer Pomodoro 25 menit dengan tombol kontrol.
- **Todo_List**: Komponen manajemen tugas yang mendukung operasi tambah, edit, selesai, dan hapus.
- **Quick_Links**: Komponen yang menampilkan tautan ke media sosial pengguna.
- **Task**: Satu item pekerjaan dalam Todo_List yang memiliki atribut teks, status selesai, dan prioritas.
- **Local_Storage**: API penyimpanan browser yang digunakan untuk mempertahankan data secara lokal di perangkat pengguna.
- **Pomodoro**: Teknik manajemen waktu dengan sesi fokus 25 menit diikuti istirahat singkat.
- **Dark_Mode**: Tema antarmuka dengan latar belakang gelap dan teks terang.
- **Light_Mode**: Tema antarmuka dengan latar belakang terang dan teks gelap.

---

## Requirements

### Requirement 1: Tampilan Waktu dan Tanggal Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat waktu dan tanggal saat ini secara real-time, sehingga saya dapat selalu mengetahui kondisi waktu tanpa harus membuka aplikasi lain.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menampilkan waktu saat ini dalam format HH:MM:SS menggunakan zona waktu lokal perangkat pengguna, dengan pembaruan setiap satu detik.
2. THE Greeting_Widget SHALL menampilkan tanggal saat ini dalam format hari, DD Bulan YYYY dalam Bahasa Indonesia (contoh: Kamis, 16 Oktober 2026).
3. WHEN waktu berada antara pukul 05:00:00 dan 11:59:59, THE Greeting_Widget SHALL menampilkan sapaan "Selamat Pagi".
4. WHEN waktu berada antara pukul 12:00:00 dan 14:59:59, THE Greeting_Widget SHALL menampilkan sapaan "Selamat Siang".
5. WHEN waktu berada antara pukul 15:00:00 dan 17:59:59, THE Greeting_Widget SHALL menampilkan sapaan "Selamat Sore".
6. WHEN waktu berada antara pukul 18:00:00 dan 23:59:59 ATAU antara 00:00:00 dan 04:59:59, THE Greeting_Widget SHALL menampilkan sapaan "Selamat Malam".
7. THE Greeting_Widget SHALL menampilkan sapaan dalam format "[Sapaan], [Nama]!" (contoh: "Selamat Pagi, Satria!").
8. IF nama pengguna belum tersimpan di Local_Storage, THEN THE Greeting_Widget SHALL menampilkan nama default "Pengguna" sehingga sapaan terbaca "Selamat Pagi, Pengguna!".
9. IF pembaruan waktu gagal atau terjadi error pada fungsi timer, THEN THE Greeting_Widget SHALL mempertahankan nilai waktu terakhir yang valid dan menghentikan pembaruan lebih lanjut tanpa menampilkan error ke pengguna.

---

### Requirement 2: Kustomisasi Nama Pengguna

**User Story:** Sebagai pengguna, saya ingin mengatur nama saya sendiri di dashboard, sehingga sapaan terasa lebih personal dan relevan untuk saya.

#### Acceptance Criteria

1. THE Dashboard SHALL menyediakan sebuah elemen input teks dan sebuah tombol konfirmasi untuk memungkinkan pengguna mengatur nama mereka, dengan panjang input maksimal 50 karakter.
2. WHEN pengguna memasukkan nama yang valid dan mengonfirmasi, THE Dashboard SHALL menyimpan nama tersebut ke `localStorage` dengan kunci `userName` dalam waktu kurang dari 200ms setelah konfirmasi.
3. WHEN pengguna membuka atau memuat ulang Dashboard, THE Greeting_Widget SHALL memuat nilai dari `localStorage` dengan kunci `userName` dan menampilkannya dalam format sapaan dalam waktu kurang dari 500ms setelah halaman selesai dimuat.
4. IF pengguna memasukkan nama yang kosong atau hanya berisi karakter spasi, THEN THE Dashboard SHALL mengabaikan perubahan, mempertahankan nilai `userName` yang sudah tersimpan di `localStorage`, dan menampilkan pesan kesalahan yang mengindikasikan bahwa nama tidak boleh kosong.
5. WHEN nama pengguna berhasil disimpan, THE Greeting_Widget SHALL memperbarui tampilan sapaan dalam waktu kurang dari 200ms tanpa memuat ulang halaman.
6. IF `localStorage` tidak mengandung kunci `userName` saat Dashboard dimuat, THEN THE Greeting_Widget SHALL menampilkan nama default "Pengguna" dalam sapaan.
7. IF pengguna memasukkan nama yang melebihi 50 karakter, THEN THE Dashboard SHALL menolak input, tidak menyimpan perubahan, dan menampilkan pesan kesalahan yang mengindikasikan batas maksimal 50 karakter.

---

### Requirement 3: Focus Timer (Pomodoro)

**User Story:** Sebagai pengguna, saya ingin menggunakan focus timer 25 menit berbasis Pomodoro, sehingga saya dapat bekerja dengan lebih fokus dalam sesi waktu yang terstruktur.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menampilkan hitungan mundur dari 25:00 (dua puluh lima menit) dalam format MM:SS.
2. WHEN pengguna menekan tombol Start, THE Focus_Timer SHALL memulai hitungan mundur dari waktu yang sedang ditampilkan.
3. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL memperbarui tampilan setiap 1000 milidetik ±10 milidetik.
4. WHEN pengguna menekan tombol Stop, THE Focus_Timer SHALL menghentikan hitungan mundur dan mempertahankan waktu yang tersisa.
5. WHEN pengguna menekan tombol Reset, THE Focus_Timer SHALL menghentikan hitungan mundur dan mengatur ulang waktu ke 25:00.
6. WHEN hitungan mundur Focus_Timer mencapai 00:00, THE Focus_Timer SHALL berhenti secara otomatis, menampilkan notifikasi visual selama minimal 3 detik, dan membunyikan sinyal audio sebagai tanda sesi selesai.
7. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL menonaktifkan tombol Start dan menampilkan hanya tombol Stop dan Reset.
8. WHILE Focus_Timer sedang berhenti atau direset, THE Focus_Timer SHALL menampilkan tombol Start dan Reset.
9. IF pengguna menekan tombol Start saat Focus_Timer sedang berjalan, THEN THE Focus_Timer SHALL mengabaikan input tersebut dan tetap berjalan.
10. WHEN tab browser menjadi tidak aktif dan kemudian aktif kembali, THE Focus_Timer SHALL menyesuaikan waktu yang ditampilkan berdasarkan waktu nyata yang telah berlalu untuk menjaga akurasi hitungan mundur.

---

### Requirement 4: Manajemen To-Do List — Tambah Task

**User Story:** Sebagai pengguna, saya ingin menambahkan task baru ke daftar tugas saya, sehingga saya dapat mencatat semua pekerjaan yang perlu diselesaikan.

#### Acceptance Criteria

1. THE Todo_List SHALL menyediakan elemen input teks dengan panjang maksimal 100 karakter untuk memasukkan nama task baru.
2. WHEN pengguna memasukkan teks task yang valid dan menekan tombol tambah atau tombol Enter, THE Todo_List SHALL menambahkan Task baru ke daftar dengan status belum selesai.
3. WHEN Task baru berhasil ditambahkan, THE Todo_List SHALL menyimpan seluruh daftar Task ke Local_Storage dengan kunci `tasks`.
4. WHEN Task baru berhasil ditambahkan, THE Todo_List SHALL mengosongkan elemen input teks secara otomatis.
5. IF pengguna mencoba menambahkan Task dengan teks kosong, hanya berisi spasi, atau melebihi 100 karakter, THEN THE Todo_List SHALL mengabaikan permintaan dan tidak menambahkan Task ke daftar.
6. IF pengguna mencoba menambahkan Task dengan teks yang identik (tidak peka huruf besar/kecil) dengan Task yang sudah ada dalam daftar, THEN THE Todo_List SHALL mengabaikan permintaan, menampilkan pesan peringatan bahwa task sudah ada, dan mempertahankan teks di input field sampai pengguna memodifikasinya.

---

### Requirement 5: Manajemen To-Do List — Edit Task

**User Story:** Sebagai pengguna, saya ingin mengedit task yang sudah ada, sehingga saya dapat memperbaiki atau memperbarui informasi tugas tanpa harus menghapus dan membuat ulang.

#### Acceptance Criteria

1. THE Todo_List SHALL menyediakan tombol atau aksi edit untuk setiap Task dalam daftar.
2. WHEN pengguna memilih aksi edit pada sebuah Task, THE Todo_List SHALL menampilkan teks Task tersebut dalam sebuah input field yang dapat diedit dengan teks Task saat ini sebagai nilai awal.
3. WHILE Task berada dalam mode edit, THE Todo_List SHALL menampilkan tombol konfirmasi dan tombol batal sebagai satu-satunya aksi yang tersedia untuk Task tersebut.
4. WHEN pengguna mengonfirmasi perubahan pada Task yang diedit, THE Todo_List SHALL memperbarui teks Task tersebut dengan teks baru dan menyimpan seluruh daftar Task ke Local_Storage dalam waktu 500 milidetik.
5. IF pengguna mengosongkan teks Task saat mengedit dan mengonfirmasi, THEN THE Todo_List SHALL mengabaikan perubahan, mempertahankan teks Task yang asli, dan menampilkan pesan error yang mengindikasikan bahwa teks Task tidak boleh kosong.
6. WHEN pengguna membatalkan aksi edit, THE Todo_List SHALL menutup mode edit dan mempertahankan teks Task yang asli tanpa perubahan.
7. IF Local_Storage tidak tersedia saat menyimpan perubahan Task, THEN THE Todo_List SHALL menampilkan pesan error yang mengindikasikan bahwa perubahan gagal disimpan dan mempertahankan teks Task yang diperbarui di tampilan selama sesi berlangsung.

---

### Requirement 6: Manajemen To-Do List — Tandai Task Selesai

**User Story:** Sebagai pengguna, saya ingin menandai task sebagai selesai, sehingga saya dapat melacak kemajuan pekerjaan saya dengan jelas.

#### Acceptance Criteria

1. THE Todo_List SHALL menampilkan elemen checkbox atau tombol toggle untuk setiap Task, dengan area interaktif minimal 24x24 piksel.
2. WHEN pengguna mencentang checkbox sebuah Task, THE Todo_List SHALL mengubah status Task tersebut menjadi selesai dan menampilkan indikator visual berupa teks dicoret (strikethrough) pada judul Task dalam waktu kurang dari 300 milidetik.
3. WHEN pengguna menghilangkan centang checkbox sebuah Task yang sudah selesai, THE Todo_List SHALL mengubah status Task tersebut kembali menjadi belum selesai dan menghapus indikator visual strikethrough dalam waktu kurang dari 300 milidetik.
4. WHEN status Task berubah, THE Todo_List SHALL menyimpan perubahan status ke Local_Storage sebelum respons visual ditampilkan ke pengguna.
5. IF penyimpanan ke Local_Storage gagal, THEN THE Todo_List SHALL menampilkan pesan kesalahan yang mengindikasikan kegagalan penyimpanan dan mempertahankan perubahan status pada tampilan sesi aktif.
6. THE Todo_List SHALL menampilkan Task yang belum selesai sebelum Task yang sudah selesai dalam urutan daftar, dengan pemisah visual yang membedakan kedua kelompok tersebut.

---

### Requirement 7: Manajemen To-Do List — Hapus Task

**User Story:** Sebagai pengguna, saya ingin menghapus task yang tidak relevan, sehingga daftar tugas saya tetap bersih dan hanya berisi pekerjaan yang masih perlu diperhatikan.

#### Acceptance Criteria

1. THE Todo_List SHALL menyediakan tepat satu tombol hapus untuk setiap Task yang ditampilkan dalam daftar.
2. WHEN pengguna menekan tombol hapus pada sebuah Task, THE Todo_List SHALL menghapus Task tersebut dari daftar secara permanen dan tidak dapat dikembalikan.
3. WHEN pengguna menekan tombol hapus pada sebuah Task, THE Todo_List SHALL menyimpan daftar Task yang telah diperbarui ke Local_Storage dalam waktu tidak lebih dari 500 milidetik setelah penghapusan.
4. WHEN pengguna menekan tombol hapus pada sebuah Task, THE Todo_List SHALL memperbarui tampilan daftar Task dalam waktu tidak lebih dari 200 milidetik tanpa memuat ulang halaman.
5. IF Local_Storage tidak tersedia atau gagal saat menyimpan setelah penghapusan, THEN THE Todo_List SHALL menampilkan pesan kesalahan yang menginformasikan bahwa perubahan tidak dapat disimpan.
6. WHEN semua Task telah dihapus, THE Todo_List SHALL menampilkan pesan yang mengindikasikan bahwa daftar Task kosong.

---

### Requirement 8: Persistensi Data dengan Local Storage

**User Story:** Sebagai pengguna, saya ingin data task dan pengaturan saya tersimpan secara otomatis, sehingga data tidak hilang ketika saya menutup atau memuat ulang browser.

#### Acceptance Criteria

1. WHEN pengguna membuka Dashboard, THE Dashboard SHALL memuat semua Task dari Local_Storage dan menampilkannya di Todo_List.
2. WHEN pengguna membuka Dashboard, THE Dashboard SHALL memuat nama pengguna dari Local_Storage dan menampilkannya di Greeting_Widget.
3. WHEN pengguna membuka Dashboard, THE Dashboard SHALL memuat preferensi tema dari Local_Storage dan menerapkannya ke seluruh tampilan Dashboard sebelum konten terlihat oleh pengguna.
4. WHEN pengguna melakukan operasi tambah, edit, selesai, atau hapus Task, THE Dashboard SHALL menyimpan perubahan ke Local_Storage sebelum operasi dianggap selesai.
5. IF Local_Storage tidak memiliki data Task yang tersimpan, THEN THE Todo_List SHALL menampilkan daftar kosong tanpa error.
6. IF data di Local_Storage tidak ada atau tidak dapat dibaca untuk kunci `userName`, `theme`, atau `tasks`, THEN THE Dashboard SHALL menggunakan nilai default masing-masing (nama "Pengguna", tema Light_Mode, daftar kosong) tanpa menampilkan error kepada pengguna.

---

### Requirement 9: Quick Links Media Sosial

**User Story:** Sebagai pengguna, saya ingin mengakses profil media sosial saya langsung dari dashboard, sehingga saya dapat berpindah ke platform lain dengan cepat tanpa mengetik URL secara manual.

#### Acceptance Criteria

1. THE Quick_Links SHALL menampilkan tautan ke Instagram dengan URL `https://www.instagram.com/satriamahawira/`.
2. THE Quick_Links SHALL menampilkan tautan ke LinkedIn dengan URL `https://www.linkedin.com/in/satria-mahawira/`.
3. THE Quick_Links SHALL menampilkan tautan ke Facebook dengan URL `https://www.facebook.com/mahawira.madesatria`.
4. WHEN pengguna mengklik salah satu tautan di Quick_Links, THE Quick_Links SHALL membuka URL tujuan di tab browser baru menggunakan atribut `target="_blank"` dan `rel="noopener noreferrer"`.
5. THE Quick_Links SHALL menampilkan nama platform (Instagram, LinkedIn, Facebook) dan ikon representatif untuk setiap tautan.
6. IF browser memblokir pembukaan tab baru, THEN THE Quick_Links SHALL mempertahankan tab Dashboard saat ini tanpa navigasi atau error.
7. THE Quick_Links SHALL menampilkan ketiga tautan secara bersamaan pada lebar layar minimum 320 piksel tanpa menyebabkan scroll horizontal.

---

### Requirement 10: Toggle Light / Dark Mode

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara tampilan terang dan gelap, sehingga saya dapat menggunakan dashboard dalam kondisi pencahayaan yang berbeda dengan nyaman.

#### Acceptance Criteria

1. THE Dashboard SHALL menyediakan tombol toggle yang selalu terlihat untuk beralih antara Light_Mode dan Dark_Mode.
2. WHEN pengguna menekan tombol toggle tema, THE Dashboard SHALL beralih dari tema aktif saat ini ke tema yang berlawanan dalam waktu kurang dari atau sama dengan 300 milidetik.
3. WHEN pengguna menekan tombol toggle tema, THE Dashboard SHALL menyimpan preferensi tema yang dipilih ke Local_Storage dengan kunci `theme`.
4. WHEN pengguna memuat ulang atau membuka kembali Dashboard, THE Dashboard SHALL memuat preferensi tema dari Local_Storage dan menerapkannya sebelum elemen konten apa pun dirender, sehingga tidak ada kedipan tema yang terlihat saat pemuatan halaman.
5. IF tidak ada preferensi tema yang tersimpan di Local_Storage, THEN THE Dashboard SHALL menggunakan Light_Mode sebagai tema default.
6. IF Local_Storage tidak tersedia, THEN THE Dashboard SHALL tetap menampilkan togel tema dan menggunakan Light_Mode sebagai tema aktif selama sesi berlangsung tanpa menampilkan error.

---

### Requirement 11: Pencegahan Duplikasi Task

**User Story:** Sebagai pengguna, saya ingin sistem mencegah penambahan task yang sama dua kali, sehingga daftar tugas saya tetap unik dan tidak membingungkan.

#### Acceptance Criteria

1. WHEN pengguna mencoba menambahkan Task baru, THE Todo_List SHALL membandingkan teks input (setelah trim spasi awal/akhir dan normalisasi spasi internal menjadi satu spasi, tanpa memperhatikan huruf besar/kecil) dengan semua Task yang ada di daftar.
2. IF teks Task baru identik dengan Task yang sudah ada setelah normalisasi, THEN THE Todo_List SHALL menampilkan pesan peringatan yang menginformasikan bahwa task tersebut sudah ada dalam daftar.
3. IF teks Task baru identik dengan Task yang sudah ada setelah normalisasi, THEN THE Todo_List SHALL tidak menambahkan Task duplikat ke daftar.
4. WHILE pesan peringatan duplikasi ditampilkan, THE Todo_List SHALL menghilangkan pesan tersebut secara otomatis setelah 3 detik atau ketika pengguna mulai memodifikasi input.
5. WHEN peringatan duplikasi ditampilkan, THE Todo_List SHALL mempertahankan teks di input field sehingga pengguna dapat memodifikasinya tanpa harus mengetik ulang.

---

### Requirement 12: Pengurutan Task

**User Story:** Sebagai pengguna, saya ingin mengurutkan daftar tugas berdasarkan status atau prioritas, sehingga saya dapat memfokuskan perhatian pada tugas yang paling penting atau belum selesai terlebih dahulu.

#### Acceptance Criteria

1. THE Todo_List SHALL menyediakan opsi pengurutan untuk mengurutkan Task berdasarkan status (belum selesai dahulu, lalu selesai).
2. THE Todo_List SHALL menyediakan opsi pengurutan untuk mengurutkan Task berdasarkan prioritas (tinggi, sedang, rendah).
3. WHEN pengguna memilih opsi urutan berdasarkan status, THE Todo_List SHALL menampilkan ulang semua Task dalam waktu kurang dari 500 milidetik dengan Task yang belum selesai di bagian atas dan Task yang selesai di bagian bawah.
4. WHEN pengguna memilih opsi urutan berdasarkan prioritas, THE Todo_List SHALL menampilkan ulang semua Task dalam waktu kurang dari 500 milidetik dengan urutan prioritas tinggi, sedang, lalu rendah.
5. WHEN pengguna menambahkan atau mengedit sebuah Task, THE Todo_List SHALL memungkinkan pengguna menetapkan tingkat prioritas yang valid: "tinggi", "sedang", atau "rendah".
6. WHEN pengguna menambahkan Task tanpa menetapkan prioritas, THE Todo_List SHALL menetapkan prioritas default sebagai "sedang".
7. IF Todo_List tidak memiliki Task untuk ditampilkan setelah pengurutan diterapkan, THEN THE Todo_List SHALL menampilkan pesan yang mengindikasikan bahwa daftar kosong.
8. WHEN pengguna memilih pengurutan berdasarkan prioritas dan terdapat Task dengan prioritas yang sama, THE Todo_List SHALL mengurutkan Task tersebut berdasarkan status (belum selesai dahulu) sebagai urutan sekunder.

---

### Requirement 13: Struktur File dan Keterbacaan Kode

**User Story:** Sebagai pengembang, saya ingin kode proyek diorganisir dengan struktur yang bersih, sehingga mudah dipahami, dikelola, dan dikembangkan lebih lanjut.

#### Acceptance Criteria

1. THE Dashboard SHALL diimplementasikan dengan tepat satu file HTML di direktori utama, tepat satu file CSS di dalam direktori `css/`, dan tepat satu file JavaScript di dalam direktori `js/`, tanpa file tambahan di luar struktur tersebut.
2. THE Dashboard SHALL dapat berjalan di browser Chrome, Firefox, Edge, dan Safari versi terbaru tanpa memerlukan build tools, package manager, atau server backend, dengan seluruh UI dan fungsionalitas tersedia setelah membuka file HTML.
3. THE Dashboard SHALL berfungsi penuh sebagai file statis yang dibuka melalui protokol `file://` di browser, mencakup rendering data dari Local_Storage, interaksi pengguna, dan pembaruan tampilan, tanpa koneksi jaringan maupun server lokal.
4. IF file CSS atau JavaScript tidak dapat dimuat saat membuka Dashboard melalui protokol `file://`, THEN THE Dashboard SHALL menampilkan konten HTML dasar yang masih dapat dibaca meskipun tanpa styling atau interaktivitas.

---

### Requirement 14: Performa dan Kompatibilitas

**User Story:** Sebagai pengguna, saya ingin dashboard memuat dengan cepat dan responsif di semua browser modern, sehingga pengalaman penggunaan terasa lancar tanpa hambatan.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan konten yang dapat digunakan dalam waktu kurang dari 3 detik pada koneksi jaringan dengan kecepatan unduh minimum 10 Mbps.
2. WHEN pengguna melakukan operasi tambah, edit, atau hapus Task, THE Dashboard SHALL memperbarui tampilan dalam waktu kurang dari 500 milidetik tanpa reload halaman penuh.
3. THE Dashboard SHALL berfungsi dengan benar pada browser Chrome, Firefox, Edge, dan Safari pada versi yang dirilis dalam 12 bulan terakhir, mencakup rendering layout, interaksi form, dan operasi Task.
4. THE Dashboard SHALL menampilkan seluruh konten dan kontrol yang dapat digunakan pada lebar layar antara 320 piksel hingga 1920 piksel tanpa konten yang terpotong atau elemen yang saling tumpang tindih.
5. IF halaman Dashboard gagal memuat dalam 10 detik, THEN THE Dashboard SHALL menampilkan pesan kesalahan yang mengindikasikan kegagalan pemuatan dan menyediakan opsi untuk mencoba ulang.
