-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 06, 2025 at 06:11 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fourward_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `admin_username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `admin_username`, `password`) VALUES
(1, 'admin1', 'adminpassword'),
(2, 'admin2', 'adminpassword2');

-- --------------------------------------------------------

--
-- Table structure for table `task_logs`
--

CREATE TABLE `task_logs` (
  `log_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `status_change` enum('Assigned','In Progress','Completed') DEFAULT NULL,
  `comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_table`
--

CREATE TABLE `task_table` (
  `id` int(11) NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `task_description` text NOT NULL,
  `task_instructions` text DEFAULT NULL,
  `due_date` datetime NOT NULL,
  `status` enum('Pending','In Progress','Completed') DEFAULT 'Pending',
  `assigned_to` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_table`
--

INSERT INTO `task_table` (`id`, `task_name`, `task_description`, `task_instructions`, `due_date`, `status`, `assigned_to`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'wake up and help us', 'sos', 'sos', '2024-12-21 00:00:00', 'Pending', 13, 1, '2024-12-19 20:06:31', '2024-12-19 20:06:31'),
(2, 'daadwa', 'sdadwa', 'adadwas', '2024-12-03 00:00:00', 'Pending', 6, 1, '2024-12-19 20:18:53', '2024-12-19 20:18:53'),
(3, 'Create a Business Letter', 'Create a business letter for the Tempest Company', 'Create a business letter for the Tempest Company', '2024-12-21 00:00:00', 'Pending', 13, 1, '2024-12-19 20:37:02', '2024-12-19 20:37:02'),
(4, 'Create a Business Letter', 'test', 'test', '2024-12-21 00:00:00', 'Pending', 6, 1, '2024-12-19 22:12:53', '2024-12-19 22:12:53'),
(5, 'Create a Business Letter', 'Create a Business Letter', 'Create a Business Letter', '2024-12-21 00:00:00', 'Pending', 11, 1, '2024-12-20 00:12:04', '2024-12-20 00:12:04'),
(6, 'try', 'try', 'try', '2025-01-08 00:00:00', 'Pending', 11, 1, '2025-01-06 12:22:07', '2025-01-06 12:22:07'),
(7, 'try', 'try', 'try', '2025-01-08 00:00:00', 'Pending', 11, 1, '2025-01-06 12:22:35', '2025-01-06 12:22:35'),
(8, 'try', 'try', 'try', '2025-01-08 00:00:00', 'Pending', 11, 1, '2025-01-06 12:51:26', '2025-01-06 12:51:26'),
(9, 'try', 'try', 'try', '2025-01-08 00:00:00', 'Pending', 11, 1, '2025-01-06 12:51:27', '2025-01-06 12:51:27'),
(10, 'try', 'try', 'try', '2025-01-08 00:00:00', 'Pending', 11, 1, '2025-01-06 12:51:28', '2025-01-06 12:51:28'),
(11, 'try', 'try', 'try', '2025-01-08 00:00:00', 'Pending', 11, 1, '2025-01-06 12:51:29', '2025-01-06 12:51:29'),
(12, 'try', 'try', 'try', '2025-01-08 00:00:00', 'Pending', 13, 1, '2025-01-06 13:14:50', '2025-01-06 13:14:50'),
(13, 'hi', 'hi', 'hi', '2025-01-09 00:00:00', 'Pending', 11, 1, '2025-01-06 17:04:19', '2025-01-06 17:04:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `birthday` date NOT NULL,
  `department` varchar(255) NOT NULL,
  `profile_picture` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `fullname`, `email`, `password`, `birthday`, `department`, `profile_picture`) VALUES
(6, 'Dave Arcilla', 'davearcilla@gmail.com', '$2y$10$/qoIFe.LKxJZfjwbvxh48eVQyQC/ZAluO/PiFqnkaJg8St33boVDS', '2024-12-12', 'IT Department', ''),
(7, 'John Adrian Fontelera', 'jaa@gmail.com', '$2y$10$cnfXeQSoa2czJYkvF.QI3OGkGvgiKUmU2FPtwPunhlBU0rqoqwxhS', '2024-12-28', 'Marketing', ''),
(8, 'Stephany Galo', 'steph@gmail.com', '$2y$10$o6.ysOdD43E.MFLMRr8sducf8UekbZJIEnMu0S0zVRz591IATL2VO', '2003-09-15', 'IT Department', ''),
(9, 'Jaqt', 'jaqt@gmail.com', '$2y$10$j51nkGCQWyAMY.9Y8AjQp.2AJ/IhXR2NP8MmtT.DrzPXlLOJaAdmm', '2004-08-04', 'Accounting', ''),
(10, 'lumiere', 'lumiere@gmail.com', '$2y$10$Oemw3TzWrye8oN2CVybJJO1XJJNaIHoE/0yBam5JDC54/lLOm1d7G', '2024-12-04', 'Human Resources', ''),
(11, 'John Adrian F. Fontelera', 'fonteleraja@gmail.com', '$2y$10$PFTV7KK5v96autfpnuSsnuqzFGRKWAg/CCz0gpSp7exFWdr3GEDBS', '2004-08-04', 'Accounting', 'uploads/profile_pictures/user_11/1735876561_ja.png'),
(12, 'Boyet Muni', 'boyet@gmail.com', '$2y$10$DGV5owOs4n7ybu343dfaP.2RUH/dlLB0Zselfix1dGWDHUeK.S6T.', '1994-07-18', 'Marketing', ''),
(13, 'Dave Justin', 'dave@gmail.com', '$2y$10$LhHuMmVuHKyCmowpanpGo.NvgSCITk.Rp6AUNDQfkidsqUFMCZstO', '2024-12-13', 'IT Department', 'uploads/profile_pictures/user_13/1735877770_muni.png'),
(14, 'jaq', 'ja@gmail.com', '$2y$10$uL/Z/qbxW3faIAvoG79uAOx793uAzYAXp5w7MBGfQ1TrqtKDbgNXS', '2024-12-18', 'IT Department', ''),
(15, 'try', 'try@gmail.com', '$2y$10$umb9NQbd1Em8HJFmktPs9.vJHJR3lttCcIy1WqOw01QoouZ/Ghozq', '2024-12-12', 'Accounting', ''),
(16, 'Jayvee Mayor', 'jayvee@gmail.com', '$2y$10$0lUzH5AqF6.pv0jV5GsgleDyCZo8BubIe4kxFyPpkJ1bvz8ElBdNS', '1994-10-12', 'IT Department', ''),
(17, 'John Ron Diza', 'johnrondiza1106@gmail.com', '$2y$10$rHWiVqmsDgAt.5ITwi8PNOjlMiji6I9hTz3FvAhVCl5JqUilcpUfm', '2003-11-06', 'IT Department', ''),
(18, 'John Adrian', 'johnadrian@gmail.com', '$2y$10$8yeAm0w4EoRzR3tVGHKCE.U.3O5l0GKpxJxg6Fr6SA0siE58zxxVW', '2004-08-04', 'IT Department', 'uploads/profile_pictures/user_18/1735877160_ja.png');

-- --------------------------------------------------------

--
-- Table structure for table `user_documents`
--

CREATE TABLE `user_documents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `filepath` varchar(500) NOT NULL,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `docstype` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_documents`
--

INSERT INTO `user_documents` (`id`, `user_id`, `filename`, `filepath`, `upload_date`, `docstype`) VALUES
(17, 14, 'ActivityWebinarDoc.docx', '../uploads/files/675d0fbd9fdae_ActivityWebinarDoc.docx', '2024-12-14 04:55:25', ''),
(18, 14, 'Fontelera.JohnAdrian_Accomplishment-Report.pdf', '../uploads/files/675d1113f331d_Fontelera.JohnAdrian_Accomplishment-Report.pdf', '2024-12-14 05:01:07', ''),
(19, 14, 'vaxcert.docx', '../uploads/files/675d1166c960b_vaxcert.docx', '2024-12-14 05:02:30', ''),
(39, 11, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e48266a7a2_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:08:22', 'Signed Employment Contract'),
(40, 11, 'Preview.png', '../uploads/files/675e48266cf2d_Preview.png', '2024-12-15 03:08:22', 'Tax Identification Number'),
(41, 11, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e482671656_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:08:22', 'Bank Account Details'),
(42, 11, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e488e4ebff_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:10:06', 'Resume'),
(43, 11, 'Preview.png', '../uploads/files/675e488e7e15b_Preview.png', '2024-12-15 03:10:06', 'Tax Identification Number'),
(44, 11, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e488e828ab_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:10:06', 'Government-issued ID'),
(45, 11, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4cf59f89f_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:28:53', 'Resume'),
(46, 11, 'Preview.png', '../uploads/files/675e4cf5ae679_Preview.png', '2024-12-15 03:28:53', 'Government-issued ID'),
(47, 11, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4cf5ca65c_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:28:53', 'Bank Account Details'),
(49, 13, 'Preview.png', '../uploads/files/675e4d163350a_Preview.png', '2024-12-15 03:29:26', 'Government-issued ID'),
(50, 13, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4d1634ad6_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:29:26', 'Tax Identification Number'),
(51, 13, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4d2665b56_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:29:42', 'Signed Employment Contract'),
(52, 15, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4dc305fc0_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:32:19', 'Resume'),
(55, 13, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e5822267db_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 04:16:34', 'Bank Account Details'),
(56, 13, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e58224ddf2_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 04:16:34', 'Government-issued ID'),
(58, 16, 'DATA_SURGE_CHAPTER_1.pdf', '../uploads/files/675fc78059951_DATA_SURGE_CHAPTER_1.pdf', '2024-12-16 06:24:00', 'Government-issued ID'),
(59, 18, 'bank account details.png', '../uploads/files/6777645490a4e_bank account details.png', '2025-01-03 04:15:16', 'Bank Account Details'),
(60, 13, 'signed employment contract.jpg', '../uploads/files/677bd8c52b0e7_signed employment contract.jpg', '2025-01-06 13:21:09', 'Signed Employment Contract'),
(61, 13, 'resume.png', '../uploads/files/677bd8c52e94b_resume.png', '2025-01-06 13:21:09', 'Resume'),
(62, 13, 'tax id number.jpg', '../uploads/files/677bd8c52c297_tax id number.jpg', '2025-01-06 13:21:09', 'Tax Identification Number');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_logs`
--
ALTER TABLE `task_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `task_table`
--
ALTER TABLE `task_table`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_assigned_to` (`assigned_to`),
  ADD KEY `fk_created_by` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `task_table`
--
ALTER TABLE `task_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `user_documents`
--
ALTER TABLE `user_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `task_table`
--
ALTER TABLE `task_table`
  ADD CONSTRAINT `fk_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `admin` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD CONSTRAINT `user_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
