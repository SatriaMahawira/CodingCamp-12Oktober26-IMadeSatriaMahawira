# Implementation Plan: Todo Life Dashboard

## Overview

Implementasi dilakukan secara incremental — dimulai dari fondasi (struktur file, Storage module, ThemeToggle), lalu widget-widget yang berdiri sendiri (GreetingWidget, FocusTimer, QuickLinks), kemudian fitur terkompleks (TodoList dengan CRUD, sort, deduplicate), dan diakhiri dengan wiring keseluruhan, responsiveness, dan test suite.

Semua kode menggunakan Vanilla JavaScript ES6+, tanpa build tools, dapat dibuka langsung via `file://`.

---

## Tasks

- [x] 1. Siapkan struktur file dan kerangka HTML dasar
  - Buat direktori `todo-life-dashboard/`, `css/`, dan `js/`
  - Buat `index.html` dengan boilerplate HTML5 semantik: `<header>`, `<main class="dashboard-grid">`, kolom kiri (`.col-left`) dan kolom kanan (`.col-right`), atribut `lang="id"` dan `data-theme="light"` pada `<html>`
  - Tambahkan placeholder section untuk setiap widget: `#greeting-widget`, `#focus-timer`, `#quick-links`, `#todo-list`
  - Hubungkan `<link rel="stylesheet" href="css/style.css">` dan `<script src="js/app.js" defer></script>`
  - Buat file kosong `css/style.css` dan `js/app.js`
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 2. Implementasi modul Storage
  - [x] 2.1 Tulis modul `Storage` di `js/app.js` dengan metode `set(key, value)`, `get(key, fallback)`, `remove(key)`, dan `isAvailable()`
    - `set`: JSON.stringify + try/catch, kembalikan `true`/`false`
    - `get`: JSON.parse + try/catch, kembalikan `fallback` jika item `null` atau parse error
    - `isAvailable`: dummy write/read/remove test
    - _Requirements: 8.1–8.6_

  - [ ]\* 2.2 Tulis unit tests untuk modul Storage
    - Test `get()` mengembalikan fallback untuk JSON tidak valid
    - Test `isAvailable()` mengembalikan `false` saat localStorage diblokir (mock)
    - Test `set()` mengembalikan `false` saat QuotaExceededError (mock)
    - _Requirements: 8.5, 8.6_

  - [ ]\* 2.3 Tulis property test untuk Storage — Property 18: Fallback Default
    - **Property 18: Fallback Default untuk Data localStorage yang Hilang**
    - Untuk sembarang kunci yang tidak ada di localStorage, `Storage.get(key, fallback)` harus mengembalikan `fallback` — bukan `null`, bukan `undefined`, tidak throw exception
    - **Validates: Requirements 8.6, 10.5**
    - _Setup: `npm install --save-dev fast-check` + konfigurasi test runner (Vitest/Jest)_

- [x] 3. Implementasi ThemeToggle
  - [x] 3.1 Tulis modul `ThemeToggle` dengan metode `init()`, `toggle()`, `apply(theme)`, `save(theme)`, `load()`
    - `apply`: set `document.documentElement.setAttribute('data-theme', theme)`
    - `load`: baca dari Storage, fallback ke `'light'`
    - `init` dipanggil paling pertama di `App.init()` agar tidak ada flicker
    - Tambahkan DOM: `<button id="theme-toggle"><span id="theme-icon">🌙</span></button>` di `<header>`
    - _Requirements: 10.1–10.6_

  - [ ]\* 3.2 Tulis unit tests untuk ThemeToggle
    - Test tema Light sebagai default saat localStorage kosong
    - Test `data-theme` attribute pada `<html>` berubah sesuai tema aktif
    - Test tidak ada flicker (tema diterapkan sebelum render konten lain)
    - _Requirements: 10.4, 10.5_

  - [ ]\* 3.3 Tulis property test untuk ThemeToggle — Property 17: Theme Toggle Round-Trip
    - **Property 17: Theme Toggle Round-Trip**
    - Untuk sembarang tema aktif, satu toggle menghasilkan kebalikannya; dua toggle berturut-turut mengembalikan ke nilai semula. `localStorage` harus selalu sinkron dengan tema yang diterapkan
    - **Validates: Requirements 10.2, 10.3**

- [x] 4. Implementasi CSS: variabel tema, layout, dan komponen dasar
  - [x] 4.1 Tulis CSS Custom Properties untuk light mode (`:root`) dan dark mode (`[data-theme="dark"]`)
    - Definisikan semua variabel: `--bg-primary`, `--bg-secondary`, `--bg-widget`, `--text-primary`, `--text-secondary`, `--accent-color`, `--border-color`, `--shadow`, `--completed-text`, warna priority badge, `--transition-fast`, `--transition-medium`
    - _Requirements: 10.1, 10.2_

  - [x] 4.2 Tulis CSS layout: header flex, `dashboard-grid` dua kolom (35%/1fr), responsive breakpoint `max-width: 768px` menjadi satu kolom
    - Tambahkan style dasar widget (card/section), priority badge, task completed strikethrough, error message, tombol, input
    - _Requirements: 13.4, 14.4, 9.7_

- [x] 5. Implementasi GreetingWidget
  - [x] 5.1 Tambahkan DOM lengkap `#greeting-widget` di `index.html`: `#clock`, `#date-display`, `#greeting-text`, `#name-input-group` (input, tombol simpan, span error)
    - _Requirements: 1.1, 1.2, 2.1_

  - [x] 5.2 Tulis modul `GreetingWidget` dengan metode `init()`, `startClock()`, `updateClock()`, `formatTime(date)`, `formatDate(date)`, `getGreeting(hour)`, `updateGreeting()`, `saveName()`, `loadName()`
    - `formatTime`: → `"HH:MM:SS"` dua digit per komponen
    - `formatDate`: → `"Kamis, 16 Oktober 2026"` dalam Bahasa Indonesia (gunakan `toLocaleDateString('id-ID', {...})`)
    - `getGreeting`: peta jam ke sapaan (05–11 Pagi, 12–14 Siang, 15–17 Sore, 18–23 + 0–4 Malam)
    - `saveName`: validasi tidak kosong/spasi-saja dan ≤ 50 karakter, simpan ke Storage, update greeting
    - Clock interval 1000ms via `setInterval`, koreksi error dengan try/catch agar interval tidak crash
    - _Requirements: 1.1–1.9, 2.1–2.7_

  - [ ]\* 5.3 Tulis unit tests untuk GreetingWidget
    - Test nama default "Pengguna" saat localStorage kosong
    - Test sapaan diperbarui tanpa reload setelah nama disimpan
    - Test clock interval berjalan setiap 1000ms (mock `setInterval`)
    - _Requirements: 1.8, 2.5, 2.6_

  - [ ]\* 5.4 Tulis property tests untuk GreetingWidget — Properties 1, 2, 3, 4, 5
    - **Property 1: Greeting Format Sesuai Jam** — `getGreeting(hour)` untuk setiap jam 0–23 mengembalikan tepat satu sapaan yang tepat. **Validates: Requirements 1.3–1.6**
    - **Property 2: Format Output Waktu Valid** — `formatTime(date)` untuk sembarang `Date` valid menghasilkan string cocok pola `HH:MM:SS` (tiap komponen 00–23/00–59). **Validates: Requirements 1.1**
    - **Property 3: Format Output Tanggal Valid dalam Bahasa Indonesia** — `formatDate(date)` mengandung nama hari dan bulan Bahasa Indonesia yang valid. **Validates: Requirements 1.2**
    - **Property 4: Penyimpanan Nama Valid** — untuk sembarang nama 1–50 karakter (bukan hanya whitespace), setelah `saveName`, `localStorage.getItem('userName')` mengembalikan nama tersebut setelah di-trim. **Validates: Requirements 2.2**
    - **Property 5: Penolakan Nama Tidak Valid** — untuk sembarang string seluruhnya whitespace atau panjang > 50 karakter, `saveName` menolak dan nilai localStorage tidak berubah. **Validates: Requirements 2.4, 2.7**

- [x] 6. Implementasi FocusTimer
  - [x] 6.1 Tambahkan DOM `#focus-timer` di `index.html`: `#timer-display`, `#timer-controls` (tombol start, stop, reset), `#timer-notification`
    - _Requirements: 3.1, 3.7, 3.8_

  - [x] 6.2 Tulis modul `FocusTimer` dengan state `{ remaining: 1500, running: false, startTimestamp: null }` dan metode `init()`, `start()`, `stop()`, `reset()`, `tick()`, `updateDisplay()`, `handleComplete()`, `playAudio()`, `syncOnVisibility()`, `updateButtonStates()`
    - `tick`: hitung `remaining = initialRemaining - Math.floor((Date.now() - startTimestamp) / 1000)` untuk mencegah drift
    - `playAudio`: Web Audio API — beep sinusoidal
    - `syncOnVisibility`: pasang listener `visibilitychange`, koreksi sisa waktu saat tab aktif kembali
    - `handleComplete`: stop, tampilkan `#timer-notification` (min 3 detik), panggil `playAudio`
    - `updateButtonStates`: disable start saat running, disable stop saat tidak running
    - _Requirements: 3.1–3.10_

  - [ ]\* 6.3 Tulis unit tests untuk FocusTimer
    - Test tampilan awal "25:00"
    - Test tombol Start disabled saat timer berjalan
    - Test notifikasi visual muncul ≥ 3 detik saat selesai
    - Test `playAudio` dipanggil saat sesi selesai
    - _Requirements: 3.1, 3.7, 3.6_

  - [ ]\* 6.4 Tulis property tests untuk FocusTimer — Properties 6, 7
    - **Property 6: Timer Reset Selalu ke 1500 Detik** — untuk sembarang state timer (berjalan/berhenti, sisa waktu berapapun), setelah `reset()`, `state.remaining === 1500` dan `state.running === false`. **Validates: Requirements 3.5**
    - **Property 7: Koreksi Drift Timer** — untuk sembarang durasi elapsed (detik), `remaining` = `initialRemaining - elapsedSeconds` (floor). **Validates: Requirements 3.10**

- [x] 7. Checkpoint — Verifikasi fondasi dan widget statis
  - Pastikan `index.html` terbuka via `file://` dan tidak ada error di console
  - Pastikan ThemeToggle berfungsi (toggle light/dark, persisten setelah reload)
  - Pastikan GreetingWidget menampilkan jam berjalan, sapaan sesuai waktu, dan nama tersimpan
  - Pastikan FocusTimer countdown akurat, start/stop/reset berfungsi, notifikasi muncul
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum melanjutkan

- [x] 8. Implementasi QuickLinks
  - [x] 8.1 Tambahkan DOM `#quick-links` di `index.html` dengan tiga `<a>` statis: Instagram, LinkedIn, Facebook — masing-masing dengan `target="_blank" rel="noopener noreferrer"`, ikon emoji, dan nama platform
    - URL: Instagram `https://www.instagram.com/satriamahawira/`, LinkedIn `https://www.linkedin.com/in/satria-mahawira/`, Facebook `https://www.facebook.com/mahawira.madesatria`
    - _Requirements: 9.1–9.7_

  - [x] 8.2 Tambahkan CSS untuk `.quick-link`, `.link-icon`, `.link-name` — pastikan tiga link tampil rapi pada lebar ≥ 320px tanpa horizontal scroll
    - _Requirements: 9.7, 14.4_

- [x] 9. Implementasi TodoList — struktur DOM dan modul dasar
  - [x] 9.1 Tambahkan DOM `#todo-list` di `index.html`: `#todo-input-group` (input text, select prioritas, tombol tambah, span error), `#sort-controls` (tombol sort status, sort prioritas), `<ul id="task-list">`, `<p id="empty-state">`
    - _Requirements: 4.1, 12.1, 12.2, 12.5_

  - [x] 9.2 Tulis modul `TodoList` — state `{ tasks: [], sortMode: 'status' }`, metode `init()`, `renderTasks()`, `sortTasks(tasks)`, `normalizeText(text)`, `isDuplicate(text)`, `showError(msg)`
    - `normalizeText`: trim + lowercase + collapse internal whitespace ke satu spasi
    - `sortTasks`: sort by status (incomplete=0, complete=1) atau by priority (tinggi=0, sedang=1, rendah=2) dengan secondary sort by status untuk sort priority
    - `renderTasks`: bangun DOM task item sesuai template, tampilkan/sembunyikan `#empty-state`
    - Template task item: `<li data-id data-completed data-priority>` dengan checkbox+label, priority badge, tombol edit & hapus
    - _Requirements: 6.6, 12.1–12.8_

  - [ ]\* 9.3 Tulis property tests untuk TodoList sort — Properties 14, 15, 16
    - **Property 14: Sort by Status — Incomplete Selalu di Atas** — setelah `sortTasks` mode status, tidak ada `completed: true` mendahului `completed: false`. **Validates: Requirements 6.6, 12.1, 12.3**
    - **Property 15: Sort by Priority — Urutan Prioritas Terjaga** — setelah `sortTasks` mode priority, untuk setiap pasang task A (prioritas lebih rendah) dan B (prioritas lebih tinggi), A tidak muncul sebelum B. **Validates: Requirements 12.2, 12.4**
    - **Property 16: Sort by Priority — Secondary Sort by Status** — untuk dua task prioritas sama, task `completed: false` selalu sebelum `completed: true`. **Validates: Requirements 12.8**

- [x] 10. Implementasi TodoList — operasi CRUD
  - [x] 10.1 Implementasi `addTask(text, priority)` di `TodoList`
    - Validasi: tidak kosong/spasi-saja, ≤ 100 karakter
    - Cek duplikat via `isDuplicate` — tampilkan warning jika duplikat, pertahankan teks di input
    - Buat task object: `{ id, text, completed: false, priority, createdAt: Date.now() }`
    - Simpan ke Storage, render, kosongkan input
    - _Requirements: 4.1–4.6, 11.1–11.5_

  - [ ]\* 10.2 Tulis property tests untuk addTask — Properties 8, 10, 11
    - **Property 8: Task Baru Selalu Dibuat dengan Status Belum Selesai** — untuk sembarang teks valid dan prioritas valid, task yang dibuat memiliki `completed: false` dan prioritas sesuai (default "sedang"). **Validates: Requirements 4.2, 12.6**
    - **Property 10: Penolakan Task Tidak Valid** — untuk sembarang string seluruhnya whitespace atau > 100 karakter, `addTask` tidak mengubah panjang `state.tasks`. **Validates: Requirements 4.5**
    - **Property 11: Deduplication Berbasis Normalisasi** — menambahkan teks identik setelah normalisasi (trim+lowercase+collapse whitespace) tidak menambah panjang array. **Validates: Requirements 4.6, 11.1–11.3**

  - [x] 10.3 Implementasi `editTask(id, newText)`, `enterEditMode(id)`, `exitEditMode(id)` di `TodoList`
    - `enterEditMode`: ganti tampilan item ke mode edit (input prefill + tombol konfirmasi + batal)
    - `exitEditMode`: kembalikan ke tampilan normal
    - `editTask`: validasi teks baru tidak kosong, update task object, simpan ke Storage, render
    - _Requirements: 5.1–5.7_

  - [x] 10.4 Implementasi `toggleTask(id)` dan `deleteTask(id)` di `TodoList`
    - `toggleTask`: flip `completed`, simpan ke Storage sebelum update UI, render
    - `deleteTask`: hapus dari array, simpan ke Storage, render, tampilkan empty state jika kosong
    - _Requirements: 6.1–6.6, 7.1–7.6_

  - [ ]\* 10.5 Tulis property tests untuk operasi task — Properties 9, 12, 13
    - **Property 9: Round-Trip Persistensi Task** — setelah sembarang operasi (tambah/edit/toggle/hapus), `JSON.parse(localStorage.getItem('tasks'))` mencerminkan `state.tasks` terkini persis. **Validates: Requirements 4.3, 5.4, 6.4, 7.3, 8.1**
    - **Property 12: Toggle Status Task** — satu toggle membalik `completed`; dua toggle berturut-turut mengembalikan ke nilai semula. **Validates: Requirements 6.2, 6.3**
    - **Property 13: Task Terhapus Tidak Ada dalam Daftar** — setelah `deleteTask(id)`, task dengan id tersebut tidak ada di `state.tasks` maupun di localStorage. **Validates: Requirements 7.2, 7.3**

  - [ ]\* 10.6 Tulis unit tests untuk TodoList CRUD
    - Test input dikosongkan setelah task berhasil ditambahkan
    - Test warning duplikasi auto-dismiss setelah 3 detik
    - Test pesan empty state muncul saat semua task dihapus
    - Test edit mode menampilkan hanya tombol konfirmasi dan batal
    - Test pembatalan edit mempertahankan teks asli
    - _Requirements: 4.4, 4.6, 5.3, 5.6, 7.6_

- [x] 11. Checkpoint — Verifikasi fitur TodoList lengkap
  - Pastikan tambah, edit, toggle, hapus task berfungsi dengan benar
  - Pastikan deduplikasi dan validasi input bekerja
  - Pastikan sort by status dan sort by priority bekerja
  - Pastikan semua perubahan persisten setelah reload halaman
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum melanjutkan

- [x] 12. Wiring semua modul dan bootstrap App
  - [x] 12.1 Tulis fungsi `App.init()` di `js/app.js` yang memanggil semua modul sesuai urutan inisialisasi: `ThemeToggle.init()` → `GreetingWidget.init()` → `FocusTimer.init()` → `TodoList.init()` → `QuickLinks.init()` (pasang event listeners)
    - Pasang event listener global `DOMContentLoaded` yang memanggil `App.init()`
    - _Requirements: 8.1–8.4, 13.2_

  - [x] 12.2 Tambahkan CSS finalisasi: styling widget card (padding, border-radius, shadow), hover/focus state pada semua interactive element (button, input, checkbox, link), smooth transition pada tema switch
    - Pastikan semua elemen memiliki area interaktif minimal 24×24px (terutama checkbox task)
    - _Requirements: 6.1, 10.2, 14.2_

  - [ ]\* 12.3 Tulis integration tests (smoke)
    - Test data task bertahan setelah reload (mock `localStorage`)
    - Test tema bertahan setelah reload
    - Test nama pengguna bertahan setelah reload
    - _Requirements: 8.1–8.4_

- [x] 13. Final Checkpoint — Verifikasi menyeluruh
  - Buka `index.html` via `file://` di Chrome, Firefox, atau Edge — pastikan tidak ada error di console
  - Pastikan layout responsive: 2 kolom di ≥ 768px, 1 kolom di < 768px, tidak ada horizontal scroll di 320px
  - Pastikan semua properti JS sudah di-encapsulate dalam module pattern (tidak ada polusi global namespace)
  - Jalankan seluruh test suite dan pastikan semua tests pass
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum deployment

---

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk pengembangan MVP yang lebih cepat
- Setiap task merujuk ke requirements spesifik untuk traceability
- Checkpoint memastikan validasi incremental sebelum melanjutkan ke fase berikutnya
- Property tests (Properties 1–18) memvalidasi correctness properties universal yang didefinisikan di design.md
- Unit tests memvalidasi skenario spesifik, edge case, dan kondisi error
- Setup testing: `npm install --save-dev fast-check vitest` — jalankan test dengan `vitest --run`
- Semua file harus berfungsi via `file://` tanpa server, tanpa build step

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "4.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.1", "4.2"] },
    { "id": 2, "tasks": ["3.2", "3.3", "5.1", "6.1", "8.1", "8.2", "9.1"] },
    { "id": 3, "tasks": ["5.2", "6.2", "9.2"] },
    { "id": 4, "tasks": ["5.3", "5.4", "6.3", "6.4", "9.3", "10.1"] },
    { "id": 5, "tasks": ["10.2", "10.3"] },
    { "id": 6, "tasks": ["10.4", "10.5", "10.6"] },
    { "id": 7, "tasks": ["12.1"] },
    { "id": 8, "tasks": ["12.2"] },
    { "id": 9, "tasks": ["12.3"] }
  ]
}
```
