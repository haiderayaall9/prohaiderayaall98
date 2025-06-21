<?php
$servername = "localhost";
$username = "root";     // اسم المستخدم الافتراضي لـ XAMPP
$password = "";         // بدون كلمة مرور في العادة
$dbname = "haider";

// إنشاء الاتصال
$conn = new mysqli($servername, $username, $password, $dbname);

// التحقق من الاتصال
if ($conn->connect_error) {
    die("فشل الاتصال: " . $conn->connect_error);
}

// الحصول على الاسم من النموذج
$full_name = $_POST['full_name'];

// تنفيذ عملية الإدخال
$sql = "INSERT INTO name (full_name) VALUES ('$full_name')";

if ($conn->query($sql) === TRUE) {
    echo "تم إدخال الاسم بنجاح";
} else {
    echo "خطأ: " . $sql . "<br>" . $conn->error;
}

$conn->close();


?>
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <title>إدخال الاسم</title>
  <style>
    body {
      font-family: 'Tajawal', sans-serif;
      direction: rtl;
      padding: 50px;
      background-color: #f0f0f0;
      text-align: center;
    }
    input[type="text"] {
      padding: 10px;
      width: 250px;
      margin-bottom: 20px;
      border-radius: 5px;
      border: 1px solid #ccc;
    }
    button {
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>

  <h2>أدخل اسمك</h2>
  <form action="insert.php" method="POST">
    <input type="text" name="full_name" placeholder="اكتب اسمك هنا" required><br>
    <button type="submit">إرسال</button>
  </form>

</body>
</html>

