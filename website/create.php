<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("INSERT INTO reviews (restaurant, address, visit_date, dish, rating, comment) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $data['restaurant'],
    $data['address'],
    $data['visit_date'],
    $data['dish'],
    $data['rating'],
    $data['comment']
]);

echo json_encode(["success" => true]);
?>
