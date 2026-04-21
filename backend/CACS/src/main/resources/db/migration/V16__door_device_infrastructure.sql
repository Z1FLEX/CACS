ALTER TABLE device
    ADD COLUMN IF NOT EXISTS zone_id INTEGER REFERENCES zone(id),
    ADD COLUMN IF NOT EXISTS relay_count INTEGER;

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

ALTER TABLE device
    ALTER COLUMN zone_id SET NOT NULL,
    ALTER COLUMN relay_count SET NOT NULL;

ALTER TABLE device
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
    ADD CONSTRAINT chk_door_relay_index_positive CHECK (relay_index IS NULL OR relay_index > 0);
