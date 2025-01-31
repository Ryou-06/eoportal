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

// Function to get current UTC time in YYYY-MM-DD HH:MM:SS format
function getCurrentUTCTime() {
    return gmdate('Y-m-d H:i:s');
}

// Function to log login attempts
function logLoginAttempt($pdo, $userId, $status) {
    try {
        $current_utc = getCurrentUTCTime();
        $loginUser = 'Ryou-06'; // Current user's login
        
        $log_sql = "INSERT INTO login_logs (user_id, login_time, login_user, status) 
                    VALUES (:user_id, :login_time, :login_user, :status)";
        $log_stmt = $pdo->prepare($log_sql);
        $log_stmt->execute([
            'user_id' => $userId,
            'login_time' => $current_utc,
            'login_user' => $loginUser,
            'status' => $status
        ]);
        return true;
    } catch (PDOException $e) {
        error_log("Login log error: " . $e->getMessage());
        return false;
    }
}

try {
    $postdata = file_get_contents("php://input");
    $request = json_decode($postdata);

    // Check if data was received
    if (!isset($postdata) || empty($postdata)) {
        throw new Exception('No data received');
    }

    // Validate required fields
    if (!isset($request->email) || !isset($request->password)) {
        throw new Exception('Email and password are required');
    }

    // Sanitize inputs
    $email = filter_var(trim($request->email), FILTER_SANITIZE_EMAIL);
    $pwd = trim($request->password);

    // Query to get user data
    $sql = "SELECT 
                user_id,
                fullname,
                email,
                password,
                contact_number,
                date_of_birth,
                place_of_birth,
                nationality,
                civil_status,
                gender,
                department,
                position,
                profile_picture,
                created_at,
                status,
                inactivity_reason
            FROM users 
            WHERE email = :email";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit();
    }

    // Check account status first
    $status = strtoupper(trim($user['status']));
    
    if ($status === 'INACTIVE') {
        // Log inactive login attempt
        logLoginAttempt($pdo, $user['user_id'], 'inactive');
        
        http_response_code(403); // Use 403 Forbidden for inactive accounts
        echo json_encode([
            'success' => false,
            'message' => 'Account Inactive',
            'details' => [
                'status' => 'inactive',
                'reason' => $user['inactivity_reason'] ?? 'Please contact the administrator'
            ]
        ]);
        exit();
    }

    // Verify password
    if (password_verify($pwd, $user['password'])) {
        // Password correct - remove sensitive data
        unset($user['password']);

        // Log successful login
        logLoginAttempt($pdo, $user['user_id'], 'success');

        // Format dates
        if ($user['date_of_birth']) {
            $user['date_of_birth'] = date('Y-m-d', strtotime($user['date_of_birth']));
        }
        if ($user['created_at']) {
            $user['created_at'] = date('Y-m-d H:i:s', strtotime($user['created_at']));
        }

        // Success response
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ]);
    } else {
        // Log failed login attempt
        logLoginAttempt($pdo, $user['user_id'], 'failed');
        
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
    }

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred. Please try again later.'
    ]);
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>