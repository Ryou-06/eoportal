<?php
include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (isset($postdata) && !empty($postdata)) {
    // Input validation
    if (!isset($request->email) || !isset($request->password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email and password are required'
        ]);
        exit();
    }

    $email = trim($request->email);
    $pwd = trim($request->password);

    try {
        // First get the user with password for verification
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($pwd, $user['password'])) {
            // Create response without sensitive data
            $response = [
                'success' => true,
                'user' => [
                    'user_id' => $user['user_id'],
                    'fullname' => $user['fullname'],
                    'email' => $user['email'],
                    'date_of_birth' => $user['date_of_birth'],
                    'department' => $user['department'],
                    'profile_picture' => $user['profile_picture'] ?? null
                ]
            ];
            http_response_code(200);
            echo json_encode($response);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error occurred'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'No data received'
    ]);
}
?>