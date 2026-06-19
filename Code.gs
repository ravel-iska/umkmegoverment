// ============================================================
//  Code.gs — Pasar Kutoarjo | Google Apps Script Server Side
//  Pasang di: Extensions → Apps Script → Code.gs
// ============================================================

// ── Konfigurasi ──────────────────────────────────────────────
const SPREADSHEET_ID = "GANTI_DENGAN_SPREADSHEET_ID_ANDA";
const SHEET_USERS    = "Database_User";   // Kolom: Email | Nama | Role | TanggalDaftar
const SHEET_PRODUCTS = "Database_Produk"; // Kolom: ID | Nama | Harga | Stok | Kategori | Deskripsi | EmailPenjual
const SHEET_ORDERS   = "Database_Pesanan";

// Akun Admin statis (tidak disimpan di Sheet)
const ADMIN_ACCOUNTS = [
  { username: "admin",  password: "admin123", nama: "Admin Utama",  email: "admin@pasarkutoarjo.id" },
  { username: "admin2", password: "admin456", nama: "Admin Kedua",  email: "admin2@pasarkutoarjo.id" },
];

// ── Halaman Utama ─────────────────────────────────────────────
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Pasar Kutoarjo")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
//  AUTH — Login Admin Manual
// ============================================================

/**
 * Validasi login admin manual.
 * @param {string} username
 * @param {string} password
 * @returns {{ success: boolean, nama: string, email: string, role: string } | { success: false, message: string }}
 */
function handleLogin(username, password) {
  const found = ADMIN_ACCOUNTS.find(
    (a) => a.username === username && a.password === password
  );
  if (found) {
    return { success: true, nama: found.nama, email: found.email, role: "Admin" };
  }
  return { success: false, message: "Username atau password salah." };
}

// ============================================================
//  AUTH — Cek & Daftarkan User Google
// ============================================================

/**
 * Ambil email user yang sedang login di Google, cek ke Sheet,
 * daftarkan otomatis sebagai Pembeli jika belum ada.
 * @returns {{ email: string, nama: string, role: string }}
 */
function checkUserRole() {
  const email = Session.getActiveUser().getEmail();
  if (!email) throw new Error("Tidak dapat mengambil email. Pastikan izin diberikan.");

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_USERS);
  const data  = sheet.getDataRange().getValues(); // [ [Email, Nama, Role, Tanggal], ... ]

  // Cari baris dengan email cocok (lewati header row=0)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return { email: data[i][0], nama: data[i][1], role: data[i][2] };
    }
  }

  // Belum terdaftar → simpan sebagai Pembeli
  const nama = email.split("@")[0];
  sheet.appendRow([email, nama, "Pembeli", new Date().toISOString()]);
  return { email, nama, role: "Pembeli" };
}

// ============================================================
//  USER — Update Role (Pembeli → Penjual)
// ============================================================

/**
 * Update role user di Sheet (misalnya Pembeli → Penjual).
 * @param {string} email
 * @param {string} newRole  "Penjual" | "Pembeli"
 * @returns {{ success: boolean }}
 */
function updateUserRole(email, newRole) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_USERS);
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      sheet.getRange(i + 1, 3).setValue(newRole); // Kolom C = Role
      return { success: true };
    }
  }
  return { success: false };
}

/**
 * Hapus user dari Sheet (Admin only — validasi role di frontend).
 * @param {string} email
 */
function deleteUser(email) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_USERS);
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

/**
 * Ambil semua user (Admin only).
 * @returns {Array<{ email, nama, role, tanggal }>}
 */
function getAllUsers() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_USERS);
  const data  = sheet.getDataRange().getValues();

  return data.slice(1).map((row) => ({
    email:    row[0],
    nama:     row[1],
    role:     row[2],
    tanggal:  row[3],
  }));
}

// ============================================================
//  PRODUK — CRUD oleh Penjual
// ============================================================

/**
 * Simpan produk baru atau update jika id sudah ada.
 * @param {{ id?, nama, harga, stok, kategori, deskripsi, emailPenjual }} produk
 */
function saveProduct(produk) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);
  const data  = sheet.getDataRange().getValues();

  if (produk.id) {
    // Update baris yang ada
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === produk.id) {
        sheet.getRange(i + 1, 1, 1, 7).setValues([[
          produk.id, produk.nama, produk.harga, produk.stok,
          produk.kategori, produk.deskripsi, produk.emailPenjual,
        ]]);
        return { success: true };
      }
    }
  }

  // Produk baru
  const newId = Utilities.getUuid();
  sheet.appendRow([
    newId, produk.nama, produk.harga, produk.stok,
    produk.kategori, produk.deskripsi, produk.emailPenjual,
  ]);
  return { success: true, id: newId };
}

/**
 * Ambil produk milik penjual tertentu.
 * @param {string} emailPenjual
 */
function getProductsBySeller(emailPenjual) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);
  const data  = sheet.getDataRange().getValues();

  return data.slice(1)
    .filter((row) => row[6] === emailPenjual)
    .map((row) => ({
      id:          row[0],
      nama:        row[1],
      harga:       row[2],
      stok:        row[3],
      kategori:    row[4],
      deskripsi:   row[5],
      emailPenjual:row[6],
    }));
}

/**
 * Hapus produk berdasarkan ID.
 * @param {string} productId
 */
function deleteProduct(productId) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

// ============================================================
//  STATISTIK — Admin Dashboard
// ============================================================

/**
 * Ringkasan statistik untuk dashboard admin.
 */
function getAdminStats() {
  const ss       = SpreadsheetApp.openById(SPREADSHEET_ID);
  const users    = ss.getSheetByName(SHEET_USERS).getDataRange().getValues().slice(1);
  const products = ss.getSheetByName(SHEET_PRODUCTS).getDataRange().getValues().slice(1);
  const orders   = ss.getSheetByName(SHEET_ORDERS).getDataRange().getValues().slice(1);

  const totalPenjual = users.filter((r) => r[2] === "Penjual").length;
  const totalRevenue = orders.reduce((s, r) => s + (Number(r[3]) || 0), 0); // Kolom D = total harga

  return {
    totalUser:      users.length,
    totalPenjual,
    totalProduk:    products.length,
    totalTransaksi: orders.length,
    totalRevenue,
  };
}
