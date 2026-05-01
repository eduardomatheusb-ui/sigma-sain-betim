-- Migration: Add coordinator role and user_schools table
-- Phase 1: Expand role enum to include coordinator
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'sain_assessor', 'coordinator', 'external_professional', 'school_user') NOT NULL DEFAULT 'school_user';

-- Phase 2: Create user_schools many-to-many table
CREATE TABLE IF NOT EXISTS user_schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  schoolId INT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_school (userId, schoolId)
);

-- Phase 3: Migrate existing schoolId data from users to user_schools
INSERT IGNORE INTO user_schools (userId, schoolId)
SELECT id, schoolId FROM users WHERE schoolId IS NOT NULL;
