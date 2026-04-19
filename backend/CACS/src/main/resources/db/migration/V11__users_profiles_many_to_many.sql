CREATE TABLE IF NOT EXISTS user_profile (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id INTEGER NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, profile_id)
);

INSERT INTO user_profile (user_id, profile_id)
SELECT id, profile_id
FROM users
WHERE profile_id IS NOT NULL
ON CONFLICT DO NOTHING;
