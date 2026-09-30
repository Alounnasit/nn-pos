/**
 * ==============================================================================
 * 🛒 NN POS & INVENTORY MANAGEMENT SYSTEM (ສຳລັບຮ້ານຂາຍເຄື່ອງຍ່ອຍ)
 * Backend Google Apps Script (V8 Engine)
 * Spreadsheet ID: 1N-crS27vxOnT9S_FWLH03OjipZrxNcHGIidLa0ycyHQ
 * ==============================================================================
 */

// Spreadsheet ID ສຳຮອງ (ກໍລະນີ Deploy ເປັນ Standalone Web App)
const SPREADSHEET_ID = '1N-crS27vxOnT9S_FWLH03OjipZrxNcHGIidLa0ycyHQ';

// ຊື່ Sheet Tabs ທັງ 5
const SHEETS = {
  PRODUCTS: 'Products',
  PRODUCT_UNITS: 'Product_Units',
  INVENTORY_BATCHES: 'Inventory_Batches',
  SALES_HEADER: 'Sales_Header',
  SALES_DETAILS: 'Sales_Details'
};

/**
 * ຟັງຊັນດຶງ Spreadsheet Object (ຮອງຮັບທັງ Container-bound ແລະ Standalone)
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // Ignore error when running in standalone context
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * ສ້າງເມນູເທິງ Google Sheets ອັດຕະໂນມັດເມື່ອເປີດໄຟລ໌
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🛒 ລະບົບຮ້ານຄ້າ (NN POS)')
    .addItem('1. ເປີດໜ້າຈໍຂາຍ POS (Full Window)', 'openPosModal')
    .addItem('2. ເປີດແຖບຂາຍ POS (Sidebar)', 'openPosSidebar')
    .addSeparator()
    .addItem('3. ສ້າງ / ຣີເຊັດຕາຕະລາງຖານຂໍ້ມູນ (Auto Setup)', 'setupDatabaseSheets')
    .addItem('4. ສະຫຼຸບຍອດຂາຍປະຈຳວັນ (Daily Summary)', 'showDailySummaryAlert')
    .addItem('5. ກວດສອບສິນຄ້າໃກ້ໝົດສະຕ໋ອກ (Low Stock Alert)', 'showLowStockAlert')
    .addSeparator()
    .addItem('6. 🧹 ລຶບຂໍ້ມູນສິນຄ້າຕົວຢ່າງທັງໝົດ (Clear Sample Data)', 'clearAllDatabaseData')
    .addToUi();
}

/**
 * ຟັງຊັນໃຫ້ບໍລິການ Web App & REST API Endpoint ເມື່ອເປີດຜ່ານ URL (doGet)
 * - ຮອງຮັບທັງການເປີດ Web App ໂດຍກົງໃນ Google Apps Script
 * - ຮອງຮັບການຮ້ອງຂໍ API ຜ່ານ JSON ຈາກພາຍນອກ (ເຊັ່ນ: GitHub Pages / Vercel)
 */
function doGet(e) {
  // 1. ຖ້າບໍ່ມີ Parameter action: ສົ່ງໜ້າ HTML Web App ຕາມປົກກະຕິ
  if (!e || !e.parameter || !e.parameter.action) {
    const htmlOutput = HtmlService.createHtmlOutputFromFile('index')
      .setTitle('NN POS - ລະບົບຂາຍໜ້າຮ້ານ & ບໍລິຫານສາງ')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return htmlOutput;
  }

  // 2. ຖ້າມີ Parameter action: ສົ່ງຂໍ້ມູນ JSON API ກັບຄືນໃຫ້ Frontend ພາຍນອກ (GitHub Pages)
  const action = e.parameter.action;
  let result = { success: false, error: 'Unknown action' };

  try {
    if (action === 'getPOSInitialData') {
      result = { success: true, data: getPOSInitialData() };
    } else if (action === 'getDailySalesSummary') {
      result = { success: true, data: getDailySalesSummary() };
    } else if (action === 'loginUser') {
      result = loginUser(e.parameter);
    } else if (action === 'clearAllData') {
      result = clearAllDatabaseData();
    }
  } catch (err) {
    result = { success: false, error: err.message || String(err) };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ຟັງຊັນຮັບຂໍ້ມູນແບບ POST (doPost) ສຳລັບການຂາຍ (Checkout) ແລະ ຮັບສິນຄ້າ (Restock) ຈາກພາຍນອກ (GitHub Pages)
 */
function doPost(e) {
  let result = { success: false, error: 'Unknown action' };

  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    const action = body.action || (e && e.parameter && e.parameter.action);
    const payload = body.data || body;

    if (action === 'recordSale') {
      const saleRes = recordSale(payload);
      result = { success: true, data: saleRes };
    } else if (action === 'restockBatch') {
      const restockRes = restockBatch(payload);
      result = { success: true, data: restockRes };
    } else if (action === 'getPOSInitialData') {
      result = { success: true, data: getPOSInitialData() };
    } else if (action === 'getDailySalesSummary') {
      result = { success: true, data: getDailySalesSummary() };
    } else if (action === 'loginUser') {
      result = loginUser(payload);
    } else if (action === 'clearAllData') {
      result = clearAllDatabaseData();
    }
  } catch (err) {
    result = { success: false, error: err.message || String(err) };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ເປີດໜ້າຈໍຂາຍ POS ແບບ Modal Dialog ຂະໜາດໃຫຍ່
 */
function openPosModal() {
  const html = HtmlService.createHtmlOutputFromFile('index')
    .setWidth(1280)
    .setHeight(820);
  SpreadsheetApp.getUi().showModalDialog(html, '🛒 NN POS - ລະບົບຂາຍໜ້າຮ້ານ');
}

/**
 * ເປີດໜ້າຈໍຂາຍ POS ແບບ Sidebar ຢູ່ແຖບຂ້າງ
 */
function openPosSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('🛒 NN POS');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * ------------------------------------------------------------------------------
 * 🛠️ 1. ສ້າງ ແລະ ຈັດ Format ຕາຕະລາງຖານຂໍ້ມູນທັງ 5 Tabs (Setup Database)
 * ------------------------------------------------------------------------------
 */
function setupDatabaseSheets() {
  const ss = getSpreadsheet();
  
  // 1. Products Tab
  let shProd = ss.getSheetByName(SHEETS.PRODUCTS);
  if (!shProd) shProd = ss.insertSheet(SHEETS.PRODUCTS);
  shProd.clear();
  shProd.appendRow([
    'product_id',
    'name_lo',
    'category',
    'base_uom',
    'is_weighable',
    'plu_code',
    'min_stock'
  ]);
  // ຕັ້ງ Format Text (@) ໃຫ້ product_id (A) ແລະ plu_code (F)
  shProd.getRange('A2:A1000').setNumberFormat('@');
  shProd.getRange('F2:F1000').setNumberFormat('@');
  formatHeaderRow(shProd, '#1E3A8A');

  // 2. Product_Units Tab
  let shUnits = ss.getSheetByName(SHEETS.PRODUCT_UNITS);
  if (!shUnits) shUnits = ss.insertSheet(SHEETS.PRODUCT_UNITS);
  shUnits.clear();
  shUnits.appendRow([
    'barcode',
    'product_id',
    'unit_name',
    'conversion_qty',
    'selling_price'
  ]);
  // ຕັ້ງ Format Text (@) ໃຫ້ barcode (A) ແລະ product_id (B)
  shUnits.getRange('A2:A2000').setNumberFormat('@');
  shUnits.getRange('B2:B2000').setNumberFormat('@');
  formatHeaderRow(shUnits, '#0F766E');

  // 3. Inventory_Batches Tab (FEFO)
  let shBatches = ss.getSheetByName(SHEETS.INVENTORY_BATCHES);
  if (!shBatches) shBatches = ss.insertSheet(SHEETS.INVENTORY_BATCHES);
  shBatches.clear();
  shBatches.appendRow([
    'batch_id',
    'product_id',
    'expiry_date',
    'cost_per_unit',
    'qty_on_hand',
    'received_date'
  ]);
  shBatches.getRange('A2:A2000').setNumberFormat('@');
  shBatches.getRange('B2:B2000').setNumberFormat('@');
  shBatches.getRange('C2:C2000').setNumberFormat('yyyy-mm-dd');
  shBatches.getRange('F2:F2000').setNumberFormat('yyyy-mm-dd');
  formatHeaderRow(shBatches, '#7C2D12');

  // 4. Sales_Header Tab
  let shHeader = ss.getSheetByName(SHEETS.SALES_HEADER);
  if (!shHeader) shHeader = ss.insertSheet(SHEETS.SALES_HEADER);
  shHeader.clear();
  shHeader.appendRow([
    'receipt_no',
    'sale_datetime',
    'cashier',
    'total_lak',
    'payment_type',
    'received_lak',
    'change_lak'
  ]);
  shHeader.getRange('A2:A5000').setNumberFormat('@');
  formatHeaderRow(shHeader, '#1E293B');

  // 5. Sales_Details Tab
  let shDetails = ss.getSheetByName(SHEETS.SALES_DETAILS);
  if (!shDetails) shDetails = ss.insertSheet(SHEETS.SALES_DETAILS);
  shDetails.clear();
  shDetails.appendRow([
    'receipt_no',
    'barcode',
    'product_id',
    'item_name',
    'qty_sold',
    'unit_price',
    'total_cost',
    'subtotal'
  ]);
  shDetails.getRange('A2:A10000').setNumberFormat('@');
  shDetails.getRange('B2:B10000').setNumberFormat('@');
  shDetails.getRange('C2:C10000').setNumberFormat('@');
  formatHeaderRow(shDetails, '#374151');

  // ລຶບ Sheet1 ທີ່ຕິດມາກັບ Spreadsheet ໃໝ່ (ຖ້າມີ ແລະ ບໍ່ແມ່ນ 5 Tabs ນີ້)
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  // ຕັ້ງເລກບິນເລີ່ມຕົ້ນໃນ PropertiesService
  PropertiesService.getScriptProperties().setProperty('LAST_RECEIPT_NO', '1');

  SpreadsheetApp.flush();
  return { success: true, message: 'ສ້າງຕາຕະລາງຖານຂໍ້ມູນທັງ 5 Tabs ສຳເລັດແລ້ວ! (ພ້ອມໃຊ້ງານ, ບໍ່ມີຂໍ້ມູນຕົວຢ່າງ)' };
}

/**
 * Helper: ຕົກແຕ່ງແຖວ Header ໃຫ້ສວຍງາມ ແລະ Freeze ແຖວທີ 1
 */
function formatHeaderRow(sheet, bgColor) {
  const lastCol = sheet.getLastColumn();
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange
    .setBackground(bgColor)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);
  for (let c = 1; c <= lastCol; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * ------------------------------------------------------------------------------
 * 📦 2. ດຶງຂໍ້ມູນສິນຄ້າ, ບາໂຄ້ດ ແລະ ສະຕ໋ອກ (Fetch POS Catalog)
 * ------------------------------------------------------------------------------
 */
function getPOSInitialData() {
  const ss = getSpreadsheet();
  
  // 1. ດຶງ Products
  let shProd = ss.getSheetByName(SHEETS.PRODUCTS);
  if (!shProd) shProd = ss.insertSheet(SHEETS.PRODUCTS);
  
  const productsMap = {};
  const categoriesSet = new Set();

  if (shProd.getLastRow() > 1) {
    const prodData = shProd.getDataRange().getValues();
    for (let i = 1; i < prodData.length; i++) {
      const row = prodData[i];
      const pid = String(row[0]).trim();
      if (!pid) continue;
      const cat = String(row[2] || 'ທົ່ວໄປ').trim();
      categoriesSet.add(cat);
      
      productsMap[pid] = {
        product_id: pid,
        name_lo: String(row[1] || ('ສິນຄ້າ ' + pid)),
        category: cat,
        base_uom: String(row[3] || 'ອັນ'),
        is_weighable: Boolean(row[4] === true || String(row[4]).toLowerCase() === 'true'),
        plu_code: String(row[5] || '').trim(),
        min_stock: Number(row[6] || 0),
        total_stock: 0,
        next_expiry: null,
        units: []
      };
    }
  }

  // 2. ດຶງ Inventory Batches ເພື່ອຄິດໄລ່ຍອດສະຕ໋ອກລວມ & ວັນໝົດອາຍຸໃກ້ສຸດ (ພ້ອມ Auto-heal ສິນຄ້າທີ່ຍັງບໍ່ທັນມີໃນ Tab Products)
  const shBatches = ss.getSheetByName(SHEETS.INVENTORY_BATCHES);
  if (shBatches && shBatches.getLastRow() > 1) {
    const batchData = shBatches.getDataRange().getValues();
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 1; i < batchData.length; i++) {
      const bRow = batchData[i];
      const pid = String(bRow[1]).trim();
      const expStr = bRow[2];
      const qty = Number(bRow[4] || 0);

      if (!pid) continue;

      // ຖ້າພົບ product_id ໃນ Inventory_Batches ແຕ່ຍັງບໍ່ມີໃນ Tab Products ໃຫ້ສ້າງອັດຕະໂນມັດ
      if (!productsMap[pid]) {
        productsMap[pid] = {
          product_id: pid,
          name_lo: 'ສິນຄ້າ ' + pid,
          category: 'ທົ່ວໄປ',
          base_uom: 'ອັນ',
          is_weighable: false,
          plu_code: '',
          min_stock: 10,
          total_stock: 0,
          next_expiry: null,
          units: []
        };
        categoriesSet.add('ທົ່ວໄປ');
        try {
          shProd.appendRow([pid, 'ສິນຄ້າ ' + pid, 'ທົ່ວໄປ', 'ອັນ', false, '', 10]);
        } catch (e) {}
      }

      if (qty > 0) {
        productsMap[pid].total_stock += qty;
        
        let expDate = null;
        if (expStr instanceof Date) {
          expDate = expStr;
        } else if (typeof expStr === 'string' && expStr.trim()) {
          expDate = new Date(expStr);
        }
        
        if (expDate && !isNaN(expDate.getTime())) {
          const expFormatted = Utilities.formatDate(expDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          if (!productsMap[pid].next_expiry || expFormatted < productsMap[pid].next_expiry) {
            productsMap[pid].next_expiry = expFormatted;
          }
        }
      }
    }
  }

  // 3. ດຶງ Product_Units (ພ້ອມ Auto-heal ສິນຄ້າທີ່ຍັງບໍ່ທັນມີໃນ Tab Products)
  const shUnits = ss.getSheetByName(SHEETS.PRODUCT_UNITS);
  const unitsList = [];
  const barcodeMap = {};

  if (shUnits && shUnits.getLastRow() > 1) {
    const unitData = shUnits.getDataRange().getValues();
    for (let i = 1; i < unitData.length; i++) {
      const uRow = unitData[i];
      const barcode = String(uRow[0]).trim();
      const pid = String(uRow[1]).trim();
      const unitName = String(uRow[2] || 'ອັນ');
      const convQty = Number(uRow[3] || 1);
      const price = Number(uRow[4] || 0);

      if (!barcode || !pid) continue;

      if (!productsMap[pid]) {
        productsMap[pid] = {
          product_id: pid,
          name_lo: 'ສິນຄ້າ ' + pid,
          category: 'ທົ່ວໄປ',
          base_uom: unitName,
          is_weighable: false,
          plu_code: '',
          min_stock: 10,
          total_stock: 0,
          next_expiry: null,
          units: []
        };
        categoriesSet.add('ທົ່ວໄປ');
        try {
          shProd.appendRow([pid, 'ສິນຄ້າ ' + pid, 'ທົ່ວໄປ', unitName, false, '', 10]);
        } catch (e) {}
      }

      const unitObj = {
        barcode: barcode,
        product_id: pid,
        unit_name: unitName,
        conversion_qty: convQty,
        selling_price: price,
        product_name: productsMap[pid].name_lo,
        base_uom: productsMap[pid].base_uom,
        is_weighable: productsMap[pid].is_weighable,
        plu_code: productsMap[pid].plu_code
      };

      unitsList.push(unitObj);
      barcodeMap[barcode] = unitObj;
      productsMap[pid].units.push(unitObj);
    }
  }

  // 4. ສ້າງ Default Unit ໃຫ້ທຸກສິນຄ້າທີ່ຍັງບໍ່ທັນມີໜ່ວຍຂາຍໃນ Product_Units
  Object.values(productsMap).forEach(p => {
    if (!p.units || p.units.length === 0) {
      const barcode = p.plu_code || p.product_id;
      const unitObj = {
        barcode: barcode,
        product_id: p.product_id,
        unit_name: p.base_uom || 'ອັນ',
        conversion_qty: 1,
        selling_price: 0,
        product_name: p.name_lo,
        base_uom: p.base_uom || 'ອັນ',
        is_weighable: p.is_weighable,
        plu_code: p.plu_code
      };
      p.units = [unitObj];
      unitsList.push(unitObj);
      barcodeMap[barcode] = unitObj;

      if (shUnits) {
        try {
          shUnits.appendRow([barcode, p.product_id, unitObj.unit_name, 1, 0]);
        } catch (e) {}
      }
    }
  });

  return {
    products: Object.values(productsMap),
    units: unitsList,
    barcodeMap: barcodeMap,
    categories: ['ທັງໝົດ', ...Array.from(categoriesSet)],
    storeInfo: {
      name: 'ຮ້ານຂາຍເຄື່ອງຍ່ອຍ NN POS',
      address: 'ບ້ານ ໂພນຕ້ອງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
      phone: '020-5555-8888',
      taxId: 'TX-2026-88899',
      currency: 'LAK'
    }
  };
}

/**
 * ------------------------------------------------------------------------------
 * 💳 3. ບັນທຶກການຂາຍ ແລະ ຕັດສະຕ໋ອກ FEFO (Record Sale & FEFO Deduction)
 * ------------------------------------------------------------------------------
 */
function recordSale(saleData) {
  // ໃຊ້ LockService ເພື່ອປ້ອງກັນ Race Condition
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(30000); // ລໍຖ້າສູງສຸດ 30 ວິນາທີ
  if (!hasLock) {
    throw new Error('ລະບົບກຳລັງປະມວນຜົນບິນອື່ນຢູ່, ກະລຸນາລອງໃໝ່ອີກຄັ້ງ');
  }

  try {
    const ss = getSpreadsheet();
    const shBatches = ss.getSheetByName(SHEETS.INVENTORY_BATCHES);
    const shHeader = ss.getSheetByName(SHEETS.SALES_HEADER);
    const shDetails = ss.getSheetByName(SHEETS.SALES_DETAILS);

    if (!shBatches || !shHeader || !shDetails) {
      throw new Error('ບໍ່ພົບຕາຕະລາງຖານຂໍ້ມູນທີ່ຈຳເປັນ');
    }

    // 1. ສ້າງເລກບິນອັດຕະໂນມັດ (Sequential Receipt Number)
    const props = PropertiesService.getScriptProperties();
    let lastNo = parseInt(props.getProperty('LAST_RECEIPT_NO') || '0', 10);
    lastNo += 1;
    props.setProperty('LAST_RECEIPT_NO', lastNo.toString());
    const receiptNo = 'INV-' + ('00000' + lastNo).slice(-5);

    // ວັນທີ ແລະ ເວລາປັດຈຸບັນ
    const now = new Date();
    const saleDatetime = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

    // 2. ໂຫຼດຂໍ້ມູນສະຕ໋ອກທັງໝົດມາໄວ້ໃນ Memory ເພື່ອຕັດ FEFO
    const batchValues = shBatches.getDataRange().getValues();
    // batchValues[0] ແມ່ນ Header: [batch_id, product_id, expiry_date, cost_per_unit, qty_on_hand, received_date]
    const batchRows = [];
    for (let r = 1; r < batchValues.length; r++) {
      const row = batchValues[r];
      let expDate = null;
      if (row[2] instanceof Date) {
        expDate = row[2];
      } else if (typeof row[2] === 'string' && row[2].trim()) {
        expDate = new Date(row[2]);
      }
      
      batchRows.push({
        rowIndex: r + 1, // 1-based row index in Sheet
        batch_id: String(row[0]),
        product_id: String(row[1]).trim(),
        expiry_date: expDate,
        expiry_str: expDate ? Utilities.formatDate(expDate, 'GMT+7', 'yyyy-MM-dd') : '9999-12-31',
        cost_per_unit: Number(row[3] || 0),
        qty_on_hand: Number(row[4] || 0),
        received_date: row[5]
      });
    }

    const detailsToAppend = [];
    const batchUpdates = {}; // { rowIndex: newQty }

    // 3. ວົນລູບແຕ່ລະລາຍການທີ່ຂາຍເພື່ອຕັດສະຕ໋ອກ FEFO
    const items = saleData.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const pid = String(item.product_id).trim();
      const qtySold = Number(item.qty_sold || 0);
      const convQty = Number(item.conversion_qty || 1);
      let baseQtyNeeded = qtySold * convQty; // ຈຳນວນໃນໜ່ວຍຍ່ອຍສຸດທີ່ຕ້ອງຕັດ

      // ຄົ້ນຫາ Batches ຂອງສິນຄ້ານີ້ ທີ່ມີສະຕ໋ອກເຫຼືອ
      const eligibleBatches = batchRows.filter(b => b.product_id === pid && b.qty_on_hand > 0);
      
      // ຮຽງລຳດັບຕາມວັນໝົດອາຍຸ (FEFO: ໝົດອາຍຸກ່ອນ ຕັດກ່ອນ)
      eligibleBatches.sort((a, b) => a.expiry_str.localeCompare(b.expiry_str));

      let totalItemCost = 0;
      let qtyDeducted = 0;

      for (let b = 0; b < eligibleBatches.length; b++) {
        if (baseQtyNeeded <= 0) break;
        const currentBatch = eligibleBatches[b];
        const canDeduct = Math.min(currentBatch.qty_on_hand, baseQtyNeeded);

        currentBatch.qty_on_hand -= canDeduct;
        baseQtyNeeded -= canDeduct;
        qtyDeducted += canDeduct;
        totalItemCost += (canDeduct * currentBatch.cost_per_unit);

        // ບັນທຶກການອັບເດດແຖວໃນ Sheet
        batchUpdates[currentBatch.rowIndex] = currentBatch.qty_on_hand;
      }

      // ຖ້າສະຕ໋ອກບໍ່ພໍ (ຂາຍຕິດລົບ) ໃຫ້ຄິດໄລ່ຕົ້ນທຶນສະເລ່ຍ ຫຼື ຕົ້ນທຶນລ່າສຸດ
      if (baseQtyNeeded > 0) {
        const lastBatch = eligibleBatches[eligibleBatches.length - 1];
        const fallbackCost = lastBatch ? lastBatch.cost_per_unit : 0;
        totalItemCost += (baseQtyNeeded * fallbackCost);
      }

      detailsToAppend.push([
        receiptNo,
        String(item.barcode),
        pid,
        String(item.item_name || ''),
        qtySold,
        Number(item.unit_price || 0),
        Math.round(totalItemCost),
        Number(item.subtotal || 0)
      ]);
    }

    // 4. ຂຽນຄ່າສະຕ໋ອກໃໝ່ລົງ Inventory_Batches
    for (const [rIndex, newQty] of Object.entries(batchUpdates)) {
      shBatches.getRange(Number(rIndex), 5).setValue(newQty);
    }

    // 5. ບັນທຶກຫົວບິນລົງ Sales_Header
    shHeader.appendRow([
      receiptNo,
      saleDatetime,
      String(saleData.cashier || 'ແຄັດເຊຍ 1'),
      Number(saleData.total_lak || 0),
      String(saleData.payment_type || 'CASH'),
      Number(saleData.received_lak || 0),
      Number(saleData.change_lak || 0)
    ]);

    // 6. ບັນທຶກລາຍການສິນຄ້າຍ່ອຍລົງ Sales_Details
    if (detailsToAppend.length > 0) {
      const startRow = shDetails.getLastRow() + 1;
      shDetails.getRange(startRow, 1, detailsToAppend.length, detailsToAppend[0].length).setValues(detailsToAppend);
    }

    SpreadsheetApp.flush();

    return {
      success: true,
      receipt_no: receiptNo,
      sale_datetime: saleDatetime,
      total_lak: Number(saleData.total_lak || 0),
      received_lak: Number(saleData.received_lak || 0),
      change_lak: Number(saleData.change_lak || 0),
      payment_type: saleData.payment_type
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * ------------------------------------------------------------------------------
 * 📥 4. ຮັບສິນຄ້າໃໝ່ເຂົ້າສາງ (Restock / Add New Product & Batch)
 * ------------------------------------------------------------------------------
 */
function restockBatch(batchData) {
  const ss = getSpreadsheet();
  const shProd = ss.getSheetByName(SHEETS.PRODUCTS);
  const shUnits = ss.getSheetByName(SHEETS.PRODUCT_UNITS);
  const shBatches = ss.getSheetByName(SHEETS.INVENTORY_BATCHES);

  if (!shBatches) throw new Error('ບໍ່ພົບ Tab Inventory_Batches');

  const now = new Date();
  const todayStr = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const batchId = batchData.batch_id || ('LOT-' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmm'));
  
  const barcode = String(batchData.barcode || '').trim();
  const prodName = String(batchData.product_name || batchData.name_lo || '').trim();
  const category = String(batchData.category || 'ທົ່ວໄປ').trim();
  const unitName = String(batchData.unit_name || 'ອັນ').trim();
  const conversionQty = Math.max(1, Number(batchData.conversion_qty || 1));
  const sellingPrice = Number(batchData.selling_price || 0);
  const costPerUnit = Number(batchData.cost_per_unit || 0);
  const qty = Number(batchData.qty || 1);
  const expiryDate = batchData.expiry_date || Utilities.formatDate(new Date(now.getTime() + 365*24*3600*1000), 'GMT+7', 'yyyy-MM-dd');

  let productId = String(batchData.product_id || '').trim();

  // 1. ກວດສອບວ່າ Barcode ນີ້ມີໃນ Product_Units ແລ້ວຫຼືບໍ່
  let foundUnitRow = -1;
  if (shUnits && barcode) {
    const unitsData = shUnits.getDataRange().getValues();
    for (let i = 1; i < unitsData.length; i++) {
      if (String(unitsData[i][0]).trim() === barcode) {
        foundUnitRow = i + 1;
        if (!productId) productId = String(unitsData[i][1]).trim();
        break;
      }
    }
  }

  // 2. ກວດສອບ ແລະ ສ້າງ Product ໃໝ່ໃນ Tab Products ຖ້າຍັງບໍ່ມີ
  let foundProdRow = -1;
  if (shProd) {
    const prodData = shProd.getDataRange().getValues();
    if (productId) {
      for (let i = 1; i < prodData.length; i++) {
        if (String(prodData[i][0]).trim() === productId) {
          foundProdRow = i + 1;
          break;
        }
      }
    } else if (prodName) {
      for (let i = 1; i < prodData.length; i++) {
        if (String(prodData[i][1]).trim().toLowerCase() === prodName.toLowerCase()) {
          foundProdRow = i + 1;
          productId = String(prodData[i][0]).trim();
          break;
        }
      }
    }

    // ສ້າງ Product ID ໃໝ່ອັດຕະໂນມັດ (P001, P002...) ຖ້າຍັງບໍ່ມີ
    if (!productId) {
      let maxNum = 0;
      for (let i = 1; i < prodData.length; i++) {
        const id = String(prodData[i][0]).trim();
        const m = id.match(/P(\d+)/i);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n > maxNum) maxNum = n;
        }
      }
      productId = 'P' + String(maxNum + 1).padStart(3, '0');
    }

    if (foundProdRow === -1) {
      shProd.appendRow([
        productId,
        prodName || ('ສິນຄ້າ ' + productId),
        category || 'ທົ່ວໄປ',
        unitName || 'ອັນ',
        false,
        '',
        10
      ]);
    } else {
      if (prodName) shProd.getRange(foundProdRow, 2).setValue(prodName);
      if (category) shProd.getRange(foundProdRow, 3).setValue(category);
    }
  }

  // 3. ເພີ່ມ ຫຼື ອັບເດດໃນ Product_Units
  if (shUnits && barcode) {
    if (foundUnitRow === -1) {
      shUnits.appendRow([
        barcode,
        productId,
        unitName || 'ອັນ',
        conversionQty,
        sellingPrice
      ]);
    } else {
      if (unitName) shUnits.getRange(foundUnitRow, 3).setValue(unitName);
      if (conversionQty) shUnits.getRange(foundUnitRow, 4).setValue(conversionQty);
      if (sellingPrice > 0) shUnits.getRange(foundUnitRow, 5).setValue(sellingPrice);
    }
  }

  // 4. ເພີ່ມ Batch ເຂົ້າໃນ Inventory_Batches
  const baseQty = qty * conversionQty;
  const costPerBaseUnit = costPerUnit / conversionQty;
  shBatches.appendRow([
    batchId,
    productId,
    String(expiryDate),
    costPerBaseUnit,
    baseQty,
    todayStr
  ]);

  SpreadsheetApp.flush();

  return {
    success: true,
    message: 'ຮັບສິນຄ້າເຂົ້າສາງຮຽບຮ້ອຍແລ້ວ! ລະຫັດລ໊ອດ: ' + batchId,
    batch_id: batchId,
    product_id: productId,
    barcode: barcode
  };
}

/**
 * ------------------------------------------------------------------------------
 * 🧹 ລຶບຂໍ້ມູນສິນຄ້າຕົວຢ່າງ ແລະ ລາຍການທັງໝົດອອກຈາກ Google Sheets (Reset to Empty)
 * ------------------------------------------------------------------------------
 */
function clearAllDatabaseData() {
  const ss = getSpreadsheet();
  const sheetsToClear = [
    SHEETS.PRODUCTS,
    SHEETS.PRODUCT_UNITS,
    SHEETS.INVENTORY_BATCHES,
    SHEETS.SALES_HEADER,
    SHEETS.SALES_DETAILS
  ];
  
  sheetsToClear.forEach(sheetName => {
    const sh = ss.getSheetByName(sheetName);
    if (sh && sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
    }
  });

  return { success: true, message: 'ລຶບຂໍ້ມູນສິນຄ້າ ແລະ ລາຍການທັງໝົດອອກຈາກ Google Sheets ຮຽບຮ້ອຍແລ້ວ! ຕາຕະລາງພ້ອມໃຊ້ງານໃໝ່.' };
}

/**
 * ------------------------------------------------------------------------------
 * 📊 5. ສະຫຼຸບຍອດຂາຍ ແລະ ລາຍງານ (Reports & Summary)
 * ------------------------------------------------------------------------------
 */
function getDailySalesSummary() {
  const ss = getSpreadsheet();
  const shHeader = ss.getSheetByName(SHEETS.SALES_HEADER);
  const shDetails = ss.getSheetByName(SHEETS.SALES_DETAILS);

  const todayStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');

  let totalSalesToday = 0;
  let totalCostToday = 0;
  let orderCountToday = 0;
  const cashTotal = { CASH: 0, BCEL_ONE: 0, TRANSFER: 0 };
  const itemSales = {};

  if (shHeader && shHeader.getLastRow() > 1) {
    const headers = shHeader.getDataRange().getValues();
    for (let i = 1; i < headers.length; i++) {
      const row = headers[i];
      const dt = String(row[1] || '');
      if (dt.startsWith(todayStr)) {
        orderCountToday++;
        const total = Number(row[3] || 0);
        totalSalesToday += total;
        const pType = String(row[4] || 'CASH');
        cashTotal[pType] = (cashTotal[pType] || 0) + total;
      }
    }
  }

  if (shDetails && shDetails.getLastRow() > 1) {
    const details = shDetails.getDataRange().getValues();
    for (let i = 1; i < details.length; i++) {
      const row = details[i];
      const rNo = String(row[0]);
      // ກວດສອບຕົ້ນທຶນ ແລະ ສິນຄ້າຂາຍດີ
      const cost = Number(row[6] || 0);
      const subtotal = Number(row[7] || 0);
      const name = String(row[3]);
      const qty = Number(row[4] || 0);

      totalCostToday += cost;
      if (!itemSales[name]) itemSales[name] = { qty: 0, revenue: 0 };
      itemSales[name].qty += qty;
      itemSales[name].revenue += subtotal;
    }
  }

  // ຈັດອັນດັບ 5 ສິນຄ້າຂາຍດີ
  const topItems = Object.entries(itemSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    date: todayStr,
    orderCount: orderCountToday,
    totalSales: totalSalesToday,
    totalCost: totalCostToday,
    grossProfit: totalSalesToday - totalCostToday,
    paymentMethods: cashTotal,
    topItems: topItems
  };
}

/**
 * ແຈ້ງເຕືອນຍອດຂາຍປະຈຳວັນຜ່ານ UI Alert
 */
function showDailySummaryAlert() {
  const summary = getDailySalesSummary();
  const formatLak = (n) => Number(n).toLocaleString() + ' ₭';
  
  const msg = 
    `📅 ວັນທີ: ${summary.date}\n` +
    `🧾 ຈຳນວນບິນທັງໝົດ: ${summary.orderCount} ບິນ\n` +
    `💰 ຍອດຂາຍລວມ: ${formatLak(summary.totalSales)}\n` +
    `💵 ເງິນສົດ (CASH): ${formatLak(summary.paymentMethods.CASH || 0)}\n` +
    `📱 ໂອນ / BCEL One: ${formatLak((summary.paymentMethods.BCEL_ONE || 0) + (summary.paymentMethods.TRANSFER || 0))}\n` +
    `📈 ກຳໄລຂັ້ນຕົ້ນປະມານ: ${formatLak(summary.grossProfit)}`;

  SpreadsheetApp.getUi().alert('📊 ສະຫຼຸບຍອດຂາຍປະຈຳວັນ', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * ແຈ້ງເຕືອນສິນຄ້າໃກ້ໝົດສະຕ໋ອກ
 */
function showLowStockAlert() {
  const data = getPOSInitialData();
  const lowItems = (data.products || []).filter(p => p.total_stock <= p.min_stock);

  if (lowItems.length === 0) {
    SpreadsheetApp.getUi().alert('✅ ສະຕ໋ອກປົກກະຕິ', 'ບໍ່ມີສິນຄ້າທີ່ໃກ້ໝົດສະຕ໋ອກໃນຂະນະນີ້.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  let msg = `⚠️ ພົບ ${lowItems.length} ລາຍການທີ່ສະຕ໋ອກຕ່ຳກວ່າເກນ:\n\n`;
  lowItems.forEach(item => {
    msg += `• ${item.name_lo}: ເຫຼືອ ${item.total_stock} ${item.base_uom} (ເກນຂັ້ນຕ່ຳ ${item.min_stock})\n`;
  });

  SpreadsheetApp.getUi().alert('⚠️ ແຈ້ງເຕືອນສິນຄ້າໃກ້ໝົດສະຕ໋ອກ', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * ------------------------------------------------------------------------------
 * 👥 7. ລະບົບຢືນຢັນຕົວຕົນຜູ້ໃຊ້ (Super Admin, Admin, Cashier)
 * ------------------------------------------------------------------------------
 */
const SYSTEM_USERS = [
  {
    user_id: 'USR-001',
    username: 'superadmin',
    password: 'superadmin123',
    pin: '9999',
    full_name: 'ເຈົ້າຂອງຮ້ານ (Super Admin)',
    role: 'SUPERADMIN'
  },
  {
    user_id: 'USR-002',
    username: 'admin',
    password: 'admin123',
    pin: '8888',
    full_name: 'ຜູ້ຈັດການ (Store Admin)',
    role: 'ADMIN'
  },
  {
    user_id: 'USR-003',
    username: 'cashier',
    password: 'cashier123',
    pin: '1234',
    full_name: 'ພະນັກງານຂາຍ (Cashier)',
    role: 'CASHIER'
  }
];

function loginUser(credentials) {
  try {
    const creds = credentials || {};
    const username = (creds.username || '').toString().trim().toLowerCase();
    const password = (creds.password || '').toString();
    const pin = (creds.pin || '').toString().trim();

    let found = null;
    if (pin) {
      found = SYSTEM_USERS.find(u => u.pin === pin);
    } else if (username) {
      found = SYSTEM_USERS.find(u => u.username.toLowerCase() === username && u.password === password);
    }

    if (found) {
      return {
        success: true,
        user: {
          user_id: found.user_id,
          username: found.username,
          full_name: found.full_name,
          role: found.role
        }
      };
    }
    return { success: false, error: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ' };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

