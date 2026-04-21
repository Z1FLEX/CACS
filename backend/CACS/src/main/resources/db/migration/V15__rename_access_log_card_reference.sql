ALTER TABLE access_log
    RENAME COLUMN card_uid TO card_reference;

ALTER INDEX IF EXISTS idx_access_log_card_uid
    RENAME TO idx_access_log_card_reference;
