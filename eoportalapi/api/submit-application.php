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

$postdata = file_get_contents("php://input");

if (isset($postdata) && !empty($postdata)) {
    $request = json_decode($postdata);

    // Check if JSON is valid
    if ($request === null) {
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    // Sanitize inputs
    $lastName = trim($request->lastName);
    $firstName = trim($request->firstName);
    $middleName = isset($request->middleName) ? trim($request->middleName) : null;
    $suffix = isset($request->suffix) ? trim($request->suffix) : null;
    $contactNumber = trim($request->contactNumber);
    $email = trim($request->email);
    $dateOfBirth = trim($request->dateOfBirth);
    $placeOfBirth = trim($request->placeOfBirth);
    $nationality = trim($request->nationality);
    $civilStatus = trim($request->civilStatus);
    $gender = trim($request->gender);

    // Validate required fields
    if (empty($lastName) || empty($firstName) || empty($contactNumber) || 
        empty($email) || empty($dateOfBirth) || empty($placeOfBirth) || 
        empty($nationality) || empty($civilStatus) || empty($gender)) {
        echo json_encode(['error' => 'All required fields must be filled']);
        exit;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    // Validate civil status
    $validCivilStatus = ['Single', 'Married', 'Divorced', 'Widowed'];
    if (!in_array($civilStatus, $validCivilStatus)) {
        echo json_encode(['error' => 'Invalid civil status']);
        exit;
    }

    // Validate gender
    $validGender = ['Male', 'Female', 'Other'];
    if (!in_array($gender, $validGender)) {
        echo json_encode(['error' => 'Invalid gender']);
        exit;
    }

    try {
        // Check if email already exists
        $sql = "SELECT * FROM applicants WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(['error' => 'Email already exists']);
            exit;
        }

        // Begin transaction
        $pdo->beginTransaction();

        // Insert new applicant
        $sql = "INSERT INTO applicants (
            last_name, first_name, middle_name, suffix,
            contact_number, email, date_of_birth, place_of_birth,
            nationality, civil_status, gender, status
        ) VALUES (
            :lastName, :firstName, :middleName, :suffix,
            :contactNumber, :email, :dateOfBirth, :placeOfBirth,
            :nationality, :civilStatus, :gender, 'Pending'
        )";
        
        $stmt = $pdo->prepare($sql);
        
        // Bind parameters
        $stmt->bindParam(':lastName', $lastName);
        $stmt->bindParam(':firstName', $firstName);
        $stmt->bindParam(':middleName', $middleName);
        $stmt->bindParam(':suffix', $suffix);
        $stmt->bindParam(':contactNumber', $contactNumber);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':dateOfBirth', $dateOfBirth);
        $stmt->bindParam(':placeOfBirth', $placeOfBirth);
        $stmt->bindParam(':nationality', $nationality);
        $stmt->bindParam(':civilStatus', $civilStatus);
        $stmt->bindParam(':gender', $gender);

        if ($stmt->execute()) {
            $applicantId = $pdo->lastInsertId();
            $pdo->commit();
            
            $response = [
                'success' => true,
                'applicantId' => $applicantId,
                'data' => [
                    'lastName' => $lastName,
                    'firstName' => $firstName,
                    'middleName' => $middleName,
                    'suffix' => $suffix,
                    'contactNumber' => $contactNumber,
                    'email' => $email,
                    'dateOfBirth' => $dateOfBirth,
                    'placeOfBirth' => $placeOfBirth,
                    'nationality' => $nationality,
                    'civilStatus' => $civilStatus,
                    'gender' => $gender,
                    'status' => 'Pending'
                ]
            ];
            echo json_encode($response);
        } else {
            $pdo->rollBack();
            echo json_encode(['error' => 'Failed to insert data']);
        }
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Invalid request, no data received']);
}
?>