<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

$db_host = 'localhost';
$db_username = 'root';
$db_password = '';
$db_name = 'fourward_db';

try {
    // Create a new PDO instance
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_username, $db_password);

    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Uncomment the following line for debugging purposes (do not use in production)
    // echo "Connected successfully";

} catch (PDOException $e) {
    // If the connection fails, output the error
    die("Error: " . $e->getMessage());
}
?>
