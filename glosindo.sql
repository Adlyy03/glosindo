-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 11, 2026 at 01:26 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `glosindo`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `model_type`, `model_id`, `description`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 1, 'updated', 'App\\Models\\User', 2, 'User updated by admin', '{\"id\": 2, \"name\": \"Receptionist GLOSINDO\", \"role\": \"receptionist\", \"email\": \"receptionist@glosindo.com\", \"created_at\": \"2026-08-18T07:36:53.000000Z\", \"updated_at\": \"2026-08-18T07:36:53.000000Z\"}', '{\"id\": 2, \"name\": \"Receptionist GLOSINDO\", \"role\": \"admin\", \"email\": \"receptionist@glosindo.com\", \"created_at\": \"2026-08-18T07:36:53.000000Z\", \"updated_at\": \"2026-08-18T07:47:14.000000Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:47:14', '2026-08-18 14:47:14'),
(2, 1, 'updated', 'App\\Models\\User', 2, 'User updated by admin', '{\"id\": 2, \"name\": \"Receptionist GLOSINDO\", \"role\": \"admin\", \"email\": \"receptionist@glosindo.com\", \"created_at\": \"2026-08-18T07:36:53.000000Z\", \"updated_at\": \"2026-08-18T07:47:14.000000Z\"}', '{\"id\": 2, \"name\": \"Receptionist GLOSINDO\", \"role\": \"receptionist\", \"email\": \"receptionist@glosindo.com\", \"created_at\": \"2026-08-18T07:36:53.000000Z\", \"updated_at\": \"2026-08-18T07:47:21.000000Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:47:21', '2026-08-18 14:47:21'),
(3, 1, 'created', 'App\\Models\\Event', 1, 'Event created', NULL, '{\"id\": 1, \"name\": \"lomba agustusan\", \"status\": \"scheduled\", \"end_time\": \"17:00\", \"location\": \"lapangan merdeka \", \"created_at\": \"2026-08-18T07:48:40.000000Z\", \"created_by\": 1, \"event_date\": \"2026-08-17T17:00:00.000000Z\", \"start_time\": \"07:00\", \"updated_at\": \"2026-08-18T07:48:40.000000Z\", \"description\": \"lomba\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:48:40', '2026-08-18 14:48:40'),
(4, 1, 'updated', 'App\\Models\\Event', 1, 'Event updated', '{\"id\": 1, \"name\": \"lomba agustusan\", \"status\": \"scheduled\", \"end_time\": \"17:00:00\", \"location\": \"lapangan merdeka \", \"created_at\": \"2026-08-18T07:48:40.000000Z\", \"created_by\": 1, \"deleted_at\": null, \"event_date\": \"2026-08-17T17:00:00.000000Z\", \"start_time\": \"07:00:00\", \"updated_at\": \"2026-08-18T07:48:40.000000Z\", \"description\": \"lomba\"}', '{\"id\": 1, \"name\": \"lomba agustusan\", \"status\": \"ongoing\", \"end_time\": \"17:00:00\", \"location\": \"lapangan merdeka \", \"created_at\": \"2026-08-18T07:48:40.000000Z\", \"created_by\": 1, \"deleted_at\": null, \"event_date\": \"2026-08-16T17:00:00.000000Z\", \"start_time\": \"07:00:00\", \"updated_at\": \"2026-08-18T07:49:28.000000Z\", \"description\": \"lomba\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:49:28', '2026-08-18 14:49:28'),
(5, 1, 'updated', 'App\\Models\\Event', 1, 'Event updated', '{\"id\": 1, \"name\": \"lomba agustusan\", \"status\": \"ongoing\", \"end_time\": \"17:00:00\", \"location\": \"lapangan merdeka \", \"created_at\": \"2026-08-18T07:48:40.000000Z\", \"created_by\": 1, \"deleted_at\": null, \"event_date\": \"2026-08-16T17:00:00.000000Z\", \"start_time\": \"07:00:00\", \"updated_at\": \"2026-08-18T07:49:28.000000Z\", \"description\": \"lomba\"}', '{\"id\": 1, \"name\": \"lomba agustusan\", \"status\": \"scheduled\", \"end_time\": \"17:00:00\", \"location\": \"lapangan merdeka \", \"created_at\": \"2026-08-18T07:48:40.000000Z\", \"created_by\": 1, \"deleted_at\": null, \"event_date\": \"2026-08-15T17:00:00.000000Z\", \"start_time\": \"07:00:00\", \"updated_at\": \"2026-08-18T07:51:06.000000Z\", \"description\": \"lomba\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:51:06', '2026-08-18 14:51:06'),
(6, 1, 'created', 'App\\Models\\Event', 2, 'Event created', NULL, '{\"id\": 2, \"name\": \"pkl\", \"status\": \"draft\", \"end_time\": \"15:00\", \"location\": \"bandung\", \"created_at\": \"2026-08-18T07:52:17.000000Z\", \"created_by\": 1, \"event_date\": \"2026-08-18T17:00:00.000000Z\", \"start_time\": \"07:00\", \"updated_at\": \"2026-08-18T07:52:17.000000Z\", \"description\": \"belajar\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:52:17', '2026-08-18 14:52:17'),
(7, 1, 'updated', 'App\\Models\\Event', 2, 'Event updated', '{\"id\": 2, \"name\": \"pkl\", \"status\": \"draft\", \"end_time\": \"15:00:00\", \"location\": \"bandung\", \"created_at\": \"2026-08-18T07:52:17.000000Z\", \"created_by\": 1, \"deleted_at\": null, \"event_date\": \"2026-08-18T17:00:00.000000Z\", \"start_time\": \"07:00:00\", \"updated_at\": \"2026-08-18T07:52:17.000000Z\", \"description\": \"belajar\"}', '{\"id\": 2, \"name\": \"pkl\", \"status\": \"ongoing\", \"end_time\": \"15:00:00\", \"location\": \"bandung\", \"created_at\": \"2026-08-18T07:52:17.000000Z\", \"created_by\": 1, \"deleted_at\": null, \"event_date\": \"2026-08-17T17:00:00.000000Z\", \"start_time\": \"07:00:00\", \"updated_at\": \"2026-08-18T07:52:58.000000Z\", \"description\": \"belajar\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:52:58', '2026-08-18 14:52:58'),
(8, 1, 'checked_in', 'App\\Models\\Visit', 1, 'Visitor checked in', NULL, '{\"id\": 1, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Mengikuti event: pkl\", \"check_in\": \"2026-08-18T07:53:16.000000Z\", \"event_id\": \"2\", \"created_at\": \"2026-08-18T07:53:16.000000Z\", \"updated_at\": \"2026-08-18T07:53:16.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:53:16', '2026-08-18 14:53:16'),
(9, 1, 'checked_out', 'App\\Models\\Visit', 1, 'Visitor checked out', '{\"id\": 1, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Mengikuti event: pkl\", \"check_in\": \"2026-08-18T07:53:16.000000Z\", \"event_id\": 2, \"check_out\": null, \"created_at\": \"2026-08-18T07:53:16.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T07:53:16.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '{\"id\": 1, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Mengikuti event: pkl\", \"check_in\": \"2026-08-18T07:53:16.000000Z\", \"event_id\": 2, \"check_out\": \"2026-08-18T07:53:51.000000Z\", \"created_at\": \"2026-08-18T07:53:16.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T07:53:51.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:53:51', '2026-08-18 14:53:51'),
(10, 1, 'checked_in', 'App\\Models\\Visit', 2, 'Visitor checked in', NULL, '{\"id\": 2, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T07:53:58.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-18T07:53:58.000000Z\", \"updated_at\": \"2026-08-18T07:53:58.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:53:58', '2026-08-18 14:53:58'),
(11, 1, 'checked_out', 'App\\Models\\Visit', 2, 'Visitor checked out', '{\"id\": 2, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T07:53:58.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-18T07:53:58.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T07:53:58.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '{\"id\": 2, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T07:53:58.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-18T07:54:38.000000Z\", \"created_at\": \"2026-08-18T07:53:58.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T07:54:38.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:54:38', '2026-08-18 14:54:38'),
(12, 1, 'checked_in', 'App\\Models\\Visit', 3, 'Visitor checked in', NULL, '{\"id\": 3, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Mengikuti event: pkl\", \"check_in\": \"2026-08-18T07:54:54.000000Z\", \"event_id\": \"2\", \"created_at\": \"2026-08-18T07:54:54.000000Z\", \"updated_at\": \"2026-08-18T07:54:54.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:54:54', '2026-08-18 14:54:54'),
(13, 1, 'checked_out', 'App\\Models\\Visit', 3, 'Visitor checked out', '{\"id\": 3, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Mengikuti event: pkl\", \"check_in\": \"2026-08-18T07:54:54.000000Z\", \"event_id\": 2, \"check_out\": null, \"created_at\": \"2026-08-18T07:54:54.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T07:54:54.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '{\"id\": 3, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Mengikuti event: pkl\", \"check_in\": \"2026-08-18T07:54:54.000000Z\", \"event_id\": 2, \"check_out\": \"2026-08-18T07:58:40.000000Z\", \"created_at\": \"2026-08-18T07:54:54.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T07:58:40.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 14:58:40', '2026-08-18 14:58:40'),
(14, 1, 'checked_in', 'App\\Models\\Visit', 4, 'Visitor checked in', NULL, '{\"id\": 4, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T08:46:39.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-18T08:46:39.000000Z\", \"updated_at\": \"2026-08-18T08:46:39.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 15:46:40', '2026-08-18 15:46:40'),
(15, 1, 'checked_out', 'App\\Models\\Visit', 4, 'Visitor checked out', '{\"id\": 4, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T08:46:39.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-18T08:46:39.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T08:46:39.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '{\"id\": 4, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T08:46:39.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-18T08:50:33.000000Z\", \"created_at\": \"2026-08-18T08:46:39.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T08:50:33.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 15:50:33', '2026-08-18 15:50:33'),
(16, 2, 'checked_in', 'App\\Models\\Visit', 5, 'Visitor checked in', NULL, '{\"id\": 5, \"status\": \"IN\", \"meet_to\": \"fas\", \"purpose\": \"dasdas\", \"check_in\": \"2026-08-18T08:53:54.000000Z\", \"event_id\": \"2\", \"created_at\": \"2026-08-18T08:53:54.000000Z\", \"updated_at\": \"2026-08-18T08:53:54.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 15:53:54', '2026-08-18 15:53:54'),
(17, 2, 'checked_out', 'App\\Models\\Visit', 5, 'Visitor checked out', '{\"id\": 5, \"status\": \"IN\", \"meet_to\": \"fas\", \"purpose\": \"dasdas\", \"check_in\": \"2026-08-18T08:53:54.000000Z\", \"event_id\": 2, \"check_out\": null, \"created_at\": \"2026-08-18T08:53:54.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T08:53:54.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 2}', '{\"id\": 5, \"status\": \"OUT\", \"meet_to\": \"fas\", \"purpose\": \"dasdas\", \"check_in\": \"2026-08-18T08:53:54.000000Z\", \"event_id\": 2, \"check_out\": \"2026-08-18T09:00:28.000000Z\", \"created_at\": \"2026-08-18T08:53:54.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:00:28.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:00:28', '2026-08-18 16:00:28'),
(18, 2, 'checked_in', 'App\\Models\\Visit', 6, 'Visitor checked in', NULL, '{\"id\": 6, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:00:30.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-18T09:00:30.000000Z\", \"updated_at\": \"2026-08-18T09:00:30.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:00:30', '2026-08-18 16:00:30'),
(19, 2, 'checked_in', 'App\\Models\\Visit', 7, 'Visitor checked in', NULL, '{\"id\": 7, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:00:36.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-18T09:00:36.000000Z\", \"updated_at\": \"2026-08-18T09:00:36.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:00:36', '2026-08-18 16:00:36'),
(20, 2, 'checked_out', 'App\\Models\\Visit', 7, 'Visitor checked out', '{\"id\": 7, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:00:36.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-18T09:00:36.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:00:36.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '{\"id\": 7, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:00:36.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-18T09:08:03.000000Z\", \"created_at\": \"2026-08-18T09:00:36.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:08:03.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:08:03', '2026-08-18 16:08:03'),
(21, 2, 'checked_in', 'App\\Models\\Visit', 8, 'Visitor checked in', NULL, '{\"id\": 8, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-18T09:08:08.000000Z\", \"event_id\": 2, \"created_at\": \"2026-08-18T09:08:08.000000Z\", \"updated_at\": \"2026-08-18T09:08:08.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:08:08', '2026-08-18 16:08:08'),
(22, 2, 'checked_out', 'App\\Models\\Visit', 8, 'Visitor checked out', '{\"id\": 8, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-18T09:08:08.000000Z\", \"event_id\": 2, \"check_out\": null, \"created_at\": \"2026-08-18T09:08:08.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:08:08.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '{\"id\": 8, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-18T09:08:08.000000Z\", \"event_id\": 2, \"check_out\": \"2026-08-18T09:08:23.000000Z\", \"created_at\": \"2026-08-18T09:08:08.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:08:23.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:08:23', '2026-08-18 16:08:23'),
(23, 2, 'checked_in', 'App\\Models\\Visit', 9, 'Visitor checked in', NULL, '{\"id\": 9, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-18T09:08:51.000000Z\", \"event_id\": 2, \"created_at\": \"2026-08-18T09:08:51.000000Z\", \"updated_at\": \"2026-08-18T09:08:51.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:08:51', '2026-08-18 16:08:51'),
(24, 2, 'checked_out', 'App\\Models\\Visit', 9, 'Visitor checked out', '{\"id\": 9, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-18T09:08:51.000000Z\", \"event_id\": 2, \"check_out\": null, \"created_at\": \"2026-08-18T09:08:51.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:08:51.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '{\"id\": 9, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-18T09:08:51.000000Z\", \"event_id\": 2, \"check_out\": \"2026-08-18T09:08:56.000000Z\", \"created_at\": \"2026-08-18T09:08:51.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:08:56.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:08:56', '2026-08-18 16:08:56'),
(25, 2, 'checked_out', 'App\\Models\\Visit', 6, 'Visitor checked out', '{\"id\": 6, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:00:30.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-18T09:00:30.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:00:30.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 2}', '{\"id\": 6, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:00:30.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-18T09:09:06.000000Z\", \"created_at\": \"2026-08-18T09:00:30.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:09:06.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:09:06', '2026-08-18 16:09:06'),
(26, 2, 'checked_in', 'App\\Models\\Visit', 10, 'Visitor checked in', NULL, '{\"id\": 10, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:13:54.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-18T09:13:54.000000Z\", \"updated_at\": \"2026-08-18T09:13:54.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:13:54', '2026-08-18 16:13:54'),
(27, 2, 'checked_out', 'App\\Models\\Visit', 10, 'Visitor checked out', '{\"id\": 10, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:13:54.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-18T09:13:54.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:13:54.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '{\"id\": 10, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:13:54.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-18T09:14:02.000000Z\", \"created_at\": \"2026-08-18T09:13:54.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:14:02.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:14:02', '2026-08-18 16:14:02'),
(28, 2, 'checked_in', 'App\\Models\\Visit', 11, 'Visitor checked in', NULL, '{\"id\": 11, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:14:12.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-18T09:14:12.000000Z\", \"updated_at\": \"2026-08-18T09:14:12.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:14:12', '2026-08-18 16:14:12'),
(29, 2, 'checked_out', 'App\\Models\\Visit', 11, 'Visitor checked out', '{\"id\": 11, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:14:12.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-18T09:14:12.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:14:12.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '{\"id\": 11, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:14:12.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-18T09:14:21.000000Z\", \"created_at\": \"2026-08-18T09:14:12.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:14:21.000000Z\", \"visitor_id\": 6, \"receptionist_id\": 2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-18 16:14:21', '2026-08-18 16:14:21'),
(30, 1, 'checked_in', 'App\\Models\\Visit', 12, 'Visitor checked in', NULL, '{\"id\": 12, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:54:05.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-18T09:54:05.000000Z\", \"updated_at\": \"2026-08-18T09:54:05.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 16:54:05', '2026-08-18 16:54:05'),
(31, 1, 'checked_out', 'App\\Models\\Visit', 12, 'Visitor checked out', '{\"id\": 12, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:54:05.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-18T09:54:05.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-18T09:54:05.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 1}', '{\"id\": 12, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-18T09:54:05.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-19T02:46:38.000000Z\", \"created_at\": \"2026-08-18T09:54:05.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T02:46:38.000000Z\", \"visitor_id\": 7, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 09:46:38', '2026-08-19 09:46:38'),
(32, 1, 'checked_in', 'App\\Models\\Visit', 13, 'Visitor checked in', NULL, '{\"id\": 13, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T03:02:08.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-19T03:02:08.000000Z\", \"updated_at\": \"2026-08-19T03:02:08.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 10:02:08', '2026-08-19 10:02:08'),
(33, 1, 'checked_out', 'App\\Models\\Visit', 13, 'Visitor checked out', '{\"id\": 13, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T03:02:08.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-19T03:02:08.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T03:02:08.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '{\"id\": 13, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T03:02:08.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-19T03:03:45.000000Z\", \"created_at\": \"2026-08-19T03:02:08.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T03:03:45.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 10:03:45', '2026-08-19 10:03:45'),
(34, 1, 'checked_in', 'App\\Models\\Visit', 14, 'Visitor checked in', NULL, '{\"id\": 14, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T03:04:11.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-19T03:04:11.000000Z\", \"updated_at\": \"2026-08-19T03:04:11.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 10:04:11', '2026-08-19 10:04:11'),
(35, 1, 'checked_out', 'App\\Models\\Visit', 14, 'Visitor checked out', '{\"id\": 14, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T03:04:11.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-19T03:04:11.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T03:04:11.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '{\"id\": 14, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T03:04:11.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-19T04:16:53.000000Z\", \"created_at\": \"2026-08-19T03:04:11.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T04:16:53.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 11:16:53', '2026-08-19 11:16:53'),
(36, 1, 'checked_in', 'App\\Models\\Visit', 15, 'Visitor checked in', NULL, '{\"id\": 15, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T04:17:04.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-19T04:17:04.000000Z\", \"updated_at\": \"2026-08-19T04:17:04.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 11:17:04', '2026-08-19 11:17:04'),
(37, 1, 'checked_in', 'App\\Models\\Visit', 16, 'Visitor checked in', NULL, '{\"id\": 16, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T06:08:18.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-19T06:08:18.000000Z\", \"updated_at\": \"2026-08-19T06:08:18.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 13:08:18', '2026-08-19 13:08:18'),
(38, 1, 'checked_out', 'App\\Models\\Visit', 16, 'Visitor checked out', '{\"id\": 16, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T06:08:18.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-19T06:08:18.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T06:08:18.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '{\"id\": 16, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T06:08:18.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-19T06:08:24.000000Z\", \"created_at\": \"2026-08-19T06:08:18.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T06:08:24.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 13:08:24', '2026-08-19 13:08:24'),
(39, 1, 'checked_in', 'App\\Models\\Visit', 17, 'Visitor checked in', NULL, '{\"id\": 17, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T06:08:27.000000Z\", \"event_id\": null, \"created_at\": \"2026-08-19T06:08:27.000000Z\", \"updated_at\": \"2026-08-19T06:08:27.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 13:08:27', '2026-08-19 13:08:27'),
(40, 1, 'checked_out', 'App\\Models\\Visit', 17, 'Visitor checked out', '{\"id\": 17, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T06:08:27.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-19T06:08:27.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T06:08:27.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '{\"id\": 17, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T06:08:27.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-19T06:08:51.000000Z\", \"created_at\": \"2026-08-19T06:08:27.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T06:08:51.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 13:08:51', '2026-08-19 13:08:51'),
(41, 1, 'checked_out', 'App\\Models\\Visit', 15, 'Visitor checked out', '{\"id\": 15, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T04:17:04.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-08-19T04:17:04.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T04:17:04.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '{\"id\": 15, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T04:17:04.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-19T06:09:00.000000Z\", \"created_at\": \"2026-08-19T04:17:04.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T06:09:00.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 13:09:00', '2026-08-19 13:09:00'),
(42, 1, 'checked_in', 'App\\Models\\Visit', 18, 'Visitor checked in', NULL, '{\"id\": 18, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-19T06:09:13.000000Z\", \"event_id\": 2, \"created_at\": \"2026-08-19T06:09:13.000000Z\", \"updated_at\": \"2026-08-19T06:09:13.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 13:09:13', '2026-08-19 13:09:13'),
(43, 1, 'checked_out', 'App\\Models\\Visit', 18, 'Visitor checked out', '{\"id\": 18, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-19T06:09:13.000000Z\", \"event_id\": 2, \"check_out\": null, \"created_at\": \"2026-08-19T06:09:13.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T06:09:13.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '{\"id\": 18, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-19T06:09:13.000000Z\", \"event_id\": 2, \"check_out\": \"2026-08-19T06:09:19.000000Z\", \"created_at\": \"2026-08-19T06:09:13.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T06:09:19.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 13:09:19', '2026-08-19 13:09:19'),
(44, 1, 'checked_in', 'App\\Models\\Visit', 19, 'Visitor checked in', NULL, '{\"id\": 19, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-19T06:09:22.000000Z\", \"event_id\": 2, \"created_at\": \"2026-08-19T06:09:22.000000Z\", \"updated_at\": \"2026-08-19T06:09:22.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-19 13:09:22', '2026-08-19 13:09:22'),
(45, 1, 'checked_out', 'App\\Models\\Visit', 19, 'Visitor checked out', '{\"id\": 19, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-19T06:09:22.000000Z\", \"event_id\": 2, \"check_out\": null, \"created_at\": \"2026-08-19T06:09:22.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T06:09:22.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '{\"id\": 19, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Check-In Event: pkl\", \"check_in\": \"2026-08-19T06:09:22.000000Z\", \"event_id\": 2, \"check_out\": \"2026-08-22T02:43:48.000000Z\", \"created_at\": \"2026-08-19T06:09:22.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-22T02:43:48.000000Z\", \"visitor_id\": 10, \"visitor_name\": \"asdfghj\", \"visitor_phone\": \"0987654\", \"receptionist_id\": 1, \"visitor_company\": \"ko\"}', '192.168.175.79', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-22 09:43:48', '2026-08-22 09:43:48'),
(46, 1, 'deleted', 'App\\Models\\Visit', 13, 'Visit deleted by admin', '{\"id\": 13, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T03:02:08.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-19T03:03:45.000000Z\", \"created_at\": \"2026-08-19T03:02:08.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T03:03:45.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', NULL, '192.168.175.79', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-22 09:47:03', '2026-08-22 09:47:03'),
(47, 1, 'deleted', 'App\\Models\\Visit', 14, 'Visit deleted by admin', '{\"id\": 14, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"Quick Check-In\", \"check_in\": \"2026-08-19T03:04:11.000000Z\", \"event_id\": null, \"check_out\": \"2026-08-19T04:16:53.000000Z\", \"created_at\": \"2026-08-19T03:04:11.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-08-19T04:16:53.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', NULL, '192.168.175.79', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-22 09:47:08', '2026-08-22 09:47:08'),
(48, 1, 'updated', 'App\\Models\\User', 1, 'User updated by admin', '{\"id\": 1, \"name\": \"Administrator GLOSINDO\", \"role\": \"admin\", \"email\": \"admin@glosindo.com\", \"created_at\": \"2026-08-18T07:36:53.000000Z\", \"updated_at\": \"2026-08-18T07:36:53.000000Z\", \"disabled_features\": null}', '{\"id\": 1, \"name\": \"Administrator GLOSINDO\", \"role\": \"admin\", \"email\": \"admin@glosindo.com\", \"created_at\": \"2026-08-18T07:36:53.000000Z\", \"updated_at\": \"2026-09-02T09:28:35.000000Z\", \"disabled_features\": []}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-02 16:28:35', '2026-09-02 16:28:35'),
(49, 1, 'checked_in_public', 'App\\Models\\Visit', 20, 'Public kiosk', NULL, '{\"id\": 20, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar bulanan wifi\", \"check_in\": \"2026-09-07T06:41:57.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-07T06:41:57.000000Z\", \"updated_at\": \"2026-09-07T06:41:57.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": null, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 13:41:57', '2026-09-07 13:41:57'),
(50, 1, 'created', 'App\\Models\\Event', 3, 'Event created', NULL, '{\"id\": 3, \"code\": \"tes-9ydth\", \"name\": \"tes\", \"status\": \"scheduled\", \"end_date\": \"2026-09-08T17:00:00.000000Z\", \"end_time\": \"17:00\", \"location\": \"lapangan merdeka \", \"is_active\": false, \"created_at\": \"2026-09-07T06:56:08.000000Z\", \"created_by\": 1, \"event_date\": \"2026-09-08T17:00:00.000000Z\", \"start_date\": \"2026-09-08T17:00:00.000000Z\", \"start_time\": \"08:00\", \"updated_at\": \"2026-09-07T06:56:08.000000Z\", \"description\": \"tesss\", \"is_finished\": false, \"computed_status\": \"scheduled\", \"registration_end_at\": \"2026-09-09T06:55:00.000000Z\", \"registration_start_at\": \"2026-09-07T06:54:00.000000Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 13:56:08', '2026-09-07 13:56:08'),
(51, 1, 'checked_out', 'App\\Models\\Visit', 20, 'Visitor checked out', '{\"id\": 20, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar bulanan wifi\", \"check_in\": \"2026-09-07T06:41:57.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-09-07T06:41:57.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-07T06:41:57.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": null, \"visitor_company\": \"halo\"}', '{\"id\": 20, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"bayar bulanan wifi\", \"check_in\": \"2026-09-07T06:41:57.000000Z\", \"event_id\": null, \"check_out\": \"2026-09-07T06:57:59.000000Z\", \"created_at\": \"2026-09-07T06:41:57.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-07T06:57:59.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": null, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 13:57:59', '2026-09-07 13:57:59'),
(52, 1, 'checked_in', 'App\\Models\\Visit', 21, 'Visitor checked in for Event', NULL, '{\"id\": 21, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-07T06:58:03.000000Z\", \"event_id\": 3, \"created_at\": \"2026-09-07T06:58:03.000000Z\", \"updated_at\": \"2026-09-07T06:58:03.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 13:58:03', '2026-09-07 13:58:03'),
(53, 1, 'deleted', 'App\\Models\\Event', 1, 'Event deleted', '{\"id\": 1, \"code\": \"EVT-H0UQJE\", \"name\": \"lomba agustusan\", \"status\": \"active\", \"end_date\": \"2026-08-15T17:00:00.000000Z\", \"end_time\": \"17:00:00\", \"location\": \"lapangan merdeka \", \"is_active\": false, \"created_at\": \"2026-08-18T07:48:40.000000Z\", \"created_by\": 1, \"deleted_at\": null, \"event_date\": \"2026-08-15T17:00:00.000000Z\", \"start_date\": \"2026-08-15T17:00:00.000000Z\", \"start_time\": \"07:00:00\", \"updated_at\": \"2026-08-18T07:51:06.000000Z\", \"description\": \"lomba\", \"is_finished\": true, \"computed_status\": \"finished\", \"registration_end_at\": null, \"registration_start_at\": null}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:06:13', '2026-09-07 14:06:13'),
(54, 1, 'auto_checked_out', 'App\\Models\\Visit', 21, 'Auto checkout by public kiosk', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:10:33', '2026-09-07 14:10:33'),
(55, 1, 'checked_in_public', 'App\\Models\\Visit', 22, 'Public kiosk', NULL, '{\"id\": 22, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"tes\", \"check_in\": \"2026-09-07T07:10:33.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-07T07:10:33.000000Z\", \"updated_at\": \"2026-09-07T07:10:33.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": null, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:10:33', '2026-09-07 14:10:33'),
(56, 1, 'checked_out', 'App\\Models\\Visit', 22, 'Visitor checked out', '{\"id\": 22, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"tes\", \"check_in\": \"2026-09-07T07:10:33.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-09-07T07:10:33.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-07T07:10:33.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": null, \"visitor_company\": \"halo\"}', '{\"id\": 22, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"tes\", \"check_in\": \"2026-09-07T07:10:33.000000Z\", \"event_id\": null, \"check_out\": \"2026-09-07T07:15:57.000000Z\", \"created_at\": \"2026-09-07T07:10:33.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-07T07:15:57.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": null, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:15:57', '2026-09-07 14:15:57'),
(57, 1, 'checked_in', 'App\\Models\\Visit', 23, 'Visitor checked in for Event', NULL, '{\"id\": 23, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-07T07:15:59.000000Z\", \"event_id\": 3, \"created_at\": \"2026-09-07T07:15:59.000000Z\", \"updated_at\": \"2026-09-07T07:15:59.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:15:59', '2026-09-07 14:15:59'),
(58, 1, 'checked_in', 'App\\Models\\Visit', 24, 'Event check-in: tes', NULL, '{\"id\": 24, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-07T07:19:46.000000Z\", \"event_id\": 3, \"created_at\": \"2026-09-07T07:19:46.000000Z\", \"updated_at\": \"2026-09-07T07:19:46.000000Z\", \"visitor_id\": 11, \"receptionist_id\": 1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:19:46', '2026-09-07 14:19:46'),
(59, 1, 'checked_out', 'App\\Models\\Visit', 24, 'Event check-out: tes', '{\"id\": 24, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-07T07:19:46.000000Z\", \"event_id\": 3, \"check_out\": null, \"created_at\": \"2026-09-07T07:19:46.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-07T07:19:46.000000Z\", \"visitor_id\": 11, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '{\"id\": 24, \"status\": \"OUT\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-07T07:19:46.000000Z\", \"event_id\": 3, \"check_out\": \"2026-09-07T07:19:51.000000Z\", \"created_at\": \"2026-09-07T07:19:46.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-07T07:19:51.000000Z\", \"visitor_id\": 11, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:19:52', '2026-09-07 14:19:52'),
(60, 1, 'created', 'App\\Models\\GameEvent', 1, 'Game event created', NULL, '{\"id\": 1, \"name\": \"lomba \", \"status\": \"active\", \"end_date\": \"2026-09-09T17:00:00.000000Z\", \"created_at\": \"2026-09-07T07:26:10.000000Z\", \"created_by\": 1, \"start_date\": \"2026-09-06T17:00:00.000000Z\", \"updated_at\": \"2026-09-07T07:26:10.000000Z\", \"description\": \"tes\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:26:10', '2026-09-07 14:26:10'),
(61, 1, 'created', 'App\\Models\\PointQrCode', 1, 'Point QR code created', NULL, '{\"id\": 1, \"token\": \"uqOLxeXoibFEX3XcRwpfiNapWVgByI3t\", \"status\": \"active\", \"created_at\": \"2026-09-07T07:26:30.000000Z\", \"updated_at\": \"2026-09-07T07:26:30.000000Z\", \"point_value\": 100, \"game_event_id\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '2026-09-07 14:26:30', '2026-09-07 14:26:30'),
(62, 1, 'checked_out', 'App\\Models\\Visit', 23, 'Visitor checked out', '{\"id\": 23, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-07T07:15:59.000000Z\", \"event_id\": 3, \"check_out\": null, \"created_at\": \"2026-09-07T07:15:59.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-07T07:15:59.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '{\"id\": 23, \"status\": \"OUT\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-07T07:15:59.000000Z\", \"event_id\": 3, \"check_out\": \"2026-09-08T01:34:19.000000Z\", \"created_at\": \"2026-09-07T07:15:59.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T01:34:19.000000Z\", \"visitor_id\": 9, \"visitor_name\": \"rafi\", \"visitor_phone\": \"087676734\", \"receptionist_id\": 1, \"visitor_company\": \"halo\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 08:34:19', '2026-09-08 08:34:19'),
(63, 1, 'checked_in_public', 'App\\Models\\Visit', 25, 'Public kiosk', NULL, '{\"id\": 25, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar wifi\", \"check_in\": \"2026-09-08T01:37:49.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T01:37:49.000000Z\", \"updated_at\": \"2026-09-08T01:37:49.000000Z\", \"visitor_id\": 12, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08765256525\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 08:37:49', '2026-09-08 08:37:49');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `model_type`, `model_id`, `description`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(64, 1, 'auto_checked_out', 'App\\Models\\Visit', 25, 'Auto checkout by public kiosk', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 08:38:08', '2026-09-08 08:38:08'),
(65, 1, 'checked_in_public', 'App\\Models\\Visit', 26, 'Public kiosk', NULL, '{\"id\": 26, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar wifi\", \"check_in\": \"2026-09-08T01:38:08.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T01:38:08.000000Z\", \"updated_at\": \"2026-09-08T01:38:08.000000Z\", \"visitor_id\": 12, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08765256525\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 08:38:08', '2026-09-08 08:38:08'),
(66, 1, 'auto_checked_out', 'App\\Models\\Visit', 26, 'Auto checkout by public kiosk', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:09:01', '2026-09-08 10:09:01'),
(67, 1, 'checked_in_public', 'App\\Models\\Visit', 27, 'Public kiosk', NULL, '{\"id\": 27, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar wifi\", \"check_in\": \"2026-09-08T03:09:01.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T03:09:01.000000Z\", \"updated_at\": \"2026-09-08T03:09:01.000000Z\", \"visitor_id\": 12, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08765256525\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:09:01', '2026-09-08 10:09:01'),
(68, 1, 'auto_checked_out', 'App\\Models\\Visit', 27, 'Auto checkout by public kiosk', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:19:11', '2026-09-08 10:19:11'),
(69, 1, 'checked_in_public', 'App\\Models\\Visit', 28, 'Public kiosk', NULL, '{\"id\": 28, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"aloo\", \"check_in\": \"2026-09-08T03:19:11.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T03:19:11.000000Z\", \"updated_at\": \"2026-09-08T03:19:11.000000Z\", \"visitor_id\": 12, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08765256525\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:19:11', '2026-09-08 10:19:11'),
(70, 1, 'auto_checked_out', 'App\\Models\\Visit', 28, 'Auto checkout by public kiosk', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:26:51', '2026-09-08 10:26:51'),
(71, 1, 'checked_in_public', 'App\\Models\\Visit', 29, 'Public kiosk', NULL, '{\"id\": 29, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"tess\", \"check_in\": \"2026-09-08T03:26:51.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T03:26:51.000000Z\", \"updated_at\": \"2026-09-08T03:26:51.000000Z\", \"visitor_id\": 12, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08765256525\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:26:51', '2026-09-08 10:26:51'),
(72, 1, 'checked_out', 'App\\Models\\Visit', 29, 'Visitor checked out', '{\"id\": 29, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"tess\", \"check_in\": \"2026-09-08T03:26:51.000000Z\", \"event_id\": null, \"check_out\": null, \"created_at\": \"2026-09-08T03:26:51.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T03:26:51.000000Z\", \"visitor_id\": 12, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08765256525\", \"receptionist_id\": null, \"visitor_company\": null}', '{\"id\": 29, \"status\": \"OUT\", \"meet_to\": \"-\", \"purpose\": \"tess\", \"check_in\": \"2026-09-08T03:26:51.000000Z\", \"event_id\": null, \"check_out\": \"2026-09-08T03:44:43.000000Z\", \"created_at\": \"2026-09-08T03:26:51.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T03:44:43.000000Z\", \"visitor_id\": 12, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08765256525\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:44:43', '2026-09-08 10:44:43'),
(73, 1, 'checked_in_public', 'App\\Models\\Visit', 30, 'Public kiosk', NULL, '{\"id\": 30, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar wifi\", \"check_in\": \"2026-09-08T03:46:04.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T03:46:04.000000Z\", \"updated_at\": \"2026-09-08T03:46:04.000000Z\", \"visitor_id\": 13, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08572425523\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:46:04', '2026-09-08 10:46:04'),
(74, 1, 'auto_checked_out', 'App\\Models\\Visit', 30, 'Auto checkout by public kiosk', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:46:21', '2026-09-08 10:46:21'),
(75, 1, 'checked_in_public', 'App\\Models\\Visit', 31, 'Public kiosk', NULL, '{\"id\": 31, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar wifi\", \"check_in\": \"2026-09-08T03:46:21.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T03:46:21.000000Z\", \"updated_at\": \"2026-09-08T03:46:21.000000Z\", \"visitor_id\": 13, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08572425523\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 10:46:21', '2026-09-08 10:46:21'),
(76, 1, 'auto_checked_out', 'App\\Models\\Visit', 31, 'Auto checkout by public kiosk', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:06:49', '2026-09-08 11:06:49'),
(77, 1, 'checked_in_public', 'App\\Models\\Visit', 32, 'Public kiosk', NULL, '{\"id\": 32, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Meeting\", \"check_in\": \"2026-09-08T04:06:49.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T04:06:49.000000Z\", \"updated_at\": \"2026-09-08T04:06:49.000000Z\", \"visitor_id\": 13, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08572425523\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:06:50', '2026-09-08 11:06:50'),
(78, 1, 'checked_in', 'App\\Models\\Visit', 33, 'Event check-in: tes', NULL, '{\"id\": 33, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:37:58.000000Z\", \"event_id\": 3, \"created_at\": \"2026-09-08T04:37:58.000000Z\", \"updated_at\": \"2026-09-08T04:37:58.000000Z\", \"visitor_id\": 11, \"receptionist_id\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:37:58', '2026-09-08 11:37:58'),
(79, 1, 'checked_out', 'App\\Models\\Visit', 33, 'Event check-out: tes', '{\"id\": 33, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:37:58.000000Z\", \"event_id\": 3, \"check_out\": null, \"created_at\": \"2026-09-08T04:37:58.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:37:58.000000Z\", \"visitor_id\": 11, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '{\"id\": 33, \"status\": \"OUT\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:37:58.000000Z\", \"event_id\": 3, \"check_out\": \"2026-09-08T04:38:05.000000Z\", \"created_at\": \"2026-09-08T04:37:58.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:38:05.000000Z\", \"visitor_id\": 11, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:38:05', '2026-09-08 11:38:05'),
(80, 1, 'checked_in', 'App\\Models\\Visit', 34, 'Event check-in: tes', NULL, '{\"id\": 34, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:11.000000Z\", \"event_id\": 3, \"created_at\": \"2026-09-08T04:38:11.000000Z\", \"updated_at\": \"2026-09-08T04:38:11.000000Z\", \"visitor_id\": 9, \"receptionist_id\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:38:11', '2026-09-08 11:38:11'),
(81, 1, 'checked_out', 'App\\Models\\Visit', 34, 'Event check-out: tes', '{\"id\": 34, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:11.000000Z\", \"event_id\": 3, \"check_out\": null, \"created_at\": \"2026-09-08T04:38:11.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:38:11.000000Z\", \"visitor_id\": 9, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '{\"id\": 34, \"status\": \"OUT\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:11.000000Z\", \"event_id\": 3, \"check_out\": \"2026-09-08T04:38:15.000000Z\", \"created_at\": \"2026-09-08T04:38:11.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:38:15.000000Z\", \"visitor_id\": 9, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:38:15', '2026-09-08 11:38:15'),
(82, 1, 'checked_in', 'App\\Models\\Visit', 35, 'Event check-in: tes', NULL, '{\"id\": 35, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:30.000000Z\", \"event_id\": 3, \"created_at\": \"2026-09-08T04:38:30.000000Z\", \"updated_at\": \"2026-09-08T04:38:30.000000Z\", \"visitor_id\": 9, \"receptionist_id\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:38:30', '2026-09-08 11:38:30'),
(83, 1, 'checked_in', 'App\\Models\\Visit', 36, 'Event check-in: tes', NULL, '{\"id\": 36, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:39.000000Z\", \"event_id\": 3, \"created_at\": \"2026-09-08T04:38:39.000000Z\", \"updated_at\": \"2026-09-08T04:38:39.000000Z\", \"visitor_id\": 11, \"receptionist_id\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:38:39', '2026-09-08 11:38:39'),
(84, 1, 'checked_out', 'App\\Models\\Visit', 35, 'Event check-out: tes', '{\"id\": 35, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:30.000000Z\", \"event_id\": 3, \"check_out\": null, \"created_at\": \"2026-09-08T04:38:30.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:38:30.000000Z\", \"visitor_id\": 9, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '{\"id\": 35, \"status\": \"OUT\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:30.000000Z\", \"event_id\": 3, \"check_out\": \"2026-09-08T04:38:45.000000Z\", \"created_at\": \"2026-09-08T04:38:30.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:38:45.000000Z\", \"visitor_id\": 9, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:38:45', '2026-09-08 11:38:45'),
(85, 1, 'checked_out', 'App\\Models\\Visit', 36, 'Event check-out: tes', '{\"id\": 36, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:39.000000Z\", \"event_id\": 3, \"check_out\": null, \"created_at\": \"2026-09-08T04:38:39.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:38:39.000000Z\", \"visitor_id\": 11, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '{\"id\": 36, \"status\": \"OUT\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:39.000000Z\", \"event_id\": 3, \"check_out\": \"2026-09-08T04:38:50.000000Z\", \"created_at\": \"2026-09-08T04:38:39.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:38:50.000000Z\", \"visitor_id\": 11, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:38:50', '2026-09-08 11:38:50'),
(86, 1, 'checked_in', 'App\\Models\\Visit', 37, 'Event check-in: tes', NULL, '{\"id\": 37, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:55.000000Z\", \"event_id\": 3, \"created_at\": \"2026-09-08T04:38:55.000000Z\", \"updated_at\": \"2026-09-08T04:38:55.000000Z\", \"visitor_id\": 9, \"receptionist_id\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:38:55', '2026-09-08 11:38:55'),
(87, 1, 'checked_out', 'App\\Models\\Visit', 37, 'Event check-out: tes', '{\"id\": 37, \"status\": \"IN\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:55.000000Z\", \"event_id\": 3, \"check_out\": null, \"created_at\": \"2026-09-08T04:38:55.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:38:55.000000Z\", \"visitor_id\": 9, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '{\"id\": 37, \"status\": \"OUT\", \"meet_to\": \"Event: tes\", \"purpose\": \"Event: tes\", \"check_in\": \"2026-09-08T04:38:55.000000Z\", \"event_id\": 3, \"check_out\": \"2026-09-08T04:39:00.000000Z\", \"created_at\": \"2026-09-08T04:38:55.000000Z\", \"deleted_at\": null, \"updated_at\": \"2026-09-08T04:39:00.000000Z\", \"visitor_id\": 9, \"visitor_name\": null, \"visitor_phone\": null, \"receptionist_id\": 1, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 11:39:00', '2026-09-08 11:39:00'),
(88, 1, 'auto_checked_out', 'App\\Models\\Visit', 32, 'Auto checkout by public kiosk', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 15:59:49', '2026-09-08 15:59:49'),
(89, 1, 'checked_in_public', 'App\\Models\\Visit', 38, 'Public kiosk', NULL, '{\"id\": 38, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"Meeting\", \"check_in\": \"2026-09-08T08:59:49.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-08T08:59:49.000000Z\", \"updated_at\": \"2026-09-08T08:59:49.000000Z\", \"visitor_id\": 13, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08572425523\", \"receptionist_id\": null, \"visitor_company\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-08 15:59:49', '2026-09-08 15:59:49'),
(90, 1, 'auto_checked_out', 'App\\Models\\Visit', 38, 'Auto checkout by public kiosk', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-09 10:32:31', '2026-09-09 10:32:31'),
(91, 1, 'checked_in_public', 'App\\Models\\Visit', 39, 'Public kiosk', NULL, '{\"id\": 39, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar wifi\", \"check_in\": \"2026-09-09T03:32:31.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-09T03:32:31.000000Z\", \"updated_at\": \"2026-09-09T03:32:31.000000Z\", \"visitor_id\": 13, \"visitor_name\": \"rafie\", \"visitor_phone\": \"08572425523\", \"receptionist_id\": null, \"visitor_company\": null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-09 10:32:31', '2026-09-09 10:32:31'),
(92, 1, 'checked_in_public', 'App\\Models\\Visit', 40, 'Public kiosk', NULL, '{\"id\": 40, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar wifi\", \"check_in\": \"2026-09-09T07:19:07.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-09T07:19:07.000000Z\", \"updated_at\": \"2026-09-09T07:19:07.000000Z\", \"visitor_id\": 14, \"visitor_name\": \"rendi\", \"visitor_phone\": \"0895355356917\", \"receptionist_id\": null, \"visitor_company\": null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-09 14:19:07', '2026-09-09 14:19:07'),
(93, 1, 'auto_checked_out', 'App\\Models\\Visit', 40, 'Auto checkout by public kiosk', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-09 14:19:26', '2026-09-09 14:19:26'),
(94, 1, 'checked_in_public', 'App\\Models\\Visit', 41, 'Public kiosk', NULL, '{\"id\": 41, \"status\": \"IN\", \"meet_to\": \"-\", \"purpose\": \"bayar wifi\", \"check_in\": \"2026-09-09T07:19:26.000000Z\", \"event_id\": null, \"created_at\": \"2026-09-09T07:19:27.000000Z\", \"updated_at\": \"2026-09-09T07:19:27.000000Z\", \"visitor_id\": 14, \"visitor_name\": \"rendi\", \"visitor_phone\": \"0895355356917\", \"receptionist_id\": null, \"visitor_company\": null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-09 14:19:27', '2026-09-09 14:19:27');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `registration_start_at` datetime DEFAULT NULL,
  `registration_end_at` datetime DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','scheduled','active','finished','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `code`, `name`, `description`, `start_date`, `end_date`, `event_date`, `start_time`, `end_time`, `registration_start_at`, `registration_end_at`, `location`, `status`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'EVT-H0UQJE', 'lomba agustusan', 'lomba', '2026-08-16', '2026-08-16', '2026-08-16', '07:00:00', '17:00:00', NULL, NULL, 'lapangan merdeka ', 'active', 1, '2026-08-18 14:48:40', '2026-09-07 14:06:13', '2026-09-07 14:06:13'),
(2, 'EVT-EUHY5B', 'pkl', 'belajar', '2026-08-18', '2026-08-18', '2026-08-18', '07:00:00', '15:00:00', NULL, NULL, 'bandung', 'active', 1, '2026-08-18 14:52:17', '2026-08-18 14:52:58', NULL),
(3, 'tes-9ydth', 'tes', 'tesss', '2026-09-09', '2026-09-09', '2026-09-09', '08:00:00', '17:00:00', '2026-09-07 13:54:00', '2026-09-09 13:55:00', 'lapangan merdeka ', 'scheduled', 1, '2026-09-07 13:56:08', '2026-09-07 13:56:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `event_groups`
--

CREATE TABLE `event_groups` (
  `id` bigint UNSIGNED NOT NULL,
  `game_event_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `register_token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_participants`
--

CREATE TABLE `event_participants` (
  `id` bigint UNSIGNED NOT NULL,
  `event_id` bigint UNSIGNED NOT NULL,
  `visitor_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'registered',
  `registered_at` datetime DEFAULT NULL,
  `checked_in_at` datetime DEFAULT NULL,
  `checked_out_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_participants`
--

INSERT INTO `event_participants` (`id`, `event_id`, `visitor_id`, `name`, `phone`, `email`, `company`, `position`, `status`, `registered_at`, `checked_in_at`, `checked_out_at`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 3, 11, 'Rafi Nurrahman', '098765433', 'nurrahmanrafi78@gmail.com', 'pt abcd', 'staff', 'checked_out', '2026-09-07 13:57:04', '2026-09-08 11:38:39', '2026-09-08 11:38:50', NULL, '2026-09-07 13:57:04', '2026-09-08 11:38:50', NULL),
(2, 3, 9, 'rafi', '087676734', 'nurrahmanrafi78@gmail.com', 'halo', NULL, 'checked_out', '2026-09-07 13:58:03', '2026-09-08 11:38:55', '2026-09-08 11:39:01', NULL, '2026-09-07 13:58:03', '2026-09-08 11:39:01', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `face_embeddings`
--

CREATE TABLE `face_embeddings` (
  `id` bigint UNSIGNED NOT NULL,
  `visitor_id` bigint UNSIGNED NOT NULL,
  `face_vector` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `face_embeddings`
--

INSERT INTO `face_embeddings` (`id`, `visitor_id`, `face_vector`, `created_at`, `updated_at`) VALUES
(1, 6, '[-0.08870681375265121,0.14840687811374664,0.06961037218570709,-0.028700172901153564,-0.10758979618549347,0.0025251752231270075,-0.0729798674583435,-0.0914364904165268,0.17511343955993652,-0.07707537710666656,0.22877617180347443,0.04152228310704231,-0.17055891454219818,-0.14569735527038574,0.027803858742117882,0.16619384288787842,-0.21571652591228485,-0.1380392163991928,-0.008805269375443459,-0.026600701734423637,0.041375644505023956,0.016918685287237167,0.051201872527599335,-0.009156760759651661,-0.10996347665786743,-0.38735276460647583,-0.06049886718392372,-0.08928947895765305,0.08170914649963379,-0.10799957066774368,-0.06587927043437958,0.0090789208188653,-0.20652320981025696,-0.07156983762979507,-0.029912015423178673,0.10462990403175354,-0.04613405466079712,0.017608238384127617,0.17375074326992035,0.015000543557107449,-0.22434669733047485,0.025999030098319054,0.007361839525401592,0.27654486894607544,0.22032426297664642,0.06637614220380783,0.05202269181609154,-0.10410739481449127,0.031142590567469597,-0.12617957592010498,0.05240553617477417,0.15845918655395508,0.0829613208770752,0.05324862152338028,-0.03499247133731842,-0.15076321363449097,-0.03180425986647606,0.050560254603624344,-0.10721684992313385,0.037065863609313965,0.09789291024208069,-0.0657605305314064,-0.03204521909356117,-0.017915619537234306,0.29772698879241943,0.025312716141343117,-0.0997752845287323,-0.1502411663532257,0.08358382433652878,-0.12465950846672058,-0.09240655601024628,0.04653726518154144,-0.14850015938282013,-0.16492009162902832,-0.29827502369880676,0.046514254063367844,0.3891509473323822,0.0499911904335022,-0.2293596714735031,0.030712386593222618,-0.06865714490413666,-0.033115826547145844,0.13485673069953918,0.18220296502113342,-0.03311686962842941,0.06521856039762497,-0.09482721984386444,0.027910232543945312,0.19711869955062866,-0.07115799188613892,-0.008274937979876995,0.18846040964126587,0.023465540260076523,0.09485293179750443,0.025258095934987068,0.028785882517695427,-0.04161522537469864,0.06660646200180054,-0.1434163898229599,-0.06803511828184128,0.070083387196064,-0.058380912989377975,0.005912435241043568,0.11502957344055176,-0.1561940759420395,0.15623854100704193,0.05331450700759888,0.03160090371966362,0.05500181391835213,0.02835707552731037,-0.08353123068809509,-0.1437027007341385,0.1777271181344986,-0.19958892464637756,0.23527485132217407,0.25595685839653015,0.02180178090929985,0.14523328840732574,0.13140438497066498,0.142720565199852,-0.024106482043862343,0.023878775537014008,-0.16166932880878448,0.040596138685941696,0.055288877338171005,-0.05065006762742996,0.10936271399259567,0.02753341570496559]', '2026-08-18 14:50:38', '2026-08-18 14:50:38'),
(2, 7, '[-0.10307610780000687,0.07265850901603699,0.08778026700019836,-0.05021030828356743,-0.06021648272871971,-0.07404682040214539,0.008273976854979992,-0.14141827821731567,0.17877818644046783,-0.12058666348457336,0.2597038447856903,0.04616004228591919,-0.19806219637393951,-0.14633437991142273,0.03600528836250305,0.16341246664524078,-0.13577823340892792,-0.10407812893390656,-0.0884769931435585,-0.09244360029697418,0.03909233585000038,0.011913744732737541,0.07910474389791489,-0.014776668511331081,-0.1355350762605667,-0.38968968391418457,-0.09104487299919128,-0.09873975813388824,0.03781367465853691,0.009642095305025578,-0.004941680934280157,0.09880314767360687,-0.17354939877986908,-0.07977647334337234,0.013907273299992085,0.04290338233113289,-0.03784606233239174,0.0046966769732534885,0.20653268694877625,0.009423211216926575,-0.22338269650936127,-0.04763619601726532,0.005883192643523216,0.23689237236976624,0.14824171364307404,0.0338035486638546,0.08816450089216232,-0.08520828187465668,0.07050692290067673,-0.2039942592382431,0.03977595269680023,0.11711707711219788,0.08602364361286163,0.031765684485435486,0.02448478527367115,-0.14519652724266052,0.019137591123580933,0.0745808556675911,-0.18475815653800964,0.00791004579514265,0.04306448996067047,-0.11734384298324585,-0.06458114832639694,0.004191819112747908,0.28205060958862305,0.11273103952407837,-0.13287095725536346,-0.07369023561477661,0.15526583790779114,-0.10011999309062958,-0.008447663858532906,0.03944683074951172,-0.19403493404388428,-0.1830737590789795,-0.33977583050727844,0.03475797176361084,0.4385501444339752,0.10154008120298386,-0.17250216007232666,-0.01272926852107048,-0.13437050580978394,0.041171085089445114,0.1312098652124405,0.1321229487657547,-0.07737334072589874,0.03276174142956734,-0.05568547546863556,0.042551279067993164,0.16221190989017487,-0.07289617508649826,-0.086245596408844,0.23662897944450378,0.022408246994018555,0.12268528342247009,-0.01686025597155094,0.010375619865953922,-0.05777154862880707,-0.026682067662477493,-0.12953802943229675,-0.0240916907787323,0.06082386523485184,0.008659454062581062,0.056429967284202576,0.14696621894836426,-0.1594092845916748,0.12566114962100983,0.02413388527929783,0.01816878840327263,0.04218527674674988,0.0289462823420763,-0.05956093594431877,-0.15696971118450165,0.08053667843341827,-0.15542647242546082,0.1810740977525711,0.2385377436876297,0.003396272426471114,0.15963706374168396,0.10003490000963211,0.030268579721450806,-0.01844390109181404,-0.02787444181740284,-0.15407691895961761,0.03232712298631668,0.11324760317802429,-0.025656582787632942,0.07869073748588562,-0.0058995699509978294]', '2026-08-18 15:00:37', '2026-08-18 15:00:37'),
(3, 9, '[-0.10497218370437622,0.15355291962623596,0.05113401263952255,-0.06235838308930397,-0.053277354687452316,-0.029491739347577095,0.013295525684952736,-0.12605349719524384,0.19959653913974762,-0.08234592527151108,0.22177480161190033,0.02470717392861843,-0.2046414464712143,-0.1926947981119156,0.021372267976403236,0.20795150101184845,-0.18238821625709534,-0.13420632481575012,-0.08880510181188583,-0.06257031857967377,0.05427883192896843,0.012929918244481087,0.07155852019786835,0.04128143563866615,-0.14550453424453735,-0.39417746663093567,-0.07954060286283493,-0.1084623634815216,-0.0053838458843529224,-0.018781734630465508,-0.08826420456171036,0.0755290761590004,-0.165691077709198,-0.09897825866937637,0.05183215066790581,0.09804684668779373,-0.037592366337776184,-0.015725985169410706,0.1861635148525238,0.014949999749660492,-0.21901419758796692,-0.005098906345665455,0.06802138686180115,0.2742246389389038,0.17711523175239563,0.018342437222599983,0.07065297663211823,-0.0856737270951271,0.1289110630750656,-0.15030008554458618,0.04184439778327942,0.12347576767206192,0.11620043218135834,0.03124508075416088,0.05058855190873146,-0.12775760889053345,0.007544787134975195,0.07728874683380127,-0.13590370118618011,-0.024032151326537132,0.060281120240688324,-0.12061809748411179,-0.11024782061576843,-0.030774865299463272,0.2530938982963562,0.10880401730537415,-0.12135128676891327,-0.14441072940826416,0.15710420906543732,-0.08164739608764648,-0.053123291581869125,0.030203161761164665,-0.1918354034423828,-0.1379985511302948,-0.3163354992866516,0.01588970609009266,0.4552636742591858,0.0910804495215416,-0.21077308058738708,0.006110040936619043,-0.11729598045349121,0.029743095859885216,0.12091825157403946,0.15917885303497314,-0.08704499900341034,0.0767965093255043,-0.0990537479519844,0.050898537039756775,0.17741689085960388,-0.05968930199742317,-0.06208152323961258,0.20782054960727692,0.04362215846776962,0.13310474157333374,0.0064978827722370625,-0.038525305688381195,-0.07316164672374725,0.01682673767209053,-0.1752133071422577,-0.04568387567996979,0.07718817889690399,-0.009206060320138931,0.017793923616409302,0.13505233824253082,-0.1695650815963745,0.09858885407447815,0.06237092241644859,0.042038604617118835,0.03717401996254921,0.03757243603467941,-0.10555392503738403,-0.12312708795070648,0.08703881502151489,-0.1731833517551422,0.15737849473953247,0.20400257408618927,0.015802260488271713,0.10826820880174637,0.12995749711990356,0.043369460850954056,0.004731039050966501,-0.030445583164691925,-0.18693895637989044,0.01870414800941944,0.1541236788034439,-0.03371717408299446,0.10169272869825363,-0.01440537627786398]', '2026-08-19 09:55:30', '2026-08-19 09:55:30'),
(4, 10, '[-0.09762904047966003,0.1381322592496872,0.06873992830514908,-0.036940231919288635,-0.14180147647857666,0.0003458683204371482,-0.07878155261278152,-0.10496924817562103,0.13100185990333557,-0.07569223642349243,0.24076178669929504,0.014874976128339767,-0.14997148513793945,-0.11824031919240952,-0.05881469324231148,0.1767573207616806,-0.2392868548631668,-0.13991910219192505,-0.01812138967216015,0.005400634370744228,0.07844235748052597,0.03772210702300072,0.016229981556534767,-0.011104200966656208,-0.1412714719772339,-0.3724168539047241,-0.025423113256692886,-0.07294055074453354,0.07848580926656723,-0.1162840723991394,-0.04396723210811615,0.03566461801528931,-0.2145211547613144,-0.049081843346357346,-0.01267419382929802,0.11234769970178604,-0.03657107055187225,0.023354925215244293,0.17745298147201538,0.012535437010228634,-0.26778465509414673,0.06813345104455948,0.041206277906894684,0.2725782096385956,0.21526411175727844,0.02695820853114128,0.03694209083914757,-0.13347989320755005,0.07101775705814362,-0.1311895102262497,0.02401331253349781,0.1540789157152176,0.07048717141151428,0.04828859493136406,-0.03854433074593544,-0.12369868904352188,-0.03737321496009827,0.07864350080490112,-0.12493708729743958,0.04906361550092697,0.10305188596248627,-0.0815780833363533,-0.02104523591697216,-0.03992534056305885,0.2234373241662979,0.007504220586270094,-0.09019345045089722,-0.16815432906150818,0.1262398064136505,-0.12181604653596878,-0.1004188135266304,0.06628856062889099,-0.11992764472961426,-0.15488825738430023,-0.31068557500839233,0.0045264423824846745,0.4145256280899048,0.03760656714439392,-0.2021627426147461,0.04717877879738808,-0.0426715612411499,-0.043536730110645294,0.14208197593688965,0.16614453494548798,-0.013155980966985226,0.06022917479276657,-0.07620332390069962,0.05839231610298157,0.22017055749893188,-0.046666938811540604,-0.006512349005788565,0.19163408875465393,0.026915721595287323,0.0854710042476654,0.041446562856435776,0.04447416588664055,-0.05538671463727951,0.06973988562822342,-0.1467050164937973,-0.043168723583221436,0.03481172397732735,-0.06076136603951454,0.02329086698591709,0.12668588757514954,-0.11875703185796738,0.15063561499118805,0.04719356447458267,0.05740465223789215,0.055831827223300934,0.03815724328160286,-0.07649687677621841,-0.1162218376994133,0.16297078132629395,-0.19345644116401672,0.25324416160583496,0.21710030734539032,0.04186923801898956,0.10537908971309662,0.15189239382743835,0.0899026095867157,-0.0166866946965456,0.011281454004347324,-0.18531444668769836,0.027862945571541786,0.054813310503959656,-0.08499307930469513,0.11999160051345825,0.01872253231704235]', '2026-08-19 13:08:13', '2026-08-19 13:08:13'),
(5, 11, '[-0.05610854923725128,0.09563695639371872,0.011346472427248955,-0.04529113695025444,-0.1393732726573944,-0.10690398514270782,-0.059737104922533035,-0.1392413228750229,0.0714961588382721,-0.09944213181734085,0.17761752009391785,-0.04140152782201767,-0.23245982825756073,-0.05625656992197037,0.03352631255984306,0.10309339314699173,-0.14918069541454315,-0.10350235551595688,-0.13580060005187988,-0.08622807264328003,-0.04670702666044235,0.0038940294180065393,0.05788099393248558,0.040294207632541656,-0.17255866527557373,-0.21159537136554718,-0.1051902249455452,-0.04828648641705513,0.04871983453631401,-0.03880619630217552,-0.04644576832652092,0.10435695946216583,-0.1998748779296875,-0.0580894909799099,0.06588895618915558,0.062049418687820435,-0.04038544371724129,-0.0738563984632492,0.17754341661930084,-0.011107330210506916,-0.1623229831457138,0.04551222175359726,0.043416827917099,0.21611155569553375,0.26774874329566956,-0.03126024827361107,-0.0023349232506006956,-0.10894899815320969,0.12469659745693207,-0.24010653793811798,-0.03567325696349144,0.2076774537563324,0.06871744245290756,0.07524227350950241,0.01621951162815094,-0.1300075501203537,0.045305006206035614,0.17994581162929535,-0.19135825335979462,0.011860390193760395,0.030737660825252533,-0.0863276794552803,-0.03847097232937813,-0.09722916781902313,0.1696687638759613,0.08810684829950333,-0.12038623541593552,-0.1698373705148697,0.18019318580627441,-0.16085410118103027,-0.025186069309711456,0.13559457659721375,-0.14125096797943115,-0.21760611236095428,-0.23696675896644592,0.03808695450425148,0.3628511428833008,0.2378629893064499,-0.14288896322250366,0.0342695526778698,-0.14650286734104156,-0.06124931946396828,-0.020093277096748352,0.02928226999938488,-0.045507729053497314,-0.09346292912960052,-0.08319107443094254,0.061232831329107285,0.21957220137119293,-0.08200863748788834,0.025206472724676132,0.26042717695236206,0.04210356995463371,0.031243154779076576,-0.03345630317926407,-0.0003145759110338986,-0.15810760855674744,-0.015599756501615047,-0.12766249477863312,-0.04492063447833061,0.016213931143283844,-0.11493510752916336,0.05334931239485741,0.1653090864419937,-0.14479221403598785,0.15861999988555908,-0.007186990696936846,-0.021755075082182884,-0.015284883789718151,-0.008565567433834076,-0.018168047070503235,-0.05864928290247917,0.1253153681755066,-0.24547837674617767,0.20338749885559082,0.1890716254711151,0.046983752399683,0.10625894367694855,0.059172093868255615,0.079961396753788,-0.015805630013346672,-0.02541995607316494,-0.10346629470586777,-0.07705028355121613,0.03801121562719345,-0.03461415320634842,0.020520111545920372,0.011341492645442486]', '2026-09-07 13:57:04', '2026-09-07 13:57:04'),
(6, 12, '\"[-0.08823762834072113,0.11116097867488861,0.030936941504478455,-0.06024070829153061,-0.09059146791696548,-0.027225317433476448,0.002180143492296338,-0.13384580612182617,0.17306412756443024,-0.11946623772382736,0.2087886780500412,0.009843362495303154,-0.1764654517173767,-0.15241459012031555,0.026895781978964806,0.1791105717420578,-0.18282431364059448,-0.1355770230293274,-0.043242551386356354,-0.05166047066450119,0.05465225875377655,-0.019763488322496414,0.07639280706644058,0.04917729273438454,-0.19039462506771088,-0.3941580653190613,-0.08269239217042923,-0.09814900904893875,0.012464404106140137,-0.03999560698866844,-0.07871776819229126,0.10729536414146423,-0.1577090173959732,-0.06458094716072083,0.016342703253030777,0.07534118741750717,-0.028996264562010765,-0.006613274570554495,0.18179532885551453,0.027692407369613647,-0.24001461267471313,0.004621701315045357,0.04514208436012268,0.28347793221473694,0.18351039290428162,0.012143445201218128,0.10063242167234421,-0.07781776040792465,0.11290264129638672,-0.14965838193893433,0.058183565735816956,0.10301104187965393,0.09629835933446884,0.01771881990134716,0.016398703679442406,-0.14588569104671478,-0.0018449403578415513,0.10261909663677216,-0.13489146530628204,0.017581267282366753,0.058045804500579834,-0.06993244588375092,-0.03739285096526146,-0.007595208007842302,0.2793310582637787,0.09214936196804047,-0.1294497847557068,-0.11404036730527878,0.12861868739128113,-0.09613930433988571,-0.05397313833236694,0.008314522914588451,-0.20313799381256104,-0.17090480029582977,-0.33537915349006653,0.02444382943212986,0.4469084143638611,0.10652393102645874,-0.17521390318870544,0.02892300672829151,-0.10935696214437485,0.013120981864631176,0.12101132422685623,0.18225616216659546,-0.10359534621238708,0.07568446546792984,-0.06986448913812637,0.05157904699444771,0.19009968638420105,-0.03257342427968979,-0.08171108365058899,0.21784497797489166,0.03188851848244667,0.10940459370613098,0.010292335413396358,-0.022741498425602913,-0.09845626354217529,0.016976051032543182,-0.147578626871109,-0.05279303714632988,0.02632482349872589,-0.042185526341199875,0.022752780467271805,0.171048104763031,-0.20944002270698547,0.14782938361167908,0.03161334618926048,0.045547645539045334,0.024937771260738373,0.0684102475643158,-0.0965304747223854,-0.12111922353506088,0.07066144049167633,-0.19696280360221863,0.12358963489532471,0.23241844773292542,0.07725472003221512,0.14106079936027527,0.14027102291584015,0.01975165493786335,0.021938299760222435,0.017850227653980255,-0.17392119765281677,0.05933951959013939,0.15104176104068756,-0.055821724236011505,0.11418671905994415,0.016337400302290916]\"', '2026-09-08 08:37:49', '2026-09-08 08:37:49'),
(7, 13, '\"[-0.09456692636013031,0.1252305507659912,0.06943535059690475,-0.06389011442661285,-0.07884898781776428,-0.03250572830438614,0.01829722709953785,-0.14570097625255585,0.18643930554389954,-0.07948128134012222,0.21661634743213654,0.009410771541297436,-0.2384367138147354,-0.12643089890480042,-0.00361544918268919,0.17844872176647186,-0.15558741986751556,-0.12145888805389404,-0.10178950428962708,-0.04744197800755501,0.049893930554389954,-0.010475474409759045,0.06749803572893143,0.02727212756872177,-0.12158773839473724,-0.38911184668540955,-0.0778907984495163,-0.06262034177780151,0.007867145352065563,0.008865967392921448,-0.06555468589067459,0.08364728093147278,-0.19850878417491913,-0.1016836017370224,0.028996549546718597,0.09833931922912598,-0.047874655574560165,-0.032245609909296036,0.1734560877084732,0.017640404403209686,-0.2240743786096573,-0.008951054885983467,0.04526515677571297,0.24579530954360962,0.1870313584804535,0.01445920579135418,0.07979992777109146,-0.09646933525800705,0.08892714232206345,-0.18536467850208282,0.01874583028256893,0.13433042168617249,0.08404726535081863,0.04119338095188141,0.020525606349110603,-0.15943828225135803,-0.00569087965413928,0.10292806476354599,-0.13550913333892822,-0.011031024158000946,0.0458151251077652,-0.10525865852832794,-0.09570688009262085,-0.0644499734044075,0.2641259431838989,0.12250562757253647,-0.14023593068122864,-0.13591893017292023,0.1533822864294052,-0.09383198618888855,-0.03454044461250305,0.035049278289079666,-0.20390412211418152,-0.14256241917610168,-0.3256513774394989,0.024737760424613953,0.46654579043388367,0.08282250910997391,-0.19401779770851135,-0.015145470388233662,-0.1340135633945465,0.04011739417910576,0.09293977916240692,0.15290415287017822,-0.06773573905229568,0.07350625097751617,-0.07689998298883438,0.043051764369010925,0.17474286258220673,-0.05771612748503685,-0.0778883770108223,0.21707989275455475,0.025057610124349594,0.11710920929908752,0.0006113817798905075,-0.0032032818999141455,-0.08136004954576492,-0.007009368855506182,-0.18493962287902832,-0.05486148223280907,0.05169404298067093,-0.020588133484125137,0.027382217347621918,0.14696411788463593,-0.1610230803489685,0.10777057707309723,0.03932572901248932,0.04051889479160309,0.04592997580766678,0.00755242770537734,-0.08211900293827057,-0.1155012995004654,0.10893881320953369,-0.18322090804576874,0.17193923890590668,0.21906441450119019,0.021467678248882294,0.10898657143115997,0.1189514622092247,0.041961949318647385,0.0009868807392194867,0.002710567554458976,-0.1662255972623825,0.020879292860627174,0.11833789199590683,-0.04045327007770538,0.08790598809719086,-0.016694527119398117]\"', '2026-09-08 10:46:04', '2026-09-08 10:46:04'),
(8, 14, '[-0.1563674807548523,0.16099607944488525,0.06990078091621399,-0.06436898559331894,-0.07901693880558014,0.030907781794667244,-0.06708897650241852,-0.13203130662441254,0.0937599241733551,-0.054787904024124146,0.2777305543422699,-0.07945146411657333,-0.24647462368011475,-0.0677097961306572,-0.0860380232334137,0.18076543509960175,-0.2869405448436737,-0.11535166949033737,-0.03378517925739288,-0.03413943201303482,0.08473560959100723,0.05357358232140541,0.028999390080571175,-0.028417330235242844,-0.12236995249986649,-0.35349637269973755,-0.08137595653533936,-0.054641369730234146,0.004132592584937811,-0.02513083629310131,-0.05453561618924141,-0.004691689275205135,-0.22072699666023254,-0.027285270392894745,0.03699013590812683,0.10669027268886566,-0.00039001225377433,-0.04020342230796814,0.12310146540403366,-0.015556474216282368,-0.14765608310699463,-0.011871876195073128,0.10150803625583649,0.2490391731262207,0.17914405465126038,0.085389144718647,-0.015075985342264175,-0.07119099795818329,0.019795555621385574,-0.19481736421585083,0.06824535876512527,0.13235294818878174,0.12209502607584,0.05427642539143562,-0.01016417145729065,-0.14988960325717926,0.006674132309854031,0.07785473018884659,-0.08209854364395142,0.039806246757507324,0.10904642194509506,-0.14033038914203644,0.011514304205775261,-0.030815720558166504,0.24313807487487793,0.05093127116560936,-0.14136245846748352,-0.11261657625436783,0.11072994768619537,-0.06205662339925766,-0.059923186898231506,0.024918967857956886,-0.11711496114730835,-0.1721760481595993,-0.3215968906879425,0.019578292965888977,0.4883742034435272,0.06328238546848297,-0.21031321585178375,-0.01446087472140789,-0.03800300136208534,-0.020546944811940193,0.136773481965065,0.16149836778640747,-0.05296875536441803,0.02236286923289299,-0.17488083243370056,0.058529552072286606,0.22700242698192596,-0.07112020254135132,-0.0672774389386177,0.225844144821167,-0.029363859444856644,0.06608633697032928,0.040677472949028015,0.08327046781778336,-0.03584935888648033,0.017966730520129204,-0.07770346105098724,0.007076287642121315,0.038091011345386505,-0.08224229514598846,-0.0684664323925972,0.13244307041168213,-0.10308162868022919,0.07264581322669983,0.01761534996330738,0.012794554233551025,-0.016398310661315918,-0.05354995280504227,-0.05233020707964897,-0.06361997872591019,0.13676533102989197,-0.23735210299491882,0.14421477913856506,0.2081209123134613,-0.006280913483351469,0.17734107375144958,0.08941131830215454,0.09998586028814316,0.014280963689088821,-0.01772131770849228,-0.17944404482841492,-0.07536429911851883,0.029984042048454285,-0.02585199847817421,0.12040529400110245,0.04831880331039429]', '2026-09-09 14:19:07', '2026-09-09 14:19:10');

-- --------------------------------------------------------

--
-- Table structure for table `game_events`
--

CREATE TABLE `game_events` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('draft','active','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `game_events`
--

INSERT INTO `game_events` (`id`, `name`, `description`, `start_date`, `end_date`, `status`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'lomba ', 'tes', '2026-09-07', '2026-09-10', 'active', 1, '2026-09-07 14:26:10', '2026-09-07 14:26:10', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `group_participants`
--

CREATE TABLE `group_participants` (
  `id` bigint UNSIGNED NOT NULL,
  `event_group_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registered_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_08_07_141831_create_users_table', 1),
(2, '2026_08_07_141838_create_visitors_table', 1),
(3, '2026_08_07_141844_create_face_embeddings_table', 1),
(4, '2026_08_07_141850_create_visits_table', 1),
(5, '2026_08_11_120000_add_receptionist_id_to_visits_table', 1),
(6, '2026_08_11_120001_create_audit_logs_table', 1),
(7, '2026_08_11_120002_add_soft_deletes_to_visitors_and_visits', 1),
(8, '2026_08_15_163427_create_system_settings_table', 1),
(9, '2026_08_18_000000_add_supervisor_role', 1),
(10, '2026_08_18_140000_create_events_table', 1),
(11, '2026_08_18_140001_add_event_id_to_visits_table', 1),
(12, '2026_08_19_091834_add_visitor_snapshot_to_visits_table', 2),
(13, '2026_08_19_133442_add_disabled_features_to_users_table', 3),
(14, '2026_08_20_000000_enhance_events_and_create_event_participants_table', 3),
(15, '2026_08_21_000000_fix_event_participants_unique_constraint', 4),
(16, '2026_08_21_000001_add_indexes_for_performance', 5),
(17, '2026_08_21_100000_fix_event_status_enum', 5),
(18, '2026_08_24_000000_create_games_event_tables', 6);

-- --------------------------------------------------------

--
-- Table structure for table `point_qr_codes`
--

CREATE TABLE `point_qr_codes` (
  `id` bigint UNSIGNED NOT NULL,
  `game_event_id` bigint UNSIGNED NOT NULL,
  `point_value` int NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `point_qr_codes`
--

INSERT INTO `point_qr_codes` (`id`, `game_event_id`, `point_value`, `token`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 100, 'uqOLxeXoibFEX3XcRwpfiNapWVgByI3t', 'active', '2026-09-07 14:26:30', '2026-09-07 14:26:30');

-- --------------------------------------------------------

--
-- Table structure for table `point_transactions`
--

CREATE TABLE `point_transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `game_event_id` bigint UNSIGNED NOT NULL,
  `event_group_id` bigint UNSIGNED NOT NULL,
  `group_participant_id` bigint UNSIGNED NOT NULL,
  `point_qr_code_id` bigint UNSIGNED NOT NULL,
  `points` int NOT NULL,
  `scanned_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'public_registration_enabled', '1', '2026-08-18 14:36:31', '2026-08-18 14:46:35');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','receptionist','supervisor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'receptionist',
  `disabled_features` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `disabled_features`, `created_at`, `updated_at`) VALUES
(1, 'Administrator GLOSINDO', 'admin@glosindo.com', '$2y$12$d1qFXNuKvtCZtJ/MrkBcU..z7yeCmSuPgGz/RMQTLIk9v4zzQAfLu', 'admin', '[]', '2026-08-18 14:36:53', '2026-09-02 16:28:35'),
(2, 'Receptionist GLOSINDO', 'receptionist@glosindo.com', '$2y$12$/pf/c0uodjitfu.A2fZb1OAiWjjHGQFYrlxgk2zpmCxGZG20/U2wm', 'receptionist', NULL, '2026-08-18 14:36:53', '2026-08-18 14:47:21'),
(3, 'Supervisor GLOSINDO', 'supervisor@glosindo.com', '$2y$12$GNdg4gtIL9UoFRC19yKsAeB3pVpApqD/.UtG.qtD6zZ.uoLVVlJ7C', 'supervisor', NULL, '2026-08-18 14:36:53', '2026-08-18 14:36:53');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitors`
--

INSERT INTO `visitors` (`id`, `name`, `phone`, `email`, `company`, `position`, `photo`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Ayu Lestari', '081234567890', 'ayu@example.com', 'PT Maju Bersama', NULL, NULL, '2026-08-18 14:36:53', '2026-08-18 14:36:53', NULL),
(2, 'Budi Santoso', '081234567891', 'budi@example.com', 'CV Sejahtera', NULL, NULL, '2026-08-18 14:36:53', '2026-08-18 14:36:53', NULL),
(3, 'Citra Dewi', '081234567892', 'citra@example.com', 'Bank Nusantara', NULL, NULL, '2026-08-18 14:36:53', '2026-08-18 14:36:53', NULL),
(4, 'Dimas Pratama', '081234567893', 'dimas@example.com', 'PT Global Teknologi', NULL, NULL, '2026-08-18 14:36:53', '2026-08-18 14:36:53', NULL),
(5, 'Eka Putri', '081234567894', 'eka@example.com', 'PT Inovasi Digital', NULL, NULL, '2026-08-18 14:36:53', '2026-08-18 14:36:53', NULL),
(6, 'adli', '089874834324', 'rafie3@gmail.com', 'skanic', NULL, NULL, '2026-08-18 14:50:38', '2026-08-19 09:55:04', '2026-08-19 09:55:04'),
(7, 'rafie', '234567890', 'nurrahmcanrafi78@gmail.com', 'jaya barat', NULL, NULL, '2026-08-18 15:00:37', '2026-08-19 09:54:10', '2026-08-19 09:54:10'),
(8, 'sahs', '094785', 'nurrahmanrafi78@gmail.com', 'glodino', NULL, NULL, '2026-08-18 16:53:54', '2026-08-19 09:54:12', '2026-08-19 09:54:12'),
(9, 'rafi', '087676734', 'nurrahmanrafi78@gmail.com', 'halo', NULL, NULL, '2026-08-19 09:55:30', '2026-09-08 08:34:30', '2026-09-08 08:34:30'),
(10, 'asdfghj', '0987654', 'nurrahmanrafi78@gmail.com', 'ko', NULL, NULL, '2026-08-19 13:08:13', '2026-09-07 14:09:02', '2026-09-07 14:09:02'),
(11, 'Rafi Nurrahman', '098765433', 'nurrahmanrafi78@gmail.com', 'pt abcd', 'staff', 'visitors/1788764224_FitazY6h.jpg', '2026-09-07 13:57:04', '2026-09-07 14:09:42', '2026-09-07 14:09:42'),
(12, 'rafie', '08765256525', NULL, NULL, NULL, NULL, '2026-09-08 08:37:48', '2026-09-08 10:45:03', '2026-09-08 10:45:03'),
(13, 'rafie', '08572425523', NULL, NULL, NULL, NULL, '2026-09-08 10:46:04', '2026-09-08 10:46:04', NULL),
(14, 'rendi', '0895355356917', NULL, NULL, NULL, NULL, '2026-09-09 14:19:07', '2026-09-09 14:19:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `visits`
--

CREATE TABLE `visits` (
  `id` bigint UNSIGNED NOT NULL,
  `visitor_id` bigint UNSIGNED DEFAULT NULL,
  `visitor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visitor_company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visitor_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receptionist_id` bigint UNSIGNED DEFAULT NULL,
  `purpose` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meet_to` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_in` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `check_out` timestamp NULL DEFAULT NULL,
  `status` enum('IN','OUT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IN',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `event_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visits`
--

INSERT INTO `visits` (`id`, `visitor_id`, `visitor_name`, `visitor_company`, `visitor_phone`, `receptionist_id`, `purpose`, `meet_to`, `check_in`, `check_out`, `status`, `created_at`, `updated_at`, `deleted_at`, `event_id`) VALUES
(1, 6, NULL, NULL, NULL, 1, 'Mengikuti event: pkl', '-', '2026-08-18 14:53:16', '2026-08-18 14:53:51', 'OUT', '2026-08-18 14:53:16', '2026-08-19 09:55:04', '2026-08-19 09:55:04', 2),
(2, 6, NULL, NULL, NULL, 1, 'Quick Check-In', '-', '2026-08-18 14:53:58', '2026-08-18 14:54:38', 'OUT', '2026-08-18 14:53:58', '2026-08-19 09:55:04', '2026-08-19 09:55:04', NULL),
(3, 6, NULL, NULL, NULL, 1, 'Mengikuti event: pkl', '-', '2026-08-18 14:54:54', '2026-08-18 14:58:40', 'OUT', '2026-08-18 14:54:54', '2026-08-19 09:55:04', '2026-08-19 09:55:04', 2),
(4, 6, NULL, NULL, NULL, 1, 'Quick Check-In', '-', '2026-08-18 15:46:39', '2026-08-18 15:50:33', 'OUT', '2026-08-18 15:46:39', '2026-08-19 09:55:04', '2026-08-19 09:55:04', NULL),
(5, 7, NULL, NULL, NULL, 2, 'dasdas', 'fas', '2026-08-18 15:53:54', '2026-08-18 16:00:28', 'OUT', '2026-08-18 15:53:54', '2026-08-19 09:54:10', '2026-08-19 09:54:10', 2),
(6, 7, NULL, NULL, NULL, 2, 'Quick Check-In', '-', '2026-08-18 16:00:30', '2026-08-18 16:09:06', 'OUT', '2026-08-18 16:00:30', '2026-08-19 09:54:10', '2026-08-19 09:54:10', NULL),
(7, 6, NULL, NULL, NULL, 2, 'Quick Check-In', '-', '2026-08-18 16:00:36', '2026-08-18 16:08:03', 'OUT', '2026-08-18 16:00:36', '2026-08-19 09:55:04', '2026-08-19 09:55:04', NULL),
(8, 6, NULL, NULL, NULL, 2, 'Check-In Event: pkl', '-', '2026-08-18 16:08:08', '2026-08-18 16:08:23', 'OUT', '2026-08-18 16:08:08', '2026-08-19 09:55:04', '2026-08-19 09:55:04', 2),
(9, 6, NULL, NULL, NULL, 2, 'Check-In Event: pkl', '-', '2026-08-18 16:08:51', '2026-08-18 16:08:56', 'OUT', '2026-08-18 16:08:51', '2026-08-19 09:55:04', '2026-08-19 09:55:04', 2),
(10, 6, NULL, NULL, NULL, 2, 'Quick Check-In', '-', '2026-08-18 16:13:54', '2026-08-18 16:14:02', 'OUT', '2026-08-18 16:13:54', '2026-08-19 09:55:04', '2026-08-19 09:55:04', NULL),
(11, 6, NULL, NULL, NULL, 2, 'Quick Check-In', '-', '2026-08-18 16:14:12', '2026-08-18 16:14:21', 'OUT', '2026-08-18 16:14:12', '2026-08-19 09:55:04', '2026-08-19 09:55:04', NULL),
(12, 7, NULL, NULL, NULL, 1, 'Quick Check-In', '-', '2026-08-18 16:54:05', '2026-08-19 09:46:38', 'OUT', '2026-08-18 16:54:05', '2026-08-19 09:54:10', '2026-08-19 09:54:10', NULL),
(13, 9, 'rafi', 'halo', '087676734', 1, 'Quick Check-In', '-', '2026-08-19 10:02:08', '2026-08-19 10:03:45', 'OUT', '2026-08-19 10:02:08', '2026-08-22 09:47:03', '2026-08-22 09:47:03', NULL),
(14, 9, 'rafi', 'halo', '087676734', 1, 'Quick Check-In', '-', '2026-08-19 10:04:11', '2026-08-19 11:16:53', 'OUT', '2026-08-19 10:04:11', '2026-08-22 09:47:08', '2026-08-22 09:47:08', NULL),
(15, 9, 'rafi', 'halo', '087676734', 1, 'Quick Check-In', '-', '2026-08-19 11:17:04', '2026-08-19 13:09:00', 'OUT', '2026-08-19 11:17:04', '2026-09-08 08:34:30', '2026-09-08 08:34:30', NULL),
(16, 10, 'asdfghj', 'ko', '0987654', 1, 'Quick Check-In', '-', '2026-08-19 13:08:18', '2026-08-19 13:08:24', 'OUT', '2026-08-19 13:08:18', '2026-09-07 14:09:02', '2026-09-07 14:09:02', NULL),
(17, 10, 'asdfghj', 'ko', '0987654', 1, 'Quick Check-In', '-', '2026-08-19 13:08:27', '2026-08-19 13:08:51', 'OUT', '2026-08-19 13:08:27', '2026-09-07 14:09:02', '2026-09-07 14:09:02', NULL),
(18, 10, 'asdfghj', 'ko', '0987654', 1, 'Check-In Event: pkl', '-', '2026-08-19 13:09:13', '2026-08-19 13:09:19', 'OUT', '2026-08-19 13:09:13', '2026-09-07 14:09:02', '2026-09-07 14:09:02', 2),
(19, 10, 'asdfghj', 'ko', '0987654', 1, 'Check-In Event: pkl', '-', '2026-08-19 13:09:22', '2026-08-22 09:43:48', 'OUT', '2026-08-19 13:09:22', '2026-09-07 14:09:02', '2026-09-07 14:09:02', 2),
(20, 9, 'rafi', 'halo', '087676734', NULL, 'bayar bulanan wifi', '-', '2026-09-07 13:41:57', '2026-09-07 13:57:59', 'OUT', '2026-09-07 13:41:57', '2026-09-08 08:34:30', '2026-09-08 08:34:30', NULL),
(21, 9, 'rafi', 'halo', '087676734', 1, 'Event: tes', 'Event: tes', '2026-09-07 13:58:03', '2026-09-07 14:10:33', 'OUT', '2026-09-07 13:58:03', '2026-09-08 08:34:30', '2026-09-08 08:34:30', 3),
(22, 9, 'rafi', 'halo', '087676734', NULL, 'tes', '-', '2026-09-07 14:10:33', '2026-09-07 14:15:57', 'OUT', '2026-09-07 14:10:33', '2026-09-08 08:34:30', '2026-09-08 08:34:30', NULL),
(23, 9, 'rafi', 'halo', '087676734', 1, 'Event: tes', 'Event: tes', '2026-09-07 14:15:59', '2026-09-08 08:34:19', 'OUT', '2026-09-07 14:15:59', '2026-09-08 08:34:30', '2026-09-08 08:34:30', 3),
(24, 11, NULL, NULL, NULL, 1, 'Event: tes', 'Event: tes', '2026-09-07 14:19:46', '2026-09-07 14:19:51', 'OUT', '2026-09-07 14:19:46', '2026-09-07 14:19:51', NULL, 3),
(25, 12, 'rafie', NULL, '08765256525', NULL, 'bayar wifi', '-', '2026-09-08 08:37:49', '2026-09-08 08:38:08', 'OUT', '2026-09-08 08:37:49', '2026-09-08 10:45:03', '2026-09-08 10:45:03', NULL),
(26, 12, 'rafie', NULL, '08765256525', NULL, 'bayar wifi', '-', '2026-09-08 08:38:08', '2026-09-08 10:09:01', 'OUT', '2026-09-08 08:38:08', '2026-09-08 10:45:03', '2026-09-08 10:45:03', NULL),
(27, 12, 'rafie', NULL, '08765256525', NULL, 'bayar wifi', '-', '2026-09-08 10:09:01', '2026-09-08 10:19:11', 'OUT', '2026-09-08 10:09:01', '2026-09-08 10:45:03', '2026-09-08 10:45:03', NULL),
(28, 12, 'rafie', NULL, '08765256525', NULL, 'aloo', '-', '2026-09-08 10:19:11', '2026-09-08 10:26:51', 'OUT', '2026-09-08 10:19:11', '2026-09-08 10:45:03', '2026-09-08 10:45:03', NULL),
(29, 12, 'rafie', NULL, '08765256525', NULL, 'tess', '-', '2026-09-08 10:26:51', '2026-09-08 10:44:43', 'OUT', '2026-09-08 10:26:51', '2026-09-08 10:45:03', '2026-09-08 10:45:03', NULL),
(30, 13, 'rafie', NULL, '08572425523', NULL, 'bayar wifi', '-', '2026-09-08 10:46:04', '2026-09-08 10:46:20', 'OUT', '2026-09-08 10:46:04', '2026-09-08 10:46:21', NULL, NULL),
(31, 13, 'rafie', NULL, '08572425523', NULL, 'bayar wifi', '-', '2026-09-08 10:46:21', '2026-09-08 11:06:49', 'OUT', '2026-09-08 10:46:21', '2026-09-08 11:06:49', NULL, NULL),
(32, 13, 'rafie', NULL, '08572425523', NULL, 'Meeting', '-', '2026-09-08 11:06:49', '2026-09-08 15:59:49', 'OUT', '2026-09-08 11:06:49', '2026-09-08 15:59:49', NULL, NULL),
(33, 11, NULL, NULL, NULL, 1, 'Event: tes', 'Event: tes', '2026-09-08 11:37:58', '2026-09-08 11:38:05', 'OUT', '2026-09-08 11:37:58', '2026-09-08 11:38:05', NULL, 3),
(34, 9, NULL, NULL, NULL, 1, 'Event: tes', 'Event: tes', '2026-09-08 11:38:11', '2026-09-08 11:38:15', 'OUT', '2026-09-08 11:38:11', '2026-09-08 11:38:15', NULL, 3),
(35, 9, NULL, NULL, NULL, 1, 'Event: tes', 'Event: tes', '2026-09-08 11:38:30', '2026-09-08 11:38:45', 'OUT', '2026-09-08 11:38:30', '2026-09-08 11:38:45', NULL, 3),
(36, 11, NULL, NULL, NULL, 1, 'Event: tes', 'Event: tes', '2026-09-08 11:38:39', '2026-09-08 11:38:50', 'OUT', '2026-09-08 11:38:39', '2026-09-08 11:38:50', NULL, 3),
(37, 9, NULL, NULL, NULL, 1, 'Event: tes', 'Event: tes', '2026-09-08 11:38:55', '2026-09-08 11:39:00', 'OUT', '2026-09-08 11:38:55', '2026-09-08 11:39:00', NULL, 3),
(38, 13, 'rafie', NULL, '08572425523', NULL, 'Meeting', '-', '2026-09-08 15:59:49', '2026-09-09 10:32:30', 'OUT', '2026-09-08 15:59:49', '2026-09-09 10:32:30', NULL, NULL),
(39, 13, 'rafie', NULL, '08572425523', NULL, 'bayar wifi', '-', '2026-09-09 10:32:31', NULL, 'IN', '2026-09-09 10:32:31', '2026-09-09 10:32:31', NULL, NULL),
(40, 14, 'rendi', NULL, '0895355356917', NULL, 'bayar wifi', '-', '2026-09-09 14:19:07', '2026-09-09 14:19:26', 'OUT', '2026-09-09 14:19:07', '2026-09-09 14:19:26', NULL, NULL),
(41, 14, 'rendi', NULL, '0895355356917', NULL, 'bayar wifi', '-', '2026-09-09 14:19:26', NULL, 'IN', '2026-09-09 14:19:27', '2026-09-09 14:19:27', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_model_type_model_id_index` (`model_type`,`model_id`),
  ADD KEY `audit_logs_user_id_index` (`user_id`),
  ADD KEY `audit_logs_created_at_index` (`created_at`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `events_code_unique` (`code`),
  ADD KEY `events_created_by_foreign` (`created_by`),
  ADD KEY `events_status_index` (`status`),
  ADD KEY `events_start_date_index` (`start_date`);

--
-- Indexes for table `event_groups`
--
ALTER TABLE `event_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_groups_code_unique` (`code`),
  ADD UNIQUE KEY `event_groups_register_token_unique` (`register_token`),
  ADD KEY `event_groups_game_event_id_code_index` (`game_event_id`,`code`);

--
-- Indexes for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_participants_unique_registration` (`event_id`,`phone`),
  ADD KEY `event_participants_visitor_id_foreign` (`visitor_id`),
  ADD KEY `event_participants_event_id_status_index` (`event_id`,`status`);

--
-- Indexes for table `face_embeddings`
--
ALTER TABLE `face_embeddings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `face_embeddings_visitor_id_foreign` (`visitor_id`);

--
-- Indexes for table `game_events`
--
ALTER TABLE `game_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_events_created_by_foreign` (`created_by`),
  ADD KEY `game_events_status_index` (`status`),
  ADD KEY `game_events_start_date_index` (`start_date`);

--
-- Indexes for table `group_participants`
--
ALTER TABLE `group_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_participants_event_group_id_phone_unique` (`event_group_id`,`phone`),
  ADD KEY `group_participants_event_group_id_phone_index` (`event_group_id`,`phone`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `point_qr_codes`
--
ALTER TABLE `point_qr_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `point_qr_codes_token_unique` (`token`),
  ADD KEY `point_qr_codes_game_event_id_status_index` (`game_event_id`,`status`),
  ADD KEY `point_qr_codes_token_index` (`token`);

--
-- Indexes for table `point_transactions`
--
ALTER TABLE `point_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participant_qr_scan` (`group_participant_id`,`point_qr_code_id`),
  ADD KEY `point_transactions_point_qr_code_id_foreign` (`point_qr_code_id`),
  ADD KEY `point_transactions_game_event_id_scanned_at_index` (`game_event_id`,`scanned_at`),
  ADD KEY `point_transactions_event_group_id_index` (`event_group_id`),
  ADD KEY `point_transactions_group_participant_id_index` (`group_participant_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `system_settings_key_unique` (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `visitors_phone_index` (`phone`);

--
-- Indexes for table `visits`
--
ALTER TABLE `visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `visits_receptionist_id_foreign` (`receptionist_id`),
  ADD KEY `visits_visitor_id_foreign` (`visitor_id`),
  ADD KEY `visits_status_index` (`status`),
  ADD KEY `visits_check_in_index` (`check_in`),
  ADD KEY `visits_event_id_status_index` (`event_id`,`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `event_groups`
--
ALTER TABLE `event_groups`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `face_embeddings`
--
ALTER TABLE `face_embeddings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `game_events`
--
ALTER TABLE `game_events`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `group_participants`
--
ALTER TABLE `group_participants`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `point_qr_codes`
--
ALTER TABLE `point_qr_codes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `point_transactions`
--
ALTER TABLE `point_transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `visits`
--
ALTER TABLE `visits`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `event_groups`
--
ALTER TABLE `event_groups`
  ADD CONSTRAINT `event_groups_game_event_id_foreign` FOREIGN KEY (`game_event_id`) REFERENCES `game_events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `event_participants_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_participants_visitor_id_foreign` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `face_embeddings`
--
ALTER TABLE `face_embeddings`
  ADD CONSTRAINT `face_embeddings_visitor_id_foreign` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `game_events`
--
ALTER TABLE `game_events`
  ADD CONSTRAINT `game_events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_participants`
--
ALTER TABLE `group_participants`
  ADD CONSTRAINT `group_participants_event_group_id_foreign` FOREIGN KEY (`event_group_id`) REFERENCES `event_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `point_qr_codes`
--
ALTER TABLE `point_qr_codes`
  ADD CONSTRAINT `point_qr_codes_game_event_id_foreign` FOREIGN KEY (`game_event_id`) REFERENCES `game_events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `point_transactions`
--
ALTER TABLE `point_transactions`
  ADD CONSTRAINT `point_transactions_event_group_id_foreign` FOREIGN KEY (`event_group_id`) REFERENCES `event_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `point_transactions_game_event_id_foreign` FOREIGN KEY (`game_event_id`) REFERENCES `game_events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `point_transactions_group_participant_id_foreign` FOREIGN KEY (`group_participant_id`) REFERENCES `group_participants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `point_transactions_point_qr_code_id_foreign` FOREIGN KEY (`point_qr_code_id`) REFERENCES `point_qr_codes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `visits`
--
ALTER TABLE `visits`
  ADD CONSTRAINT `visits_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `visits_receptionist_id_foreign` FOREIGN KEY (`receptionist_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `visits_visitor_id_foreign` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE SET NULL;
--
-- Table structure for table `reservation_invitations`
--

CREATE TABLE IF NOT EXISTS `reservation_invitations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('personal','mass') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'personal',
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meet_to` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quota` int NOT NULL DEFAULT '1',
  `used_count` int NOT NULL DEFAULT '0',
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservation_invitations_token_unique` (`token`),
  KEY `reservation_invitations_is_active_expires_at_index` (`is_active`,`expires_at`),
  KEY `reservation_invitations_created_by_foreign` (`created_by`),
  CONSTRAINT `reservation_invitations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `reservations`
--

CREATE TABLE IF NOT EXISTS `reservations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint UNSIGNED DEFAULT NULL,
  `reservation_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visitor_id` bigint UNSIGNED NOT NULL,
  `visitor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visitor_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visitor_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visitor_company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meet_to` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('APPROVED','CHECKED_IN','CHECKED_OUT','EXPIRED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'APPROVED',
  `approved_at` datetime NOT NULL,
  `checked_in_at` datetime DEFAULT NULL,
  `checked_out_at` datetime DEFAULT NULL,
  `visit_id` bigint UNSIGNED DEFAULT NULL,
  `biometric_consent` tinyint(1) NOT NULL DEFAULT '1',
  `has_face_registered` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservations_reservation_code_unique` (`reservation_code`),
  KEY `reservations_invitation_id_foreign` (`invitation_id`),
  KEY `reservations_visitor_id_foreign` (`visitor_id`),
  KEY `reservations_visit_id_foreign` (`visit_id`),
  KEY `reservations_visitor_phone_index` (`visitor_phone`),
  KEY `reservations_scheduled_date_index` (`scheduled_date`),
  KEY `reservations_status_index` (`status`),
  KEY `reservations_visitor_id_status_scheduled_date_index` (`visitor_id`,`status`,`scheduled_date`),
  CONSTRAINT `reservations_invitation_id_foreign` FOREIGN KEY (`invitation_id`) REFERENCES `reservation_invitations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_visitor_id_foreign` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_visit_id_foreign` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
