-- Adicionar 'evening' ao enum shift da tabela students
ALTER TABLE `students` MODIFY COLUMN `shift` enum('morning','afternoon','full','evening');
