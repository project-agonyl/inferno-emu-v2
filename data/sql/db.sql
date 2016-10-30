-- DROP PREVIOUS TABLES
DROP TABLE IF EXISTS `character`;
DROP TABLE IF EXISTS `map`;
DROP TABLE IF EXISTS `account`;

-- CREATE NEW TABLES
CREATE TABLE `account` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE ,
  `username` VARCHAR(255) NOT NULL ,
  `email` VARCHAR(255) NOT NULL ,
  `password` VARCHAR(255) NOT NULL ,
  `status` INT NOT NULL DEFAULT '10' ,
  `access_level` INT NOT NULL DEFAULT '1' ,
  `is_online` BOOLEAN NOT NULL DEFAULT FALSE ,
  `created_by` INT NULL ,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `updated_by` INT NULL ,
  `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL ,
  PRIMARY KEY (`id`), UNIQUE `unique_username` (`username`)
) ENGINE = InnoDB;
ALTER TABLE `account` ADD FOREIGN KEY fk_account_created_by(`created_by`) REFERENCES account(`id`) ON DELETE CASCADE;
ALTER TABLE `account` ADD FOREIGN KEY fk_account_updated_by(`updated_by`) REFERENCES account(`id`) ON DELETE CASCADE;

CREATE TABLE `map` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE ,
  `name` VARCHAR(255) NOT NULL ,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE ,
  `created_by` INT NULL ,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `updated_by` INT NULL ,
  `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL ,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
ALTER TABLE `map` ADD FOREIGN KEY fk_map_created_by(`created_by`) REFERENCES account(`id`) ON DELETE CASCADE;
ALTER TABLE `map` ADD FOREIGN KEY fk_map_updated_by(`updated_by`) REFERENCES account(`id`) ON DELETE CASCADE;

CREATE TABLE `character` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE ,
  `account_id` INT NOT NULL ,
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
  `current_hp` INT NOT NULL DEFAULT '1' ,
  `maximum_hp` INT NOT NULL DEFAULT '200' ,
  `current_hp_charge` INT NOT NULL DEFAULT '120' ,
  `maximum_hp_charge` INT NOT NULL DEFAULT '4000' ,
  `current_mp` INT NOT NULL DEFAULT '1' ,
  `maximum_mp` INT NOT NULL DEFAULT '200' ,
  `current_mp_charge` INT NOT NULL DEFAULT '30' ,
  `maximum_mp_charge` INT NOT NULL DEFAULT '4000' ,
  `strength` INT NOT NULL DEFAULT '50' ,
  `intelligence` INT NOT NULL DEFAULT '50' ,
  `dexerity` INT NOT NULL DEFAULT '50' ,
  `vitality` INT NOT NULL DEFAULT '50' ,
  `mana` INT NOT NULL DEFAULT '50' ,
  `remaining_skill_points` INT NOT NULL DEFAULT '0' ,
  `experience` INT NOT NULL DEFAULT '0' ,
  `parole` INT NOT NULL DEFAULT '0' ,
  `lore_points` INT NOT NULL DEFAULT '0' ,
  `woonz` INT NOT NULL DEFAULT '0' ,
  `passive_skill_points` INT NOT NULL DEFAULT '0' ,
  `attack` INT NOT NULL DEFAULT '25' ,
  `magic_attack` INT NOT NULL DEFAULT '25' ,
  `defense` INT NOT NULL DEFAULT '25' ,
  `map_id` INT NULL ,
  `location_x` INT NULL ,
  `location_y` INT NULL ,
  `is_active` BOOLEAN NOT NULL DEFAULT FALSE ,
  `created_by` INT NULL ,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `updated_by` INT NULL ,
  `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL ,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
ALTER TABLE `character` ADD FOREIGN KEY fk_character_account(`account_id`) REFERENCES account(`id`) ON DELETE CASCADE;
ALTER TABLE `character` ADD FOREIGN KEY fk_character_map(`map_id`) REFERENCES map(`id`) ON DELETE CASCADE;
ALTER TABLE `character` ADD FOREIGN KEY fk_character_created_by(`created_by`) REFERENCES account(`id`) ON DELETE CASCADE;
ALTER TABLE `character` ADD FOREIGN KEY fk_character_updated_by(`updated_by`) REFERENCES account(`id`) ON DELETE CASCADE;
