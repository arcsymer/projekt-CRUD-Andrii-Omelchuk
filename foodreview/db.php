<?php
$servername = "fdb1034.awardspace.net";
$username = "4698990_foodreview";
$password = "Vistula67349AndriiOmelchuk";
$database = "4698990_foodreview";

$conn = new mysqli($servername, $username, $password, $database);
$conn->set_charset("utf8mb4");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Błąd połączenia z bazą danych"]);
    exit;
}
session_start();
?>
