
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once __DIR__ . '/../../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["message" => "Email and password are required"]);
    exit;
}

$username = explode("@", $email)[0];
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {
    $sql = "
        INSERT INTO dbo.users (username, email, password_hash)
        VALUES (:username, :email, :password_hash)
    ";

    $stmt = $connection->prepare($sql);

    $stmt->execute([
        ":username" => $username,
        ":email" => $email,
        ":password_hash" => $passwordHash
    ]);

    echo json_encode(["message" => "Account created successfully"]);

} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(["message" => "This email may already registered"]);
}
