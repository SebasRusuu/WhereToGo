-- migration.sql

CREATE TABLE IF NOT EXISTS userWtg (
    user_id SERIAL PRIMARY KEY,
    firstName VARCHAR(30),
    lastName VARCHAR(30),
    email VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Local (
    loc_id SERIAL PRIMARY KEY,
    loc_name VARCHAR(255),
    loc_coo GEOGRAPHY(Point, 4326)
);

CREATE TABLE IF NOT EXISTS Roteiro (
    rot_id SERIAL PRIMARY KEY,
    rot_name VARCHAR(30),
    rot_user_id INT,
    FOREIGN KEY (rot_user_id) REFERENCES userWtg(user_id)
);

CREATE TABLE IF NOT EXISTS RoteiroLoc (
    rotloc_id SERIAL PRIMARY KEY,
    rotloc_rate DOUBLE PRECISION,
    rotloc_rot_id INT,
    rotloc_loc_id INT,
    FOREIGN KEY (rotloc_rot_id) REFERENCES Roteiro(rot_id),
    FOREIGN KEY (rotloc_loc_id) REFERENCES Local(loc_id)
);
