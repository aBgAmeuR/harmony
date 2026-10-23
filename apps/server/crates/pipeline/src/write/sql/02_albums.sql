CREATE TABLE albums (
    id UINTEGER PRIMARY KEY,
    title VARCHAR,
    image VARCHAR,
    image_uri VARCHAR,
    release_date DATE,
    genres VARCHAR[],
    nb_tracks INTEGER,
    duration INTEGER,
    album_type VARCHAR,
    artists UINTEGER[]
);
