
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");

require_once __DIR__ . '/../../config/database.php';

try {
    $sql = "
        SELECT
            p.id,
            p.title,
            p.slug,
            p.description,
            p.platform,
            p.genre,
            p.image_url,
            o.id AS offer_id,
            s.name AS seller,
            o.price,
            o.region,
            o.stock
        FROM dbo.products p
        LEFT JOIN dbo.offers o ON p.id = o.product_id
        LEFT JOIN dbo.sellers s ON o.seller_id = s.id
        ORDER BY p.id, o.price
    ";

    $stmt = $connection->query($sql);

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "error" => $e->getMessage()
    ]);
}
