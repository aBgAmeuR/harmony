CREATE TABLE interactions (
    ts TIMESTAMP,
    platform VARCHAR,
    ms_played INTEGER,
    shuffle BOOLEAN,
    skipped BOOLEAN,
    offline BOOLEAN,
    track_id UINTEGER,
    CONSTRAINT fk_interaction_track FOREIGN KEY (track_id) REFERENCES tracks(id)
);
