use crate::schema::{package_data, packages};
use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = packages)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Package {
    pub id: i32,
    pub public_id: String,
    pub file_name: String,
    pub file_size: i32,
    pub status: String,
    pub started_at: Option<chrono::NaiveDateTime>,
    pub error_stage: Option<String>,
    pub error_message: Option<String>,
    pub data: Option<serde_json::Value>,
    pub updated_at: chrono::NaiveDateTime,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = packages)]
pub struct NewPackage<'a> {
    pub public_id: String,
    pub file_name: &'a str,
    pub file_size: i32,
    pub status: &'a str,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = package_data)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PackageData {
    pub public_id: String,
    pub value: serde_json::Value,
}

#[derive(Insertable)]
#[diesel(table_name = package_data)]
pub struct NewPackageData<'a> {
    pub public_id: &'a str,
    pub value: serde_json::Value,
}
