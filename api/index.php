<?php
require_once __DIR__ . '/../DB.php';
require_once __DIR__ . '/forms/FormController.php';

header('Content-Type: application/json; charset=utf-8');

// 允許跨域（開發用）
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$method = $_SERVER['REQUEST_METHOD'];
// PATH_INFO: /forms/save 或 /forms/1
$path   = trim($_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
// 去掉前綴 api/index.php
$path   = preg_replace('#^api/index\.php/?#', '', $path);
$parts  = explode('/', $path);

$resource = $parts[0] ?? '';
$action   = $parts[1] ?? '';
$id       = is_numeric($action) ? (int)$action : null;

$ctrl = new FormController();

try {
    match (true) {
        $method === 'POST'   && $resource === 'forms' && $action === 'save' => $ctrl->save(),
        $method === 'GET'    && $resource === 'forms' && $id === null        => $ctrl->index(),
        $method === 'GET'    && $resource === 'forms' && $id !== null        => $ctrl->show($id),
        $method === 'DELETE' && $resource === 'forms' && $id !== null        => $ctrl->delete($id),
        default => (function(){ http_response_code(404); echo json_encode(['error'=>'Not found']); })(),
    };
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
