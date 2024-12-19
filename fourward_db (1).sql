-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 19, 2024 at 07:47 PM
-- Server version: 10.4.28-MariaDB
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
(1, 'admin1', 'adminpassword');

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
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `birthday` date NOT NULL,
  `department` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `fullname`, `email`, `password`, `birthday`, `department`) VALUES
(6, 'Dave Arcilla', 'davearcilla@gmail.com', '$2y$10$/qoIFe.LKxJZfjwbvxh48eVQyQC/ZAluO/PiFqnkaJg8St33boVDS', '2024-12-12', 'IT Department'),
(7, 'John Adrian Fontelera', 'jaa@gmail.com', '$2y$10$cnfXeQSoa2czJYkvF.QI3OGkGvgiKUmU2FPtwPunhlBU0rqoqwxhS', '2024-12-28', 'Marketing'),
(8, 'Stephany Galo', 'steph@gmail.com', '$2y$10$o6.ysOdD43E.MFLMRr8sducf8UekbZJIEnMu0S0zVRz591IATL2VO', '2003-09-15', 'IT Department'),
(9, 'Jaqt', 'jaqt@gmail.com', '$2y$10$j51nkGCQWyAMY.9Y8AjQp.2AJ/IhXR2NP8MmtT.DrzPXlLOJaAdmm', '2004-08-04', 'Accounting'),
(10, 'lumiere', 'lumiere@gmail.com', '$2y$10$Oemw3TzWrye8oN2CVybJJO1XJJNaIHoE/0yBam5JDC54/lLOm1d7G', '2024-12-04', 'Human Resources'),
(11, 'John Adrian F. Fontelera', 'fonteleraja@gmail.com', '$2y$10$PFTV7KK5v96autfpnuSsnuqzFGRKWAg/CCz0gpSp7exFWdr3GEDBS', '2004-08-04', 'Accounting'),
(12, 'Boyet Muni', 'boyet@gmail.com', '$2y$10$DGV5owOs4n7ybu343dfaP.2RUH/dlLB0Zselfix1dGWDHUeK.S6T.', '1994-07-18', 'Marketing'),
(13, 'Dave Justin', 'dave@gmail.com', '$2y$10$LhHuMmVuHKyCmowpanpGo.NvgSCITk.Rp6AUNDQfkidsqUFMCZstO', '2024-12-13', 'IT Department'),
(14, 'jaq', 'ja@gmail.com', '$2y$10$uL/Z/qbxW3faIAvoG79uAOx793uAzYAXp5w7MBGfQ1TrqtKDbgNXS', '2024-12-18', 'IT Department'),
(15, 'try', 'try@gmail.com', '$2y$10$umb9NQbd1Em8HJFmktPs9.vJHJR3lttCcIy1WqOw01QoouZ/Ghozq', '2024-12-12', 'Accounting'),
(16, 'Jayvee Mayor', 'jayvee@gmail.com', '$2y$10$0lUzH5AqF6.pv0jV5GsgleDyCZo8BubIe4kxFyPpkJ1bvz8ElBdNS', '1994-10-12', 'IT Department'),
(17, 'John Ron Diza', 'johnrondiza1106@gmail.com', '$2y$10$rHWiVqmsDgAt.5ITwi8PNOjlMiji6I9hTz3FvAhVCl5JqUilcpUfm', '2003-11-06', 'IT Department');

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
(26, 13, 'Fontelera.JohnAdrian_ITE_Lab_ACT _2.pdf', '../uploads/files/675d8147d2ccf_Fontelera.JohnAdrian_ITE_Lab_ACT _2.pdf', '2024-12-14 12:59:51', 'Government-issued ID'),
(38, 11, 'Preview.png', '../uploads/files/675e41645cca8_Preview.png', '2024-12-15 02:39:32', 'Tax Identification Number'),
(39, 11, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e48266a7a2_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:08:22', 'Signed Employment Contract'),
(40, 11, 'Preview.png', '../uploads/files/675e48266cf2d_Preview.png', '2024-12-15 03:08:22', 'Tax Identification Number'),
(41, 11, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e482671656_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:08:22', 'Bank Account Details'),
(42, 11, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e488e4ebff_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:10:06', 'Resume'),
(43, 11, 'Preview.png', '../uploads/files/675e488e7e15b_Preview.png', '2024-12-15 03:10:06', 'Tax Identification Number'),
(44, 11, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e488e828ab_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:10:06', 'Government-issued ID'),
(45, 11, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4cf59f89f_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:28:53', 'Resume'),
(46, 11, 'Preview.png', '../uploads/files/675e4cf5ae679_Preview.png', '2024-12-15 03:28:53', 'Government-issued ID'),
(47, 11, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4cf5ca65c_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:28:53', 'Bank Account Details'),
(48, 13, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4d1633022_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:29:26', 'Government-issued ID'),
(49, 13, 'Preview.png', '../uploads/files/675e4d163350a_Preview.png', '2024-12-15 03:29:26', 'Government-issued ID'),
(50, 13, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4d1634ad6_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:29:26', 'Tax Identification Number'),
(51, 13, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4d2665b56_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:29:42', 'Signed Employment Contract'),
(52, 15, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e4dc305fc0_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 03:32:19', 'Resume'),
(55, 13, 'John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e5822267db_John AdrianFontelera-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 04:16:34', 'Bank Account Details'),
(56, 13, 'JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '../uploads/files/675e58224ddf2_JayveeApiag-NETWORKING 2 BSI-certificate.pdf', '2024-12-15 04:16:34', 'Government-issued ID'),
(58, 16, 'DATA_SURGE_CHAPTER_1.pdf', '../uploads/files/675fc78059951_DATA_SURGE_CHAPTER_1.pdf', '2024-12-16 06:24:00', 'Government-issued ID');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `user_documents`
--
ALTER TABLE `user_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD CONSTRAINT `user_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
