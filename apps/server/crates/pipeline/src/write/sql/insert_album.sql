INSERT INTO albums (
    id, title, image, image_uri, release_date, genres, nb_tracks, duration, album_type, artists
) VALUES (
    ?, ?, ?, ?, CAST(? AS DATE), CAST(? AS VARCHAR[]), ?, ?, ?, CAST(? AS UINTEGER[])
);
