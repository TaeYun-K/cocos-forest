-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: cocos_forest_dev
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_products`
--

DROP TABLE IF EXISTS `account_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_products` (
  `product_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `account_type_unique_no` varchar(32) NOT NULL,
  `bank_code` varchar(10) NOT NULL,
  `account_type_code` varchar(5) NOT NULL,
  `account_type_name` varchar(50) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_description` varchar(255) NOT NULL,
  `account_type` enum('DOMESTIC','FOREIGN','ETC') NOT NULL DEFAULT 'DOMESTIC',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `uk_ddp_unique_no` (`account_type_unique_no`),
  KEY `idx_ddp_bank` (`bank_code`),
  CONSTRAINT `fk_account_products_bank` FOREIGN KEY (`bank_code`) REFERENCES `banks` (`bank_code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `asset_categories`
--

DROP TABLE IF EXISTS `asset_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `code` varchar(64) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpjon9lx9iqq4sljpke98opg2` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `price_points` int NOT NULL,
  `sprite_key` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_assets_sprite_key` (`sprite_key`),
  KEY `FKcwxkksxvxtrvv0sjtu5cgflep` (`category_id`),
  CONSTRAINT `FKcwxkksxvxtrvv0sjtu5cgflep` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `banks`
--

DROP TABLE IF EXISTS `banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banks` (
  `bank_code` varchar(10) NOT NULL,
  `bank_name` varchar(50) NOT NULL,
  PRIMARY KEY (`bank_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `card_products`
--

DROP TABLE IF EXISTS `card_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_products` (
  `product_id` bigint NOT NULL AUTO_INCREMENT,
  `issuer_code` varchar(10) NOT NULL,
  `card_unique_no` varchar(64) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` tinytext,
  `baseline_performance` int DEFAULT NULL,
  `max_benefit_limit` int DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `card_transactions`
--

DROP TABLE IF EXISTS `card_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `category_id` varchar(32) NOT NULL,
  `transaction_no` varchar(64) NOT NULL,
  `card_last4` varchar(32) DEFAULT NULL,
  `issue_code` varchar(10) DEFAULT NULL,
  `card_name` varchar(100) DEFAULT NULL,
  `merchant_id` bigint unsigned DEFAULT NULL,
  `tx_date` date NOT NULL,
  `tx_time` time DEFAULT NULL,
  `amount_krw` bigint NOT NULL,
  `status` enum('APPROVED','CANCELED','PENDING','OTHER') NOT NULL DEFAULT 'APPROVED',
  `raw_response` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_card_tx_user_txno` (`user_id`,`transaction_no`),
  KEY `idx_card_tx_category` (`category_id`),
  KEY `idx_card_tx_user_date` (`user_id`,`tx_date`),
  KEY `fk_card_tx_merchant` (`merchant_id`),
  CONSTRAINT `fk_card_tx_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `fk_card_tx_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_card_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` varchar(32) NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `challenges`
--

DROP TABLE IF EXISTS `challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challenges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` varchar(32) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `difficulty` enum('EASY','HARD','NORMAL') NOT NULL,
  `reward_points` int NOT NULL DEFAULT '0',
  `metric_type` enum('AMOUNT','ATTENDANCE','EMISSION','STEPS') DEFAULT NULL,
  `comparator` enum('GTE','LTE') DEFAULT NULL,
  `threshold_value` decimal(12,3) NOT NULL DEFAULT '0.000',
  `period` enum('DAILY') NOT NULL,
  `extra_conditions` json DEFAULT NULL COMMENT 'e.g., last-week average etc.',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reward_type` enum('AUTO','MANUAL') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_challenges_category` (`category_id`),
  CONSTRAINT `fk_challenges_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_carbon_footprints`
--

DROP TABLE IF EXISTS `daily_carbon_footprints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_carbon_footprints` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `target_date` date NOT NULL COMMENT '분석 대상 날짜',
  `total_carbon_emissions` double NOT NULL COMMENT '계산된 총 탄소 배출량 (g 단위)',
  `ai_advice` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_daily_carbon_footprints_user_id_target_date` (`user_id`,`target_date`),
  CONSTRAINT `fk_daily_carbon_footprints_to_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='일별 탄소 배출량 분석 결과';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_emissions`
--

DROP TABLE IF EXISTS `daily_emissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_emissions` (
  `user_id` bigint unsigned NOT NULL,
  `emission_date` date NOT NULL,
  `total_emission` decimal(12,3) NOT NULL DEFAULT '0.000',
  `per_category` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`emission_date`),
  CONSTRAINT `fk_daily_emissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_steps`
--

DROP TABLE IF EXISTS `daily_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_steps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `steps` int NOT NULL,
  `target_date` date NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_daily_steps_user_date` (`user_id`,`target_date`),
  KEY `idx_daily_steps_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_verifications`
--

DROP TABLE IF EXISTS `email_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verifications` (
  `email` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `verified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emission_factors`
--

DROP TABLE IF EXISTS `emission_factors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emission_factors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` varchar(32) NOT NULL,
  `factor` decimal(12,6) NOT NULL COMMENT 'kgCO2e per KRW',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emission_factors_category` (`category_id`),
  CONSTRAINT `fk_emission_factors_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forests`
--

DROP TABLE IF EXISTS `forests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `size` int NOT NULL DEFAULT '8',
  `pond_x` int NOT NULL DEFAULT '3',
  `pond_y` int NOT NULL DEFAULT '3',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_forest` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `forests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자별 숲 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `merchants`
--

DROP TABLE IF EXISTS `merchants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `merchants` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(200) NOT NULL,
  `category_id` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_merch_category` (`category_id`),
  CONSTRAINT `fk_merch_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `points_ledger`
--

DROP TABLE IF EXISTS `points_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `points_ledger` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `entry_id` varchar(64) DEFAULT NULL,
  `occurred_at` datetime NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `entry_type` enum('EARN','SPEND','ADJUST') NOT NULL,
  `source` varchar(50) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `challenge_id` varchar(32) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(64) DEFAULT NULL,
  `idempotency_key` varchar(128) DEFAULT NULL,
  `ref_type` varchar(50) DEFAULT NULL COMMENT 'e.g., CHALLENGE, etc.',
  `ref_id` bigint DEFAULT NULL COMMENT 'e.g., user_challenges.id',
  `points` int NOT NULL,
  `balance_after` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_points_ledger_entry_id` (`entry_id`),
  UNIQUE KEY `idx_points_ledger_idempotency` (`idempotency_key`),
  KEY `idx_points_user` (`user_id`),
  KEY `idx_points_ref` (`ref_id`),
  KEY `idx_points_ledger_user_occurred` (`user_id`,`occurred_at` DESC),
  KEY `idx_points_ledger_challenge` (`challenge_id`,`user_id`,`occurred_at` DESC),
  KEY `idx_points_ledger_source` (`source`,`user_id`,`occurred_at` DESC),
  CONSTRAINT `fk_points_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_balance_after_non_negative` CHECK ((`balance_after` >= 0)),
  CONSTRAINT `chk_points_positive` CHECK ((`points` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=183 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `social_accounts`
--

DROP TABLE IF EXISTS `social_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `provider` enum('LOCAL','GOOGLE') NOT NULL,
  `google_sub` varchar(128) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL COMMENT 'NULL unless provider=LOCAL',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_social_google_sub` (`google_sub`),
  KEY `idx_social_user` (`user_id`),
  CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ssafy_linkages`
--

DROP TABLE IF EXISTS `ssafy_linkages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ssafy_linkages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `api_key` varchar(64) NOT NULL,
  `user_key` varchar(64) NOT NULL,
  `fintech_app_no` varchar(10) NOT NULL DEFAULT '001',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `institution_code` varchar(10) NOT NULL COMMENT '기관코드 (예: 00100)',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ssafy_linkages_user` (`user_id`),
  UNIQUE KEY `idx_linkage_user` (`user_id`),
  CONSTRAINT `fk_ssafy_linkages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `item_name` varchar(255) NOT NULL COMMENT '상품/서비스명',
  `amount` int unsigned NOT NULL COMMENT '거래 금액',
  `category` varchar(50) NOT NULL COMMENT '소비 카테고리 (예: 식료품, 교통, 쇼핑)',
  `transaction_at` datetime NOT NULL COMMENT '거래 발생 시각',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transactions_user_id_transaction_at` (`user_id`,`transaction_at`),
  CONSTRAINT `fk_transactions_to_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=726 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='사용자 거래 내역';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trees`
--

DROP TABLE IF EXISTS `trees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trees` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dead_highlight` bit(1) NOT NULL,
  `forest_id` bigint unsigned NOT NULL,
  `growth_days` int NOT NULL,
  `growth_stage` enum('LARGE','MEDIUM','SMALL') NOT NULL,
  `health` int NOT NULL,
  `is_dead` bit(1) NOT NULL,
  `last_watered_date` date DEFAULT NULL,
  `max_health` int NOT NULL,
  `planted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `water_count_today` int NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK47fjgqyv6ollxbu18okrlkaym` (`forest_id`),
  CONSTRAINT `FK47fjgqyv6ollxbu18okrlkaym` FOREIGN KEY (`forest_id`) REFERENCES `forests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_accounts`
--

DROP TABLE IF EXISTS `user_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_accounts` (
  `account_id` bigint NOT NULL AUTO_INCREMENT,
  `account_no` varchar(20) NOT NULL,
  `account_type_unique_no` varchar(32) NOT NULL,
  `bank_code` varchar(10) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `currency_name` varchar(20) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `uk_user_accounts_account_no` (`account_no`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_cards`
--

DROP TABLE IF EXISTS `user_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_cards` (
  `user_card_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `card_unique_no` varchar(64) NOT NULL,
  `issuer_code` varchar(10) NOT NULL,
  `issuer_name` varchar(50) DEFAULT NULL,
  `card_name` varchar(100) DEFAULT NULL,
  `card_no_masked` varchar(32) NOT NULL,
  `last4` varchar(4) NOT NULL,
  `expiry_ymd` varchar(8) NOT NULL,
  `withdrawal_account_no` varchar(32) NOT NULL,
  `withdrawal_day` tinyint NOT NULL,
  `baseline_performance` int DEFAULT NULL,
  `max_benefit_limit` int DEFAULT NULL,
  `card_description` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_card_id`),
  UNIQUE KEY `uk_user_card` (`user_id`,`card_unique_no`),
  KEY `idx_user_cards_user` (`user_id`),
  KEY `idx_user_cards_product` (`product_id`),
  CONSTRAINT `fk_user_cards_product` FOREIGN KEY (`product_id`) REFERENCES `card_products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_challenges`
--

DROP TABLE IF EXISTS `user_challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_challenges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `challenge_id` bigint unsigned NOT NULL,
  `challenge_date` date NOT NULL,
  `status` enum('DONE','FAIL','PENDING') NOT NULL,
  `snapshot_json` json DEFAULT NULL COMMENT 'numbers used when evaluating',
  `reward_points` int NOT NULL DEFAULT '0',
  `achieved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_challenges_user_chal_date` (`user_id`,`challenge_id`,`challenge_date`),
  KEY `idx_user_challenges_user` (`user_id`),
  KEY `idx_user_challenges_chal` (`challenge_id`),
  CONSTRAINT `fk_user_challenges_challenge` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`),
  CONSTRAINT `fk_user_challenges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_decorations`
--

DROP TABLE IF EXISTS `user_decorations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_decorations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `asset_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `forest_id` bigint unsigned NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_decorations_forest_cell` (`forest_id`,`x`,`y`),
  KEY `FKrkt8ajbwsbmtoo2foqunjmj7w` (`asset_id`),
  CONSTRAINT `FKfi7tvbk2sulw1kfnpf9jr3478` FOREIGN KEY (`forest_id`) REFERENCES `forests` (`id`),
  CONSTRAINT `FKrkt8ajbwsbmtoo2foqunjmj7w` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_plants`
--

DROP TABLE IF EXISTS `user_plants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_plants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `forest_id` bigint unsigned NOT NULL,
  `asset_id` bigint unsigned NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  `growth_stage` enum('SMALL','MEDIUM','LARGE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SMALL',
  `health` int NOT NULL,
  `max_health` int NOT NULL,
  `growth_days` int NOT NULL DEFAULT '0',
  `is_dead` tinyint(1) NOT NULL DEFAULT '0',
  `dead_highlight` tinyint(1) NOT NULL DEFAULT '0',
  `last_watered_date` date DEFAULT NULL,
  `water_count_today` int NOT NULL DEFAULT '0',
  `planted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_position` (`forest_id`,`x`,`y`),
  KEY `idx_forest_id` (`forest_id`),
  KEY `idx_growth_stage` (`growth_stage`),
  KEY `idx_is_dead` (`is_dead`),
  KEY `idx_last_watered_date` (`last_watered_date`),
  KEY `idx_trees_asset_id` (`asset_id`),
  CONSTRAINT `fk_trees_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `user_plants_ibfk_1` FOREIGN KEY (`forest_id`) REFERENCES `forests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='숲에 심어진 나무 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `current_balance` bigint NOT NULL DEFAULT '0',
  `phone_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `terms_agreed_at` datetime NOT NULL,
  `privacy_policy_agreed_at` datetime NOT NULL,
  `marketing_agreed_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_nickname` (`nickname`),
  UNIQUE KEY `uk_users_phone_number` (`phone_number`),
  KEY `idx_users_deleted_at` (`deleted_at`),
  CONSTRAINT `chk_current_balance_non_negative` CHECK ((`current_balance` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-29 12:21:47
