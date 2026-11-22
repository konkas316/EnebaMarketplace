
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");

require_once __DIR__ . '/../../config/database.php';

try {
    $sql = "
        SELECT TOP 3
            p.id,
            p.title,
            p.slug,
            MIN(o.price) AS price
        FROM dbo.products p
        INNER JOIN dbo.offers o ON p.id = o.product_id
        WHERE o.stock > 0
        GROUP BY p.id, p.title, p.slug
        ORDER BY MIN(o.price) ASC
    ";

    $stmt = $connection->query($sql);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Could not load deals"]);
}
