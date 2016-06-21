CREATE IF NOT EXISTS TABLE `account` (
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
ALTER TABLE account ADD FOREIGN KEY fk_created_by(`created_by`) REFERENCES account(`id`) ON DELETE CASCADE;
ALTER TABLE account ADD FOREIGN KEY fk_updated_by(`updated_by`) REFERENCES account(`id`) ON DELETE CASCADE;
