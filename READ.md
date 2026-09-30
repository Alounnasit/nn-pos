# 🛒 ລະບົບ POS & Inventory ຮ້ານຂາຍເຄື່ອງຍ່ອຍ (Google Apps Script + Google Sheets)

ລະບົບຂາຍໜ້າຮ້ານ (POS) ແລະ ບໍລິຫານສາງສິນຄ້າ (Inventory Management) ສຳລັບຮ້ານຂາຍເຄື່ອງຍ່ອຍ ທີ່ເຮັດວຽກຢູ່ເທິງ **Google Apps Script** ແລະ ເກັບຂໍ້ມູນລົງໃນ **Google Sheets** 100% ໂດຍໃຊ້ພຽງ **2 ໄຟລ໌ຫຼັກ (`Code.gs` ແລະ `index.html`)** ບໍ່ຕ້ອງຕິດຕັ້ງໂປຣແກຣມເພີ່ມ ແລະ ບໍ່ມີຄ່າເຊົ່າ Server.

---

## 🛠️ 1. ເທັກໂນໂລຢີທີ່ນຳໃຊ້ (Tech Stack)

### 💻 Frontend & UI (ໜ້າຈໍຂາຍໜ້າຮ້ານ)
* **Frontend:** **HTML5, Vanilla JavaScript** — ຈັດການກະຕ່າສິນຄ້າໃນ Memory Array, ຄົ້ນຫາບາໂຄ້ດທັນທີ (< 10ms), ຖອດລະຫັດບາໂຄ້ດຊິງຊັ່ງດິຈິຕອນ 13 ຫຼັກ, ແລະ ຄິດໄລ່ເງິນທອນແບບ Real-time.
* **Styling & UI:** **Tailwind CSS (via CDN), SweetAlert2** (ສຳລັບ Popup ແຈ້ງເຕືອນ, ສະຖານະ Loading, ຢືນຢັນການຊຳລະເງິນ, ແລະ ຟອມຮັບສິນຄ້າເຂົ້າສາງ) ພ້ອມຮອງຮັບການພິມໃບບິນຄວາມຮ້ອນ 80mm (`@media print`).

### ⚙️ Backend & Database (ລະບົບຫຼັງບ້ານ ແລະ ຖານຂໍ້ມູນ)
* **Backend Runtime:** **Google Apps Script (V8 Engine)**
  * `HtmlService` — ສະແດງຜົນໜ້າຈໍ POS (`index.html`) ຜ່ານ Web App ຫຼື Modal Dialog ໃນ Google Sheets.
  * `google.script.run` — ຮັບ-ສົ່ງຂໍ້ມູນລະຫວ່າງໜ້າເວັບ (`index.html`) ກັບຫຼັງບ້ານ (`Code.gs`).
  * `LockService` — ລ໊ອກຄິວການຕັດສະຕ໋ອກເທື່ອລະບິນ ປ້ອງກັນບັນຫາຂໍ້ມູນຊ້ອນກັນ (Race Condition).
  * `PropertiesService` — ເກັບເລກບິນລ່າສຸດ (`LAST_RECEIPT_NO`) ເພື່ອລັນເລກບິນອັດຕະໂນມັດ (`INV-00001`).
* **Database:** **Google Sheets (`SpreadsheetApp`)** — ເກັບຂໍ້ມູນສິນຄ້າ, ບາໂຄ້ດຫຼາຍໜ່ວຍນັບ, ສະຕ໋ອກແຍກຕາມວັນໝົດອາຍຸ (FEFO), ແລະ ປະຫວັດການຂາຍ.

---

## 📁 2. ໂຄງສ້າງໄຟລ໌ໃນ Apps Script Editor

ຢູ່ໃນເມນູ **Extensions > Apps Script** ຂອງ Google Sheets ຈະໃຊ້ພຽງ **2 ໄຟລ໌** ເທົ່ານັ້ນ:

```text
📦 Grocery_POS_System (Apps Script Editor)
 ├── 📜 Code.gs        # ໄຟລ໌ຫຼັກ (ມີມາໃຫ້ແລ້ວ): ລວມຟັງຊັນສ້າງຕາຕະລາງ Sheet, ດຶງສິນຄ້າ, ບັນທຶກບິນ, ແລະ ຕັດສະຕ໋ອກ FEFO
 └── 🌐 index.html     # ໄຟລ໌ໜ້າຈໍ (ກົດ + > HTML): ລວມ HTML5 + Tailwind CDN + SweetAlert2 CDN + Vanilla JS
```

---

## ✨ 3. ຟີເຈີຫຼັກຂອງລະບົບ (Core Features)

1. **Auto Database Setup (`setupDatabaseSheets`):** ລັນຄຳສັ່ງດຽວ ລະບົບສ້າງ Tabs ທັງ 5 ພ້ອມຈັດ Format Text (`@`) ສຳລັບບາໂຄ້ດ ແລະ ໃສ່ຂໍ້ມູນຕົວຢ່າງໃຫ້ອັດຕະໂນມັດ.
2. **Multi-UOM (ຮອງຮັບຫຼາຍໜ່ວຍນັບ):** ຜູກບາໂຄ້ດ "ອັນ/ກະປ໋ອງ", "ແພັກ", ແລະ "ແກັດ" ເຂົ້າກັບສິນຄ້າໂຕດຽວກັນ ແລະ ຕັດສະຕ໋ອກລວມເປັນໜ່ວຍຍ່ອຍສຸດ (`base_uom`) ອັດຕະໂນມັດ.
3. **FEFO Inventory Deduction (ໝົດອາຍຸກ່ອນ ອອກກ່ອນ):** ເວລາຂາຍສິນຄ້າ ລະບົບຈະຄົ້ນຫາລ໊ອດ (`Inventory_Batches`) ທີ່ມີວັນໝົດອາຍຸໃກ້ທີ່ສຸດມາຕັດສະຕ໋ອກກ່ອນສະເໝີ ພ້ອມຄິດໄລ່ຕົ້ນທຶນແທ້ຈິງ.
4. **Weighing Scale Barcode (ບາໂຄ້ດຊິງຊັ່ງດິຈິຕອນ):** ຮອງຮັບບາໂຄ້ດ 13 ຫຼັກຈາກຊິງຊັ່ງ (ຂຶ້ນຕົ້ນດ້ວຍ `20`) ໂດຍຖອດລະຫັດ `plu_code` 5 ຫຼັກ ແລະ ນ້ຳໜັກກິໂລກຣາມອັດຕະໂນມັດ.
5. **80mm Thermal Receipt Printing:** ຈັດໜ້າໃບບິນຂະໜາດ 80mm ພ້ອມສັ່ງພິມທັນທີຫຼັງກົດຊຳລະເງິນ.

---

## 🗄️ 4. ໂຄງສ້າງຕາຕະລາງໃນ Google Sheets (5 Tabs)

ເມື່ອລັນຟັງຊັນ `setupDatabaseSheets()` ລະບົບຈະສ້າງ 5 Tabs ດັ່ງນີ້ອັດຕະໂນມັດ:

### 1. `Products` (ຂໍ້ມູນສິນຄ້າຫຼັກ)
| Col A (`product_id`) | Col B (`name_lo`) | Col C (`category`) | Col D (`base_uom`) | Col E (`is_weighable`) | Col F (`plu_code`) | Col G (`min_stock`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `P001` | ເບຍລາວ ກະປ໋ອງ 330ml | ເຄື່ອງດື່ມ | ກະປ໋ອງ | `FALSE` | | `48` |
| `P004` | ຊີ້ນໝູສາມຊັ້ນ (ຊັ່ງກິໂລ) | ອາຫານສົດ | ກິໂລ | `TRUE` | `00105` | `5` |

### 2. `Product_Units` (ບາໂຄ້ດ ແລະ ການແປງໜ່ວຍຂາຍ)
| Col A (`barcode`) | Col B (`product_id`) | Col C (`unit_name`) | Col D (`conversion_qty`) | Col E (`selling_price`) |
| :--- | :--- | :--- | :--- | :--- |
| `8850001` | `P001` | ກະປ໋ອງ | `1` | `15000` |
| `8850002` | `P001` | ແພັກ (6 ກະປ໋ອງ) | `6` | `88000` |
| `8850003` | `P001` | ແກັດ (24 ກະປ໋ອງ) | `24` | `340000` |
| `00105` | `P004` | ກິໂລກຣາມ | `1` | `95000` |

### 3. `Inventory_Batches` (ສະຕ໋ອກແຍກລ໊ອດ ແລະ ວັນໝົດອາຍຸ - FEFO)
| Col A (`batch_id`) | Col B (`product_id`) | Col C (`expiry_date`) | Col D (`cost_per_unit`) | Col E (`qty_on_hand`) | Col F (`received_date`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `LOT-2601` | `P001` | `2026-11-30` | `11500` | `48` | `2026-09-01` |
| `LOT-2602` | `P001` | `2027-03-15` | `12000` | `96` | `2026-09-20` |

### 4. `Sales_Header` (ປະຫວັດຫົວບິນຂາຍ)
| Col A (`receipt_no`) | Col B (`sale_datetime`) | Col C (`cashier`) | Col D (`total_lak`) | Col E (`payment_type`) | Col F (`received_lak`) | Col G (`change_lak`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `INV-00001` | `2026-09-29 15:00:00` | ແຄັດເຊຍ 1 | `103000` | `CASH` | `105000` | `2000` |

### 5. `Sales_Details` (ລາຍການສິນຄ້າຍ່ອຍໃນແຕ່ລະບິນ)
| Col A (`receipt_no`) | Col B (`barcode`) | Col C (`product_id`) | Col D (`item_name`) | Col E (`qty_sold`) | Col F (`unit_price`) | Col G (`total_cost`) | Col H (`subtotal`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `INV-00001` | `8850001` | `P001` | ເບຍລາວ (ກະປ໋ອງ) | `1` | `15000` | `11500` | `15000` |
| `INV-00001` | `8850002` | `P001` | ເບຍລາວ (ແພັກ 6) | `1` | `88000` | `69000` | `88000` |

---

## 🚀 5. ຂັ້ນຕອນການຕິດຕັ້ງ ແລະ ເປີດໃຊ້ງານ (Step-by-Step Setup)

### ຂັ້ນຕອນທີ 1: ວາງໂຄ້ດໃນ Apps Script
1. ເປີດໄຟລ໌ **Google Sheets** ໃໝ່.
2. ເຂົ້າໄປທີ່ເມນູ **Extensions (ສ່ວນຂະຫຍາຍ) > Apps Script**.
3. ລຶບໂຄ້ດເກົ່າໃນໄຟລ໌ `Code.gs` ອອກ ແລ້ວວາງໂຄ້ດຝັ່ງ Backend ລົງໄປ.
4. ກົດປຸ່ມ **➕ (Add a file) > HTML** ຕັ້ງຊື່ວ່າ **`index`** (ບໍ່ຕ້ອງພິມ `.html` ຊ້ຳ) ແລ້ວວາງໂຄ້ດຝັ່ງ Frontend ລົງໄປ ແລະ ກົດ **Save (💾)**.

### ຂັ້ນຕອນທີ 2: ສ້າງຕາຕະລາງຖານຂໍ້ມູນອັດຕະໂນມັດ
1. ຢູ່ແຖບເຄື່ອງມືດ້ານເທິງຂອງ `Code.gs` ໃຫ້ເລືອກຟັງຊັນ **`setupDatabaseSheets`** ແລ້ວກົດປຸ່ມ **▷ Run**.
2. ອະນຸຍາດສິດການເຂົ້າເຖິງ (Review Permissions > Advanced > Go to project).
3. ກັບໄປເບິ່ງໜ້າ Google Sheets ຈະເຫັນ Tabs ທັງ 5 ຖືກສ້າງຂຶ້ນມາພ້ອມຂໍ້ມູນຕົວຢ່າງທັນທີ.

### ຂັ້ນຕອນທີ 3: ເປີດໃຊ້ງານໜ້າຈໍ POS (Web App)
1. ກົດປຸ່ມສີຟ້າ **Deploy > New deployment**.
2. ກົດໄອຄອນຮູບຟັນເຟືອງ (⚙️) ເລືອກ **Web app**:
   * **Execute as:** `Me`
   * **Who has access:** `Anyone with Google Account` (ຫຼື `Anyone`)
3. ກົດ **Deploy** ແລ້ວຄລິກລິ້ງ **Web App URL** ເພື່ອເປີດໜ້າຈໍຂາຍ POS ໃຊ້ງານໄດ້ທັນທີ! *(ຫຼື ເປີດຈາກເມນູ **🛒 ລະບົບຮ້ານຄ້າ (POS) > 2. ເປີດໜ້າຈໍຂາຍ POS** ຢູ່ເທິງໜ້າ Google Sheets ກໍໄດ້ເຊັ່ນກັນ).*