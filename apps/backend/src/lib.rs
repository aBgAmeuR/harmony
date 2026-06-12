use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use dotenvy::dotenv;
use rand::Rng;
use std::env;

use self::models::{NewPackage, Package};

pub mod models;
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
