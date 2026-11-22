
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
$items = $data["items"] ?? [];

if ($userId <= 0 || empty($items)) {
    http_response_code(400);
    echo json_encode(["message" => "User and cart items are required"]);
    exit;
}

function generateKey() {
    return strtoupper(bin2hex(random_bytes(2))) . "-" .
           strtoupper(bin2hex(random_bytes(2))) . "-" .
           strtoupper(bin2hex(random_bytes(2)));
}

try {
    $connection->beginTransaction();

    $total = 0;
    $purchasedItems = [];

    foreach ($items as $item) {
        $sql = "
            SELECT TOP 1 o.id, o.price, p.title, s.name AS seller
            FROM dbo.offers o
            INNER JOIN dbo.products p ON o.product_id = p.id
            INNER JOIN dbo.sellers s ON o.seller_id = s.id
            WHERE p.title = :title
              AND s.name = :seller
              AND o.stock > 0
        ";

        $stmt = $connection->prepare($sql);
        $stmt->execute([
            ":title" => $item["title"],
            ":seller" => $item["seller"]
        ]);

        $offer = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$offer) {
            throw new Exception("Product offer not found");
        }

        $total += (float)$offer["price"];

        $purchasedItems[] = [
            "offer_id" => $offer["id"],
            "title" => $offer["title"],
            "seller" => $offer["seller"],
            "price" => $offer["price"],
            "key" => generateKey()
        ];
    }

    $stmt = $connection->prepare("
        INSERT INTO dbo.orders (user_id, total_amount)
        VALUES (:user_id, :total)
    ");

    $stmt->execute([
        ":user_id" => $userId,
        ":total" => $total
    ]);

    $orderId = $connection->lastInsertId();

    foreach ($purchasedItems as $item) {
        $stmt = $connection->prepare("
            INSERT INTO dbo.order_items
            (order_id, offer_id, product_title, seller_name, purchase_price, digital_key)
            VALUES
            (:order_id, :offer_id, :title, :seller, :price, :digital_key)
        ");

        $stmt->execute([
            ":order_id" => $orderId,
            ":offer_id" => $item["offer_id"],
            ":title" => $item["title"],
            ":seller" => $item["seller"],
            ":price" => $item["price"],
            ":digital_key" => $item["key"]
        ]);
    }

    $connection->commit();

    echo json_encode([
        "message" => "Order completed successfully",
        "order_id" => $orderId,
        "items" => $purchasedItems,
        "total" => $total
    ]);

} catch (Throwable $e) {
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }

    http_response_code(400);
    echo json_encode(["message" => $e->getMessage()]);
}
