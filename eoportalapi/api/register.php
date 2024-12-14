<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json');

// Handle OPTIONS request for CORS pre-flight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    exit;
}

include_once("database.php");

$postdata = file_get_contents("php://input");

if (isset($postdata) && !empty($postdata)) {
    $request = json_decode($postdata);

    // Check if JSON is valid
    if ($request === null) {
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    // Sanitize inputs
    $fullname = trim($request->fullname);
    $pwd = trim($request->password);
    $email = trim($request->email);
    $birthday = trim($request->birthday);
    $department = trim($request->department);

    // Check if email already exists
    try {
        // Prepare the SQL query to check if email exists
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        // If email already exists, return error
        if ($stmt->rowCount() > 0) {
            echo json_encode(['error' => 'Email already exists']);
            exit;
        }

        // Hash the password before storing it
        $hashedPwd = password_hash($pwd, PASSWORD_DEFAULT);

        // Prepare the SQL query for inserting the new user
        $sql = "INSERT INTO users (fullname, password, email, birthday, department) VALUES (:fullname, :password, :email, :birthday, :department)";
        
        // Prepare the statement
        $stmt = $pdo->prepare($sql);
        
        // Bind parameters
        $stmt->bindParam(':fullname', $fullname);
        $stmt->bindParam(':password', $hashedPwd);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':birthday', $birthday);
        $stmt->bindParam(':department', $department);

        // Execute the query
        if ($stmt->execute()) {
            // Return success with the inserted user's data
            $authdata = [
                'fullname' => $fullname,
                'password' => '',  // Do not send the password back to the client
                'email' => $email,
                'birthday' => $birthday,
                'department' => $department,
                'id' => $pdo->lastInsertId()  // Get the last inserted ID
            ];
            echo json_encode($authdata);
        } else {
            // Handle query execution failure
            echo json_encode(['error' => 'Failed to insert data']);
        }
    } catch (PDOException $e) {
        // Handle any PDO exceptions
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Invalid request, no data received']);
}
?>
