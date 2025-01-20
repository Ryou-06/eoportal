<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

// Increase limits
ini_set('upload_max_filesize', '100M');
ini_set('post_max_size', '100M');
ini_set('max_execution_time', '300');
ini_set('memory_limit', '512M');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

include_once("database.php");

try {
    // Debug logging
    error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
    error_log("Raw POST data: " . file_get_contents("php://input"));
    error_log("FILES array: " . print_r($_FILES, true));
    error_log("POST array: " . print_r($_POST, true));

    if (!isset($_POST['applicantId'])) {
        throw new Exception('Missing applicantId');
    }

    $applicantId = $_POST['applicantId'];
    $documentTypes = $_POST['documentTypes'] ?? [];
    $uploadResults = ['success' => [], 'failures' => []];

    // Create upload directory
    $uploadDir = dirname(__FILE__) . '/../uploads/documents/' . $applicantId . '/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            throw new Exception('Failed to create upload directory: ' . $uploadDir);
        }
    }
    chmod($uploadDir, 0777);

    // Begin transaction
    $pdo->beginTransaction();

    // Process multiple files
    if (isset($_FILES['files'])) {
        $files = $_FILES['files'];
        $fileCount = is_array($files['name']) ? count($files['name']) : 1;

        for ($i = 0; $i < $fileCount; $i++) {
            try {
                $currentFile = [
                    'name' => is_array($files['name']) ? $files['name'][$i] : $files['name'],
                    'type' => is_array($files['type']) ? $files['type'][$i] : $files['type'],
                    'tmp_name' => is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'],
                    'error' => is_array($files['error']) ? $files['error'][$i] : $files['error'],
                    'size' => is_array($files['size']) ? $files['size'][$i] : $files['size']
                ];

                // Get document type
                $documentType = isset($_POST['documentTypes'][$i]) ? $_POST['documentTypes'][$i] : 'Other';

                if ($currentFile['error'] === UPLOAD_ERR_OK) {
                    // Generate unique filename
                    $extension = strtolower(pathinfo($currentFile['name'], PATHINFO_EXTENSION));
                    $filename = uniqid('doc_') . '_' . time() . '_' . $i . '.' . $extension;
                    $filepath = $uploadDir . $filename;

                    if (move_uploaded_file($currentFile['tmp_name'], $filepath)) {
                        // Insert into database
                        $stmt = $pdo->prepare("INSERT INTO applicant_documents (
                            applicant_id, document_type, filename, filepath, status, upload_date
                        ) VALUES (?, ?, ?, ?, 'Pending', NOW())");
                        
                        $relativeFilepath = 'uploads/documents/' . $applicantId . '/' . $filename;
                        
                        if ($stmt->execute([
                            $applicantId,
                            $documentType,
                            $filename,
                            $relativeFilepath
                        ])) {
                            $uploadResults['success'][] = [
                                'filename' => $currentFile['name'],
                                'documentId' => $pdo->lastInsertId(),
                                'documentType' => $documentType
                            ];
                        } else {
                            throw new Exception("Database insertion failed for " . $currentFile['name']);
                        }
                    } else {
                        throw new Exception("Failed to move uploaded file: " . $currentFile['name']);
                    }
                } else {
                    throw new Exception("Upload error for " . $currentFile['name'] . ": code " . $currentFile['error']);
                }
            } catch (Exception $e) {
                error_log("Error processing file: " . $e->getMessage());
                $uploadResults['failures'][] = [
                    'filename' => $currentFile['name'] ?? 'unknown',
                    'error' => $e->getMessage()
                ];
            }
        }
    } else {
        throw new Exception('No files received');
    }

    // If we have any successful uploads, commit the transaction
    if (!empty($uploadResults['success'])) {
        $pdo->commit();
        echo json_encode([
            'success' => true,
            'message' => empty($uploadResults['failures']) ? 
                'All files uploaded successfully' : 
                'Some files uploaded successfully',
            'data' => $uploadResults
        ]);
    } else {
        // If no successful uploads, rollback and return error
        $pdo->rollBack();
        throw new Exception('No files were uploaded successfully');
    }

} catch (Exception $e) {
    error_log('Upload handler error: ' . $e->getMessage());
    
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => $uploadResults['failures'] ?? []
    ]);
}
?>