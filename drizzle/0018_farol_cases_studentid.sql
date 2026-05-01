-- Fase 55.3: Add studentId to farol_cases for proper student-school binding
ALTER TABLE `farol_cases`
ADD COLUMN IF NOT EXISTS `studentId` int DEFAULT NULL AFTER `schoolId`;
