<?php
header('Content-Type: application/json; charset=utf-8');

$data = [
    "green" => ["100"],
    "red" => ["2"]
];

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); 

?>