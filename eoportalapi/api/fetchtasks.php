<?php
include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['user_id'])) {
    $userId = intval($_GET['user_id']);
    
    try {
        $sql = "SELECT t.id, t.task_name, t.task_description, t.task_instructions, 
               t.due_date, t.status, t.created_at, t.updated_at,
               t.progress, /* Add this line */
               a.admin_username as created_by
        FROM task_table t
        JOIN admin a ON t.created_by = a.id
        WHERE t.assigned_to = :user_id
        ORDER BY t.due_date ASC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format dates for better readability
        foreach ($tasks as &$task) {
            $task['due_date'] = date('Y-m-d H:i:s', strtotime($task['due_date']));
            $task['created_at'] = date('Y-m-d H:i:s', strtotime($task['created_at']));
            $task['updated_at'] = date('Y-m-d H:i:s', strtotime($task['updated_at']));
        }
        
        echo json_encode($tasks);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request. User ID is required.']);
}
?>