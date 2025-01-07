<?php

include_once("database.php"); // Include your database connection file

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $taskId = isset($_GET['task_id']) ? intval($_GET['task_id']) : 0;

    if ($taskId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid task ID.']);
        exit;
    }

    try {
        $sql = "SELECT filename, filepath FROM task_files WHERE task_id = :task_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':task_id', $taskId, PDO::PARAM_INT);
        $stmt->execute();

        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($files);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}