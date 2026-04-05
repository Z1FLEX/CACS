CREATE TABLE profile_schedule (
    profile_id INTEGER NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
    schedule_id INTEGER NOT NULL REFERENCES schedule(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, schedule_id)
);

INSERT INTO profile_schedule (profile_id, schedule_id)
SELECT id, schedule_id
FROM profile
WHERE schedule_id IS NOT NULL
ON CONFLICT DO NOTHING;
