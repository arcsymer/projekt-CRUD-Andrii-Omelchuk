<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$servername="fdb1034.awardspace.net";
$username="4698990_foodreview";
$password="Vistula67349AndriiOmelchuk";
$database="4698990_foodreview";

$conn=new mysqli($servername,$username,$password,$database);
$conn->set_charset("utf8mb4");
?>
