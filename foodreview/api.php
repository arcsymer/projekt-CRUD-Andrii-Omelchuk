<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("fdb1034.awardspace.net", "4698990_foodreview", "Vistula67349AndriiOmelchuk", "4698990_foodreview");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["error" => "Błąd połączenia z bazą danych: ".$conn->connect_error]));
}

$action = $_GET['action'] ?? '';

switch ($action) {

    case 'login':
        $data = json_decode(file_get_contents("php://input"), true);
        $user = $conn->real_escape_string($data['nazwa_uzytkownika']);
        $pass = $data['haslo'];

        $res = $conn->query("SELECT * FROM users WHERE nazwa_uzytkownika='$user'");
        if ($res->num_rows) {
            $row = $res->fetch_assoc();
            if (password_verify($pass, $row['haslo'])) {
                $_SESSION['user_id'] = $row['id'];
                echo json_encode(["success" => true]);
            } else echo json_encode(["success" => false, "msg"=>"Nieprawidłowe hasło"]);
        } else echo json_encode(["success"=>false,"msg"=>"Nie znaleziono użytkownika"]);
        break;

    case 'register':
        $data = json_decode(file_get_contents("php://input"), true);
        $user = $conn->real_escape_string($data['nazwa_uzytkownika']);
        $pass = password_hash($data['haslo'], PASSWORD_BCRYPT);

        $res = $conn->query("INSERT INTO users (nazwa_uzytkownika, haslo) VALUES ('$user','$pass')");
        if ($res) echo json_encode(["success"=>true]);
        else echo json_encode(["success"=>false,"msg"=>"Użytkownik już istnieje"]);
        break;

    case 'addReview':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(["success"=>false,"msg"=>"Nie zalogowany"]);
            exit;
        }
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("INSERT INTO reviews 
            (user_id, nazwa_dania, nazwa_restauracji, adres_restauracji, data_wizyty, ocena, rekomendacja, z_czym_spozywac, komentarz) 
            VALUES (?,?,?,?,?,?,?,?,?)");

        if (!$stmt) {
            echo json_encode(["success"=>false,"msg"=>"Błąd przygotowania zapytania: ".$conn->error]);
            exit;
        }

        $stmt->bind_param(
            "issssisss",
            $_SESSION['user_id'],
            $data['nazwa_dania'],
            $data['nazwa_restauracji'],
            $data['adres_restauracji'],
            $data['data_wizyty'],
            $data['ocena'],
            $data['rekomendacja'],
            $data['z_czym_spozywac'],
            $data['komentarz']
        );

        if ($stmt->execute()) {
            echo json_encode(["success"=>true]);
        } else {
            echo json_encode(["success"=>false,"msg"=>"Błąd dodawania recenzji: ".$stmt->error]);
        }
        $stmt->close();
        break;

    case 'topRestaurants':
        $limit = intval($_GET['limit'] ?? 10);
        $res = $conn->query("SELECT nazwa_restauracji, COUNT(*) as visits FROM reviews GROUP BY nazwa_restauracji ORDER BY visits DESC LIMIT $limit");
        $data = [];
        while($row=$res->fetch_assoc()) $data[]=$row;
        echo json_encode($data);
        break;

    case 'topDishes':
        $limit = intval($_GET['limit'] ?? 10);
        $res = $conn->query("SELECT nazwa_dania, ROUND(AVG(ocena),2) as avg_ocena FROM reviews GROUP BY nazwa_dania ORDER BY avg_ocena DESC LIMIT $limit");
        $data = [];
        while($row=$res->fetch_assoc()) $data[]=$row;
        echo json_encode($data);
        break;

    case 'latestReviews':
        $res = $conn->query("SELECT r.*, u.nazwa_uzytkownika FROM reviews r JOIN users u ON r.user_id=u.id ORDER BY r.created_at DESC LIMIT 10");
        $data = [];
        while($row=$res->fetch_assoc()) $data[]=$row;
        echo json_encode($data);
        break;

    case 'search':
        $q = $conn->real_escape_string($_GET['q'] ?? '');
        $res = $conn->query("SELECT * FROM reviews WHERE nazwa_dania LIKE '%$q%' OR nazwa_restauracji LIKE '%$q%' ORDER BY created_at DESC");
        $data = [];
        while($row=$res->fetch_assoc()) $data[]=$row;
        echo json_encode($data);
        break;

    case 'profile':
        if (!isset($_SESSION['user_id'])) { echo json_encode(["success"=>false]); exit; }
        $uid = $_SESSION['user_id'];
        $res = $conn->query("SELECT nazwa_uzytkownika, created_at FROM users WHERE id=$uid");
        $user = $res->fetch_assoc();
        $res2 = $conn->query("SELECT COUNT(*) as count, ROUND(AVG(ocena),2) as avg FROM reviews WHERE user_id=$uid");
        $stats = $res2->fetch_assoc();
        echo json_encode(array_merge($user,$stats));
        break;

    case 'userReviews':
        if (!isset($_SESSION['user_id'])) { echo json_encode([]); exit; }
        $uid = $_SESSION['user_id'];
        $res = $conn->query("SELECT * FROM reviews WHERE user_id=$uid ORDER BY created_at DESC LIMIT 10");
        $data = [];
        while($row=$res->fetch_assoc()) $data[]=$row;
        echo json_encode($data);
        break;

    case 'updateProfile':
        if (!isset($_SESSION['user_id'])) { echo json_encode(["success"=>false]); exit; }
        $data = json_decode(file_get_contents("php://input"), true);
        $uid = $_SESSION['user_id'];
        $user = $conn->real_escape_string($data['nazwa_uzytkownika']);
        $pass = $data['haslo'] ? password_hash($data['haslo'], PASSWORD_BCRYPT) : null;
        if ($pass) $res = $conn->query("UPDATE users SET nazwa_uzytkownika='$user', haslo='$pass' WHERE id=$uid");
        else $res = $conn->query("UPDATE users SET nazwa_uzytkownika='$user' WHERE id=$uid");
        if ($res) echo json_encode(["success"=>true]);
        else echo json_encode(["success"=>false,"msg"=>"Błąd aktualizacji"]);
        break;

    case 'logout':
        session_destroy();
        echo json_encode(["success"=>true]);
        break;

    default:
        echo json_encode(["error"=>"Nieznana akcja"]);
}

$conn->close();
?>
