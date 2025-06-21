<?php
header('Content-Type: application/json');

// إعدادات الاتصال بقاعدة البيانات
$host = 'localhost';
$dbname = 'haider';
$username = 'root';
$password = ''; // اتركه فارغًا إذا كنت تستخدم XAMPP بدون كلمة مرور

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // تنفيذ الاستعلام
    $stmt = $pdo->query("SELECT * FROM food ORDER BY id DESC");
    $foods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($foods);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
