-- Quick Admin User Creation
-- This creates a user with a known working BCrypt hash
-- and assigns the ADMIN role through user_roles

-- Delete existing user if exists
DELETE FROM users WHERE email = 'admin@cacs.com';

-- Create admin user with known working hash
-- Email: admin@cacs.com
-- Password: password
INSERT INTO users (email, password, first_name, last_name, status) 
VALUES (
    'admin@cacs.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
    'Admin',
    'User',
    'ACTIVE'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'admin@cacs.com'
ON CONFLICT DO NOTHING;

-- Verify creation
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.status,
    ARRAY_AGG(r.name ORDER BY r.name) AS roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'admin@cacs.com'
GROUP BY u.id, u.email, u.first_name, u.last_name, u.status;
