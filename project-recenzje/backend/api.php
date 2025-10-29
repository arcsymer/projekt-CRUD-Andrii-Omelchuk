<?php
ob_start();
include 'db.php';
header('Content-Type: application/json; charset=utf-8');

$metoda = $_SERVER['REQUEST_METHOD'];
$sciezka = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$id = $sciezka[0] ?? null;

function odpowiedz($dane, $kod = 200) {
    http_response_code($kod);
    echo json_encode($dane, JSON_UNESCAPED_UNICODE);
    exit;
}

function filtruj($val) {
    return htmlspecialchars(trim($val), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

switch ($metoda) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM recenzje WHERE id=?");
            $stmt->execute([$id]);
            $wiersz = $stmt->fetch();
            $wiersz ? odpowiedz($wiersz) : odpowiedz(['error' => 'Nie znaleziono'], 404);
        } else {
            $ostatnie = $pdo->query("SELECT * FROM recenzje ORDER BY id DESC LIMIT 10")->fetchAll();
            $topRestauracje = $pdo->query("SELECT restauracja, COUNT(*) AS liczba FROM recenzje GROUP BY restauracja ORDER BY liczba DESC LIMIT 3")->fetchAll(PDO::FETCH_KEY_PAIR);
            $topDania = $pdo->query("SELECT danie, restauracja, ROUND(AVG(ocena),1) AS ocena FROM recenzje GROUP BY danie, restauracja ORDER BY ocena DESC LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($topDania as &$d) $d['ocena'] = (float)$d['ocena'];
            odpowiedz(['ostatnie' => $ostatnie, 'topRestauracje' => $topRestauracje, 'topDania' => $topDania]);
        }
        break;

    case 'POST':
        $dane = json_decode(file_get_contents('php://input'), true);
        if (!$dane || empty($dane['danie']) || empty($dane['restauracja']) || empty($dane['adres']) || empty($dane['data']) || empty($dane['ocena']) || empty($dane['rekomendacja'])) {
            odpowiedz(['error' => 'Niepoprawne dane'], 400);
        }
        $stmt = $pdo->prepare("INSERT INTO recenzje (danie, restauracja, adres, data, ocena, rekomendacja, spożycie, komentarz) VALUES (?,?,?,?,?,?,?,?)");
        $stmt->execute([filtruj($dane['danie']), filtruj($dane['restauracja']), filtruj($dane['adres']), $dane['data'], $dane['ocena'], filtruj($dane['rekomendacja']), $dane['spożycie'] ? filtruj($dane['spożycie']) : null, $dane['komentarz'] ? filtruj($dane['komentarz']) : null]);
        odpowiedz(['status' => 'ok', 'id' => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) odpowiedz(['error' => 'ID wymagane'], 400);
        $dane = json_decode(file_get_contents('php://input'), true);
        if (!$dane || empty($dane['danie']) || empty($dane['restauracja']) || empty($dane['adres']) || empty($dane['data']) || empty($dane['ocena']) || empty($dane['rekomendacja'])) {
            odpowiedz(['error' => 'Niepoprawne dane'], 400);
        }
        $stmt = $pdo->prepare("UPDATE recenzje SET danie=?, restauracja=?, adres=?, data=?, ocena=?, rekomendacja=?, spożycie=?, komentarz=? WHERE id=?");
        $stmt->execute([filtruj($dane['danie']), filtruj($dane['restauracja']), filtruj($dane['adres']), $dane['data'], $dane['ocena'], filtruj($dane['rekomendacja']), $dane['spożycie'] ? filtruj($dane['spożycie']) : null, $dane['komentarz'] ? filtruj($dane['komentarz']) : null, $id]);
        odpowiedz(['status' => 'ok']);
        break;

    case 'DELETE':
        if (!$id) odpowiedz(['error' => 'ID wymagane'], 400);
        $stmt = $pdo->prepare("DELETE FROM recenzje WHERE id=?");
        $stmt->execute([$id]);
        odpowiedz(['status' => 'ok']);
        break;

    default:
        odpowiedz(['error' => 'Metoda nieobsługiwana'], 405);
}
