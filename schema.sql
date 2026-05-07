-- FormBuilder 資料庫建表語法
-- 執行方式：mysql -u root -p formbuilder < schema.sql

CREATE DATABASE IF NOT EXISTS formbuilder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE formbuilder;

CREATE TABLE IF NOT EXISTS users (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 預設測試帳號（password: test1234）
INSERT IGNORE INTO users (id, name, email, password)
VALUES (1, '測試使用者', 'test@example.com', '$2y$10$abcdefghijklmnopqrstuuVGZzQkD6y5oIqKX1234567890abcde');

CREATE TABLE IF NOT EXISTS forms (
    id                       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                  INT UNSIGNED NOT NULL DEFAULT 1,
    title                    VARCHAR(255) NOT NULL DEFAULT '未命名表單',
    description              TEXT,
    status                   ENUM('draft','published') DEFAULT 'draft',
    access                   ENUM('public','login_required') DEFAULT 'public',
    allow_multiple_responses TINYINT(1) DEFAULT 1,
    starts_at                DATETIME NULL,
    ends_at                  DATETIME NULL,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS form_questions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_id     INT UNSIGNED NOT NULL,
    sort_order  SMALLINT UNSIGNED DEFAULT 0,
    type        ENUM('short_text','paragraph','dropdown','radio','checkbox','date') NOT NULL,
    title       VARCHAR(500) NOT NULL,
    is_required TINYINT(1) DEFAULT 0,
    options     JSON NULL COMMENT '選擇題選項，例：["選項A","選項B"]',
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS responses (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_id        INT UNSIGNED NOT NULL,
    respondent_id  INT UNSIGNED NULL,
    respondent_ip  VARCHAR(45),
    submitted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    FOREIGN KEY (respondent_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS response_answers (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    response_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    answer      JSON NOT NULL COMMENT '統一 JSON 儲存，文字：["答案"]，多選：["A","B"]',
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_form ON form_questions(form_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_responses_form ON responses(form_id);
CREATE INDEX IF NOT EXISTS idx_answers_response ON response_answers(response_id);
