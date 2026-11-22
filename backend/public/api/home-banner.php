
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");

echo json_encode([
    "title" => "Discover Your Next Game",
    "subtitle" => "Great games at great prices.",
    "button" => "Explore Store"
]);
