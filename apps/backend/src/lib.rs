use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use dotenvy::dotenv;
use rand::Rng;
use std::env;

use self::models::{NewPackage, NewPackageData, Package};

pub mod models;
pub mod pipeline;
pub mod schema;

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

pub fn establish_pool() -> DbPool {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let manager = ConnectionManager::<PgConnection>::new(database_url);

    Pool::builder()
        .max_size(5)
        .build(manager)
        .expect("Failed to create DB pool")
}

fn generate_public_id() -> String {
    rand::rng()
        .sample_iter(&rand::distr::Alphanumeric)
        .take(6)
        .map(char::from)
        .collect()
}

pub fn create_package(
    conn: &mut PgConnection,
    file_name: &str,
    file_size: i32,
) -> QueryResult<Package> {
    use schema::packages;

    let new_package = NewPackage {
        public_id: generate_public_id(),
        file_name,
        file_size,
        status: "pending",
    };

    diesel::insert_into(packages::table)
        .values(&new_package)
        .returning(Package::as_returning())
        .get_result(conn)
}

pub fn mark_running(conn: &mut PgConnection, package_id: i32) -> QueryResult<usize> {
    use diesel::dsl::now;
    use schema::packages::dsl::*;

    diesel::update(
        packages
            .filter(id.eq(package_id))
            .filter(status.eq("pending")),
    )
        .set((status.eq("running"), started_at.eq(now)))
        .execute(conn)
}

pub fn set_completed(
    conn: &mut PgConnection,
    package_id: i32,
    payload: serde_json::Value,
) -> QueryResult<usize> {
    use schema::packages::dsl::*;

    diesel::update(packages.find(package_id))
        .set((status.eq("completed"), data.eq(Some(payload))))
        .execute(conn)
}

pub fn set_failed(
    conn: &mut PgConnection,
    package_id: i32,
    stage: &str,
    message: &str,
) -> QueryResult<usize> {
    use schema::packages::dsl::*;

    diesel::update(packages.find(package_id))
        .set((
            status.eq("failed"),
            error_stage.eq(Some(stage)),
            error_message.eq(Some(message)),
        ))
        .execute(conn)
}

pub fn upsert_package_data(
    conn: &mut PgConnection,
    public_id: &str,
    payload: serde_json::Value,
) -> QueryResult<usize> {
    use diesel::pg::upsert::excluded;
    use schema::package_data;

    let row = NewPackageData {
        public_id,
        value: payload,
    };

    diesel::insert_into(package_data::table)
        .values(&row)
        .on_conflict(package_data::public_id)
        .do_update()
        .set(package_data::value.eq(excluded(package_data::value)))
        .execute(conn)
}
