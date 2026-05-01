-- Migration: Add userId to farol_advisors for linking to users table
-- This enables external_professional users to see their assigned cases

ALTER TABLE `farol_advisors` 
ADD COLUMN `userId` INT NULL AFTER `id`;

-- Update existing advisors: try to match by email
UPDATE `farol_advisors` fa
INNER JOIN `users` u ON u.email = fa.email
SET fa.userId = u.id
WHERE fa.userId IS NULL;
