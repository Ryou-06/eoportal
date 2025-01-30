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
        // Query using your exact table structure
        $sql = "SELECT user_id, fullname, email, password, contact_number, 
                       date_of_birth, place_of_birth, nationality, civil_status, 
                       gender, department, position, profile_picture, created_at, 
                       status, inactivity_reason 
                FROM users 
                WHERE email = :email";
                
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            // Check user status before verifying password
            if ($user['status'] === 'Inactive') {
                $response = [
                    'success' => false,
                    'message' => 'Your account is currently inactive.',
                    'reason' => $user['inactivity_reason'] ?? 'Please contact the administrator.'
                ];
                http_response_code(403);
                echo json_encode($response);
                exit();
            }

            if (password_verify($pwd, $user['password'])) {
                // Remove sensitive data before sending response
                unset($user['password']);
                
                // Log successful login with current UTC time
                $current_utc = gmdate('Y-m-d H:i:s');
                $log_sql = "INSERT INTO login_logs (user_id, login_time, login_user, status) 
                           VALUES (:user_id, :login_time, :login_user, 'success')";
                $log_stmt = $pdo->prepare($log_sql);
                $log_stmt->execute([
                    'user_id' => $user['user_id'],
                    'login_time' => $current_utc,
                    'login_user' => 'Ryou-06' // Current user's login from your system
                ]);

                $response = [
                    'success' => true,
                    'user' => $user
                ];
                
                http_response_code(200);
                echo json_encode($response);
            } else {
                // Log failed login attempt
                $current_utc = gmdate('Y-m-d H:i:s');
                $log_sql = "INSERT INTO login_logs (user_id, login_time, login_user, status) 
                           VALUES (:user_id, :login_time, :login_user, 'failed')";
                $log_stmt = $pdo->prepare($log_sql);
                $log_stmt->execute([
                    'user_id' => $user['user_id'],
                    'login_time' => $current_utc,
                    'login_user' => 'Ryou-06'
                ]);

                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid email or password'
                ]);
            }
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
        }
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
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