<?php
$host='fdb1034.awardspace.net';
$db='4698990_recenzjedanrestauracji';
$user='4698990_recenzjedanrestauracji';
$pass='Vistula67349AndriiOmelchuk';
$charset='utf8mb4';

$dsn="mysql:host=$host;dbname=$db;charset=$charset";
$options=[
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch(Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    die(json_encode(['error'=>'Błąd połączenia z bazą danych']));
}
