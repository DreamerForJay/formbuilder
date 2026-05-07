# Google Sheets 整合教學

## 為什麼需要 Google Sheets？

FormBuilder 預設使用 localStorage 儲存資料，但 localStorage 只存在**填答者自己的瀏覽器**。這表示：
- 你在自己電腦看不到別人的填答
- 填答者清除瀏覽器資料後，填答記錄會消失

整合 Google Sheets 後，所有填答會**即時同步到你的 Google 試算表**，你可以隨時查看所有人的回答。

---

## 設定步驟（5 分鐘）

### 1. 建立 Google Sheets

1. 開啟 https://sheets.google.com
2. 建立一個新的試算表（例如命名為「FormBuilder 資料庫」）
3. 複製 URL 中的 **Sheets ID**：
   ```
   https://docs.google.com/spreadsheets/d/【這串就是 ID】/edit
   ```

### 2. 部署 Google Apps Script

1. 開啟 https://script.google.com
2. 點「新專案」
3. 將 `gas/Code.gs` 的內容全部複製貼上
4. 修改第 13 行：
   ```js
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // ← 貼上你的 Sheets ID
   ```
5. 點上方「部署」→「新增部署」
6. 類型選「**網頁應用程式**」
7. 設定：
   - **執行身分**：我（你的 Google 帳號）
   - **存取權**：**所有人**（重要！否則填答者無法提交）
8. 點「部署」，複製「網頁應用程式 URL」（類似 `https://script.google.com/macros/s/AKfycby.../exec`）

### 3. 設定 FormBuilder

1. 開啟你的 FormBuilder（`dashboard.html`）
2. 按 `F12` 開啟瀏覽器 Console
3. 貼上以下指令（替換成你的 URL）：
   ```js
   localStorage.setItem('fb_gas_url', 'https://script.google.com/macros/s/你的部署URL/exec')
   ```
4. 按 Enter，完成！

---

## 測試

1. 在 `dashboard.html` 建立一個測試表單
2. 發佈後，開啟填答連結填寫
3. 提交後，回到你的 Google Sheets
4. 會自動建立一個新的 Sheet（以表單 ID 命名），裡面有剛才的填答資料

---

## 資料格式

每個表單會在 Google Sheets 中建立一個獨立的 Sheet，格式如下：

| submittedAt | 1:姓名 | 2:年齡 | 3:喜歡的顏色 |
|-------------|--------|--------|--------------|
| 2026/5/7 14:30 | 王小明 | 25 | 藍色 |
| 2026/5/7 14:35 | 李小華 | 30 | 紅色、綠色 |

- 第一列是標題列（紫色背景）
- 每一列是一筆填答
- 多選題用「、」分隔

---

## 常見問題

**Q: 填答者需要登入 Google 嗎？**  
A: 不需要。只要你部署時選「存取權：所有人」，任何人都可以直接填寫。

**Q: 如果 Google Sheets 掛了怎麼辦？**  
A: 填答資料會自動備份到填答者的 localStorage，不會遺失。你可以在 `results.html` 看到 localStorage 的資料。

**Q: 可以用多個 Google Sheets 嗎？**  
A: 目前一個 FormBuilder 只能綁定一個 Sheets。如果需要分開，可以部署多個 FormBuilder 實例。

**Q: 如何更新 Google Apps Script？**  
A: 修改 `gas/Code.gs` 後，在 script.google.com 點「部署」→「管理部署」→ 編輯現有部署 → 儲存。URL 不會變。
