
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

try {
    $sql = "SELECT id, username, email, password_hash FROM dbo.users WHERE email = :email";

    $stmt = $connection->prepare($sql);
    $stmt->execute([":email" => $email]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user["password_hash"])) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid email or password"]);
        exit;
    }

    echo json_encode([
        "message" => "Login successful",
        "user" => [
            "id" => $user["id"],
            "username" => $user["username"],
            "email" => $user["email"]
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Login failed"]);
}
