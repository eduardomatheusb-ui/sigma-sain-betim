-- Add nome column to farol_cases table
ALTER TABLE `farol_cases` ADD COLUMN `nome` varchar(255) NOT NULL DEFAULT '' AFTER `dataEntrada`;
