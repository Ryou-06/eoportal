<?php
include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $fileId = isset($_GET['file_id']) ? intval($_GET['file_id']) : 0;

    if ($fileId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid file ID provided'
        ]);
        exit;
    }

    try {
        // First, get the file info and task_id before deletion
        $sqlSelect = "SELECT tf.filepath, tf.task_id 
                     FROM task_files tf 
                     WHERE tf.id = :file_id";
        $stmtSelect = $pdo->prepare($sqlSelect);
        $stmtSelect->bindParam(':file_id', $fileId, PDO::PARAM_INT);
        $stmtSelect->execute();
        
        $file = $stmtSelect->fetch(PDO::FETCH_ASSOC);
        
        if (!$file) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'File not found'
            ]);
            exit;
        }

        // Begin transaction
        $pdo->beginTransaction();

        // Delete from database
        $sqlDelete = "DELETE FROM task_files WHERE id = :file_id";
        $stmtDelete = $pdo->prepare($sqlDelete);
        $stmtDelete->bindParam(':file_id', $fileId, PDO::PARAM_INT);
        $stmtDelete->execute();

        // Check if this was the last file for the task
        $sqlCheckFiles = "SELECT COUNT(*) as file_count FROM task_files WHERE task_id = :task_id";
        $stmtCheckFiles = $pdo->prepare($sqlCheckFiles);
        $stmtCheckFiles->bindParam(':task_id', $file['task_id'], PDO::PARAM_INT);
        $stmtCheckFiles->execute();
        $remainingFiles = $stmtCheckFiles->fetch(PDO::FETCH_ASSOC);

        // If no files remain, update task progress and status
        if ($remainingFiles['file_count'] === '0') {
            $sqlUpdateTask = "UPDATE tasks 
                            SET progress = 0, 
                                status = 'In Progress' 
                            WHERE id = :task_id";
            $stmtUpdateTask = $pdo->prepare($sqlUpdateTask);
            $stmtUpdateTask->bindParam(':task_id', $file['task_id'], PDO::PARAM_INT);
            $stmtUpdateTask->execute();
        }

        // Delete physical file
        $filepath = $_SERVER['DOCUMENT_ROOT'] . str_replace('..', '', $file['filepath']);
        if (file_exists($filepath)) {
            if (!unlink($filepath)) {
                // If file deletion fails, rollback database changes
                $pdo->rollBack();
                throw new Exception('Failed to delete physical file');
            }
        }

        // Commit transaction
        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'File deleted successfully',
            'hasRemainingFiles' => $remainingFiles['file_count'] > 0,
            'taskId' => $file['task_id']
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting file: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}