CREATE TABLE Categoria (
    categ_id SERIAL PRIMARY KEY,
    categ_name VARCHAR(30)
);

CREATE TABLE Local (
    loc_id SERIAL PRIMARY KEY,
    loc_name VARCHAR(30),
    loc_coo GEOGRAPHY(POINT, 4326),  
    loc_categ_id INT,
    FOREIGN KEY (loc_categ_id) REFERENCES Categoria(categ_id)
);

CREATE TABLE RoteiroInt (
    rotint_id SERIAL PRIMARY KEY
);

CREATE TABLE Roteiro (
    rot_id SERIAL PRIMARY KEY,
    rot_name VARCHAR(30),
    rot_rotint_id INT,
    FOREIGN KEY (rot_rotint_id) REFERENCES RoteiroInt(rotint_id)
);

CREATE TABLE RoteiroLoc (
    rotloc_id SERIAL PRIMARY KEY,
    rotloc_rate DOUBLE PRECISION,
    rotloc_rot_id INT,
    rotloc_loc_id INT,
    FOREIGN KEY (rotloc_rot_id) REFERENCES Roteiro(rot_id),
    FOREIGN KEY (rotloc_loc_id) REFERENCES Local(loc_id)
);

CREATE TABLE userWtg (
    user_id SERIAL PRIMARY KEY,
    firstName VARCHAR(30),
    lastName VARCHAR(30),
    email VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE Interesse (
    inter_id SERIAL PRIMARY KEY,
    inter_name VARCHAR(30),
    inter_user_id INT,
    inter_rotint_id INT,
    inter_categ_id INT,
    FOREIGN KEY (inter_user_id) REFERENCES User(user_id),
    FOREIGN KEY (inter_rotint_id) REFERENCES RoteiroInt(rotint_id),
    FOREIGN KEY (inter_categ_id) REFERENCES Categoria(categ_id)
);
