<?php
require 'db.php';

$id = $_GET['id'] ?? 0;
$stmt = $pdo->prepare("DELETE FROM reviews WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(["success" => true]);
