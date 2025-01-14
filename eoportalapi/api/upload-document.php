<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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
        // Validate required data
        if (!isset($_FILES['file']) || !isset($_POST['applicantId'])) {
            throw new Exception('File and applicant ID are required');
        }

        $file = $_FILES['file'];
        $applicantId = $_POST['applicantId'];
        $documentType = $_POST['documentType'] ?? 'Other';

        // Validate applicant exists
        $stmt = $pdo->prepare("SELECT applicant_id FROM applicants WHERE applicant_id = ?");
        $stmt->execute([$applicantId]);
        if ($stmt->rowCount() === 0) {
            throw new Exception('Invalid applicant ID');
        }

        // Validate document type
        $validDocTypes = ['Resume', 'Government ID', 'Birth Certificate', 'Diploma', 'Training Certificates', 'Other'];
        if (!in_array($documentType, $validDocTypes)) {
            throw new Exception('Invalid document type');
        }

        // Validate file type
        $allowedTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
        
        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG');
        }

        // Validate file size (5MB max)
        $maxSize = 5 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            throw new Exception('File size exceeds limit of 5MB');
        }

        // Create upload directory
        $uploadDir = '../uploads/documents/' . $applicantId . '/';
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                throw new Exception('Failed to create upload directory');
            }
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('doc_') . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;

        // Begin transaction
        $pdo->beginTransaction();

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('Failed to upload file');
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
            throw new Exception('Failed to save document record');
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
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        // Clean up uploaded file if it exists
        if (isset($filepath) && file_exists($filepath)) {
            unlink($filepath);
        }

        http_response_code(400);
        echo json_encode([
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'error' => 'Method not allowed'
    ]);
}
?>