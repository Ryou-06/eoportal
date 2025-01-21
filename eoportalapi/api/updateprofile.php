<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

function validateUser($pdo, $email) {
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$currentEmail = $_POST['currentEmail'] ?? '';
$userData = validateUser($pdo, $currentEmail);

if (!$userData) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$userId = $userData['user_id'];

// Handle profile picture upload
$profilePicture = null;
if (isset($_FILES['profilePicture']) && $_FILES['profilePicture']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = "../uploads/profile_pictures/user_{$userId}/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $stmt = $pdo->prepare("SELECT profile_picture FROM users WHERE user_id = :userId");
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    $oldPicture = $stmt->fetchColumn();
    
    if ($oldPicture && file_exists("../" . $oldPicture)) {
        unlink("../" . $oldPicture);
    }
    
    $fileName = time() . '_' . basename($_FILES['profilePicture']['name']);
    $uploadPath = $uploadDir . $fileName;
    
    if (move_uploaded_file($_FILES['profilePicture']['tmp_name'], $uploadPath)) {
        $profilePicture = str_replace('../', '', $uploadDir . $fileName);
    }
}

try {
    $pdo->beginTransaction();
    
    $newEmail = $_POST['newEmail'];
    $contactNumber = $_POST['contactNumber'];
    $civilStatus = $_POST['civilStatus'];
    
    // Check if new email exists
    if ($currentEmail !== $newEmail) {
        $checkEmail = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = :email AND user_id != :userId");
        $checkEmail->bindParam(':email', $newEmail);
        $checkEmail->bindParam(':userId', $userId);
        $checkEmail->execute();
        
        if ($checkEmail->fetchColumn() > 0) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            exit;
        }
    }
    
    // Build update query
    $sql = "UPDATE users SET email = :newEmail, contact_number = :contactNumber, civil_status = :civilStatus";
    if ($profilePicture) {
        $sql .= ", profile_picture = :profilePicture";
    }
    $sql .= " WHERE user_id = :userId";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':userId', $userId);
    $stmt->bindParam(':newEmail', $newEmail);
    $stmt->bindParam(':contactNumber', $contactNumber);
    $stmt->bindParam(':civilStatus', $civilStatus);
    if ($profilePicture) {
        $stmt->bindParam(':profilePicture', $profilePicture);
    }
    
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $pdo->commit();
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully',
            'profilePicture' => $profilePicture
        ]);
    } else {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
    
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>