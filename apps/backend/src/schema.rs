// @generated automatically by Diesel CLI.

diesel::table! {
    packages (id) {
        id -> Int4,
        public_id -> Text,
        file_name -> Text,
        file_size -> Int4,
        status -> Text,
        updated_at -> Timestamp,
        created_at -> Timestamp,
    }
}
