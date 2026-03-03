<?php
header('Content-Type: application/json; charset=utf-8');

$data = [
    "marquees" => [
        "Abdeldim",
        "Dahhany",
        "Bienvenue"
    ],
    "sectionMeteoEnabled" => "1",
    "sectionPrayerEnabled" => "1",
    "fajr" => "7:02",
    "dhuhr" => "13:44",
    "asr" => "16:24",
    "maghrib" => "18:47",
    "isha" => "20:06",
    "temperature" => "10",
    "humidite" => "40",
    "vent" => "10",
    "weatherIconUrl" => "1",
    "internet" => "1",
    "images" => [
        "images/1.jpg",
        "images/2.jpg",
        "images/3.jpg",
        "images/4.jpg"
    ],
    "heure" => "1"
];

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); 

?>