INSERT INTO package_meta (
    public_id, file_name, file_size, status, created_at, started_at, total_duration_ms, steps
) VALUES (
    ?, ?, ?, 'completed',
    CAST(? AS TIMESTAMP), CAST(? AS TIMESTAMP), ?,
    CAST(? AS JSON)
);
