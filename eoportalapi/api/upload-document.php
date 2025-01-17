<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'); // Added this header
header('Content-Type: application/json');

// Handle OPTIONS request for CORS pre-flight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    exit;
}

include_once("database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Debug logging
        error_log('Received file upload request');
        error_log('FILES: ' . print_r($_FILES, true));
        error_log('POST: ' . print_r($_POST, true));

        // Validate required data
        if (!isset($_FILES['file']) || !isset($_POST['applicantId']) || !isset($_POST['documentType'])) {
            throw new Exception('Missing required fields: ' . 
                (!isset($_FILES['file']) ? 'file ' : '') .
                (!isset($_POST['applicantId']) ? 'applicantId ' : '') .
                (!isset($_POST['documentType']) ? 'documentType' : '')
            );
        }

        $file = $_FILES['file'];
        $applicantId = $_POST['applicantId'];
        $documentType = $_POST['documentType'];

        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('File upload failed with error code: ' . $file['error']);
        }

        // Create upload directory with full permissions
        $uploadDir = dirname(__FILE__) . '/../uploads/documents/' . $applicantId . '/';
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                throw new Exception('Failed to create upload directory: ' . $uploadDir);
            }
            chmod($uploadDir, 0777); // Ensure directory is writable
        }

        // Generate unique filename
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = uniqid('doc_') . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;

        // Begin transaction
        $pdo->beginTransaction();

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('Failed to move uploaded file. Check permissions and path: ' . $filepath);
        }

        // Insert document record
        $sql = "INSERT INTO applicant_documents (
            applicant_id, document_type, filename, filepath, status
        ) VALUES (?, ?, ?, ?, 'Pending')";
        
        $stmt = $pdo->prepare($sql);
        
        if (!$stmt->execute([
            $applicantId,
            $documentType,
            $filename,
            'uploads/documents/' . $applicantId . '/' . $filename
        ])) {
            throw new Exception('Failed to save document record to database');
        }

        $documentId = $pdo->lastInsertId();
        
        // Commit transaction
        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => [
                'documentId' => $documentId,
                'filename' => $filename,
                'documentType' => $documentType,
                'status' => 'Pending'
            ]
        ]);

    } catch (Exception $e) {
        error_log('Document upload error: ' . $e->getMessage());
        
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        // Clean up uploaded file if it exists
        if (isset($filepath) && file_exists($filepath)) {
            unlink($filepath);
        }

        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>