<?php
include 'db.php';
$stmt=$pdo->query("SELECT * FROM recenzje ORDER BY id DESC");
$recenzje=$stmt->fetchAll(PDO::FETCH_ASSOC)?:[];

$restauracjeMap=[];
foreach($recenzje as $r) $restauracjeMap[$r['restauracja']]=($restauracjeMap[$r['restauracja']]??0)+1;
arsort($restauracjeMap);
$topRestauracje=array_slice($restauracjeMap,0,3,true);

$daniaMap=[];
foreach($recenzje as $r){
    $key=$r['danie'].'|'.$r['restauracja'];
    if(!isset($daniaMap[$key])) $daniaMap[$key]=['suma'=>0,'ilosc'=>0,'danie'=>$r['danie'],'restauracja'=>$r['restauracja']];
    $daniaMap[$key]['suma']+=(int)$r['ocena'];
    $daniaMap[$key]['ilosc']+=1;
}
$topDania=[];
foreach($daniaMap as $d) $topDania[]=['danie'=>$d['danie'],'restauracja'=>$d['restauracja'],'ocena'=>$d['suma']/$d['ilosc']];
usort($topDania, fn($a,$b)=>$b['ocena']<=>$a['ocena']);
$topDania=array_slice($topDania,0,3);

function escape($str){return htmlspecialchars($str,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
foreach($recenzje as &$r){
    $r['danie']=escape($r['danie']);
    $r['restauracja']=escape($r['restauracja']);
    $r['adres']=escape($r['adres']);
    $r['komentarz']=escape($r['komentarz']);
}

echo json_encode([
    'ostatnie'=>$recenzje,
    'topRestauracje'=>$topRestauracje,
    'topDania'=>$topDania
]);
?>
