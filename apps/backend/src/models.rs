use crate::schema::packages;
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
