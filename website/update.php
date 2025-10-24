<?php
include 'db.php';
$data=json_decode(file_get_contents('php://input'),true);
$id=(int)($data['id']??0);
$danie=trim($data['danie']??'');
$restauracja=trim($data['restauracja']??'');
$adres=trim($data['adres']??'');
$dataWizyty=$data['data']??'';
$ocena=(int)($data['ocena']??0);
$komentarz=trim($data['komentarz']??'');
if($id<=0||$danie===''||$restauracja===''||$adres===''||!$dataWizyty||$ocena<1||$ocena>10){echo json_encode(['status'=>'error']);exit;}
$stmt=$pdo->prepare("UPDATE recenzje SET danie=?,restauracja=?,adres=?,data=?,ocena=?,komentarz=? WHERE id=?");
$stmt->execute([$danie,$restauracja,$adres,$dataWizyty,$ocena,$komentarz,$id]);
echo json_encode(['status'=>'ok']);
?>
