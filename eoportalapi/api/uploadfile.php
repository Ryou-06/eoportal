<?php
include_once("database.php");

// Set proper CORS headers
header('Access-Control-Allow-Origin: *'); // Replace * with your Angular app's URL in production
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
header('Access-Control-Max-Age: 1728000');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only proceed if it's a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get and validate user ID
        if (!isset($_POST['id'])) {
            throw new Exception("User ID is required");
        }
        $inputUserId = filter_var($_POST['id'], FILTER_VALIDATE_INT);
        if ($inputUserId === false) {
            throw new Exception("Invalid user ID format");
        }

        // Get and validate document type
        $documentType = isset($_POST['documentType']) ? trim($_POST['documentType']) : '';
        if (empty($documentType)) {
            throw new Exception("Document type is required");
        }

        // Verify user exists
        $verifyUserSql = "SELECT user_id FROM users WHERE user_id = :user_id";
        $verifyStmt = $pdo->prepare($verifyUserSql);
        $verifyStmt->bindParam(':user_id', $inputUserId, PDO::PARAM_INT);
        $verifyStmt->execute();

        if ($verifyStmt->rowCount() === 0) {
            throw new Exception("Invalid user ID");
        }

        // Validate file upload
        if (!isset($_FILES['file'])) {
            throw new Exception("No file uploaded");
        }

        if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $uploadErrors = array(
                UPLOAD_ERR_INI_SIZE => "The uploaded file exceeds the upload_max_filesize directive",
                UPLOAD_ERR_FORM_SIZE => "The uploaded file exceeds the MAX_FILE_SIZE directive",
                UPLOAD_ERR_PARTIAL => "The uploaded file was only partially uploaded",
                UPLOAD_ERR_NO_FILE => "No file was uploaded",
                UPLOAD_ERR_NO_TMP_DIR => "Missing a temporary folder",
                UPLOAD_ERR_CANT_WRITE => "Failed to write file to disk",
                UPLOAD_ERR_EXTENSION => "A PHP extension stopped the file upload"
            );
            throw new Exception("File upload error: " . 
                ($uploadErrors[$_FILES['file']['error']] ?? "Unknown error"));
        }

        $file = $_FILES['file'];
        $filename = basename($file['name']);
        
        // Validate file type (adjust allowed types as needed)
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        $fileType = mime_content_type($file['tmp_name']);
        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception("Invalid file type. Allowed types: JPEG, PNG, GIF, PDF");
        }

        // Create unique filename and set upload path
        $uploadDir = '../uploads/files/';
        $uniqueFilename = uniqid() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", $filename);
        $filePath = $uploadDir . $uniqueFilename;

        // Create upload directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception("Failed to create upload directory");
            }
        }

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception("Failed to move uploaded file");
        }

        // Insert into database
        $insertSql = "INSERT INTO user_documents (user_id, filename, filepath, docstype) 
                     VALUES (:user_id, :filename, :filepath, :docstype)";
        $insertStmt = $pdo->prepare($insertSql);
        $insertStmt->execute([
            ':user_id' => $inputUserId,
            ':filename' => $filename,
            ':filepath' => $filePath,
            ':docstype' => $documentType
        ]);

        // Success response
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'File uploaded successfully',
            'filename' => $filename,
            'filepath' => $filePath
        ]);

    } catch (Exception $e) {
        // Log error for debugging
        error_log("File Upload Error: " . $e->getMessage());
        
        // Send error response
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    // Invalid request method
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method Not Allowed'
    ]);
}
?>