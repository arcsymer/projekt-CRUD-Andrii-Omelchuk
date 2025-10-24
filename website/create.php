<?php
include 'db.php';
$data=json_decode(file_get_contents('php://input'),true);
$danie=trim($data['danie']??'');
$restauracja=trim($data['restauracja']??'');
$adres=trim($data['adres']??'');
$dataWizyty=$data['data']??'';
$ocena=(int)($data['ocena']??0);
$komentarz=trim($data['komentarz']??'');
if($danie===''||$restauracja===''||$adres===''||!$dataWizyty||$ocena<1||$ocena>10){echo json_encode(['status'=>'error']);exit;}
$stmt=$pdo->prepare("INSERT INTO recenzje(danie,restauracja,adres,data,ocena,komentarz) VALUES(?,?,?,?,?,?)");
$stmt->execute([$danie,$restauracja,$adres,$dataWizyty,$ocena,$komentarz]);
echo json_encode(['status'=>'ok']);
?>
