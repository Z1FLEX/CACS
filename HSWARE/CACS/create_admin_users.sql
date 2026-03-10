-- Create Admin Users for JWT Authentication Testing
-- Run these queries in your PostgreSQL database to create test users

-- First, delete any existing test users to avoid conflicts
DELETE FROM users WHERE email IN ('admin@cacs.com', 'test@cacs.com', 'responsable@cacs.com', 'user@cacs.com');

-- Admin User 1 - Email: admin@cacs.com, Password: admin123
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'admin@cacs.com',
    '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', -- password: admin123
    'System',
    'Administrator',
    'ADMIN',
    'ACTIVE'
);

-- Admin User 2 - Email: test@cacs.com, Password: test123
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'test@cacs.com',
    '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', -- password: test123
    'Test',
    'User',
    'ADMIN',
    'ACTIVE'
);

-- Responsable User - Email: responsable@cacs.com, Password: resp123
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'responsable@cacs.com',
    '$2a$10$U2S0z3ZlZqZzZzZzZzZzZOZfZfZfZfZfZfZfZfZfZfZfZfZfZfZf', -- password: resp123
    'Zone',
    'Responsable',
    'RESPONSABLE',
    'ACTIVE'
);

-- Regular User - Email: user@cacs.com, Password: user123
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'user@cacs.com',
    '$2a$10$8UnVWxIYcKjHuJrZP6kZ8OZfZfZfZfZfZfZfZfZfZfZfZfZfZfZf', -- password: user123
    'Regular',
    'User',
    'USER',
    'ACTIVE'
);

-- Simple test user with known working hash - Email: simple@cacs.com, Password: password
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'simple@cacs.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- password: password
    'Simple',
    'Test',
    'ADMIN',
    'ACTIVE'
);

-- Verify the users were created
SELECT id, email, first_name, last_name, role, status, created_at 
FROM users 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC;
