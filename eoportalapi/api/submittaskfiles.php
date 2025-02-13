<?php
include_once("database.php");

header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
header('Access-Control-Max-Age: 1728000');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function handleFileUpload($file, $task_id) {
    $upload_dir = '../uploads/task_files/';
    $task_dir = $upload_dir . 'task_' . $task_id . '/';
    
    if (!file_exists($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            throw new Exception("Failed to create upload directory");
        }
    }

    if (!file_exists($task_dir)) {
        if (!mkdir($task_dir, 0755, true)) {
            throw new Exception("Failed to create task directory");
        }
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Upload error: " . $file['error']);
    }

    if ($file['size'] > 10485760) { // 10MB limit
        throw new Exception("File too large");
    }

    $file_name = basename($file['name']);
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    $unique_filename = uniqid() . '_' . $file_name;
    $file_path = $task_dir . $unique_filename;

    if (!move_uploaded_file($file['tmp_name'], $file_path)) {
        error_log("Failed to move file: " . error_get_last()['message']);
        throw new Exception("Failed to move uploaded file");
    }

    return $file_path;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check for required fields
        if (!isset($_POST['task_id']) || !isset($_POST['progress']) || !isset($_POST['accomplishment_report'])) {
            throw new Exception("Missing required fields");
        }

        $task_id = $_POST['task_id'];
        $progress = $_POST['progress'];
        $accomplishment_report = $_POST['accomplishment_report'] ?? '';
        if (empty($accomplishment_report)) {
          // Handle error
          echo json_encode(['success' => false, 'message' => 'Accomplishment report is required']);
          exit;
        }

        $pdo->beginTransaction();

        $update_progress = $pdo->prepare(
            "UPDATE task_table SET progress = :progress, status = CASE 
                WHEN :progress = 100 THEN 'Completed'
                WHEN :progress > 0 THEN 'In Progress'
                ELSE status END 
            WHERE id = :task_id"
        );
        $update_progress->bindParam(':progress', $progress, PDO::PARAM_INT);
        $update_progress->bindParam(':task_id', $task_id, PDO::PARAM_INT);
        $update_progress->execute();

        $uploaded_files = [];

        // Handle file uploads
        if (isset($_FILES['files'])) {
            foreach ($_FILES['files']['tmp_name'] as $key => $tmp_name) {
                if ($_FILES['files']['error'][$key] === UPLOAD_ERR_NO_FILE) {
                    continue;
                }

                $file = array(
                    'name' => $_FILES['files']['name'][$key],
                    'type' => $_FILES['files']['type'][$key],
                    'tmp_name' => $tmp_name,
                    'error' => $_FILES['files']['error'][$key],
                    'size' => $_FILES['files']['size'][$key]
                );

                // Upload the file and get its path
                $file_path = handleFileUpload($file, $task_id);

                // Insert file record into database
                $insert_file = $pdo->prepare(
                    "INSERT INTO task_files (task_id, filename, filepath, accomplishment_report, upload_date) 
                     VALUES (:task_id, :filename, :filepath, :accomplishment_report, CURRENT_TIMESTAMP)"
                );
                $filename = $file['name'];
                $insert_file->bindParam(':task_id', $task_id, PDO::PARAM_INT);
                $insert_file->bindParam(':filename', $filename);
                $insert_file->bindParam(':filepath', $file_path);
                $insert_file->bindParam(':accomplishment_report', $accomplishment_report);
                $insert_file->execute();

                $uploaded_files[] = [
                    'filename' => $filename,
                    'filepath' => $file_path
                ];
            }
        }

        $insert_log = $pdo->prepare(
            "INSERT INTO task_logs (task_id, status_change, comment) 
             VALUES (:task_id, :status, :comment)"
        );
        $status = $progress == 100 ? 'Completed' : 'In Progress';
        $comment = "Progress updated to {$progress}% with " . count($uploaded_files) . " new files uploaded and report submitted.";
        $insert_log->bindParam(':task_id', $task_id, PDO::PARAM_INT);
        $insert_log->bindParam(':status', $status);
        $insert_log->bindParam(':comment', $comment);
        $insert_log->execute();

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Accomplishment report and files submitted successfully',
            'files' => $uploaded_files
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Task File Submission Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method Not Allowed'
    ]);
}
?>
