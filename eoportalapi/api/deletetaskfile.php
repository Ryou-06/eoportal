<?php
include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $deleteData);
    $fileId = $_GET['file_id'] ?? null;

    if (!$fileId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File ID is required']);
        exit;
    }

    try {
        // First, get the file path to delete the physical file
        $sqlGetPath = "SELECT filepath FROM task_files WHERE id = :file_id";
        $stmtGetPath = $pdo->prepare($sqlGetPath);
        $stmtGetPath->bindParam(':file_id', $fileId);
        $stmtGetPath->execute();
        $fileInfo = $stmtGetPath->fetch(PDO::FETCH_ASSOC);

        if ($fileInfo && file_exists($fileInfo['filepath'])) {
            // Delete the physical file
            unlink($fileInfo['filepath']);
        }

        // Delete the database record
        $sql = "DELETE FROM task_files WHERE id = :file_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':file_id', $fileId);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'File deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>