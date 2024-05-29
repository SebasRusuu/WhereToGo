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
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP
);

CREATE TABLE Interesse (
    inter_id SERIAL PRIMARY KEY,
    inter_name VARCHAR(30),
    inter_user_id INT,
    inter_rotint_id INT,
    inter_categ_id INT,
    FOREIGN KEY (inter_user_id) REFERENCES userWtg(user_id),
    FOREIGN KEY (inter_rotint_id) REFERENCES RoteiroInt(rotint_id),
    FOREIGN KEY (inter_categ_id) REFERENCES Categoria(categ_id)
);



-- -- Inserir dados na tabela Categoria
-- INSERT INTO Categoria (categ_name) VALUES
-- ('História'),
-- ('Natureza'),
-- ('Aventura');

-- -- Inserir dados na tabela Local
-- INSERT INTO Local (loc_name, loc_coo, loc_categ_id) VALUES
-- ('Museu Histórico', ST_GeomFromText('POINT(-23.5505 -46.6333)', 4326), 1),
-- ('Parque Nacional', ST_GeomFromText('POINT(-15.7801 -47.9292)', 4326), 2),
-- ('Trilha da Aventura', ST_GeomFromText('POINT(-22.9068 -43.1729)', 4326), 3);

-- -- Inserir dados na tabela RoteiroInt
-- INSERT INTO RoteiroInt DEFAULT VALUES;
-- INSERT INTO RoteiroInt DEFAULT VALUES;

-- -- Inserir dados na tabela Roteiro
-- INSERT INTO Roteiro (rot_name, rot_rotint_id) VALUES
-- ('Roteiro Cultural', 1),
-- ('Roteiro Ecológico', 2);

-- -- Inserir dados na tabela RoteiroLoc
-- INSERT INTO RoteiroLoc (rotloc_rate, rotloc_rot_id, rotloc_loc_id) VALUES
-- (4.5, 1, 1),
-- (4.8, 2, 2),
-- (4.2, 2, 3);

-- -- Inserir dados na tabela userWtg
-- INSERT INTO userWtg (firstName, lastName, email, password_hash) VALUES
-- ('João', 'Silva', 'joao.silva@example.com', 'hash123'),
-- ('Maria', 'Oliveira', 'maria.oliveira@example.com', 'hash456');

-- -- Inserir dados na tabela Interesse
-- INSERT INTO Interesse (inter_name, inter_user_id, inter_rotint_id, inter_categ_id) VALUES
-- ('História Antiga', 1, 1, 1),
-- ('Ecoturismo', 2, 2, 2);

