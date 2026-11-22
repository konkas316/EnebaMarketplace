
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
$userId = (int)($data["user_id"] ?? 0);

if ($userId <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Valid user ID is required"]);
    exit;
}

try {
    $sql = "
        SELECT
            o.id AS order_id,
            o.created_at,
            o.total_amount,
            o.status,
            oi.product_title,
            oi.seller_name,
            oi.purchase_price,
            oi.digital_key
        FROM dbo.orders o
        INNER JOIN dbo.order_items oi
            ON o.id = oi.order_id
        WHERE o.user_id = :user_id
        ORDER BY o.created_at DESC, o.id DESC
    ";

    $stmt = $connection->prepare($sql);
    $stmt->execute([":user_id" => $userId]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $orders = [];

    foreach ($rows as $row) {
        $orderId = $row["order_id"];

        if (!isset($orders[$orderId])) {
            $orders[$orderId] = [
                "id" => (int)$orderId,
                "created_at" => $row["created_at"],
                "total" => (float)$row["total_amount"],
                "status" => $row["status"],
                "items" => []
            ];
        }

        $orders[$orderId]["items"][] = [
            "title" => $row["product_title"],
            "seller" => $row["seller_name"],
            "price" => (float)$row["purchase_price"],
            "key" => $row["digital_key"]
        ];
    }

    echo json_encode([
        "orders" => array_values($orders)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Could not load order history"
    ]);
}
