<?php
$code = isset($_GET['code']) ? (int)$_GET['code'] : 200;

$messages = [
    200 => ['Sukces', 'Twoja operacja została wykonana poprawnie.', '#0f0'],
    400 => ['Błąd 400', 'Nieprawidłowe żądanie lub brak danych.', '#ffcc00'],
    404 => ['Błąd 404', 'Strona nie została znaleziona.', '#f44'],
    500 => ['Błąd 500', 'Błąd serwera.', '#f00']
];

$title = $messages[$code][0] ?? 'Informacja';
$msg = $messages[$code][1] ?? '';
$color = $messages[$code][2] ?? '#fff';

http_response_code($code);
?>
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title><?php echo htmlspecialchars($title) ?></title>
<link rel="stylesheet" href="../frontend/style.css">
<style>
body {
    text-align: center;
    font-family: Arial, sans-serif;
    background: #111;
    color: <?php echo $color ?>;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}
.container { text-align: center; }
h1 { font-size: 3rem; }
a {
    color: <?php echo $color ?>;
    text-decoration: none;
    border: 1px solid <?php echo $color ?>;
    padding: 8px 16px;
    border-radius: 6px;
    display: inline-block;
    margin-top: 15px;
}
a:hover {
    background: <?php echo $color ?>;
    color: #111;
}
</style>
</head>
<body>
<div class="container">
<h1><?php echo htmlspecialchars($title) ?></h1>
<p><?php echo htmlspecialchars($msg) ?></p>
<a href="../frontend/index.html">Powrót do strony głównej</a>
</div>
</body>
</html>
