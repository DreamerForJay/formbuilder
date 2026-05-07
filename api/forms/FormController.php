<?php
class FormController {

    // POST /forms/save
    public function save(): void {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body || empty($body['title'])) {
            $this->json(['message' => '缺少必要欄位'], 400);
            return;
        }

        $db = DB::get();
        $db->beginTransaction();
        try {
            $formId = isset($body['id']) && $body['id'] ? (int)$body['id'] : null;

            if ($formId) {
                $db->prepare('UPDATE forms SET title=?,description=?,status=?,updated_at=NOW() WHERE id=?')
                   ->execute([$body['title'], $body['description'] ?? null, $body['status'] ?? 'draft', $formId]);
            } else {
                $db->prepare('INSERT INTO forms (user_id,title,description,status) VALUES (?,?,?,?)')
                   ->execute([1, $body['title'], $body['description'] ?? null, $body['status'] ?? 'draft']);
                $formId = (int)$db->lastInsertId();
            }

            // 重建題目
            $db->prepare('DELETE FROM form_questions WHERE form_id=?')->execute([$formId]);
            $stmt = $db->prepare(
                'INSERT INTO form_questions (form_id,sort_order,type,title,is_required,options) VALUES (?,?,?,?,?,?)'
            );
            foreach (($body['questions'] ?? []) as $q) {
                $stmt->execute([
                    $formId,
                    (int)($q['sort_order'] ?? 0),
                    $q['type'],
                    $q['title'] ?? '',
                    (int)($q['is_required'] ?? 0),
                    isset($q['options']) ? json_encode($q['options'], JSON_UNESCAPED_UNICODE) : null,
                ]);
            }

            $db->commit();
            $this->json(['form_id' => $formId]);
        } catch (Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    // GET /forms — 列表
    public function index(): void {
        $db     = DB::get();
        $search = $_GET['q'] ?? '';
        $status = $_GET['status'] ?? '';
        $sql    = 'SELECT f.id,f.title,f.status,f.created_at,COUNT(r.id) AS response_count
                   FROM forms f LEFT JOIN responses r ON r.form_id=f.id WHERE 1=1';
        $params = [];
        if ($search) { $sql .= ' AND f.title LIKE ?'; $params[] = "%$search%"; }
        if ($status) { $sql .= ' AND f.status=?';     $params[] = $status; }
        $sql .= ' GROUP BY f.id ORDER BY f.created_at DESC';
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $this->json($stmt->fetchAll());
    }

    // GET /forms/{id}
    public function show(int $id): void {
        $db   = DB::get();
        $stmt = $db->prepare('SELECT * FROM forms WHERE id=?');
        $stmt->execute([$id]);
        $form = $stmt->fetch();
        if (!$form) { $this->json(['message' => '找不到表單'], 404); return; }

        $qs = $db->prepare('SELECT * FROM form_questions WHERE form_id=? ORDER BY sort_order');
        $qs->execute([$id]);
        $form['questions'] = array_map(function($q) {
            $q['options'] = $q['options'] ? json_decode($q['options'], true) : null;
            return $q;
        }, $qs->fetchAll());

        $this->json($form);
    }

    // DELETE /forms/{id}
    public function delete(int $id): void {
        $stmt = DB::get()->prepare('DELETE FROM forms WHERE id=?');
        $stmt->execute([$id]);
        $this->json(['deleted' => $stmt->rowCount() > 0]);
    }

    private function json(mixed $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
