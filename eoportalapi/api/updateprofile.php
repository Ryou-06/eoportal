<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once("database.php");

// Allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure the request is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Method Not Allowed'
    ]);
    exit;
}

$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

// Log incoming data for debugging
error_log("Received data: " . print_r($request, true));

if (isset($postdata) && !empty($postdata)) {
    $currentEmail = trim($request->currentEmail);
    $newEmail = trim($request->newEmail);
    $department = trim($request->department);

    try {
        // Start a transaction
        $pdo->beginTransaction();

        // Check if the new email already exists (if different from current)
        if ($currentEmail !== $newEmail) {
            $checkEmail = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
            $checkEmail->bindParam(':email', $newEmail);
            $checkEmail->execute();

            if ($checkEmail->fetchColumn() > 0) {
                // Rollback the transaction
                $pdo->rollBack();
                
                http_response_code(400);
                echo json_encode([
                    'success' => false, 
                    'message' => 'This email is already registered.'
                ]);
                exit;
            }
        }

        // Prepare update statement
        $sql = "UPDATE users SET email = :newEmail, department = :department WHERE email = :currentEmail";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':newEmail', $newEmail);
        $stmt->bindParam(':department', $department);
        $stmt->bindParam(':currentEmail', $currentEmail);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Commit the transaction
            $pdo->commit();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Profile updated successfully'
            ]);
        } else {
            // Rollback the transaction
            $pdo->rollBack();
            
            http_response_code(404);
            echo json_encode([
                'success' => false, 
                'message' => 'User not found'
            ]);
        }
    } catch (PDOException $e) {
        // Rollback the transaction in case of error
        $pdo->rollBack();
        
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Invalid request'
    ]);
}
?>