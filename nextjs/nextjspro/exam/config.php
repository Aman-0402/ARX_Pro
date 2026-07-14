<?php
session_start();
$host='localhost'; $db='yibnyzre_arx'; $user='yibnyzre_arx'; $pass='As792002@';
$conn = new mysqli($host,$user,$pass,$db);
if($conn->connect_error){ die('DB Error: '.$conn->connect_error); }
$conn->set_charset('utf8mb4');
?>