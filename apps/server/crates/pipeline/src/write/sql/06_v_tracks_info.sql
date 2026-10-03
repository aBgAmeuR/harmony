CREATE VIEW v_tracks_info AS
SELECT
    t.id AS track_id,
    t.title AS track_name,
    t.artists AS track_artist_ids,
    t.album_id AS album_id,
    al.title AS album_title,
    (
        SELECT string_agg(a.name, ', ' ORDER BY u.ordinality)
        FROM unnest(t.artists) WITH ORDINALITY AS u(artist_id, ordinality)
        JOIN artists a ON a.id = u.artist_id
    ) AS track_artists_description,
    al.artists AS album_artist_ids,
    (
        SELECT string_agg(a.name, ', ' ORDER BY u.ordinality)
        FROM unnest(al.artists) WITH ORDINALITY AS u(artist_id, ordinality)
        JOIN artists a ON a.id = u.artist_id
    ) AS album_artists_description,
    al.image AS image,
    al.image_uri AS image_uri
FROM tracks t
LEFT JOIN albums al ON t.album_id = al.id;
