<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM reviews ORDER BY created_at DESC");
$reviews = $stmt->fetchAll();

echo json_encode($reviews);