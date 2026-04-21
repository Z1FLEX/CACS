ALTER TABLE access_card
    ADD COLUMN IF NOT EXISTS uuid VARCHAR(36);

UPDATE access_card
SET uuid = gen_random_uuid()::text
WHERE uuid IS NULL;

ALTER TABLE access_card
    ALTER COLUMN uuid SET NOT NULL;

ALTER TABLE access_card
    ADD CONSTRAINT access_card_uuid_key UNIQUE (uuid);
