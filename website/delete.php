<?php
include 'db.php';
$data=json_decode(file_get_contents('php://input'),true);
$id=(int)($data['id']??0);
if($id<=0){echo json_encode(['status'=>'error']);exit;}
$stmt=$pdo->prepare("DELETE FROM recenzje WHERE id=?");
$stmt->execute([$id]);
echo json_encode(['status'=>'ok']);
?>
