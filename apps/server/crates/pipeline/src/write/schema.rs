//! Apply the six DDL files in name order.

const STATEMENTS: [&str; 6] = [
    include_str!("sql/01_artists.sql"),
    include_str!("sql/02_albums.sql"),
    include_str!("sql/03_tracks.sql"),
    include_str!("sql/04_interactions.sql"),
    include_str!("sql/05_package_meta.sql"),
    include_str!("sql/06_v_tracks_info.sql"),
];

pub fn apply(conn: &duckdb::Connection) -> Result<(), duckdb::Error> {
    let mut sql = String::new();
    for statement in STATEMENTS {
        sql.push_str(statement);
        sql.push('\n');
    }
    conn.execute_batch(&sql)
}
