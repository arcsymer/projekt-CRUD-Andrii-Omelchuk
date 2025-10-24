<?php
include 'db.php';
header('Content-Type: application/json');

$metoda = $_SERVER['REQUEST_METHOD'];
$sciezka = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$id = $sciezka[0] ?? null;

function odpowiedz($dane, $kod = 200) {
    http_response_code($kod);
    echo json_encode($dane);
    exit;
}

switch($metoda) {
    case 'GET':
        if($id) {
            $stmt = $pdo->prepare("SELECT * FROM recenzje WHERE id=?");
            $stmt->execute([$id]);
            $wiersz = $stmt->fetch();
            $wiersz ? odpowiedz($wiersz) : odpowiedz(['error'=>'Nie znaleziono'], 404);
        } else {
            $ostatnie = $pdo->query("SELECT * FROM recenzje ORDER BY id DESC LIMIT 10")->fetchAll();
            $topRestauracje = $pdo->query("SELECT restauracja, COUNT(*) AS liczba FROM recenzje GROUP BY restauracja ORDER BY liczba DESC LIMIT 3")->fetchAll(PDO::FETCH_KEY_PAIR);
            $topDania = $pdo->query("SELECT danie, restauracja, ROUND(AVG(ocena),1) AS ocena FROM recenzje GROUP BY danie, restauracja ORDER BY ocena DESC LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);

            $topDania = array_map(function($d){
                $d['ocena'] = (float)$d['ocena'];
                return $d;
            }, $topDania);

            odpowiedz([
                'ostatnie' => $ostatnie,
                'topRestauracje' => $topRestauracje,
                'topDania' => $topDania
            ]);
        }
        break;

    case 'POST':
        $dane = json_decode(file_get_contents('php://input'), true);
        if (!$dane || empty($dane['danie']) || empty($dane['restauracja']) || empty($dane['adres']) || empty($dane['data']) || empty($dane['ocena'])) {
            odpowiedz(['error'=>'Niepoprawne dane'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO recenzje (danie, restauracja, adres, data, ocena, komentarz) VALUES (?,?,?,?,?,?)");
        $stmt->execute([$dane['danie'], $dane['restauracja'], $dane['adres'], $dane['data'], $dane['ocena'], $dane['komentarz'] ?? null]);
        odpowiedz(['status'=>'ok','id'=>$pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if(!$id) odpowiedz(['error'=>'ID wymagane'], 400);
        $dane = json_decode(file_get_contents('php://input'), true);
        if (!$dane || empty($dane['danie']) || empty($dane['restauracja']) || empty($dane['adres']) || empty($dane['data']) || empty($dane['ocena'])) {
            odpowiedz(['error'=>'Niepoprawne dane'], 400);
        }

        $stmt = $pdo->prepare("UPDATE recenzje SET danie=?, restauracja=?, adres=?, data=?, ocena=?, komentarz=? WHERE id=?");
        $stmt->execute([$dane['danie'], $dane['restauracja'], $dane['adres'], $dane['data'], $dane['ocena'], $dane['komentarz'], $id]);
        odpowiedz(['status'=>'ok']);
        break;

    case 'DELETE':
        if(!$id) odpowiedz(['error'=>'ID wymagane'], 400);
        $stmt = $pdo->prepare("DELETE FROM recenzje WHERE id=?");
        $stmt->execute([$id]);
        odpowiedz(['status'=>'ok']);
        break;

    default:
        odpowiedz(['error'=>'Metoda nieobsługiwana'], 405);
}
?>
