<?php
include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
        
        if ($user_id <= 0) {
            throw new Exception('Invalid user ID');
        }

        $sql = "SELECT m.message_id, m.admin_id, m.user_id, m.message_content, 
                       m.sent_at, m.is_read, a.admin_username
                FROM messages m
                LEFT JOIN admin a ON m.admin_id = a.id
                WHERE m.user_id = :user_id
                ORDER BY m.sent_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert is_read to boolean for consistency with frontend
        foreach ($messages as &$message) {
            $message['is_read'] = (bool)$message['is_read'];
        }
        
        echo json_encode([
            'success' => true,
            'messages' => $messages
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>