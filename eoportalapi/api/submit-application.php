<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle OPTIONS request for CORS pre-flight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

include_once("database.php");

// Set error logging
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);
ini_set('error_log', 'application_errors.log');

// Get current timestamp for logging
$timestamp = date('Y-m-d H:i:s');

// Log the start of request processing
error_log("[$timestamp] Processing application submission");

$postdata = file_get_contents("php://input");

if (isset($postdata) && !empty($postdata)) {
    $request = json_decode($postdata);

    // Log received data
    error_log("[$timestamp] Received data: " . print_r($request, true));

    // Check if JSON is valid
    if ($request === null) {
        error_log("[$timestamp] Error: Invalid JSON data received");
        echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
        exit;
    }

    try {
        // Sanitize and validate inputs
        $lastName = trim($request->lastName ?? '');
        $firstName = trim($request->firstName ?? '');
        $middleName = isset($request->middleName) ? trim($request->middleName) : null;
        $suffix = isset($request->suffix) ? trim($request->suffix) : null;
        $contactNumber = trim($request->contactNumber ?? '');
        $email = trim($request->email ?? '');
        $dateOfBirth = trim($request->dateOfBirth ?? '');
        $placeOfBirth = trim($request->placeOfBirth ?? '');
        $nationality = trim($request->nationality ?? '');
        $civilStatus = trim($request->civilStatus ?? '');
        $gender = trim($request->gender ?? '');
        $department = trim($request->department ?? '');
        $position = trim($request->position ?? '');

        // Validate required fields
        $requiredFields = [
            'lastName' => $lastName,
            'firstName' => $firstName,
            'contactNumber' => $contactNumber,
            'email' => $email,
            'dateOfBirth' => $dateOfBirth,
            'placeOfBirth' => $placeOfBirth,
            'nationality' => $nationality,
            'civilStatus' => $civilStatus,
            'gender' => $gender,
            'department' => $department,
            'position' => $position
        ];

        $emptyFields = array_filter($requiredFields, function($value) {
            return empty($value);
        });

        if (!empty($emptyFields)) {
            $missingFields = implode(', ', array_keys($emptyFields));
            error_log("[$timestamp] Error: Missing required fields: $missingFields");
            echo json_encode(['success' => false, 'error' => "Required fields missing: $missingFields"]);
            exit;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_log("[$timestamp] Error: Invalid email format: $email");
            echo json_encode(['success' => false, 'error' => 'Invalid email format']);
            exit;
        }

        // Validate civil status
        $validCivilStatus = ['Single', 'Married', 'Divorced', 'Widowed'];
        if (!in_array($civilStatus, $validCivilStatus)) {
            error_log("[$timestamp] Error: Invalid civil status: $civilStatus");
            echo json_encode(['success' => false, 'error' => 'Invalid civil status']);
            exit;
        }

        // Validate gender
        $validGender = ['Male', 'Female', 'Other'];
        if (!in_array($gender, $validGender)) {
            error_log("[$timestamp] Error: Invalid gender: $gender");
            echo json_encode(['success' => false, 'error' => 'Invalid gender']);
            exit;
        }

        // Validate department
        $validDepartments = [
            'Human Resources',
            'Information Technology',
            'Marketing',
            'Finance',
            'Operations',
            'Sales'
        ];
        if (!in_array($department, $validDepartments)) {
            error_log("[$timestamp] Error: Invalid department: $department");
            echo json_encode(['success' => false, 'error' => 'Invalid department']);
            exit;
        }

        // Validate position based on department
        $validPositions = [
            'Human Resources' => [
                'HR Manager', 'HR Officer', 'Recruitment Specialist',
                'Training and Development Officer', 'HR Assistant',
                'Employee Relations Officer'
            ],
            'Information Technology' => [
                'IT Manager', 'Software Developer', 'System Administrator',
                'Network Engineer', 'Database Administrator', 'IT Support Specialist',
                'QA Engineer', 'Business Analyst'
            ],
            'Marketing' => [
                'Marketing Manager', 'Digital Marketing Specialist', 'Content Writer',
                'Social Media Manager', 'Brand Manager', 'Marketing Coordinator',
                'SEO Specialist'
            ],
            'Finance' => [
                'Finance Manager', 'Accountant', 'Financial Analyst',
                'Budget Analyst', 'Bookkeeper', 'Treasury Analyst',
                'Payroll Specialist'
            ],
            'Operations' => [
                'Operations Manager', 'Project Manager', 'Quality Assurance Manager',
                'Process Improvement Specialist', 'Operations Coordinator',
                'Logistics Coordinator', 'Supply Chain Manager'
            ],
            'Sales' => [
                'Sales Manager', 'Account Executive', 'Sales Representative',
                'Business Development Manager', 'Sales Coordinator',
                'Key Account Manager', 'Inside Sales Representative'
            ]
        ];

        if (!isset($validPositions[$department]) || !in_array($position, $validPositions[$department])) {
            error_log("[$timestamp] Error: Invalid position '$position' for department '$department'");
            echo json_encode(['success' => false, 'error' => 'Invalid position for selected department']);
            exit;
        }

        // Check if email already exists
        $stmt = $pdo->prepare("SELECT * FROM applicants WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            error_log("[$timestamp] Error: Email already exists: $email");
            echo json_encode(['success' => false, 'error' => 'Email already exists']);
            exit;
        }

        // Begin transaction
        $pdo->beginTransaction();

        // Insert new applicant
        $sql = "INSERT INTO applicants (
            last_name, first_name, middle_name, suffix,
            contact_number, email, date_of_birth, place_of_birth,
            nationality, civil_status, gender, department, position, status
        ) VALUES (
            :lastName, :firstName, :middleName, :suffix,
            :contactNumber, :email, :dateOfBirth, :placeOfBirth,
            :nationality, :civilStatus, :gender, :department, :position, 'Pending'
        )";
        
        $stmt = $pdo->prepare($sql);
        
        // Bind parameters
        $params = [
            ':lastName' => $lastName,
            ':firstName' => $firstName,
            ':middleName' => $middleName,
            ':suffix' => $suffix,
            ':contactNumber' => $contactNumber,
            ':email' => $email,
            ':dateOfBirth' => $dateOfBirth,
            ':placeOfBirth' => $placeOfBirth,
            ':nationality' => $nationality,
            ':civilStatus' => $civilStatus,
            ':gender' => $gender,
            ':department' => $department,
            ':position' => $position
        ];

        foreach ($params as $key => &$value) {
            $stmt->bindParam($key, $value);
        }

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
                    'department' => $department,
                    'position' => $position,
                    'status' => 'Pending'
                ]
            ];

            error_log("[$timestamp] Success: Application submitted for $firstName $lastName");
            echo json_encode($response);
        } else {
            throw new Exception('Failed to insert data');
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("[$timestamp] Database error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    error_log("[$timestamp] Error: No data received");
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request, no data received'
    ]);
}
?>