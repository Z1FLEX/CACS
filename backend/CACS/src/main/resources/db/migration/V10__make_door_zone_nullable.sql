-- Door zone assignment is now optional (assigned/unassigned from UI modal)
-- Keep FK; only relax nullability.
ALTER TABLE door
    ALTER COLUMN zone_id DROP NOT NULL;
