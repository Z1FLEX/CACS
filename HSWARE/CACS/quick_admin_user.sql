-- Quick Admin User Creation
-- This creates a user with a known working BCrypt hash

-- Delete existing user if exists
DELETE FROM users WHERE email = 'admin@cacs.com';

-- Create admin user with known working hash
-- Email: admin@cacs.com
-- Password: password
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'admin@cacs.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
    'Admin',
    'User',
    'ADMIN',
    'ACTIVE'
);

-- Verify creation
SELECT id, email, first_name, last_name, role, status FROM users WHERE email = 'admin@cacs.com';
