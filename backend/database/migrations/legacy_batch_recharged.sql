CREATE TABLE `batch_recharged` (
  `id` int(11) NOT NULL,
  `nas` varchar(200) NOT NULL,
  `batch` varchar(200) NOT NULL,
  `recharged_on` varchar(200) DEFAULT NULL,
  `total_vouchers` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
