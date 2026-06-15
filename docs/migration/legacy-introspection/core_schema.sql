SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;
SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '8f3110ac-5e40-11f1-bf70-9fab7d6eb232:1-1087';
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(45) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `fullname` varchar(45) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `password` mediumtext COLLATE utf8mb4_general_ci NOT NULL,
  `user_type` enum('Admin','Sales','Regular','POS') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `access_control` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
  `status` enum('Active','Inactive') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Active',
  `last_login` datetime DEFAULT NULL,
  `creationdate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `U_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `fullname` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `batch` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` mediumtext COLLATE utf8mb4_general_ci,
  `phonenumber` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `validity` int DEFAULT NULL,
  `validity_unit` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `profile` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `generated_by` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `generated_for` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'activate',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=281859 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_appconfig` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting` mediumtext COLLATE utf8mb4_general_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_language` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `folder` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `author` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_plan` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `id_bw` int NOT NULL,
  `price` int DEFAULT NULL,
  `type` enum('Hotspot','PPPOE') COLLATE utf8mb4_general_ci NOT NULL,
  `typebp` enum('Unlimited','Limited') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `limit_type` enum('Time_Limit','Data_Limit','Both_Limit') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `time_limit` int unsigned DEFAULT NULL,
  `time_unit` enum('Mins','Hrs') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `data_limit` int unsigned DEFAULT NULL,
  `data_unit` enum('MB','GB') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `validity` int NOT NULL,
  `validity_unit` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `shared_users` int DEFAULT NULL,
  `routers` varchar(32) COLLATE utf8mb4_general_ci DEFAULT '0',
  `pool` varchar(40) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `access_control` int NOT NULL DEFAULT '0',
  `data_usage_gb` int NOT NULL DEFAULT '0',
  `daily_quota` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_bandwidth` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name_bw` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rate_down` int unsigned NOT NULL,
  `rate_down_unit` enum('Kbps','Mbps') COLLATE utf8mb4_general_ci NOT NULL,
  `rate_up` int unsigned NOT NULL,
  `rate_up_unit` enum('Kbps','Mbps') COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_routers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `ip_address` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_voucher` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('Hotspot','PPPOE') COLLATE utf8mb4_general_ci NOT NULL,
  `routers` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_plan` int NOT NULL,
  `code` varchar(55) COLLATE utf8mb4_general_ci NOT NULL,
  `batch` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `generated_by` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `generated_for` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `expired` tinyint(1) DEFAULT NULL,
  `allocation` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '0',
  `created_date` date DEFAULT NULL,
  `user_status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'activate',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=280111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_user_recharges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `plan_id` int NOT NULL,
  `namebp` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `recharged_on` date NOT NULL,
  `expiration` date DEFAULT NULL,
  `time` time NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `method` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `routers` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `type` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1491 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `plan_name` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `price` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `recharged_on` date NOT NULL,
  `expiration` date DEFAULT NULL,
  `time` time NOT NULL,
  `method` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `routers` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('Hotspot','PPPOE') COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1793 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_pool` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pool_name` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `range_ip` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `routers` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `to_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `message` mediumtext COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('0','1') COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` mediumtext COLLATE utf8mb4_general_ci,
  `userid` int DEFAULT NULL,
  `ip` mediumtext COLLATE utf8mb4_general_ci,
  `username` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13699 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_ip_binding` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mac_address` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `nas` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `consumer_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `registered_by` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `credit_limit` int DEFAULT NULL,
  `credit_balance` int NOT NULL,
  `available_balance` int DEFAULT NULL,
  `username` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `last_loaded_date` date DEFAULT NULL,
  `loaded_by` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_collected_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_registered_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_type` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `walletCompany` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_balance` int DEFAULT NULL,
  `balance_to_collect` int DEFAULT NULL,
  `last_loaded_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
