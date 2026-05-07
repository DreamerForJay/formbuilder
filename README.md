# FormBuilder — 快速啟動指南

## 方法一：純前端預覽（無需 PHP/MySQL，30 秒啟動）

只想看 UI 效果，直接用瀏覽器開啟：

```
formbuilder/index.html
```

> 儲存按鈕會顯示錯誤（因為沒有後端），但表單編輯器的所有 UI 功能都可正常操作。

---

## 方法二：完整啟動（PHP + MySQL）

### 1. 建立資料庫

```bash
mysql -u root -p -e "CREATE DATABASE formbuilder;"
mysql -u root -p formbuilder < schema.sql
```

### 2. 設定資料庫連線（環境變數）

```bash
export DB_HOST=localhost
export DB_NAME=formbuilder
export DB_USER=root
export DB_PASS=你的密碼
```

或直接修改 `DB.php` 中的預設值。

### 3. 啟動 PHP 內建伺服器

```bash
cd formbuilder
php -S localhost:8080
```

### 4. 開啟瀏覽器

```
http://localhost:8080
```

---

## 目錄結構

```
formbuilder/
├── index.html              # 表單編輯器（前端主頁）
├── DB.php                  # PDO 資料庫連線
├── schema.sql              # 資料庫建表語法
├── api/
│   ├── index.php           # API 路由分發
│   └── forms/
│       └── FormController.php  # 表單 CRUD 邏輯
└── README.md
```

## API 端點

| 方法   | 路徑                  | 說明         |
|--------|----------------------|--------------|
| GET    | /api/index.php/forms | 取得表單列表 |
| GET    | /api/index.php/forms/{id} | 取得單一表單 |
| POST   | /api/index.php/forms/save | 新建/更新表單 |
| DELETE | /api/index.php/forms/{id} | 刪除表單 |
