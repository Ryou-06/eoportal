<?php
include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $taskId = isset($_GET['task_id']) ? intval($_GET['task_id']) : 0;

    if ($taskId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid task ID provided',
            'files' => []
        ]);
        exit;
    }

    try {
        // Get all relevant file information
        $sql = "SELECT id, task_id, filename, filepath, upload_date 
                FROM task_files 
                WHERE task_id = :task_id 
                ORDER BY upload_date DESC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':task_id', $taskId, PDO::PARAM_INT);
        $stmt->execute();

        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($files) {
            echo json_encode([
                'success' => true,
                'message' => 'Files retrieved successfully',
                'files' => $files
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'No files found for this task',
                'files' => []
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage(),
            'files' => []
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed',
        'files' => []
    ]);
}