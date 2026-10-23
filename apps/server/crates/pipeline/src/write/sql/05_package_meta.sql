CREATE TABLE package_meta (
    public_id VARCHAR,
    file_name VARCHAR,
    file_size INTEGER,
    status VARCHAR,
    created_at TIMESTAMP,
    started_at TIMESTAMP,
    total_duration_ms BIGINT,
    steps JSON
);
