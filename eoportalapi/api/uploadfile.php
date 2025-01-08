<?php
include_once("database.php");

// CORS Headers
header('Access-Control-Allow-Origin: http://localhost:57833');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Max-Age: 1728000');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just send the headers and exit for preflight requests
    http_response_code(200);
    exit();
}

// Proceed with POST request handling
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve user ID and document type from POST data
    $inputUserId = $_POST['id']; 
    $documentType = $_POST['documentType'] ?? ''; // Use null coalescing operator for default empty string


    try {
        // Verify that the user exists in the users table
        $verifyUserSql = "SELECT user_id FROM users WHERE user_id = :user_id";
        $verifyStmt = $pdo->prepare($verifyUserSql);
        $verifyStmt->bindParam(':user_id', $inputUserId, PDO::PARAM_INT);
        $verifyStmt->execute();

        // Check if the user exists
        if ($verifyStmt->rowCount() === 0) {
            throw new Exception("Invalid user ID");
        }

        // Validate file upload
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("File upload error: " . $_FILES['file']['error']);
        }

        $file = $_FILES['file'];
        $filename = basename($file['name']);
        $uploadDir = '../uploads/files/';
        
        $uniqueFilename = uniqid() . '_' . $filename;
        $filePath = $uploadDir . $uniqueFilename;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Move the uploaded file to the upload directory
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            // Insert file record into the user_documents table
            $insertSql = "INSERT INTO user_documents (user_id, filename, filepath, docstype) VALUES (:user_id, :filename, :filepath, :docstype)";
            $insertStmt = $pdo->prepare($insertSql);
            $insertStmt->bindParam(':user_id', $inputUserId, PDO::PARAM_INT);
            $insertStmt->bindParam(':filename', $filename);
            $insertStmt->bindParam(':filepath', $filePath);
            $insertStmt->bindParam(':docstype', $documentType);
            $insertStmt->execute();

            // Return success response
            echo json_encode([
                'success' => true, 
                'message' => 'File uploaded successfully',
                'filename' => $filename
            ]);
        } else {
            throw new Exception("Failed to move uploaded file");
        }
    } catch (Exception $e) {
        // Error handling with more detailed logging
        error_log("File Upload Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'error' => $e->getMessage()
        ]);
    }
} else {
    // Handle invalid request method
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'error' => 'Method Not Allowed'
    ]);
}
?>