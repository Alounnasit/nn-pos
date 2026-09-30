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

  const sampleProducts = [
    ['P001', 'ເບຍລາວ ກະປ໋ອງ 330ml', 'ເຄື່ອງດື່ມ', 'ກະປ໋ອງ', false, '', 48],
    ['P002', 'ນ້ຳດື່ມ ຫົວເສືອ 600ml', 'ເຄື່ອງດື່ມ', 'ຕຸກ', false, '', 24],
    ['P003', 'ໝີ່ໄວໄວ ຕົ້ມຍຳກຸ້ງ', 'ອາຫານແຫ້ງ', 'ຊອງ', false, '', 30],
    ['P004', 'ຊີ້ນໝູສາມຊັ້ນ (ຊັ່ງກິໂລ)', 'ອາຫານສົດ', 'ກິໂລ', true, '00105', 5],
    ['P005', 'ໝາກກ້ຽງຫວານ (ຊັ່ງກິໂລ)', 'ໝາກໄມ້', 'ກິໂລ', true, '00106', 10],
    ['P006', 'ໄຂ່ໄກ່ເບີ 1', 'ຂອງສົດ', 'ຟອງ', false, '', 60],
    ['P007', 'ກາເຟດາວ 3in1 (ສີແດງ)', 'ເຄື່ອງດື່ມ', 'ຊອງ', false, '', 50],
    ['P008', 'ນົມສົດ ດັດຊ໌ມິລຄ໌ 180ml', 'ນົມແລະເຄື່ອງດື່ມ', 'ກ່ອງ', false, '', 36],
    ['P009', 'ເຄື່ອງດື່ມກະປ໋ອງແດງ (8857200400213)', 'ເຄື່ອງດື່ມ', 'ກະປ໋ອງ', false, '', 24]
  ];
  shProd.getRange(2, 1, sampleProducts.length, sampleProducts[0].length).setValues(sampleProducts);
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

  const sampleUnits = [
    ['8850001', 'P001', 'ກະປ໋ອງ', 1, 15000],
    ['8850002', 'P001', 'ແພັກ (6 ກະປ໋ອງ)', 6, 88000],
    ['8850003', 'P001', 'ແກັດ (24 ກະປ໋ອງ)', 24, 340000],
    ['8850004', 'P002', 'ຕຸກ', 1, 5000],
    ['8850005', 'P002', 'ແພັກ (12 ຕຸກ)', 12, 55000],
    ['8850006', 'P003', 'ຊອງ', 1, 4000],
    ['8850007', 'P003', 'ແພັກ (10 ຊອງ)', 10, 38000],
    ['00105',   'P004', 'ກິໂລກຣາມ', 1, 95000],
    ['00106',   'P005', 'ກິໂລກຣາມ', 1, 35000],
    ['8850008', 'P006', 'ຟອງ', 1, 2500],
    ['8850009', 'P006', 'ແຕະ (30 ຟອງ)', 30, 72000],
    ['8850010', 'P007', 'ຊອງ', 1, 3000],
    ['8850011', 'P007', 'ຖົງໃຫຍ່ (25 ຊອງ)', 25, 70000],
    ['8850012', 'P008', 'ກ່ອງ', 1, 7000],
    ['8850013', 'P008', 'ແພັກ (4 ກ່ອງ)', 4, 26000],
    ['8857200400213', 'P009', 'ກະປ໋ອງ', 1, 12000]
  ];
  shUnits.getRange(2, 1, sampleUnits.length, sampleUnits[0].length).setValues(sampleUnits);
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

  const sampleBatches = [
    ['LOT-2601', 'P001', '2026-11-30', 11500, 48, '2026-09-01'],
    ['LOT-2602', 'P001', '2027-03-15', 12000, 96, '2026-09-20'],
    ['LOT-2603', 'P002', '2027-06-30', 3500, 120, '2026-09-10'],
    ['LOT-2604', 'P003', '2027-01-20', 2800, 60, '2026-09-15'],
    ['LOT-2605', 'P004', '2026-10-05', 75000, 15, '2026-09-28'],
    ['LOT-2606', 'P005', '2026-10-10', 25000, 25, '2026-09-28'],
    ['LOT-2607', 'P006', '2026-10-20', 1800, 120, '2026-09-25'],
    ['LOT-2608', 'P007', '2027-08-30', 2100, 100, '2026-09-10'],
    ['LOT-2609', 'P008', '2026-12-15', 5200, 48, '2026-09-22']
  ];
  shBatches.getRange(2, 1, sampleBatches.length, sampleBatches[0].length).setValues(sampleBatches);
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
  
  const sampleSalesHeader = [
    ['INV-00001', '2026-09-29 15:00:00', 'ແຄັດເຊຍ 1', 103000, 'CASH', 105000, 2000]
  ];
  shHeader.getRange(2, 1, sampleSalesHeader.length, sampleSalesHeader[0].length).setValues(sampleSalesHeader);
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

  const sampleSalesDetails = [
    ['INV-00001', '8850001', 'P001', 'ເບຍລາວ (ກະປ໋ອງ)', 1, 15000, 11500, 15000],
    ['INV-00001', '8850002', 'P001', 'ເບຍລາວ (ແພັກ 6)', 1, 88000, 69000, 88000]
  ];
  shDetails.getRange(2, 1, sampleSalesDetails.length, sampleSalesDetails[0].length).setValues(sampleSalesDetails);
  formatHeaderRow(shDetails, '#374151');

  // ລຶບ Sheet1 ທີ່ຕິດມາກັບ Spreadsheet ໃໝ່ (ຖ້າມີ ແລະ ບໍ່ແມ່ນ 5 Tabs ນີ້)
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  // ຕັ້ງເລກບິນເລີ່ມຕົ້ນໃນ PropertiesService
  PropertiesService.getScriptProperties().setProperty('LAST_RECEIPT_NO', '1');

  SpreadsheetApp.flush();
  return { success: true, message: 'ສ້າງຕາຕະລາງຖານຂໍ້ມູນທັງ 5 Tabs ສຳເລັດແລ້ວ!' };
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
  const shProd = ss.getSheetByName(SHEETS.PRODUCTS);
  if (!shProd) return { error: 'ບໍ່ພົບ Tab Products ກະລຸນາກົດ Setup Database ກ່ອນ' };
  const prodData = shProd.getDataRange().getValues();
  if (prodData.length <= 1) return { products: [], units: [] };

  const productsMap = {};
  const categoriesSet = new Set();

  for (let i = 1; i < prodData.length; i++) {
    const row = prodData[i];
    const pid = String(row[0]).trim();
    if (!pid) continue;
    const cat = String(row[2] || 'ທົ່ວໄປ').trim();
    categoriesSet.add(cat);
    
    productsMap[pid] = {
      product_id: pid,
      name_lo: String(row[1] || ''),
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

  // 2. ດຶງ Inventory Batches ເພື່ອຄິດໄລ່ຍອດສະຕ໋ອກລວມ & ວັນໝົດອາຍຸໃກ້ສຸດ
  const shBatches = ss.getSheetByName(SHEETS.INVENTORY_BATCHES);
  if (shBatches) {
    const batchData = shBatches.getDataRange().getValues();
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 1; i < batchData.length; i++) {
      const bRow = batchData[i];
      const pid = String(bRow[1]).trim();
      const expStr = bRow[2];
      const qty = Number(bRow[4] || 0);

      if (productsMap[pid] && qty > 0) {
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

  // 3. ດຶງ Product_Units
  const shUnits = ss.getSheetByName(SHEETS.PRODUCT_UNITS);
  const unitsList = [];
  const barcodeMap = {};

  if (shUnits) {
    const unitData = shUnits.getDataRange().getValues();
    for (let i = 1; i < unitData.length; i++) {
      const uRow = unitData[i];
      const barcode = String(uRow[0]).trim();
      const pid = String(uRow[1]).trim();
      const unitName = String(uRow[2] || '');
      const convQty = Number(uRow[3] || 1);
      const price = Number(uRow[4] || 0);

      if (!barcode || !productsMap[pid]) continue;

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
 * 📥 4. ຮັບສິນຄ້າໃໝ່ເຂົ້າສາງ (Restock / Add New Batch)
 * ------------------------------------------------------------------------------
 */
function restockBatch(batchData) {
  const ss = getSpreadsheet();
  const shBatches = ss.getSheetByName(SHEETS.INVENTORY_BATCHES);
  if (!shBatches) throw new Error('ບໍ່ພົບ Tab Inventory_Batches');

  const now = new Date();
  const todayStr = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const batchId = batchData.batch_id || ('LOT-' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmm'));
  
  shBatches.appendRow([
    batchId,
    String(batchData.product_id).trim(),
    String(batchData.expiry_date),
    Number(batchData.cost_per_unit || 0),
    Number(batchData.qty || 0),
    todayStr
  ]);

  return { success: true, message: 'ຮັບສິນຄ້າເຂົ້າສາງຮຽບຮ້ອຍແລ້ວ! ລະຫັດລ໊ອດ: ' + batchId };
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

