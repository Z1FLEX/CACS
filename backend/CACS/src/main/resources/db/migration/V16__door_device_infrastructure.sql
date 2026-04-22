ALTER TABLE device
    ADD COLUMN IF NOT EXISTS zone_id INTEGER REFERENCES zone(id),
    ADD COLUMN IF NOT EXISTS relay_count INTEGER;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'device'
          AND column_name = 'door_id'
    ) THEN
        EXECUTE $sql$
            UPDATE device
            SET zone_id = d.zone_id
            FROM door d
            WHERE d.id = device.door_id
              AND d.zone_id IS NOT NULL
              AND device.zone_id IS NULL
        $sql$;
    END IF;
END $$;

UPDATE device
SET zone_id = (
    SELECT d.zone_id
    FROM device_door dd
    JOIN door d ON d.id = dd.door_id
    WHERE dd.device_id = device.id
      AND d.zone_id IS NOT NULL
    ORDER BY d.id
    LIMIT 1
)
WHERE zone_id IS NULL;

UPDATE device
SET relay_count = 1
WHERE relay_count IS NULL;

UPDATE device
SET deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP)
WHERE zone_id IS NULL;

ALTER TABLE device
    ALTER COLUMN relay_count SET NOT NULL;

ALTER TABLE device
    DROP CONSTRAINT IF EXISTS chk_device_zone_required_active,
    ADD CONSTRAINT chk_device_zone_required_active
        CHECK (deleted_at IS NOT NULL OR zone_id IS NOT NULL);

ALTER TABLE device
    DROP CONSTRAINT IF EXISTS chk_device_relay_count_positive,
    ADD CONSTRAINT chk_device_relay_count_positive CHECK (relay_count > 0);

ALTER TABLE door
    ADD COLUMN IF NOT EXISTS device_id INTEGER REFERENCES device(id),
    ADD COLUMN IF NOT EXISTS relay_index INTEGER;

UPDATE door
SET device_id = (
    SELECT dd.device_id
    FROM device_door dd
    WHERE dd.door_id = door.id
    ORDER BY dd.device_id
    LIMIT 1
)
WHERE device_id IS NULL;

ALTER TABLE door
    ALTER COLUMN zone_id SET NOT NULL;

ALTER TABLE door
    DROP CONSTRAINT IF EXISTS chk_door_relay_index_positive,
    ADD CONSTRAINT chk_door_relay_index_positive CHECK (relay_index IS NULL OR relay_index > 0);
