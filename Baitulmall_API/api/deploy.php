<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'simple-ok',
    'timestamp' => time(),
    'message' => 'New deploy v3 (simple)'
]);
