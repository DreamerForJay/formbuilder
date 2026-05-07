/**
 * FormBuilder — Google Apps Script 後端
 * 部署為 Web App 後作為 API 端點
 *
 * 部署步驟：
 * 1. 開啟 https://script.google.com 建立新專案
 * 2. 貼上此程式碼
 * 3. 修改 SHEET_ID 為你的 Google Sheets ID
 * 4. 部署 → 新增部署 → 類型選「網頁應用程式」
 *    - 執行身分：我（你的帳號）
 *    - 存取權：所有人
 * 5. 複製部署 URL，填入 fill.html 的 GAS_URL
 */

const SHEET_ID = '1z8-bCp2YMP7YPRrUmv6YUcUoyMBPbMe5f7mBC1afGMY';

// ── POST：接收填答，寫入 Sheets ──────────────────────────
function doPost(e) {
  try {
    // 支援 JSON body 和 FormData 兩種格式
    let data;
    if (e.postData && e.postData.type === 'application/json') {
      data = JSON.parse(e.postData.contents);
    } else {
      // FormData 方式（no-cors fetch）
      const payload = e.parameter.payload || (e.postData && e.postData.contents);
      data = JSON.parse(payload);
    }
    const formId = data.formId;
    const form   = data.form;       // 表單結構（含 questions）
    const answers = data.answers;   // { questionId: [answer, ...] }

    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = getOrCreateSheet(ss, formId, form.title, form.questions);

    // 建立一列答案
    const row = [new Date().toLocaleString('zh-TW')];
    (form.questions || []).forEach(q => {
      const ans = answers[q.id] || [];
      row.push(ans.join('、'));
    });
    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

// ── GET：讀取統計資料 ────────────────────────────────────
function doGet(e) {
  try {
    const formId = e.parameter.formId;
    if (!formId) return jsonResponse({ ok: false, error: 'missing formId' }, 400);

    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(formId);
    if (!sheet) return jsonResponse({ ok: true, responses: [] });

    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return jsonResponse({ ok: true, responses: [] });

    const headers = rows[0]; // ['submittedAt', 'q1_title', 'q2_title', ...]
    const responses = rows.slice(1).map(row => {
      const obj = { submittedAt: row[0], answers: {} };
      headers.slice(1).forEach((h, i) => {
        // header 格式：qID:title，取 ID 作為 key
        const qid = String(h).split(':')[0];
        obj.answers[qid] = row[i + 1] ? String(row[i + 1]).split('、') : [];
      });
      return obj;
    });

    return jsonResponse({ ok: true, responses });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

// ── 取得或建立對應 Sheet ─────────────────────────────────
function getOrCreateSheet(ss, formId, formTitle, questions) {
  let sheet = ss.getSheetByName(formId);
  if (!sheet) {
    sheet = ss.insertSheet(formId);
    // 第一列：標題列
    const headers = ['submittedAt', ...questions.map(q => `${q.id}:${q.title}`)];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight('bold')
         .setBackground('#673ab7')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(data, code) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
                               .setMimeType(ContentService.MimeType.JSON);
  return output;
}
