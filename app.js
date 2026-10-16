/**
 * app.js — Todo Life Dashboard
 * Semua logika aplikasi dienkapsulasi dalam module pattern
 * untuk menghindari polusi global namespace.
 */

"use strict";

// ─────────────────────────────────────────────
// Storage Module
// Wrapper localStorage dengan error handling penuh.
// Requirements: 8.1–8.6
// ─────────────────────────────────────────────
const Storage = {
  /**
   * Simpan nilai ke localStorage sebagai JSON.
   * @param {string} key   - Kunci storage
   * @param {*}      value - Nilai yang akan disimpan (di-serialize ke JSON)
   * @returns {boolean} true jika berhasil, false jika gagal (misal: QuotaExceededError)
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      // QuotaExceededError, SecurityError, atau localStorage tidak tersedia
      return false;
    }
  },

  /**
   * Ambil nilai dari localStorage dan parse dari JSON.
   * @param {string} key      - Kunci storage
   * @param {*}      fallback - Nilai default jika kunci tidak ada atau parse gagal
   * @returns {*} Nilai yang di-parse, atau fallback jika item null / parse error
   */
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      // Item tidak ditemukan → kembalikan fallback (Requirements 8.6)
      if (item === null) {
        return fallback;
      }
      return JSON.parse(item);
    } catch (e) {
      // JSON.parse gagal (data korup) → kembalikan fallback
      return fallback;
    }
  },

  /**
   * Hapus item dari localStorage.
   * @param {string} key - Kunci storage yang akan dihapus
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Abaikan error — tidak ada aksi recovery yang diperlukan
    }
  },

  /**
   * Periksa apakah localStorage tersedia dan dapat digunakan.
   * Melakukan dummy write/read/remove untuk memvalidasi akses nyata.
   * @returns {boolean} true jika localStorage dapat diakses dan berfungsi
   */
  isAvailable() {
    const TEST_KEY = "__storage_test__";
    const TEST_VAL = "1";
    try {
      localStorage.setItem(TEST_KEY, TEST_VAL);
      const readBack = localStorage.getItem(TEST_KEY);
      localStorage.removeItem(TEST_KEY);
      // Pastikan nilai yang dibaca sama dengan yang ditulis
      return readBack === TEST_VAL;
    } catch (e) {
      // localStorage diblokir (mode private, security policy, dll.)
      return false;
    }
  },
};

// ─────────────────────────────────────────────
// ThemeToggle Module
// Mengelola Light/Dark mode — simpan ke localStorage,
// terapkan sebelum render konten lain agar tidak ada flicker.
// Requirements: 10.1–10.6
// ─────────────────────────────────────────────
const ThemeToggle = {
  state: { current: "light" },

  /**
   * Inisialisasi ThemeToggle.
   * Harus dipanggil PERTAMA di App.init() sebelum modul lain
   * agar tema diterapkan sebelum konten terlihat (no-flash).
   * Memasang event listener pada tombol toggle.
   */
  init() {
    // Muat dan terapkan tema tersimpan sebelum render konten lain
    const savedTheme = this.load();
    this.apply(savedTheme);

    // Update state dan ikon
    this.state.current = savedTheme;
    this._updateIcon(savedTheme);

    // Pasang event listener pada tombol toggle
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => this.toggle());
    }
  },

  /**
   * Beralih antara 'light' dan 'dark'.
   * Simpan preferensi baru ke storage dan perbarui DOM.
   */
  toggle() {
    const next = this.state.current === "light" ? "dark" : "light";
    this.apply(next);
    this.save(next);
    this.state.current = next;
    this._updateIcon(next);
  },

  /**
   * Terapkan tema ke dokumen dengan mengubah atribut data-theme
   * pada <html> element.
   * @param {string} theme - 'light' atau 'dark'
   */
  apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  },

  /**
   * Simpan preferensi tema ke localStorage.
   * @param {string} theme - 'light' atau 'dark'
   */
  save(theme) {
    Storage.set("theme", theme);
  },

  /**
   * Baca preferensi tema dari localStorage.
   * Jika belum tersimpan, kembalikan 'light' sebagai default.
   * @returns {string} 'light' atau 'dark'
   */
  load() {
    return Storage.get("theme", "light");
  },

  /**
   * Perbarui ikon tombol toggle sesuai tema aktif.
   * 🌙 = sedang di light mode (klik untuk ke dark)
   * ☀️ = sedang di dark mode (klik untuk ke light)
   * @param {string} theme - tema yang sedang aktif
   * @private
   */
  _updateIcon(theme) {
    const icon = document.getElementById("theme-icon");
    if (icon) {
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  },
};

// ─────────────────────────────────────────────
// GreetingWidget Module
// Menampilkan jam berjalan, tanggal, sapaan kontekstual,
// dan manajemen nama pengguna dengan persistensi.
// Requirements: 1.1–1.9, 2.1–2.7
// ─────────────────────────────────────────────
const GreetingWidget = {
  /** Interval ID dari setInterval clock */
  _clockInterval: null,

  /**
   * Inisialisasi GreetingWidget.
   * Muat nama dari Storage, pasang event listener tombol Simpan,
   * lalu mulai interval clock.
   */
  init() {
    this.loadName();
    this.updateGreeting();

    const saveBtn = document.getElementById("name-save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveName());
    }

    // Izinkan Enter pada input untuk menyimpan nama
    const nameInput = document.getElementById("name-input");
    if (nameInput) {
      nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.saveName();
      });
    }

    this.startClock();
  },

  /**
   * Mulai interval clock 1000ms.
   * Langsung memanggil updateClock() sekali agar tidak ada delay 1 detik
   * sebelum tampilan pertama.
   */
  startClock() {
    // Update segera saat pertama kali
    this.updateClock();

    this._clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  },

  /**
   * Perbarui tampilan jam dan tanggal di DOM, lalu perbarui greeting.
   * Dibungkus try/catch agar error tidak menghentikan interval.
   */
  updateClock() {
    try {
      const now = new Date();

      const clockEl = document.getElementById("clock");
      if (clockEl) {
        clockEl.textContent = this.formatTime(now);
      }

      const dateEl = document.getElementById("date-display");
      if (dateEl) {
        dateEl.textContent = this.formatDate(now);
      }

      this.updateGreeting();
    } catch (e) {
      // Tangkap error agar interval tidak crash — Requirements 1.9
      console.error("GreetingWidget.updateClock error:", e);
    }
  },

  /**
   * Format jam ke string "HH:MM:SS" dengan dua digit per komponen.
   * @param {Date} date - Objek Date yang akan diformat
   * @returns {string} String waktu dalam format "HH:MM:SS"
   */
  formatTime(date) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  },

  /**
   * Format tanggal ke string Bahasa Indonesia,
   * contoh: "Kamis, 16 Oktober 2026".
   * @param {Date} date - Objek Date yang akan diformat
   * @returns {string} String tanggal dalam Bahasa Indonesia
   */
  formatDate(date) {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  },

  /**
   * Kembalikan sapaan berdasarkan jam (0–23).
   * 05–11 → "Selamat Pagi"
   * 12–14 → "Selamat Siang"
   * 15–17 → "Selamat Sore"
   * 18–23 dan 0–4 → "Selamat Malam"
   * @param {number} hour - Jam dalam format 0–23
   * @returns {string} String sapaan dalam Bahasa Indonesia
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return "Selamat Pagi";
    if (hour >= 12 && hour <= 14) return "Selamat Siang";
    if (hour >= 15 && hour <= 17) return "Selamat Sore";
    return "Selamat Malam"; // 18–23 dan 0–4
  },

  /**
   * Perbarui teks sapaan di DOM berdasarkan jam saat ini dan nama pengguna.
   * Format: "[Sapaan], [Nama]!" — contoh: "Selamat Pagi, Satria!"
   */
  updateGreeting() {
    const greetingEl = document.getElementById("greeting-text");
    if (!greetingEl) return;

    const hour = new Date().getHours();
    const greeting = this.getGreeting(hour);
    const name = Storage.get("userName", "Pengguna");

    greetingEl.textContent = `${greeting}, ${name}!`;
  },

  /**
   * Simpan nama pengguna dari input ke Storage setelah validasi.
   * Validasi:
   *  - Tidak boleh kosong atau hanya spasi (Requirements 2.4)
   *  - Maksimal 50 karakter (Requirements 2.7, dikendalikan juga oleh maxlength HTML)
   * Jika valid: simpan ke Storage, perbarui greeting, kosongkan pesan error.
   * Jika tidak valid: tampilkan pesan error di #name-error.
   */
  saveName() {
    const nameInput = document.getElementById("name-input");
    const nameError = document.getElementById("name-error");

    if (!nameInput) return;

    const raw = nameInput.value;
    const trimmed = raw.trim();

    // Validasi: tidak boleh kosong/spasi-saja
    if (trimmed.length === 0) {
      if (nameError) nameError.textContent = "Nama tidak boleh kosong.";
      return;
    }

    // Validasi: maksimal 50 karakter (setelah trim)
    if (trimmed.length > 50) {
      if (nameError) nameError.textContent = "Nama maksimal 50 karakter.";
      return;
    }

    // Input valid — simpan ke Storage
    Storage.set("userName", trimmed);

    // Perbarui greeting segera tanpa menunggu interval berikutnya
    this.updateGreeting();

    // Bersihkan error dan isi input
    if (nameError) nameError.textContent = "";
    nameInput.value = "";
  },

  /**
   * Muat nama pengguna dari Storage dan isi ke dalam input.
   * Nama default "Pengguna" digunakan jika localStorage kosong (Requirements 1.8).
   * Input diisi dengan nama tersimpan jika ada, bukan dengan default.
   */
  loadName() {
    const nameInput = document.getElementById("name-input");
    if (!nameInput) return;

    // Ambil nama tersimpan — null berarti belum pernah disimpan
    const savedName = Storage.get("userName", null);
    if (savedName !== null) {
      nameInput.value = savedName;
    }
    // Jika null, biarkan input kosong; placeholder sudah memberi petunjuk
  },
};

// ─────────────────────────────────────────────
// FocusTimer Module
// Timer Pomodoro 25 menit dengan koreksi drift berbasis timestamp,
// notifikasi, beep Web Audio API, dan sinkronisasi visibilitas tab.
// Requirements: 3.1–3.10
// ─────────────────────────────────────────────
const FocusTimer = {
  _durationMinutes: 25,

  state: {
    remaining: 1500,
    running: false,
    startTimestamp: null,
  },

  _initialRemaining: 1500,
  _intervalId: null,

  init() {
    this.updateDisplay();
    this.updateDurationLabel();
    this.updateButtonStates();

    const startBtn = document.getElementById('timer-start');
    const stopBtn  = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    const decBtn   = document.getElementById('timer-dec');
    const incBtn   = document.getElementById('timer-inc');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn)  stopBtn.addEventListener('click',  () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
    if (decBtn)   decBtn.addEventListener('click',   () => this.adjustDuration(-1));
    if (incBtn)   incBtn.addEventListener('click',   () => this.adjustDuration(+1));

    this.syncOnVisibility();
  },

  adjustDuration(delta) {
    if (this.state.running) return;
    const next = this._durationMinutes + delta;
    if (next < 1 || next > 90) return;
    this._durationMinutes = next;
    const secs = next * 60;
    this.state.remaining = secs;
    this._initialRemaining = secs;
    this.state.startTimestamp = null;
    this.updateDisplay();
    this.updateDurationLabel();
  },

  updateDurationLabel() {
    const label = document.getElementById('timer-duration-label');
    if (label) label.textContent = this._durationMinutes + ' menit';
    const decBtn = document.getElementById('timer-dec');
    const incBtn = document.getElementById('timer-inc');
    if (decBtn) decBtn.disabled = this._durationMinutes <= 1  || this.state.running;
    if (incBtn) incBtn.disabled = this._durationMinutes >= 90 || this.state.running;
  },

  start() {
    if (this.state.running) return;
    this.state.running = true;
    this.state.startTimestamp = Date.now();
    this._initialRemaining = this.state.remaining;
    this._intervalId = setInterval(() => { this.tick(); }, 1000);
    this.updateButtonStates();
  },

  stop() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this.state.running = false;
    this.updateButtonStates();
  },

  reset() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    const secs = this._durationMinutes * 60;
    this.state.remaining = secs;
    this.state.running = false;
    this.state.startTimestamp = null;
    this._initialRemaining = secs;
    this.updateDisplay();
    this.updateDurationLabel();
    this.updateButtonStates();
  },

  tick() {
    const elapsed = Math.floor((Date.now() - this.state.startTimestamp) / 1000);
    this.state.remaining = this._initialRemaining - elapsed;
    this.updateDisplay();
    if (this.state.remaining <= 0) {
      this.state.remaining = 0;
      this.updateDisplay();
      this.handleComplete();
    }
  },

  updateDisplay() {
    const el = document.getElementById('timer-display');
    if (!el) return;
    const total = Math.max(0, this.state.remaining);
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    el.textContent = mm + ':' + ss;
  },

  handleComplete() {
    this.stop();
    const n = document.getElementById('timer-notification');
    if (n) {
      n.classList.remove('hidden');
      setTimeout(() => n.classList.add('hidden'), 3000);
    }
    this.playAudio();
  },

  playAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
      osc.onended = () => ctx.close();
    } catch (e) {
      console.warn('FocusTimer.playAudio error:', e);
    }
  },

  syncOnVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.state.running) {
        const elapsed = Math.floor((Date.now() - this.state.startTimestamp) / 1000);
        this.state.remaining = this._initialRemaining - elapsed;
        if (this.state.remaining <= 0) {
          this.state.remaining = 0;
          this.updateDisplay();
          this.handleComplete();
        } else {
          this.updateDisplay();
        }
      }
    });
  },

  updateButtonStates() {
    const startBtn = document.getElementById('timer-start');
    const stopBtn  = document.getElementById('timer-stop');
    if (startBtn) startBtn.disabled = this.state.running;
    if (stopBtn)  stopBtn.disabled  = !this.state.running;
    this.updateDurationLabel();
  },
};

const TodoList = {
  state: { tasks: [], sortMode: "status" },

  /**
   * Inisialisasi TodoList.
   * Muat tasks dari Storage, render, dan pasang event listeners
   * untuk tombol sort dan tombol tambah task.
   */
  init() {
    this.state.tasks = Storage.get("tasks", []);
    this.renderTasks();

    // Tombol sort — ubah sortMode lalu render ulang
    const sortStatusBtn = document.getElementById("sort-status");
    if (sortStatusBtn) {
      sortStatusBtn.addEventListener("click", () => {
        this.state.sortMode = "status";
        this.renderTasks();
      });
    }

    const sortPriorityBtn = document.getElementById("sort-priority");
    if (sortPriorityBtn) {
      sortPriorityBtn.addEventListener("click", () => {
        this.state.sortMode = "priority";
        this.renderTasks();
      });
    }

    // Tombol tambah task
    const addBtn = document.getElementById("task-add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const input = document.getElementById("task-input");
        const select = document.getElementById("priority-select");
        if (input && select) {
          this.addTask(input.value, select.value);
        }
      });
    }

    // Izinkan Enter pada input untuk menambah task
    const taskInput = document.getElementById("task-input");
    if (taskInput) {
      taskInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const select = document.getElementById("priority-select");
          if (select) this.addTask(taskInput.value, select.value);
        }
      });
    }
  },

  /**
   * Render seluruh daftar task ke DOM.
   * Urutkan tasks sesuai sortMode saat ini, buat elemen li untuk tiap task,
   * lalu tampilkan/sembunyikan #empty-state.
   * Requirements: 12.1–12.8
   */
  renderTasks() {
    const list = document.getElementById("task-list");
    if (!list) return;

    // Bersihkan list sebelum render ulang
    list.innerHTML = "";

    const sorted = this.sortTasks(this.state.tasks);

    sorted.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.dataset.id = task.id;
      li.dataset.completed = String(task.completed);
      li.dataset.priority = task.priority;

      // Checkbox + label
      const checkGroup = document.createElement("div");
      checkGroup.className = "task-check-group";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.id = `check-${task.id}`;
      checkbox.setAttribute("aria-label", `Tandai selesai: ${task.text}`);
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => this.toggleTask(task.id));

      const label = document.createElement("label");
      label.htmlFor = `check-${task.id}`;
      label.className = "task-text";
      label.textContent = task.text;

      checkGroup.appendChild(checkbox);
      checkGroup.appendChild(label);

      // Priority badge
      const meta = document.createElement("div");
      meta.className = "task-meta";

      const badge = document.createElement("span");
      badge.className = `priority-badge priority-${task.priority}`;
      badge.textContent = task.priority;

      meta.appendChild(badge);

      // Tombol aksi edit & hapus
      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "task-edit-btn";
      editBtn.setAttribute("aria-label", "Edit task");
      editBtn.textContent = "Edit";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "task-delete-btn";
      deleteBtn.setAttribute("aria-label", "Hapus task");
      deleteBtn.textContent = "Hapus";

      // Pasang event listener Edit (Task 10.3)
      editBtn.addEventListener("click", () => this.enterEditMode(task.id));

      // Pasang event listener Delete (Task 10.4)
      deleteBtn.addEventListener("click", () => this.deleteTask(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(checkGroup);
      li.appendChild(meta);
      li.appendChild(actions);

      list.appendChild(li);
    });

    // Tampilkan/sembunyikan #empty-state
    const emptyState = document.getElementById("empty-state");
    if (emptyState) {
      if (this.state.tasks.length === 0) {
        emptyState.classList.remove("hidden");
      } else {
        emptyState.classList.add("hidden");
      }
    }
  },

  /**
   * Urutkan array tasks sesuai sortMode saat ini.
   * Tidak memutasi array asli — kembalikan salinan terurut.
   *
   * Sort by status : incomplete (0) → complete (1); sama-sama → urutan asli
   * Sort by priority: tinggi (0) > sedang (1) > rendah (2);
   *                   jika sama → incomplete (0) sebelum complete (1)
   *
   * @param {Array} tasks - Array task yang akan diurutkan
   * @returns {Array} Salinan terurut dari tasks
   * Requirements: 12.1–12.8
   */
  sortTasks(tasks) {
    const copy = [...tasks];

    if (this.state.sortMode === "status") {
      // false (belum selesai) = 0, true (selesai) = 1
      copy.sort((a, b) => {
        const statusA = a.completed ? 1 : 0;
        const statusB = b.completed ? 1 : 0;
        return statusA - statusB;
        // Jika statusA === statusB → hasil 0 → urutan asli dipertahankan (stable sort)
      });
    } else if (this.state.sortMode === "priority") {
      const priorityRank = { tinggi: 0, sedang: 1, rendah: 2 };
      copy.sort((a, b) => {
        const rankA = priorityRank[a.priority] ?? 1;
        const rankB = priorityRank[b.priority] ?? 1;
        if (rankA !== rankB) return rankA - rankB;
        // Secondary sort: incomplete (0) sebelum complete (1)
        const statusA = a.completed ? 1 : 0;
        const statusB = b.completed ? 1 : 0;
        return statusA - statusB;
      });
    }

    return copy;
  },

  /**
   * Normalisasi teks untuk keperluan deduplikasi:
   * trim + lowercase + collapse internal whitespace ke satu spasi.
   * @param {string} text - Teks mentah yang akan dinormalisasi
   * @returns {string} Teks ternormalisasi
   * Requirements: 11.1, 11.2, 11.3
   */
  normalizeText(text) {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
  },

  /**
   * Periksa apakah teks sudah ada dalam daftar (setelah normalisasi).
   * @param {string} text - Teks yang akan diperiksa
   * @returns {boolean} true jika teks duplikat sudah ada
   * Requirements: 4.6, 11.1–11.3
   */
  isDuplicate(text) {
    const normalized = this.normalizeText(text);
    return this.state.tasks.some(
      (t) => this.normalizeText(t.text) === normalized,
    );
  },

  /**
   * Tampilkan pesan error di #task-error.
   * Auto-hide setelah 3 detik.
   * Juga sembunyi saat user mulai mengetik di #task-input.
   * @param {string} msg - Pesan error yang akan ditampilkan
   * Requirements: 4.5, 4.6
   */
  showError(msg) {
    const errorEl = document.getElementById("task-error");
    if (!errorEl) return;

    errorEl.textContent = msg;

    // Auto-hide setelah 3 detik
    const hideTimeout = setTimeout(() => {
      errorEl.textContent = "";
    }, 3000);

    // Sembunyi saat user mulai mengetik
    const taskInput = document.getElementById("task-input");
    if (taskInput) {
      const onInput = () => {
        clearTimeout(hideTimeout);
        errorEl.textContent = "";
        taskInput.removeEventListener("input", onInput);
      };
      taskInput.addEventListener("input", onInput);
    }
  },

  /**
   * Tambahkan task baru ke daftar.
   * Validasi teks, cek duplikat, buat task object, simpan, render, kosongkan input.
   * @param {string} text     - Teks task dari input
   * @param {string} priority - Prioritas task: 'tinggi', 'sedang', atau 'rendah'
   * Requirements: 4.1–4.6, 11.1–11.5
   */
  addTask(text, priority) {
    const trimmed = text.trim();

    // Validasi: tidak boleh kosong atau hanya spasi (Requirements 4.5)
    if (trimmed.length === 0) {
      this.showError("Teks task tidak boleh kosong.");
      return;
    }

    // Validasi: maksimal 100 karakter (Requirements 4.5)
    if (trimmed.length > 100) {
      this.showError("Teks task maksimal 100 karakter.");
      return;
    }

    // Cek duplikat — pertahankan teks di input jika duplikat (Requirements 4.6, 11.1–11.3)
    if (this.isDuplicate(trimmed)) {
      this.showError("Task sudah ada dalam daftar.");
      return;
    }

    // Buat task object (Requirements 4.2)
    const id = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    const newTask = {
      id,
      text: trimmed,
      completed: false,
      priority: priority || "sedang",
      createdAt: Date.now(),
    };

    // Tambahkan ke state (Requirements 4.1)
    this.state.tasks.push(newTask);

    // Simpan ke Storage (Requirements 4.3, 8.1)
    Storage.set("tasks", this.state.tasks);

    // Render ulang daftar task
    this.renderTasks();

    // Kosongkan input (Requirements 4.4)
    const inputEl = document.getElementById("task-input");
    if (inputEl) {
      inputEl.value = "";
    }
  },

  /**
   * Masuk ke mode edit untuk task tertentu.
   * Memanipulasi DOM item langsung tanpa me-render ulang seluruh daftar,
   * sehingga task lain tidak terganggu.
   * Requirements: 5.1–5.3
   * @param {string} id - ID task yang akan diedit
   */
  enterEditMode(id) {
    // Cari <li> dengan data-id yang cocok
    const li = document.querySelector(`[data-id="${id}"]`);
    if (!li) return;

    // Cari teks task yang sedang ada
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return;

    // Ganti isi .task-check-group dengan input edit (Requirements 5.2)
    const checkGroup = li.querySelector(".task-check-group");
    if (checkGroup) {
      checkGroup.innerHTML = "";

      const inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.className = "task-edit-input";
      inputEl.value = task.text;
      inputEl.setAttribute("aria-label", "Edit teks task");
      inputEl.maxLength = 100;

      checkGroup.appendChild(inputEl);

      // Fokus dan tempatkan kursor di akhir teks
      inputEl.focus();
      inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
    }

    // Ganti isi .task-actions dengan tombol konfirmasi dan batal (Requirements 5.3)
    const actions = li.querySelector(".task-actions");
    if (actions) {
      actions.innerHTML = "";

      const confirmBtn = document.createElement("button");
      confirmBtn.className = "task-confirm-btn";
      confirmBtn.setAttribute("aria-label", "Konfirmasi edit");
      confirmBtn.textContent = "Simpan";

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "task-cancel-btn";
      cancelBtn.setAttribute("aria-label", "Batal edit");
      cancelBtn.textContent = "Batal";

      // Ambil referensi input setelah dibuat di atas
      const inputEl = li.querySelector(".task-edit-input");

      // Konfirmasi: panggil editTask dengan nilai input saat ini
      confirmBtn.addEventListener("click", () => {
        this.editTask(id, inputEl ? inputEl.value : "");
      });

      // Batal: kembalikan ke tampilan normal via exitEditMode
      cancelBtn.addEventListener("click", () => {
        this.exitEditMode(id);
      });

      // Izinkan Enter untuk konfirmasi, Escape untuk batal
      if (inputEl) {
        inputEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") this.editTask(id, inputEl.value);
          if (e.key === "Escape") this.exitEditMode(id);
        });
      }

      actions.appendChild(confirmBtn);
      actions.appendChild(cancelBtn);
    }
  },

  /**
   * Keluar dari mode edit dan kembalikan tampilan normal.
   * Cukup render ulang seluruh daftar untuk memulihkan state.
   * Requirements: 5.6
   * @param {string} id - ID task (tidak digunakan langsung, tapi konsisten dengan API)
   */
  exitEditMode(id) {
    this.renderTasks();
  },

  /**
   * Perbarui teks task setelah konfirmasi edit.
   * Validasi teks baru tidak kosong; jika kosong tampilkan error tanpa keluar edit mode.
   * Jika valid, update task object, simpan ke Storage, render ulang.
   * Requirements: 5.4, 5.5, 5.7
   * @param {string} id      - ID task yang akan diperbarui
   * @param {string} newText - Teks baru dari input edit
   */
  editTask(id, newText) {
    const trimmed = newText.trim();

    // Validasi: tidak boleh kosong (Requirements 5.5)
    if (trimmed.length === 0) {
      // Tampilkan error TANPA keluar dari edit mode — pertahankan input terlihat
      const li = document.querySelector(`[data-id="${id}"]`);
      if (li) {
        // Gunakan #task-error yang sudah ada di DOM untuk konsistensi
        const errorEl = document.getElementById("task-error");
        if (errorEl) {
          errorEl.textContent = "Teks task tidak boleh kosong.";
          setTimeout(() => {
            errorEl.textContent = "";
          }, 3000);
        }
        // Fokus kembali ke input edit agar UX jelas
        const inputEl = li.querySelector(".task-edit-input");
        if (inputEl) inputEl.focus();
      }
      return;
    }

    // Cari task di state
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return;

    // Update teks task
    task.text = trimmed;

    // Simpan ke Storage (Requirements 5.4, 8.1)
    const saved = Storage.set("tasks", this.state.tasks);

    // Jika Storage gagal, tampilkan error tapi tetap update tampilan in-session (Requirements 5.7)
    if (!saved) {
      const errorEl = document.getElementById("task-error");
      if (errorEl) {
        errorEl.textContent =
          "Perubahan gagal disimpan. Local Storage tidak tersedia.";
        setTimeout(() => {
          errorEl.textContent = "";
        }, 3000);
      }
    }

    // Render ulang untuk keluar dari edit mode dan tampilkan teks terbaru
    this.renderTasks();
  },

  /**
   * Toggle status completed sebuah task.
   * Cari task berdasarkan id, flip completed, simpan ke Storage, render ulang.
   * @param {string} id - ID task yang akan di-toggle
   * Requirements: 6.1–6.6
   */
  toggleTask(id) {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return;

    // Flip status completed
    task.completed = !task.completed;

    // Simpan ke Storage SEBELUM update UI (Requirements 6.3)
    Storage.set("tasks", this.state.tasks);

    // Render ulang untuk mencerminkan perubahan
    this.renderTasks();
  },

  /**
   * Hapus task dari daftar berdasarkan id.
   * Filter task dari state, simpan ke Storage, render ulang.
   * renderTasks() sudah menangani empty state secara otomatis.
   * @param {string} id - ID task yang akan dihapus
   * Requirements: 7.1–7.6
   */
  deleteTask(id) {
    // Hapus task dari array
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);

    // Simpan ke Storage (Requirements 7.3)
    Storage.set("tasks", this.state.tasks);

    // Render ulang — renderTasks() menampilkan empty state jika daftar kosong
    this.renderTasks();
  },
};

// ─────────────────────────────────────────────
// App Bootstrap
// Inisialisasi semua modul setelah DOM siap.
// ThemeToggle harus pertama agar tidak ada flicker tema.
// Requirements: 13.2
// ─────────────────────────────────────────────
const App = {
  init() {
    ThemeToggle.init();
    GreetingWidget.init();
    FocusTimer.init();
    TodoList.init();
    // QuickLinks tidak memerlukan inisialisasi JS — semua statis di HTML
  },
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

