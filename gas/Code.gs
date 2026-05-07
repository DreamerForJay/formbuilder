const SHEET_ID = '1z8-bCp2YMP7YPRrUmv6YUcUoyMBPbMe5f7mBC1afGMY';

// ── 所有請求統一走 doGet（避開 GAS POST 302 重導向問題）──
function doGet(e) {
  const action = e.parameter.action || 'read';

  try {
    if (action === 'submit') {
      // 寫入填答
      const data    = JSON.parse(decodeURIComponent(e.parameter.payload));
      const ss      = SpreadsheetApp.openById(SHEET_ID);
      const sheet   = getOrCreateSheet(ss, data.formId, data.form.questions);
      const row     = [new Date().toLocaleString('zh-TW')];
      (data.form.questions || []).forEach(q => {
        row.push((data.answers[String(q.id)] || []).join('、'));
      });
      sheet.appendRow(row);
      return jsonResponse({ ok: true });
    }

    // 讀取統計
    const formId = e.parameter.formId;
    if (!formId) return jsonResponse({ ok: false, error: 'missing formId' });

    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(formId);
    if (!sheet) return jsonResponse({ ok: true, responses: [] });

    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return jsonResponse({ ok: true, responses: [] });

    const headers   = rows[0];
    const responses = rows.slice(1).map(row => {
      const obj = { submittedAt: String(row[0]), answers: {} };
      headers.slice(1).forEach((h, i) => {
        const qid = String(h).split(':')[0];
        obj.answers[qid] = row[i + 1] ? String(row[i + 1]).split('、') : [];
      });
      return obj;
    });
    return jsonResponse({ ok: true, responses });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function getOrCreateSheet(ss, formId, questions) {
  let sheet = ss.getSheetByName(formId);
  if (!sheet) {
    sheet = ss.insertSheet(formId);
    const headers = ['submittedAt', ...questions.map(q => `${q.id}:${q.title}`)];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight('bold').setBackground('#673ab7').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
                       .setMimeType(ContentService.MimeType.JSON);
}
