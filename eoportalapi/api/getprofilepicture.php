<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once("database.php");

// Allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle GET request for profile picture
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['user_id'])) {
    $userId = filter_var($_GET['user_id'], FILTER_VALIDATE_INT);
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        exit;
    }

    try {
        // Get user's profile picture path
        $stmt = $pdo->prepare("SELECT profile_picture FROM users WHERE user_id = :userId");
        $stmt->bindParam(':userId', $userId);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['profile_picture']) {
            // Construct the full URL for the profile picture
            $baseUrl = 'http://localhost/eoportal/eoportalapi';  // Update this to match your server configuration
            $profilePicture = $result['profile_picture'];
            
            // Ensure the path starts with a forward slash
            if (!str_starts_with($profilePicture, '/')) {
                $profilePicture = '/' . $profilePicture;
            }
            
            $fullUrl = $baseUrl . $profilePicture;
            
            echo json_encode([
                'success' => true,
                'profile_picture' => $fullUrl
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No profile picture found',
                'profile_picture' => null
            ]);
        }
    } catch (PDOException $e) {
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