CREATE TABLE tracks (
    id UINTEGER PRIMARY KEY,
    title VARCHAR,
    duration INTEGER,
    track_position INTEGER,
    disk_number INTEGER,
    release_date DATE,
    album_id UINTEGER,
    artists UINTEGER[],
    CONSTRAINT fk_track_album FOREIGN KEY (album_id) REFERENCES albums(id)
);
