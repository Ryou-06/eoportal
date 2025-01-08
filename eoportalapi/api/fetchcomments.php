<?php
include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $task_id = isset($_GET['task_id']) ? intval($_GET['task_id']) : 0;
        
        if ($task_id <= 0) {
            throw new Exception('Invalid task ID');
        }

        $sql = "SELECT tc.comment_id, tc.task_id, tc.comment, tc.created_at,
                       a.admin_username 
                FROM task_comments tc
                LEFT JOIN admin a ON tc.admin_id = a.id
                WHERE tc.task_id = :task_id
                ORDER BY tc.created_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
        $stmt->execute();
        
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'comments' => $comments
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