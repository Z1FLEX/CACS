-- Create Admin Users for JWT Authentication Testing
-- Run these queries in your PostgreSQL database to create test users

INSERT INTO users (email, password, first_name, last_name, status) 
VALUES (
    'admin@cacs.com',
    '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', -- password: admin123
    'System',
    'Administrator',
    'ACTIVE'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'admin@cacs.com'
ON CONFLICT DO NOTHING;

INSERT INTO users (email, password, first_name, last_name, status) 
VALUES (
    'test@cacs.com',
    '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', -- password: test123
    'Test',
    'User',
    'ACTIVE'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'test@cacs.com'
ON CONFLICT DO NOTHING;

INSERT INTO users (email, password, first_name, last_name, status) 
VALUES (
    'responsable@cacs.com',
    '$2a$10$U2S0z3ZlZqZzZzZzZzZzZOZfZfZfZfZfZfZfZfZfZfZfZfZfZfZf', -- password: resp123
    'Zone',
    'Responsable',
    'ACTIVE'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'RESPONSABLE'
WHERE u.email = 'responsable@cacs.com'
ON CONFLICT DO NOTHING;

INSERT INTO users (email, password, first_name, last_name, status) 
VALUES (
    'user@cacs.com',
    '$2a$10$8UnVWxIYcKjHuJrZP6kZ8OZfZfZfZfZfZfZfZfZfZfZfZfZfZfZf', -- password: user123
    'Regular',
    'User',
    'ACTIVE'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'USER'
WHERE u.email = 'user@cacs.com'
ON CONFLICT DO NOTHING;

INSERT INTO users (email, password, first_name, last_name, status) 
VALUES (
    'simple@cacs.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- password: password
    'Simple',
    'Test',
    'ACTIVE'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'simple@cacs.com'
ON CONFLICT DO NOTHING;

SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.status,
    ARRAY_AGG(r.name ORDER BY r.name) AS roles,
    u.created_at
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.first_name, u.last_name, u.status, u.created_at
ORDER BY u.created_at DESC;


-- TST DL--
-- Obsidian first page --
