<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("UPDATE reviews SET restaurant = ?, address = ?, visit_date = ?, dish = ?, rating = ?, comment = ?
    WHERE id = ?");
$stmt->execute([
    $data['restaurant'],
    $data['address'],
    $data['visit_date'],
    $data['dish'],
    $data['rating'],
    $data['comment'],
    $data['id']
]);

echo json_encode(["success" => true]);
