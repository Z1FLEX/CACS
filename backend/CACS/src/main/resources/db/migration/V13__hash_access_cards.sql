CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE access_card
SET num = encode(
    digest(
        COALESCE(NULLIF(TRIM(num), ''), NULLIF(TRIM(uid), '')),
        'sha256'
    ),
    'hex'
)
WHERE COALESCE(NULLIF(TRIM(num), ''), NULLIF(TRIM(uid), '')) IS NOT NULL;

ALTER TABLE access_card
    ALTER COLUMN uid DROP NOT NULL;

ALTER TABLE access_card
    DROP CONSTRAINT IF EXISTS access_card_uid_key;

DROP INDEX IF EXISTS idx_access_card_uid;

UPDATE access_card
SET uid = NULL
WHERE uid IS NOT NULL;

ALTER TABLE access_card
    ALTER COLUMN num TYPE VARCHAR(64),
    ALTER COLUMN num SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_access_card_num_active_unique
    ON access_card (num)
    WHERE deleted_at IS NULL;
