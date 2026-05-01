-- Mudança 1: Expandir role enum para 4 perfis
-- Adiciona sain_assessor e external_professional ao enum de roles

ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin', 'sain_assessor', 'external_professional', 'school_user') NOT NULL DEFAULT 'school_user';
