//! One `package_meta` row. `status` is `completed`. `steps` is the progress snapshot.

use chrono::{DateTime, Utc};
use domain::package::Package;
use duckdb::params;

use super::WriteError;

const INSERT_META: &str = include_str!("sql/insert_meta.sql");

pub fn row(
    conn: &duckdb::Connection,
    package: &Package,
    started: DateTime<Utc>,
    duration_ms: u64,
    steps: &str,
) -> Result<(), WriteError> {
    let size = i32::try_from(package.size()).map_err(|_| WriteError::Fit)?;
    let duration = i64::try_from(duration_ms).map_err(|_| WriteError::Fit)?;
    conn.execute(
        INSERT_META,
        params![
            package.id().as_str(),
            package.name(),
            size,
            stamp(package.at()),
            stamp(started),
            duration,
            steps,
        ],
    )?;
    Ok(())
}

fn stamp(value: DateTime<Utc>) -> String {
    value.format("%Y-%m-%d %H:%M:%S%.6f").to_string()
}
