ALTER TABLE day_time_slot
ADD COLUMN title VARCHAR(100);

UPDATE day_time_slot dts
SET title = s.name
FROM schedule_day sd
JOIN schedule s ON s.id = sd.schedule_id
WHERE dts.schedule_day_id = sd.id
  AND (dts.title IS NULL OR dts.title = '');

ALTER TABLE day_time_slot
ALTER COLUMN title SET NOT NULL;
