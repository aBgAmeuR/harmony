INSERT INTO tracks (
    id, title, duration, track_position, disk_number, release_date, album_id, artists
) VALUES (
    ?, ?, ?, ?, ?, CAST(? AS DATE), ?, CAST(? AS UINTEGER[])
);
