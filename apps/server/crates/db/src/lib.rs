use diesel::prelude::*;
use diesel_async::pooled_connection::deadpool::Pool;
use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use diesel_async::{AsyncPgConnection, RunQueryDsl};
use dotenvy::dotenv;
use rand::Rng;
use std::env;

use self::models::{NewPackage, NewPackageData, Package, PackageData};

pub mod models;
pub mod schema;

pub type DbPool = Pool<AsyncPgConnection>;

pub fn establish_pool() -> DbPool {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let manager = AsyncDieselConnectionManager::<AsyncPgConnection>::new(&database_url);

    Pool::builder(manager)
        .build()
        .expect("Failed to create DB pool")
}

fn generate_public_id() -> String {
    rand::rng()
        .sample_iter(&rand::distr::Alphanumeric)
        .take(6)
        .map(char::from)
        .collect()
}

pub async fn create_package(
    conn: &mut AsyncPgConnection,
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
        .await
}

pub async fn mark_running(conn: &mut AsyncPgConnection, package_id: i32) -> QueryResult<usize> {
    use diesel::dsl::now;
    use schema::packages::dsl::*;

    diesel::update(
        packages
            .filter(id.eq(package_id))
            .filter(status.eq("pending")),
    )
    .set((status.eq("running"), started_at.eq(now)))
    .execute(conn)
    .await
}

pub async fn set_completed(
    conn: &mut AsyncPgConnection,
    package_id: i32,
    payload: serde_json::Value,
) -> QueryResult<usize> {
    use schema::packages::dsl::*;

    diesel::update(packages.find(package_id))
        .set((status.eq("completed"), data.eq(Some(payload))))
        .execute(conn)
        .await
}

pub async fn set_failed(
    conn: &mut AsyncPgConnection,
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
        .await
}

pub async fn get_package_data(
    conn: &mut AsyncPgConnection,
    public_id: &str,
) -> QueryResult<PackageData> {
    use schema::package_data::dsl::{package_data, public_id as public_id_col};

    package_data
        .filter(public_id_col.eq(public_id))
        .select(PackageData::as_select())
        .get_result(conn)
        .await
}

pub async fn upsert_package_data(
    conn: &mut AsyncPgConnection,
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
        .await
}
