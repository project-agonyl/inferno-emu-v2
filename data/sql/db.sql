DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` BIGINT NOT NULL AUTO_INCREMENT ,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE ,
  `username` VARCHAR(255) NOT NULL ,
  `email` VARCHAR(255) NOT NULL ,
  `password` VARCHAR(255) NOT NULL ,
  `status` INT NOT NULL DEFAULT '10' ,
  `access_level` INT NOT NULL DEFAULT '1' ,
  `is_online` BOOLEAN NOT NULL DEFAULT FALSE ,
  `created_by` BIGINT NULL ,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `updated_by` BIGINT NULL ,
  `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL ,
  PRIMARY KEY (`id`), UNIQUE `unique_username` (`username`)
) ENGINE = InnoDB;
ALTER TABLE `account` ADD FOREIGN KEY fk_created_by(`created_by`) REFERENCES account(`id`) ON DELETE CASCADE;
ALTER TABLE `account` ADD FOREIGN KEY fk_updated_by(`updated_by`) REFERENCES account(`id`) ON DELETE CASCADE;

DROP TABLE IF EXISTS `character`;
CREATE TABLE `character` (
  `id` BIGINT NOT NULL AUTO_INCREMENT ,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE ,
  `account_id` BIGINT NOT NULL ,
  `name` VARCHAR(255) NOT NULL ,
  `type` INT NOT NULL DEFAULT '0' ,
  `town` INT NOT NULL DEFAULT '0' ,
  `level` INT NOT NULL DEFAULT '1' ,
  `wear_shield` VARCHAR(255) NULL ,
  `wear_weapon` VARCHAR(255) NULL ,
  `wear_helmet` VARCHAR(255) NULL ,
  `wear_armor` VARCHAR(255) NULL ,
  `wear_pants` VARCHAR(255) NULL ,
  `wear_gloves` VARCHAR(255) NULL ,
  `wear_boots` VARCHAR(255) NULL ,
  `wear_necklace` VARCHAR(255) NULL ,
  `wear_ring` VARCHAR(255) NULL ,
  `is_active` BOOLEAN NOT NULL DEFAULT FALSE ,
  `created_by` BIGINT NULL ,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `updated_by` BIGINT NULL ,
  `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL ,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
ALTER TABLE `character` ADD FOREIGN KEY fk_account(`account_id`) REFERENCES account(`id`) ON DELETE CASCADE;
ALTER TABLE `character` ADD FOREIGN KEY fk_created_by(`created_by`) REFERENCES account(`id`) ON DELETE CASCADE;
ALTER TABLE `character` ADD FOREIGN KEY fk_updated_by(`updated_by`) REFERENCES account(`id`) ON DELETE CASCADE;
