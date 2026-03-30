
-- =========================
-- ENUM VALUES (stored as VARCHAR for JPA compatibility; values match spec)
-- ADMIN, RESPONSABLE, USER | ACTIVE, INACTIVE | ACTIVE, INACTIVE, REVOKED | ONLINE, OFFLINE | AUTHORIZED, DENIED
-- =========================

-- =========================
-- PHOTO
-- =========================
CREATE TABLE photo (
                       id SERIAL PRIMARY KEY,
                       content BYTEA NOT NULL
);

-- =========================
-- ZONE TYPE
-- =========================
CREATE TABLE zone_type (
                           id SERIAL PRIMARY KEY,
                           name VARCHAR(50) NOT NULL,
                           security_level INTEGER NOT NULL CHECK (security_level BETWEEN 0 AND 5),
                           deleted_at TIMESTAMP
);

-- =========================
-- ZONE
-- =========================
CREATE TABLE zone (
                      id SERIAL PRIMARY KEY,
                      name VARCHAR(100) NOT NULL,
                      location VARCHAR(100),
                      zone_type_id INTEGER REFERENCES zone_type(id),
                      deleted_at TIMESTAMP
);

-- =========================
-- SCHEDULE
-- =========================
CREATE TABLE schedule (
                          id SERIAL PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          deleted_at TIMESTAMP
);

-- =========================
-- SCHEDULE DAY
-- =========================
CREATE TABLE schedule_day (
                              id SERIAL PRIMARY KEY,
                              schedule_id INTEGER NOT NULL REFERENCES schedule(id),
                              day_index INTEGER NOT NULL CHECK (day_index BETWEEN 1 AND 7)
);

-- =========================
-- DAY TIME SLOT
-- =========================00
CREATE TABLE day_time_slot (
                               id SERIAL PRIMARY KEY,
                               schedule_day_id INTEGER NOT NULL REFERENCES schedule_day(id),
                               start_time TIME NOT NULL,
                               end_time TIME NOT NULL
);

-- =========================
-- PROFILE
-- =========================
CREATE TABLE profile (
                         id SERIAL PRIMARY KEY,
                         name VARCHAR(100) NOT NULL,
                         schedule_id INTEGER REFERENCES schedule(id),
                         deleted_at TIMESTAMP
);

-- =========================
-- PROFILE ↔ ZONE (M:N)
-- =========================
CREATE TABLE profile_zone (
                              profile_id INTEGER NOT NULL REFERENCES profile(id),
                              zone_id INTEGER NOT NULL REFERENCES zone(id),
                              PRIMARY KEY (profile_id, zone_id)
);


-- =========================
-- ACCESS CARD
-- =========================
CREATE TABLE access_card (
                             id SERIAL PRIMARY KEY,
                             uid VARCHAR(100) UNIQUE NOT NULL,
                             num VARCHAR(100),
                             status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVOKED')),
                             deleted_at TIMESTAMP WITH TIME ZONE
);

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       first_name VARCHAR(100),
                       last_name VARCHAR(100),
                       gender INTEGER,
                       address VARCHAR(255),
                       role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'RESPONSABLE', 'USER')),
                       status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
                       access_card_id INTEGER UNIQUE REFERENCES access_card(id),
                       profile_id INTEGER REFERENCES profile(id),
                       photo_id INTEGER REFERENCES photo(id),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       deleted_at TIMESTAMP
);

-- =========================
-- ZONE RESPONSIBILITY (responsable ↔ zones)
-- =========================
CREATE TABLE zone_responsibility (
                                     user_id INTEGER NOT NULL REFERENCES users(id),
                                     zone_id INTEGER NOT NULL REFERENCES zone(id),
                                     PRIMARY KEY (user_id, zone_id)
);

-- =========================
-- DOOR
-- =========================
CREATE TABLE door (
                      id SERIAL PRIMARY KEY,
                      name VARCHAR(100),
                      zone_id INTEGER NOT NULL REFERENCES zone(id),
                      deleted_at TIMESTAMP
);

-- =========================
-- DEVICE
-- =========================
CREATE TABLE device (
                        id SERIAL PRIMARY KEY,
                        serial_number VARCHAR(100) UNIQUE NOT NULL,
                        model_name VARCHAR(100),
                        type INTEGER,
                        status VARCHAR(20) NOT NULL CHECK (status IN ('ONLINE', 'OFFLINE')),
                        ip VARCHAR(45),
                        port INTEGER,
                        last_seen_at TIMESTAMP,
                        door_id INTEGER NOT NULL REFERENCES door(id),
                        deleted_at TIMESTAMP
);

-- =========================
-- ACCESS LOG
-- =========================
CREATE TABLE access_log (
                            id SERIAL PRIMARY KEY,
                            card_uid VARCHAR(100),
                            device_id INTEGER REFERENCES device(id),
                            zone_id INTEGER REFERENCES zone(id),
                            decision VARCHAR(20) CHECK (decision IN ('AUTHORIZED', 'DENIED')),
                            reason VARCHAR(100),
                            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ADMIN AUDIT LOG
-- =========================
CREATE TABLE admin_audit_log (
                                 id SERIAL PRIMARY KEY,
                                 admin_id INTEGER REFERENCES users(id),
                                 action_type VARCHAR(100),
                                 target_entity VARCHAR(100),
                                 target_id INTEGER,
                                 ip_source INET,
                                 timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_access_log_timestamp ON access_log(timestamp);
CREATE INDEX idx_access_log_zone_id ON access_log(zone_id);
CREATE INDEX idx_access_log_device_id ON access_log(device_id);
CREATE INDEX idx_access_log_card_uid ON access_log(card_uid);
CREATE INDEX idx_device_door_id ON device(door_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_access_card_uid ON access_card(uid);
CREATE INDEX idx_zone_deleted_at ON zone(deleted_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_access_card_deleted_at ON access_card(deleted_at);
CREATE INDEX idx_door_deleted_at ON door(deleted_at);
CREATE INDEX idx_device_deleted_at ON device(deleted_at);
CREATE INDEX idx_profile_deleted_at ON profile(deleted_at);
CREATE INDEX idx_schedule_deleted_at ON schedule(deleted_at);

-- Seed zone types (spec levels 0-5)
INSERT INTO zone_type (name, security_level) VALUES
                                                 ('White', 0),
                                                 ('Green', 1),
                                                 ('Blue', 2),
                                                 ('Orange', 3),
                                                 ('Red', 4),
                                                 ('Black', 5);
