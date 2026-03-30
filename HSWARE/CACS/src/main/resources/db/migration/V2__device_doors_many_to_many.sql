-- 1. Create join table
CREATE TABLE device_door (
                             device_id INTEGER NOT NULL REFERENCES device(id) ON DELETE CASCADE,
                             door_id INTEGER NOT NULL REFERENCES door(id) ON DELETE CASCADE,
                             PRIMARY KEY (device_id, door_id)
);

-- 2. Migrate existing data
INSERT INTO device_door (device_id, door_id)
SELECT id, door_id FROM device
WHERE door_id IS NOT NULL;

-- 3. Drop old FK + column
ALTER TABLE device DROP CONSTRAINT IF EXISTS device_door_id_fkey;
ALTER TABLE device DROP COLUMN door_id;

-- 4. Remove old index
DROP INDEX IF EXISTS idx_device_door_id;

-- 5. Add indexes
CREATE INDEX idx_device_door_device_id ON device_door(device_id);
CREATE INDEX idx_device_door_door_id ON device_door(door_id);