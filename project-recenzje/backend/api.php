<?php
include 'db.php';
header('Content-Type: application/json');

$metoda = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$id = $request[0] ?? null;

function odpowiedz($dane, $kod = 200) {
    http_response_code($kod);
    echo json_encode($dane);
    exit;
}

switch ($metoda) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM recenzje WHERE id=?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            $row ? odpowiedz($row) : odpowiedz(['error' => 'Nie znaleziono'], 404);
        } else {
            $stmt = $pdo->query("SELECT * FROM recenzje ORDER BY id DESC");
            $all = $stmt->fetchAll();

            $ostatnie = array_slice($all, 0, 10);

            $topRestauracje = [];
            foreach ($all as $r) {
                $topRestauracje[$r['restauracja']] = ($topRestauracje[$r['restauracja']] ?? 0) + 1;
            }
            arsort($topRestauracje);
            $topRestauracje = array_slice($topRestauracje, 0, 3, true);

            $dania = [];
            foreach ($all as $r) {
                $key = $r['danie'] . '||' . $r['restauracja'];
                if (!isset($dania[$key])) {
                    $dania[$key] = ['suma' => 0, 'ilosc' => 0, 'danie' => $r['danie'], 'restauracja' => $r['restauracja']];
                }
                $dania[$key]['suma'] += $r['ocena'];
                $dania[$key]['ilosc'] += 1;
            }

            $topDania = [];
            foreach ($dania as $d) {
                $srednia = $d['suma'] / $d['ilosc'];
                $topDania[] = ['danie' => $d['danie'], 'restauracja' => $d['restauracja'], 'ocena' => $srednia];
            }
            usort($topDania, fn($a, $b) => $b['ocena'] <=> $a['ocena']);
            $topDania = array_slice($topDania, 0, 3);

            odpowiedz(['ostatnie' => $ostatnie, 'topRestauracje' => $topRestauracje, 'topDania' => $topDania]);
        }
        break;

    case 'POST':
        $dane = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO recenzje (danie, restauracja, adres, data, ocena, komentarz) VALUES (?,?,?,?,?,?)");
        $stmt->execute([$dane['danie'],$dane['restauracja'],$dane['adres'],$dane['data'],$dane['ocena'],$dane['komentarz']]);
        odpowiedz(['status'=>'ok','id'=>$pdo->lastInsertId()],201);
        break;

    case 'PUT':
        if(!$id) odpowiedz(['error'=>'ID wymagane'],400);
        $dane = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE recenzje SET danie=?, restauracja=?, adres=?, data=?, ocena=?, komentarz=? WHERE id=?");
        $stmt->execute([$dane['danie'],$dane['restauracja'],$dane['adres'],$dane['data'],$dane['ocena'],$dane['komentarz'],$id]);
        odpowiedz(['status'=>'ok']);
        break;

    case 'DELETE':
        if(!$id) odpowiedz(['error'=>'ID wymagane'],400);
        $stmt = $pdo->prepare("DELETE FROM recenzje WHERE id=?");
        $stmt->execute([$id]);
        odpowiedz(['status'=>'ok']);
        break;

    default:
        odpowiedz(['error'=>'Metoda nie obsługiwana'],405);
}
?>
