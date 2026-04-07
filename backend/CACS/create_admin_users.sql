-- Create Admin Users for JWT Authentication Testing
-- Run these queries in your PostgreSQL database to create test users


INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'admin@cacs.com',
    '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', -- password: admin123
    'System',
    'Administrator',
    'ADMIN',
    'ACTIVE'
);

INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'test@cacs.com',
    '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', -- password: test123
    'Test',
    'User',
    'ADMIN',
    'ACTIVE'
);

INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'responsable@cacs.com',
    '$2a$10$U2S0z3ZlZqZzZzZzZzZzZOZfZfZfZfZfZfZfZfZfZfZfZfZfZfZf', -- password: resp123
    'Zone',
    'Responsable',
    'RESPONSABLE',
    'ACTIVE'
);

INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'user@cacs.com',
    '$2a$10$8UnVWxIYcKjHuJrZP6kZ8OZfZfZfZfZfZfZfZfZfZfZfZfZfZfZf', -- password: user123
    'Regular',
    'User',
    'USER',
    'ACTIVE'
);

INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES (
    'simple@cacs.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- password: password
    'Simple',
    'Test',
    'ADMIN',
    'ACTIVE'
);

SELECT id, email, first_name, last_name, role, status, created_at 
FROM users 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC;


-- TST DL--
-- Obsidian first page --